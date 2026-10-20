(() => {
"use strict";
const $=s=>document.querySelector(s);
const sample={
html:`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Small things, well made.</title></head>
<body><main class="card"><span class="eyebrow">A LITTLE SPACE TO BUILD</span><h1>Small things,<br><em>well made.</em></h1><p>A clean starting point for your next idea. Change the code and see it happen.</p><button id="hello">Say hello <span>↗</span></button><div class="footnote"><span class="dot"></span> Made in Elivecode <span>/</span> Live on your screen</div></main></body></html>`,
css:`:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#20231f;background:#f1f1eb}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:32px}.card{width:min(100%,560px);padding:clamp(28px,7vw,64px);background:#fbfbf7;border:1px solid #deded5}.eyebrow{font:700 10px/1.4 ui-monospace,monospace;letter-spacing:1.5px;color:#6b765b}h1{margin:32px 0 16px;font-size:clamp(42px,7vw,72px);line-height:.98;letter-spacing:-.065em;font-weight:650}h1 em{color:#708d4f;font-family:Georgia,serif;font-weight:400}p{max-width:340px;color:#70736b;font-size:14px;line-height:1.8}button{margin-top:20px;border:0;padding:13px 17px;background:#b8f36b;color:#1d2813;font-weight:700;cursor:pointer}.footnote{display:flex;align-items:center;gap:9px;margin-top:54px;color:#888a80;font:10px ui-monospace,monospace}.dot{width:6px;height:6px;background:#82b94c;border-radius:50%}`,
js:`document.querySelector("#hello")?.addEventListener("click", event => {event.currentTarget.innerHTML="Hello, builder ✓";console.log("Button clicked — your event handler works.");});`,
json:`{
  "project": "untitled-project",
  "version": 1,
  "description": "A small live-coding experiment",
  "features": ["HTML", "CSS", "JavaScript", "Live preview"]
}`,
python:`# Python editor (execution requires a Python runtime)
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("builder"))`
};
const files={...sample};let active="html",entries=[],issues=[],view="console",wrap=false;
const labels={html:"HTML",css:"CSS",js:"JAVASCRIPT",json:"JSON",python:"PYTHON"};
const editor=$("#codeEditor"),nums=$("#lineNumbers"),frame=$("#previewFrame"),device=$("#deviceFrame"),out=$("#consoleOutput");
function status(s){$("#saveStatus").textContent=s}
function syncLines(){nums.textContent=Array.from({length:Math.max(1,editor.value.split("\n").length)},(_,i)=>i+1).join("\n");nums.scrollTop=editor.scrollTop}
function cursor(){const p=editor.value.slice(0,editor.selectionStart).split("\n");$("#cursorInfo").textContent=`Ln ${p.length}, Col ${p.at(-1).length+1}`}
function load(key){files[active]=editor.value;active=key;editor.value=files[key];$("#languageLabel").textContent=labels[key];$("#fileType").textContent=labels[key];document.querySelectorAll(".file-tab").forEach(b=>{b.classList.toggle("active",b.dataset.file===key);b.setAttribute("aria-selected",String(b.dataset.file===key))});syncLines();cursor();status("Local workspace")}
function log(kind,msg){entries.push({kind,msg:String(msg)});if(entries.length>250)entries.shift();render()}
function render(){ $("#consoleCount").textContent=entries.length;$("#issueCount").textContent=issues.length;out.replaceChildren();const items=view==="issues"?issues.map(x=>({kind:"error",msg:x.message})):entries;if(!items.length){const d=document.createElement("div");d.className="console-empty";d.innerHTML=view==="issues"?'<span>✓</span><p>No issues detected.</p><small>Errors will appear here.</small>':'<span>⌁</span><p>Console output will appear here.</p><small>Run your code to see logs and errors.</small>';out.append(d);return}items.forEach(x=>{const row=document.createElement("div");row.className="console-line "+x.kind;const k=document.createElement("span");k.className="kind";k.textContent=x.kind;const m=document.createElement("span");m.className="message";m.textContent=x.msg;row.append(k,m);out.append(row)})}
function documentHtml(){files[active]=editor.value;let html=files.html;const bridge=`<script>(()=>{const send=(kind,args)=>parent.postMessage({source:"elivecode-preview",kind,args:args.map(v=>{try{return typeof v==="object"?JSON.stringify(v):String(v)}catch{return String(v)}})},"*");["log","info","warn","error"].forEach(k=>{const old=console[k].bind(console);console[k]=(...a)=>{old(...a);send(k,a)}});addEventListener("error",e=>send("error",[e.message+" (line "+e.lineno+")"]));addEventListener("unhandledrejection",e=>send("error",[e.reason]));})();<\/script>`;
if(/<\/head\s*>/i.test(html))html=html.replace(/<\/head\s*>/i,`<style>\n${files.css}\n</style>${bridge}</head>`);else html=`<style>${files.css}</style>${bridge}${html}`;
if(/<\/body\s*>/i.test(html))html=html.replace(/<\/body\s*>/i,`<script>\n${files.js}\n<\/script></body>`);else html+=`<script>${files.js}<\/script>`;return html}
function run(){files[active]=editor.value;entries=[];issues=[];if(active==="json"){try{JSON.parse(files.json);log("info","JSON parsed successfully.")}catch(e){issues.push({message:e.message});log("error",e.message)}}if(active==="python")log("warn","Python code is editable, but not executed in this browser-only build. Use a server/runtime to execute Python.");try{frame.srcdoc=documentHtml();status("Preview updated")}catch(e){issues.push({message:e.message});log("error",e.message)}render()}
function exportProject(){files[active]=editor.value;const blob=new Blob([JSON.stringify({"index.html":files.html,"styles.css":files.css,"app.js":files.js,"data.json":files.json,"main.py":files.python},null,2)],{type:"application/json"});const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download="elivecode-source.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status("Source exported")}
document.querySelectorAll(".file-tab").forEach(b=>b.addEventListener("click",()=>load(b.dataset.file)));
document.querySelectorAll(".device-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".device-btn").forEach(x=>x.classList.toggle("active",x===b));device.classList.remove("desktop-frame","tablet-frame","mobile-frame");device.classList.add(b.dataset.device+"-frame")}));
document.querySelectorAll(".console-tab").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.console;document.querySelectorAll(".console-tab").forEach(x=>x.classList.toggle("active",x===b));render()}));
let saveTimer;
function persistWorkspace(){
  try {
    files[active]=editor.value;
    localStorage.setItem("elivecode.workspace.v1",JSON.stringify({files,active}));
    status("Saved locally");
  } catch (error) {
    status("Local save unavailable");
    log("warn","Browser storage is unavailable or full: "+error.message);
  }
}
editor.addEventListener("input",()=>{
  files[active]=editor.value;syncLines();cursor();status("Unsaved local changes");
  clearTimeout(saveTimer);saveTimer=setTimeout(persistWorkspace,250);
});
editor.addEventListener("scroll",()=>nums.scrollTop=editor.scrollTop);editor.addEventListener("click",cursor);editor.addEventListener("keyup",cursor);
editor.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();run()}if(e.key==="Tab"){e.preventDefault();editor.setRangeText("  ",editor.selectionStart,editor.selectionEnd,"end");editor.dispatchEvent(new Event("input"))}});
$("#runBtn").addEventListener("click",run);$("#refreshBtn").addEventListener("click",run);$("#downloadBtn").addEventListener("click",exportProject);$("#clearConsoleBtn").addEventListener("click",()=>{entries=[];issues=[];render()});
$("#wrapBtn").addEventListener("click",()=>{wrap=!wrap;editor.classList.toggle("wrap",wrap);$("#wrapBtn").style.color=wrap?"var(--green)":""});
$("#resetBtn").addEventListener("click",()=>{if(!confirm("Reset semua file ke contoh awal? Perubahan saat ini akan hilang."))return;Object.assign(files,sample);load("html");run()});
$("#popoutBtn").addEventListener("click",()=>{
  const w=window.open("","_blank");
  if(!w){log("warn","Popup diblokir browser. Izinkan pop-up untuk membuka preview.");return}
  const html=documentHtml();
  w.document.open();w.document.write(html);w.document.close();
});
addEventListener("message",e=>{if(e.data?.source!=="elivecode-preview")return;const message=(e.data.args||[]).join(" ");log(e.data.kind||"log",message);if(e.data.kind==="error")issues.push({message});render()});
let initialFile="html";
try {
  const saved=JSON.parse(localStorage.getItem("elivecode.workspace.v1")||"null");
  if(saved?.files) Object.keys(files).forEach(k=>{if(typeof saved.files[k]==="string")files[k]=saved.files[k]});
  if(saved?.active && Object.hasOwn(files,saved.active)) initialFile=saved.active;
} catch { /* Ignore malformed or blocked local storage and use starter files. */ }
addEventListener("pagehide",()=>{clearTimeout(saveTimer);try{files[active]=editor.value;localStorage.setItem("elivecode.workspace.v1",JSON.stringify({files,active}));}catch{}});
load(initialFile);run();
})();