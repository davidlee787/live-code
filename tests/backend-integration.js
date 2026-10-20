"use strict";
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const port = 31000 + (process.pid % 20000), base = "http://127.0.0.1:"+port;
const child = spawn(process.execPath, ["server.js"], { cwd:root, env:{...process.env,PORT:String(port),GEMINI_API_KEY:""}, stdio:["ignore","ignore","pipe"] });
let stderr="";
child.stderr.on("data",chunk=>{stderr+=chunk.toString()});
async function wait(){const until=Date.now()+12000;while(Date.now()<until){if(child.exitCode!==null)throw Error("Server exited: "+stderr);try{const r=await fetch(base+"/api/health");if(r.ok)return}catch{}await new Promise(r=>setTimeout(r,200))}throw Error("Server not ready: "+stderr)}
(async()=>{try{await wait();const health=await fetch(base+"/api/health").then(r=>r.json());assert.equal(health.ok,true);assert.equal("database" in health,false);const status=await fetch(base+"/api/ai/status").then(r=>r.json());assert.equal(status.available,false);const noKey=await fetch(base+"/api/ai/code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"analyze",filename:"index.js",code:"console.log(1)"})});assert.equal(noKey.status,503);const removed=await fetch(base+"/api/sql/execute",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sql:"SELECT 1"})});assert.equal(removed.status,404);console.log("Backend integration tests passed: health, SQL removal, AI fail-closed status.");}catch(e){console.error(e);process.exitCode=1}finally{child.kill("SIGTERM")}})();
