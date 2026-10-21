// ================= Interface =================
GOALS.P = 'Agility';
const GOAL_TABS = [['S', 'Strength'], ['E', 'Endurance'], ['P', 'Agility'], ['M', 'Mobility'], ['F', 'Stretch']];
Object.assign(S, { mind: [], tab: 'body', stack: [], goal: 'S', showAll: false, prog: 'ex', pex: null, openG: null, openPG: null });
const ICON = {
  chev: '<svg class="chev" viewBox="0 0 8 14"><path d="M1 1l6 6-6 6"/></svg>',
  back: '<svg viewBox="0 0 10 17"><path d="M9 1L1.5 8.5 9 16"/></svg>',
  x: '<svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  play: '<svg viewBox="0 0 12 14"><path d="M0 0l12 7-12 7z"/></svg>'
};

// ---------- appearance ----------
const Theme = {
  key: 'sculptor.appearance',
  get() { try { return localStorage.getItem(this.key) || 'auto'; } catch (e) { return 'auto'; } },
  set(v) { try { localStorage.setItem(this.key, v); } catch (e) { } this.apply(); },
  apply() { const v = this.get(), r = document.documentElement; r.classList.toggle('ap-dark', v === 'dark'); r.classList.toggle('ap-light', v === 'light'); if (window.Form3D) Form3D.remount(); }
};
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => window.Form3D && Form3D.remount()); } catch (e) { }
new MutationObserver(() => window.Form3D && Form3D.remount()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

// ---------- colour ----------
const devOf = m => { const a = C.mus[m]; return a.s ?? a.e; };
const fillFor = m => { const v = devOf(m); return v == null ? 'var(--m0)' : `color-mix(in srgb, var(--dev) ${Math.round(24 + v * .7)}%, var(--m0))`; };
const colorFor = fillFor;

// ---------- map ----------
const OUTLINE_D = outlinePath();
const PATHS = {};
for (const v of ['front', 'back']) PATHS[v] = Object.entries(REGIONS[v]).map(([k, pts]) => [k, smoothPath(pts), smoothPath(mirror(pts))]);
function mapSVG() {
  const vb = S.vb;
  let s = `<svg id="map" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" role="img" aria-label="${S.view === 'front' ? 'Front' : 'Back'} of the body"><path class="sil" d="${OUTLINE_D}"/><ellipse class="sil" cx="${HEAD.cx}" cy="${HEAD.cy}" rx="${HEAD.rx}" ry="${HEAD.ry}"/>`;
  for (const [k, a, b] of PATHS[S.view]) {
    const sel = S.sel === k ? ' sel' : '', t = `<title>${esc(plain(k))}</title>`;
    s += `<path class="mz${sel}" data-m="${k}" d="${a}" style="fill:${fillFor(k)}">${t}</path><path class="mz${sel}" data-m="${k}" d="${b}" style="fill:${fillFor(k)}">${t}</path>`;
  }
  return s + '</svg>';
}
const ZOOM_IN = 2.4;
const clampVB = v => ({ ...v, x: Math.max(0, Math.min(200 - v.w, v.x)), y: Math.max(0, Math.min(430 - v.h, v.y)) });
const reduceMotion = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
let vbAnim = 0;
function applyVB() { const m = $('#map'); if (m) { m.setAttribute('viewBox', `${S.vb.x} ${S.vb.y} ${S.vb.w} ${S.vb.h}`); m.style.touchAction = S.zoom > 1 ? 'none' : 'pan-y'; } }
function setZoom(z, cx = 100, cy = 215) {
  S.zoom = Math.max(1, Math.min(3, z));
  const w = 200 / S.zoom, h = 430 / S.zoom, to = clampVB({ x: cx - w / 2, y: cy - h / 2, w, h }), from = { ...S.vb };
  cancelAnimationFrame(vbAnim); updateZoomUI();
  if (reduceMotion()) { S.vb = to; applyVB(); return; }
  const t0 = performance.now(), dur = 300;
  const step = now => { const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3); S.vb = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e }; applyVB(); if (t < 1) vbAnim = requestAnimationFrame(step); };
  vbAnim = requestAnimationFrame(step);
}
function updateZoomUI() { const r = $('#zoomReset'), h = $('#mapHint'); if (r) r.hidden = S.zoom === 1; if (h) h.textContent = S.zoom === 1 ? 'Tap an area to zoom in.' : 'Tap a muscle. Drag to move around.'; }
function bindMap() {
  const m = $('#map'); if (!m) return;
  m.style.touchAction = S.zoom > 1 ? 'none' : 'pan-y';
  let down = null;
  m.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, vb: { ...S.vb }, moved: false }; if (S.zoom > 1) { try { m.setPointerCapture(e.pointerId); } catch (x) { } } });
  m.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y; if (Math.hypot(dx, dy) > 8) down.moved = true; if (S.zoom > 1 && down.moved) { const k = S.vb.w / m.getBoundingClientRect().width; S.vb = clampVB({ ...down.vb, x: down.vb.x - dx * k, y: down.vb.y - dy * k }); applyVB(); } });
  m.addEventListener('pointercancel', () => { down = null; });
  m.addEventListener('pointerup', e => {
    const d = down; down = null; if (!d || d.moved) return;
    const r = m.getBoundingClientRect(), k = S.vb.w / r.width, sx = S.vb.x + (e.clientX - r.left) * k, sy = S.vb.y + (e.clientY - r.top) * k;
    if (S.zoom === 1) { setZoom(ZOOM_IN, sx, sy); return; }
    const t = document.elementFromPoint(e.clientX, e.clientY), id = t && t.dataset ? t.dataset.m : null;
    if (id) openMuscle(id);
  });
}
function paintMap() { document.querySelectorAll('#map .mz').forEach(p => { const k = p.dataset.m; p.style.fill = fillFor(k); p.classList.toggle('sel', S.sel === k); }); }

