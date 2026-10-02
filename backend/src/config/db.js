import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isPostgres = !!process.env.DATABASE_URL;
let sqliteDb = null;
let pgPool = null;

if (isPostgres) {
  console.log('🐘 Connecting to PostgreSQL database (Cloud/Render)...');
  const { Pool } = pg;
  
  // Configure SSL for cloud PostgreSQL (Render, Neon, Supabase, Railway)
  const isCloudHost = !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1');

  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isCloudHost ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
  });

  pgPool.on('error', (err) => {
    console.error('Unexpected PostgreSQL client error:', err);
  });
} else {
  console.log('📦 Using local SQLite database (catalog.db)...');
  const dbPath = path.resolve(__dirname, '../../catalog.db');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('foreign_keys = ON');
  sqliteDb.pragma('journal_mode = WAL');
}

// Convert '?' placeholders to '$1, $2, $3' for PostgreSQL
function convertPlaceholders(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

const db = {
  isPostgres,

  async query(sql, params = []) {
    if (isPostgres) {
      const pgSql = convertPlaceholders(sql);
      const res = await pgPool.query(pgSql, params);
      return res;
    } else {
      const stmt = sqliteDb.prepare(sql);
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const rows = stmt.all(...params);
        return { rows, rowCount: rows.length };
      } else {
        const info = stmt.run(...params);
        return { rows: [], rowCount: info.changes, lastInsertRowid: info.lastInsertRowid };
      }
    }
  },

  async get(sql, params = []) {
    if (isPostgres) {
      const pgSql = convertPlaceholders(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows[0] || null;
    } else {
      const stmt = sqliteDb.prepare(sql);
      const row = stmt.get(...params);
      return row || null;
    }
  },

  async all(sql, params = []) {
    if (isPostgres) {
      const pgSql = convertPlaceholders(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows;
    } else {
      const stmt = sqliteDb.prepare(sql);
      return stmt.all(...params);
    }
  },

  async run(sql, params = []) {
    if (isPostgres) {
      let pgSql = sql;
      const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
      if (isInsert && !sql.toUpperCase().includes('RETURNING')) {
        pgSql = `${sql} RETURNING *`;
      }
      pgSql = convertPlaceholders(pgSql);
      const res = await pgPool.query(pgSql, params);
      const insertedId = res.rows && res.rows[0] ? (res.rows[0].id ?? null) : null;
      return {
        rowCount: res.rowCount,
        changes: res.rowCount,
        lastInsertRowid: insertedId,
      };
    } else {
      const stmt = sqliteDb.prepare(sql);
      const info = stmt.run(...params);
      return {
        rowCount: info.changes,
        changes: info.changes,
        lastInsertRowid: info.lastInsertRowid,
      };
    }
  },

  async exec(sql) {
    if (isPostgres) {
      return await pgPool.query(sql);
    } else {
      return sqliteDb.exec(sql);
    }
  }
};

export default db;
