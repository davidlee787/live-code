# Elivecode — Live Coding Playground

A static, browser-only playground for editing HTML, CSS, JavaScript, JSON and Python source with a sandboxed live preview.

## Features
- Multi-file editor tabs and line numbers
- Live preview in desktop, tablet and mobile viewport modes
- Run button and Ctrl/Cmd + Enter shortcut
- Preview console and error/issues view
- Browser-local autosave using localStorage
- Export source snapshot as JSON
- Responsive layout for mobile and desktop
- No API keys, build step or environment variables required

## Deploy to Vercel
1. Import this public GitHub repository in Vercel.
2. Framework Preset: **Other**.
3. Build Command: leave empty.
4. Output Directory: `.` (project root).
5. Deploy.

The included `vercel.json` sets clean static hosting headers. This is a static project; it does not need Node.js at runtime.

## Important runtime notes
This first version edits and previews HTML/CSS/JavaScript in the browser. Python is an editor tab only; executing Python safely requires a server-side runtime or WebAssembly Python runtime, neither of which is bundled here. This app is a lightweight playground, not a full VS Code/Monaco replacement. Console messages are relayed from the preview iframe; the iframe is sandboxed.

## Local use
Open `index.html` in a modern browser, or serve the folder with any static HTTP server.