// ---------- ranking ----------
const STAPLE = new Set('bench_press db_bench incline_bench incline_db machine_chest cable_fly push_up chest_dip ohp db_shoulder_press lateral_raise cable_lateral face_pull rear_delt_fly reverse_pec_deck pull_up chin_up lat_pulldown cable_row db_row bent_row chest_supported_row barbell_curl db_curl hammer_curl incline_curl pushdown rope_pushdown skull_crusher oh_extension cg_bench back_squat front_squat goblet_squat leg_press bss walking_lunge split_squat rdl deadlift trap_bar_dl hip_thrust glute_bridge lying_leg_curl seated_leg_curl nordic leg_ext standing_calf seated_calf sl_calf plank side_plank hlr cable_crunch pallof ab_wheel dead_bug hip_abduction cable_abduction sidelying_abd copenhagen hip_adduction lateral_lunge cossack step_up farmer_carry suitcase_carry barbell_shrug db_shrug cable_er sidelying_er band_pull_apart prone_y tib_raise wrist_curl rev_wrist_curl back_ext kb_swing box_jump broad_jump lateral_bound split_step ghost_drill skater_hops lateral_shuffle jump_rope pogo couch_stretch kneeling_hf pigeon ham_stretch calf_stretch doorway_stretch lat_stretch hip_cars shoulder_cars cat_cow wgs hip_9090 thoracic_ext open_book band_dislocates wall_slides sleeper_stretch cross_body quad_stretch butterfly frog_stretch knee_to_wall ankle_cars neck_iso chin_tuck neck_stretch med_ball_rot woodchop'.split(' '));
const NICHE = /eccentric|paused|pause |banded|band-resisted|deficit|2-1-1|1\.5-rep|alternating|single-leg single-arm|\+|iso hold|isometric hold|dynamic|reactive|seated vertical|rocket/i;
function historyOf() {
  const h = {};
  for (const s of allSets()) { const o = h[s.ex] || (h[s.ex] = { n: 0, last: 0, days: new Set() }); o.days.add(new Date(s.t).toDateString()); o.last = Math.max(o.last, s.t); }
  for (const k in h) h[k].n = h[k].days.size;
  return h;
}
function rankFor(m, g) {
  const logged = new Set(allSets().map(s => s.ex));
  const score = e => {
    let v = e.pri.includes(m) ? 10 : 0;
    v += e.goals[0] === g ? 2 : 0;
    v += 1.5 / e.pri.length;
    if (g === 'S' && e.std) v += e.std.includes('*') ? 1 : 2;
    if (g === 'S' && (e.eq === 'barbell' || e.eq === 'dumbbell')) v += 1;
    if (g === 'E' && e.estd) v += 1;
    if (VIDEO[e.id]) v += 1;
    if (window.Form3D && Form3D.has(e.id)) v += 1;
    if (logged.has(e.id)) v += .5;
    if (STAPLE.has(e.id)) v += 2.5;
    if (NICHE.test(e.name)) v -= 1.5;
    return v;
  };
  return EX.filter(e => e.goals.includes(g) && (e.pri.includes(m) || e.sec.includes(m))).map(e => [score(e), e]).sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name)).map(x => x[1]);
}
const cleanName = n => n.replace(/ \((per hand|per side|single arm|barbell)\)/i, '');
const dayLabel = t => { const d = Math.floor((new Date(new Date().toDateString()) - new Date(new Date(t).toDateString())) / DAY); return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : d < 7 ? `${d} days ago` : new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); };

// ---------- Body ----------
function viewBody() {
  const groups = Object.keys(GROUPS).map(g => {
    const ms = Object.keys(MUSCLES).filter(m => MUSCLES[m][1] === g), vals = ms.map(devOf).filter(v => v != null);
    const v = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null, open = S.openG === g;
    return `<div class="${open ? 'open' : ''}"><button class="row" data-g="${g}"><span class="dot" style="background:${v == null ? 'var(--m0)' : `color-mix(in srgb, var(--dev) ${Math.round(24 + v * .7)}%, var(--m0))`}"></span><span class="grow"><span class="t">${GROUPS[g]}</span></span><span class="v">${ms.length}</span>${ICON.chev}</button>
      ${open ? `<div class="sub">${ms.map(m => `<button class="row" data-m="${m}"><span class="grow"><span class="t">${esc(plain(m))}</span><span class="d">${esc(MUSCLES[m][0])}</span></span>${ICON.chev}</button>`).join('')}</div>` : ''}</div>`;
  }).join('');
  return `<header class="lt"><div class="brand">SCULPTOR</div></header><div class="meander" aria-hidden="true"></div>
  <section><div class="mapcard glass"><div class="seg mapseg" role="tablist" aria-label="Side">${['front', 'back'].map(v => `<button role="tab" aria-selected="${S.view === v}" data-side="${v}">${v === 'front' ? 'Front' : 'Back'}</button>`).join('')}</div>${mapSVG()}<div class="plinth" aria-hidden="true"><span>ΓΝΩΘΙ ΣΑΥΤΟΝ</span></div><button id="zoomReset" class="zoomreset glass" data-act="zoom-reset"${S.zoom === 1 ? ' hidden' : ''}>Full body</button></div>
    <p class="hint" id="mapHint">${S.zoom === 1 ? 'Tap an area to zoom in.' : 'Tap a muscle. Drag to move around.'}</p>
    <div class="key" aria-hidden="true"><span>Untrained</span><i></i><span>Strong</span></div></section>
  <section><h2 class="lh">All muscles</h2><div class="list">${groups}</div></section>`;
}

