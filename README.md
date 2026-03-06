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
|- src/
   |- styles.css
   |- js/
      |- main.js
      |- config.js
      |- utils.js
      |- wind.js
      |- target.js
      |- arrow.js
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

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and import the GitHub repo.
3. Keep defaults (Framework Preset: `Other`).
4. Deploy.

Because this is a static site, no build step is required.
