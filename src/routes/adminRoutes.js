const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { logAudit } = require('../services/pointService');

function authenticateSuperadmin(req, res, next) {
  const userId = req.headers['x-user-id'] || 'superadmin';
  const user = db.prepare(`SELECT * FROM staff_user WHERE id = ? AND active = 1`).get(userId);
  if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });

  const roles = JSON.parse(user.roles);
  if (!roles.includes('superadmin')) {
    return res.status(403).json({ error: 'Faqat Superadmin roli uchun ruxsat berilgan' });
  }

  req.staffUser = { ...user, roles };
  next();
}

/**
 * GET /api/admin/catalog
 * S-01: Katalog bandlari va kategoriyalar
 */
router.get('/catalog', authenticateSuperadmin, (req, res) => {
  const categories = db.prepare(`SELECT * FROM catalog_category ORDER BY sort ASC`).all();
  const items = db.prepare(`SELECT * FROM catalog_item WHERE archived = 0 ORDER BY category_id, id ASC`).all();
  const scale = db.prepare(`SELECT * FROM scale_matrix`).all();
  res.json({ categories, items, scale });
});

/**
 * PUT /api/admin/catalog/item/:id
 * S-01, AT-21: Katalog bandini o'zgartirish va versiyalash
 */
router.put('/catalog/item/:id', authenticateSuperadmin, (req, res) => {
  try {
    const { name, base_points, approver_role, evidence_hint, limit_rule } = req.body;
    const currentItem = db.prepare(`
      SELECT * FROM catalog_item WHERE id = ? AND archived = 0 ORDER BY version_from DESC LIMIT 1
    `).get(req.params.id);

    if (!currentItem) return res.status(404).json({ error: 'Katalog bandi topilmadi' });

    const newVersion = (currentItem.version_from || 1) + 1;
    const now = new Date().toISOString();

    const tx = db.transaction(() => {
      // 1. Eski bandni version_to bilan yopish
      db.prepare(`UPDATE catalog_item SET version_to = ? WHERE id = ? AND version_from = ?`).run(
        newVersion - 1,
        currentItem.id,
        currentItem.version_from
      );

      // 2. Yangi versiyadagi bandni kiritish
      db.prepare(`
        INSERT INTO catalog_item (
          id, category_id, name, base_points, is_scale, is_auto, approver_role,
          evidence_hint, limit_rule, version_from, version_to, archived
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0)
      `).run(
        currentItem.id,
        currentItem.category_id,
        name !== undefined ? name : currentItem.name,
        base_points !== undefined ? Number(base_points) : currentItem.base_points,
        currentItem.is_scale,
        currentItem.is_auto,
        approver_role !== undefined ? approver_role : currentItem.approver_role,
        evidence_hint !== undefined ? evidence_hint : currentItem.evidence_hint,
        limit_rule !== undefined ? JSON.stringify(limit_rule) : currentItem.limit_rule,
        newVersion
      );

      logAudit({
        actor_id: req.staffUser.id,
        actor_role: 'superadmin',
        action: 'UPDATE_CATALOG_ITEM',
        object_type: 'catalog_item',
        object_id: currentItem.id,
        before: { base_points: currentItem.base_points, version: currentItem.version_from },
        after: { base_points, version: newVersion },
        ip: req.ip || '127.0.0.1'
      });
    });

    tx();
    res.json({ success: true, new_version: newVersion, message: `Band yangilandi (v${newVersion})` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/admin/settings
 * S-02: Tizim sozlamalari
 */
router.get('/settings', authenticateSuperadmin, (req, res) => {
  const settings = db.prepare(`SELECT * FROM setting`).all();
  const map = {};
  for (const s of settings) {
    try { map[s.key] = JSON.parse(s.value); } catch (e) { map[s.key] = s.value; }
  }
  res.json({ settings: map });
});

/**
 * PUT /api/admin/settings
 * S-02: Sozlamalarni yangilash
 */
router.put('/settings', authenticateSuperadmin, (req, res) => {
  try {
    const updates = req.body;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO setting (key, value, updated_by, updated_at)
      VALUES (?, ?, ?, ?)
    `);

    const tx = db.transaction(() => {
      for (const [key, val] of Object.entries(updates)) {
        stmt.run(key, JSON.stringify(val), req.staffUser.id, now);
      }
      logAudit({
        actor_id: req.staffUser.id,
        actor_role: 'superadmin',
        action: 'UPDATE_SETTINGS',
        object_type: 'setting',
        object_id: 'all',
        after: updates,
        ip: req.ip || '127.0.0.1'
      });
    });

    tx();
    res.json({ success: true, message: 'Sozlamalar saqlandi' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/admin/users
 * S-03: Xodimlar va rollar
 */
router.get('/users', authenticateSuperadmin, (req, res) => {
  const users = db.prepare(`SELECT id, full_name, email, roles, twofa_enabled, active, created_at FROM staff_user`).all();
  const parsed = users.map(u => ({ ...u, roles: JSON.parse(u.roles) }));
  res.json({ users: parsed });
});

/**
 * GET /api/admin/audit
 * S-04: Audit jurnali (o'zgarmas tarix)
 */
router.get('/audit', authenticateSuperadmin, (req, res) => {
  const { action, actor_id, limit = 50, offset = 0 } = req.query;

  let where = [];
  let params = [];

  if (action) { where.push('action = ?'); params.push(action); }
  if (actor_id) { where.push('actor_id = ?'); params.push(actor_id); }

  const whereStr = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const logs = db.prepare(`
    SELECT * FROM audit_log
    ${whereStr}
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), Number(offset));

  const total = db.prepare(`SELECT COUNT(*) as c FROM audit_log ${whereStr}`).get(...params).c;

  res.json({ logs, total });
});

/**
 * GET /api/admin/integrations
 * S-05: Integratsiyalar holati
 */
router.get('/integrations', authenticateSuperadmin, (req, res) => {
  const lastImport = db.prepare(`SELECT * FROM import_batch ORDER BY at DESC LIMIT 1`).get();
  const totalStudents = db.prepare(`SELECT COUNT(*) as c FROM student`).get().c;
  const activeStudents = db.prepare(`SELECT COUNT(*) as c FROM student WHERE status = 'active'`).get().c;
  const telegramLinked = db.prepare(`SELECT COUNT(*) as c FROM student WHERE telegram_user_id IS NOT NULL`).get().c;

  res.json({
    registrator_sync: {
      status: 'active',
      last_batch: lastImport,
      total_students: totalStudents,
      active_students: activeStudents
    },
    telegram_bot: {
      status: 'active',
      bot_username: 'akhu_talabalar_bot',
      linked_students: telegramLinked,
      linked_ratio: totalStudents > 0 ? Math.round((telegramLinked / totalStudents) * 100) : 0
    }
  });
});

module.exports = router;
