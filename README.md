# Project Ascend

A fully-featured desktop app for JEE aspirants — built with Electron.

## Quick Start

```bash
# 1. Install Node.js 18+ from nodejs.org
# 2. Clone / extract this folder
cd jee-app
npm install
npm start        # dev mode (opens immediately)
npm run build    # produces dist/Project Ascend Setup.exe
```

## Features

| Module | What it does |
|--------|-------------|
| **Dashboard** | Live stats · animated charts · AI rank prediction banner |
| **Weekly Planner** | 7-column calendar grid · add tasks per day |
| **Task Tracker** | Kanban (Pending / In Progress / Done) · progress bars |
| **Timer & Pomodoro** | Stopwatch · Countdown · Pomodoro with SVG ring animation |
| **Mock Logger** | Log JEE mocks · trend charts · subject breakdowns |
| **Rank Estimator** | 7 HuggingFace models debate your rank in real time |
| **Resource Hub** | Save PDFs/Links/Notes · embedded webview |
| **Settings** | HF API key · alarms (Focus Assist bypass) · data export |

## First-Run Setup

1. Launch the app
2. Go to **Settings**
3. Enter your **HuggingFace API key** (free at huggingface.co/settings/tokens)
4. Set alarms for study sessions
5. Start tracking!

## Notes

- Runs as **Administrator** on Windows to bypass Focus Assist / DND
- Data stored at `%APPDATA%/Project Ascend/jee-data.json`
- Closes to system tray — stays running in background
