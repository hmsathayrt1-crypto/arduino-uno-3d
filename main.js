/* ============================================================================
   أردوينو أونو R3 — نموذج ثلاثي الأبعاد مبني إجرائيًا بـ three.js
   كل الأبعاد بالملّيمتر، والوحدة الواحدة في المشهد = 1 mm
   ========================================================================== */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/* ---------------------------------------------------------------------------
   1) المشهد والعارض
   ------------------------------------------------------------------------- */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(32, 1, 1, 2000);
const CAM_DIR = new THREE.Vector3(0.52, 0.60, 0.61).normalize();
const CAM_TARGET = new THREE.Vector3(0, 2.5, 0);
let camDist = 150;
function fitCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  camera.aspect = aspect;
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  // مسافة تكفي لعرض 95mm أفقيًا (اللوحة 68.6 + هوامش) أو 92mm عموديًا
  camDist = Math.max(95 / (2 * tanHalf * aspect), 92 / (2 * tanHalf));
  camera.position.copy(CAM_DIR).multiplyScalar(camDist).add(CAM_TARGET);
  const w = window.innerWidth, h = window.innerHeight;
  if (aspect > 1.05) camera.setViewOffset(w, h, -Math.round(w * 0.035), Math.round(h * 0.045), w, h);
  else camera.setViewOffset(w, h, 0, Math.round(h * 0.05), w, h);
  camera.updateProjectionMatrix();
}
fitCamera();

const controls = new OrbitControls(camera, canvas);
controls.target.copy(CAM_TARGET);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.rotateSpeed = 0.85;
controls.zoomSpeed = 0.8;
controls.minDistance = 34;
controls.maxDistance = 420;
controls.maxPolarAngle = Math.PI * 0.52;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;
controls.update();

/* الإضاءة */
const hemi = new THREE.HemisphereLight(0xfff7e8, 0x8f8877, 1.15);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(30, 52, 24);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -70;
key.shadow.camera.right = 70;
key.shadow.camera.top = 70;
key.shadow.camera.bottom = -70;
key.shadow.camera.near = 10;
key.shadow.camera.far = 180;
key.shadow.bias = -0.0007;
key.shadow.normalBias = 0.03;
scene.add(key);

const fill = new THREE.DirectionalLight(0xcfe9e7, 0.75);
fill.position.set(-42, 24, -30);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffe6bd, 0.5);
rim.position.set(-10, 12, 46);
scene.add(rim);

