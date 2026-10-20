# Elivecode — Full-Stack Live Coding Playground

A browser-based coding workspace for HTML, CSS, JavaScript, SQL, JSON and Python, with a Node.js API and SQLite sandbox.

## Features
- Import multiple files, folders and ZIP archives
- File Explorer, tabs, create-file action and browser-local autosave
- Sandboxed HTML/CSS/JavaScript preview with console reporting
- SQL editor backed by SQLite through the Node.js backend
- Separate persistent SQLite database file per browser session
- `/api/health` health check and `/api/sql/execute` query endpoint
- JSON workspace export and responsive desktop/tablet/mobile preview

## Run the full-stack app
Requires Node.js 20+. Run `npm install`, then `npm start`, and open `http://localhost:3000`. Do not open `index.html` directly if you need SQL/backend features. Express serves the UI and API. SQLite databases persist on the host disk under `data/`; back up that directory if needed.

## SQL and security limits
SQL executes against SQLite, not MySQL or PostgreSQL. Each browser session has its own database. Query input is limited to 50 KB, a maximum of 30 statements per request, 500 returned rows per result set, and a 5 MB database per session. Database/file attachment operations are blocked. The server is intended for personal or trusted development, not as an unauthenticated public multi-user service. Add authentication and stronger quotas before public deployment.

## Deployment
Use a Node.js host that supports a long-running Express process and persistent disk (for example, a VPS or container). Set the start command to `npm start`, expose the host-provided `PORT`, and keep `data/` on persistent storage. Static-only hosting and serverless deployments with ephemeral filesystems are not suitable for persistent SQLite unless storage is replaced with a managed database.

## Runtime limits
This playground does not execute arbitrary Node.js or Python source from the editor. HTML/CSS/JavaScript run in a sandboxed browser preview; SQL runs on the backend against SQLite. ZIP import loads JSZip from a CDN on demand and requires internet access. Browser APIs vary, especially on Android.

## Tests
Run `npm test` with Node.js 20+. Smoke tests check syntax, configuration, import controls, SQL UI and backend routes. Browser-level behavior still needs verification in a real browser.
