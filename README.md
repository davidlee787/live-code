# Elivecode — Full-Stack Live Coding Playground

A browser-based coding workspace for HTML, CSS, JavaScript, SQL, JSON and Python, with a Node.js API and SQLite sandbox.

## Features
- Floating Gemini Code Assist: scan the active file, explain likely errors, and propose corrected code without silently editing source
- Explicit consent before sending code to Google Gemini; manual confirmation required before applying proposed changes
- Gemini API key stays server-side in `.env` or host environment variables and is never returned by API endpoints
- Admin-only website configuration form protected by `AI_ADMIN_TOKEN`
- Import multiple files, folders and ZIP archives
- File Explorer, tabs, create-file action and browser-local autosave
- Sandboxed HTML/CSS/JavaScript preview with console reporting
- SQL editor backed by SQLite through the Node.js backend
- Separate persistent SQLite database file per browser session
- `/api/health` health check and `/api/sql/execute` query endpoint
- JSON workspace export and responsive desktop/tablet/mobile preview

## Run the full-stack app
Requires Node.js 20+. Run `npm install`, then `npm start`, and open `http://localhost:3000`. Do not open `index.html` directly if you need SQL/backend features. Express serves the UI and API. SQLite databases persist on the host disk under `data/`; back up that directory if needed.

## Configure Gemini
Copy `.env.example` to `.env` and set `GEMINI_API_KEY`; optionally set `GEMINI_MODEL`. The real `.env` is ignored by Git. On Pterodactyl, you can set the same values as server environment variables instead. Never put the Gemini API key in `app.js`, `index.html`, client-side storage, or a public repository.

If you want to enter the Gemini key through the website, set a strong random `AI_ADMIN_TOKEN` in the server environment first. Open the floating **G** assistant, expand **Pengaturan admin**, enter that token and the Gemini key, and save. The backend writes the key to server-side `.env`; it does not send the key back to the browser. Use HTTPS, keep the admin token private, and restrict host file access. If the host makes `.env` read-only, set `GEMINI_API_KEY` in the host environment instead.

## AI permissions and limits
Every AI request requires a checkbox plus a confirmation dialog. Only the active text file is sent (maximum 24 KB); code is sent to Google Gemini, so do not submit secrets or personal data. AI suggestions are displayed separately and are never applied automatically. Applying a fix requires a second confirmation and is blocked if the active source changed while Gemini was working. Requests are limited to 8/minute and 80/day per IP in this process. These in-memory limits are basic safeguards, not a substitute for authentication, durable rate limiting, budget controls, and HTTPS on a public service.

## SQL and security limits
SQL executes against SQLite, not MySQL or PostgreSQL. Each browser session has its own database. Query input is limited to 50 KB, a maximum of 30 statements per request, 500 returned rows per result set, and a 5 MB database per session. Database/file attachment operations are blocked. The server is intended for personal or trusted development, not as an unauthenticated public multi-user service. Add authentication and stronger quotas before public deployment.

## Deployment
Use a Node.js host that supports a long-running Express process and persistent disk (for example, a VPS or container). Set the start command to `npm start`, expose the host-provided `PORT`, and keep `data/` on persistent storage. Static-only hosting and serverless deployments with ephemeral filesystems are not suitable for persistent SQLite unless storage is replaced with a managed database.

## Runtime limits
This playground does not execute arbitrary Node.js or Python source from the editor. HTML/CSS/JavaScript run in a sandboxed browser preview; SQL runs on the backend against SQLite. ZIP import loads JSZip from a CDN on demand and requires internet access. Browser APIs vary, especially on Android.

## Tests
Run `npm test` with Node.js 20+. Smoke tests check syntax, configuration, import controls, SQL UI and backend routes. Browser-level behavior still needs verification in a real browser.
