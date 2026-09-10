const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'learnmate.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    last_login  TEXT
  );

  CREATE TABLE IF NOT EXISTS roadmaps (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest    TEXT    NOT NULL,
    skill_level TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    data        TEXT    NOT NULL,   -- full roadmap JSON
    total_xp    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS module_progress (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    roadmap_id    INTEGER NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    module_id     INTEGER NOT NULL,
    completed     INTEGER NOT NULL DEFAULT 0,
    completed_at  TEXT,
    UNIQUE(roadmap_id, module_id)
  );

  CREATE TABLE IF NOT EXISTS quiz_results (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roadmap_id  INTEGER,
    module_id   INTEGER,
    topic       TEXT    NOT NULL,
    score       INTEGER NOT NULL,
    total       INTEGER NOT NULL,
    passed      INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// ── User helpers ──────────────────────────────────────────────────────────────
const stmts = {
  createUser: db.prepare(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
  ),
  findUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  findUserById:    db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?'),
  updateLastLogin: db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?"),

  // Roadmaps
  saveRoadmap: db.prepare(
    `INSERT INTO roadmaps (user_id, interest, skill_level, title, data)
     VALUES (?, ?, ?, ?, ?)`
  ),
  updateRoadmap: db.prepare(
    `UPDATE roadmaps SET data = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`
  ),
  getRoadmapsByUser: db.prepare(
    'SELECT id, interest, skill_level, title, total_xp, created_at, updated_at FROM roadmaps WHERE user_id = ? ORDER BY updated_at DESC'
  ),
  getRoadmapById: db.prepare('SELECT * FROM roadmaps WHERE id = ? AND user_id = ?'),
  deleteRoadmap:  db.prepare('DELETE FROM roadmaps WHERE id = ? AND user_id = ?'),

  // Module progress
  upsertProgress: db.prepare(
    `INSERT INTO module_progress (roadmap_id, module_id, completed, completed_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(roadmap_id, module_id)
     DO UPDATE SET completed = excluded.completed, completed_at = excluded.completed_at`
  ),
  getProgress: db.prepare(
    'SELECT module_id, completed, completed_at FROM module_progress WHERE roadmap_id = ?'
  ),
  addXP: db.prepare('UPDATE roadmaps SET total_xp = total_xp + ? WHERE id = ?'),

  // Quiz results
  saveQuizResult: db.prepare(
    `INSERT INTO quiz_results (user_id, roadmap_id, module_id, topic, score, total, passed)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ),
  getQuizResultsByUser: db.prepare(
    'SELECT * FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC'
  ),
  getAvgQuizScore: db.prepare(
    'SELECT AVG(CAST(score AS REAL) / total) as avg FROM quiz_results WHERE user_id = ?'
  ),
};

module.exports = { db, stmts };