/* أرضية لالتقاط الظل فقط */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(600, 600),
  new THREE.ShadowMaterial({ color: 0x2a2a22, opacity: 0.17 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -7.5;
ground.receiveShadow = true;
scene.add(ground);

/* ---------------------------------------------------------------------------
   2) الخامات
   ------------------------------------------------------------------------- */
const M = {
  mask:      new THREE.MeshStandardMaterial({ color: 0x0b7075, roughness: 0.62, metalness: 0.10 }),
  maskSide:  new THREE.MeshStandardMaterial({ color: 0x0a5f64, roughness: 0.72, metalness: 0.06 }),
  gold:      new THREE.MeshStandardMaterial({ color: 0xd9b64e, roughness: 0.24, metalness: 1.00 }),
  goldDim:   new THREE.MeshStandardMaterial({ color: 0xb08f3c, roughness: 0.36, metalness: 1.00 }),
  silver:    new THREE.MeshStandardMaterial({ color: 0xa9b0b3, roughness: 0.34, metalness: 1.00 }),
  steel:     new THREE.MeshStandardMaterial({ color: 0x9aa1a4, roughness: 0.42, metalness: 0.95 }),
  plastic:   new THREE.MeshStandardMaterial({ color: 0x17191c, roughness: 0.74, metalness: 0.04 }),
  plasticDk: new THREE.MeshStandardMaterial({ color: 0x0a0b0d, roughness: 0.60, metalness: 0.12 }),
  chip:      new THREE.MeshStandardMaterial({ color: 0x0f1013, roughness: 0.44, metalness: 0.22 }),
  ceramic:   new THREE.MeshStandardMaterial({ color: 0xcbb691, roughness: 0.86, metalness: 0.00 }),
  resistor:  new THREE.MeshStandardMaterial({ color: 0xd9c59c, roughness: 0.80, metalness: 0.00 }),
  trace:     new THREE.MeshStandardMaterial({ color: 0x0a6a6e, roughness: 0.65, metalness: 0.15 }),
};

const ledMats = {
  on:  new THREE.MeshStandardMaterial({ color: 0x1f6b32, emissive: 0x35e06a, emissiveIntensity: 1.6, roughness: 0.25, metalness: 0.1 }),
  l:   new THREE.MeshStandardMaterial({ color: 0x6b3a12, emissive: 0xff8a1e, emissiveIntensity: 0.10, roughness: 0.25, metalness: 0.1 }),
  tx:  new THREE.MeshStandardMaterial({ color: 0x6b5a12, emissive: 0xffd23e, emissiveIntensity: 0.08, roughness: 0.25, metalness: 0.1 }),
  rx:  new THREE.MeshStandardMaterial({ color: 0x6b5a12, emissive: 0xffd23e, emissiveIntensity: 0.08, roughness: 0.25, metalness: 0.1 }),
};

/* ---------------------------------------------------------------------------
   3) بيانات الدبابيس
   ------------------------------------------------------------------------- */
const PIN_INFO = {
  SCL:  { ar: 'ساعة I²C', kind: 'comm', desc: 'خط الساعة لناقل I²C — نسخة إضافية من A5 على لوحات R3، تُستخدم مع مكتبة Wire.' },
  SDA:  { ar: 'بيانات I²C', kind: 'comm', desc: 'خط بيانات ناقل I²C — نسخة إضافية من A4، ضروري لتوصيل شاشات OLED وحساسات I²C.' },
  AREF: { ar: 'مرجع التحويل التناظري', kind: 'power', desc: 'جهد المرجع الذي يقيس عليه الـ ADC. اتركه افتراضيًا (5V) إلا إذا احتجت دقة بجهد مرجعي خارجي.' },
  GND:  { ar: 'الأرضي', kind: 'gnd', desc: 'القطب السالب المشترك لكل التغذية والإشارات — أي توصيل يبدأ من هنا.' },
  D13:  { ar: 'رقمي 13 · مع LED', kind: 'digital', desc: 'الخرج الوحيد المرتبط بمصباح L المدمج على اللوحة، ويُستخدم أيضًا كساعة SPI (SCK).' },
  D12:  { ar: 'رقمي 12', kind: 'digital', desc: 'خرج/دخل رقمي — يعمل كخط MISO في ناقل SPI.' },
  D11:  { ar: 'رقمي 11 · PWM', kind: 'pwm', desc: 'خرج رقمي مع نبضات PWM (~) عبر المؤقت Timer2، وخط MOSI في SPI.' },
  D10:  { ar: 'رقمي 10 · PWM', kind: 'pwm', desc: 'خرج رقمي مع PWM (~)، ويُستخدم غالبًا لتحديد الجهاز (SS) في SPI.' },
  D9:   { ar: 'رقمي 9 · PWM', kind: 'pwm', desc: 'خرج رقمي مع PWM (~) عبر المؤقت Timer1 — مناسب للتحكم بسرعة المحركات وتعتيم الإضاءة.' },
  D8:   { ar: 'رقمي 8', kind: 'digital', desc: 'خرج/دخل رقمي عادي — لا يدعم PWM.' },
  D7:   { ar: 'رقمي 7', kind: 'digital', desc: 'خرج/دخل رقمي عادي — لا يدعم PWM.' },
  D6:   { ar: 'رقمي 6 · PWM', kind: 'pwm', desc: 'خرج رقمي مع PWM (~) عبر المؤقت Timer0.' },
  D5:   { ar: 'رقمي 5 · PWM', kind: 'pwm', desc: 'خرج رقمي مع PWM (~) عبر المؤقت Timer0.' },
  D4:   { ar: 'رقمي 4', kind: 'digital', desc: 'خرج/دخل رقمي عادي — لا يدعم PWM.' },
  D3:   { ar: 'رقمي 3 · PWM · مقاطعة', kind: 'pwm', desc: 'خرج PWM (~) ومدخل مقاطعة خارجية INT1 — مفيد للترميز وحسّاسات الحركة.' },
  D2:   { ar: 'رقمي 2 · مقاطعة', kind: 'digital', desc: 'مدخل مقاطعة خارجية INT1/INT0 — يستيقظ المتحكم من السكون عند حدث خارجي.' },
  D1:   { ar: 'رقمي 1 · TX', kind: 'comm', desc: 'إرسال التسلسل UART — متصل بمتحكم USB. تجنّب استخدامه إذا كنت تستخدم Serial.print.' },
  D0:   { ar: 'رقمي 0 · RX', kind: 'comm', desc: 'استقبال التسلسل UART — متصل بمتحكم USB. تجنّب استخدامه إذا كنت تستخدم Serial.read.' },
  IOREF:{ ar: 'مرجع جهد المنطق', kind: 'power', desc: 'يخبر الدروع (Shields) بجهد منطق اللوحة: 5 فولت هنا، 3.3 فولت على لوحات أخرى.' },
  RESET:{ ar: 'إعادة التهيئة', kind: 'power', desc: 'اسحبه إلى الأرضي (LOW) لإعادة تشغيل المتحكم — نفس عمل زر RESET.' },
  '3V3':{ ar: 'خرج 3.3 فولت', kind: 'power', desc: 'خرج منظَّم بتيار أقصى 150 مللي أمبير — لا يكفي لتغذية محرك أو شريحة قوية.' },
  '5V': { ar: 'خرج 5 فولت', kind: 'power', desc: 'الخرج المنظَّم الرئيسي بعد منظم الجهد على اللوحة — يغذّي الحساسات والوحدات الخارجية.' },
  VIN:  { ar: 'دخل الجهد الخام', kind: 'power', desc: 'جهد البطارية أو المحوّل قبل التنظيم (7–12 فولت) — يمرّ بمنظم 5 فولت على اللوحة.' },
  A0:   { ar: 'تناظري A0', kind: 'analog', desc: 'مدخل تناظري 10 بت (0–1023) يقيس جهدًا بين 0 و5 فولت — للمقاييس والحرارة والضوء.' },
  A1:   { ar: 'تناظري A1', kind: 'analog', desc: 'مدخل تناظري 10 بت — نفس مواصفات A0.' },
  A2:   { ar: 'تناظري A2', kind: 'analog', desc: 'مدخل تناظري 10 بت — نفس مواصفات A0.' },
  A3:   { ar: 'تناظري A3', kind: 'analog', desc: 'مدخل تناظري 10 بت — نفس مواصفات A0.' },
  A4:   { ar: 'تناظري A4 · SDA', kind: 'analog', desc: 'مدخل تناظري، وخط بيانات I²C (SDA) عند تفعيل مكتبة Wire.' },
  A5:   { ar: 'تناظري A5 · SCL', kind: 'analog', desc: 'مدخل تناظري، وخط ساعة I²C (SCL) عند تفعيل مكتبة Wire.' },
};

const KIND_LABEL = {
  digital: 'دخل / خرج رقمي',
  pwm: 'رقمي · PWM',
  analog: 'مدخل تناظري',
  power: 'تغذية',
  gnd: 'أرضي',
  comm: 'اتصال',
};

/* ---------------------------------------------------------------------------
   4) بناء اللوحة
   ------------------------------------------------------------------------- */
const board = new THREE.Group();
scene.add(board);

const explodeParts = [];
function part(dy = 0) {
  const g = new THREE.Group();
  g.userData.dy = dy;
  board.add(g);
  explodeParts.push(g);
  return g;
}

function box(w, h, d, material, x, y, z, parent, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = opts.cast !== false;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function rbox(w, h, d, radius, material, x, y, z, parent) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, radius), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function cyl(rTop, rBot, h, seg, material, x, y, z, parent, axis = 'y') {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, seg);
  if (axis === 'x') g.rotateZ(Math.PI / 2);
  if (axis === 'z') g.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(g, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

const pins = [];        // { id, info, hit, ring, anchor }
const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

/* ---- 4.1 لوحة الـ PCB ---- */
const PCB_W = 68.6, PCB_D = 53.3, PCB_T = 1.6;
const base = part(0);

(function buildPCB() {
  const w = PCB_W / 2, h = PCB_D / 2, ch = 5.1, r = 1.7;
  const s = new THREE.Shape();
  s.moveTo(-w + ch, -h);
  s.lineTo(w - r, -h);
  s.quadraticCurveTo(w, -h, w, -h + r);
  s.lineTo(w, h - r);
  s.quadraticCurveTo(w, h, w - r, h);
  s.lineTo(-w + ch, h);
  s.lineTo(-w, h - ch);
  s.lineTo(-w, -h + ch);
  s.closePath();

  [[-29.4, 21.3], [-29.4, -21.3], [30.3, 23.1], [30.3, -23.1]].forEach(([x, y]) => {
    const p = new THREE.Path();
    p.absarc(x, y, 1.6, 0, Math.PI * 2, true);
    s.holes.push(p);
  });

  const g = new THREE.ExtrudeGeometry(s, {
    depth: PCB_T,
    bevelEnabled: true,
    bevelThickness: 0.22,
    bevelSize: 0.22,
    bevelSegments: 2,
    curveSegments: 14,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -(PCB_T + 0.22), 0);

  const mesh = new THREE.Mesh(g, [M.mask, M.maskSide]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  base.add(mesh);
})();

/* ---- 4.2 طباعة السيلكسكرين ---- */
(function buildSilkscreen() {
  const W = 2048;
  const H = Math.round((W * PCB_D) / PCB_W);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  const SX = W / PCB_W;                     // بكسل لكل ملّيمتر
  const px = (x) => ((x + PCB_W / 2) / PCB_W) * W;
  const py = (z) => ((z + PCB_D / 2) / PCB_D) * H;
  const WHITE = 'rgba(233,246,244,0.94)';

  function txt(str, x, z, size, opt = {}) {
    const { rot = 0, align = 'center', weight = 700, color = WHITE, cond = 1, font = 'Arial, Helvetica, sans-serif', alpha = 1 } = opt;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(px(x), py(z));
    ctx.rotate(rot);
    ctx.scale(cond, 1);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.font = `${weight} ${size * SX}px ${font}`;
    ctx.fillText(str, 0, 0);
    ctx.restore();
  }

  /* مسارات نحاسية تحت القناع */
  ctx.strokeStyle = 'rgba(122,224,227,0.20)';
  ctx.lineWidth = 0.42 * SX;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  function route(x1, z1, x2, z2) {
    const dx = x2 - x1, dz = z2 - z1;
    const d = Math.min(Math.abs(dx), Math.abs(dz));
    ctx.beginPath();
    ctx.moveTo(px(x1), py(z1));
    ctx.lineTo(px(x1 + Math.sign(dx) * d), py(z1 + Math.sign(dz) * d));
    ctx.lineTo(px(x2), py(z2));
    ctx.stroke();
  }
  // من الشريحة إلى الرأس العلوي
  [-16.5, -11.4, -6.3, -1.2, 3.9, 9.0, 14.1].forEach((z, i) => {
    route(1.28, z, 8.66 + (i - 3) * 2.54, -23.5);
  });
  // من الشريحة إلى رؤوس اليمين
  [-14, -8.8, -3.6, 1.6, 6.8, 12].forEach((z, i) => {
    route(8.72, z, 31.2, -14 + i * 4.2);
  });
  // من USB إلى الشريحة
  route(-22.4, -9, 1.28, -12.5);
  route(-22.4, -12, 1.28, -15.2);
  // من مقبس الطاقة إلى المنظم ثم الشريحة
  route(-24.2, 14, -27.6, 8.4);
  route(-25.9, 4.2, -8.5, 6);
  route(-8.5, 6, 1.28, 6.2);
  // من المذبذب إلى الشريحة
  route(12.4, 14.4, 8.72, 12.4);
  route(17.6, 14.4, 8.72, 15.6);

  /* رؤوس الدبابيس العلوية */
  const topPins = ['SCL', 'SDA', 'AREF', 'GND', '13', '12', '11', '10', '9', '8'];
  topPins.forEach((p, i) => {
    const x = -1.5 + i * 2.54;
    txt(p, x, -21.2, p.length > 2 ? 1.12 : 1.5, { cond: p.length > 2 ? 0.58 : 0.9 });
  });
  txt('DIGITAL (PWM~)', 11.5, -18.9, 1.65, { cond: 0.95 });

  /* رؤوس الدبابيس السفلية */
  const botPins = ['7', '6', '5', '4', '3', '2', '1', '0'];
  botPins.forEach((p, i) => {
    const x = 10.5 + i * 2.54;
    txt(p, x, 21.2, 1.55, { cond: 0.92 });
  });

  /* رأس التغذية */
  const pwr = ['IOREF', 'RESET', '3V3', '5V', 'GND', 'GND', 'VIN', ''];
  pwr.forEach((p, i) => {
    if (!p) return;
    const z = -20.32 + i * 2.54;
    txt(p, 29.5, z, 1.12, { rot: -Math.PI / 2, cond: 0.56 });
  });
  txt('POWER', 26.6, -11.4, 1.6, { rot: -Math.PI / 2, cond: 0.86 });

  /* رأس الدخل التناظري */
  const ana = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
  ana.forEach((p, i) => {
    const z = 5.08 + i * 2.54;
    txt(p, 29.5, z, 1.42, { rot: -Math.PI / 2, cond: 0.72 });
  });
  txt('ANALOG IN', 26.6, 11.4, 1.55, { rot: -Math.PI / 2, cond: 0.86 });

  /* اسم اللوحة */
  txt('ARDUINO', -22.5, 22.4, 4.2, { weight: 800, cond: 0.94 });
  txt('UNO', -22.5, 25.1, 2.0, { weight: 800, cond: 0.94, alpha: 0.9 });
  txt('www.arduino.cc', -25.5, 19.6, 1.5, { weight: 500, cond: 0.9, alpha: 0.85 });
  txt('TM', -13.6, 24.6, 1.1, { weight: 700, alpha: 0.7 });

  /* تسميات المصابيح */
  [['ON', 13.5, -2.0], ['L', 13.5, -6.0], ['TX', 13.5, -10.0], ['RX', 13.5, -14.0]].forEach(([t, x, z]) => {
    txt(t, x + 2.2, z, 1.25, { align: 'center', cond: 0.9 });
  });

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(PCB_W, PCB_D),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0.03;
  plane.renderOrder = 2;
  base.add(plane);
})();

/* ---- 4.3 رؤوس الدبابيس (Female Headers) ---- */
function header({ x0, z0, count, axis = 'x', ids = [], height = 8.6, dy = 7, pinCount = null }) {
  const pitch = 2.54;
  const g = part(dy);
  const len = count * pitch;
  const cx = axis === 'x' ? x0 + ((count - 1) * pitch) / 2 : x0;
  const cz = axis === 'z' ? z0 + ((count - 1) * pitch) / 2 : z0;
  const bw = axis === 'x' ? len : 2.54;
  const bd = axis === 'z' ? len : 2.54;

  rbox(bw, height, bd, 0.28, M.plastic, cx, height / 2, cz, g);

  for (let i = 0; i < count; i++) {
    const px = axis === 'x' ? x0 + i * pitch : x0;
    const pz = axis === 'z' ? z0 + i * pitch : z0;
    box(1.45, 0.4, 1.45, M.plasticDk, px, height + 0.02, pz, g, { cast: false });
    box(0.6, 2.4, 0.6, M.goldDim, px, -1.9, pz, g, { cast: false });

    const id = ids[i];
    if (!id || !PIN_INFO[id]) continue;

    const hit = new THREE.Mesh(new THREE.BoxGeometry(2.5, height + 2.4, 2.5), hitMat);
    hit.position.set(px, height / 2, pz);
    g.add(hit);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.42, 40),
      new THREE.MeshBasicMaterial({ color: 0xffcf5c, transparent: true, opacity: 0.95, depthTest: false, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(px, height + 0.16, pz);
    ring.renderOrder = 20;
    ring.visible = false;
    g.add(ring);

    pins.push({ id, info: PIN_INFO[id], hit, ring, anchor: new THREE.Vector3(px, height + 2.2, pz) });
  }
  return g;
}

header({ x0: -1.5, z0: -24.13, count: 10, axis: 'x', ids: ['SCL', 'SDA', 'AREF', 'GND', 'D13', 'D12', 'D11', 'D10', 'D9', 'D8'] });
header({ x0: 10.5, z0: 24.13, count: 8, axis: 'x', ids: ['D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0'] });
header({ x0: 32.4, z0: -20.32, count: 8, axis: 'z', ids: ['IOREF', 'RESET', '3V3', '5V', 'GND', 'GND', 'VIN', ''] });
header({ x0: 32.4, z0: 5.08, count: 8, axis: 'z', ids: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', '', ''] });

/* ---- 4.4 منفذ USB نوع B ---- */
(function buildUSB() {
  const g = part(10);
  const shellMat = new THREE.MeshStandardMaterial({ color: 0x82898c, roughness: 0.46, metalness: 0.92 });
  rbox(12.2, 11, 16, 0.55, shellMat, -28.4, 5.6, -13.5, g);
  box(0.35, 10.2, 15.0, new THREE.MeshStandardMaterial({ color: 0x6f7578, roughness: 0.5, metalness: 0.9 }), -22.35, 5.6, -13.5, g, { cast: false });
  box(0.5, 8.6, 12.2, M.plasticDk, -34.65, 5.6, -13.5, g);
  box(0.4, 5.0, 8.0, new THREE.MeshStandardMaterial({ color: 0x05060a, roughness: 0.4, metalness: 0.3 }), -34.75, 5.6, -13.5, g);
  /* لسان الموصل داخل الفتحة */
  box(2.6, 1.1, 7.2, M.plasticDk, -33.6, 3.6, -13.5, g);
  for (let i = 0; i < 4; i++) box(2.0, 0.22, 0.6, M.gold, -33.9, 4.25, -16.4 + i * 1.94, g, { cast: false });
  /* أذرع التثبيت */
  box(3.2, 0.5, 1.2, M.steel, -33.6, 0.55, -20.4, g, { cast: false });
  box(3.2, 0.5, 1.2, M.steel, -33.6, 0.55, -6.6, g, { cast: false });
})();

/* ---- 4.5 مقبس الطاقة ---- */
(function buildJack() {
  const g = part(10);
  rbox(11, 10.4, 11, 0.5, M.plasticDk, -29.2, 5.2, 14, g);
  cyl(4.6, 4.6, 1.4, 28, M.plasticDk, -34.9, 5.2, 14, g, 'x');
  cyl(2.95, 2.95, 1.2, 28, new THREE.MeshStandardMaterial({ color: 0x040507, roughness: 0.5 }), -35.2, 5.2, 14, g, 'x');
  cyl(0.55, 0.55, 1.6, 16, M.gold, -35.3, 5.2, 14, g, 'x');
})();

/* ---- 4.6 المتحكم ATmega328P ---- */
(function buildChip() {
  const g = part(14);
  const BW = 6.6, BL = 34.6, BH = 3.4;
  const cx = 5, cz = -0.5, baseY = 2.1;

  rbox(BW, BH, BL, 0.32, M.chip, cx, baseY + BH / 2, cz, g);

  /* الرِّجل (Notch) ونقطة الرِّجل 1 */
  const notch = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, BH + 0.06, 20, 1, false, 0, Math.PI), M.plasticDk);
  notch.rotation.z = Math.PI / 2;
  notch.rotation.y = Math.PI / 2;
  notch.position.set(cx, baseY + BH / 2, cz - BL / 2 + 0.02);
  g.add(notch);
  cyl(0.42, 0.42, 0.08, 20, new THREE.MeshStandardMaterial({ color: 0x5c6367, roughness: 0.6, metalness: 0.5 }), cx - BW / 2 + 1.25, baseY + BH + 0.02, cz - BL / 2 + 1.7, g);

  /* أرجل الشريحة */
  for (let i = 0; i < 14; i++) {
    const z = cz - 16.51 + i * 2.54;
    [-1, 1].forEach((side) => {
      box(0.5, 1.9, 0.26, M.steel, cx + side * (BW / 2 + 0.42), 1.15, z, g, { cast: false });
      box(0.85, 0.3, 0.26, M.steel, cx + side * (BW / 2 - 0.05), baseY + 0.15, z, g, { cast: false });
      box(0.9, 0.12, 0.9, M.goldDim, cx + side * (BW / 2 + 0.42), 0.02, z, g, { cast: false });
    });
  }

  /* كتابة الشريحة */
  const c = document.createElement('canvas');
  c.width = 320; c.height = 1600;
  const x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height);
  x.save();
  x.translate(c.width / 2, c.height / 2);
  x.rotate(-Math.PI / 2);
  x.fillStyle = 'rgba(214,220,222,0.92)';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.font = '600 34px "Courier New", monospace';
  x.fillText('ATMEL', 0, -46);
  x.font = '700 40px "Courier New", monospace';
  x.fillText('ATMEGA328P', 0, 4);
  x.font = '500 26px "Courier New", monospace';
  x.fillText('PU  20MHZ  1432', 0, 54);
  x.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 30),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
  );
  label.rotation.x = -Math.PI / 2;
  label.position.set(cx, baseY + BH + 0.02, cz);
  label.renderOrder = 3;
  g.add(label);
})();

/* ---- 4.7 المذبذب والمكثفات ---- */
(function buildCrystal() {
  const g = part(6);
  const cg = new THREE.CylinderGeometry(2.35, 2.35, 3.6, 26);
  cg.scale(2.15, 1, 1);
  const m = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ color: 0x848b8e, roughness: 0.42, metalness: 0.92 }));
  m.position.set(15, 1.9, 15);
  m.castShadow = m.receiveShadow = true;
  g.add(m);
  box(9.6, 0.5, 1.6, M.steel, 15, 0.3, 12.6, g, { cast: false });

  [[4.4, 20.6], [25.2, 20.6]].forEach(([x, z]) => {
    rbox(1.7, 1.1, 0.75, 0.12, M.ceramic, x, 0.6, z, g);
  });
})();

