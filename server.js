"use strict";
const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const initSqlJs = require("sql.js");
const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const MAX_SQL_BYTES = 50 * 1024;
const MAX_DB_BYTES = 5 * 1024 * 1024;
const MAX_RESULT_ROWS = 500;
const MAX_STATEMENTS = 30;
const rate = new Map();
fs.mkdirSync(DATA_DIR, { recursive: true });
app.disable("x-powered-by");
app.use(express.json({ limit: "64kb", strict: true }));
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (!req.path.startsWith("/api/")) return next();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const bucket = rate.get(key) || { start: now, count: 0 };
  if (now - bucket.start > 60000) { bucket.start = now; bucket.count = 0; }
  bucket.count++;
  rate.set(key, bucket);
  if (bucket.count > 60) return res.status(429).json({ error: "Batas permintaan API tercapai. Coba lagi sebentar." });
  next();
});
app.get("/api/health", (req, res) => res.json({ ok: true, service: "elivecode-api", database: "SQLite", timestamp: new Date().toISOString() }));
function validSessionId(id) { return typeof id === "string" && /^[a-zA-Z0-9-]{16,64}$/.test(id); }
function databasePath(id) { return path.join(DATA_DIR, "session-" + id + ".sqlite"); }
function statementCount(sql) { return (sql.match(/;/g) || []).length + (sql.trim().endsWith(";") ? 0 : 1); }
function validateSql(sql) {
  if (typeof sql !== "string" || !sql.trim()) throw new Error("Query SQL kosong.");
  if (Buffer.byteLength(sql, "utf8") > MAX_SQL_BYTES) throw new Error("Query terlalu besar (maksimal 50 KB).");
  if (statementCount(sql) > MAX_STATEMENTS) throw new Error("Maksimal 30 statement per permintaan.");
  if (/(^|[;\s])(?:ATTACH|DETACH|VACUUM\s+INTO|LOAD_EXTENSION)\b/i.test(sql)) throw new Error("Statement tersebut diblokir karena dapat mengakses file atau database lain.");
}
let SQL;
const ready = initSqlJs({ locateFile: file => require.resolve("sql.js/dist/" + file) }).then(mod => { SQL = mod; });
app.post("/api/sql/execute", async (req, res) => {
  try {
    await ready;
    const { sessionId, sql } = req.body || {};
    if (!validSessionId(sessionId)) return res.status(400).json({ error: "Session ID tidak valid. Muat ulang halaman lalu coba lagi." });
    validateSql(sql);
    const file = databasePath(sessionId);
    if (fs.existsSync(file) && fs.statSync(file).size > MAX_DB_BYTES) return res.status(413).json({ error: "Database sesi melebihi batas 5 MB." });
    const db = fs.existsSync(file) ? new SQL.Database(new Uint8Array(fs.readFileSync(file))) : new SQL.Database();
    const started = Date.now();
    try {
      const results = db.exec(sql).map(result => ({ columns: result.columns, rows: result.values.slice(0, MAX_RESULT_ROWS), truncated: result.values.length > MAX_RESULT_ROWS, changes: db.getRowsModified() }));
      const binary = Buffer.from(db.export());
      if (binary.length > MAX_DB_BYTES) return res.status(413).json({ error: "Database melebihi batas 5 MB; hapus data atau tabel yang tidak diperlukan." });
      fs.writeFileSync(file, binary);
      return res.json({ ok: true, results, statements: statementCount(sql), durationMs: Date.now() - started, database: "SQLite" });
    } finally { db.close(); }
  } catch (error) {
    return res.status(400).json({ error: error && error.message ? error.message : "Query gagal dijalankan." });
  }
});
app.use(express.static(ROOT, { index: "index.html", dotfiles: "ignore" }));
app.use((req, res) => req.path.startsWith("/api/") ? res.status(404).json({ error: "API endpoint tidak ditemukan." }) : res.status(404).send("Not found"));
app.listen(PORT, "0.0.0.0", () => console.log("Elivecode full-stack server listening on port " + PORT));