// ---------- Progress ----------
function valueOf(ex, s) {
  if (ex.std) { const v = e1rm(ex, s); if (v) return [v, 'kg', 'Estimated max']; }
  if (ex.mode === 'time' || ex.mode === 'loadtime') return [s.s || 0, 's', 'Time'];
  if (ex.mode === 'reps' || ex.mode === 'bw') return [s.r || 0, 'reps', 'Reps'];
  return [s.w || 0, 'kg', 'Weight'];
}
function seriesFor(id) {
  const ex = EXI[id], by = {};
  for (const s of allSets()) if (s.ex === id) { const k = new Date(s.t).toDateString(), [v] = valueOf(ex, s); if (!by[k] || v > by[k].v) by[k] = { t: new Date(k).getTime(), v }; }
  return Object.values(by).sort((a, b) => a.t - b.t);
}
function spark(pts) {
  if (pts.length < 2) return `<svg class="spark" viewBox="0 0 72 28" aria-hidden="true"><circle cx="66" cy="14" r="2.6"/></svg>`;
  const lo = Math.min(...pts.map(p => p.v)), hi = Math.max(...pts.map(p => p.v)), t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const X = t => 4 + (t1 > t0 ? (t - t0) / (t1 - t0) : 1) * 62, Y = v => hi > lo ? 24 - (v - lo) / (hi - lo) * 20 : 14;
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.t).toFixed(1)} ${Y(p.v).toFixed(1)}`).join('');
  const l = pts[pts.length - 1];
  return `<svg class="spark" viewBox="0 0 72 28" aria-hidden="true"><path d="${d}"/><circle cx="${X(l.t).toFixed(1)}" cy="${Y(l.v).toFixed(1)}" r="2.6"/></svg>`;
}
function chart(pts, unit) {
  const W = 340, H = 150, L = 36, R = 10, T = 12, B = 24;
  if (!pts.length) return '';
  let lo = Math.min(...pts.map(p => p.v)), hi = Math.max(...pts.map(p => p.v));
  if (hi === lo) { lo = lo * .9; hi = hi * 1.1 || 1; }
  const pad = (hi - lo) * .12; lo = Math.max(0, lo - pad); hi += pad;
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const X = t => L + (t1 > t0 ? (t - t0) / (t1 - t0) : .5) * (W - L - R), Y = v => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const fmt = v => unit === 'kg' ? r1(v) : Math.round(v);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.t).toFixed(1)} ${Y(p.v).toFixed(1)}`).join('');
  const area = pts.length > 1 ? `${line}L${X(t1).toFixed(1)} ${H - B}L${X(t0).toFixed(1)} ${H - B}Z` : '';
  const dl = t => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Progress chart">
    <line class="gl" x1="${L}" x2="${W - R}" y1="${Y(hi)}" y2="${Y(hi)}"/><line class="gl" x1="${L}" x2="${W - R}" y1="${Y(lo)}" y2="${Y(lo)}"/>
    <text x="${L - 6}" y="${Y(hi) + 4}" text-anchor="end">${fmt(hi)}</text><text x="${L - 6}" y="${Y(lo) + 4}" text-anchor="end">${fmt(lo)}</text>
    ${area ? `<path class="ar" d="${area}"/>` : ''}${pts.length > 1 ? `<path class="ln" d="${line}"/>` : ''}
    ${pts.map(p => `<circle class="pt" cx="${X(p.t).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="3.5"/>`).join('')}
    <text x="${L}" y="${H - 6}">${dl(t0)}</text>${t1 > t0 ? `<text x="${W - R}" y="${H - 6}" text-anchor="end">${dl(t1)}</text>` : ''}</svg>`;
}
function viewProgress() {
  const sets = allSets(), head = `<header class="lt"><div class="brand">SCULPTOR</div><button class="iconbtn glass" data-act="settings" aria-label="Settings">${ICON.gear}</button></header><div class="meander" aria-hidden="true"></div>`;
  const notice = S.sample ? `<div class="notice glass"><span>Showing sample data</span><button class="link" data-act="sample-off">Exit</button></div>` : '';
  if (!S.loaded) return head + `<p class="hint">Loading…</p>`;
  if (!sets.length) return head + notice + `<div class="empty glass"><b>No sets yet</b><p>Pick a muscle on Body and log a set. Or enter your current lifts to fill in the map now.</p><button class="btn" data-act="assess">Add current lifts</button><button class="link" data-act="sample-on">Preview with sample data</button></div>`;
  const ov = overall(), now = Date.now(), week = sets.filter(s => now - s.t < 7 * DAY), days = new Set(week.map(s => new Date(s.t).toDateString())).size;
  const fresh = Object.keys(MUSCLES).filter(m => C.mus[m].daysSE != null && C.mus[m].daysSE <= 14).length;
  let body = '';
  if (S.prog === 'ex') {
    const ids = [...new Set(sets.map(s => s.ex))].filter(id => EXI[id]).sort((a, b) => Math.max(...sets.filter(s => s.ex === b).map(s => s.t)) - Math.max(...sets.filter(s => s.ex === a).map(s => s.t)));
    body = `<div class="list">${ids.map(id => {
      const ex = EXI[id], pts = seriesFor(id), lastP = pts[pts.length - 1], [, unit, what] = valueOf(ex, sets.find(s => s.ex === id));
      const ch = pts.length > 1 ? lastP.v - pts[0].v : 0, cls = ch > 0 ? 'up' : ch < 0 ? 'down' : 'flat', open = S.pex === id;
      const fmt = v => unit === 'kg' ? `${r1(v)} kg` : `${Math.round(v)} ${unit}`;
      const detail = open ? `<div class="detail"><div class="facts"><span>${what} <b>${fmt(lastP.v)}</b></span>${pts.length > 1 ? `<span>Since ${new Date(pts[0].t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} <b class="delta ${cls}">${ch > 0 ? '+' : ''}${unit === 'kg' ? r1(ch) : Math.round(ch)}</b></span>` : ''}</div>${chart(pts, unit)}
        ${[...sets].filter(s => s.ex === id).sort((a, b) => b.t - a.t).slice(0, 6).map(s => `<div class="setrow"><b>${setText(ex, s)}</b><span>${dayLabel(s.t)}</span>${S.sample ? '' : delBtn(s.id)}</div>`).join('')}
        <button class="link" data-ex="${id}">Log another set</button></div>` : '';
      return `<div class="${open ? 'open' : ''}"><button class="row" data-pex="${id}"><span class="grow"><span class="t">${esc(cleanName(ex.name))}</span><span class="d">${fmt(lastP.v)} · ${dayLabel(lastP.t)}</span></span>${pts.length > 1 ? `<span class="delta ${cls}">${ch > 0 ? '+' : ''}${unit === 'kg' ? r1(ch) : Math.round(ch)}</span>` : ''}${spark(pts)}${ICON.chev}</button>${detail}</div>`;
    }).join('')}</div><p class="foot">Tap an exercise for its chart. Strength lifts show your estimated one-rep max.</p>`;
  } else {
    body = `<div class="list">${Object.keys(GROUPS).map(g => {
      const ms = Object.keys(MUSCLES).filter(m => MUSCLES[m][1] === g), vals = ms.map(devOf).filter(v => v != null), v = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null, open = S.openPG === g;
      return `<div class="${open ? 'open' : ''}"><button class="row" data-pg="${g}"><span class="grow"><span class="t">${GROUPS[g]}</span><span class="d">${v == null ? 'No sets yet' : levelName(v)}</span></span><span class="bar"><i style="width:${v == null ? 0 : Math.max(4, v)}%"></i></span><span class="v num">${v == null ? '–' : Math.round(v)}</span>${ICON.chev}</button>
      ${open ? `<div class="sub">${ms.map(m => { const mv = devOf(m), a = C.mus[m]; return `<button class="row" data-m="${m}"><span class="grow"><span class="t">${esc(plain(m))}</span><span class="d">${mv == null ? 'Not trained' : `${levelName(mv)} · ${a.days == null ? 'indirect only' : dayLabel(Date.now() - a.days * DAY)}`}</span></span><span class="v num">${mv == null ? '–' : Math.round(mv)}</span>${ICON.chev}</button>`; }).join('')}</div>` : ''}</div>`;
    }).join('')}</div><p class="foot">Scores compare your best recent lifts with men at your bodyweight. 20 Beginner · 40 Novice · 60 Intermediate · 80 Advanced · 100 Elite.</p>`;
  }
  return head + notice + `<section class="summary glass"><div><div class="ss" style="margin:0 0 4px">Overall strength</div><div class="big">${ov == null ? '–' : Math.round(ov)}</div></div><div class="lvl">${ov == null ? '' : levelName(ov)}</div>
    <div class="meta"><span><b>${week.length}</b> sets this week</span><span><b>${days}</b> days trained</span><span><b>${fresh}</b> muscles in 14 days</span></div></section>
    <div class="seg full" role="tablist" aria-label="Progress view"><button role="tab" aria-selected="${S.prog === 'ex'}" data-prog="ex">Exercises</button><button role="tab" aria-selected="${S.prog === 'mus'}" data-prog="mus">Muscles</button></div>
    ${body}`;
}

// ---------- sheets ----------
const cur = () => S.stack[S.stack.length - 1];
function openMuscle(id) { S.sel = id; S.showAll = false; S.stack = [{ type: 'muscle', id }]; renderSheet(); paintMap(); }
function openEx(id, from) { const t = cur(); if (t && t.type === 'muscle') S.stack.push({ type: 'ex', id, from: t.id }); else S.stack = [{ type: 'ex', id, from: from || null }]; S.confirmDel = null; renderSheet(); }
function closeSheet() { if (typeof BR !== 'undefined' && BR.run) breatheEnd(false); S.stack = []; S.sel = null; renderSheet(); paintMap(); }
function sbar(backLabel) { return `<div class="grab" aria-hidden="true"></div><div class="sbar">${backLabel ? `<button class="back" data-act="back">${ICON.back}${esc(backLabel)}</button>` : ''}<button class="xbtn" data-act="close" aria-label="Close">${ICON.x}</button></div>`; }
function sheetMuscle(id) {
  const [name, , , , parent] = MUSCLES[id], a = C.mus[id], dv = devOf(id);
  const avail = GOAL_TABS.filter(([g]) => rankFor(id, g).length);
  let g = S.goal; if (!avail.some(([k]) => k === g)) g = avail.length ? avail[0][0] : 'S';
  const list = rankFor(id, g), hist = historyOf();
  const mine = list.filter(e => hist[e.id]).sort((x, y) => hist[y.id].last - hist[x.id].last);
  const fresh = list.filter(e => !hist[e.id]), shown = S.showAll ? fresh : fresh.slice(0, mine.length ? 2 : 3);
  const card = (e, i) => { const last = lastSetOf(e.id), h = hist[e.id]; return `<button class="exc${h ? ' mine' : ''}" data-ex="${e.id}">${h ? `<span class="rank done" aria-label="Done ${h.n} times">${h.n}×</span>` : `<span class="rank">${i + 1}</span>`}<span class="grow"><b>${esc(cleanName(e.name))}</b><small>${EQUIP[e.eq]}${last ? ` · last ${setText(e, last)}` : ''}</small></span>${window.Form3D && Form3D.has(e.id) ? '<span class="pill">3D</span>' : ''}${ICON.chev}</button>`; };
  const status = dv == null ? 'Not trained yet' : `${levelName(dv)}${a.days != null ? ` · ${dayLabel(Date.now() - a.days * DAY).toLowerCase()}` : ''}`;
  const kids = Object.keys(MUSCLES).filter(m => MUSCLES[m][4] === id);
  return sbar('') + `<div><h2 class="st">${esc(plain(id))}</h2><p class="ss">${esc(name)} · ${status}</p></div>
    <div class="seg full" role="tablist" aria-label="Goal">${GOAL_TABS.map(([k, l]) => `<button role="tab" aria-selected="${k === g}" data-goal="${k}"${avail.some(([x]) => x === k) ? '' : ' disabled'}>${l}</button>`).join('')}</div>
    ${mine.length ? `<section><h3 class="lh">Your exercises</h3><div class="excards">${mine.map(card).join('')}</div></section>` : ''}
    ${fresh.length ? `<section><h3 class="lh">${mine.length ? 'Try next' : 'Recommended'}</h3><div class="excards">${shown.map(card).join('')}</div>
    ${fresh.length > shown.length || S.showAll ? `<button class="link" data-act="all">${S.showAll ? 'Show fewer' : `Show all ${fresh.length}`}</button>` : ''}</section>` : ''}
    ${kids.length || parent ? `<div class="list">${[...kids, ...(parent ? [parent] : [])].map(m => `<button class="row" data-m="${m}"><span class="grow"><span class="t">${esc(plain(m))}</span><span class="d">${m === parent ? 'Lies on top' : 'Lies underneath'} · ${esc(MUSCLES[m][0])}</span></span>${ICON.chev}</button>`).join('')}</div>` : ''}`;
}
function form3dBlock(ex) {
  if (!window.Form3D || !Form3D.has(ex.id)) return '';
  const o = C.exBest[ex.id], last = lastSetOf(ex.id);
  const pct = o && o.str && last && last.w && last.r ? last.w / o.str.v : 0;
  const txt = pct ? `Your last set, ${setText(ex, last)}, is about ${Math.round(pct * 100)}% of your estimated max. ${pct >= 0.7 ? 'At that weight, focus on the bar.' : 'Light enough to focus on the muscle.'}` : '';
  return `<div id="form3d" class="form3d" data-ex="${ex.id}" data-pct="${pct.toFixed(3)}" data-last="${esc(txt)}"></div>`;
}
function facts(ex) {
  const o = C.exBest[ex.id], last = lastSetOf(ex.id), f = [];
  if (last) f.push(`<span>Last <b>${setText(ex, last)}</b> ${dayLabel(last.t).toLowerCase()}</span>`);
  if (o && o.str) f.push(`<span>Estimated max <b>${kg(o.str.v)}</b> · ${levelName(o.str.score)}</span>`);
  else if (o && o.end) f.push(`<span>Best <b>${o.end.v}${ES[ex.estd][0] === 's' ? ' s' : ' reps'}</b> · ${levelName(o.end.score)}</span>`);
  return f.length ? `<div class="facts">${f.join('')}</div>` : '';
}
function sheetEx(id, from) {
  const ex = EXI[id], v = VIDEO[id], last = lastSetOf(id), has3d = window.Form3D && Form3D.has(id);
  const vid = v ? `<a class="watch" href="${esc(v.url)}" target="_blank" rel="noopener"><span class="play">${ICON.play}</span><span class="grow"><span>Watch a demo</span><small>${isShort(v.url) ? 'Short video' : 'Video'} · YouTube</small></span>${ICON.chev}</a>`
    : `<a class="watch" href="https://www.youtube.com/results?search_query=${encodeURIComponent(cleanName(ex.name) + ' form')}" target="_blank" rel="noopener"><span class="play">${ICON.play}</span><span class="grow"><span>Find a demo</span><small>Search YouTube</small></span>${ICON.chev}</a>`;
  return sbar(from ? plain(from) : '') + `<div><h2 class="st">${esc(cleanName(ex.name))}</h2><p class="ss">${esc(ex.cue)}</p></div>
    ${has3d ? form3dBlock(ex) : vid}
    <form id="logForm" class="logcard glass"><div class="fields">${inputsFor(ex, last)}</div><p id="logErr" class="err" hidden></p>
      <button class="btn wide" type="submit"${S.sample ? ' disabled' : ''}>${S.sample ? 'Exit sample data to log' : 'Log set'}</button></form>
    <div id="exFacts">${facts(ex)}</div>
    ${has3d ? vid : ''}`;
}
function sheetSettings() {
  const p = S.profile, ap = Theme.get();
  return sbar('') + `<h2 class="st">Settings</h2>
  <section><h3 class="lh">Appearance</h3><div class="seg full" role="tablist" aria-label="Appearance">${[['auto', 'Automatic'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<button role="tab" aria-selected="${ap === k}" data-ap="${k}">${l}</button>`).join('')}</div></section>
  <section><h3 class="lh">You</h3><form id="profileForm"><div class="list form">
    <label>Sex<select id="pSex"><option value="male"${p.sex === 'male' ? ' selected' : ''}>Male</option><option value="female"${p.sex === 'female' ? ' selected' : ''}>Female</option></select></label>
    <label>Age<input id="pAge" type="number" inputmode="numeric" min="14" max="90" value="${p.age}"></label>
    <label>Height, cm<input id="pHeight" type="number" inputmode="numeric" min="120" max="230" value="${p.height}"></label>
    <label>Bodyweight, kg<input id="pBw" type="number" inputmode="decimal" step="0.1" min="35" max="200" value="${p.bw}"></label>
    <label>Sport<select id="pSport"><option value="squash"${p.sport === 'squash' ? ' selected' : ''}>Squash</option><option value="none"${p.sport !== 'squash' ? ' selected' : ''}>None</option></select></label>
  </div><p id="pErr" class="err" hidden></p><button class="btn wide tinted" type="submit" style="margin-top:10px">Save</button></form></section>
  <section class="list"><button class="row" data-act="assess"><span class="grow"><span class="t">${p.assessed ? 'Update current lifts' : 'Add current lifts'}</span><span class="d">Twelve quick tests fill in the map</span></span>${ICON.chev}</button>
    <button class="row" data-act="${S.sample ? 'sample-off' : 'sample-on'}"><span class="grow"><span class="t">${S.sample ? 'Exit sample data' : 'Preview with sample data'}</span></span>${ICON.chev}</button></section>
  <details class="list"><summary>How scores work ${ICON.chev}</summary>
    <p>Each set becomes an estimated one-rep max: weight × (1 + reps ÷ 30). It is compared with men at your bodyweight: 20 Beginner, 40 Novice, 60 Intermediate, 80 Advanced, 100 Elite.</p>
    <p>Bench press, squat, deadlift, shoulder press, curl, row and power clean use <a href="https://strengthlevel.com/strength-standards/male/kg" target="_blank" rel="noopener">Strength Level</a> data. Other exercises are estimated from those lifts.</p>
    <p>${Store.mode === 'cloud' ? 'Your sets are saved to your Claude account.' : 'Your sets are saved in this browser.'} ${allSets().length} sets logged.</p></details>`;
}
function sheetAssess() {
  const a = S.assess, p = S.profile, n = ASSESS.length + 2;
  if (a.step === 0) return sbar('') + `<div><p class="ss">Step 1 of ${n}</p><h2 class="st">Check your details</h2></div>
    <form id="aProfile"><div class="list form">
      <label>Sex<select id="aSex"><option value="male"${p.sex === 'male' ? ' selected' : ''}>Male</option><option value="female"${p.sex === 'female' ? ' selected' : ''}>Female</option></select></label>
      <label>Age<input id="aAge" type="number" inputmode="numeric" value="${p.age}"></label>
      <label>Height, cm<input id="aHeight" type="number" inputmode="numeric" value="${p.height}"></label>
      <label>Bodyweight, kg<input id="aBw" type="number" inputmode="decimal" step="0.1" value="${p.bw}"></label>
    </div><p id="aErr" class="err" hidden></p><button class="btn wide" type="submit" style="margin-top:12px">Next</button></form>`;
  if (a.step <= ASSESS.length) {
    const [id, note] = ASSESS[a.step - 1], ex = EXI[id], d = a.draft[id];
    return sbar('') + `<div class="progress"><i style="width:${a.step / (ASSESS.length + 1) * 100}%"></i></div>
    <div><p class="ss">Step ${a.step + 1} of ${n}</p><h2 class="st">${esc(cleanName(ex.name))}</h2><p class="ss">${esc(note)} Any set from the last month works.</p></div>
    <form id="aStep" class="logcard glass"><div class="fields">${inputsFor(ex, d, 'a')}</div><p id="aErr" class="err" hidden></p>
    <div class="rowbtns"><button type="button" class="btn tinted" data-act="a-skip">Skip</button><button class="btn" type="submit">Next</button></div></form>
    <button class="link" data-act="a-back">Back</button>`;
  }
  const entries = Object.entries(a.draft);
  return sbar('') + `<div><p class="ss">Last step</p><h2 class="st">Save your lifts</h2><p class="ss">${entries.length ? `${entries.length} entered. They are saved as today's sets.` : 'You skipped every test.'}</p></div>
    ${entries.length ? `<div class="list">${entries.map(([id, s]) => `<div class="row"><span class="grow"><span class="t">${esc(cleanName(EXI[id].name))}</span></span><span class="v">${setText(EXI[id], s)}</span></div>`).join('')}</div>` : ''}
    <div class="rowbtns"><button class="btn tinted" data-act="a-back">Back</button><button class="btn" data-act="a-save">${entries.length ? 'Save' : 'Finish'}</button></div>`;
}
function renderSheet() {
  const el = $('#sheet'), bd = $('#backdrop'), t = cur();
  if (!t) { el.hidden = true; bd.hidden = true; el.innerHTML = ''; document.body.classList.remove('locked'); if (window.Form3D) Form3D.sync(); return; }
  el.hidden = false; bd.hidden = false; document.body.classList.add('locked');
  el.innerHTML = t.type === 'muscle' ? sheetMuscle(t.id) : t.type === 'ex' ? sheetEx(t.id, t.from) : t.type === 'settings' ? sheetSettings() : t.type === 'skill' ? sheetSkill(t.id) : t.type === 'breathe' ? sheetBreathe() : sheetAssess();
  el.scrollTop = 0;
  if (window.Form3D) Form3D.sync();
}
function refreshSheetData() {
  const t = cur(); if (!t) return;
  if (t.type === 'muscle' || t.type === 'settings' || t.type === 'skill') { const st = $('#sheet').scrollTop; renderSheet(); $('#sheet').scrollTop = st; }
  else if (t.type === 'ex') { const f = $('#exFacts'); if (f) f.innerHTML = facts(EXI[t.id]); }
}

// ---------- render ----------
function renderMain() {
  C = compute();
  $('#main').innerHTML = S.tab === 'body' ? viewBody() : S.tab === 'mind' ? viewMind() : viewProgress();
  document.querySelectorAll('#nav button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === S.tab ? 'page' : 'false'));
  if (S.tab === 'body') bindMap();
}
function refresh() { renderMain(); refreshSheetData(); }
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2200); }

// existing helpers the views rely on
function lastSetOf(id) { return [...allSets()].filter(s => s.ex === id).sort((a, b) => b.t - a.t)[0]; }
function field(id, label, val, step, unit) {
  return `<div class="field"><label for="${id}">${label}</label><div class="stepper"><button type="button" data-step="${id}" data-d="-${step}" aria-label="Less ${label.toLowerCase()}">−</button><input id="${id}" type="number" inputmode="decimal" step="any" value="${val}"><button type="button" data-step="${id}" data-d="${step}" aria-label="More ${label.toLowerCase()}">+</button></div><small>${unit}</small></div>`;
}
function inputsFor(ex, last, prefix = 'f') {
  const L = last || {};
  switch (ex.mode) {
    case 'load': return field(prefix + 'W', 'Weight', L.w ?? 20, 2.5, ex.name.includes('per hand') ? 'kg per hand' : ex.name.includes('per side') ? 'kg per side' : 'kg') + field(prefix + 'R', 'Reps', L.r ?? 8, 1, 'reps');
    case 'bw': return field(prefix + 'W', 'Added weight', L.w ?? 0, 2.5, 'kg, negative if assisted') + field(prefix + 'R', 'Reps', L.r ?? 8, 1, 'reps');
    case 'reps': return field(prefix + 'R', 'Reps', L.r ?? 10, 1, 'reps');
    case 'time': return field(prefix + 'S', 'Time', L.s ?? 30, 5, 'seconds');
    case 'loadtime': return field(prefix + 'W', 'Weight', L.w ?? 20, 2.5, 'kg') + field(prefix + 'S', 'Time', L.s ?? 30, 5, 'seconds');
  }
}
function readInputs(ex, prefix = 'f') {
  const g = k => { const el = document.getElementById(prefix + k); return el ? parseFloat(el.value) : NaN; };
  const s = {};
  if (['load', 'bw', 'loadtime'].includes(ex.mode)) { s.w = g('W'); if (isNaN(s.w)) return { err: 'Enter a weight.' }; if (ex.mode !== 'bw' && s.w <= 0) return { err: 'Weight must be more than 0.' }; }
  if (['load', 'bw', 'reps'].includes(ex.mode)) { s.r = Math.round(g('R')); if (!(s.r >= 1)) return { err: 'Enter at least 1 rep.' }; if (s.r > 500) return { err: 'That rep count looks too high.' }; }
  if (['time', 'loadtime'].includes(ex.mode)) { s.s = Math.round(g('S')); if (!(s.s >= 1)) return { err: 'Enter at least 1 second.' }; }
  return { s };
}
function setText(ex, s) {
  switch (ex.mode) {
    case 'load': return `${r1(s.w)} kg × ${s.r}`;
    case 'bw': return `${s.w ? (s.w > 0 ? '+' : '') + r1(s.w) + ' kg × ' : ''}${s.r} reps`;
    case 'reps': return `${s.r} reps`;
    case 'time': return `${s.s} s`;
    case 'loadtime': return `${r1(s.w)} kg · ${s.s} s`;
  }
}
const isShort = u => /\/shorts\//.test(u);
const delBtn = id => S.confirmDel === id ? `<button class="del sure" data-del="${id}">Delete</button>` : `<button class="del" data-askdel="${id}" aria-label="Delete set">Remove</button>`;
function overall() { const vals = Object.keys(GROUPS).map(g => { const v = Object.keys(MUSCLES).filter(m => MUSCLES[m][1] === g).map(m => C.mus[m].s).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; }).filter(v => v != null); return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; }
function makeSample() {
  const now = Date.now(), d = n => now - n * DAY - 3600e3 * 2;
  const L = [
    ['bench_press', 72.5, 6, 0, 40], ['bench_press', 75, 5, 0, 33], ['bench_press', 77.5, 5, 0, 26], ['bench_press', 80, 5, 0, 12], ['bench_press', 82.5, 4, 0, 5],
    ['back_squat', 90, 5, 0, 35], ['back_squat', 95, 5, 0, 22], ['back_squat', 100, 5, 0, 11], ['deadlift', 120, 3, 0, 30], ['deadlift', 130, 3, 0, 9], ['ohp', 47.5, 5, 0, 24], ['ohp', 50, 5, 0, 8],
    ['bent_row', 70, 8, 0, 10], ['pull_up', 0, 6, 0, 25], ['pull_up', 0, 8, 0, 4], ['barbell_curl', 35, 8, 0, 6], ['lateral_raise', 10, 12, 0, 6], ['lying_leg_curl', 45, 10, 0, 3],
    ['standing_calf', 100, 12, 0, 2], ['incline_db', 26, 8, 0, 5], ['lat_pulldown', 65, 10, 0, 7], ['pushdown', 30, 12, 0, 5], ['face_pull', 25, 15, 0, 20],
    ['plank', 0, 0, 60, 18], ['plank', 0, 0, 75, 4], ['push_up', 0, 32, 0, 12], ['couch_stretch', 0, 0, 60, 1], ['pigeon', 0, 0, 90, 1], ['leg_press', 180, 10, 0, 2], ['hip_abduction', 60, 12, 0, 3]
  ];
  return L.map(([ex, w, r, s, ago], i) => ({ id: 's' + i, ex, w: w || undefined, r: r || undefined, s: s || undefined, t: d(ago), src: 'sample' }));
}

// ---------- events ----------
document.addEventListener('click', async e => {
  const b = e.target.closest('button,[data-m]'); if (!b || b.closest('#form3d')) return;
  const ds = b.dataset;
  if (ds.tab) { S.tab = ds.tab; S.confirmDel = null; renderMain(); window.scrollTo(0, 0); return; }
  if (ds.side) { S.view = ds.side; S.zoom = 1; S.vb = { x: 0, y: 0, w: 200, h: 430 }; renderMain(); return; }
  if (ds.g) { S.openG = S.openG === ds.g ? null : ds.g; renderMain(); return; }
  if (ds.pg) { S.openPG = S.openPG === ds.pg ? null : ds.pg; renderMain(); return; }
  if (ds.pex) { S.pex = S.pex === ds.pex ? null : ds.pex; S.confirmDel = null; renderMain(); return; }
  if (ds.prog) { S.prog = ds.prog; renderMain(); return; }
  if (ds.skill) { S.stack = [{ type: 'skill', id: ds.skill }]; renderSheet(); return; }
  if (ds.drill) { b.disabled = true; try { await Store.addMind({ kind: 'drill', skill: ds.skillid, drill: +ds.drill, t: Date.now() }); toast('Drill logged'); } catch (err) { toast('Could not log that. Try again.'); b.disabled = false; } return; }
  if (ds.blen) { BR.len = +ds.blen; renderSheet(); return; }
  if (ds.goal) { S.goal = ds.goal; S.showAll = false; refreshSheetData(); return; }
  if (ds.ap) { Theme.set(ds.ap); refreshSheetData(); return; }
  if (ds.ex) { openEx(ds.ex); return; }
  if (ds.m && b.tagName === 'BUTTON') { openMuscle(ds.m); return; }
  if (ds.step) { const inp = document.getElementById(ds.step); const v = (parseFloat(inp.value) || 0) + parseFloat(ds.d); inp.value = r1(inp.id.endsWith('W') ? v : Math.max(0, v)); return; }
  if (ds.askdel) { S.confirmDel = ds.askdel; refresh(); return; }
  if (ds.del) { S.confirmDel = null; try { await Store.delSet(ds.del); toast('Set removed'); } catch (err) { toast('Could not remove that set. Try again.'); } return; }
  const act = ds.act;
  if (act === 'close') closeSheet();
  if (act === 'breathe') { if (BR.run) return; S.stack = [{ type: 'breathe' }]; renderSheet(); }
  if (act === 'b-start') breatheStart();
  if (act === 'b-stop') breatheEnd(false);
  if (act === 'back') { S.stack.pop(); renderSheet(); }
  if (act === 'all') { S.showAll = !S.showAll; refreshSheetData(); }
  if (act === 'zoom-reset') setZoom(1);
  if (act === 'settings') { S.stack = [{ type: 'settings' }]; renderSheet(); }
  if (act === 'sample-on') { S.sample = true; S.sampleSets = makeSample(); refresh(); toast('Showing sample data'); }
  if (act === 'sample-off') { S.sample = false; refresh(); }
  if (act === 'assess') { S.sample = false; S.assess = { step: 0, draft: {} }; S.stack = [{ type: 'assess' }]; renderMain(); renderSheet(); }
  if (act === 'a-back') { S.assess.step = Math.max(0, S.assess.step - 1); renderSheet(); }
  if (act === 'a-skip') { delete S.assess.draft[ASSESS[S.assess.step - 1][0]]; S.assess.step++; renderSheet(); }
  if (act === 'a-save') {
    const entries = Object.entries(S.assess.draft), t = Date.now();
    b.disabled = true; b.textContent = 'Saving…';
    try {
      if (entries.length) await Store.addSets(entries.map(([ex, s], i) => ({ ex, ...s, t: t + i, src: 'assessment' })));
      await Store.saveProfile({ ...S.profile, assessed: true });
      S.assess = null; closeSheet(); renderMain(); toast(entries.length ? 'Lifts saved' : 'Done');
    } catch (err) { b.disabled = false; b.textContent = 'Save'; toast('Could not save. Check your connection and try again.'); }
  }
});
document.addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target;
  if (f.id === 'logForm') {
    const t = cur(), ex = EXI[t.id], { s, err } = readInputs(ex), er = $('#logErr');
    if (err) { er.textContent = err; er.hidden = false; return; }
    er.hidden = true;
    const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    try { await Store.addSets([{ ex: ex.id, ...s, t: Date.now(), src: 'log' }]); toast(`Logged ${setText(ex, s)}`); }
    catch (x) { toast('Could not save that set. Try again.'); }
    btn.disabled = false;
  }
  if (f.id === 'profileForm' || f.id === 'aProfile') {
    const pre = f.id === 'profileForm' ? 'p' : 'a', v = k => document.getElementById(pre + k);
    const p = { ...S.profile, sex: v('Sex').value, age: Math.round(+v('Age').value), height: Math.round(+v('Height').value), bw: r1(+v('Bw').value) };
    if (pre === 'p') p.sport = v('Sport').value;
    const er = $('#' + pre + 'Err');
    const bad = !(p.age >= 14 && p.age <= 90) ? 'Enter an age between 14 and 90.' : !(p.bw >= 35 && p.bw <= 200) ? 'Enter a bodyweight between 35 and 200 kg.' : !(p.height >= 120 && p.height <= 230) ? 'Enter a height between 120 and 230 cm.' : '';
    if (bad) { er.textContent = bad; er.hidden = false; return; }
    try { await Store.saveProfile(p); } catch (x) { toast('Could not save. Try again.'); return; }
    if (pre === 'a') { S.assess.step = 1; renderSheet(); } else toast('Saved');
  }
  if (f.id === 'aStep') {
    const id = ASSESS[S.assess.step - 1][0], ex = EXI[id], { s, err } = readInputs(ex, 'a'), er = $('#aErr');
    if (err) { er.textContent = err; er.hidden = false; return; }
    S.assess.draft[id] = s; S.assess.step++; renderSheet();
  }
});
document.addEventListener('input', e => { if (e.target.matches('#logForm input, #aStep input')) { const er = $('#logErr') || $('#aErr'); if (er) er.hidden = true; } });
$('#backdrop').addEventListener('click', closeSheet);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && cur()) closeSheet(); });

Theme.apply();
renderMain();
Store.init();