/* ---- 4.8 منظمات الجهد ---- */
(function buildRegulators() {
  const g = part(6);
  rbox(3.4, 1.7, 6.4, 0.16, M.plasticDk, -27.6, 0.9, 1.6, g);
  box(3.1, 3.2, 0.35, M.steel, -27.6, 1.9, 5.0, g);
  rbox(3.2, 1.5, 4.4, 0.16, M.plasticDk, -27.6, 0.8, 7.6, g);
})();

/* ---- 4.9 مكثفات كهربائية ---- */
(function buildCaps() {
  const g = part(5);
  [[-21.4, 13.0, 3.0, 6.6], [-17.2, 18.6, 2.55, 5.6], [-24.6, 9.4, 2.2, 4.8]].forEach(([x, z, r, h]) => {
    cyl(r, r, h, 24, M.plasticDk, x, h / 2, z, g);
    cyl(r * 0.98, r * 0.98, 0.18, 24, M.steel, x, h + 0.05, z, g);
  });
})();

/* ---- 4.10 المصابيح والمقاومات ---- */
const ledMeshes = {};
(function buildLeds() {
  const g = part(4);
  const defs = [
    ['on', -2.0, ledMats.on],
    ['l', -6.0, ledMats.l],
    ['tx', -10.0, ledMats.tx],
    ['rx', -14.0, ledMats.rx],
  ];
  defs.forEach(([key, z, mat]) => {
    const m = rbox(1.7, 1.0, 1.7, 0.22, mat, 13.5, 0.55, z, g);
    ledMeshes[key] = m;
    box(1.9, 0.25, 0.7, M.plasticDk, 13.5, 0.12, z - 1.35, g, { cast: false });
    /* مقاومة مع أشرطة الألوان */
    rbox(1.6, 0.7, 3.4, 0.12, M.resistor, 10.6, 0.42, z, g);
    ['#8a2b1f', '#2b2b2b', '#b06a12'].forEach((col, bi) => {
      box(1.62, 0.14, 0.28, new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 }), 10.6, 0.79, z - 1.0 + bi * 1.0, g, { cast: false });
    });
  });
})();

