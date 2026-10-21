// Body map geometry. Coordinates describe the image-left half (the figure's right side);
// every region is mirrored around x=100. viewBox 0 0 200 430.
const OUTLINE = [
  [93,52],[92,62],[80,72],[66,79],[54,83],[47,92],[44,108],[43,130],[42,150],[41,168],
  [37,186],[33,206],[31,224],[30,236],[27,248],[29,262],[35,272],[41,272],[45,262],[46,248],
  [45,238],[48,224],[55,204],[60,188],[61,172],[63,150],[66,130],[69,118],
  [70,134],[71,158],[73,182],[71,198],[66,212],[63,236],[63,262],[66,290],[70,312],[70,326],
  [68,346],[69,368],[73,388],[76,402],[73,412],[76,420],[88,422],[95,418],[94,404],[92,388],
  [93,368],[93,346],[94,328],[94,312],[96,290],[98,262],[99,240],[100,236]
];
const HEAD = {cx:100, cy:32, rx:16, ry:21};

const REGIONS = {
  front: {
    scm:            [[88,46],[91,45],[99,73],[97,79],[93,75]],
    traps_upper:    [[91,58],[93,68],[80,76],[68,80],[74,74],[86,64]],
    delt_front:     [[68,81],[77,84],[73,96],[66,108],[59,108],[56,97],[60,86]],
    delt_side:      [[59,84],[56,97],[59,108],[53,112],[47,106],[47,95],[52,87]],
    chest_upper:    [[98,82],[79,84],[73,96],[85,99],[98,97]],
    chest_lower:    [[98,98],[85,100],[73,98],[68,110],[73,123],[87,128],[98,124]],
    biceps:         [[62,111],[57,111],[54,120],[53,138],[55,156],[59,164],[63,150],[65,128]],
    brachialis:     [[53,124],[49,132],[46,148],[47,164],[53,166],[53,150]],
    brachioradialis:[[47,166],[43,176],[38,196],[35,214],[39,216],[45,198],[52,178],[53,168]],
    forearm_flex:   [[55,167],[53,180],[47,198],[42,216],[41,230],[46,231],[51,212],[57,192],[60,176],[60,168]],
    serratus:       [[71,113],[67,121],[68,135],[71,145],[75,138],[75,124]],
    abs_upper:      [[98,128],[88,130],[86,148],[87,168],[98,168]],
    abs_lower:      [[98,169],[87,169],[87,190],[91,208],[98,216]],
    obliques:       [[86,132],[76,141],[73,158],[74,180],[77,196],[89,207],[86,184],[85,156]],
    hip_flexors:    [[90,209],[80,203],[77,212],[83,230],[90,233],[93,222]],
    tfl:            [[76,199],[69,205],[66,222],[69,240],[74,228],[77,212]],
    adductors:      [[93,224],[86,236],[88,252],[89,272],[93,284],[97,264],[99,240]],
    rectus_femoris: [[80,232],[76,250],[77,278],[82,300],[87,280],[88,254],[85,237]],
    vastus_lat:     [[69,238],[65,258],[66,286],[71,308],[78,313],[80,300],[76,280],[75,250]],
    vastus_med:     [[89,270],[86,284],[84,300],[86,312],[92,315],[95,300],[93,282]],
    tibialis_ant:   [[79,334],[76,350],[76,378],[79,398],[83,397],[83,368],[83,345]],
    peroneals:      [[75,334],[71,346],[71,370],[75,390],[75,360]],
  },
  back: {
    traps_upper:    [[100,56],[93,59],[84,68],[68,80],[82,86],[100,90]],
    traps_mid:      [[100,91],[84,88],[86,100],[92,111],[100,115]],
    traps_lower:    [[100,116],[92,112],[88,124],[92,140],[100,156]],
    delt_rear:      [[67,81],[58,84],[53,96],[58,104],[68,97],[74,88]],
    delt_side:      [[56,85],[49,91],[46,103],[50,112],[54,100]],
    infraspinatus:  [[84,92],[73,94],[68,104],[71,115],[84,117],[88,106]],
    teres_minor:    [[68,105],[63,110],[66,118],[71,116]],
    teres_major:    [[71,118],[64,119],[65,128],[73,128],[79,122]],
    lats:           [[86,122],[75,128],[69,134],[69,152],[74,172],[82,186],[90,192],[92,158],[92,140]],
    erectors:       [[100,156],[93,158],[91,170],[90,200],[94,214],[100,216]],
    triceps_long:   [[64,112],[59,113],[57,130],[58,150],[62,160],[66,140]],
    triceps_lat:    [[55,106],[49,112],[46,130],[48,150],[55,160],[57,148],[56,130],[58,113]],
    forearm_ext:    [[48,166],[42,180],[36,206],[33,226],[39,229],[46,210],[54,190],[60,172],[56,166]],
    glute_med:      [[91,204],[78,199],[67,206],[66,218],[78,221],[92,214]],
    glute_max:      [[98,218],[81,219],[68,223],[66,240],[73,256],[89,260],[100,254]],
    hams_biceps:    [[76,259],[68,263],[66,290],[71,312],[78,312],[80,290],[80,265]],
    hams_semi:      [[91,262],[82,265],[80,290],[80,312],[88,316],[94,300],[96,272]],
    adductors:      [[100,256],[94,262],[96,282],[99,282]],
    gastroc_lat:    [[75,326],[69,340],[70,360],[76,369],[81,350],[82,332]],
    gastroc_med:    [[90,326],[83,332],[81,350],[85,372],[91,370],[94,350],[94,334]],
    soleus:         [[70,362],[71,384],[77,396],[85,396],[91,384],[91,372],[85,374],[76,370]],
  }
};

// Catmull-Rom (closed) -> cubic Bezier path
function smoothPath(pts, tension = 0.5) {
  const n = pts.length; let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const t = tension / 3;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d + 'Z';
}
const mirror = pts => pts.map(([x, y]) => [200 - x, y]);
function outlinePath() {
  const left = OUTLINE, right = mirror(OUTLINE).reverse();
  return smoothPath([...left, ...right.slice(1)], 0.35);
}

// ---------- Muscles ----------
const GROUPS = {
  neck:'Neck', upper_back:'Upper back', shoulders:'Shoulders', cuff:'Rotator cuff', lats:'Lats',
  chest:'Chest', biceps:'Biceps', triceps:'Triceps', forearms:'Forearms', core:'Core',
  lower_back:'Lower back', glutes:'Glutes', hips:'Hips', quads:'Quads', hamstrings:'Hamstrings',
  adductors:'Adductors', calves:'Calves', shins:'Shins & ankles'
};
// id: [name, group, function, squash note (or ''), deep parent (or '')]
const MUSCLES = {
  scm:['Sternocleidomastoid','neck','Turns and flexes the head.','Keeps your eyes on the ball as the head whips around.',''],
  traps_upper:['Upper trapezius','upper_back','Shrugs and lifts the shoulder blade.','',''],
  traps_mid:['Middle trapezius','upper_back','Pulls the shoulder blades together.','',''],
  traps_lower:['Lower trapezius','upper_back','Draws the shoulder blades down; stabilises overhead.','Controls the scapula through overhead swings.',''],
  rhomboids:['Rhomboids','upper_back','Retracts the shoulder blade toward the spine.','','traps_mid'],
  delt_front:['Front deltoid','shoulders','Raises the arm forward; pressing.','',''],
  delt_side:['Side deltoid','shoulders','Raises the arm out to the side.','',''],
  delt_rear:['Rear deltoid','shoulders','Pulls the arm back; horizontal abduction.','Decelerates the follow-through.',''],
  infraspinatus:['Infraspinatus','cuff','External rotation; stabilises the shoulder joint.','Decelerates every forehand; first to get cranky.',''],
  teres_minor:['Teres minor','cuff','External rotation with the infraspinatus.','Backhand preparation and shoulder health.',''],
  supraspinatus:['Supraspinatus','cuff','Starts arm elevation; holds the ball in the socket.','Overhead and high-volley stability.','traps_upper'],
  subscapularis:['Subscapularis','cuff','Internal rotation; front of the cuff.','Drives the forehand swing.','serratus'],
  lats:['Latissimus dorsi','lats','Pulls the arm down and back.','Powers overhead and drive shots.',''],
  teres_major:['Teres major','lats','Assists the lats in pulling and internal rotation.','',''],
  chest_upper:['Upper chest (clavicular pec)','chest','Pressing upward; flexes the arm.','',''],
  chest_lower:['Mid & lower chest (sternal pec)','chest','Horizontal pressing and adduction.','',''],
  pec_minor:['Pectoralis minor','chest','Tilts the shoulder blade forward; often tight.','A tight pec minor rounds the shoulder and pinches swings.','chest_upper'],
  biceps:['Biceps brachii','biceps','Bends the elbow and turns the palm up.','',''],
  brachialis:['Brachialis','biceps','Pure elbow flexion under the biceps.','',''],
  triceps_long:['Triceps (long head)','triceps','Extends the elbow and pulls the arm down.','',''],
  triceps_lat:['Triceps (lateral head)','triceps','Elbow extension; the horseshoe.','',''],
  triceps_med:['Triceps (medial head)','triceps','Elbow extension at every angle.','','triceps_lat'],
  brachioradialis:['Brachioradialis','forearms','Elbow flexion with a neutral grip.','Stabilises the elbow on the backhand.',''],
  forearm_flex:['Forearm flexors','forearms','Grip and wrist flexion.','Racket grip and wrist snap; guards against golfer\'s elbow.',''],
  forearm_ext:['Forearm extensors','forearms','Wrist extension and grip balance.','Backhand wrist control; guards against tennis elbow.',''],
  abs_upper:['Upper abs (rectus abdominis)','core','Flexes the trunk.','',''],
  abs_lower:['Lower abs (rectus abdominis)','core','Posterior pelvic tilt; trunk flexion.','',''],
  obliques:['Obliques','core','Rotates and side-bends the trunk.','Every swing is a rotation; this is the transfer link.',''],
  serratus:['Serratus anterior','core','Wraps the shoulder blade to the ribs; reaching.','Keeps the scapula tracking on reaches and lunges.',''],
  tva:['Transverse abdominis','core','Deep corset; braces the spine.','Bracing on lunges and quick changes of direction.','abs_lower'],
  erectors:['Spinal erectors','lower_back','Extends and stabilises the spine.','Holds you up in the low ready position.',''],
  ql:['Quadratus lumborum','lower_back','Side-bends and hikes the hip.','Side-to-side trunk control on wide retrievals.','erectors'],
  glute_max:['Gluteus maximus','glutes','Hip extension; the main hip engine.','Drives you out of every lunge.',''],
  glute_med:['Gluteus medius','glutes','Hip abduction; keeps the pelvis level on one leg.','The classic weak hip. Controls the knee on lunges and lateral pushes.',''],
  glute_min:['Gluteus minimus','glutes','Hip abduction and internal rotation under glute med.','Single-leg stability in the corners.','glute_med'],
  hip_flexors:['Hip flexors (iliopsoas)','hips','Lifts the thigh; flexes the hip.','First step speed; tight from sitting.',''],
  tfl:['Tensor fasciae latae','hips','Hip flexion, abduction and internal rotation.','Overworks when glute med is weak.',''],
  deep_rotators:['Deep hip rotators (piriformis)','hips','Rotates the hip outward; centres the joint.','Hip rotation for pivots and open-stance shots.','glute_max'],
  adductors:['Adductors','adductors','Pulls the thigh inward; stabilises wide stances.','Groin strains in deep lunges start here.',''],
  rectus_femoris:['Rectus femoris','quads','Extends the knee and flexes the hip.','',''],
  vastus_lat:['Vastus lateralis','quads','Outer quad; knee extension.','',''],
  vastus_med:['Vastus medialis (VMO)','quads','Inner quad; tracks the kneecap.','Knee tracking on deep front-court lunges.',''],
  hams_biceps:['Biceps femoris (outer hamstring)','hamstrings','Knee flexion and hip extension.','Decelerates the lunge.',''],
  hams_semi:['Semitendinosus & semimembranosus','hamstrings','Inner hamstrings; knee flexion and hip extension.','',''],
  gastroc_med:['Gastrocnemius (inner)','calves','Plantar flexion; push-off.','Push-off and split-step.',''],
  gastroc_lat:['Gastrocnemius (outer)','calves','Plantar flexion; push-off.','',''],
  soleus:['Soleus','calves','Plantar flexion with a bent knee; endurance.','Absorbs load in bent-knee movement all match.',''],
  tib_post:['Tibialis posterior','calves','Supports the arch; inverts the foot.','Arch support on hard court cuts.','soleus'],
  tibialis_ant:['Tibialis anterior','shins','Lifts the foot; controls landing.','Shin splints and braking on landings.',''],
  peroneals:['Peroneals (fibularis)','shins','Everts the foot; ankle stability.','Your best defence against rolled ankles.','']
};

// ---------- Strength Level tables (male, kg, 1RM) at bodyweight 50..140 step 5 ----------
// Beginner, Novice, Intermediate, Advanced, Elite. Source: strengthlevel.com/strength-standards/male/kg
const SL_RAW = {
  bench:'27 41 58 78 101,32 47 65 87 110,37 53 72 95 119,42 59 79 102 128,47 64 85 110 136,51 70 92 117 144,56 75 98 124 151,60 80 104 130 158,65 85 109 137 165,69 90 115 143 172,73 95 120 149 179,77 99 125 155 185,81 104 131 160 191,85 108 135 166 197,89 113 140 171 203,93 117 145 176 209,97 121 150 181 214,100 125 154 186 220,104 129 158 191 225',
  squat:'36 55 78 106 137,43 63 88 118 150,49 71 98 129 162,56 79 107 139 174,62 86 116 149 185,69 94 124 159 196,75 101 132 168 206,81 108 140 177 216,87 115 148 186 226,93 121 156 194 235,98 128 163 203 244,104 134 170 211 253,109 140 177 218 261,115 147 184 226 270,120 152 191 233 278,125 158 197 240 285,130 164 203 247 293,135 169 209 254 300,140 175 215 261 307',
  deadlift:'46 68 96 129 164,54 77 107 141 178,61 86 117 153 191,68 95 127 164 204,75 103 137 175 216,82 111 146 186 228,89 119 155 196 239,96 127 164 205 250,102 134 172 215 260,108 141 180 224 270,114 148 188 232 279,120 155 195 241 289,126 161 203 249 298,132 168 210 257 306,137 174 217 265 315,143 180 224 272 323,148 186 231 280 331,153 192 237 287 339,159 198 243 294 346',
  ohp:'15 24 36 51 67,18 28 41 56 73,21 32 45 62 79,24 35 50 67 85,27 39 54 72 90,30 43 58 76 96,33 46 62 81 101,36 49 66 85 106,38 53 70 90 111,41 56 74 94 115,44 59 77 98 120,47 62 81 102 124,49 65 84 105 128,52 68 87 109 132,54 71 90 113 136,56 73 94 116 140,59 76 97 119 144,61 79 100 123 147,63 81 102 126 151',
  curl:'11 19 30 43 58,13 22 33 47 62,15 24 36 50 66,17 26 39 54 70,18 28 41 57 74,20 31 44 60 77,22 33 46 63 80,23 35 49 65 84,25 36 51 68 87,26 38 53 71 89,28 40 55 73 92,29 42 57 75 95,31 44 60 78 97,32 45 61 80 100,34 47 63 82 102,35 49 65 84 105,36 50 67 86 107,38 52 69 88 109,39 53 71 90 111',
  row:'23 36 52 72 94,27 41 59 80 103,31 46 65 87 111,36 51 71 94 119,40 56 77 101 127,44 61 83 107 134,48 66 88 114 141,52 71 93 120 147,56 75 99 125 154,59 79 104 131 160,63 84 108 136 166,67 88 113 142 172,70 92 118 147 178,74 96 122 152 183,77 100 127 157 188,80 103 131 161 194,84 107 135 166 199,87 111 139 170 203,90 114 143 175 208',
  clean:'29 41 57 76 96,33 46 63 82 103,37 51 69 89 110,41 56 74 94 117,45 60 79 100 123,48 64 84 106 129,52 68 88 111 135,55 72 93 116 140,59 76 97 121 146,62 80 101 126 151,65 84 106 130 156,68 87 110 134 161,71 91 113 139 165,74 94 117 143 170,77 97 121 147 174,80 100 124 151 178,83 103 128 154 182,85 106 131 158 186,88 109 134 162 190'
};
const SL = Object.fromEntries(Object.entries(SL_RAW).map(([k, s]) => [k, s.split(',').map(r => r.split(' ').map(Number))]));
const SL_NAMES = {bench:'bench press', squat:'squat', deadlift:'deadlift', ohp:'shoulder press', curl:'barbell curl', row:'bent-over row', clean:'power clean'};
const UPPER = new Set(['bench','ohp','curl','row']);
// Bodyweight-loaded standards: total load (bodyweight + added) as multiples of bodyweight. Estimated.
const BWX = { pullup:[0.84,1.10,1.43,1.79,2.16], dip:[0.90,1.20,1.55,1.95,2.35] };
// Endurance standards (reps or seconds). Estimated rule-of-thumb levels for adult men.
const ES = {
  pushup:['reps',[5,15,30,45,60]], pullup:['reps',[1,5,11,18,25]], chinup:['reps',[2,6,12,19,26]],
  dip:['reps',[2,8,18,28,40]], plank:['s',[30,60,120,180,300]], sideplank:['s',[20,45,75,120,180]],
  copenhagen:['s',[10,20,35,50,75]], wallsit:['s',[30,60,100,150,210]], slcalf:['reps',[8,15,25,35,45]],
  deadhang:['s',[15,35,60,90,120]], hlr:['reps',[2,6,12,18,25]], abwheel:['reps',[2,6,12,20,30]],
  invrow:['reps',[3,8,15,22,30]], slbridge:['reps',[8,15,25,35,50]], tibraise:['reps',[10,20,30,45,60]],
  backext:['reps',[5,15,25,35,50]], nordic:['reps',[1,3,6,10,15]], pistol:['reps',[1,2,5,10,15]],
  hollow:['s',[10,30,60,90,120]], sidelying:['reps',[10,20,30,45,60]]
};

