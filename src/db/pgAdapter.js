// pgAdapter.js - Drop-in PostgreSQL adapter providing better-sqlite3 compatible sync API
const Client = require('pg-native');

function convertPlaceholders(sql) {
  let paramIndex = 1;
  let inString = false;
  let stringChar = '';
  let result = '';

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (inString) {
      result += ch;
      if (ch === stringChar) {
        if (i + 1 < sql.length && sql[i + 1] === stringChar) {
          result += sql[i + 1];
          i++;
        } else {
          inString = false;
        }
      }
    } else {
      if (ch === "'" || ch === '"') {
        inString = true;
        stringChar = ch;
        result += ch;
      } else if (ch === '?') {
        result += '$' + (paramIndex++);
      } else {
        result += ch;
      }
    }
  }
  return result;
}

function translateSql(rawSql) {
  let sql = rawSql.trim();

  // Replace datetime('now')
  sql = sql.replace(/datetime\s*\(\s*'now'\s*\)/gi, "TO_CHAR(NOW(), 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')");

  // Translate SQLite LIKE to PostgreSQL ILIKE for case-insensitive compatibility
  sql = sql.replace(/\bLIKE\b/g, 'ILIKE');

  // Handle INSERT OR IGNORE
  if (/INSERT\s+OR\s+IGNORE\s+INTO/i.test(sql)) {
    sql = sql.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
    if (!/ON\s+CONFLICT/i.test(sql)) {
      sql += ' ON CONFLICT DO NOTHING';
    }
  }

  // Handle INSERT OR REPLACE INTO
  if (/INSERT\s+OR\s+REPLACE\s+INTO/i.test(sql)) {
    const m = sql.match(/INSERT\s+OR\s+REPLACE\s+INTO\s+(\w+)/i);
    const table = m ? m[1].toLowerCase() : '';

    sql = sql.replace(/INSERT\s+OR\s+REPLACE\s+INTO/gi, 'INSERT INTO');

    if (!/ON\s+CONFLICT/i.test(sql)) {
      if (table === 'student_score') {
        sql += ` ON CONFLICT (student_id) DO UPDATE SET 
          total = EXCLUDED.total, 
          season = EXCLUDED.season, 
          week_cur = EXCLUDED.week_cur, 
          week_prev = EXCLUDED.week_prev, 
          by_category = EXCLUDED.by_category, 
          events_count = EXCLUDED.events_count, 
          last_point_at = EXCLUDED.last_point_at, 
          rank_cohort = EXCLUDED.rank_cohort, 
          is_passive = EXCLUDED.is_passive, 
          updated_at = EXCLUDED.updated_at`;
      } else if (table === 'tutor_group') {
        sql += ` ON CONFLICT (tutor_id, group_code) DO NOTHING`;
      } else if (table === 'setting') {
        sql += ` ON CONFLICT (key) DO UPDATE SET 
          value = EXCLUDED.value, 
          updated_by = EXCLUDED.updated_by, 
          updated_at = EXCLUDED.updated_at`;
      } else if (table === 'weekly_stars') {
        sql += ` ON CONFLICT (week_start) DO UPDATE SET 
          payload = EXCLUDED.payload, 
          published_at = EXCLUDED.published_at, 
          telegram_message_id = EXCLUDED.telegram_message_id`;
      } else if (table === 'catalog_category') {
        sql += ` ON CONFLICT (id) DO UPDATE SET 
          name = EXCLUDED.name, 
          approver_role = EXCLUDED.approver_role, 
          color = EXCLUDED.color, 
          sort = EXCLUDED.sort`;
      } else if (table === 'catalog_item') {
        sql += ` ON CONFLICT (id, version_from) DO UPDATE SET 
          category_id = EXCLUDED.category_id, 
          name = EXCLUDED.name, 
          base_points = EXCLUDED.base_points, 
          is_scale = EXCLUDED.is_scale, 
          is_auto = EXCLUDED.is_auto, 
          approver_role = EXCLUDED.approver_role, 
          evidence_hint = EXCLUDED.evidence_hint, 
          limit_rule = EXCLUDED.limit_rule, 
          version_to = EXCLUDED.version_to, 
          archived = EXCLUDED.archived`;
      } else if (table === 'scale_matrix') {
        sql += ` ON CONFLICT (level, role) DO UPDATE SET 
          points = EXCLUDED.points`;
      } else if (table === 'season') {
        sql += ` ON CONFLICT (id) DO UPDATE SET 
          name = EXCLUDED.name, 
          starts_on = EXCLUDED.starts_on, 
          ends_on = EXCLUDED.ends_on, 
          is_current = EXCLUDED.is_current`;
      } else if (table === 'staff_user') {
        sql += ` ON CONFLICT (id) DO UPDATE SET 
          full_name = EXCLUDED.full_name, 
          email = EXCLUDED.email, 
          sso_subject = EXCLUDED.sso_subject, 
          roles = EXCLUDED.roles, 
          twofa_enabled = EXCLUDED.twofa_enabled, 
          active = EXCLUDED.active, 
          password_hash = EXCLUDED.password_hash, 
          telegram_user_id = EXCLUDED.telegram_user_id, 
          created_at = EXCLUDED.created_at`;
      }
    }
  }

  // Convert ? to $1, $2...
  return convertPlaceholders(sql);
}