/* ---- 4.11 زر RESET ---- */
(function buildReset() {
  const g = part(6);
  rbox(6.2, 3.2, 6.2, 0.3, M.plasticDk, -17, 1.6, -3, g);
  cyl(1.75, 1.75, 1.5, 24, new THREE.MeshStandardMaterial({ color: 0x8c1f1f, roughness: 0.45, metalness: 0.05 }), -17, 3.9, -3, g);
  [[-19.1, -5.1], [-14.9, -5.1], [-19.1, -0.9], [-14.9, -0.9]].forEach(([x, z]) => {
    box(0.7, 0.7, 0.7, M.steel, x, 0.35, z, g, { cast: false });
  });
})();

/* ---- 4.12 رؤوس ICSP ---- */
function icsp(x, z, dy) {
  const g = part(dy);
  rbox(5.08, 2.5, 2.54, 0.18, M.plastic, x, 1.25, z, g);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      cyl(0.5, 0.5, 5.4, 12, M.gold, x - 2.54 + i * 2.54, 4.6, z - 0.635 + j * 1.27, g);
    }
  }
  return g;
}
icsp(-13, -18.6, 5);
icsp(25.2, 16.8, 5);

/* ---- 4.13 وسادات لحام نحاسية ---- */
(function buildPads() {
  const g = part(0);
  const padGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.1, 14);
  const add = (x, z) => {
    const m = new THREE.Mesh(padGeo, M.goldDim);
    m.position.set(x, 0.04, z);
    m.castShadow = false;
    g.add(m);
  };
  for (let i = 0; i < 14; i++) {
    const z = -17.01 + i * 2.54;
    add(5 - 3.72, z);
    add(5 + 3.72, z);
  }
  [[4.4, 20.6], [25.2, 20.6]].forEach(([x, z]) => add(x, z));
})();