// ---------- Exercise library ----------
// X(id, name, equipment, mode, goals, primary, secondary, strengthStd, enduranceStd, cue, bwFraction)
// mode: load (kg x reps) | bw (added kg x reps) | reps | time (s) | loadtime (kg x s)
// goals: S strength, E endurance, M mobility, F flexibility
const EX = [];
function X(id, name, eq, mode, goals, pri, sec, std, estd, cue, bwf) {
  EX.push({ id, name, eq, mode, goals: goals.split(''), pri: pri.split(' '), sec: sec ? sec.split(' ') : [], std: std || null, estd: estd || null, cue, bwf: bwf ?? 1 });
}
// Chest
X('bench_press','Barbell bench press','barbell','load','S','chest_lower chest_upper','delt_front triceps_lat triceps_long triceps_med','bench','','Shoulder blades pinned, bar to lower chest, drive feet.');
X('incline_bench','Incline barbell press','barbell','load','S','chest_upper','delt_front triceps_lat chest_lower','bench*0.8','','30° bench, bar to upper chest, elbows ~45°.');
X('decline_bench','Decline bench press','barbell','load','S','chest_lower','triceps_lat delt_front','bench*1.0','','Slight decline, touch low on the sternum.');
X('db_bench','Dumbbell bench press (per hand)','dumbbell','load','SE','chest_lower chest_upper','delt_front triceps_lat','bench*0.38','','Deep stretch at the bottom, press in a slight arc.');
X('incline_db','Incline dumbbell press (per hand)','dumbbell','load','SE','chest_upper','delt_front triceps_lat','bench*0.33','','30–45° bench; keep wrists stacked over elbows.');
X('machine_chest','Machine chest press','machine','load','SE','chest_lower','chest_upper delt_front triceps_lat','bench*0.95','','Handles at mid-chest; control the return.');
X('cable_fly','Cable fly (per side)','cable','load','SE','chest_lower','chest_upper delt_front','bench*0.18','','Soft elbows, hug a tree, squeeze at the midline.');
X('low_high_fly','Low-to-high cable fly (per side)','cable','load','SE','chest_upper','delt_front serratus','bench*0.14','','Pulleys low, sweep up to eye level.');
X('pec_deck','Pec deck','machine','load','SE','chest_lower chest_upper','delt_front','bench*0.6','','Chest up, bring pads together without shrugging.');
X('db_fly','Dumbbell fly (per hand)','dumbbell','load','S','chest_lower','chest_upper delt_front','bench*0.17','','Wide arc, stop at a deep stretch, no locking out.');
X('push_up','Push-up','bodyweight','bw','SE','chest_lower','delt_front triceps_lat serratus abs_upper','', 'pushup','Body in one line, chest to fist height.',0.64);
X('chest_dip','Chest dip','bodyweight','bw','SE','chest_lower','triceps_lat triceps_long delt_front','dip','dip','Lean forward, elbows flared slightly, shoulders below elbows.');
X('landmine_press','Landmine press (single arm)','barbell','load','SE','chest_upper delt_front','serratus triceps_lat obliques','ohp*0.7','','Press up and across; let the shoulder blade glide.');
X('doorway_stretch','Doorway pec stretch','bodyweight','time','F','chest_lower chest_upper pec_minor','delt_front','','','Forearm on the frame, step through until a stretch.');
// Shoulders
X('ohp','Overhead press (barbell)','barbell','load','S','delt_front','delt_side triceps_lat traps_upper serratus','ohp','','Squeeze glutes, press in a straight line, head through.');
X('db_shoulder_press','Dumbbell shoulder press (per hand)','dumbbell','load','SE','delt_front','delt_side triceps_lat','ohp*0.4','','Seated or standing, elbows slightly forward.');
X('arnold_press','Arnold press (per hand)','dumbbell','load','SE','delt_front delt_side','triceps_lat','ohp*0.33','','Rotate palms out as you press.');
X('machine_shoulder','Machine shoulder press','machine','load','SE','delt_front','delt_side triceps_lat','ohp*1.0','','Back flat to the pad, full range.');
X('lateral_raise','Dumbbell lateral raise (per hand)','dumbbell','load','SE','delt_side','traps_upper supraspinatus','ohp*0.17','','Lead with elbows, stop at shoulder height.');
X('cable_lateral','Cable lateral raise (per side)','cable','load','SE','delt_side','supraspinatus','ohp*0.12','','Cable behind the body for tension at the bottom.');
X('front_raise','Dumbbell front raise (per hand)','dumbbell','load','SE','delt_front','chest_upper serratus','ohp*0.2','','Raise to eye level, no swinging.');
X('upright_row','Upright row (barbell)','barbell','load','S','delt_side traps_upper','biceps brachioradialis','ohp*0.7','','Grip wider than shoulders, elbows to shoulder height.');
X('rear_delt_fly','Rear delt fly (per hand)','dumbbell','load','SE','delt_rear','traps_mid rhomboids infraspinatus','ohp*0.14','','Hinge over, sweep out with pinkies leading.');
X('reverse_pec_deck','Reverse pec deck','machine','load','SE','delt_rear','traps_mid rhomboids','ohp*0.6','','Arms long, pull back without shrugging.');
X('face_pull','Face pull (rope)','cable','load','SE','delt_rear infraspinatus','traps_mid teres_minor rhomboids','ohp*0.55','','Pull to the forehead, finish with hands beside ears.');
X('pike_pushup','Pike push-up','bodyweight','reps','SE','delt_front','triceps_lat traps_upper serratus','','','Hips high, head travels in front of the hands.');
X('band_dislocates','Band pass-throughs','band','reps','M','delt_front delt_rear pec_minor','chest_upper traps_lower','','','Wide grip, arc the band overhead and behind.');
X('cross_body','Cross-body shoulder stretch','bodyweight','time','F','delt_rear infraspinatus','teres_minor','','','Pull the arm across at shoulder height.');
X('sleeper_stretch','Sleeper stretch','bodyweight','time','F','infraspinatus teres_minor','delt_rear','','','Lie on the side, gently press the forearm down.');
X('wall_slides','Wall slides','bodyweight','reps','M','traps_lower serratus','delt_front','','','Back and forearms on the wall, slide up keeping contact.');
// Rotator cuff
X('cable_er','Cable external rotation (per side)','cable','load','SE','infraspinatus teres_minor','delt_rear','ohp*0.11','','Elbow tucked on a towel, rotate out slowly.');
X('sidelying_er','Side-lying external rotation (per hand)','dumbbell','load','SE','infraspinatus teres_minor','delt_rear','ohp*0.09','','Elbow on the hip, rotate the forearm up.');
X('cable_ir','Cable internal rotation (per side)','cable','load','SE','subscapularis','chest_lower','ohp*0.15','','Elbow tucked, rotate the hand across the belly.');
X('er_9090','90/90 band external rotation','band','reps','SEM','infraspinatus teres_minor','supraspinatus traps_lower','','','Elbow at shoulder height, rotate up and back.');
X('full_can','Full-can scaption raise (per hand)','dumbbell','load','SE','supraspinatus','delt_side delt_front serratus','ohp*0.1','','Thumbs up, raise 30° in front of the side.');
X('cuban_press','Cuban press (per hand)','dumbbell','load','SE','infraspinatus delt_rear','traps_mid supraspinatus','ohp*0.13','','Upright row, rotate up, then press.');
X('shoulder_cars','Shoulder CARs','bodyweight','reps','M','supraspinatus infraspinatus subscapularis teres_minor','delt_front delt_rear','','','Slow, biggest possible circle, ribs stay still.');
X('band_scaption','Band scaption (0–60°)','band','reps','SE','supraspinatus','delt_side serratus','','','Thumbs up, raise in the scapular plane, slow.');
X('band_ir','90/90 band internal rotation','band','reps','SE','subscapularis','chest_lower','','','Elbow at shoulder height, rotate forward and down.');
X('belly_press','Belly press isometric','bodyweight','time','E','subscapularis','chest_lower','','','Press the palm into the belly, elbow forward.');
X('pec_minor_stretch','Corner pec minor stretch','bodyweight','time','F','pec_minor','chest_upper delt_front','','','Arm high on the wall, rotate the chest away.');
X('tfl_stretch','Standing TFL stretch','bodyweight','time','F','tfl','glute_med','','','Cross the leg behind, push the hip out to the side.');
// Upper back
X('barbell_shrug','Barbell shrug','barbell','load','S','traps_upper','forearm_flex','deadlift*0.9','','Straight up to the ears, pause, no rolling.');
X('db_shrug','Dumbbell shrug (per hand)','dumbbell','load','SE','traps_upper','forearm_flex','deadlift*0.38','','Arms long, lift and hold for a second.');
X('bent_row','Bent-over row (barbell)','barbell','load','S','lats traps_mid rhomboids','delt_rear biceps erectors teres_major','row','','Hinge to ~45°, pull to the lower ribs.');
X('chest_supported_row','Chest-supported row (per hand)','dumbbell','load','SE','traps_mid rhomboids','lats delt_rear biceps','row*0.42','','Chest on an incline bench, squeeze shoulder blades.');
X('prone_y','Prone Y raise (per hand)','dumbbell','load','SE','traps_lower','delt_rear supraspinatus','ohp*0.06','','Face down on incline, thumbs up, raise in a Y.');
X('scap_pullup','Scapular pull-up','bodyweight','reps','SE','traps_lower lats','rhomboids','','','Hang, pull shoulders down without bending elbows.');
X('band_pull_apart','Band pull-apart','band','reps','SEM','delt_rear rhomboids traps_mid','infraspinatus','','','Arms straight, pull to the chest, slow return.');
X('farmer_carry','Farmer carry (per hand)','dumbbell','loadtime','SE','forearm_flex traps_upper','obliques glute_med ql','','','Tall posture, short quick steps.');
X('thoracic_ext','Foam roller thoracic extension','other','time','M','erectors rhomboids','traps_mid','','','Roller under the upper back, hands behind head, arch over.');
X('thread_needle','Thread the needle','bodyweight','reps','M','rhomboids traps_mid obliques','delt_rear','','','On all fours, reach under and rotate open.');
X('power_clean','Power clean','barbell','load','S','traps_upper glute_max hams_biceps vastus_lat','delt_front erectors gastroc_med forearm_flex','clean','','Push the floor, explode tall, fast elbows.');
// Lats
X('pull_up','Pull-up','bodyweight','bw','SE','lats','teres_major biceps brachialis traps_lower rhomboids','pullup','pullup','Dead hang to chin over bar; add weight with a belt.');
X('chin_up','Chin-up','bodyweight','bw','SE','lats biceps','teres_major brachialis','pullup*1.05','chinup','Palms facing you, chest to the bar.');
X('lat_pulldown','Lat pulldown','cable','load','SE','lats','teres_major biceps rhomboids','row*1.0','','Pull to the collarbone, elbows down to the ribs.');
X('cg_pulldown','Close-grip pulldown','cable','load','SE','lats teres_major','teres_major biceps','row*0.95','','Neutral handle, lean back slightly.');
X('cable_row','Seated cable row','cable','load','SE','lats traps_mid rhomboids','biceps delt_rear teres_major','row*0.95','','Chest tall, pull to the belly, pause.');
X('db_row','One-arm dumbbell row (per hand)','dumbbell','load','SE','lats','teres_major traps_mid rhomboids biceps','row*0.5','','Pull the elbow toward the hip pocket.');
X('tbar_row','T-bar row','barbell','load','S','lats traps_mid rhomboids','delt_rear biceps erectors','row*1.0','','Flat back, pull the handle to the chest.');
X('straight_arm_pd','Straight-arm pulldown','cable','load','SE','lats teres_major','triceps_long abs_upper','row*0.35','','Arms long, sweep the bar to the thighs.');
X('db_pullover','Dumbbell pullover','dumbbell','load','SE','lats chest_lower','teres_major triceps_long serratus','bench*0.3','','Across a bench, long arc behind the head.');
X('inverted_row','Inverted row','bodyweight','bw','SE','traps_mid rhomboids lats','delt_rear biceps','','invrow','Body straight under a bar, chest to the bar.',0.55);
X('dead_hang','Dead hang','bodyweight','time','EF','lats forearm_flex','teres_major traps_lower','','deadhang','Relax the shoulders up, hold as long as you can.');
X('lat_stretch','Kneeling lat stretch','bodyweight','time','F','lats teres_major','triceps_long','','','Elbows on a bench, sit hips back, head through.');
// Biceps
X('barbell_curl','Barbell curl','barbell','load','S','biceps','brachialis brachioradialis forearm_flex','curl','','Elbows pinned, no hip drive.');
X('ez_curl','EZ-bar curl','barbell','load','SE','biceps','brachialis brachioradialis','curl*0.95','','Angled grip, full stretch at the bottom.');
X('db_curl','Dumbbell curl (per hand)','dumbbell','load','SE','biceps','brachialis brachioradialis','curl*0.45','','Supinate as you lift.');
X('incline_curl','Incline dumbbell curl (per hand)','dumbbell','load','SE','biceps','brachialis','curl*0.38','','Arms hang behind the body for a long-head stretch.');
X('hammer_curl','Hammer curl (per hand)','dumbbell','load','SE','brachialis brachioradialis','biceps','curl*0.5','','Neutral grip, thumbs up.');
X('preacher_curl','Preacher curl','barbell','load','SE','biceps brachialis','brachioradialis','curl*0.8','','Armpits on the pad, control the bottom.');
X('cable_curl','Cable curl','cable','load','SE','biceps','brachialis','curl*0.85','','Constant tension, squeeze at the top.');
X('reverse_curl','Reverse curl','barbell','load','SE','brachioradialis brachialis','forearm_ext biceps','curl*0.7','','Overhand grip, wrists straight.');
X('conc_curl','Concentration curl (per hand)','dumbbell','load','SE','biceps','brachialis','curl*0.4','','Elbow on the inner thigh, slow lowering.');
X('biceps_stretch','Wall biceps stretch','bodyweight','time','F','biceps','delt_front chest_upper','','','Palm on the wall behind you, turn away.');
// Triceps
X('cg_bench','Close-grip bench press','barbell','load','S','triceps_lat triceps_med triceps_long','chest_lower delt_front','bench*0.88','','Hands shoulder-width, elbows tucked.');
X('skull_crusher','Skull crusher (EZ bar)','barbell','load','SE','triceps_long triceps_lat','triceps_med','bench*0.35','','Lower behind the head, upper arms still.');
X('pushdown','Cable pushdown (bar)','cable','load','SE','triceps_lat triceps_med','triceps_long','bench*0.4','','Elbows at your sides, lock out fully.');
X('rope_pushdown','Rope pushdown','cable','load','SE','triceps_lat','triceps_med triceps_long','bench*0.33','','Split the rope at the bottom.');
X('oh_extension','Overhead cable extension','cable','load','SE','triceps_long','triceps_lat triceps_med','bench*0.3','','Face away, elbows by the ears, full stretch.');
X('tri_dip','Triceps dip','bodyweight','bw','SE','triceps_lat triceps_long triceps_med','chest_lower delt_front','dip','dip','Torso upright, elbows back.');
X('diamond_pushup','Diamond push-up','bodyweight','reps','SE','triceps_lat triceps_med','chest_lower delt_front','','','Hands together under the chest.');
X('kickback','Dumbbell kickback (per hand)','dumbbell','load','SE','triceps_lat triceps_long','triceps_med','bench*0.12','','Upper arm parallel to the floor, straighten fully.');
X('tri_stretch','Overhead triceps stretch','bodyweight','time','F','triceps_long','lats','','','Hand down the spine, other hand eases the elbow.');
// Forearms
X('wrist_curl','Barbell wrist curl','barbell','load','SE','forearm_flex','','curl*0.75','','Forearms on a bench, roll the bar to the fingers and back.');
X('rev_wrist_curl','Reverse wrist curl','barbell','load','SE','forearm_ext','brachioradialis','curl*0.4','','Overhand grip, lift the knuckles.');
X('wrist_roller','Wrist roller','other','loadtime','E','forearm_ext forearm_flex','brachioradialis','','','Roll the weight up and down with arms out.');
X('plate_pinch','Plate pinch hold','other','loadtime','SE','forearm_flex','forearm_ext','','','Pinch smooth plates together, hold.');
X('hammer_lever','Hammer levering (radial/ulnar)','other','reps','SE','forearm_ext forearm_flex brachioradialis','','','','Hold a hammer by the end, tilt it up and down slowly.');
X('pro_sup','Pronation / supination','dumbbell','reps','SE','forearm_flex forearm_ext brachioradialis','biceps','','','Elbow at 90°, rotate a light dumbbell side to side.');
X('wrist_flex_stretch','Wrist flexor stretch','bodyweight','time','F','forearm_flex','','','','Arm straight, palm up, pull fingers back.');
X('wrist_ext_stretch','Wrist extensor stretch','bodyweight','time','F','forearm_ext','brachioradialis','','','Arm straight, palm down, bend the wrist.');
// Core
X('plank','Front plank','bodyweight','time','E','abs_upper abs_lower tva','obliques serratus','','plank','Glutes tight, ribs down, straight line.');
X('side_plank','Side plank','bodyweight','time','E','obliques ql','glute_med tva','','sideplank','Hips stacked and high.');
X('hlr','Hanging leg raise','bodyweight','reps','SE','abs_lower hip_flexors','abs_upper obliques forearm_flex','','hlr','Curl the pelvis up, no swinging.');
X('ab_wheel','Ab wheel rollout','other','reps','SE','abs_upper abs_lower tva','lats serratus hip_flexors','','abwheel','Ribs tucked, roll as far as you can control.');
X('cable_crunch','Cable crunch','cable','load','SE','abs_upper abs_lower','obliques','','','Kneel, curl the ribs to the hips.');
X('pallof','Pallof press','cable','load','SE','obliques tva','abs_upper glute_med','','','Press out and resist the rotation.');
X('woodchop','Cable woodchop','cable','load','SE','obliques','abs_upper serratus delt_front','','','Rotate from the hips, arms just guide.');
X('dead_bug','Dead bug','bodyweight','reps','E','tva abs_lower','hip_flexors','','','Low back pressed down, opposite arm and leg.');
X('hollow_hold','Hollow body hold','bodyweight','time','E','abs_upper abs_lower tva','hip_flexors','','hollow','Low back glued to the floor, legs low.');
X('serratus_punch','Cable serratus punch','cable','load','SE','serratus','chest_lower','','','Arm straight, reach the fist forward.');
X('scap_pushup','Scapular push-up','bodyweight','reps','SE','serratus','chest_lower traps_lower','','','Plank, spread the shoulder blades apart.');
X('cobra','Cobra stretch','bodyweight','time','F','abs_upper abs_lower','hip_flexors','','','Hips down, press the chest up gently.');
X('open_book','Open book rotation','bodyweight','reps','M','obliques rhomboids','chest_lower','','','Side-lying, knees stacked, rotate the top arm open.');
X('suitcase_carry','Suitcase carry','dumbbell','loadtime','SE','ql obliques','forearm_flex glute_med','','','One heavy weight, stay perfectly upright.');
X('med_ball_rot','Rotational med-ball throw','other','reps','SE','obliques','glute_max serratus delt_front','','','Load the back hip, rotate and release into a wall.');
// Lower back
X('deadlift','Deadlift','barbell','load','S','erectors glute_max hams_semi hams_biceps','traps_upper lats forearm_flex adductors vastus_lat','deadlift','','Bar over midfoot, wedge in, push the floor away.');
X('rdl','Romanian deadlift','barbell','load','SE','hams_semi hams_biceps glute_max','erectors forearm_flex adductors','deadlift*0.75','','Soft knees, hips back, bar stays on the legs.');
X('good_morning','Good morning','barbell','load','S','hams_semi hams_biceps erectors','glute_max','deadlift*0.45','','Bar on back, hinge until hamstrings stop you.');
X('back_ext','Back extension','bodyweight','reps','SE','erectors','glute_max hams_semi','','backext','Hinge at the hips, finish neutral, no hyperextension.');
X('bird_dog','Bird dog','bodyweight','reps','E','erectors tva','glute_max delt_rear','','','Reach long, keep the hips level.');
X('cat_cow','Cat–cow','bodyweight','reps','M','erectors','abs_upper','','','Move one vertebra at a time.');
X('ql_stretch','Standing side-bend stretch','bodyweight','time','F','ql obliques','lats','','','Cross one leg behind, reach overhead and over.');
// Glutes & hips
X('hip_thrust','Barbell hip thrust','barbell','load','SE','glute_max','hams_semi adductors glute_med','deadlift*0.95','','Shins vertical at the top, chin tucked.');
X('sl_bridge','Single-leg glute bridge','bodyweight','reps','SE','glute_max','hams_biceps glute_med','','slbridge','Drive through the heel, hips level.');
X('cable_kickback','Cable glute kickback (per side)','cable','load','SE','glute_max','hams_semi','squat*0.18','','Hinge slightly, kick back and up.');
X('hip_abduction','Hip abduction machine','machine','load','SE','glute_med glute_min tfl','glute_max','squat*0.6','','Lean forward slightly to bias glute med.');
X('cable_abduction','Standing cable hip abduction (per side)','cable','load','SE','glute_med glute_min','tfl','squat*0.15','','Cuff on the ankle, swing out without leaning.');
X('sidelying_abd','Side-lying hip abduction','bodyweight','reps','E','glute_med glute_min','tfl','','sidelying','Toes slightly down, lift from the hip.');
X('lateral_walk','Banded lateral walk','band','reps','E','glute_med glute_min','tfl glute_max','','','Band at the ankles, half squat, step wide.');
X('clamshell','Banded clamshell','band','reps','E','glute_med deep_rotators','glute_min','','','Heels together, open the knee, pelvis still.');
X('fire_hydrant','Fire hydrant','bodyweight','reps','E','glute_med deep_rotators','glute_min','','','On all fours, lift the knee out to the side.');
X('hip_airplane','Hip airplane','bodyweight','reps','SM','deep_rotators glute_med glute_min','glute_max adductors','','','Single-leg hinge, rotate the pelvis open and closed.');
X('copenhagen','Copenhagen plank','bodyweight','time','SE','adductors','obliques glute_med','','copenhagen','Top leg on a bench, lift the body in a side plank.');
X('hip_adduction','Hip adduction machine','machine','load','SE','adductors','','squat*0.6','','Controlled squeeze, slow return.');
X('cossack','Cossack squat','bodyweight','reps','SME','adductors glute_max','vastus_med hip_flexors','','','Shift deep to one side, other leg straight, toes up.');
X('lateral_lunge','Lateral lunge (per hand)','dumbbell','load','SE','adductors glute_max vastus_med','glute_med vastus_lat','squat*0.18','','Step wide, sit back into the hip.');
X('sl_rdl','Single-leg RDL (per hand)','dumbbell','load','SE','hams_semi glute_max glute_med','erectors deep_rotators peroneals','deadlift*0.2','','Hips square, back leg long.');
X('step_up','Step-up (per hand)','dumbbell','load','SE','glute_max vastus_lat vastus_med','glute_med rectus_femoris','squat*0.2','','Knee-height box, drive through the front heel.');
X('bss','Bulgarian split squat (per hand)','dumbbell','load','SE','vastus_lat vastus_med glute_max','adductors glute_med rectus_femoris','squat*0.25','','Rear foot on a bench, drop straight down.');
X('hanging_knee','Hanging knee raise','bodyweight','reps','SE','hip_flexors abs_lower','rectus_femoris','','','Knees to the chest, lower slowly.');
X('cable_hip_flex','Cable hip flexion (per side)','cable','load','SE','hip_flexors rectus_femoris','tfl','squat*0.12','','Cuff on the ankle, drive the knee up.');
X('psoas_march','Banded psoas march','band','reps','E','hip_flexors','abs_lower','','','On your back, band on the feet, march one knee in.');
X('couch_stretch','Couch stretch','bodyweight','time','F','hip_flexors rectus_femoris','tfl','','','Back knee against a wall, squeeze the glute.');
X('kneeling_hf','Half-kneeling hip flexor stretch','bodyweight','time','F','hip_flexors','rectus_femoris','','','Tuck the pelvis, shift forward gently.');
X('pigeon','Pigeon stretch','bodyweight','time','F','deep_rotators glute_max glute_med','tfl','','','Front shin across, square the hips, fold forward.');
X('figure4','Figure-4 stretch','bodyweight','time','F','deep_rotators glute_max','','','','Ankle over knee on your back, pull the thigh in.');
X('hip_9090','90/90 hip switches','bodyweight','reps','M','deep_rotators glute_med glute_min','hip_flexors adductors','','','Seated, both knees at 90°, rotate side to side.');
X('hip_cars','Hip CARs','bodyweight','reps','M','deep_rotators glute_med hip_flexors adductors','glute_min','','','On all fours, draw the biggest slow circle with the knee.');
X('frog_stretch','Frog stretch','bodyweight','time','F','adductors','','','','Knees wide on the floor, rock the hips back.');
X('butterfly','Butterfly stretch','bodyweight','time','F','adductors','hip_flexors','','','Soles together, press knees down gently.');
X('tfl_roll','TFL / IT band foam roll','other','time','M','tfl vastus_lat','','','','Slow passes, pause on tender spots.');
X('glute_ball','Glute ball release','other','time','M','glute_med glute_min','deep_rotators','','','Lacrosse ball on the side of the hip, breathe.');
X('lateral_bound','Lateral bound','bodyweight','reps','SE','glute_med vastus_lat glute_max','adductors peroneals gastroc_lat','','','Leap sideways, stick the landing on one leg.');
// Quads
X('back_squat','Back squat','barbell','load','S','vastus_lat vastus_med rectus_femoris glute_max','adductors erectors hams_semi soleus','squat','','Brace, sit between the hips, knees track the toes.');
X('front_squat','Front squat','barbell','load','S','vastus_lat vastus_med rectus_femoris','glute_max abs_upper erectors','squat*0.82','','Elbows high, stay upright.');
X('leg_press','Leg press','machine','load','SE','vastus_lat vastus_med','glute_max rectus_femoris adductors','squat*1.8','','Lower until hips start to curl, push through midfoot.');
X('hack_squat','Hack squat','machine','load','SE','vastus_lat vastus_med rectus_femoris','glute_max','squat*1.1','','Feet low on the plate for more quad.');
X('leg_ext','Leg extension','machine','load','SE','rectus_femoris vastus_lat vastus_med','','squat*0.55','','Pause and squeeze at the top.');
X('goblet_squat','Goblet squat','dumbbell','load','SE','vastus_med vastus_lat glute_max','adductors abs_upper','squat*0.4','','Hold the weight at the chest, elbows inside knees.');
X('walking_lunge','Walking lunge (per hand)','dumbbell','load','SE','vastus_lat vastus_med glute_max','adductors glute_med rectus_femoris','squat*0.22','','Long stride, back knee kisses the floor.');
X('sissy_squat','Sissy squat','bodyweight','reps','SE','rectus_femoris vastus_med','vastus_lat','','','Heels up, knees forward, hips stay extended.');
X('wall_sit','Wall sit','bodyweight','time','E','vastus_med vastus_lat rectus_femoris','glute_max','','wallsit','Thighs parallel, back flat on the wall.');
X('pistol','Pistol squat','bodyweight','reps','SE','vastus_med vastus_lat glute_max','glute_med adductors soleus','','pistol','One leg, other straight in front, full depth.');
X('petersen','Petersen step-up','bodyweight','reps','SE','vastus_med','rectus_femoris','','','On a low step, heel up, knee drives over the toes.');
X('reverse_nordic','Reverse Nordic','bodyweight','reps','SF','rectus_femoris vastus_lat vastus_med','hip_flexors','','','Kneel tall, lean back from the knees in one line.');
X('quad_stretch','Standing quad stretch','bodyweight','time','F','rectus_femoris vastus_lat','hip_flexors','','','Heel to the glute, knees together, tuck the pelvis.');
// Hamstrings
X('lying_leg_curl','Lying leg curl','machine','load','SE','hams_biceps hams_semi','gastroc_med gastroc_lat','deadlift*0.33','','Hips pressed down, curl fully.');
X('seated_leg_curl','Seated leg curl','machine','load','SE','hams_semi hams_biceps','gastroc_med','deadlift*0.38','','Lean forward for a longer stretch.');
X('nordic','Nordic hamstring curl','bodyweight','reps','S','hams_biceps hams_semi','gastroc_med gastroc_lat','','nordic','Anchor the ankles, lower as slowly as you can.');
X('ball_curl','Stability ball leg curl','other','reps','E','hams_semi hams_biceps','glute_max','','','Hips up, roll the ball in with the heels.');
X('kb_swing','Kettlebell swing','kettlebell','load','SE','glute_max hams_semi hams_biceps','erectors abs_upper forearm_flex','deadlift*0.25','','Hike it back, snap the hips, float to chest height.');
X('ham_stretch','Supine hamstring strap stretch','band','time','F','hams_semi hams_biceps','gastroc_med','','','Leg straight up with a strap, other leg flat.');
X('leg_swings','Dynamic leg swings','bodyweight','reps','M','hams_biceps hams_semi hip_flexors adductors','glute_med','','','Front-back and side-to-side, grow the range.');
// Calves
X('standing_calf','Standing calf raise','machine','load','SE','gastroc_med gastroc_lat','soleus tib_post peroneals','squat*1.2','','Full stretch, pause at the top.');
X('seated_calf','Seated calf raise','machine','load','SE','soleus','gastroc_med tib_post','squat*0.7','','Knees bent 90°, slow reps.');
X('sl_calf','Single-leg calf raise','bodyweight','reps','E','gastroc_med gastroc_lat soleus','tib_post peroneals','','slcalf','Off a step, full range, no bouncing.');
X('calf_press','Leg-press calf press','machine','load','SE','gastroc_med gastroc_lat','soleus','squat*1.4','','Balls of the feet on the edge, knees soft.');
X('ball_heel_raise','Heel raise with ball squeeze','bodyweight','reps','SE','tib_post','gastroc_med soleus','','','Ball between the ankles, rise high onto the big toe.');
X('band_inversion','Banded ankle inversion','band','reps','SE','tib_post','tibialis_ant','','','Turn the sole inward against the band.');
X('pogo','Pogo hops','bodyweight','reps','E','gastroc_med gastroc_lat soleus','peroneals','','','Stiff ankles, quick small hops.');
X('calf_stretch','Straight-knee calf stretch','bodyweight','time','F','gastroc_med gastroc_lat','','','','Back heel down, knee locked, lean into a wall.');
X('soleus_stretch','Bent-knee soleus stretch','bodyweight','time','F','soleus','tib_post','','','Same as the calf stretch with the back knee bent.');
// Shins & ankles
X('tib_raise','Tibialis raise','bodyweight','reps','SE','tibialis_ant','peroneals','','tibraise','Back against a wall, lift the toes high.');
X('band_dorsi','Banded dorsiflexion','band','reps','SE','tibialis_ant','','','','Band over the forefoot, pull the toes up.');
X('band_eversion','Banded ankle eversion','band','reps','SE','peroneals','','','','Turn the sole outward against the band.');
X('sl_balance','Single-leg balance (eyes closed)','bodyweight','time','EM','peroneals tib_post tibialis_ant','glute_med deep_rotators','','','Soft knee, hold steady.');
X('knee_to_wall','Knee-to-wall ankle mobilisation','bodyweight','reps','M','soleus gastroc_med','tibialis_ant','','','Drive the knee past the toes, heel down.');
X('ankle_cars','Ankle CARs','bodyweight','reps','M','tibialis_ant peroneals tib_post','soleus','','','Slow full circles with the foot.');
X('shin_stretch','Kneeling shin stretch','bodyweight','time','F','tibialis_ant','','','','Kneel on the tops of the feet, lean back.');
// Neck
X('neck_flexion','Neck flexion (plate or band)','other','reps','SE','scm','','','','Lying on a bench, nod chin to chest slowly.');
X('neck_iso','Neck isometrics','bodyweight','time','E','scm','traps_upper','','','Press the head into your hand, no movement.');
X('chin_tuck','Chin tuck','bodyweight','reps','E','scm','','','','Glide the head straight back, double chin.');
X('neck_stretch','Lateral neck stretch','bodyweight','time','F','scm traps_upper','','','','Ear to shoulder, opposite hand reaches down.');
X('trap_stretch','Upper trap stretch','bodyweight','time','F','traps_upper','scm','','','Look down to the armpit, ease the head with a hand.');

