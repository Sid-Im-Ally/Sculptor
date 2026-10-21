// ================= Mind =================
const SKILLS = [
  { id: 'focus', name: 'Focus', area: 'Attention', icon: 'M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    idea: 'Attention works like a torch, not a bulb. You choose where the beam goes, and whatever it lands on gets sharper.',
    drills: [['Follow the bar', 'For a whole set, watch the bar or feel it travel down and up. Nothing else.'],
      ['Say "down", "up"', 'Silently say "down" as the bar touches and "up" at lockout. It keeps you in the rep you are doing.'],
      ['Find the small detail', 'Before a set, look at something easy to miss, like the knurling on the bar, for ten seconds.']] },
  { id: 'trust', name: 'Trust', area: 'Let it happen', icon: 'M4 13c3 0 4-6 8-6s5 6 8 6M4 17h16',
    idea: 'Trying harder tightens the wrong muscles. Set the target, then let your body do the work without forcing or fixing it mid-rep.',
    drills: [['One cue, then let go', 'Pick one cue before the set. Once you start, stop giving yourself instructions.'],
      ['No fixing mid-set', 'Do a light set without correcting anything. Review it only after the last rep.'],
      ['Easy effort', 'Do a warm-up set at 80% effort and notice it moves just as well.']] },
  { id: 'observe', name: 'Observe', area: 'No judgment', icon: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
    idea: 'Calling a rep good or bad sticks, and the label shapes the next one. Notice what happened as a fact and let your body adjust on its own.',
    drills: [['Describe, don’t grade', 'After a set, say what happened, like "the bar drifted toward my face", instead of "that was bad".'],
      ['Three words', 'Sum up each set in three neutral words.'],
      ['Watch one thing change', 'Notice one detail across sets and let it change without forcing it.']] },
  { id: 'picture', name: 'Picture', area: 'Visualization', icon: 'M4 6h16v12H4zM8 14l3-3 2 2 3-3 2 2',
    idea: 'Your body follows the clearest picture you give it. See the result you want in detail, then trust yourself to get there.',
    drills: [['One mental rep', 'Before each set, close your eyes and run one perfect rep in about ten seconds.'],
      ['From your own eyes', 'Picture it from inside your body and feel the weight, not as if watching a video.'],
      ['Copy the model', 'Watch a clean rep on the 3D model and copy the picture rather than a list of rules.']] },
  { id: 'voice', name: 'Inner voice', area: 'Self-talk', icon: 'M4 5h16v10H9l-5 4z',
    idea: 'Your muscles hear how you talk to yourself. Speak with respect, ask for what you want rather than what you fear, and keep it short.',
    drills: [['Say what you want', 'Turn "don’t flare" into "elbows tucked".'],
      ['Coach a friend', 'Talk to yourself the way you would coach someone you admire.'],
      ['One word per set', 'Choose one word, like "squeeze" or "drive", and use only that.']] },
  { id: 'feel', name: 'Feel', area: 'Mind-muscle', icon: 'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z',
    idea: 'Put your attention inside the working muscle. It raises that muscle’s activity on light and moderate sets, up to about 60–70% of your max.',
    drills: [['Touch it first', 'Tap the muscle before the set so you know exactly where to feel it.'],
      ['Slow lowering', 'Take three seconds on the way down and feel the muscle lengthen.'],
      ['Squeeze at the top', 'Hold one second at the top and squeeze. On near-max sets, think about the bar instead.']] },
  { id: 'calm', name: 'Calm', area: 'Breathing', icon: 'M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0',
    idea: 'You can’t force yourself to relax. Slow the breath, lengthen the exhale and let calm arrive on its own.',
    drills: [['Long exhale', 'Between sets, breathe in for 4 seconds and out for 6, for one minute.'],
      ['Notice tension', 'Scan your jaw, shoulders and hands. Notice tension without trying to remove it.'],
      ['Breathe with your Watch', 'Tap the mind at the top of this page and start Breathe on your Watch at the same time.']] },
  { id: 'habit', name: 'Habits', area: 'Change', icon: 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4',
    idea: 'Every habit serves some purpose, which is why it is hard to drop one without a replacement. Find what the old habit does for you and give your body a better option.',
    drills: [['Name its purpose', 'Ask what the habit gives you. Flared elbows might make the press feel stronger.'],
      ['Practice the swap', 'Groove the new movement on light sets until it feels natural.'],
      ['One change at a time', 'Work on a single habit per session.']] }
];
const SKI = Object.fromEntries(SKILLS.map(k => [k.id, k]));
const mindLog = () => S.mind || [];
function skillStats(id) {
  const now = Date.now(), list = mindLog().filter(x => x.skill === id);
  const recent = list.filter(x => now - x.t < 14 * DAY).length;
  return { n: list.length, recent, last: list.length ? Math.max(...list.map(x => x.t)) : 0 };
}
const mindTint = n => n ? `color-mix(in srgb, var(--mind) ${Math.min(100, 30 + n * 14)}%, var(--fill))` : 'var(--fill)';