/* ---------------------------------------------------------------------------
   5) التفاعل
   ------------------------------------------------------------------------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-10, -10);
let hovered = null;
let selected = null;

const el = {
  card: document.getElementById('pinCard'),
  chip: document.getElementById('pinChip'),
  kind: document.getElementById('pinKind'),
  name: document.getElementById('pinName'),
  desc: document.getElementById('pinDesc'),
};

function showPin(p) {
  if (!p) {
    el.chip.textContent = '—';
    el.kind.textContent = 'الدبابيس';
    el.name.textContent = 'مرّر فوق أي دبوس';
    el.desc.textContent = 'كل رأس دبوس على اللوحة قابل للاستكشاف: قرّب المؤشر فوقه لقراءة وظيفته.';
    el.card.dataset.kind = '';
    return;
  }
  el.chip.textContent = p.id.startsWith('D') ? p.id.slice(1) : p.id;
  el.kind.textContent = KIND_LABEL[p.info.kind];
  el.name.textContent = p.info.ar;
  el.desc.textContent = p.info.desc;
  el.card.dataset.kind = p.info.kind;
}

function setHover(p) {
  if (hovered === p) return;
  if (hovered) hovered.ring.visible = false;
  hovered = p;
  if (p) {
    p.ring.visible = true;
    p.ring.material.opacity = 0.95;
    if (!selected) showPin(p);
  } else if (!selected) {
    showPin(null);
  }
}

function setSelect(p) {
  if (selected && selected !== p) selected.ring.material.color.set(0xffcf5c);
  selected = p;
  if (p) {
    p.ring.material.color.set(0xff8a3d);
    showPin(p);
  } else {
    showPin(null);
  }
}

function pick(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pins.map((p) => p.hit), false);
  if (!hits.length) return null;
  const obj = hits[0].object;
  return pins.find((p) => p.hit === obj) || null;
}

let downPos = null;
canvas.addEventListener('pointerdown', (e) => {
  downPos = { x: e.clientX, y: e.clientY };
  canvas.classList.add('dragging');
});
window.addEventListener('pointerup', (e) => {
  canvas.classList.remove('dragging');
  if (!downPos) return;
  const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
  downPos = null;
  if (moved < 7) {
    const p = pick(e.clientX, e.clientY);
    setSelect(p || null);
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  setHover(pick(e.clientX, e.clientY));
});
canvas.addEventListener('pointerleave', () => setHover(null));
controls.addEventListener('start', () => {
  if (controls.autoRotate) {
    controls.autoRotate = false;
    document.getElementById('btnRotate').setAttribute('aria-pressed', 'false');
  }
  document.querySelector('.hint')?.classList.add('gone');
});

/* تلميح عائم يتبع الدبوس */
const tip = document.createElement('div');
tip.className = 'pin-tip';
tip.setAttribute('aria-hidden', 'true');
document.body.appendChild(tip);

