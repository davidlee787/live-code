"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "elivecode-sql-test-"));
const port = 31000 + (process.pid % 20000);
const base = "http://127.0.0.1:" + port;
const sessionId = "test-session-" + process.pid;
const child = spawn(process.execPath, ["server.js"], {
  cwd: root,
  env: { ...process.env, PORT: String(port), ELIVECODE_DATA_DIR: dataDir, AI_ADMIN_TOKEN: "test-admin-token", GEMINI_API_KEY: "" },
  stdio: ["ignore", "ignore", "pipe"]
});
let stderr = "";
child.stderr.on("data", chunk => { stderr += chunk.toString(); });

async function waitForServer() {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error("Server exited early: " + stderr);
    try {
      const response = await fetch(base + "/api/health");
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error("Server did not become ready: " + stderr);
}
async function query(sql) {
  const response = await fetch(base + "/api/sql/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, sql })
  });
  const body = await response.json();
  return { response, body };
}
(async () => {
  try {
    await waitForServer();
    const health = await fetch(base + "/api/health").then(r => r.json());
    assert.equal(health.ok, true, "health endpoint should be healthy");
    const aiStatus = await fetch(base + "/api/ai/status").then(r => r.json());
    assert.equal(aiStatus.available, false, "test process has no Gemini key");
    assert.equal(aiStatus.adminSetupAvailable, true, "admin setup should require configured token");
    const noKey = await fetch(base + "/api/ai/code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "analyze", filename: "index.js", code: "console.log(1)" }) });
    assert.equal(noKey.status, 503, "AI requests must fail closed when no key is configured");
    const badAdmin = await fetch(base + "/api/admin/gemini-config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminToken: "wrong-token", apiKey: "AIzaFakeLongTestKey000000000000000000", model: "gemini-3.8-flash" }) });
    assert.equal(badAdmin.status, 403, "Gemini key setup must reject unauthorized admins");

    const created = await query("CREATE TABLE test_items (id INTEGER PRIMARY KEY, label TEXT NOT NULL); INSERT INTO test_items (id, label) VALUES (1, 'persisted'); SELECT id, label FROM test_items;");
    assert.equal(created.response.status, 200, JSON.stringify(created.body));
    assert.deepEqual(created.body.results.at(-1).rows, [[1, "persisted"]]);

    const persisted = await query("SELECT id, label FROM test_items;");
    assert.equal(persisted.response.status, 200, JSON.stringify(persisted.body));
    assert.deepEqual(persisted.body.results[0].rows, [[1, "persisted"]], "SQLite data should persist between requests");

    const blocked = await query("ATTACH DATABASE ':memory:' AS other;");
    assert.equal(blocked.response.status, 400, "database attachment should be blocked");
    assert.match(blocked.body.error, /blocked|diblokir/i);

    const dataListing = await fetch(base + "/data/session-" + sessionId + ".sqlite");
    assert.equal(dataListing.status, 404, "SQLite database files must not be served publicly");
    console.log("Backend integration tests passed: health, SQL execution, persistence, SQL guard, private database files, AI fail-closed status and admin authorization.");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    child.kill("SIGTERM");
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})();