let EXI = Object.fromEntries(EX.map(e => [e.id, e]));
const EQUIP = {barbell:'Barbell', dumbbell:'Dumbbell', cable:'Cable', machine:'Machine', bodyweight:'Bodyweight', band:'Band', kettlebell:'Kettlebell', other:'Other'};
const GOALS = {S:'Strength', E:'Endurance', M:'Mobility', F:'Flexibility'};

// Baseline assessment tests
const ASSESS = [
  ['bench_press','Your best recent set of bench press.'],
  ['back_squat','Your best recent back squat set.'],
  ['deadlift','Your best recent deadlift set.'],
  ['ohp','Standing barbell overhead press.'],
  ['bent_row','Barbell bent-over row.'],
  ['pull_up','Strict pull-ups. Enter added weight if you use a belt, or 0.'],
  ['barbell_curl','Strict barbell curl.'],
  ['hip_abduction','Seated hip abduction machine. A quick read on glute med.'],
  ['push_up','Max push-ups in one set, added weight 0.'],
  ['plank','Longest front plank hold.'],
  ['side_plank','Longest side plank, weaker side.'],
  ['copenhagen','Copenhagen plank, weaker side. A squash groin check.']
];

// ================= Library v2: additions from Minimalift, ALIGN, RELOAD and Sid's notes =================
GOALS.P = 'Power';
EQUIP.trx = 'TRX / rings'; EQUIP.medball = 'Med ball'; EQUIP.landmine = 'Landmine'; EQUIP.sled = 'Sled';

// Plain-language location for every muscle
const WHERE = {
  scm:'Side of neck', traps_upper:'Top of shoulders', traps_mid:'Between shoulder blades', traps_lower:'Below shoulder blades',
  rhomboids:'Between shoulder blades (deep)', delt_front:'Front of shoulder', delt_side:'Side of shoulder', delt_rear:'Back of shoulder',
  infraspinatus:'Back of shoulder blade', teres_minor:'Outer edge of shoulder blade', supraspinatus:'Top of shoulder blade',
  subscapularis:'Underside of shoulder blade', lats:'Sides of the back', teres_major:'Back of armpit',
  chest_upper:'Upper chest', chest_lower:'Main chest', pec_minor:'Under the upper chest',
  biceps:'Front of upper arm', brachialis:'Under the biceps', triceps_long:'Back of arm, inner', triceps_lat:'Back of arm, outer',
  triceps_med:'Back of arm, deep', brachioradialis:'Top of forearm', forearm_flex:'Inner forearm (grip)', forearm_ext:'Outer forearm',
  abs_upper:'Upper six-pack', abs_lower:'Lower belly', obliques:'Sides of the waist', serratus:'Side of the ribs',
  tva:'Deep core belt', erectors:'Along the spine', ql:'Low back, deep side', glute_max:'Main butt muscle',
  glute_med:'Side of hip', glute_min:'Side of hip (deep)', hip_flexors:'Front of hip', tfl:'Front-side of hip',
  deep_rotators:'Deep in the buttock', adductors:'Inner thigh (groin)', rectus_femoris:'Front of thigh, centre',
  vastus_lat:'Outer thigh', vastus_med:'Inner knee (teardrop)', hams_biceps:'Back of thigh, outer', hams_semi:'Back of thigh, inner',
  gastroc_med:'Inner calf', gastroc_lat:'Outer calf', soleus:'Lower calf (deep)', tib_post:'Deep calf and arch',
  tibialis_ant:'Front of shin', peroneals:'Outer lower leg'
};

// Goal tweaks on v1 exercises (make tags match how the drill is really used)
const RETAG = {
  med_ball_rot:'PS', pogo:'PE', lateral_bound:'PS', kb_swing:'PSE', power_clean:'PS', hip_airplane:'SMF', cossack:'SMF',
  er_9090:'SEM', band_pull_apart:'SEM', leg_swings:'MF', thread_needle:'MF', open_book:'MF', cat_cow:'MF', bird_dog:'EM',
  sl_balance:'EM', farmer_carry:'SE', suitcase_carry:'SE', wall_slides:'MS', scap_pushup:'SEM', scap_pullup:'SEM', dead_hang:'EF',
  reverse_nordic:'SF', sissy_squat:'SF', db_fly:'SF', db_pullover:'SF', incline_curl:'SEF', oh_extension:'SEF', rdl:'SEF',
  sl_rdl:'SEM', jefferson:'MF', shoulder_cars:'M', hip_cars:'M', ankle_cars:'M', hip_9090:'MF'
};
for (const [id, g] of Object.entries(RETAG)) { const e = EX.find(x => x.id === id); if (e) e.goals = g.split(''); }

// ---------- Strength & power: lower body ----------
X('trap_bar_dl','Trap bar deadlift','barbell','load','S','glute_max vastus_lat erectors hams_semi','traps_upper forearm_flex vastus_med adductors','deadlift*1.05','','Stand in the middle, chest tall, push the floor away.');
X('db_deadlift','Dumbbell deadlift (per hand)','dumbbell','load','SE','glute_max hams_semi erectors','forearm_flex vastus_lat traps_upper','deadlift*0.32','','Bells beside the feet, hinge and stand tall.');
X('paused_dl','Paused deadlift','barbell','load','S','erectors glute_max hams_semi hams_biceps','lats forearm_flex','deadlift*0.85','','Pause 2 s just off the floor, keep the bar glued to the shins.');
X('banded_trap_dl','Banded trap bar deadlift','barbell','load','SP','glute_max vastus_lat erectors','hams_semi forearm_flex','deadlift*0.8','','Band adds load at the top; stand up fast.');
X('staggered_dl','Banded staggered-stance deadlift','band','reps','SE','hams_semi glute_max','glute_med erectors','','','Most weight on the front leg, back toe for balance.');
X('db_rdl','Dumbbell RDL (per hand)','dumbbell','load','SEF','hams_semi hams_biceps glute_max','erectors forearm_flex','deadlift*0.3','','Hinge back, bells slide down the thighs, feel the stretch.');
X('sl_landmine_rdl','Single-leg landmine RDL','landmine','load','SE','hams_semi glute_max glute_med','peroneals deep_rotators erectors','','','Hold the sleeve on the standing-leg side, hinge square.');
X('seated_gm','Seated good morning','barbell','load','SF','erectors hams_semi','glute_max adductors','','','Sit wide, bar on back, fold forward with a flat back.');
X('zercher_gm','Zercher good morning','barbell','load','S','erectors hams_semi glute_max','abs_upper biceps','','','Bar in the elbow crooks, hinge with a braced core.');
X('horse_gm','Horse-stance good morning','bodyweight','reps','MF','adductors hams_semi erectors','glute_max','','','Wide stance, toes out, hinge and feel the inner thighs.');
X('hyper_45','45° hyperextension','bodyweight','bw','SE','erectors glute_max hams_semi','hams_biceps','','backext','Hips on the pad, round down and extend to neutral.',0.5);
X('mb_back_ext','Med-ball loaded back extension','medball','load','SE','erectors glute_max','hams_semi','','','Hug the ball, extend to a straight line.');
X('reverse_hyper','Reverse hyperextension','machine','load','SE','glute_max erectors hams_semi','hams_biceps','','','Swing the legs up with the glutes, not momentum.');
X('box_squat','Box squat','barbell','load','S','glute_max vastus_lat vastus_med','adductors hams_semi erectors','squat*0.95','','Sit back to the box, pause, drive up.');
X('pause_squat','Paused back squat','barbell','load','S','vastus_lat vastus_med glute_max','adductors erectors','squat*0.85','','Pause 2 s in the hole without relaxing.');
X('pin_squat','Pin squat','barbell','load','S','vastus_lat vastus_med glute_max','adductors erectors','squat*0.8','','Lower onto the pins, stop dead, stand up.');
X('zercher_squat','Eccentric Zercher squat','barbell','load','S','vastus_med vastus_lat glute_max','abs_upper biceps erectors','squat*0.7','','Bar in the elbows, 4 s down, stay upright.');
X('landmine_hack','Landmine hack squat','landmine','load','SE','vastus_lat vastus_med rectus_femoris','glute_max','','','Bar on the shoulder, feet forward, knees travel.');
X('smith_split','Smith machine split squat','machine','load','S','vastus_lat vastus_med glute_max','adductors rectus_femoris','squat*0.55','','Long stance, drop the back knee straight down.');
X('split_squat','Heavy split squat (per hand)','dumbbell','load','S','vastus_lat vastus_med glute_max','adductors rectus_femoris glute_med','squat*0.28','','Long stance, front shin slightly forward, drive through the whole foot.');
X('rnt_split','RNT split squat','band','reps','SE','vastus_med','rectus_femoris glute_med','','','Band pulls the knee in; push it out and forward.');
X('ffe_bss','Front-foot-elevated Bulgarian split squat','dumbbell','load','SF','vastus_med vastus_lat glute_max','adductors hip_flexors','squat*0.22','','Small plate under the front foot for deeper range.');
X('deficit_offset_split','Deficit offset-rack split squat','kettlebell','load','SE','vastus_lat glute_max glute_med','obliques adductors','','','One bell racked on one side, resist leaning.');
X('kb_drop_split','Alternating KB drop split squat','kettlebell','load','PE','vastus_lat vastus_med glute_max','adductors','','','Drop fast into the split, stick it, switch.');
X('single_leg_press','Single-leg press','machine','load','SE','vastus_lat vastus_med glute_max','glute_med','squat*0.9','','One foot centred, hips stay flat on the pad.');
X('deficit_rev_lunge','Deficit reverse lunge (per hand)','dumbbell','load','SE','glute_max vastus_med vastus_lat','adductors hip_flexors','squat*0.22','','Front foot on a plate, step back deep.');
X('ffe_rev_lunge','Front-foot-elevated barbell reverse lunge','barbell','load','S','glute_max vastus_lat vastus_med','adductors','squat*0.45','','Bar on back, step back off the plate.');
X('glider_rev_lunge','Glider speed reverse lunge','other','reps','PE','glute_max vastus_lat','hams_semi adductors','','','Slide back fast, drive the knee up.');
X('alt_fwd_lunge','Alternating forward lunge (per hand)','dumbbell','load','SE','vastus_lat vastus_med glute_max','adductors','squat*0.2','','Step forward, push back to standing.');
X('marching_lunge','Marching walking lunge','dumbbell','load','SE','vastus_lat glute_max glute_med','hip_flexors rectus_femoris','','','Lunge, then drive the back knee into a march.');
X('curtsy_lunge','Landmine curtsy lunge + knee drive','landmine','reps','SE','glute_med glute_max vastus_lat','adductors','','','Step back and across, then drive the knee up.');
X('side_squat','Side squat (weighted lateral squat)','kettlebell','load','SEM','adductors glute_max vastus_med','glute_med hams_semi','squat*0.2','','Wide stance, sit into one hip, other leg long.');
X('kb_rack_lat_lunge','KB rack lateral lunge + knee drive','kettlebell','load','SE','adductors glute_max glute_med','vastus_med obliques','','','Push off the bent leg straight into a knee drive.');
X('glider_lat_lunge','Glider KB lateral lunge','kettlebell','load','SEF','adductors glute_max','vastus_med glute_med','','','Slide one foot out, sit back into the other hip.');
X('poliquin_step','Poliquin step-up','bodyweight','reps','SE','vastus_med','rectus_femoris tibialis_ant','','','Heel on a slant board, knee drives over toes.');
X('box_step_over','Box step-over','dumbbell','load','SE','glute_max vastus_lat','glute_med gastroc_med','','','Up and over, switch lead leg each rep.');
X('power_step_up','DB power step-up + knee drive','dumbbell','load','PS','glute_max vastus_lat','hip_flexors gastroc_med','','','Explode up, drive the free knee high.');
X('knee_band_step','Knee-banded step-up','band','reps','SE','glute_med vastus_med','glute_max','','','Band above the knees, keep the knee out.');
X('air_squat','Air squat','bodyweight','reps','EM','vastus_lat vastus_med glute_max','adductors','','','Full depth, heels down, steady tempo.');
X('heel_wall_sit','Heel-elevated wall sit','bodyweight','time','E','vastus_med rectus_femoris','vastus_lat','','wallsit','Heels on a plate, thighs parallel, back flat.');
X('banded_iso_squat','Banded squat + iso squat','band','time','EM','vastus_med glute_med','adductors','','','Band above the knees, hold the bottom, push knees out.');
X('tke','Terminal knee extension (TKE)','band','reps','SE','vastus_med','rectus_femoris','','','Band behind the knee, snap it straight, squeeze the quad.');
X('tip_toe_squat','Tip-toe squat','bodyweight','reps','SM','vastus_med gastroc_med soleus','tibialis_ant','','','On the balls of the feet, squat deep with control.');
X('squat_walk','Squat walks','bodyweight','reps','EM','vastus_med glute_max adductors','soleus','','','Stay low in a deep squat and walk forward.');
X('hip_thrust_15','1.5-rep hip thrust','barbell','load','SE','glute_max','hams_semi','deadlift*0.7','','Up, half down, up, full down = one rep.');
X('pause_hip_thrust','Paused barbell hip thrust','barbell','load','S','glute_max','hams_semi glute_med','deadlift*0.85','','Hold 2 s at the top, ribs down.');
X('dual_hip_thrust','Dual-elevated hip thrust','bodyweight','reps','SE','glute_max','hams_semi','','','Shoulders and feet both elevated, full range.');
X('glute_bridge','Glute bridge','bodyweight','reps','E','glute_max','hams_semi','','slbridge','Heels close, drive hips up, squeeze.');
X('sl_db_hip_thrust','Single-leg DB hip thrust + iso hold','dumbbell','load','SE','glute_max glute_med','hams_semi','','','Hold the top of the last rep 10 s.');
X('sl_bridge_march','Single-leg glute bridge march','bodyweight','reps','E','glute_max glute_med','hams_semi tva','','','Hips level as you alternate legs.');
X('ham_bridge','Hamstring bridge','bodyweight','reps','SE','hams_biceps hams_semi','glute_max','','','Heels far out, bridge with long legs.');
X('sb_iso','Single-leg stability ball iso hold','other','time','E','hams_semi hams_biceps','glute_max','','','One heel on the ball, hold the bridge.');
X('slider_rev_curl','Kneeling single-leg slider reverse curl','other','reps','S','hams_biceps hams_semi','glute_max','','','Slide the foot back slowly from a tall kneel.');
X('backward_sled','Backward sled drag','sled','loadtime','SE','vastus_med vastus_lat rectus_femoris','gastroc_med tibialis_ant','','','Lean back, small fast steps, push through the toes.');
X('sled_push','Sled push','sled','loadtime','SPE','vastus_lat glute_max gastroc_med','vastus_med soleus','','','Arms long, low angle, drive the knees.');
X('jump_squat','Jump squat (with or without weight)','bodyweight','reps','PE','vastus_lat glute_max gastroc_med','vastus_med soleus','','','Dip, jump as high as you can, land soft and reset.');
X('vertical_jump','Vertical jump','bodyweight','reps','P','glute_max vastus_lat gastroc_med','soleus hams_biceps','','','Arm swing, full hip extension, stick the landing.');
X('box_jump','Box jump','bodyweight','reps','P','glute_max vastus_lat gastroc_med','hip_flexors','','','Jump up, land quiet in a half squat, step down.');
X('alt_box_jump','Alternating single-leg box jump','bodyweight','reps','P','glute_max vastus_lat','glute_med gastroc_med','','','One-leg take-off, land on two.');
X('depth_jump','Depth jump','bodyweight','reps','P','gastroc_med vastus_lat glute_max','soleus','','','Step off, land and rebound instantly.');
X('depth_broad','Depth drop + double broad jump','bodyweight','reps','P','glute_max hams_biceps vastus_lat','gastroc_med','','','Drop, stick, then two broad jumps.');
X('broad_jump','Broad jump','bodyweight','reps','P','glute_max hams_biceps vastus_lat','gastroc_med','','','Swing back, jump far, land balanced.');
X('seated_vj','Seated vertical jump','bodyweight','reps','P','glute_max vastus_lat','gastroc_med','','','From a box, no rock, jump straight up.');
X('rocket_jump','Seated rocket jump','bodyweight','reps','P','glute_max vastus_lat hip_flexors','gastroc_med','','','Sit to explosive jump with an arm drive.');
X('reactive_vj','Reactive release vertical jump','bodyweight','reps','P','vastus_lat glute_max gastroc_med','','','','Release from a hold and jump on the bounce.');
X('banded_vj','Band-assisted vertical jump','band','reps','P','gastroc_med vastus_lat glute_max','','','','Band overhead lightens you, jump fast.');
X('triple_ext','Stand to triple extension','bodyweight','reps','P','gastroc_med glute_max vastus_lat','soleus','','','Hips, knees, ankles extend together.');
X('split_pogo','Split-stance pogos','bodyweight','reps','PE','gastroc_med soleus','tibialis_ant','','','Split stance, bounce on the front ball of foot.');
X('split_exchange','Split-exchange pogos','bodyweight','reps','PE','gastroc_med gastroc_lat hip_flexors','soleus adductors','','','Switch legs in the air, stay stiff.');
X('wall_pogo','Wall-assisted pogos','bodyweight','reps','PE','gastroc_med soleus','','','','Hands on the wall, fast stiff bounces.');
X('split_step','Split-step hops','bodyweight','reps','PE','gastroc_med gastroc_lat soleus peroneals','vastus_med glute_med','','','Small hop, land wide on the balls of the feet as if the ball is struck.');
X('split_step_run','Split step + first-step sprint','bodyweight','reps','P','gastroc_med glute_max vastus_lat','adductors peroneals hip_flexors','','','Split, read, explode 3 steps to a corner.');
X('banded_lat_bound','Banded lateral bound','band','reps','P','glute_med vastus_lat glute_max','adductors peroneals','','','Band pulls you sideways; bound against it, stick.');
X('band_run','Band-resisted run','band','time','PE','glute_max hams_biceps gastroc_med hip_flexors','vastus_lat soleus','','','Partner or anchor holds the band, drive forward with high knees.');
X('wall_push','Wall push sprint drill','bodyweight','time','PE','hip_flexors glute_max gastroc_med','vastus_lat abs_lower','','','Lean into the wall at 45°, fast alternating knee drives.');
X('burpee','Burpee','bodyweight','reps','EP','vastus_lat chest_lower glute_max','delt_front triceps_lat abs_upper','','','Chest to floor, jump at the top, steady rhythm.');
X('bear_crawl','Bear crawl','bodyweight','time','E','delt_front tva serratus','vastus_med hip_flexors','','','Knees an inch off the floor, opposite hand and foot.');
X('twisting_bear','Twisting bear','bodyweight','reps','EM','obliques delt_front serratus','hip_flexors','','','From bear, thread one leg through and rotate.');