const v3 = new THREE.Vector3();
function updateTip() {
  const p = selected || hovered;
  if (!p) {
    tip.style.opacity = '0';
    return;
  }
  v3.copy(p.anchor);
  p.hit.parent.localToWorld(v3);
  v3.project(camera);
  if (v3.z > 1) { tip.style.opacity = '0'; return; }
  const x = (v3.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-v3.y * 0.5 + 0.5) * window.innerHeight;
  tip.style.transform = `translate(-50%, -130%) translate(${x}px, ${y}px)`;
  tip.style.opacity = '1';
  tip.textContent = p.id.startsWith('D') ? p.id.slice(1) : p.id;
}

/* ---------------------------------------------------------------------------
   6) الأزرار
   ------------------------------------------------------------------------- */
let blinking = false;
let blinkT = 0;
const btnPower = document.getElementById('btnPower');

btnPower.addEventListener('click', () => {
  blinking = !blinking;
  btnPower.setAttribute('aria-pressed', String(blinking));
  btnPower.querySelector('span').textContent = blinking ? 'أوقف Blink' : 'شغّل Blink';
  if (!blinking) {
    ledMats.l.emissiveIntensity = 0.10;
    ledMats.tx.emissiveIntensity = 0.08;
    ledMats.rx.emissiveIntensity = 0.08;
  }
});

