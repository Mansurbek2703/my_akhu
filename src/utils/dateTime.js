/**
 * O'zbekiston (Asia/Tashkent, UTC+5) vaqt va sana formatlagichlari
 * Standart: kun.oy.yil hh:mm (24-soatlik rejim)
 * Masalan: 05.11.2026 11:00 (abetdan keyin 14:30)
 */

function formatUzDateTime(dateVal, includeSeconds = false) {
  if (!dateVal) return '-';
  const d = (dateVal instanceof Date) ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: false
  }).formatToParts(d);

  const get = (type) => (parts.find(p => p.type === type) || {}).value || '';
  const sec = includeSeconds ? `:${get('second')}` : '';
  return `${get('day')}.${get('month')}.${get('year')} ${get('hour')}:${get('minute')}${sec}`;
}

function formatUzDate(dateVal) {
  if (!dateVal) return '-';
  const d = (dateVal instanceof Date) ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(d);

  const get = (type) => (parts.find(p => p.type === type) || {}).value || '';
  return `${get('day')}.${get('month')}.${get('year')}`;
}

function formatUzTime(dateVal, includeSeconds = false) {
  if (!dateVal) return '-';
  const d = (dateVal instanceof Date) ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: false
  }).formatToParts(d);

  const get = (type) => (parts.find(p => p.type === type) || {}).value || '';
  const sec = includeSeconds ? `:${get('second')}` : '';
  return `${get('hour')}:${get('minute')}${sec}`;
}

function formatUzRange(startsAt, endsAt) {
  if (!startsAt) return '-';
  const sDate = formatUzDate(startsAt);
  const sTime = formatUzTime(startsAt);
  if (!endsAt) return `${sDate} ${sTime}`;

  const eDate = formatUzDate(endsAt);
  const eTime = formatUzTime(endsAt);

  if (sDate === eDate) {
    return `${sDate} ${sTime} — ${eTime}`;
  }
  return `${sDate} ${sTime} — ${eDate} ${eTime}`;
}

module.exports = {
  formatUzDateTime,
  formatUzDate,
  formatUzTime,
  formatUzRange
};

