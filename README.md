# Archery Physics Simulation

Browser-based archery physics simulation built with HTML, Tailwind CSS, and modular JavaScript Canvas.

## Features

- Start screen requiring username and email
- Aim with mouse
- Hold mouse to charge shot
- Release to shoot arrow
- Projectile physics with gravity
- Wind affects arrow trajectory
- Random wind every 5-10 seconds
- Target board with ring scoring
- Wind indicator UI
- Power bar UI
- User behavior logging (`name`, `email`, `log`) to Google Apps Script + Google Sheet
- Automatic log upload every 60 seconds
- Canvas animation loop with `requestAnimationFrame`

## Tech Stack

- HTML5
- Tailwind CSS (CDN)
- JavaScript ES Modules
- Canvas 2D API

## Project Structure

```text
.
|- index.html
|- vercel.json
|- README.md
|- api/
   |- log.js
|- src/
   |- styles.css
   |- js/
      |- main.js
      |- config.js
      |- utils.js
      |- wind.js
      |- target.js
      |- arrow.js
      |- logService.js
      |- renderer.js
```

## Run Locally

Use any static server from the project root.

### Option 1: Python

```bash
python -m http.server 5173
```

Open `http://localhost:5173`.

### Option 2: Node serve

```bash
npx serve .
```

### Option 3: Vercel local runtime (recommended for log API)

```bash
vercel dev
```

This runs both static frontend and `/api/log` locally.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and import the GitHub repo.
3. In Project Settings -> Environment Variables, add:
   - `GAS_URL` = your deployed Google Apps Script Web App URL
4. Keep defaults (Framework Preset: `Other`).
5. Deploy.

The frontend posts logs to `/api/log`, and Vercel serverless forwards data to your GAS `doPost` endpoint using `GAS_URL`.
