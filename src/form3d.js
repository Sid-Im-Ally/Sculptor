// ================= 3D form viewer (Muscles · Breath · Mind) =================
// Loads three.js on demand, mounts into #form3d inside the exercise sheet.
(function () {
const THREE_URL = window.__THREE_URL || 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
let threeP = null;
const loadThree = () => threeP || (threeP = import(THREE_URL));

// ---------- exercise specs (one per movement; more patterns plug in here) ----------
const FORM3D = {
  bench_press: {
    pattern: 'supine-press',
    tempo: { hold_top: 0.8, lower: 1.6, pause: 0.2, press: 0.9 },
    params: { grip: 0.3, touch_x: 0.17, flare: 52, fault_flare: 125 },
    muscles: [
      { id: 'pec', name: 'Chest', curve: [[0, .3], [.8, .3], [2.2, .8], [2.5, .97], [2.9, 1], [3.3, .7], [3.5, .3]] },
      { id: 'delt', name: 'Front delts', curve: [[0, .2], [.8, .2], [2.3, .5], [2.5, .7], [3, .65], [3.5, .2]] },
      { id: 'tri', name: 'Triceps', curve: [[0, .25], [.8, .25], [2.4, .3], [2.7, .45], [3.2, .95], [3.4, .8], [3.5, .25]] }
    ],
    phaseCue: {
      LOCKOUT: 'Bar over the shoulders, shoulder blades pinned, feet planted.',
      LOWER: 'Lower for 2 seconds to the lower chest, around the nipple line.',
      PAUSE: 'Touch, stay tight. Forearms vertical, stretch across the chest.',
      PRESS: 'Press up and slightly back toward the shoulders.'
    },
    fault: 'Elbows flared to 90° put the load on the front of the shoulder. Keep them 45–60° from your torso.',
    breath: {
      phases: [{ mode: 'exhale', start: 0, end: .35 }, { mode: 'inhale', start: .35, end: .8 }, { mode: 'brace', start: .8, end: 3.2 }, { mode: 'exhale', start: 3.2, end: 3.5 }],
      volume: [[0, .55], [.35, .3], [.8, 1], [3.2, 1], [3.5, .55]],
      label: { inhale: 'Inhale', brace: 'Brace', exhale: 'Exhale' },
      tip: { inhale: 'Big breath into the belly at the top.', brace: 'Hold it. Abs tight all the way around, through the lowering and the press.', exhale: 'Hiss it out once the bar is past the sticking point.' },
      note: 'One breath per rep on sets of 6–12. On heavy sets of 1–5, hold the brace for the whole rep.'
    },
    mind: {
      cue: 'Squeeze', line: 'Feel the chest pull your hands toward each other.',
      heavyCue: 'Drive', heavyLine: 'Push yourself away from the bar. Near your max, focus on the bar, not the muscle.',
      ritual: ['Two slow breaths: in for 4 seconds, out for 6', 'Picture one perfect rep, bar to the lower chest', 'Pick one cue word for the set', 'Tap your chest once to find the muscle', 'Set up and brace', 'Say the cue at the hardest point of every rep'],
      watch: 'Raise your wrist, open Mindfulness and tap Breathe. Breathe with the taps and think only about your chest.'
    }
  }
};

let current = null;
window.Form3D = {
  has: id => !!FORM3D[id],
  sync() {
    const host = document.getElementById('form3d');
    if (current && (!host || current.host !== host)) { current.destroy(); current = null; }
    if (host && !current) current = mount(host, FORM3D[host.dataset.ex], { pct: parseFloat(host.dataset.pct) || 0, lastText: host.dataset.last || '' });
  },
  destroy() { if (current) { current.destroy(); current = null; } },
  remount() { if (current) { const h = current.host; current.destroy(); current = null; if (document.body.contains(h)) this.sync(); } }
};

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function curveAt(c, x) { for (let i = 0; i < c.length - 1; i++) { const [x0, v0] = c[i], [x1, v1] = c[i + 1]; if (x <= x1) return lerp(v0, v1, smooth(x0, x1, x)); } return c[c.length - 1][1]; }
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

const VIEWS = {
  hero: { label: '3/4', az: 32, el: 22, R: 3.4, tgt: [0.26, 0.55, 0] },
  side: { label: 'Side', az: 90, el: 6, R: 2.7, tgt: [0.06, 0.76, 0] },
  top: { label: 'Top', az: 0.1, el: 84, R: 2.75, tgt: [0.14, 0.6, 0] },
  close: { label: 'Close', az: 26, el: 42, R: 1.85, tgt: [0.1, 0.66, 0.04] }
};
const MODE_VIEW = { muscles: 'hero', breath: 'close', mind: 'hero' };

function mount(host, spec, opts) {
  const heavyDefault = opts.pct >= 0.7;
  const ui = {
    mode: 'muscles', view: 'hero', playing: !reduced(), fault: false, ritual: false,
    focus: heavyDefault ? 'bar' : 'muscle'
  };
  host.innerHTML = `<div class="f3-stage">
      <canvas class="f3-canvas" aria-label="3D bench press model. Drag to turn it."></canvas>
      <div class="f3-labels" aria-hidden="true"></div>
      <div class="f3-top"><div class="seg f3-modes" role="tablist" aria-label="Layer">
        <button role="tab" data-f3mode="muscles" aria-selected="true">Muscles</button>
        <button role="tab" data-f3mode="breath" aria-selected="false">Breath</button>
        <button role="tab" data-f3mode="mind" aria-selected="false">Mind</button></div></div>
      <div class="f3-bottom"><div class="f3-views">${Object.entries(VIEWS).map(([k, v]) => `<button data-f3view="${k}" aria-pressed="${k === 'hero'}">${v.label}</button>`).join('')}</div>
        <button class="f3-play" data-f3play aria-label="Pause"></button></div>
      <div class="f3-load">Loading 3D model…</div>
    </div>
    <div class="f3-panel" aria-live="polite"></div>`;
  const $h = s => host.querySelector(s);
  const stage = $h('.f3-stage'), canvas = $h('.f3-canvas'), labelsEl = $h('.f3-labels'), panel = $h('.f3-panel');
  let alive = true, raf = 0, api = null;
  const destroyFns = [];

  const setPlayIcon = () => { const b = $h('[data-f3play]'); b.innerHTML = ui.playing ? '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>'; b.setAttribute('aria-label', ui.playing ? 'Pause' : 'Play'); };
  setPlayIcon();

  // ---------- panel ----------
  const refs = {};
  function renderPanel() {
    const m = ui.mode;
    if (m === 'muscles') {
      panel.className = 'f3-panel muscles';
      panel.innerHTML = `<div class="f3-row"><b class="f3-big" data-r="phase">Lower</b><span class="f3-sub">2 s down · 1 s up</span></div>
        <p class="f3-cue" data-r="cue"></p>
        <div class="f3-bars">${spec.muscles.map(x => `<div class="f3-bar"><span>${x.name}</span><b><i data-r="m-${x.id}"></i></b></div>`).join('')}</div>
        <div class="f3-row f3-actions"><button class="fchip sm${ui.fault ? ' on' : ''}" data-f3fault>${ui.fault ? 'Showing the mistake' : 'Show the common mistake'}</button><span class="f3-sub">Side view shows the bar path · Top shows the elbow angle</span></div>`;
    } else if (m === 'breath') {
      const B = spec.breath, T = B.phases[B.phases.length - 1].end;
      panel.className = 'f3-panel breath';
      panel.innerHTML = `<div class="f3-row"><b class="f3-big" data-r="bmode">Brace</b><span class="f3-sub">one breath per rep</span></div>
        <p class="f3-cue" data-r="btip"></p>
        <div class="f3-track">${B.phases.map(p => `<i class="${p.mode}" style="flex:${p.end - p.start}"></i>`).join('')}<u data-r="bhead"></u></div>
        <div class="f3-tl">${B.phases.map(p => `<span style="flex:${p.end - p.start}">${p.end - p.start >= .4 ? B.label[p.mode] : ''}</span>`).join('')}</div>
        <p class="f3-note">${B.note}</p>`;
    } else {
      const M = spec.mind, bar = ui.focus === 'bar';
      panel.className = 'f3-panel mind';
      panel.innerHTML = `<div class="f3-row"><b class="f3-big"><em data-r="pulse"></em>${bar ? M.heavyCue : M.cue}</b>
          <div class="seg f3-focus" role="tablist" aria-label="Focus"><button role="tab" data-f3focus="muscle" aria-selected="${!bar}">Muscle</button><button role="tab" data-f3focus="bar" aria-selected="${bar}">Bar</button></div></div>
        <p class="f3-cue">${bar ? M.heavyLine : M.line}</p>
        ${opts.lastText ? `<p class="f3-note">${opts.lastText}</p>` : ''}
        <button class="btn wide f3-ritual-btn" data-f3ritual>${ui.ritual ? 'Hide the ritual' : 'Start the 30-second ritual'}</button>
        <div class="f3-ritual"${ui.ritual ? '' : ' hidden'}>
          <div class="f3-pacer"><div class="f3-dot"></div><div><b>Breathe with the circle</b><span>In 4 s · out 6 s</span></div></div>
          <ol>${M.ritual.map(r => `<li>${r}</li>`).join('')}</ol>
          <div class="f3-watch"><b>Apple Watch</b>${M.watch}</div>
        </div>`;
    }
    for (const k of Object.keys(refs)) delete refs[k];
    panel.querySelectorAll('[data-r]').forEach(e => refs[e.dataset.r] = e);
    refs._key = null;
  }
  renderPanel();

  function setMode(m) {
    ui.mode = m; if (m !== 'muscles') ui.fault = false;
    host.querySelectorAll('[data-f3mode]').forEach(b => b.setAttribute('aria-selected', b.dataset.f3mode === m));
    renderPanel(); setView(MODE_VIEW[m]);
  }
  function setView(v) {
    ui.view = v; host.querySelectorAll('[data-f3view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.f3view === v));
    if (api) api.flyTo(VIEWS[v]);
  }
  const onClick = e => {
    const b = e.target.closest('button'); if (!b || !host.contains(b)) return;
    const d = b.dataset;
    if (d.f3mode) setMode(d.f3mode);
    else if (d.f3view) setView(d.f3view);
    else if ('f3play' in d) { ui.playing = !ui.playing; setPlayIcon(); }
    else if ('f3fault' in d) { ui.fault = !ui.fault; renderPanel(); if (ui.fault) { setView('top'); stage.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); } }
    else if (d.f3focus) { ui.focus = d.f3focus; renderPanel(); }
    else if ('f3ritual' in d) { ui.ritual = !ui.ritual; renderPanel(); }
  };
  host.addEventListener('click', onClick);

  // ---------- 3D ----------
  loadThree().then(THREE => { if (alive) { api = build(THREE); $h('.f3-load').hidden = true; } })
    .catch(() => { const l = $h('.f3-load'); if (l) l.textContent = 'The 3D model could not load. Check your connection and reopen this exercise.'; });

  function build(THREE) {
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
    const cs = getComputedStyle(host), cv = (k, d) => (cs.getPropertyValue(k) || '').trim() || d;
    const dark = new THREE.Color(cv('--scene', '#ebe8e1')).getHSL({}).l < .3;
    const ACC = new THREE.Color(cv('--muscle', '#34c759')), RED = new THREE.Color(cv('--danger', '#ff3b30')), LUNG = new THREE.Color(cv('--lung', '#ff375f')), SKY = new THREE.Color(cv('--mind', '#32ade6'));
    const MARBLE = new THREE.Color(dark ? '#e7e4dc' : '#f4f2ee'), DEEP = new THREE.Color(dark ? '#145c2c' : '#1f8a43');
    const SCENE = cv('--scene', '#e8e8ed'), FLOOR = cv('--floor', '#d9d9df');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = dark ? 1 : .92; renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(SCENE); scene.fog = new THREE.Fog(SCENE, 5, 11);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 50);
    scene.add(new THREE.HemisphereLight('#eef0f5', dark ? '#0b0d10' : '#b9bcc4', dark ? .75 : .9));
    const key = new THREE.DirectionalLight('#fff4e6', 2.6); key.position.set(1.6, 4.2, 2.2); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: .5, far: 10 }); key.shadow.bias = -0.0005; scene.add(key);
    const rim = new THREE.DirectionalLight(dark ? '#9fd8ff' : '#ffffff', dark ? 1.4 : .9); rim.position.set(-2.5, 1.6, -2.4); scene.add(rim);
    const fill = new THREE.DirectionalLight('#d6e2ff', 0.55); fill.position.set(-1, 1.2, 3); scene.add(fill);

    const std = (c, r = .5, m = 0, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, extra));
    const marble = std(MARBLE.clone(), .48), iron = std(dark ? '#1c1e20' : '#3a3c40', .5, .5), pad = std(dark ? '#232528' : '#2c2e32', .9), chrome = std('#cfd3d2', .3, .55), plateMat = std('#121413', .6, .3, { transparent: true });
    const sh = m => { m.castShadow = true; m.receiveShadow = true; return m; };
    const add = m => { scene.add(m); return m; };
    const plinth = add(new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.8, .06, 72), std(FLOOR, .85))); plinth.position.set(.25, -.03, 0); plinth.receiveShadow = true;
    const ring = add(new THREE.Mesh(new THREE.TorusGeometry(1.76, .004, 8, 140), new THREE.MeshBasicMaterial({ color: ACC, transparent: true, opacity: .45 }))); ring.rotation.x = Math.PI / 2; ring.position.set(.25, .001, 0);
    const floor = add(new THREE.Mesh(new THREE.PlaneGeometry(30, 30), std(SCENE, 1))); floor.rotation.x = -Math.PI / 2; floor.position.y = -.06; floor.receiveShadow = true;

    function capsuleGeo(L, r1, r2, seg = 24) {
      const pts = [], n = 9;
      for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i / n * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r1 + 1e-4, Math.sin(a) * r1)); }
      for (let i = 0; i <= n; i++) { const a = i / n * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r2 + 1e-4, L + Math.sin(a) * r2)); }
      return new THREE.LatheGeometry(pts, seg);
    }
    const UP = V3(0, 1, 0);
    const place = (m, a, b) => { m.position.copy(a); m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize()); };
    const seg = (L, r1, r2, mat = marble) => add(sh(new THREE.Mesh(capsuleGeo(L, r1, r2), mat)));
    const ellip = (sx, sy, sz, mat = marble) => { const m = add(sh(new THREE.Mesh(new THREE.SphereGeometry(1, 36, 24), mat))); m.scale.set(sx, sy, sz); return m; };

    // bench + rack
    const BT = .45;
    const box = (w, h, d, mat, x, y, z) => { const m = add(sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat))); m.position.set(x, y, z); return m; };
    box(1.18, .07, .29, pad, .18, BT - .035, 0); box(1, .05, .08, iron, .18, BT - .1, 0);
    for (const x of [-.3, .66]) { box(.06, BT - .1, .06, iron, x, (BT - .1) / 2, 0); box(.07, .04, .5, iron, x, .02, 0); }
    for (const z of [-.55, .55]) { box(.06, 1.25, .06, iron, -.42, .625, z); box(.09, .03, .05, iron, -.375, 1.06, z); box(.4, .04, .08, iron, -.42, .02, z); }
    // bar
    const bar = add(new THREE.Group());
    const cyl = (r, h, mat, z) => { const m = sh(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat)); m.rotation.x = Math.PI / 2; m.position.z = z; bar.add(m); return m; };
    cyl(.0125, 2.1, chrome, 0);
    for (const s of [-1, 1]) { cyl(.025, .4, chrome, s * .86); cyl(.04, .03, chrome, s * .66); cyl(.225, .045, plateMat, s * .71); cyl(.17, .03, plateMat, s * .755); }

    // body
    const SH = { y: .575, half: .19 }, LU = .29, LF = .27;
    const torsoMat = marble.clone(); torsoMat.transparent = true;
    {
      const prof = [[0, 0], [.004, .08], [.03, .15], [.07, .195], [.12, .205], [.2, .19], [.3, .165], [.38, .14], [.44, .138], [.5, .15], [.56, .165], [.61, .16], [.655, .12], [.675, .05], [.68, 0]];
      const torso = sh(new THREE.Mesh(new THREE.LatheGeometry(prof.map(([s, r]) => new THREE.Vector2(r + 1e-4, s)), 48), torsoMat));
      torso.rotation.z = -Math.PI / 2; const g = add(new THREE.Group()); g.add(torso); g.position.set(-.1, SH.y, 0); g.scale.set(1, .6, 1);
    }
    place(seg(.1, .05, .048), V3(-.08, .565, 0), V3(-.18, .55, 0));
    const headMat = std(MARBLE.clone(), .48, 0, { emissive: SKY.clone(), emissiveIntensity: 0 });
    const head = ellip(.1, .092, .085, headMat); head.position.set(-.255, BT + .095, 0);
    ellip(.06, .05, .065, headMat).position.set(-.235, BT + .13, 0);
    const deltCap = [ellip(.07, .065, .062), ellip(.07, .065, .062)];
    const arms = [1, -1].map(s => ({ s, S: V3(0, SH.y, s * SH.half), up: seg(LU, .052, .042), fo: seg(LF - .03, .041, .031), ej: ellip(.042, .042, .042), hd: ellip(.045, .038, .05), E: V3(0, 0, 0), H: V3(0, 0, 0) }));
    for (const s of [1, -1]) {
      const hip = V3(.5, .56, s * .1), knee = V3(.9, .53, s * .19), ank = V3(.84, .085, s * .25);
      place(seg(hip.distanceTo(knee), .085, .058), hip, knee); place(seg(knee.distanceTo(ank), .056, .036), knee, ank);
      ellip(.058, .058, .058).position.copy(knee);
      place(add(sh(new THREE.Mesh(capsuleGeo(.17, .035, .03), marble))), V3(.81, .04, s * .25), V3(1, .035, s * .27));
      ellip(.12, .07, .1).position.set(.5, .52, s * .085);
    }
    // muscles
    const mm = () => std(MARBLE.clone(), .42, 0, { emissive: ACC.clone(), emissiveIntensity: 0, transparent: true });
    const M = { pec: mm(), delt: mm(), tri: mm() };
    const pecs = [1, -1].map(s => { const m = ellip(.088, .03, .092, M.pec); m.position.set(.07, SH.y + .1, s * .092); m.rotation.set(s * .16, s * .4, .05); return m; });
    const delts = [1, -1].map(() => ellip(.055, .04, .045, M.delt));
    const tris = [1, -1].map(() => add(sh(new THREE.Mesh(capsuleGeo(.16, .034, .026), M.tri))));
    const gc = document.createElement('canvas'); gc.width = gc.height = 128; { const g = gc.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
    const GT = new THREE.CanvasTexture(gc);
    const sprite = (size, color, additive = true) => { const s = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color, transparent: true, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false, opacity: 0 }))); s.scale.set(size, size, 1); return s; };
    const halos = { pec: [sprite(.34, ACC), sprite(.34, ACC)], delt: [sprite(.16, ACC), sprite(.16, ACC)], tri: [sprite(.2, ACC), sprite(.2, ACC)] };

    // overlays
    const ov = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthTest: false, depthWrite: false });
    const tube = (pts, r) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(8, pts.length * 2), r, 8, false);
    const T = spec.tempo, REP = T.hold_top + T.lower + T.pause + T.press, P = spec.params;
    function depthAt(tt) {
      if (tt < T.hold_top) return 0;
      if (tt < T.hold_top + T.lower) return ease((tt - T.hold_top) / T.lower);
      if (tt < T.hold_top + T.lower + T.pause) return 1;
      const k = (tt - T.hold_top - T.lower - T.pause) / T.press; return 1 - (1 - Math.pow(1 - k, 2.2));
    }
    const phaseAt = tt => tt < T.hold_top ? 'LOCKOUT' : tt < T.hold_top + T.lower ? 'LOWER' : tt < T.hold_top + T.lower + T.pause ? 'PAUSE' : 'PRESS';
    const barPos = p => V3(lerp(-.005, P.touch_x, p) + .018 * Math.sin(Math.PI * p), lerp(SH.y + LU + LF - .02, SH.y + .155, p), 0);
    const pathPts = Array.from({ length: 41 }, (_, i) => { const b = barPos(i / 40); return V3(b.x, b.y, .42); });
    const pathMesh = add(new THREE.Mesh(tube(pathPts, .0055), ov(ACC, 0))); pathMesh.renderOrder = 10;
    const pathDot = add(new THREE.Mesh(new THREE.SphereGeometry(.014, 14, 10), ov('#ffffff', 0))); pathDot.renderOrder = 11;
    const dashes = Array.from({ length: 12 }, () => { const d = add(new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, .028, 6), ov(ACC, 0))); d.renderOrder = 10; return d; });
    const arcMesh = add(new THREE.Mesh(new THREE.BufferGeometry(), ov(ACC, 0))); arcMesh.renderOrder = 10;
    const armAxis = add(new THREE.Mesh(new THREE.BufferGeometry(), ov(ACC, 0))); armAxis.renderOrder = 10;
    const torsoAxis = add(new THREE.Mesh(new THREE.BufferGeometry(), ov('#ffffff', 0))); torsoAxis.renderOrder = 10;
    const zone = add(new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: ACC, transparent: true, opacity: 0, depthTest: false, depthWrite: false, side: THREE.DoubleSide }))); zone.renderOrder = 9;
    // lungs
    const lungMat = std('#ff5a66', .5, 0, { emissive: LUNG.clone(), emissiveIntensity: .4, transparent: true, opacity: 0 });
    const lungs = [1, -1].map(s => { const m = add(new THREE.Mesh(new THREE.SphereGeometry(1, 36, 24), lungMat)); m.renderOrder = 2; return { m, s }; });
    const airMat = std('#ff8a93', .5, 0, { emissive: LUNG.clone(), emissiveIntensity: .3, transparent: true, opacity: 0 });
    const airway = [add(new THREE.Mesh(capsuleGeo(.15, .011, .011), airMat))]; place(airway[0], V3(-.15, .578, 0), V3(-.02, .585, 0));
    for (const s of [1, -1]) { const b = add(new THREE.Mesh(capsuleGeo(.06, .008, .007), airMat)); place(b, V3(-.02, .585, 0), V3(.035, .588, s * .045)); airway.push(b); }
    const braceMat = new THREE.MeshBasicMaterial({ color: LUNG, transparent: true, opacity: 0, depthWrite: false });
    const braceRings = [.33, .43].map(x => { const r = add(new THREE.Mesh(new THREE.TorusGeometry(.152, .0042, 10, 90), braceMat)); r.rotation.y = Math.PI / 2; r.position.set(x, SH.y, 0); r.renderOrder = 3; return r; });
    const puffs = Array.from({ length: 7 }, () => sprite(.05, '#ffc4ca', false));
    const MOUTH = V3(-.27, .64, 0);
    // mind
    const headHalo = sprite(.5, SKY);
    let mindLine = add(new THREE.Mesh(new THREE.BufferGeometry(), ov(SKY, 0))); mindLine.renderOrder = 10;
    const sparks = Array.from({ length: 6 }, () => { const m = add(new THREE.Mesh(new THREE.SphereGeometry(.009, 10, 8), ov('#e6f8ff', 0))); m.renderOrder = 11; return m; });

    function ik(S, H, a, b, pole) {
      const d = H.clone().sub(S); let L = Math.min(d.length(), a + b - 1e-4); const dir = d.normalize();
      const x = (a * a - b * b + L * L) / (2 * L), h = Math.sqrt(Math.max(0, a * a - x * x));
      const pp = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
      return S.clone().add(dir.clone().multiplyScalar(x)).add(pp.multiplyScalar(h));
    }
    const poleFor = (flare, s) => { const th = flare * Math.PI / 180; return V3(Math.cos(th), -.55, s * Math.sin(th)).normalize(); };

    // camera
    const cam = { az: 32, el: 22, R: 3.4, tgt: V3(.26, .55, 0) };
    let fly = null;
    const flyTo = v => { const from = { az: cam.az, el: cam.el, R: cam.R, tgt: cam.tgt.clone() }; let daz = ((v.az - from.az) % 360 + 540) % 360 - 180; fly = { from, to: { az: from.az + daz, el: v.el, R: v.R, tgt: V3(...v.tgt) }, t0: performance.now(), dur: reduced() ? 1 : 750 }; };
    Object.assign(cam, { az: VIEWS.hero.az, el: VIEWS.hero.el, R: VIEWS.hero.R, tgt: V3(...VIEWS.hero.tgt) });
    // drag to orbit
    let drag = null;
    const pd = e => { drag = { x: e.clientX, y: e.clientY, az: cam.az, el: cam.el }; fly = null; try { canvas.setPointerCapture(e.pointerId); } catch (x) { } };
    const pm = e => { if (!drag) return; cam.az = drag.az - (e.clientX - drag.x) * .45; cam.el = clamp(drag.el + (e.clientY - drag.y) * .3, -4, 88); host.querySelectorAll('[data-f3view]').forEach(b => b.setAttribute('aria-pressed', 'false')); };
    const pu = () => { drag = null; };
    canvas.addEventListener('pointerdown', pd); canvas.addEventListener('pointermove', pm); canvas.addEventListener('pointerup', pu); canvas.addEventListener('pointercancel', pu);
    const onWheel = e => { e.preventDefault(); cam.R = clamp(cam.R * (1 + e.deltaY * .001), 1.4, 5); };
    canvas.addEventListener('wheel', onWheel, { passive: false });

    let W = 0, H = 0;
    const resize = () => { W = stage.clientWidth; H = stage.clientHeight; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(stage); resize();

    // labels
    const labels = {};
    const lab = (id, html, v, op, dx = 0, dy = 0, cls = '') => {
      let e = labels[id]; if (!e) { e = document.createElement('div'); labelsEl.appendChild(e); labels[id] = e; }
      e.className = 'f3-tag ' + cls; if (e._h !== html) { e.innerHTML = html; e._h = html; }
      e.style.opacity = op; if (op <= .01) return;
      const p = v.clone().project(camera), x = (p.x + 1) / 2 * W + dx, y = (1 - p.y) / 2 * H + dy;
      e.style.transform = `translate(${clamp(x, 6, W - e.offsetWidth - 6)}px,${clamp(y, 44, H - e.offsetHeight - 50)}px)`;
    };

    const fade = { glow: 1, lungs: 0, mind: 0, xray: 0, fault: 0 };
    const approach = (k, tgt, dt, tau = .2) => fade[k] += (tgt - fade[k]) * (1 - Math.exp(-dt / tau));
    let t = 0, last = performance.now(), arcKey = '';
    const act = {};

    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (ui.playing) t += dt;
      const tt = t % REP, p = depthAt(tt), ph = phaseAt(tt);
      // camera
      if (fly) { const k = ease(clamp((now - fly.t0) / fly.dur)); cam.az = lerp(fly.from.az, fly.to.az, k); cam.el = lerp(fly.from.el, fly.to.el, k); cam.R = lerp(fly.from.R, fly.to.R, k); cam.tgt.lerpVectors(fly.from.tgt, fly.to.tgt, k); if (k >= 1) fly = null; }
      const az = cam.az * Math.PI / 180, el = cam.el * Math.PI / 180;
      camera.position.set(cam.tgt.x + cam.R * Math.cos(el) * Math.cos(az), cam.tgt.y + cam.R * Math.sin(el), cam.tgt.z + cam.R * Math.cos(el) * Math.sin(az));
      camera.lookAt(cam.tgt);
      const azn = ((cam.az % 360) + 360) % 360;
      const sideW = smooth(30, 10, Math.abs(azn - 90)) * smooth(35, 15, cam.el);
      const topW = smooth(55, 72, cam.el);
      // fades
      approach('glow', ui.mode === 'breath' ? .25 : 1, dt); approach('lungs', ui.mode === 'breath' ? 1 : 0, dt);
      approach('mind', ui.mode === 'mind' ? 1 : 0, dt); approach('fault', ui.fault ? 1 : 0, dt, .3);
      approach('xray', Math.max(sideW, fade.lungs > .5 ? 0 : 0), dt);
      const mus = ui.mode === 'muscles' ? 1 : 0;
      // pose
      const flare = lerp(P.flare, P.fault_flare, fade.fault);
      const B = barPos(p); bar.position.copy(B);
      for (const A of arms) {
        A.H.set(B.x, B.y, A.s * P.grip);
        A.E.copy(ik(A.S, A.H, LU, LF, poleFor(flare, A.s)));
        place(A.up, A.S, A.E); const w = A.H.clone().sub(A.E).normalize().multiplyScalar(LF - .03).add(A.E); place(A.fo, A.E, w);
        A.ej.position.copy(A.E); A.hd.position.copy(A.H).add(V3(0, .012, 0)); A.hd.quaternion.copy(A.fo.quaternion);
      }
      arms.forEach((A, i) => {
        const d = A.E.clone().sub(A.S).normalize();
        deltCap[i].position.copy(A.S).addScaledVector(d, .02).add(V3(0, 0, A.s * .01)); deltCap[i].quaternion.setFromUnitVectors(UP, d);
        delts[i].position.copy(A.S).add(V3(.01, .045, 0)).addScaledVector(d, .035); delts[i].quaternion.setFromUnitVectors(UP, d);
        const fd = A.H.clone().sub(A.E).normalize(); let n = fd.clone().sub(d.clone().multiplyScalar(fd.dot(d))); if (n.length() < .15) n.set(-1, 0, 0); n.normalize();
        const a0 = A.S.clone().addScaledVector(d, .08).addScaledVector(n, -.03), a1 = A.S.clone().addScaledVector(d, .25).addScaledVector(n, -.028);
        place(tris[i], a0, a1);
        halos.tri[i].position.copy(a0.clone().lerp(a1, .5)); halos.delt[i].position.copy(delts[i].position); halos.pec[i].position.copy(pecs[i].position).add(V3(0, .02, 0));
      });
      // muscles
      for (const m of spec.muscles) act[m.id] = curveAt(m.curve, tt);
      const xr = 1 - .85 * fade.xray; plateMat.opacity = xr; plateMat.depthWrite = xr > .95;
      for (const m of spec.muscles) {
        const focusBoost = ui.mode === 'mind' ? (m.id === 'pec' && ui.focus === 'muscle' ? 1.2 : .3) : 1;
        let a = act[m.id] * fade.glow * focusBoost * (m.id === 'pec' ? 1 : .85);
        const bad = m.id === 'delt' && fade.fault > .5;
        if (bad) a = Math.max(a, .9);
        const col = bad ? RED : ACC, mat = M[m.id];
        mat.emissive.copy(col); mat.emissiveIntensity = 3.2 * a; mat.color.copy(MARBLE).lerp(bad ? RED : DEEP, clamp(a));
        halos[m.id].forEach(h => { h.material.color.copy(col); h.material.opacity = .75 * clamp(a); });
      }
      // lungs
      const lo = fade.lungs, B2 = spec.breath, bph = B2.phases.find(q => tt >= q.start && tt < q.end) || B2.phases[B2.phases.length - 1], bk = (tt - bph.start) / (bph.end - bph.start);
      const vol = curveAt(B2.volume, tt), brace = bph.mode === 'brace' ? smooth(0, .08, bk) * (1 - smooth(.92, 1, bk)) : 0;
      torsoMat.opacity = 1 - .66 * lo; torsoMat.depthWrite = lo < .05;
      M.pec.opacity = 1 - .5 * lo; M.pec.depthWrite = lo < .05;
      lungs.forEach(({ m, s }) => { m.visible = lo > .01; m.scale.set(.105 + .03 * vol, .05 + .016 * vol, .055 + .014 * vol); m.position.set(.1 + .03 * vol, .59, s * (.07 + .006 * vol)); m.rotation.set(0, s * .12, 0); });
      lungMat.opacity = .92 * lo; lungMat.emissiveIntensity = .35 + .9 * brace + .15 * Math.sin(now / 110) * brace;
      airMat.opacity = .85 * lo; airway.forEach(x => x.visible = lo > .01);
      braceMat.opacity = lo * brace * .6; braceRings.forEach((r, i) => { const k = 1.03 - .03 * brace + .01 * Math.sin(now / 110 + i); r.scale.set(k, .64 * k, k); });
      puffs.forEach((q, i) => { let o = 0; if (bph.mode === 'exhale') { const z = (bk + i / puffs.length) % 1; q.position.copy(MOUTH).add(V3(-.1 * z, .16 * z, (i % 2 ? 1 : -1) * .03 * z)); q.scale.setScalar(.03 + .07 * z); o = (1 - z) * .7; } q.material.opacity = lo * o; });
      // mind
      const mo = fade.mind;
      headMat.color.copy(MARBLE).lerp(SKY, .55 * mo); headMat.emissiveIntensity = mo * (.55 + .25 * Math.sin(now / 330));
      headHalo.position.copy(head.position).add(V3(0, .04, 0)); headHalo.material.opacity = mo * .7;
      const end = ui.focus === 'bar' ? V3(B.x, B.y + .03, .15) : V3(.07, .735, .092);
      const curve = new THREE.QuadraticBezierCurve3(V3(-.24, .66, .02), V3(-.12, Math.max(1.02, end.y + .2), .1), end);
      if (mo > .01) { mindLine.geometry.dispose(); mindLine.geometry = new THREE.TubeGeometry(curve, 40, .0032, 6, false); }
      mindLine.material.opacity = mo * .75;
      const drive = act.pec || .3;
      sparks.forEach((sp, i) => { const q = ((now / 1000) * (.35 + .6 * drive) + i / sparks.length) % 1; sp.position.copy(curve.getPoint(q)); sp.material.opacity = mo * (.4 + .6 * Math.sin(Math.PI * q)); sp.scale.setScalar(.8 + .8 * drive); });
      // form overlays (muscles mode only, by camera angle)
      const ps = mus * sideW, pt = mus * topW;
      pathMesh.material.opacity = .95 * ps; pathDot.position.set(B.x, B.y, .42); pathDot.material.opacity = ps;
      const A0 = arms[0], fa = A0.H.clone().sub(A0.E), tilt = Math.atan2(Math.abs(fa.x), fa.y) * 180 / Math.PI, okT = tilt < 12;
      const gv = ps * smooth(.8, .97, p);
      dashes.forEach((d, i) => { d.position.set(A0.H.x, A0.H.y + .06 - i * .045, A0.H.z + .06); d.material.opacity = gv; d.material.color.copy(okT ? ACC : RED); });
      const Hb = V3(barPos(1).x, barPos(1).y, P.grip), Eb = ik(A0.S, Hb, LU, LF, poleFor(flare, 1)), upv = Eb.sub(A0.S);
      const fm = Math.atan2(upv.z, upv.x) * 180 / Math.PI, inZone = fm >= 42 && fm <= 63, col = inZone ? ACC : RED;
      const S0 = A0.S.clone().setY(SH.y + .14), k2 = Math.round(fm * 2);
      if (k2 + '' !== arcKey) {
        arcKey = k2 + '';
        const arc = Array.from({ length: 25 }, (_, i) => { const a = fm * Math.PI / 180 * i / 24; return V3(S0.x + .16 * Math.cos(a), S0.y, S0.z + .16 * Math.sin(a)); });
        arcMesh.geometry.dispose(); arcMesh.geometry = tube(arc, .004);
        const v = [S0.x, S0.y, S0.z], idx = []; for (let i = 0; i <= 20; i++) { const a = (45 + 15 * i / 20) * Math.PI / 180; v.push(S0.x + .3 * Math.cos(a), S0.y, S0.z + .3 * Math.sin(a)); if (i) idx.push(0, i, i + 1); }
        const zg = new THREE.BufferGeometry(); zg.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); zg.setIndex(idx); zone.geometry.dispose(); zone.geometry = zg;
        torsoAxis.geometry.dispose(); torsoAxis.geometry = tube([S0, S0.clone().add(V3(.34, 0, 0))], .003);
        armAxis.geometry.dispose(); armAxis.geometry = tube([S0, upv.setY(0).normalize().multiplyScalar(.34).add(S0)], .0045);
      }
      arcMesh.material.color.copy(col); armAxis.material.color.copy(col);
      arcMesh.material.opacity = pt; zone.material.opacity = .18 * pt; torsoAxis.material.opacity = .7 * pt; armAxis.material.opacity = pt;

      renderer.render(scene, camera);

      // labels
      const showM = mus * (1 - Math.max(sideW, topW)) * (fade.fault < .5 ? 1 : 0);
      lab('pec', 'Chest', pecs[1].position.clone().add(V3(0, .05, 0)), showM, 4, -30, 'acc');
      lab('tri', 'Triceps', tris[0].position.clone(), showM, 12, 4, 'acc');
      lab('delt', 'Front delt', delts[0].position.clone(), showM, 10, -30, 'acc');
      lab('path', 'Bar path', pathPts[14], ps, 14, -10);
      lab('fore', okT ? `Forearm ${tilt.toFixed(0)}° from vertical` : `Forearm ${tilt.toFixed(0)}°`, A0.E.clone().add(V3(0, -.02, .06)), gv, 12, 0, okT ? 'acc' : 'bad');
      lab('flare', `${fm.toFixed(0)}° elbow angle`, S0.clone().add(V3(.2 * Math.cos(fm * Math.PI / 360), 0, .2 * Math.sin(fm * Math.PI / 360))), pt, -10, -14, 'big ' + (inZone ? 'acc' : 'bad'));
      lab('zone', '45–60° zone', S0.clone().add(V3(.33 * Math.cos(.91), 0, .33 * Math.sin(.91))), pt * .9, 6, -6, 'acc');
      lab('lung', bph.mode === 'brace' ? 'Lungs full, braced' : bph.mode === 'inhale' ? 'Lungs filling' : 'Lungs emptying', V3(.14, .66, .12), lo, 10, -10, 'lung');
      lab('mind', ui.focus === 'bar' ? 'Focus: the bar' : 'Focus: the chest', V3(-.12, 1.0, .1), mo, -40, -30, 'sky');

      // panel live parts
      if (ui.mode === 'muscles' && refs.phase) {
        const key = ph + (fade.fault > .5);
        if (refs._key !== key) { refs._key = key; refs.phase.textContent = ph[0] + ph.slice(1).toLowerCase(); refs.cue.textContent = fade.fault > .5 ? spec.fault : spec.phaseCue[ph]; }
        for (const m of spec.muscles) if (refs['m-' + m.id]) refs['m-' + m.id].style.width = (act[m.id] * 100).toFixed(0) + '%';
      } else if (ui.mode === 'breath' && refs.bmode) {
        if (refs._key !== bph.mode) { refs._key = bph.mode; refs.bmode.textContent = B2.label[bph.mode]; refs.btip.textContent = B2.tip[bph.mode]; panel.dataset.b = bph.mode; }
        refs.bhead.style.left = (tt / REP * 100).toFixed(2) + '%';
      } else if (ui.mode === 'mind' && refs.pulse) {
        refs.pulse.style.transform = `scale(${1 + .35 * drive})`;
      }
    }
    raf = requestAnimationFrame(frame);
    destroyFns.push(() => {
      cancelAnimationFrame(raf); ro.disconnect();
      canvas.removeEventListener('wheel', onWheel);
      scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
      GT.dispose(); renderer.dispose();
    });
    return { flyTo };
  }

  return {
    host,
    destroy() { alive = false; host.removeEventListener('click', onClick); destroyFns.forEach(f => { try { f(); } catch (e) { } }); }
  };
}
})();