// ---------- Strength & power: upper body ----------
X('z_press','Z-press','barbell','load','S','delt_front triceps_lat','delt_side abs_upper serratus','ohp*0.85','','Sit on the floor legs straight, press without leaning.');
X('push_press','Barbell push press','barbell','load','PS','delt_front triceps_lat','vastus_lat glute_max delt_side','ohp*1.25','','Dip and drive with the legs, punch it overhead.');
X('db_push_press','DB push press (per hand)','dumbbell','load','PS','delt_front triceps_lat','vastus_lat delt_side','ohp*0.5','','Quick dip, legs launch the bells.');
X('db_thruster','DB thruster (per hand)','dumbbell','load','PE','delt_front vastus_lat glute_max','triceps_lat','','','Front squat straight into a press.');
X('db_clean_press','DB clean & press','dumbbell','load','PS','delt_front glute_max traps_upper','triceps_lat hams_semi','','','Hinge, pop the bells to the shoulders, press.');
X('db_bosch_clean','DB Bosch clean','dumbbell','load','P','traps_upper glute_max hams_semi','delt_front forearm_flex','','','Fast hip snap, catch at the shoulders.');
X('hk_db_snatch','Half-kneeling DB snatch','dumbbell','load','P','delt_front traps_upper','obliques delt_side','','','From a kneel, pull the bell straight overhead.');
X('sa_lm_snatch','Single-arm landmine snatch','landmine','load','P','glute_max delt_front traps_upper','obliques vastus_lat','','','Hinge, drive the hips, punch the bar up.');
X('hk_vert_press','Half-kneeling vertical press','dumbbell','load','SE','delt_front triceps_lat','obliques glute_med','ohp*0.35','','Kneel, squeeze the down-knee glute, press.');
X('tk_lm_push_press','Tall-kneeling landmine push press','landmine','load','PS','delt_front chest_upper','triceps_lat serratus obliques','','','From tall kneel, push the sleeve up and across.');
X('hk_td_press','Half-kneeling touch-down + overhead press','dumbbell','load','SM','delt_front obliques','serratus triceps_lat','','','Reach down, return, press overhead.');
X('tk_press_pull','Tall-kneeling press + cable pull','cable','load','SE','delt_front lats','obliques triceps_lat','','','Press one arm while pulling with the other.');
X('oh_march','Overhead march','dumbbell','loadtime','E','delt_front traps_upper tva','obliques hip_flexors','','','Weight locked out overhead, march slowly.');
X('halos','Halos (KB or DB)','kettlebell','reps','MS','delt_front delt_rear delt_side traps_upper','triceps_long obliques','','','Circle the bell around your head, ribs down.');
X('tgu','Turkish get-up','kettlebell','load','SM','delt_front obliques glute_max','tva serratus infraspinatus','','','Eyes on the bell, one step at a time.');
X('bb_incline','Barbell incline press','barbell','load','S','chest_upper delt_front','triceps_lat','bench*0.8','','Touch high on the chest, press back over the face.');
X('high_incline','Alternating high-incline DB press','dumbbell','load','SE','chest_upper delt_front','triceps_lat serratus','bench*0.28','','45–60° bench, alternate arms.');
X('ecc_floor_press','Eccentric barbell floor press','barbell','load','S','chest_lower triceps_lat','delt_front','bench*0.85','','4 s down to the floor, pause, press.');
X('ecc_bench','Eccentric barbell chest press','barbell','load','S','chest_lower chest_upper','triceps_lat delt_front','bench*0.85','','4 s lowering, explode up.');
X('chest_211','2-1-1 chest press','dumbbell','load','SE','chest_lower','triceps_lat delt_front','bench*0.35','','2 s down, 1 s pause, 1 s up.');
X('sl_sa_press','Single-leg single-arm DB press','dumbbell','load','SE','chest_lower delt_front','obliques glute_med','','','Lying on a bench, one foot up, press one bell.');
X('band_floor_press','Band-resisted single-arm floor press','band','reps','SE','chest_lower triceps_lat','obliques','','','Band across the back, press one arm.');
X('dyn_narrow_press','Dynamic narrow press','dumbbell','load','SE','triceps_lat triceps_med chest_lower','delt_front','','','Bells touching, press fast and close.');
X('ecc_pushup','Eccentric push-up','bodyweight','reps','S','chest_lower triceps_lat','delt_front serratus','','','5 s lowering, reset from the knees.');
X('handsoff_pushup','Hands-off push-up','bodyweight','reps','SE','chest_lower','triceps_lat delt_front','','pushup','Lift hands at the bottom, full reset each rep.');
X('liftoff_pushup','Lift-off push-up','bodyweight','reps','SE','chest_lower serratus','triceps_lat','','','At the top, lift one hand and touch the shoulder.');
X('cg_pushup','Close-grip push-up','bodyweight','reps','SE','triceps_lat triceps_med','chest_lower delt_front','','','Hands under the shoulders, elbows brush the ribs.');
X('deficit_pushup','Deficit push-up','bodyweight','reps','SF','chest_lower chest_upper','triceps_lat delt_front','','','Hands on plates, chest sinks below the hands.');
X('plyo_pushup','Assisted plyo push-up','bodyweight','reps','P','chest_lower triceps_lat','delt_front','','','Explode the hands off the floor, land soft.');
X('mb_chest_pass','Med-ball chest pass','medball','reps','P','chest_lower triceps_lat delt_front','serratus','','','Step and throw into a wall from the chest.');
X('mb_vert_toss','Tall-kneeling med-ball vertical toss','medball','reps','P','delt_front glute_max','triceps_lat abs_upper','','','From tall kneel, launch the ball straight up.');
X('ecc_chin','Eccentric chin-up negative','bodyweight','reps','S','lats biceps','teres_major brachialis','','','Jump to the top, lower over 5 s.');
X('assisted_pullup','Band-assisted pull-up','band','reps','SE','lats','biceps teres_major traps_lower','','','Band under the knee or foot, full range.');
X('pulldown_iso','Lat pulldown + isometric hold','cable','load','SE','lats teres_major','biceps traps_lower','row*0.85','','Hold the bar at the chest 3 s each rep.');
X('narrow_pulldown','Narrow-grip pulldown','cable','load','SE','lats teres_major','biceps brachialis','row*0.95','','Close handle, pull to the sternum.');
X('speed_pulldown','Banded speed pulldown','band','reps','PE','lats','teres_major triceps_long','','','Fast pull down, controlled return.');
X('prone_lat_pd','Prone lying lat pulldown','bodyweight','reps','EM','lats traps_lower','rhomboids','','','Face down, arms overhead, pull elbows to ribs.');
X('pendlay_row','Pendlay row','barbell','load','S','lats traps_mid rhomboids','delt_rear erectors biceps','row*0.95','','Bar from the floor each rep, back flat.');
X('pin_row','Pin barbell bent-over row','barbell','load','S','traps_mid rhomboids lats','delt_rear biceps','row*0.95','','Bar rests on pins between reps.');
X('gorilla_row','2-1-1 gorilla row','kettlebell','load','SE','lats traps_mid','rhomboids biceps erectors','','','Wide hinge, alternate rows with a pause.');
X('lm_sa_row','Landmine single-arm row','landmine','load','SE','lats traps_mid','rhomboids biceps','','','Staggered stance, pull the sleeve to the hip.');
X('sa_drop_row','Single-arm bent-over drop row','dumbbell','load','PE','lats traps_mid','biceps','','','Let the bell drop, catch and pull fast.');
X('cs_db_row','Chest-supported DB row','dumbbell','load','SE','traps_mid rhomboids lats','delt_rear biceps','row*0.42','','Chest on the bench, pull and squeeze.');
X('bird_dog_row','Bird-dog row','dumbbell','load','SE','lats traps_mid','erectors glute_max tva','','','On one knee and hand, opposite leg long, row.');
X('renegade_row','Renegade row','dumbbell','load','SE','lats tva obliques','traps_mid triceps_lat','','','Plank on the bells, row without twisting.');
X('rot_renegade','Alternating rotational renegade row','dumbbell','load','SE','lats obliques','traps_mid delt_rear','','','Row and rotate open, return to plank.');
X('ballistic_row','Ballistic banded row','band','reps','PE','traps_mid rhomboids lats','delt_rear','','','Snap the band back fast, slow return.');
X('db_row_2','Dumbbell row (two-arm)','dumbbell','load','SE','lats traps_mid','rhomboids biceps','row*0.4','','Hinge, row both bells to the hips.');
X('hk_face_pull','Half-kneeling cable face pull','cable','load','SE','delt_rear infraspinatus','traps_mid teres_minor','ohp*0.5','','From a kneel, pull to the forehead, thumbs back.');
X('ywt','Chest-supported Y-W-T raise','dumbbell','load','E','traps_lower traps_mid delt_rear','infraspinatus rhomboids','','','Light bells, Y then W then T.');
X('battle_rear_fly','Battle rope rear delt fly','other','time','E','delt_rear','traps_mid rhomboids','','','Hinge, whip the ropes out to the sides.');
X('battle_waves','Battle rope waves','other','time','EP','delt_front forearm_flex','obliques traps_upper','','','Athletic stance, fast alternating waves.');
X('hk_lat_raise','Half-kneeling alternating lateral raise','dumbbell','load','SE','delt_side','supraspinatus','ohp*0.15','','From a kneel, raise one arm at a time.');
X('three_pt_raise','3-point raise','dumbbell','load','E','delt_side delt_front delt_rear','supraspinatus','','','Front, side and rear raise in one set.');
X('db_tri_ext','Dumbbell triceps extension','dumbbell','load','SE','triceps_long triceps_lat','triceps_med','bench*0.15','','Lying, elbows still, lower beside the head.');
X('db_oh_ext','DB overhead triceps extension','dumbbell','load','SEF','triceps_long','triceps_lat','bench*0.2','','Both hands on one bell, elbows by the ears.');
X('db_side_ext','DB side-lying triceps extension','dumbbell','load','SE','triceps_lat triceps_med','','','','Lying on your side, extend the top arm.');
X('katana_ext','Katana triceps extension','cable','load','SEF','triceps_long','triceps_lat','','','Cable from low behind, extend up and across.');
X('cross_tri_ext','Cross-body cable triceps extension','cable','load','SE','triceps_lat triceps_med','triceps_long','','','Pull across the body, lock out.');
X('bw_skull','Bodyweight skull crusher','bodyweight','reps','SE','triceps_long triceps_lat','triceps_med','','','Hands on a bar, lower the head under it.');
X('incline_skull','Incline skull crusher','dumbbell','load','SEF','triceps_long','triceps_lat triceps_med','','','Incline bench, lower bells behind the head.');
X('bench_dip','Bench dip','bodyweight','reps','E','triceps_lat triceps_med','delt_front chest_lower','','','Hands on a bench, elbows back.');
X('pullover_skull','Pullover + skull crusher','dumbbell','load','SE','triceps_long lats','chest_lower','','','Skull crusher, then sweep into a pullover.');
X('renegade_kick','Renegade triceps kickback','dumbbell','load','E','triceps_lat triceps_long','tva obliques','','','From plank, kick one bell back.');
X('squat_curl','Squat curl','dumbbell','load','SE','biceps','brachialis vastus_med','','','Sit deep, elbows on the knees, curl.');
X('ecc_power_curl','Kneeling eccentric power curl','barbell','load','S','biceps brachialis','brachioradialis','','','Curl fast, lower over 4 s.');
X('spider_curl','Spider curl','dumbbell','load','SE','biceps','brachialis','curl*0.35','','Chest on an incline, arms hang straight down.');
X('zottman_curl','Zottman curl','dumbbell','load','SE','brachioradialis biceps','forearm_ext brachialis','curl*0.35','','Curl palm up, rotate, lower palm down.');
X('drag_curl','Drag curl','barbell','load','SE','biceps','brachialis','curl*0.7','','Drag the bar up the torso, elbows back.');
X('gripper','Hand gripper squeezes','other','reps','SE','forearm_flex','','','','Full close, hold 1 s, slow open.');
X('towel_hang','Towel pull-up hang','bodyweight','time','SE','forearm_flex lats','brachioradialis','','','Grip towels over the bar, hang.');
X('fat_grip_hold','Fat-grip dumbbell hold','dumbbell','loadtime','SE','forearm_flex forearm_ext','brachioradialis','','','Thick handles, crush the grip.');
X('band_finger_ext','Band finger extensions','band','reps','E','forearm_ext','','','','Band around the fingers, spread wide.');
X('racket_wrist','Racket wrist flexion/extension','other','reps','E','forearm_flex forearm_ext','brachioradialis','','','Hold your racket head-heavy, slow wrist curls both ways.');
X('ssm_flexion','Scapula circles','bodyweight','reps','M','traps_upper traps_lower serratus','rhomboids','','','Slow big circles with the shoulder blades.');
X('shrug_overhead','Overhead shrug','barbell','load','SE','traps_upper traps_lower serratus','delt_side','','','Bar locked out overhead, shrug ears to arms.');
X('kelso_shrug','Kelso shrug','barbell','load','SE','traps_mid rhomboids','traps_lower','','','Chest on an incline, pinch the blades back.');
X('neck_harness','Neck harness extension','other','load','SE','traps_upper scm','','','','Light harness, nod up and down slowly.');
X('neck_cars','Neck CARs','bodyweight','reps','M','scm traps_upper','','','','Slow, comfortable circles; never force.');
X('band_neck_rot','Banded neck rotation hold','band','time','E','scm','traps_upper','','','Band around the head, resist rotation.');

