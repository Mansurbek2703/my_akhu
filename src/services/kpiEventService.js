const https = require('https');
const http = require('http');
const crypto = require('crypto');
const { db } = require('../db/database');
const config = require('../config');

const KPI_CONFIG = {
  apiUrl: (config.kpi && config.kpi.apiUrl) || process.env.KPI_API_URL || 'https://kpi.akhu.uz/api/v1',
  apiToken: (config.kpi && config.kpi.apiToken) || process.env.KPI_API_TOKEN || 'akhu_sfiPn4O6Fog0GIH662e7JHFrt3-mbpXdo5E-kvaH95c',
  syncIntervalMs: ((config.kpi && config.kpi.syncIntervalSeconds) || 60) * 1000
};

/**
 * KPI API dan GET so'rov bajarish yordamchisi
 */
function fetchKpiEvents() {
  return new Promise((resolve, reject) => {
    const urlStr = `${KPI_CONFIG.apiUrl.replace(/\/+$/, '')}/events/`;
    const parsed = new URL(urlStr);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.request(
      urlStr,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${KPI_CONFIG.apiToken}`,
          'Accept': 'application/json',
          'User-Agent': 'AKHU-Rating-Sync/1.0'
        },
        timeout: 10000
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error(`KPI API xatolik: HTTP ${res.statusCode} - ${body.slice(0, 200)}`));
          }
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch (e) {
            reject(new Error(`KPI javobi JSON emas: ${e.message}`));
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('KPI API so\'rov vaqti tugadi (timeout 10s)'));
    });
    req.end();
  });
}

/**
 * KPI tizimidan tadbirlarni olib, lokal bazaga sinxronlash
 */
async function syncEventsFromKpi() {
  try {
    const rawEvents = await fetchKpiEvents();
    const eventList = Array.isArray(rawEvents) ? rawEvents : (rawEvents.results || rawEvents.events || []);

    if (!Array.isArray(eventList)) {
      console.warn('[KPI-Sync] Kutilmagan format: events ro\'yxat emas');
      return { success: false, error: 'Format xato' };
    }

    let insertedCount = 0;
    let updatedCount = 0;
    const nowIso = new Date().toISOString();

    for (const ev of eventList) {
      if (!ev.id || !ev.title) continue;

      const eventId = String(ev.id);
      const title = String(ev.title).trim();
      const startsAt = ev.start_time || ev.starts_at || nowIso;
      const endsAt = ev.end_time || ev.ends_at || startsAt;

      // Joy nomi (xona va bino)
      const placeParts = [];
      if (ev.room && ev.room.name) placeParts.push(ev.room.name);
      if (ev.room && ev.room.building) placeParts.push(ev.room.building);
      const place = placeParts.length > 0 ? placeParts.join(', ') : (ev.place || 'AKHU');

      // Tashkilotchi
      const organizerUnit = (ev.department && ev.department.name) ||
        (ev.organizer && ev.organizer.full_name) ||
        'Axborot texnologiyalari markazi';

      const photoUrl = ev.poster_url || ev.photo_url || ev.image_url || null;
      const capacity = ev.expected_participants ? Number(ev.expected_participants) : null;

      // Holatni xaritalash
      let localStatus = 'published';
      const kpiStatus = (ev.status || '').toUpperCase();
      if (kpiStatus === 'APPROVED') {
        localStatus = 'published';
      } else if (kpiStatus === 'COMPLETED') {
        localStatus = 'closed';
      } else if (kpiStatus === 'CANCELLED') {
        localStatus = 'cancelled';
      } else if (kpiStatus === 'PENDING' || kpiStatus === 'DRAFT') {
        localStatus = 'draft';
      }

      // Ball (universitet tadbirlari uchun 5 ball standart)
      const points = 5;
      const createdBy = (ev.organizer && ev.organizer.full_name) ? `kpi:${ev.organizer.full_name}` : 'kpi_system';

      // Bazada borligini tekshiramiz
      const existing = db.prepare(`SELECT * FROM event WHERE id = ?`).get(eventId);

      if (existing) {
        // Yangilaymiz (mavjud qr_secret va boshqa muhim sozlamalar saqlanadi)
        db.prepare(`
          UPDATE event SET
            title = ?,
            starts_at = ?,
            ends_at = ?,
            place = ?,
            organizer_unit = ?,
            photo_url = COALESCE(?, photo_url),
            image_url = COALESCE(?, image_url),
            capacity = COALESCE(?, capacity),
            status = ?,
            qr_refresh_seconds = 60,
            attendance_open_minutes_before = 0
          WHERE id = ?
        `).run(
          title,
          startsAt,
          endsAt,
          place,
          organizerUnit,
          photoUrl,
          photoUrl,
          capacity,
          localStatus,
          eventId
        );
        updatedCount++;
      } else {
        // Yangi qo'shamiz
        const qrSecret = 'sec_' + crypto.randomBytes(12).toString('hex');
        db.prepare(`
          INSERT INTO event (
            id, title, starts_at, ends_at, place, photo_url, image_url, organizer_unit,
            category_id, level, points, capacity, requires_registration, status,
            qr_secret, qr_refresh_seconds, attendance_open_minutes_before, created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '1', 'universitet', ?, ?, 1, ?, ?, 60, 0, ?, ?)
        `).run(
          eventId,
          title,
          startsAt,
          endsAt,
          place,
          photoUrl,
          photoUrl,
          organizerUnit,
          points,
          capacity,
          localStatus,
          qrSecret,
          createdBy,
          nowIso
        );
        insertedCount++;
      }
    }

    // Sinxronlash natijasini setting jadvaliga yozamiz
    try {
      db.prepare(`
        INSERT INTO setting (key, value) VALUES ('last_kpi_events_sync_at', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(nowIso);
    } catch (e) {}

    console.log(`[KPI-Sync] Sinxronlash yakunlandi: ${eventList.length} ta tadbir olindi (Yangi: ${insertedCount}, Yangilandi: ${updatedCount})`);
    return {
      success: true,
      total_from_kpi: eventList.length,
      inserted: insertedCount,
      updated: updatedCount,
      synced_at: nowIso
    };
  } catch (err) {
    console.error('[KPI-Sync] Xatolik yuz berdi:', err.message);
    return { success: false, error: err.message };
  }
}

let syncIntervalHandle = null;

function startKpiEventSyncCron() {
  if (syncIntervalHandle) return;

  // Dastlabki ishga tushirish (darhol)
  syncEventsFromKpi().catch((err) => {
    console.error('[KPI-Sync] Dastlabki sinxronlashda xatolik:', err.message);
  });

  // Har 60 sekundda (1 daqiqa) takrorlash
  syncIntervalHandle = setInterval(() => {
    syncEventsFromKpi().catch((err) => {
      console.error('[KPI-Sync] Interval sinxronlashda xatolik:', err.message);
    });
  }, KPI_CONFIG.syncIntervalMs);

  console.log(`[KPI-Sync] Fon xizmati yoqildi: har ${KPI_CONFIG.syncIntervalMs / 1000} soniyada kpi.akhu.uz bilan sinxronlanadi`);
}

function stopKpiEventSyncCron() {
  if (syncIntervalHandle) {
    clearInterval(syncIntervalHandle);
    syncIntervalHandle = null;
  }
}

module.exports = {
  fetchKpiEvents,
  syncEventsFromKpi,
  startKpiEventSyncCron,
  stopKpiEventSyncCron,
  KPI_CONFIG
};
