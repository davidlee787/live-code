# Elivecode — Live Coding Playground

A lightweight browser-based coding workspace for HTML, CSS, JavaScript, JSON and Python source.

## Features
- Import multiple files from the Android/system file picker
- Import a folder when browser APIs or directory input are supported
- File Explorer, multi-file tabs, create-file action and dirty-state markers
- Static HTML preview with local CSS, JavaScript and common asset resolution
- Run, Stop, Refresh, responsive desktop/tablet/mobile preview
- Console and runtime error reporting from the sandboxed iframe
- Browser-local autosave for text files and JSON workspace export
- Optional ZIP import through JSZip loaded on demand

## Use on Android
Open Elivecode in a modern browser and choose **Open Project** or **Import Files**. Select multiple files in the system picker. Use **Import Folder** if your browser supports folder selection; otherwise select the files individually. Press **Run** after import. Imported code is not executed automatically.

## Runtime limits
This is a static browser IDE, not a full Node.js server. HTML, CSS, JavaScript and common local assets can be previewed. Relative local stylesheet/script references are inlined when their files are available. JavaScript module imports that depend on relative module graphs, server-side routes, npm install/build pipelines, databases, service workers and backend APIs may need a real development server and are not guaranteed to work in an iframe. Python is editable but not executed. ZIP import loads JSZip from a CDN on demand and requires internet access. Browser APIs differ, especially on Android; folder selection and writing back to original files are not universally available. Binary assets are session-only and are not included in the JSON text export.

## Deploy to Vercel
Import this public GitHub repository, choose Framework Preset **Other**, leave Build Command empty, set Output Directory to `.`, and deploy. No environment variables are required.

## Tests
Requires Node.js 20+. Run `npm test` for static smoke checks covering JavaScript syntax, config, local assets, sandboxing, import controls, path handling and ZIP safety. Browser-level file picker behavior must still be verified in a real Android browser.