// ---------- Core & rotation ----------
X('russian_twist','Russian twist','medball','reps','E','obliques','abs_upper hip_flexors','','','Lean back, rotate the ball side to side.');
X('knee_tuck','Knee tuck','bodyweight','reps','SE','abs_lower hip_flexors','abs_upper','','','Seated, lean back, pull knees to chest.');
X('lying_leg_raise','Lying leg raise','bodyweight','reps','SE','abs_lower hip_flexors','tva','','','Low back pinned, lower legs slowly.');
X('sl_leg_raise','Single-leg raise','bodyweight','reps','SE','hip_flexors rectus_femoris','abs_lower','','','One leg straight, lift it as high as you can.');
X('sl_mb_leg_raise','Single-leg med-ball wall leg raise','medball','reps','SE','hip_flexors abs_lower','rectus_femoris','','','Lying, lift one leg over the ball to the wall.');
X('pike_pulse','Pike pulse','bodyweight','reps','SM','hip_flexors abs_lower','rectus_femoris','','','Seated pike, hands by the knees, pulse the legs up.');
X('pike_raise','Pike raise (hanging)','bodyweight','reps','S','abs_lower hip_flexors','lats forearm_flex','','','Straight legs up to the bar.');
X('full_crunch','Full-range crunch','bodyweight','reps','E','abs_upper','abs_lower','','','Curl the ribs to the hips, slow lowering.');
X('reverse_crunch','Reverse crunch','bodyweight','reps','E','abs_lower','abs_upper','','','Roll the pelvis up off the floor.');
X('bicycle_crunch','Bicycle crunch','bodyweight','reps','E','obliques abs_upper','hip_flexors','','','Elbow to the opposite knee, slow.');
X('side_star','Side star plank','bodyweight','time','SE','obliques glute_med','ql adductors','','','Side plank with the top leg raised.');
X('copen_crunch','Copenhagen crunch','bodyweight','reps','SE','adductors obliques','abs_upper','','','From Copenhagen plank, crunch the bottom knee up.');
X('pallof_march','Pallof march','cable','time','E','obliques tva','hip_flexors glute_med','','','Press out and hold, march in place.');
X('pallof_lat_flex','Tall-kneeling Pallof + lateral flexion','cable','reps','SE','obliques ql','tva','','','Press out, then side-bend away.');
X('mb_pallof_rot','Med-ball Pallof banded rotation','medball','reps','SE','obliques','tva','','','Band resists, rotate the ball across.');
X('lm_woodchop','Half-kneeling landmine woodchop','landmine','reps','PS','obliques','serratus delt_front glute_max','','','Rotate the bar low to high across the body.');
X('band_swing','Band-resisted racket swing','band','reps','PE','obliques','chest_lower delt_front subscapularis infraspinatus glute_max','','','Anchor at hip height, swing forehand and backhand against the band.');
X('sl_ball_slam','Single-leg ball slam','medball','reps','P','abs_upper lats','obliques glute_med','','','On one leg, slam hard, stay balanced.');
X('mb_bo_slam','Med-ball overhead slam','medball','reps','P','abs_upper lats','triceps_long glute_max','','','Reach tall, slam through the floor.');
X('rot_slam','Kneeling rotational slam','medball','reps','P','obliques','lats abs_upper','','','From a kneel, rotate and slam beside the hip.');
X('rot_throw_scoop','Rotational scoop toss','medball','reps','P','obliques glute_max','deep_rotators adductors','','','Load the back hip, scoop the ball into a wall.');
X('sb_circles','Stability ball stir-the-pot','other','reps','E','tva abs_upper','obliques serratus','','','Forearms on the ball, small circles, hips still.');
X('suitcase_march','Suitcase march','kettlebell','loadtime','E','ql obliques','glute_med hip_flexors','','','Heavy bell in one hand, slow high knees.');
X('front_rack_march','Banded paused front-rack march','kettlebell','loadtime','E','tva hip_flexors','obliques glute_med','','','Bells racked, hold each knee up 2 s.');
X('chaos_carry','Single-arm chaos march carry','kettlebell','loadtime','E','obliques forearm_flex','delt_front glute_med','','','Bottoms-up bell, slow march, stay square.');
X('zercher_march','Zercher march','barbell','loadtime','E','tva hip_flexors','biceps erectors','','','Bar in the elbows, march tall.');
X('hip_flexor_plank','Hip flexor plank','bodyweight','time','E','hip_flexors tva','rectus_femoris','','','Plank, drive one knee in and hold.');
X('kneeling_fallout','Kneeling TRX fall-out','trx','reps','SE','abs_upper tva serratus','lats','','','Arms long, fall forward, pull back with the abs.');
X('ab_dragon','Dragon flag (negative)','bodyweight','reps','S','abs_upper abs_lower','lats','','','Lower your body in one line from the shoulders.');

// ---------- Endurance (extra) ----------
X('farmers_heavy','Heavy farmer carry','dumbbell','loadtime','S','forearm_flex traps_upper','glute_med obliques','','','Heaviest you can hold, 20–30 m.');
X('row_erg','Rowing erg intervals','machine','time','E','lats glute_max vastus_lat','hams_semi traps_mid','','','Legs, body, arms; arms, body, legs.');
X('bike_sprint','Assault bike sprints','machine','time','EP','vastus_lat glute_max','delt_front hams_semi','','','20 s all-out, 40 s easy.');
X('ghost_drill','Squash ghosting','bodyweight','time','EP','vastus_lat glute_max adductors gastroc_med','obliques hams_biceps','','','Shadow the six corners with full lunges and recover to the T.');
X('lateral_shuffle','Lateral shuffle','bodyweight','time','E','glute_med adductors','gastroc_lat peroneals','','','Low, wide, fast feet; don\'t cross.');
X('skater_hops','Skater hops','bodyweight','reps','PE','glute_med glute_max','adductors peroneals','','','Leap side to side, land on one leg.');
X('jump_rope','Jump rope','other','time','E','gastroc_med gastroc_lat soleus','peroneals forearm_flex','','','Quiet, low hops on the balls of the feet.');
X('calf_iso','Bent-knee calf isometric','bodyweight','time','E','soleus','gastroc_med','','','Half squat on the toes, hold.');
X('tib_wall_hold','Tibialis wall-lean hold','bodyweight','time','E','tibialis_ant','','','','Back on the wall, toes up, hold.');
X('heel_walks','Heel walks','bodyweight','time','E','tibialis_ant','peroneals','','','Walk on your heels, toes high.');
X('toe_walks','Toe walks','bodyweight','time','E','gastroc_med soleus tib_post','peroneals','','','High on the toes, small steps.');
X('band_ext_iso','External rotation iso hold','band','time','E','infraspinatus teres_minor','delt_rear','','','Elbow at side, hold the band out.');
X('wall_angels','Wall angels','bodyweight','reps','EM','traps_lower rhomboids','delt_rear serratus','','','Slide arms up the wall, keep contact.');
X('push_up_plus','Push-up plus','bodyweight','reps','SE','serratus chest_lower','triceps_lat','','','At the top, push the floor away further.');
X('bear_hold','Bear plank hold','bodyweight','time','E','tva serratus delt_front','vastus_med','','','Knees 1 inch up, back flat, breathe.');

// ---------- Mobility (ALIGN and more) ----------
X('wrist_floor_circles','Floor wrist circles','bodyweight','reps','M','forearm_flex forearm_ext','brachioradialis','','','On all fours, circle over the hands; fingers forward, lateral and back.');
X('wrist_deviations','Wrist deviations','bodyweight','reps','M','forearm_flex forearm_ext','','','','Tilt the hand forward, back and side to side.');
X('wrist_circles','Wrist circles','bodyweight','reps','M','forearm_flex forearm_ext','brachioradialis','','','Slow full circles both ways.');
X('wrist_assist','Alternating hand-assisted wrist stretch','bodyweight','time','F','forearm_flex forearm_ext','','','','Use the other hand to ease the wrist into end range.');
X('palm_lifts','Palm lifts','bodyweight','reps','MS','forearm_ext forearm_flex','','','','Fingers flat, lift the palm off the floor.');
X('finger_updowns','Plank finger up-downs','bodyweight','reps','SM','forearm_flex','serratus','','','In plank, rise onto the fingertips and back.');
X('elbow_rot_wall','Wall elbow external/internal rotation','bodyweight','reps','M','brachioradialis biceps triceps_med','forearm_flex brachialis','','','Hand on the wall, rotate the elbow pit forward and back.');
X('elbow_cars','Elbow CARs','bodyweight','reps','M','biceps triceps_med triceps_lat brachialis brachioradialis','','','','Slow full bends, straightens and rotations of the elbow.');
X('prayer_stretch','Active prayer stretch','bodyweight','time','MF','forearm_flex lats triceps_long','','','','Palms together, elbows on a bench, sink back.');
X('preacher_liftoff','Preacher stretch lift-offs','bodyweight','reps','MF','lats triceps_long','traps_lower','','','Elbows on a bench, sink, then lift them off.');
X('quad_hip_circles','Quadruped hip circles','bodyweight','reps','M','deep_rotators glute_med hip_flexors','adductors','','','On all fours, draw slow circles with the knee.');
X('ir_liftoff','90/90 internal rotation lift-off','bodyweight','reps','MS','glute_min tfl deep_rotators','glute_med','','','In 90/90, lift the back shin off the floor.');
X('er_liftoff','90/90 external rotation lift-off','bodyweight','reps','MS','deep_rotators glute_med','glute_max','','','In 90/90, lift the front shin off the floor.');
X('heel_clicks','90/90 heel clicks','bodyweight','reps','M','deep_rotators glute_min','adductors','','','In 90/90, click the heels together.');
X('switch_no_hands','90/90 switch (no hands)','bodyweight','reps','M','deep_rotators glute_med hip_flexors','tva','','','Switch sides with your hands off the floor.');
X('switch_lean','90/90 switch + forward lean','bodyweight','reps','MF','deep_rotators glute_max','adductors','','','Switch, then lean over the front shin.');
X('switch_tripod','90/90 switch + tripod reach','bodyweight','reps','M','deep_rotators obliques glute_med','serratus','','','Switch, reach the arm up and back.');
X('liftoff_combat','90/90 lift-off to combat stance','bodyweight','reps','MS','glute_med deep_rotators hip_flexors','vastus_med','','','From 90/90, rise into a half-kneeling stance.');
X('shin_box_getup','Weighted 90/90 shin-box get-up','kettlebell','reps','SM','glute_max deep_rotators glute_med','vastus_med tva','','','Hold a bell at the chest, rise from shin box.');
X('bench_9090','90/90 bench leans','bodyweight','time','F','deep_rotators glute_max','','','','Front leg in 90/90 on a bench, lean forward.');
X('hip_drops_9090','Elevated 90/90 hip drops','bodyweight','reps','M','deep_rotators glute_min adductors','','','','From an elevated 90/90, drop the hips side to side.');
X('supine_ir','Supine internal rotations','bodyweight','reps','M','glute_min tfl','deep_rotators','','','On your back, feet wide, drop knees in.');
X('endrange_irer','Bent-knee end-range hip IR/ER','bodyweight','reps','M','glute_min deep_rotators','glute_med','','','Knee bent, rotate the shin in and out at end range.');
X('prone_hip_cars','Prone hip CARs','bodyweight','reps','M','deep_rotators glute_med hip_flexors','glute_max','','','Face down, draw a slow circle with the knee.');
X('wall_hip_circles','Wall hip circles','bodyweight','reps','M','glute_med deep_rotators hip_flexors','','','','Hand on the wall, big knee circles.');
X('elev_hip_car','Elevated hip CAR','bodyweight','reps','M','deep_rotators hip_flexors glute_med','glute_min adductors','','','Stand on a step, circle the free knee.');
X('elev_hip_flex','Elevated banded straight-leg hip flexion','band','reps','SM','hip_flexors rectus_femoris','abs_lower','','','Band on the foot, lift a straight leg high.');
X('kb_hip_flex','Elevated pause standing KB hip flexion','kettlebell','reps','SM','hip_flexors','rectus_femoris','','','Bell on the foot, lift the knee, pause.');
X('kneel_slr','Kneeling paused straight-leg raise','bodyweight','reps','SM','hip_flexors rectus_femoris','vastus_med','','','Kneel, one leg out straight, lift and pause.');
X('glider_circles','Seated glider circles','other','reps','M','hip_flexors adductors deep_rotators','','','','Seated, foot on a glider, draw big circles.');
X('quad_liftoff','Quadruped end-range lift-off + knee extension','bodyweight','reps','MS','glute_max hams_semi glute_med','','','','On all fours, lift the leg out and straighten it.');
X('straight_band_abd','Straight-leg banded abduction','band','reps','SE','glute_med tfl glute_min','','','','Band at ankles, lift the straight leg sideways.');
X('foam_abduction','Seated banded foam-roller abduction','band','reps','SE','glute_med glute_min','tfl','','','Seated, roller between knees, band out.');
X('kb_lat_sink','Weighted KB lateral sink','kettlebell','reps','MF','adductors glute_max','vastus_med','','','Hold a bell, sink side to side in a wide stance.');
X('fr_thoracic_situp','Foam roller thoracic sit-ups','other','reps','M','erectors abs_upper','','','','Roller under the mid-back, extend over and crunch back.');
X('add_thread','Adductor thread the needle + reach','bodyweight','reps','MF','adductors obliques rhomboids','','','','Side-kneeling, one leg out, thread then reach.');
X('scorpion_reach','Scorpion reaches','bodyweight','reps','MF','hip_flexors obliques rectus_femoris','glute_max','','','Face down, swing a heel toward the opposite hand.');
X('scorpion_toe','Scorpion + toe touch','bodyweight','reps','MF','hip_flexors obliques hams_semi','','','','Scorpion one side, then reach for the opposite toe.');
X('scorpion_tripod','Scorpion + tripod reach','bodyweight','reps','M','hip_flexors obliques','serratus','','','Scorpion, then lift into a tripod and reach.');
X('prone_retraction','Prone scapula retraction','bodyweight','reps','SE','rhomboids traps_mid','delt_rear','','','Face down, pinch the shoulder blades back.');
X('prone_swimmer','Prone swimmer','bodyweight','reps','EM','traps_lower delt_rear infraspinatus','rhomboids','','','Face down, sweep arms from overhead to hips.');
X('ham_hip_sink','Hamstring stretch + hip sink','bodyweight','reps','F','hams_semi hams_biceps adductors','','','','Fold over a straight leg, then sink into the other hip.');
X('ham_lat_sink','Hamstring stretch + lateral hip sink','bodyweight','reps','F','hams_semi adductors','glute_med','','','Straight-leg fold, shift sideways into a lateral sink.');
X('add_rocks','Banded kneeling adductor rocks','band','reps','MF','adductors','hams_semi','','','On all fours, one leg out, rock back.');
X('elev_add_rocks','Elevated adductor rocks','bodyweight','reps','MF','adductors','hams_semi','','','Foot up on a box to the side, rock back.');
X('add_slides','Tall split-kneeling adductor slides','other','reps','M','adductors','glute_med','','','Kneel, slide the outside foot away and back.');
X('add_windmill','Adductor KB windmill','kettlebell','reps','MF','adductors obliques','hams_semi','','','Wide stance, reach the bell down to the inside foot.');
X('add_thrust_windmill','Adductor kneeling thrust to windmill','bodyweight','reps','M','adductors glute_max obliques','','','','Side kneel, thrust the hips, then windmill.');
X('groin_3way','3-way groin opener','bodyweight','reps','MF','adductors hams_semi','','','','Wide kneel, rock back, side and diagonal.');
X('cossack_reach','Assisted Cossack + reach','bodyweight','reps','MF','adductors obliques','glute_max','','','Hold a post, sink to one side, reach across.');
X('cossack_ham','Cossack squat + hamstring stretch','bodyweight','reps','MF','adductors hams_semi','glute_max','','','Sink one side, then hinge over the straight leg.');
X('cossack_wgs','Cossack squat + world\'s greatest stretch','bodyweight','reps','MF','adductors hip_flexors obliques','','','','Cossack, then into a lunge with rotation.');
X('wgs','World\'s greatest stretch (band-resisted)','band','reps','MF','hip_flexors adductors obliques hams_semi','glute_max','','','Lunge, elbow to instep, rotate open.');
X('pigeon_wgs','Pigeon + world\'s greatest stretch','bodyweight','reps','MF','deep_rotators hip_flexors obliques','glute_max','','','Pigeon on one side, then flow into WGS.');
X('lizard_side','Lizard lunge + side lunge','bodyweight','reps','MF','hip_flexors adductors','glute_max','','','Deep lunge, hands inside, then shift side.');
X('long_lunge','Long lunge hold','bodyweight','time','F','hip_flexors rectus_femoris','adductors','','','Back knee down, hips forward, tall chest.');
X('couch_lat','Couch stretch + banded overhead side bend','band','time','F','hip_flexors rectus_femoris obliques','lats','','','In couch stretch, reach overhead and lean.');
X('combat_sl','Single-leg combat stance','bodyweight','time','SM','glute_med hip_flexors','vastus_med','','','Half-kneel, lift the back knee to a stance.');
X('alt_combat','Alternating combat stance','bodyweight','reps','SM','glute_med vastus_med','hip_flexors','','','Switch sides through a half-kneel.');
X('trx_sprinter','TRX sprinter lunge','trx','reps','SE','glute_max vastus_lat hip_flexors','glute_med','','','Hold straps, lunge back and drive the knee.');
X('trx_lat_airplane','TRX lateral airplane','trx','reps','M','glute_med deep_rotators','obliques','','','Single leg, hinge and rotate open with support.');
X('superman_dd','Superman reach + downward dog','bodyweight','reps','MF','erectors lats hams_semi','soleus','','','Reach long on the belly, push back to dog.');
X('crab_reach','Alternating crab reach','bodyweight','reps','MF','chest_lower delt_front hip_flexors','glute_max','','','From crab, lift hips and reach across.');
X('bootstrap','Bootstrap + T-spine rotation','bodyweight','reps','MF','hams_semi adductors obliques','','','','Squat, straighten the legs, rotate an arm up.');
X('banded_cat_cow','Band-resisted cat-cow','band','reps','M','erectors abs_upper','','','','Band over the back for feedback; full range.');
X('windshield','Windshield-wiper knee drops','bodyweight','reps','M','deep_rotators glute_min obliques','','','','Seated, knees bent, drop them side to side.');
X('fr_knee_drops','Foam roller knee drops','other','reps','M','obliques erectors','','','','Roller along the spine, drop the knees side to side.');
X('wall_book','Band-resisted wall book opener','band','reps','M','obliques chest_lower rhomboids','','','','Side on to a wall, open the top arm against the band.');
X('elev_tspine','Elevated T-spine rotation','bodyweight','reps','M','obliques rhomboids','erectors','','','Hand on a bench, thread and open.');
X('wall_t_rot','Wall T rotation + windmill','bodyweight','reps','M','obliques chest_lower','hams_semi','','','Arms in a T, rotate to the wall, then windmill.');
X('wall_t_twist','Wall T twists','bodyweight','reps','M','obliques','chest_lower','','','Back to the wall, rotate the arms in a T.');
X('fwd_lean_rot','Forward-lean loaded thoracic rotation','dumbbell','reps','MS','obliques rhomboids traps_mid','erectors','','','Hinge forward, rotate a light bell open.');
X('spinal_wave','Spinal wave + book opener','bodyweight','reps','M','erectors obliques','abs_upper','','','Roll the spine through, then open the chest.');
X('quad_elbow_rot','Hand-on-back quadruped spine rotation','bodyweight','reps','M','obliques rhomboids erectors','','','','On all fours, hand on the low back, rotate the elbow up.');
X('mb_t_cars','Med-ball thoracic CARs','medball','reps','M','obliques erectors','','','','Hold a ball overhead, circle the ribcage.');
X('jefferson','Jefferson curl','barbell','load','MF','erectors hams_semi','','','','Light bar, roll down one vertebra at a time.');
X('pancake','Banded / cable pancake','cable','reps','MF','adductors hams_semi erectors','','','','Wide seated, fold forward with assistance.');
X('ext_hinge','Standing elevated extended hinge','bodyweight','reps','F','hams_semi hams_biceps','gastroc_med','','','Heel on a box, hinge over a straight leg.');
X('ham_knee_tap','Assisted hamstring stretch + alt internal knee tap','band','reps','MF','hams_semi deep_rotators','','','','Strap a straight leg, then tap the knee inward.');
X('child_y','Single-arm child\'s pose lift-off + Y reach','bodyweight','reps','MS','traps_lower lats','delt_rear','','','In child\'s pose, lift one arm into a Y.');
X('band_oh_raise','Banded overhead raise','band','reps','M','delt_front traps_lower serratus','','','','Straight arms, lift the band overhead against tension.');
X('bear_hug','Prone alternating bear hug','bodyweight','reps','M','rhomboids delt_rear traps_mid','','','','Face down, wrap one arm under and across.');
X('three_pt_liftoff','3-point shoulder lift-offs','bodyweight','reps','MS','delt_rear traps_lower infraspinatus','','','','On a knee and hand, lift the free arm at three angles.');
X('prone_sa_car','Prone single-arm shoulder CAR','bodyweight','reps','M','infraspinatus subscapularis supraspinatus delt_rear','','','','Face down, draw a full circle with one arm.');
X('wall_shoulder_car','Wall quadruped shoulder CARs','bodyweight','reps','M','infraspinatus subscapularis supraspinatus','delt_front delt_rear','','','Hand on the wall, slow full circles.');
X('trx_angels','TRX angels','trx','reps','SM','traps_lower rhomboids delt_rear','','','','Lean back on straps, sweep arms from Y to T.');
X('wall_presses','Wall presses (serratus)','bodyweight','reps','SE','serratus','chest_lower','','','Forearms on the wall, push it away and reach up.');
X('prone_y_press','Weighted prone Y press','dumbbell','load','SE','traps_lower delt_front','serratus','','','Face down, press light plates into a Y.');
X('lying_croissant','Lying croissants','bodyweight','reps','M','pec_minor chest_upper delt_front','','','','Side-lying, sweep the top arm overhead and around.');
X('seated_sh_ext','Seated shoulder extension stretch','bodyweight','time','F','delt_front chest_upper pec_minor','biceps subscapularis supraspinatus','','','Hands behind on the floor, slide the hips forward.');
X('y_touchdown','Y touch-down','bodyweight','reps','M','glute_med hams_semi peroneals','tib_post','','','Single leg, reach the free foot in a Y pattern.');
X('banded_y_td','Banded Y touch-down (ankle banded)','band','reps','SM','glute_med peroneals tib_post','glute_min','','','Band at the ankles, reach the Y with control.');
X('heel_touchdown','Elevated single-leg heel touch-down','bodyweight','reps','SM','vastus_med','tibialis_ant glute_med','','','On a step, slowly tap the free heel down.');
X('ankle_rocks','Deep squat ankle rocks','bodyweight','reps','M','soleus gastroc_med','tibialis_ant gastroc_lat','','','Bottom of a squat, rock the knees forward.');
X('ankle_wall','Kneeling ankle wall anchor','bodyweight','reps','M','soleus','gastroc_med','','','Half-kneel at a wall, drive the front knee past the toes.');
X('band_ankle_mob','Banded ankle mobilisation','band','reps','M','soleus gastroc_med','tibialis_ant','','','Band pulls the ankle back, drive the knee forward.');
X('band_ankle_dorsi','Banded ankle dorsiflexion','band','reps','M','soleus tibialis_ant','','','','Band low on the ankle, lunge forward.');
X('ankle_band_cars','Seated banded ankle CARs','band','reps','M','tibialis_ant peroneals tib_post','soleus','','','Seated, band on the foot, slow circles.');
X('deep_sq_calf','Deep squat calf raises','bodyweight','reps','SM','soleus gastroc_med','tibialis_ant','','','Bottom of a squat, rise onto the toes.');
X('tiptoe_knee_drop','Tip-toe deep squat knee drops','bodyweight','reps','M','adductors deep_rotators soleus','','','','On the toes in a deep squat, drop one knee in.');
X('calf_21','2:1 deficit calf raise','bodyweight','reps','SE','gastroc_med gastroc_lat soleus','tib_post','','','Up on two legs, lower on one off a step.');
X('deficit_sl_calf','Deficit single-leg calf raise','bodyweight','reps','SEF','gastroc_med gastroc_lat soleus','tib_post peroneals','','slcalf','Off a step, deep stretch at the bottom.');
X('platz','Platz stretch','bodyweight','time','F','rectus_femoris vastus_lat vastus_med','','','','Kneel and sit back on the heels, lean back.');
X('quad_fr','Quad foam roll','other','time','M','rectus_femoris vastus_lat vastus_med','','','','Slow passes from hip to knee.');
X('calf_fr','Calf foam roll','other','time','M','gastroc_med gastroc_lat soleus','','','','Cross one leg over, roll slowly.');
X('lat_fr','Lat foam roll','other','time','M','lats teres_major','','','','On your side, arm overhead, roll the armpit to ribs.');
X('pec_ball','Pec ball release','other','time','M','chest_upper pec_minor','','','','Ball against a wall below the collarbone.');
X('forearm_roll','Forearm massage-ball roll','other','time','M','forearm_flex forearm_ext brachioradialis','','','','Roll the forearm on a ball, both sides.');
X('foot_roll','Foot and arch ball roll','other','time','M','tib_post','soleus','','','Roll the arch over a ball.');
X('upper_trap_ball','Upper trap ball release','other','time','M','traps_upper','scm','','','Ball between the wall and the top of the shoulder.');
X('cuff_ball','Rear shoulder ball release','other','time','M','infraspinatus teres_minor teres_major','','','','Ball against the wall on the back of the shoulder blade.');
X('scm_massage','SCM self-massage','bodyweight','time','M','scm','','','','Gently pinch and release along the side of the neck.');