function normalizeParams(args) {
  let params = [];
  if (args.length === 1 && Array.isArray(args[0])) {
    params = args[0];
  } else {
    params = Array.from(args);
  }

  return params.map(p => {
    if (p === undefined) return null;
    return p;
  });
}

class PgDatabase {
  constructor(connString) {
    this.connString = connString;
    this.client = new Client();
    this.client.connectSync(this.connString);
  }

  _ensureConnected() {
    try {
      this.client.querySync('SELECT 1');
    } catch (e) {
      try { this.client.end(); } catch (_) {}
      this.client = new Client();
      this.client.connectSync(this.connString);
    }
  }

  prepare(rawSql) {
    const translatedSql = translateSql(rawSql);
    const self = this;

    return {
      get(...args) {
        self._ensureConnected();
        const params = normalizeParams(args);
        const rows = self.client.querySync(translatedSql, params);
        return rows && rows.length > 0 ? rows[0] : undefined;
      },
      all(...args) {
        self._ensureConnected();
        const params = normalizeParams(args);
        const rows = self.client.querySync(translatedSql, params);
        return rows || [];
      },
      run(...args) {
        self._ensureConnected();
        const params = normalizeParams(args);
        self.client.querySync(translatedSql, params);
        const changes = Number(self.client.pq.cmdTuples()) || 0;
        return { changes };
      }
    };
  }

  transaction(fn) {
    const self = this;
    return (...args) => {
      self._ensureConnected();
      self.client.querySync('BEGIN');
      try {
        const result = fn(...args);
        self.client.querySync('COMMIT');
        return result;
      } catch (err) {
        try { self.client.querySync('ROLLBACK'); } catch (_) {}
        throw err;
      }
    };
  }

  exec(rawSql) {
    this._ensureConnected();
    // Split multiple statements if needed or execute directly
    const statements = rawSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      const translated = translateSql(stmt);
      this.client.querySync(translated);
    }
  }

  pragma(str) {
    this._ensureConnected();
    const trimmed = str.trim();
    // table_info(table)
    const tableInfoMatch = trimmed.match(/^table_info\((.+)\)$/i);
    if (tableInfoMatch) {
      const tableName = tableInfoMatch[1].replace(/['"`]/g, '').trim();
      const rows = this.client.querySync(
        `SELECT column_name as name, data_type as type 
         FROM information_schema.columns 
         WHERE table_name = $1`,
        [tableName]
      );
      return rows || [];
    }
    // journal_mode, foreign_keys -> no-ops in PostgreSQL
    return [];
  }

  close() {
    try {
      this.client.end();
    } catch (_) {}
  }
}

module.exports = {
  PgDatabase,
  translateSql
};