const MIND_SVG = (() => {
  // left hemisphere seen from above (front at the top); the right one is its mirror image
  const outer = [[117, 42], [107, 33], [94, 30], [80, 33], [67, 41], [57, 53], [49, 69], [44, 89], [42, 111], [43, 134], [47, 156], [54, 175], [65, 190], [80, 201], [97, 207], [111, 206], [118, 199]];
  const inner = [[119.5, 176], [120, 140], [120, 100], [119.5, 64]];
  const hemi = smoothPath(outer.concat(inner), 0.42);
  const open = pts => { let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)], t = .18; d += `C${(p1[0] + (p2[0] - p0[0]) * t).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) * t).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) * t).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) * t).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`; } return d; };
  const C = [86, 120], dense = [];
  for (let i = 0; i < outer.length - 1; i++) for (let k = 0; k < 3; k++) { const a = outer[i], b = outer[i + 1], u = k / 3; dense.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); }
  const contour = (f, amp, w, ph, from, to) => open(dense.slice(from, dense.length - to).map((p, i) => { const r = f * (1 + amp * Math.sin(w * i + ph)); return [C[0] + (p[0] - C[0]) * r, C[1] + (p[1] - C[1]) * r]; }));
  const folds = [contour(.84, .03, .62, 0, 2, 2), contour(.67, .04, .78, 1.3, 3, 3), contour(.5, .045, .95, 2.2, 5, 5), contour(.33, .05, 1.1, .6, 8, 8)];
  const sulcus = 'M116 96C110 92 106 100 99 97';
  const nodes = [[78, 58], [56, 96], [60, 150], [84, 186], [92, 118]];
  const side = `<path class="hemi" d="${hemi}"/>
    <g class="folds">${folds.map(d => `<path d="${d}"/>`).join('')}<path d="${sulcus}"/></g>
    <g class="flow">${folds.map((d, i) => `<path d="${d}" style="animation-delay:${(-i * 1.7).toFixed(1)}s;animation-duration:${(7 + i * 1.5).toFixed(1)}s"/>`).join('')}</g>
    <g class="nodes">${nodes.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2.2" style="animation-delay:${(i * .6).toFixed(1)}s"/>`).join('')}</g>`;
  const bridges = [70, 120, 170].map((y, i) => `<path style="animation-delay:${(i * 1.1).toFixed(1)}s" d="M104 ${y}Q120 ${y - 9} 136 ${y}"/>`).join('');
  return `<svg class="mindsvg" viewBox="0 0 240 240" aria-hidden="true">
  <defs><radialGradient id="mgH" cx="62%" cy="38%" r="80%"><stop offset="0" stop-color="var(--mind)" stop-opacity=".95"/><stop offset=".65" stop-color="var(--mind)" stop-opacity=".62"/><stop offset="1" stop-color="var(--mind)" stop-opacity=".38"/></radialGradient>
  <radialGradient id="mgHalo"><stop offset="0" stop-color="var(--mind)" stop-opacity=".32"/><stop offset=".6" stop-color="var(--mind)" stop-opacity=".1"/><stop offset="1" stop-color="var(--mind)" stop-opacity="0"/></radialGradient></defs>
  <circle class="halo" cx="120" cy="120" r="116" fill="url(#mgHalo)"/>
  <g class="orbit"><circle cx="120" cy="120" r="112"/><circle class="bead" cx="120" cy="8" r="3"/></g>
  <g class="brainG">${side}<g transform="translate(240 0) scale(-1 1)">${side}</g><g class="bridges">${bridges}</g></g>
