/**
 * searchHelper.js
 * Universal, intelligent student search helper with case-insensitivity (PostgreSQL ILIKE),
 * multi-token matching, full-name concatenation, and Uzbek apostrophe tolerance.
 */

function buildStudentSearch(search, alias = 'st') {
  if (!search || typeof search !== 'string' || !search.trim()) {
    return { clauses: [], params: [] };
  }

  const clean = search.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const clauses = [];
  const params = [];

  for (const word of words) {
    const p1 = `%${word}%`;
    const pApos = `%${word.replace(/['’‘`ʻ]/g, '%')}%`;
    const pFuzzy = `%${word.replace(/([ogOG])/g, '$1%')}%`;

    clauses.push(`(
      ${alias}.first_name ILIKE ? OR ${alias}.last_name ILIKE ? OR
      ${alias}.first_name ILIKE ? OR ${alias}.last_name ILIKE ? OR
      ${alias}.first_name ILIKE ? OR ${alias}.last_name ILIKE ? OR
      (${alias}.first_name || ' ' || COALESCE(${alias}.last_name, '')) ILIKE ? OR
      (COALESCE(${alias}.last_name, '') || ' ' || ${alias}.first_name) ILIKE ? OR
      ${alias}.external_id ILIKE ? OR
      ${alias}.group_code ILIKE ? OR
      ${alias}.phone ILIKE ?
    )`);
    params.push(p1, p1, pApos, pApos, pFuzzy, pFuzzy, p1, p1, p1, p1, p1);
  }

  return { clauses, params };
}

module.exports = { buildStudentSearch };