let exploded = false;
let explodeT = 0;
const btnExplode = document.getElementById('btnExplode');
btnExplode.addEventListener('click', () => {
  exploded = !exploded;
  btnExplode.setAttribute('aria-pressed', String(exploded));
});

document.getElementById('btnRotate').addEventListener('click', (e) => {
  controls.autoRotate = !controls.autoRotate;
  e.currentTarget.setAttribute('aria-pressed', String(controls.autoRotate));
});

document.getElementById('btnReset').addEventListener('click', () => {
  exploded = false;
  btnExplode.setAttribute('aria-pressed', 'false');
  blinking = false;
  btnPower.setAttribute('aria-pressed', 'false');
  btnPower.querySelector('span').textContent = 'شغّل Blink';
  ledMats.l.emissiveIntensity = 0.10;
  ledMats.tx.emissiveIntensity = 0.08;
  ledMats.rx.emissiveIntensity = 0.08;
  setSelect(null);
  setHover(null);
  fitCamera();
  controls.target.copy(CAM_TARGET);
  controls.update();
});

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.code === 'Space') { e.preventDefault(); btnPower.click(); }
  if (e.key === 'e' || e.key === 'E' || e.key === 'ث') btnExplode.click();
  if (e.key === 'r' || e.key === 'R' || e.key === 'ر') document.getElementById('btnReset').click();
});