X('arm_circles','Arm circles (small to big)','bodyweight','reps','M','delt_side delt_front delt_rear','supraspinatus','','','Arms out to the sides, circles growing bigger.');
X('side_delt_stretch','Behind-the-back side delt stretch','bodyweight','time','F','delt_side supraspinatus','traps_upper','','','Hand behind your back, other hand pulls the wrist across.');
X('pec_minor_lift','Supine shoulder blade lift-offs','bodyweight','reps','SE','pec_minor serratus','chest_upper','','','Lying, push the shoulders up off the floor toward the ceiling.');
X('dip_shrug','Dip shrugs (scapular depression)','bodyweight','reps','SE','pec_minor traps_lower','lats','','','On dip bars, arms straight, push the shoulders down and up.');
X('tri_band_mob','Banded triceps and elbow flossing','band','reps','M','triceps_lat triceps_med triceps_long','','','','Band anchored, bend and straighten the elbow through full range.');
X('ql_side_mob','Standing hip hikes','bodyweight','reps','MS','ql glute_med','obliques','','','Stand on a step, drop and lift the free hip.');
X('ql_rotation_mob','Quadruped side-bend wag','bodyweight','reps','M','ql obliques','erectors','','','On all fours, bring hip and shoulder toward each other side to side.');
X('ham_floss','Hamstring floss (seated)','bodyweight','reps','M','hams_biceps hams_semi','gastroc_lat','','','Seated, hold behind the knee, straighten and bend.');
// ---------- Flexibility (extra) ----------
X('overhead_lat_stretch','Overhead side-bend lat stretch','bodyweight','time','F','lats obliques ql','teres_major','','','Hold a post overhead, sit the hips away.');
X('cuff_stretch','Towel internal-rotation stretch','other','time','F','supraspinatus infraspinatus','teres_minor delt_side','','','Towel behind the back, top hand pulls up.');
X('subscap_stretch','Doorway external-rotation stretch','bodyweight','time','F','subscapularis pec_minor','chest_lower delt_front','','','Forearm on the frame, elbow at 90°, turn away.');
X('teres_stretch','Side-lying teres stretch','bodyweight','time','F','teres_major teres_minor lats','','','','Arm overhead on the floor, roll onto the shoulder.');
X('brachialis_stretch','Palm-down wall forearm stretch','bodyweight','time','F','brachialis brachioradialis','forearm_ext','','','Arm straight, palm on the wall fingers down.');
X('tri_med_stretch','Bent-arm triceps wall stretch','bodyweight','time','F','triceps_med triceps_lat triceps_long','','','','Elbow up against a wall, lean in.');
X('rhomboid_stretch','Seated rhomboid stretch','bodyweight','time','F','rhomboids traps_mid','delt_rear','','','Hug your knees, round the upper back.');
X('lower_trap_stretch','Child\'s pose side reach','bodyweight','time','F','traps_lower lats','','','','In child\'s pose, walk both hands to one side.');
X('serratus_stretch','Side-lying serratus stretch','bodyweight','time','F','serratus lats','obliques','','','Top arm reaches long overhead.');
X('tva_stretch','Prone press-up breathing','bodyweight','time','F','tva abs_lower abs_upper','','','','Press up, breathe deep into the belly.');
X('child_pose','Child\'s pose','bodyweight','time','F','erectors lats','glute_max tva','','','Knees wide, sit back, arms long.');
X('knee_hug','Knees-to-chest stretch','bodyweight','time','F','erectors glute_max','ql','','','On your back, hug both knees in.');
X('glute_min_stretch','Cross-over hip stretch (glute min)','bodyweight','time','F','glute_min glute_med','tfl','','','Lying, cross one knee over, pull it across.');
X('seated_twist','Seated spinal twist','bodyweight','time','F','obliques glute_med erectors','','','','Cross one leg over, rotate toward it.');
X('lying_twist','Supine twist','bodyweight','time','F','obliques erectors glute_med','','','','Knees to one side, shoulders flat.');
X('vmo_stretch','Kneeling quad stretch (hip neutral)','bodyweight','time','F','vastus_med vastus_lat rectus_femoris','','','','Kneel, grab the back foot, hips square.');
X('inner_calf_stretch','Toe-in calf stretch','bodyweight','time','F','gastroc_med','soleus','','','Calf stretch with the back toes turned in.');
X('outer_calf_stretch','Toe-out calf stretch','bodyweight','time','F','gastroc_lat peroneals','','','','Calf stretch with the back toes turned out.');
X('tib_post_stretch','Arch and deep calf stretch','bodyweight','time','F','tib_post','soleus','','','Bent-knee calf stretch, roll the foot outward.');
X('peroneal_stretch','Ankle inversion stretch','bodyweight','time','F','peroneals','tibialis_ant','','','Seated, gently turn the sole inward.');
X('tibialis_band','Band ankle stretch (plantar flexion)','band','time','F','tibialis_ant','peroneals','','','Seated, band pulls the toes down and away.');
X('scm_stretch','SCM stretch','bodyweight','time','F','scm','','','','Look up and away, hand on the collarbone.');
X('levator_stretch','Levator scapulae stretch','bodyweight','time','F','traps_upper','scm','','','Nose to armpit, gentle hand assist.');
X('chest_wall_stretch','Wall chest stretch (high arm)','bodyweight','time','F','chest_upper pec_minor','delt_front','','','Arm high on the wall, turn away.');
X('deep_squat_hold','Deep squat hold','bodyweight','time','F','adductors soleus glute_max','erectors','','','Heels down, elbows push the knees out.');
X('frog_rock','Frog rock-backs','bodyweight','reps','MF','adductors','hip_flexors','','','In frog position, rock back and forth.');
X('happy_baby','Happy baby','bodyweight','time','F','adductors hams_semi glute_max','','','','On your back, hold the feet, knees wide.');
X('straddle','Seated straddle stretch','bodyweight','time','F','adductors hams_semi','erectors','','','Legs wide, fold forward with a long spine.');
X('pike_stretch','Seated pike stretch','bodyweight','time','F','hams_semi hams_biceps gastroc_med','erectors','','','Legs together, hinge forward.');

