# Sculptor

A personal muscle-map training app for iPhone, in the browser.

- **Body** – tap a muscle, pick a goal (Strength, Endurance, Agility, Mobility, Stretch), see the top exercises with the ones you do most at the top, and log sets. Barbell bench press has a live 3D form model with Muscles, Breath and Mind layers.
- **Mind** – tap the brain to run a 1, 3 or 5 minute breathing session, and practise eight mind skills (Focus, Trust, Observe, Picture, Inner voice, Feel, Calm, Habits).
- **Progress** – overall strength, charts per exercise and scores per muscle group.

Light and dark mode follow the phone, or set them in Settings.

## Run it

Open `index.html` in a browser, or serve the folder with any static host (GitHub Pages works). Data is saved in the browser's local storage on each device. The 3D model loads three.js from jsDelivr.

## Edit it

Source lives in `src/`. After a change, rebuild the single page:

```sh
python3 build.py
```

| File | What it holds |
| --- | --- |
| `src/core.js` | Body map geometry, muscles, exercise library, strength standards, storage, scoring |
| `src/ui.js` | Body and Progress tabs, sheets, logging, settings, theme |
| `src/mind.js` | Mind tab, skills and drills, breathing session |
| `src/form3d.js` | 3D form viewer (three.js) |
| `src/app.css`, `src/form3d.css` | Styles |
| `src/icon.svg` | App icon, inlined into the page as the tab favicon |

The tab favicon is inlined from `src/icon.svg` by `build.py`. The home-screen icon
`icon-180.png` is a separate raster, so regenerate it after changing the icon — drop
the `rx` corner radius first, since iOS applies its own rounded mask:

```sh
sed 's/ rx="7.5"//' src/icon.svg > /tmp/icon-ios.svg
qlmanage -t -s 180 -o /tmp /tmp/icon-ios.svg
sips -s format png /tmp/icon-ios.svg.png --out icon-180.png
```

## Add to the iPhone home screen

Open the GitHub Pages link in Safari, tap Share, then **Add to Home Screen**.
