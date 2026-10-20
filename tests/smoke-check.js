const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const js = read("app.js");
const css = read("styles.css");
const server = read("server.js");
const vercel = JSON.parse(read("vercel.json"));
const pkg = JSON.parse(read("package.json"));

const checks = [];
function check(name, fn) {
  fn();
  checks.push(name);
}

check("app.js has valid JavaScript syntax", () => new vm.Script(js, { filename: "app.js" }));
check("package.json is valid JSON", () => { assert.equal(pkg.name, "elivecode-playground"); assert.ok(pkg.dependencies.express); assert.ok(pkg.dependencies["sql.js"]); });
check("backend exposes guarded SQLite and health routes", () => { new vm.Script(server, { filename: "server.js" }); assert.match(server, /\/api\/health/); assert.match(server, /\/api\/sql\/execute/); assert.match(server, /ATTACH|DETACH/); assert.match(server, /MAX_SQL_BYTES/); });
check("vercel.json is valid JSON", () => assert.ok(Array.isArray(vercel.headers)));
check("HTML references existing local assets", () => {
  const refs = [...html.matchAll(/(?:src|href)=["']\.\/([^"']+)["']/g)].map((m) => m[1]);
  assert.ok(refs.length > 0, "expected local asset references");
  for (const ref of refs) assert.ok(fs.existsSync(path.join(root, ref)), `missing asset: ${ref}`);
});
check("all static ID selectors used by app.js exist in index.html", () => {
  const ids = [...js.matchAll(/\$\("#([^"]+)"\)/g)].map((m) => m[1]);
  const missing = [...new Set(ids)].filter((id) => !new RegExp(`\\bid=["']${id}["']`).test(html));
  assert.deepEqual(missing, []);
});
check("starter editor tabs are present", () => {
  for (const key of ["html", "css", "js", "json", "python", "sql"]) {
    assert.ok(html.includes(`data-file="${key}"`), `missing editor tab: ${key}`);
  }
});
check("SQL tab and backend status are present", () => { assert.ok(html.includes('data-file="sql"')); assert.ok(html.includes('id="backendStatus"')); assert.match(js, /async function runSql\(/); assert.match(js, /\/api\/sql\/execute/); });
check("preview iframe is sandboxed", () => assert.match(html, /<iframe[^>]+sandbox="allow-scripts/));
check("autosave, active-file restore and responsive splitter are wired", () => {
  assert.match(js, /setTimeout\(persist,300\)/);
  assert.match(js, /loadPath\(active\)/);
  assert.match(js, /run\(\);/);
  assert.match(js, /splitter\.addEventListener\("pointermove"/);
});
check("CSS contains responsive layout rules", () => assert.match(css, /@media\(max-width:760px\)/));
check("import controls and Explorer exist", () => {
  for (const id of ["openProjectBtn","importFilesBtn","importFolderBtn","importZipBtn","filesInput","folderInput","fileExplorer","fileTabs","stopBtn"]) assert.ok(html.includes('id="'+id+'"'), "missing UI: "+id);
  assert.match(html,/webkitdirectory/); assert.match(js,/showDirectoryPicker/); assert.match(js,/showOpenFilePicker/);
});
check("workspace path resolution and local resource injection exist", () => {
  assert.match(js,/normalizePath/); assert.match(js,/resolveWorkspacePath/); assert.match(js,/buildPreviewHTML/); assert.match(js,/cssRewrite/);
});
check("ZIP import rejects unsafe paths", () => assert.match(js,/unsafe ZIP path rejected/));
check("Python execution limitation is clearly handled", () => assert.match(js,/Python is editable but requires a separate runtime/));

console.log(`Elivecode smoke tests passed: ${checks.length}/${checks.length}`);
for (const name of checks) console.log(`✓ ${name}`);