// ---------- Videos from your plans (Minimalift = M, ALIGN = A, RELOAD = R) ----------
const VIDEO = {};
function V(src, list) { for (const [id, url] of list) if (!VIDEO[id]) VIDEO[id] = { url, src }; }
V('A', [
 ['wrist_floor_circles','https://youtu.be/pNBiRmzPtd8'],['wrist_deviations','https://youtube.com/shorts/auTIgzWcVII'],['wrist_circles','https://youtube.com/shorts/xPeFEsxYTR4'],
 ['wrist_assist','https://youtube.com/shorts/k3g6PIcnoFQ'],['palm_lifts','https://youtube.com/shorts/5RncXhT1D5k'],['finger_updowns','https://youtube.com/shorts/mIGEswLiXmM'],
 ['quad_hip_circles','https://youtube.com/shorts/WsBerCj_OjU'],['ir_liftoff','https://youtube.com/shorts/q_721AAh97M'],['er_liftoff','https://youtube.com/shorts/d9ARb9ARdDU'],
 ['hip_9090','https://youtube.com/shorts/_1N4aeSn-5g'],['kb_lat_sink','https://youtube.com/shorts/3JYIBh9-ZzI'],['fr_thoracic_situp','https://youtube.com/shorts/FzDGBUU6wmg'],
 ['add_thread','https://youtube.com/shorts/7oiuwkjdBg4'],['scorpion_reach','https://youtube.com/shorts/HzaBQE73pMc'],['prone_retraction','https://youtu.be/SqEW1teAg6M'],
 ['prone_swimmer','https://youtu.be/Ve2x8_ThKpA'],['prone_lat_pd','https://youtube.com/shorts/zAT41HoZ9q4'],['ham_hip_sink','https://youtu.be/AZrgCXdRPmU'],
 ['add_rocks','https://youtube.com/shorts/n4oyjzqa504'],['kneel_slr','https://youtu.be/wuXT3jLfzPc'],['cossack','https://youtube.com/shorts/C5QgUdhbco0'],
 ['hip_airplane','https://youtube.com/shorts/JoUqIeQqEiw'],['banded_cat_cow','https://youtube.com/shorts/-cbij2PaV-Q'],['windshield','https://youtube.com/shorts/lj9ZFjQdt1g'],
 ['cobra','https://youtube.com/shorts/whQR6c28Ty0'],['band_dislocates','https://youtube.com/shorts/hpa87stM9x8'],['wall_book','https://youtube.com/shorts/9htDtAUwl8E'],
 ['bootstrap','https://youtube.com/shorts/kNjXVNuv88k'],['groin_3way','https://youtube.com/shorts/GbPmNDF8f8g'],['superman_dd','https://youtube.com/shorts/SjbZWVcKpqM'],
 ['figure4','https://youtube.com/shorts/IXj3KRVGgJQ'],['crab_reach','https://youtube.com/shorts/N5QmQBVDv-4'],['tib_raise','https://youtube.com/shorts/iw4GzZnJyQY'],
 ['ankle_wall','https://youtube.com/shorts/vTc7ueYMdZ0'],['knee_to_wall','https://youtube.com/shorts/vTc7ueYMdZ0'],['calf_21','https://youtu.be/WYUm5YIZaXw'],['tke','https://youtube.com/shorts/pdqTtVXkW58'],
 ['banded_iso_squat','https://youtu.be/qf1ydVNXMcE'],['ham_lat_sink','https://youtube.com/shorts/iYc38DOMhJc'],['supine_ir','https://youtube.com/shorts/qidp2Qk320Y'],
 ['heel_clicks','https://youtube.com/shorts/0O7COTW8mtM'],['switch_no_hands','https://youtu.be/Et4jlYPz4IU'],['elev_hip_flex','https://youtu.be/MrkEyawoGdA'],
 ['trx_lat_airplane','https://youtube.com/shorts/r31gx2-xKaA'],['child_y','https://youtube.com/shorts/M4QZDiTKGMc'],['band_oh_raise','https://youtube.com/shorts/lw2xjg512C8'],
 ['ham_knee_tap','https://youtube.com/shorts/LrsLXxVtANg'],['cossack_reach','https://youtu.be/ahwcfaiM9nM'],['elev_hip_car','https://youtube.com/shorts/_fCFSf5MU8o'],['hip_cars','https://youtube.com/shorts/_fCFSf5MU8o'],
 ['endrange_irer','https://youtube.com/shorts/ka8r7yYvYUg'],['glider_lat_lunge','https://youtube.com/shorts/LDij0OiBTH4'],['elev_add_rocks','https://youtube.com/shorts/0ptYVxkL3Sw'],
 ['wall_t_rot','https://youtube.com/shorts/EKxiih9jLS0'],['wgs','https://youtube.com/shorts/ssBjgW_XAtI'],['bear_hug','https://youtube.com/shorts/Iah6nbuPaps'],
 ['three_pt_liftoff','https://youtube.com/shorts/QHWcBhcBEfE'],['couch_lat','https://youtube.com/shorts/VVMWTWBv7gg'],['switch_lean','https://youtube.com/shorts/Q2wcGsjLHIY'],
 ['scorpion_toe','https://youtube.com/shorts/VReQ5j31Az8'],['add_windmill','https://youtube.com/shorts/ESy2aAo1Jno'],['ankle_rocks','https://youtube.com/shorts/j-5J10_Y5NM'],
 ['band_ankle_mob','https://youtu.be/ns5BIlPglrI'],['band_ankle_dorsi','https://youtu.be/SkveLSG-KkM'],['deficit_sl_calf','https://youtube.com/shorts/JF9JPXCLehk'],['sl_calf','https://youtube.com/shorts/JF9JPXCLehk'],
 ['heel_touchdown','https://youtube.com/shorts/lqubjQiXsUU'],['tip_toe_squat','https://youtube.com/shorts/XEKYXazGAp4'],['lying_croissant','https://youtube.com/shorts/Osy475NpM58'],
 ['trx_angels','https://youtu.be/PuQN8Aunvew'],['band_ir','https://youtu.be/XNhyQUUzd3g'],['wall_hip_circles','https://www.youtube.com/shorts/kqCTe85bVXc'],
 ['sl_bridge_march','https://youtube.com/shorts/jC7TPRpTTIk'],['wall_shoulder_car','https://youtube.com/shorts/3g2ktuMEIzM'],['shoulder_cars','https://youtube.com/shorts/3g2ktuMEIzM'],
 ['elev_tspine','https://youtube.com/shorts/msLrEJTB8D8'],['thread_needle','https://youtube.com/shorts/fiz_HnYbc8c'],['elbow_rot_wall','https://youtu.be/FvGVWsxv8wM'],
 ['bench_9090','https://youtube.com/shorts/m5D4BBHODYs'],['foam_abduction','https://youtube.com/shorts/GJ072jGraRY'],['combat_sl','https://youtube.com/shorts/IwrCPi5CTc4'],
 ['trx_sprinter','https://youtube.com/shorts/6RvVpyUYpYg'],['thoracic_ext','https://youtube.com/shorts/qAVXylEOv5g'],['fr_knee_drops','https://youtube.com/shorts/Bh0Iwid0AD4'],
 ['prayer_stretch','https://youtu.be/HjxxCCbUvlc'],['prone_y_press','https://youtube.com/shorts/zyaQjCIBFNA'],['lizard_side','https://youtube.com/shorts/TYECoWWnk5w'],
 ['cossack_wgs','https://youtube.com/shorts/wrA8958CAc0'],['liftoff_combat','https://youtube.com/shorts/pObRF91BUxg'],['switch_tripod','https://youtu.be/hye7KUIItQI'],
 ['jefferson','https://youtube.com/shorts/3OI7Y_xG-DE'],['deep_sq_calf','https://youtube.com/shorts/uiAmZRa68rY'],['tiptoe_knee_drop','https://youtube.com/shorts/IDWr30yO9QE'],
 ['y_touchdown','https://youtube.com/shorts/uMN-5eUyEAw'],['knee_band_step','https://youtube.com/shorts/VM-mVgz5-aU'],['glider_circles','https://youtube.com/shorts/9_3OMZQpjXA'],
 ['quad_liftoff','https://youtube.com/shorts/MeR1fxpA9H8'],['prone_hip_cars','https://youtube.com/shorts/ykFh8tgNaXo'],['kb_hip_flex','https://youtube.com/shorts/G3ZK4Z3iIBM'],
 ['pancake','https://youtube.com/shorts/ZXuk-U15Gmg'],['fwd_lean_rot','https://youtube.com/shorts/p4QqoVoxaDk'],['spinal_wave','https://youtube.com/shorts/-3UXQ3QCg78'],
 ['preacher_liftoff','https://youtube.com/shorts/fpjlYJnbkGM'],['kneeling_fallout','https://youtu.be/wD94tMSjzJk'],['hip_drops_9090','https://youtube.com/shorts/3R6gd8-tt3o'],
 ['ext_hinge','https://youtu.be/F7IVfg7Bvyc'],['add_slides','https://youtube.com/shorts/g3U-Zd4vtqI'],['straight_band_abd','https://youtube.com/shorts/Hni6OGDWyQE'],
 ['shin_box_getup','https://youtube.com/shorts/21Xdv0_AWHY'],['mb_t_cars','https://youtube.com/shorts/SlJrFGRXxtU'],['quad_elbow_rot','https://youtube.com/shorts/o2UaONkMMHQ'],
 ['prone_sa_car','https://youtube.com/shorts/uK5mGquRx0M'],['wall_t_twist','https://youtube.com/shorts/1pS8SrtEHTQ'],['wall_presses','https://youtu.be/yjXle80mgVs'],
 ['pigeon_wgs','https://youtu.be/KyXwesjZ26A'],['scorpion_tripod','https://youtube.com/shorts/qfXzeKQMbNo'],['cossack_ham','https://youtube.com/shorts/UZHjCOBMLa4'],
 ['alt_combat','https://youtube.com/shorts/zhPiH1quAQA'],['add_thrust_windmill','https://youtube.com/shorts/psTVcuDF5Qs'],['ankle_band_cars','https://youtube.com/shorts/EVOwfi6rvus'],['ankle_cars','https://youtube.com/shorts/EVOwfi6rvus'],
 ['banded_y_td','https://youtu.be/DkFxI6im4vs'],['slider_rev_curl','https://youtube.com/shorts/1lHxx8W0B1M'],['squat_walk','https://youtube.com/shorts/DCswRAY7DH8']
]);
V('R', [
 ['box_jump','https://youtube.com/shorts/RTTQtyubwvE'],['ballistic_row','https://youtube.com/shorts/JPuzcDgSwDg'],['paused_dl','https://youtube.com/shorts/YWgmDUEzfJc'],
 ['rnt_split','https://youtu.be/rBVK2du-zTY'],['ball_curl','https://youtube.com/shorts/uQ1GjPn0zsc'],['sb_iso','https://youtube.com/shorts/nJbOX6bWtkU'],
 ['zercher_squat','https://youtube.com/shorts/iIYBrGzA1JI'],['lateral_lunge','https://youtube.com/shorts/Tm6IYejB_8M'],['depth_jump','https://youtube.com/shorts/_Zn-eV5WgE0'],
 ['heel_wall_sit','https://youtube.com/shorts/yG9kUU2uyfY'],['ecc_floor_press','https://youtube.com/shorts/idP02t2oyBU'],['pulldown_iso','https://youtube.com/shorts/5XWeIk2S1pw'],
 ['sl_sa_press','https://youtube.com/shorts/MnVIJbHX-W4'],['tk_lm_push_press','https://youtube.com/shorts/QlhMQHLsoBc'],['inverted_row','https://youtube.com/shorts/ura1t7-FXHU'],
 ['ecc_pushup','https://youtube.com/shorts/b8mYkqXsktE'],['bird_dog_row','https://youtu.be/t8Azu8rJLJs'],['hk_lat_raise','https://youtube.com/shorts/6aSnwWQ2HLE'],
 ['copenhagen','https://youtube.com/shorts/8XRYnWm1leA'],['front_rack_march','https://youtube.com/shorts/lKgnvHT_rJQ'],['mb_pallof_rot','https://youtube.com/shorts/QmxH_YYntPo'],
 ['farmers_heavy','https://youtube.com/shorts/AvDwSzVXUWE'],['farmer_carry','https://youtube.com/shorts/AvDwSzVXUWE'],['rdl','https://youtube.com/shorts/KMB9b0uH2rM'],['marching_lunge','https://youtube.com/shorts/OPL5rl-jyEQ'],
 ['pause_squat','https://youtube.com/shorts/37eO2eu28dE'],['banded_vj','https://youtu.be/Ss4gsMnEDHo'],['sl_ball_slam','https://youtube.com/shorts/Bjn15ZRvVoA'],
 ['glider_rev_lunge','https://youtube.com/shorts/qlII9NfVntk'],['kb_drop_split','https://youtube.com/shorts/M9s2bMz82ug'],['kb_swing','https://youtube.com/shorts/k4HW3xSl82o'],
 ['hk_db_snatch','https://youtube.com/shorts/lzdmalWkNdI'],['hk_face_pull','https://youtube.com/shorts/tKhuXx0Pk4g'],['handsoff_pushup','https://youtube.com/shorts/mujypvobSC4'],
 ['gorilla_row','https://youtube.com/shorts/ilZHJamEHOk'],['db_push_press','https://youtube.com/shorts/Dud_8rwUDSY'],['oh_march','https://youtube.com/shorts/88bEs-UlTjc'],
 ['pin_row','https://youtube.com/shorts/pG0VBq03irY'],['chest_211','https://youtube.com/shorts/bK-zhIdxs-A'],['wall_push','https://youtube.com/shorts/7405CnwDVoU'],
 ['zercher_gm','https://youtube.com/shorts/LkCkMSJn7Gw'],['kb_rack_lat_lunge','https://youtube.com/shorts/l0IO7GgUsUk'],['staggered_dl','https://youtube.com/shorts/oAZ8LOiRGUU'],
 ['deficit_offset_split','https://youtube.com/shorts/193lf74_zw4'],['banded_trap_dl','https://youtube.com/shorts/SXi9MF0i20Q'],['landmine_hack','https://youtube.com/shorts/OdPm4aKMXKc'],
 ['sl_landmine_rdl','https://youtube.com/shorts/V4DTlRCJbo8'],['hk_vert_press','https://youtube.com/shorts/dbuK6gZktyc'],['band_floor_press','https://youtube.com/shorts/tbiZpztZs14'],
 ['renegade_kick','https://youtube.com/shorts/T_9BbIdx4NU'],['ecc_chin','https://youtube.com/shorts/kI1LufGuS7Y'],['bb_incline','https://youtube.com/shorts/_sEV46DaxJ4'],['incline_bench','https://youtube.com/shorts/_sEV46DaxJ4'],
 ['lm_sa_row','https://youtube.com/shorts/-jSLZBo6idM'],['lm_woodchop','https://youtube.com/shorts/8qnvzAG4VoU'],['copen_crunch','https://youtube.com/shorts/Oi6JZbsTSCo'],
 ['pallof_lat_flex','https://youtube.com/shorts/nVSiUA5r6cw'],['pallof_march','https://youtube.com/shorts/d32QWDpRaYk'],['sb_circles','https://youtube.com/shorts/AzJj6QvOcn4'],
 ['curtsy_lunge','https://youtube.com/shorts/mXpV69XyixY'],['alt_fwd_lunge','https://youtube.com/shorts/HlxW5xu-hYE'],['db_bosch_clean','https://youtube.com/shorts/AGLmgojNKLo'],
 ['pin_squat','https://youtube.com/shorts/4Gxzr-dRSbc'],['reactive_vj','https://youtube.com/shorts/Ajc1Zmoy9Ic'],['hip_thrust_15','https://youtube.com/shorts/nDRDwdk5Jhc'],
 ['sa_lm_snatch','https://youtube.com/shorts/9vjIssu9SPQ'],['hk_td_press','https://youtube.com/shorts/A-izj6WOeI8'],['liftoff_pushup','https://youtube.com/shorts/Q4tprtB7AK0'],
 ['dyn_narrow_press','https://youtube.com/shorts/ez4wELJNbsA'],['sa_drop_row','https://youtube.com/shorts/skBnNEPZWrY'],['pendlay_row','https://youtu.be/BLS_28E-QhE'],
 ['mb_bo_slam','https://youtu.be/RoGUqN1Q930'],['ecc_power_curl','https://youtube.com/shorts/dAizI6QYZRo'],['jump_squat','https://youtube.com/shorts/uky5pLWhBkg'],
 ['sl_db_hip_thrust','https://youtube.com/shorts/nJcSytBA9C8'],['ffe_bss','https://youtube.com/shorts/1c__TSnbZQ0'],['bss','https://youtube.com/shorts/1c__TSnbZQ0'],
 ['ffe_rev_lunge','https://youtube.com/shorts/Nrq0aK4S0Ec'],['mb_back_ext','https://youtube.com/shorts/8TSfR-yykIM'],['tk_press_pull','https://youtu.be/_2MS2t_boBI'],
 ['three_pt_raise','https://youtu.be/f_zj1k85ITQ'],['assisted_pullup','https://youtu.be/5Bifcp2Qk4w'],['ecc_bench','https://youtube.com/shorts/AB9evDhij6U'],
 ['rot_renegade','https://youtube.com/shorts/qL8x_ZgyWvY'],['cs_db_row','https://youtube.com/shorts/IyuWf9Vq_cs'],['chest_supported_row','https://youtube.com/shorts/IyuWf9Vq_cs'],['high_incline','https://youtu.be/xRFR1XDXRM8'],
 ['rot_slam','https://youtube.com/shorts/vY24Yoos2hw'],['chaos_carry','https://youtu.be/vfdqdU3eDRs'],['sl_mb_leg_raise','https://youtube.com/shorts/vrmAg39eGk8'],
 ['side_star','https://youtube.com/shorts/cXiMjAQiI64'],['power_step_up','https://youtube.com/shorts/TGHRKdCeAt8'],['alt_box_jump','https://youtube.com/shorts/dhiZOojCljA'],
 ['banded_lat_bound','https://youtube.com/shorts/Dzlz0oGhyWM'],['box_squat','https://youtube.com/shorts/RpOr_I-bBwU'],['rocket_jump','https://youtube.com/shorts/Qg1xrVXqqSI'],
 ['pause_hip_thrust','https://youtube.com/shorts/PQ2-saU2JMc'],['hip_thrust','https://youtube.com/shorts/PQ2-saU2JMc'],['depth_broad','https://youtube.com/shorts/i9LG-Pc0i0M'],['narrow_pulldown','https://youtube.com/shorts/XaDkg8W0k4g'],['cg_pulldown','https://youtube.com/shorts/XaDkg8W0k4g'],
 ['speed_pulldown','https://youtube.com/shorts/R41DCn2ankg'],['deficit_pushup','https://youtube.com/shorts/g-kBybo50RU'],['plyo_pushup','https://youtube.com/shorts/kh9OD9kNdsA'],
 ['push_press','https://youtube.com/shorts/FyMm4Nfm0cc'],['mb_vert_toss','https://youtube.com/shorts/Nf-d_z-lK0E'],['ywt','https://youtube.com/shorts/PK0a61Gi-Jo'],
 ['battle_rear_fly','https://youtube.com/shorts/O2mrzfNJTwo'],['bear_crawl','https://bit.ly/3Y1vhGL']
]);
V('M', [
 ['pogo','https://bit.ly/42A85k9'],['standing_calf','https://bit.ly/3Gd3sFj'],['triple_ext','https://bit.ly/3YAFNow'],['back_squat','https://bit.ly/4jgblZp'],
 ['goblet_squat','https://bit.ly/4jptvrx'],['leg_press','https://bit.ly/42o38MJ'],['knee_tuck','https://bit.ly/3YCVCep'],['db_rdl','https://bit.ly/4jfn9ed'],
 ['sl_rdl','https://youtu.be/r6rQLPpcPTM?t=503'],['seated_gm','https://bit.ly/4jeS6z8'],['couch_stretch','https://bit.ly/4jqUVNy'],['scap_pullup','https://bit.ly/4ji3sm8'],
 ['z_press','https://bit.ly/4jptvb1'],['db_shoulder_press','https://bit.ly/3GdkNOq'],['incline_db','https://bit.ly/4jfPotl'],['chin_up','https://bit.ly/3GdkNxU'],
 ['lat_pulldown','https://bit.ly/3Gg0u2P'],['db_bench','https://bit.ly/3Y59NZC'],['bench_press','https://bit.ly/3Yw4UJp'],['push_up','https://bit.ly/4ji3sCE'],
 ['scap_pushup','https://bit.ly/4jeS6iC'],['cat_cow','https://bit.ly/3Ya77df'],['plank','https://bit.ly/3Y6Bam2'],['pullover_skull','https://bit.ly/3Y63swX'],
 ['db_tri_ext','https://bit.ly/44vemQL'],['db_row_2','https://bit.ly/4ja2KqZ'],['db_row','https://bit.ly/4ir6Rhd'],['cable_row','https://bit.ly/4j85sgC'],
 ['halos','https://bit.ly/3Y47IwW'],['tgu','https://bit.ly/4itxHoJ'],['deadlift','https://bit.ly/4jnMnHC'],['db_deadlift','https://bit.ly/3RqxB6p'],
 ['trap_bar_dl','https://bit.ly/3Y7bplD'],['hollow_hold','https://bit.ly/3Y4cPxa'],['deficit_rev_lunge','https://bit.ly/3Y6Ba5w'],['single_leg_press','https://bit.ly/442JBme'],
 ['split_squat','https://bit.ly/4jiOnAN'],['backward_sled','https://bit.ly/4jlMjYO'],['poliquin_step','https://bit.ly/44AiCOV'],['petersen','https://bit.ly/44AiCOV'],
 ['suitcase_march','https://bit.ly/3Y19Tl2'],['cg_bench','https://bit.ly/3Y59Og8'],['cg_pushup','https://bit.ly/3Gg0tMj'],['tri_dip','https://bit.ly/42BK6ky'],['chest_dip','https://bit.ly/42BK6ky'],
 ['seated_sh_ext','https://bit.ly/4jnMnY8'],['prone_y','https://bit.ly/4jHGnsR'],['lateral_raise','https://bit.ly/3EtQ2UW'],['cable_lateral','https://bit.ly/3EwLq0i'],
 ['squat_curl','https://bit.ly/4jm8w9c'],['incline_curl','https://bit.ly/3GgJA48'],['preacher_curl','https://bit.ly/4jgQK7e'],['katana_ext','https://bit.ly/4lQo9ay'],
 ['db_oh_ext','https://bit.ly/3EovU6E'],['db_side_ext','https://bit.ly/3EvXuPh'],['vertical_jump','https://bit.ly/4jad5mI'],['db_thruster','https://bit.ly/44uy5jt'],
 ['split_pogo','https://bit.ly/3Gg0tvN'],['split_exchange','https://bit.ly/44upD3K'],['lying_leg_raise','https://bit.ly/3YAFN80'],['wall_pogo','https://bit.ly/4jcGRal'],
 ['hanging_knee','https://bit.ly/4je4102'],['pike_pulse','https://bit.ly/3Y19T4w'],['sl_leg_raise','https://bit.ly/3Y47Igq'],['dual_hip_thrust','https://bit.ly/42AqMEn'],
 ['glute_bridge','https://bit.ly/3Y3rysd'],['platz','https://bit.ly/4jgQKnK'],['ssm_flexion','https://bit.ly/3EDLpYi'],['bw_skull','https://bit.ly/3Y7xctj'],
 ['bent_row','https://bit.ly/4jcGRqR'],['seated_vj','https://bit.ly/4jgDnUB'],['smith_split','https://bit.ly/3Y74Dw6'],['hip_flexor_plank','https://bit.ly/4cIWggw'],
 ['zercher_march','https://bit.ly/4jf8VKf'],['russian_twist','https://bit.ly/3EuhZMn'],['landmine_press','https://bit.ly/4jihBj4'],['face_pull','https://bit.ly/4jf8VtJ'],
 ['rear_delt_fly','https://bit.ly/44xfEL6'],['cable_curl','https://bit.ly/44xjoMA'],['cross_tri_ext','https://bit.ly/4jqUVx2'],['twisting_bear','https://bit.ly/4irk0qE'],
 ['broad_jump','https://bit.ly/3Y85TiG'],['db_clean_press','https://bit.ly/4je41gy'],['renegade_row','https://bit.ly/4jirQEe'],['air_squat','https://bit.ly/4jgdT9C'],
 ['full_crunch','https://bit.ly/4jirQnI'],['reverse_crunch','https://bit.ly/42wKNND'],['hyper_45','https://bit.ly/3Ggi4DQ'],['back_ext','https://bit.ly/3Ggi4DQ'],['horse_gm','https://bit.ly/3Y3rybH'],
 ['ham_bridge','https://bit.ly/4jfn9uJ'],['long_lunge','https://bit.ly/4jad5De'],['bench_dip','https://bit.ly/42zQpp3'],['incline_skull','https://bit.ly/4lyks94'],
 ['walking_lunge','https://bit.ly/3Y7bp57'],['pike_raise','https://bit.ly/4jyFxz7'],['box_step_over','https://bit.ly/3GgJAkE'],['bicycle_crunch','https://bit.ly/42Bo5me'],
 ['burpee','https://bit.ly/3Y4coTF'],['copenhagen','https://bit.ly/3YFgRMH'],['inverted_row','https://bit.ly/4jiOnRj']
]);
V('W', [
 ['decline_bench','https://www.youtube.com/shorts/tdLxgjkch6U'],
 ['machine_chest','https://www.youtube.com/shorts/JsQd_KYl4w8'],
 ['cable_fly','https://www.youtube.com/shorts/J2h--eoHK_U'],
 ['low_high_fly','https://www.youtube.com/shorts/MEZ8UPbOO08'],
 ['pec_deck','https://www.youtube.com/shorts/CRroep849bU'],
 ['db_fly','https://www.youtube.com/shorts/vLIXFhYwOTs'],
 ['doorway_stretch','https://www.youtube.com/shorts/R4AbcqgOq1k'],
 ['ohp','https://www.youtube.com/shorts/afR3tPH6y_g'],
 ['arnold_press','https://www.youtube.com/shorts/-9A_v40puWU'],
 ['machine_shoulder','https://www.youtube.com/shorts/Gkk-6q7Rq-s'],
 ['front_raise','https://www.youtube.com/shorts/h9xfpTrAvkE'],
 ['upright_row','https://www.youtube.com/shorts/yKxzW8TtyYw'],
 ['reverse_pec_deck','https://www.youtube.com/shorts/dT53N5ES4_U'],
 ['pike_pushup','https://www.youtube.com/shorts/shEnAXgc9y4'],
 ['cross_body','https://www.youtube.com/shorts/aIq0fLi8iak'],
 ['sleeper_stretch','https://www.youtube.com/shorts/h4cDJvpqMUg'],
 ['wall_slides','https://www.youtube.com/shorts/11hWXiZ7Wpg'],
 ['cable_er','https://www.youtube.com/shorts/TKHZHdYThEw'],
 ['sidelying_er','https://www.youtube.com/shorts/ub2n-iZeqoU'],
 ['cable_ir','https://www.youtube.com/shorts/jBPTh2_zIv4'],
 ['er_9090','https://www.youtube.com/shorts/XmggqRL48vs'],
 ['full_can','https://www.youtube.com/shorts/Gb7MY58pCPE'],
 ['cuban_press','https://www.youtube.com/watch?v=Wr0M1ZGFY-k'],
 ['belly_press','https://www.youtube.com/watch?v=iXuv4PfRM6M'],
 ['pec_minor_stretch','https://www.youtube.com/watch?v=keKkIwLoaCM'],
 ['tfl_stretch','https://www.youtube.com/watch?v=WmkrgfkZp_A'],
 ['barbell_shrug','https://www.youtube.com/shorts/0ZiURh1o4sE'],
 ['db_shrug','https://www.youtube.com/shorts/PnpHIIyGmtI'],
 ['band_pull_apart','https://www.youtube.com/shorts/qi2y-eI_kuI'],
 ['power_clean','https://www.youtube.com/shorts/UkODOIuh6Ic'],
 ['pull_up','https://www.youtube.com/shorts/ZPG8OsHKXLw'],
 ['tbar_row','https://www.youtube.com/shorts/zAZQJYx9vrk'],
 ['straight_arm_pd','https://www.youtube.com/shorts/lnec6DdscJU'],
 ['db_pullover','https://www.youtube.com/shorts/zhtiNVFAKaI'],
 ['dead_hang','https://www.youtube.com/shorts/bDSqVe4b9pA'],
 ['lat_stretch','https://www.youtube.com/watch?v=5v9e1hPknvA'],
 ['barbell_curl','https://www.youtube.com/shorts/9_ijHhcwlkM'],
 ['ez_curl','https://www.youtube.com/shorts/d2r5TCqnR4Y'],
 ['db_curl','https://www.youtube.com/shorts/d34GebmKlHM'],
 ['hammer_curl','https://www.youtube.com/shorts/NyW2fT2gQhM'],
 ['reverse_curl','https://www.youtube.com/shorts/rGS_gwxG-5Q'],
 ['conc_curl','https://www.youtube.com/shorts/X_ScTuTTt94'],
 ['biceps_stretch','https://www.youtube.com/shorts/8p9wcvIGEsE'],
 ['skull_crusher','https://www.youtube.com/shorts/iVmVaWCNY-I'],
 ['pushdown','https://www.youtube.com/shorts/_k7Uv0YCixM'],
 ['rope_pushdown','https://www.youtube.com/shorts/PC6dREPvYlQ'],
 ['oh_extension','https://www.youtube.com/shorts/09gpiVqdpPM'],
 ['diamond_pushup','https://www.youtube.com/shorts/t2cR426fFx0'],
 ['kickback','https://www.youtube.com/shorts/vxEqAyBrT8Y'],
 ['tri_stretch','https://www.youtube.com/shorts/DzlrPqLkPTk'],
 ['wrist_curl','https://www.youtube.com/watch?v=hSukP162H4M'],
 ['rev_wrist_curl','https://www.youtube.com/watch?v=hCMC4Vh2g_s'],
 ['wrist_roller','https://www.youtube.com/watch?v=gUYXMoBpT8o'],
 ['plate_pinch','https://www.youtube.com/shorts/rGEXLWLj6tQ'],
 ['hammer_lever','https://www.youtube.com/watch?v=vTwGoc1RBKU'],
 ['pro_sup','https://www.youtube.com/shorts/fv2ygkzkmz4'],
 ['wrist_flex_stretch','https://www.youtube.com/shorts/63LEj3oP6lA'],
 ['wrist_ext_stretch','https://www.youtube.com/watch?v=_uINTR_7X-g'],
 ['side_plank','https://www.youtube.com/shorts/V2cUr7zG4hw'],
 ['hlr','https://www.youtube.com/shorts/0wSUjj5j1xo'],
 ['ab_wheel','https://www.youtube.com/shorts/esgE7M-YSyE'],
 ['cable_crunch','https://www.youtube.com/shorts/bd63yN6g_9w'],
 ['pallof','https://www.youtube.com/shorts/6q2n6pxG7jE'],
 ['woodchop','https://www.youtube.com/shorts/g1pOeE90S3o'],
 ['dead_bug','https://www.youtube.com/shorts/kSYl6XOzQ5U'],
 ['serratus_punch','https://www.youtube.com/shorts/5kXJJhNaq0Y'],
 ['open_book','https://www.youtube.com/shorts/85YPQ4tdJds'],
 ['suitcase_carry','https://www.youtube.com/shorts/CtrXZ8rGR8E'],
 ['med_ball_rot','https://www.youtube.com/shorts/MZ55qkrFlX4'],
 ['good_morning','https://www.youtube.com/shorts/ENSzd_DpeVM'],
 ['bird_dog','https://www.youtube.com/shorts/_1j_HWknGLg'],
 ['ql_stretch','https://www.youtube.com/shorts/fXZ0Y91D-rE'],
 ['sl_bridge','https://www.youtube.com/shorts/2sg3vqnE8qE'],
 ['cable_kickback','https://www.youtube.com/shorts/A9aN_L4vexk'],
 ['hip_abduction','https://www.youtube.com/watch?v=afpCTlFdyl8'],
 ['cable_abduction','https://www.youtube.com/shorts/no8JrJ4wxIw'],
 ['lateral_walk','https://www.youtube.com/shorts/mZ23K1ulW2A'],
 ['clamshell','https://www.youtube.com/shorts/Hj-2r7OlXuE'],
 ['fire_hydrant','https://www.youtube.com/shorts/yKfzvRloYZM'],
 ['hip_adduction','https://www.youtube.com/shorts/hGi9LYALabU'],
 ['step_up','https://www.youtube.com/shorts/OxWZ-G-RdCM'],
 ['cable_hip_flex','https://www.youtube.com/shorts/mxfIfJ1YHus'],
 ['psoas_march','https://www.youtube.com/watch?v=Tgx_gowosZg'],
 ['kneeling_hf','https://www.youtube.com/watch?v=Bfb-9dIWEr4'],
 ['pigeon','https://www.youtube.com/shorts/z-EU2k0mJAg'],
 ['frog_stretch','https://www.youtube.com/watch?v=JzOkzgDuHzY'],
 ['butterfly','https://www.youtube.com/shorts/jxN2MhR4iBE'],
 ['tfl_roll','https://www.youtube.com/watch?v=X5cqK0QI0Ow'],
 ['glute_ball','https://www.youtube.com/watch?v=HtdGOq74heM'],
 ['lateral_bound','https://www.youtube.com/watch?v=aFDlOvJ_JYE'],
 ['front_squat','https://www.youtube.com/shorts/_qv0m3tPd3s'],
 ['hack_squat','https://www.youtube.com/shorts/BLMNLLQu8co'],
 ['leg_ext','https://www.youtube.com/shorts/Tae3aeJe5Ks'],
 ['sissy_squat','https://www.youtube.com/shorts/KEoEmEJz-5A'],
 ['wall_sit','https://www.youtube.com/shorts/D0kZGdSC-Uk'],
 ['pistol','https://www.youtube.com/shorts/4xQYqoAVKIM'],
 ['reverse_nordic','https://www.youtube.com/shorts/869_dzHwY1s'],
 ['quad_stretch','https://www.youtube.com/shorts/rZnU2So0rCU'],
 ['lying_leg_curl','https://www.youtube.com/shorts/d6sg829PgNs'],
 ['seated_leg_curl','https://www.youtube.com/shorts/7PE3MlvGAts'],
 ['nordic','https://www.youtube.com/shorts/n7jvtdMJJ4w'],
 ['ham_stretch','https://www.youtube.com/shorts/Cym2ki1eN2w'],
 ['leg_swings','https://www.youtube.com/shorts/3l31E2cMGMk'],
 ['seated_calf','https://www.youtube.com/shorts/NrHJPauB01I'],
 ['calf_press','https://www.youtube.com/shorts/DqT1h2_hQJ4'],
 ['ball_heel_raise','https://www.youtube.com/shorts/l1aeQPbz6-E'],
 ['band_inversion','https://www.youtube.com/shorts/w5_lXxohhO4'],
 ['band_eversion','https://www.youtube.com/shorts/YIbmJoXpI6M'],
 ['calf_stretch','https://www.youtube.com/shorts/cc0k8cQxeEU'],
 ['soleus_stretch','https://www.youtube.com/shorts/ajJDppnp3_0'],
 ['band_dorsi','https://www.youtube.com/shorts/3yFwR4z0gT0'],
 ['sl_balance','https://www.youtube.com/shorts/6X24BKKQep0'],
 ['shin_stretch','https://www.youtube.com/shorts/eVFtPf57dX8'],
 ['neck_flexion','https://www.youtube.com/shorts/U0sH-DhMIjw'],
 ['neck_iso','https://www.youtube.com/shorts/Ik6U4kIMmsg'],
 ['chin_tuck','https://www.youtube.com/shorts/UKd-riCk3t4'],
 ['neck_stretch','https://www.youtube.com/watch?v=oFuYstVevAc'],
 ['trap_stretch','https://www.youtube.com/shorts/jgywvs9ZHsE'],
 ['reverse_hyper','https://www.youtube.com/watch?v=P0NpQq-1Ytc'],
 ['side_squat','https://www.youtube.com/watch?v=Gh6b-ZzaJvI'],
 ['sled_push','https://www.youtube.com/shorts/FKEuEp6pmsE'],
 ['split_step','https://www.youtube.com/watch?v=iCAmGtNFxRc'],
 ['split_step_run','https://www.youtube.com/shorts/LSwXkz-EF8g'],
 ['band_run','https://www.youtube.com/watch?v=kW3mLx54b5M'],
 ['mb_chest_pass','https://www.youtube.com/shorts/0lokMwv2tq4'],
 ['battle_waves','https://www.youtube.com/shorts/4bjlu8KUChs'],
 ['spider_curl','https://www.youtube.com/shorts/w5xTuSvjVG0'],
 ['zottman_curl','https://www.youtube.com/shorts/5Go_uOTnFl0'],
 ['drag_curl','https://www.youtube.com/shorts/7uSIV9_QhpE'],
 ['gripper','https://www.youtube.com/shorts/6R95Vyf7x8I'],
 ['towel_hang','https://www.youtube.com/shorts/tc9LgWtY31s'],
 ['fat_grip_hold','https://www.youtube.com/watch?v=jPeBAzhtlNY'],
 ['band_finger_ext','https://www.youtube.com/shorts/PrbsDINoCUA'],
 ['racket_wrist','https://www.youtube.com/watch?v=tR7QKkWBk8Y'],
 ['shrug_overhead','https://www.youtube.com/watch?v=XWjD5aK8gTQ'],
 ['kelso_shrug','https://www.youtube.com/shorts/mtWnSM9CI7I'],
 ['neck_harness','https://www.youtube.com/watch?v=VLdIkr2Gfdc'],
 ['neck_cars','https://www.youtube.com/watch?v=J3tkQ4pk_Sc'],
 ['band_neck_rot','https://www.youtube.com/watch?v=9P4cf3OOzsI'],
 ['band_swing','https://www.youtube.com/watch?v=Srw2QeVFr_k'],
 ['rot_throw_scoop','https://www.youtube.com/shorts/woDIxfT4MXU'],
 ['ab_dragon','https://www.youtube.com/watch?v=GFMmw8yRm4s'],
 ['row_erg','https://www.youtube.com/shorts/L4y5NSmsUhk'],
 ['bike_sprint','https://www.youtube.com/watch?v=NxEu6bs-2uQ'],
 ['ghost_drill','https://www.youtube.com/watch?v=cGiEvMQlfN0'],
 ['lateral_shuffle','https://www.youtube.com/watch?v=SDEKG4epIik'],
 ['skater_hops','https://www.youtube.com/shorts/JYYd01yhoUk'],
 ['jump_rope','https://www.youtube.com/shorts/dW3wU0ZlvS0'],
 ['calf_iso','https://www.youtube.com/watch?v=Hdvjfl-xxOk'],
 ['heel_walks','https://www.youtube.com/watch?v=sBww6q9Zybs'],
 ['toe_walks','https://www.youtube.com/watch?v=D71EAOKlob4'],
 ['band_ext_iso','https://www.youtube.com/shorts/KVICnhOvMGA'],
 ['wall_angels','https://www.youtube.com/shorts/sxEd97miPXI'],
 ['push_up_plus','https://www.youtube.com/shorts/vttuFrrxIh8'],
 ['bear_hold','https://www.youtube.com/watch?v=78fQB0nQpbM'],
 ['elbow_cars','https://www.youtube.com/shorts/rSe4GbwkeV4'],
 ['quad_fr','https://www.youtube.com/shorts/wBAjFvGNX44'],
 ['calf_fr','https://www.youtube.com/shorts/YAz9yH_q9os'],
 ['lat_fr','https://www.youtube.com/watch?v=aaoVNwkYi1s'],
 ['pec_ball','https://www.youtube.com/watch?v=3AC2-KOtF2c'],
 ['forearm_roll','https://www.youtube.com/watch?v=xf72fBX0zvk'],
 ['foot_roll','https://www.youtube.com/shorts/5aWTVVb-CKY'],
 ['upper_trap_ball','https://www.youtube.com/shorts/DGHRGdOuhdI'],
 ['cuff_ball','https://www.youtube.com/watch?v=rFrH2IloiFY'],
 ['scm_massage','https://www.youtube.com/shorts/6vkyVV5H1kI'],
 ['arm_circles','https://www.youtube.com/shorts/RN40wyH6x9o'],
 ['side_delt_stretch','https://www.youtube.com/watch?v=UUL65w9rkRA'],
 ['pec_minor_lift','https://www.youtube.com/shorts/VPLu9eXr5Xs'],
 ['dip_shrug','https://www.youtube.com/watch?v=TeFK9anZjxk'],
 ['tri_band_mob','https://www.youtube.com/watch?v=rA9SMk1Bu3o'],
 ['ql_side_mob','https://www.youtube.com/shorts/KhUPbvIs9WE'],
 ['ql_rotation_mob','https://www.youtube.com/watch?v=xNLKJJdEMzc'],
 ['ham_floss','https://www.youtube.com/watch?v=IqaBYEDj83o'],
 ['overhead_lat_stretch','https://www.youtube.com/shorts/9BMtKg4mzJw'],
 ['cuff_stretch','https://www.youtube.com/watch?v=omeww85Mhkw'],
 ['subscap_stretch','https://www.youtube.com/watch?v=HzI-XCLNuLU'],
 ['teres_stretch','https://www.youtube.com/watch?v=DDGr4hzE7oE'],
 ['brachialis_stretch','https://www.youtube.com/watch?v=nFSmAMYAEw8'],
 ['tri_med_stretch','https://www.youtube.com/watch?v=x15GEWlbp7g'],
 ['rhomboid_stretch','https://www.youtube.com/watch?v=RDXWJlpwpz0'],
 ['lower_trap_stretch','https://www.youtube.com/watch?v=YTAwpiX2Dsg'],
 ['serratus_stretch','https://www.youtube.com/watch?v=RtgjuKiP6j4'],
 ['tva_stretch','https://www.youtube.com/shorts/OBSwUk5SQz4'],
 ['child_pose','https://www.youtube.com/shorts/CHk_NNL5cQU'],
 ['knee_hug','https://www.youtube.com/shorts/sdcXppImpP4'],
 ['glute_min_stretch','https://www.youtube.com/watch?v=rYE95M6D0Mo'],
 ['seated_twist','https://www.youtube.com/watch?v=Y750C4BcSB0'],
 ['lying_twist','https://www.youtube.com/watch?v=1CorCS9-izg'],
 ['vmo_stretch','https://www.youtube.com/shorts/asZSOD2xQpU'],
 ['inner_calf_stretch','https://www.youtube.com/watch?v=e-42b7y8aa0'],
 ['outer_calf_stretch','https://www.youtube.com/watch?v=eAg4QayTGKY'],
 ['tib_post_stretch','https://www.youtube.com/watch?v=Zdli_TUxCk4'],
 ['peroneal_stretch','https://www.youtube.com/watch?v=MO-YsASyCp4'],
 ['tibialis_band','https://www.youtube.com/watch?v=LrNO1l_QeVU'],
 ['scm_stretch','https://www.youtube.com/shorts/XYGyogNBa9w'],
 ['levator_stretch','https://www.youtube.com/shorts/SpJ1faG4rPE'],
 ['chest_wall_stretch','https://www.youtube.com/shorts/25FbsyV2BNM'],
 ['deep_squat_hold','https://www.youtube.com/shorts/Yn8RDPDTsz4'],
 ['frog_rock','https://www.youtube.com/watch?v=aDpfBeXb5PU'],
 ['happy_baby','https://www.youtube.com/shorts/ZkaacGXhazU']
]);
V('W', [['sidelying_abd','https://www.youtube.com/shorts/c34WOq72OQA'],['band_scaption','https://www.youtube.com/shorts/Gb7MY58pCPE'],['tib_wall_hold','https://youtube.com/shorts/iw4GzZnJyQY']]);
const VSRC = { M: 'From Minimalift', A: 'From ALIGN', R: 'From RELOAD', W: 'Found on YouTube' };
EXI = Object.fromEntries(EX.map(e => [e.id, e]));