</svg>`;
})();

function viewMind() {
  const now = Date.now(), wk = mindLog().filter(x => now - x.t < 7 * DAY);
  const br = wk.filter(x => x.kind === 'breathe'), mins = Math.round(br.reduce((a, x) => a + (x.secs || 0), 0) / 60);
  return `<header class="lt"><div class="brand">SCULPTOR</div></header><div class="meander" aria-hidden="true"></div>
  <section><button class="mindcard glass" data-act="breathe" aria-label="Start a breathing session">${MIND_SVG}<span class="mindcap">Tap to breathe</span></button>
    ${(() => { const d = wk.filter(x => x.kind === 'drill').length; return `<div class="facts mstats"><span><b>${br.length}</b> breathing session${br.length === 1 ? '' : 's'} this week</span><span><b>${mins}</b> min</span><span><b>${d}</b> drill${d === 1 ? '' : 's'}</span></div>`; })()}</section>
  <section><h2 class="lh">Train your mind</h2><div class="skills">${SKILLS.map(k => { const st = skillStats(k.id); return `<button class="skill" data-skill="${k.id}"><span class="sico" style="background:${mindTint(st.recent)}"><svg viewBox="0 0 24 24"><path d="${k.icon}"/></svg></span><b>${k.name}</b><small>${k.area}</small>${st.n ? `<i class="sn">${st.n}×</i>` : ''}</button>`; }).join('')}</div>
  <p class="foot">Mark a drill when you practise it. Skills you train more glow brighter.</p></section>`;
}
function sheetSkill(id) {
  const k = SKI[id], counts = {};
  for (const x of mindLog()) if (x.skill === id && x.kind === 'drill') counts[x.drill] = (counts[x.drill] || 0) + 1;
  return sbar('') + `<div><p class="ss" style="margin:0 0 4px;color:var(--mind)">${k.area}</p><h2 class="st">${k.name}</h2></div>
    <p class="idea">${k.idea}</p>
    <section><h3 class="lh">Drills</h3><div class="excards">${k.drills.map(([t, d], i) => `<div class="drill glass"><div class="grow"><b>${t}</b><small>${d}</small></div><button class="dbtn${counts[i] ? ' done' : ''}" data-drill="${i}" data-skillid="${id}">${counts[i] ? `Done ${counts[i]}×` : 'Done'}</button></div>`).join('')}</div></section>
    ${id === 'calm' || id === 'focus' ? `<button class="btn wide mindbtn2" data-act="breathe">Start a breathing session</button>` : ''}`;
}

// ---------- breathing session ----------
const BR = { len: 60, run: false, t0: 0, raf: 0, wake: null };
function sheetBreathe() {
  return sbar('') + `<div><p class="ss" style="margin:0 0 4px;color:var(--mind)">Calm</p><h2 class="st">Breathe</h2></div>
  <div class="orbwrap"><div class="orb" id="orb"></div><div class="orbtxt"><b id="orbLabel">Ready</b><span id="orbTime">${BR.len / 60} min</span></div></div>
  <div class="seg full" role="tablist" aria-label="Length">${[60, 180, 300].map(v => `<button role="tab" aria-selected="${BR.len === v}" data-blen="${v}"${BR.run ? ' disabled' : ''}>${v / 60} min</button>`).join('')}</div>
  <button class="btn wide mindbtn2" data-act="${BR.run ? 'b-stop' : 'b-start'}" id="bBtn">${BR.run ? 'Stop' : 'Start'}</button>
  <div class="list"><div class="row"><span class="grow"><span class="t">On your Apple Watch</span><span class="d" style="white-space:normal">Raise your wrist, open Mindfulness and tap Breathe as you start here. Sculptor logs the session; the Watch adds the taps.</span></span></div></div>
  <p class="foot">In for 4 seconds, out for 6. A browser page can’t start apps on your Watch, so that step stays one tap.</p>`;
}
function breatheStart() {
  BR.run = true; BR.t0 = performance.now();
  try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => BR.wake = w).catch(() => { }); } catch (e) { }
  const btn = $('#bBtn'); if (btn) { btn.dataset.act = 'b-stop'; btn.textContent = 'Stop'; }
  document.querySelectorAll('[data-blen]').forEach(b => b.disabled = true);
  const tick = now => {
    if (!BR.run) return;
    const el = (now - BR.t0) / 1000, c = el % 10, inh = c < 4, k = inh ? c / 4 : 1 - (c - 4) / 6;
    const e = .5 - Math.cos(Math.PI * k) / 2, orb = $('#orb'), lab = $('#orbLabel'), tm = $('#orbTime');
    if (!orb) { BR.run = false; return; }
    orb.style.transform = `scale(${.55 + .45 * e})`;
    lab.textContent = inh ? 'Breathe in' : 'Breathe out';
    const left = Math.max(0, BR.len - el); tm.textContent = `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`;
    if (el >= BR.len) { breatheEnd(true); return; }
    BR.raf = requestAnimationFrame(tick);
  };
  BR.raf = requestAnimationFrame(tick);
}
async function breatheEnd(done) {
  const secs = Math.round((performance.now() - BR.t0) / 1000);
  BR.run = false; cancelAnimationFrame(BR.raf); try { BR.wake && BR.wake.release(); } catch (e) { } BR.wake = null;
  if (secs >= 20) { try { await Store.addMind({ kind: 'breathe', skill: 'calm', secs: Math.min(secs, BR.len), t: Date.now() }); toast(`Logged ${Math.round(Math.min(secs, BR.len) / 60 * 10) / 10} min of breathing`); } catch (e) { toast('Could not log the session. Try again.'); } }
  else if (!done) toast('Sessions under 20 seconds are not logged');
  if (cur() && cur().type === 'breathe') renderSheet();
}
