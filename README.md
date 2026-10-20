# Elivecode — Live Coding Playground

Browser-based workspace for HTML, CSS, JavaScript, JSON and Python. SQL/database functionality has been removed.

## Features
- Floating Gemini Code Assist to scan the active file and suggest fixes
- Consent and confirmation before sending code to Gemini; manual approval before applying changes
- Import files, folders and ZIP archives; file explorer and browser-local autosave
- Sandboxed HTML/CSS/JavaScript preview with console and issues panel
- Responsive desktop/tablet/mobile preview

## Deploy to Vercel
1. Import this repository into Vercel.
2. In **Project → Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your Gemini API key
   - `GEMINI_MODEL` = a model ID available to your API key (optional; default is `gemini-3.8-flash`)
3. Apply the variables to the Production environment (and Preview if needed), then redeploy.

Create an API key in Google AI Studio. Never put the key in `index.html`, `app.js`, browser storage, or a public repository. Vercel uses serverless API routes, so the key must be set in Vercel Environment Variables, not written to a local `.env` file from the website.

## Local development
Requires Node.js 20+. Run `npm install`, set `GEMINI_API_KEY` in a local `.env` file if using AI, then run `npm start` and open `http://localhost:3000`.

## AI safety
Each request requires consent and confirmation. Only the active text file (maximum 24 KB) is sent to Gemini. Review proposed changes before manually applying them. Basic in-memory request limits are used; configure usage limits and budgets for your Gemini API key.

## Limits
This is a browser coding playground, not a remote execution environment. Python can be edited but needs a separate runtime to execute. HTML/CSS/JavaScript run in a sandboxed preview. Workspace autosave is browser-local.
