# Spin Lab: How a Merry-Go-Round Works 🎠

An interactive, vibrant web app that teaches the mechanics and physics of a merry-go-round (carousel).

## Features

- **Step-by-step animated cutaway** (9 steps): motor → belt & gearbox → pinion & ring gear → platform & bearing → crown gear & crankshafts → galloping horses → speed & centripetal force → braking. Includes play/pause, auto-tour, speed control, labels, an X-ray canopy view, live readouts, and a live height graph.
- **Parts gallery**: 12 components, each with a “See it move” button that jumps to that step in the animation.
- **Physics Lab**: top-down spinning platform with sliders for RPM, rider radius and mass. Shows ω, period, v = ωr, a = ω²r, F = m·a and g-force, plus a “Let go!” demo of inertia.
- **Gear Lab**: an “unrolled” crown gear with a crank pinion rolling along it, showing why horses gallop *crown teeth ÷ pinion teeth* times per lap.
- **Quiz**: 7 questions with explanations.

Plain HTML, CSS and JavaScript. No build step, no dependencies (Google Fonts is loaded from its CDN).

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to Netlify

**Option A: drag and drop**
1. Go to <https://app.netlify.com/drop>.
2. Drag this whole project folder onto the page.

**Option B: connect the Git repository**
1. In Netlify, choose **Add new site → Import an existing project** and pick this repo.
2. Leave **Build command** empty and set **Publish directory** to `.` (both are already set in `netlify.toml`).
3. Click **Deploy**.

## Project structure

```
index.html        Page layout and content
404.html          Netlify custom "not found" page
netlify.toml      Netlify config (publish dir + headers)
favicon.svg
css/styles.css    Vibrant theme and responsive layout
js/util.js        Canvas helpers (HiDPI sizing, animation loop, arrows, labels)
js/horse.js       Carousel horse drawing
js/carousel.js    Step-by-step cutaway animation
js/physics-lab.js Centripetal force lab
js/gear-lab.js    Crown gear / crank lab
js/quiz.js        Quiz
js/main.js        Parts gallery, navigation, start-up
```