// ================= State =================
const DEFAULT_PROFILE = { sex: 'male', age: 32, height: 178, bw: 80, sport: 'squash', assessed: false };
const DAY = 864e5;
const S = {
  profile: { ...DEFAULT_PROFILE }, sets: [], sample: false, sampleSets: [], loaded: false,
  tab: 'body', lens: 'D', view: 'front', sel: null, open: new Set(['glutes']),
  sheet: null, mGoal: 'all', mEq: 'all', libQ: '', libGoal: 'all', libEq: 'all', libGroup: 'all',
  assess: null, zoom: 1, vb: { x: 0, y: 0, w: 200, h: 430 }, confirmDel: null
};
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const allSets = () => S.sample ? S.sampleSets : S.sets;
const r1 = v => Math.round(v * 10) / 10;
const kg = v => `${r1(v)} kg`;

// ================= Storage =================
const Store = {
  mode: 'loading', key: 'muscle-atlas.v1',
  async init() {
    let db = null, user = null, uid = null;
    try { if (window.claude && window.claude.use) { [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]); } } catch (e) { db = null; }
    try { uid = user ? await user.id() : null; } catch (e) { uid = null; }
    if (db && uid) {
      this.mode = 'cloud';
      this.pref = db.doc(`data/users/${uid}/profile`);
      this.col = this.pref.collection('sets'); this.mcol = this.pref.collection('mind');
      let gotP = false, gotS = false;
      const done = () => { if (gotP && gotS) S.loaded = true; refresh(); };
      this.pref.onSnapshot(s => { if (s.exists) S.profile = { ...DEFAULT_PROFILE, ...s.data() }; gotP = true; done(); }, e => this.fail(e));
      this.col.onSnapshot(q => { S.sets = q.docs.map(d => ({ id: d.id, ...d.data() })); gotS = true; done(); }, e => this.fail(e));
      this.mcol.onSnapshot(q => { S.mind = q.docs.map(d => ({ id: d.id, ...d.data() })); refresh(); }, e => this.fail(e));
    } else {
      this.mode = 'local'; this.loadLocal(); S.loaded = true; refresh();
    }
  },
  fail(e) { toast('Sync stopped. Reload the page to reconnect.'); },
  loadLocal() {
    try { const d = JSON.parse(localStorage.getItem(this.key) || 'null'); if (d) { S.profile = { ...DEFAULT_PROFILE, ...d.profile }; S.sets = d.sets || []; S.mind = d.mind || []; } } catch (e) { }
  },
  saveLocal() { try { localStorage.setItem(this.key, JSON.stringify({ profile: S.profile, sets: S.sets, mind: S.mind })); } catch (e) { } },
  async addMind(doc) {
    if (this.mode === 'cloud') await this.mcol.doc().set(doc);
    else { S.mind.push({ id: 'm' + Date.now().toString(36), ...doc }); this.saveLocal(); refresh(); }
  },
  async addSets(list) {
    if (this.mode === 'cloud') {
      for (const s of list) { await this.col.doc().set(s); }
    } else {
      for (const s of list) S.sets.push({ id: 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...s });
      this.saveLocal(); refresh();
    }
  },
  async delSet(id) {
    if (this.mode === 'cloud') await this.col.doc(id).delete();
    else { S.sets = S.sets.filter(s => s.id !== id); this.saveLocal(); refresh(); }
  },
  async saveProfile(p) {
    S.profile = { ...p };
    if (this.mode === 'cloud') await this.pref.set(S.profile); else { this.saveLocal(); refresh(); }
  }
};

// ================= Standards & scoring =================
function slAt(key, bw) {
  const t = SL[key], b = Math.max(50, Math.min(140, bw)), i = (b - 50) / 5, lo = Math.floor(i), hi = Math.min(t.length - 1, lo + 1), f = i - lo;
  return t[lo].map((v, j) => v + (t[hi][j] - v) * f);
}
const ageFactor = a => a > 40 ? Math.max(0.6, 1 - 0.01 * (a - 40)) : 1;
function strengthLevels(ex) {
  if (!ex.std) return null;
  const [k, r] = ex.std.split('*'), ratio = r ? +r : 1, p = S.profile, fem = p.sex === 'female';
  let lv;
  if (SL[k]) lv = slAt(k, p.bw).map(v => v * ratio * (fem ? (UPPER.has(k) ? 0.5 : 0.62) : 1));
  else lv = BWX[k].map(m => m * p.bw * ratio * (fem ? 0.6 : 1));
  lv = lv.map(v => v * ageFactor(p.age));
  const src = SL[k] && !r && !fem && p.age <= 40 ? 'sl' : 'est';
  return { lv, src, base: k, ratio, total: !!BWX[k] };
}
function toScore(v, lv) {
  if (!(v > 0)) return 0;
  if (v < lv[0]) return 20 * v / lv[0];
  for (let i = 0; i < 4; i++) if (v < lv[i + 1]) return 20 * (i + 1) + 20 * (v - lv[i]) / (lv[i + 1] - lv[i]);
  return 100;
}
const levelName = s => s >= 100 ? 'Elite' : s >= 80 ? 'Advanced' : s >= 60 ? 'Intermediate' : s >= 40 ? 'Novice' : s >= 20 ? 'Beginner' : 'Starting out';
const LV_NAMES = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];
const loadOf = (ex, s) => ex.mode === 'bw' ? S.profile.bw * ex.bwf + (s.w || 0) : (s.w || 0);
function e1rm(ex, s) {
  const r = s.r || 0; if (r < 1 || r > 15) return 0;
  const L = loadOf(ex, s); if (L <= 0) return 0;
  return r === 1 ? L : L * (1 + r / 30);
}
function endVal(ex, s) { if (!ex.estd || s.w > 0) return 0; return ES[ex.estd][0] === 's' ? (s.s || 0) : (s.r || 0); }

let C = null; // computed cache
function compute() {
  const sets = allSets(), now = Date.now(), byEx = {};
  for (const s of sets) (byEx[s.ex] = byEx[s.ex] || []).push(s);
  const exBest = {};
  for (const [id, list] of Object.entries(byEx)) {
    const ex = EXI[id]; if (!ex) continue;
    const recent = list.filter(s => now - s.t < 90 * DAY), use = recent.length ? recent : list, stale = !recent.length;
    const o = { last: Math.max(...list.map(s => s.t)), n: list.length };
    const sl = strengthLevels(ex);
    if (sl) { const v = Math.max(0, ...use.map(s => e1rm(ex, s))); if (v > 0) o.str = { v, score: toScore(v, sl.lv) * (stale ? 0.9 : 1), stale }; }
    if (ex.estd) { const v = Math.max(0, ...use.map(s => endVal(ex, s))); if (v > 0) o.end = { v, score: toScore(v, ES[ex.estd][1]) }; }
    o.mins14 = list.filter(s => now - s.t < 14 * DAY).reduce((a, s) => a + (s.s ? s.s / 60 : 1), 0);
    exBest[id] = o;
  }
  const mus = {};
  for (const m in MUSCLES) mus[m] = { S: [0, 0, false], E: [0, 0, false], M: 0, F: 0, last: 0, lastSE: 0 };
  for (const [id, o] of Object.entries(exBest)) {
    const ex = EXI[id];
    for (const [m, w] of [...ex.pri.map(m => [m, 1]), ...ex.sec.map(m => [m, 0.35])]) {
      const a = mus[m];
      if (o.str) { a.S[0] += o.str.score * w; a.S[1] += w; if (w === 1) a.S[2] = true; }
      if (o.end) { a.E[0] += o.end.score * w; a.E[1] += w; if (w === 1) a.E[2] = true; }
      if (ex.goals.includes('M')) a.M += o.mins14 * w;
      if (ex.goals.includes('F')) a.F += o.mins14 * w;
      if (w === 1) a.last = Math.max(a.last, o.last);
      if (w === 1 && (ex.goals.includes('S') || ex.goals.includes('E'))) a.lastSE = Math.max(a.lastSE, o.last);
    }
  }
  for (const m in mus) {
    const a = mus[m];
    a.s = a.S[1] ? a.S[0] / a.S[1] : null; a.sDirect = a.S[2];
    a.e = a.E[1] ? a.E[0] / a.E[1] : null; a.eDirect = a.E[2];
    a.m = a.M > 0 ? Math.min(100, a.M / 20 * 100) : null;
    a.f = a.F > 0 ? Math.min(100, a.F / 20 * 100) : null;
    a.days = a.last ? Math.floor((now - a.last) / DAY) : null;
    a.daysSE = a.lastSE ? Math.floor((now - a.lastSE) / DAY) : null;
  }
  return { exBest, mus };
}
const LENSES = { D: 'Development', S: 'Strength', E: 'Endurance', M: 'Mobility', F: 'Flexibility', R: 'Last trained' };
const GOAL_ORDER = ['S', 'P', 'E', 'M', 'F'];
const plain = m => WHERE[m] || MUSCLES[m][0];
function lensVal(m, lens = S.lens) { const a = C.mus[m]; return { D: a.s ?? a.e, S: a.s, E: a.e, M: a.m, F: a.f, R: a.days }[lens]; }
function lensText(v, lens = S.lens) {
  if (v == null) return lens === 'R' ? 'Never directly' : lens === 'M' || lens === 'F' ? 'None in 14 days' : 'No data';
  if (lens === 'R') return v === 0 ? 'Today' : v === 1 ? 'Yesterday' : `${v} days ago`;
  if (lens === 'M' || lens === 'F') return `${Math.round(v)}% of target`;
  return levelName(v);
}