/* لوحة الشيفرة */
const codePanel = document.getElementById('codePanel');
const codeBody = document.getElementById('codeBody');
const CODE = `// Blink - the "Hello World" of Arduino
// pin 13 is wired to the onboard L LED

void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);   // LED on
  delay(500);               // wait half a second
  digitalWrite(13, LOW);    // LED off
  delay(500);
}`;

function highlight(src) {
  const esc = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .replace(/(\/\/[^\n]*)/g, '<span class="c">$1</span>')
    .replace(/\b(void|pinMode|digitalWrite|delay|OUTPUT|HIGH|LOW|setup|loop)\b/g, '<span class="k">$1</span>');
}

const codeOpenBtn = document.createElement('button');
codeOpenBtn.className = 'btn';
codeOpenBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 7 4 12l4.5 5M15.5 7 20 12l-4.5 5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg><span>الشيفرة</span>';
document.querySelector('.dock').appendChild(codeOpenBtn);
codeOpenBtn.addEventListener('click', () => {
  codePanel.hidden = !codePanel.hidden;
});
document.getElementById('btnCloseCode').addEventListener('click', () => { codePanel.hidden = true; });

codeBody.innerHTML = highlight(CODE);
codePanel.hidden = true;

/* ---------------------------------------------------------------------------
   7) حلقة الرسم
   ------------------------------------------------------------------------- */
const clock = new THREE.Clock();
function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  /* تفكيك */
  explodeT += ((exploded ? 1 : 0) - explodeT) * Math.min(1, dt * 6);
  if (Math.abs(explodeT - (exploded ? 1 : 0)) < 0.001) explodeT = exploded ? 1 : 0;
  for (const g of explodeParts) g.position.y = g.userData.dy * explodeT;

  /* وميض المصباح L */
  if (blinking) {
    blinkT += dt;
    const on = Math.floor(blinkT / 0.5) % 2 === 0;
    ledMats.l.emissiveIntensity = on ? 2.6 : 0.1;
    ledMats.tx.emissiveIntensity = on ? 0.05 : 0.35;
    ledMats.rx.emissiveIntensity = on ? 0.35 : 0.05;
  }

  /* نبض حلقة التحديد */
  const pulse = 1 + Math.sin(t * 6) * 0.08;
  if (hovered) hovered.ring.scale.setScalar(pulse);
  if (selected && selected !== hovered) selected.ring.scale.setScalar(pulse);

  if (FORCED_FLAT) {
    camera.position.set(0, 168, 0.0001);
    controls.target.set(0, 0, 0);
  }
  controls.update();
  updateTip();
  renderer.render(scene, camera);
  if (!firstFrame) { firstFrame = true; setTimeout(hideLoader, 350); }
}
renderer.setAnimationLoop(animate);

/* التحميل */
window.addEventListener('resize', () => {
  fitCamera();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
});
renderer.setSize(window.innerWidth, window.innerHeight, false);

let firstFrame = false;
function hideLoader() {
  const l = document.getElementById('loader');
  if (l && !l.classList.contains('done')) l.classList.add('done');
}
setTimeout(hideLoader, 1800);

/* نقطة تحقق للمطوّر */
const FORCED_FLAT = new URLSearchParams(location.search).has('flat');
if (FORCED_FLAT) controls.autoRotate = false;

window.__ARDUINO = {
  scene, board, pins, camera, controls,
  stats: () => {
    const box3 = new THREE.Box3().setFromObject(board);
    const meshes = [];
    board.traverse((o) => { if (o.isMesh) meshes.push(o); });
    return JSON.stringify({
      meshes: meshes.length,
      pins: pins.length,
      bbox: {
        min: box3.min.toArray().map((n) => +n.toFixed(2)),
        max: box3.max.toArray().map((n) => +n.toFixed(2)),
      },
      cam: camera.position.toArray().map((n) => +n.toFixed(1)),
    });
  },
};
if (new URLSearchParams(location.search).has('debug')) {
  document.title = 'DBG ' + window.__ARDUINO.stats();
}
