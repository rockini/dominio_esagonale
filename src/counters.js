// ============================================================
//  PEDINE: immagini ritagliate + pedine dell'Ordine generate
// ============================================================
const IMG = {};
function loadSprites() {
  const ps = [];
  for (const [k, src] of Object.entries(SPRITES)) {
    ps.push(new Promise(res => { const im = new Image(); im.onload = () => { IMG[k] = im; res(); }; im.onerror = res; im.src = src; }));
  }
  return Promise.all(ps);
}
const SPRITE_KEY = { 'Lyria': 'Lyria', 'Gorath': 'Gorath', 'Veyla': 'Veyla' };

// Silhouette semplici per le unità dell'Ordine (non presenti fra le immagini caricate)
function glyph(ctx, type) {
  const u = UNITS[type];
  ctx.fillStyle = '#111'; ctx.strokeStyle = '#111'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const body = (x, y, s = 1, robe = false) => {
    ctx.beginPath(); ctx.arc(x, y - 30 * s, 9 * s, 0, 7); ctx.fill();
    ctx.beginPath();
    if (robe) { ctx.moveTo(x - 10 * s, y - 20 * s); ctx.lineTo(x + 10 * s, y - 20 * s); ctx.lineTo(x + 17 * s, y + 22 * s); ctx.lineTo(x - 17 * s, y + 22 * s); }
    else { ctx.moveTo(x - 11 * s, y - 20 * s); ctx.lineTo(x + 11 * s, y - 20 * s); ctx.lineTo(x + 9 * s, y + 4 * s); ctx.lineTo(x + 12 * s, y + 22 * s); ctx.lineTo(x + 4 * s, y + 22 * s); ctx.lineTo(x, y + 8 * s); ctx.lineTo(x - 4 * s, y + 22 * s); ctx.lineTo(x - 12 * s, y + 22 * s); ctx.lineTo(x - 9 * s, y + 4 * s); }
    ctx.closePath(); ctx.fill();
  };
  const helmet = (x, y) => { ctx.beginPath(); ctx.moveTo(x - 10, y - 32); ctx.lineTo(x, y - 46); ctx.lineTo(x + 10, y - 32); ctx.closePath(); ctx.fill(); };
  const shield = (x, y, w = 16, h = 22) => { ctx.beginPath(); ctx.moveTo(x - w / 2, y - h / 2); ctx.lineTo(x + w / 2, y - h / 2); ctx.lineTo(x + w / 2, y + h * 0.15); ctx.lineTo(x, y + h / 2); ctx.lineTo(x - w / 2, y + h * 0.15); ctx.closePath(); ctx.fill(); };
  const sword = (x, y) => { ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 18, y - 26); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 3, y - 7); ctx.lineTo(x + 7, y + 1); ctx.stroke(); };
  const spear = (x, y, len = 70) => { ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 26); ctx.lineTo(x, y + 26 - len); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 5, y + 26 - len + 2); ctx.lineTo(x, y + 26 - len - 12); ctx.lineTo(x + 5, y + 26 - len + 2); ctx.closePath(); ctx.fill(); };
  const bow = (x, y) => { ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x - 14, y - 10, 28, -1.1, 1.1); ctx.stroke(); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 14 + 28 * Math.cos(-1.1), y - 10 + 28 * Math.sin(-1.1)); ctx.lineTo(x - 14 + 28 * Math.cos(1.1), y - 10 + 28 * Math.sin(1.1)); ctx.stroke(); };
  const staff = (x, y, top) => { ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(x, y + 24); ctx.lineTo(x, y - 46); ctx.stroke(); if (top === 'star') { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? 4 : 10; ctx.lineTo(x + Math.cos(a) * r, y - 50 + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); } else if (top === 'cross') { ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 9, y - 40); ctx.lineTo(x + 9, y - 40); ctx.stroke(); } };
  const horse = (x, y) => {
    ctx.beginPath(); ctx.ellipse(x, y + 2, 30, 12, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 22, y - 4); ctx.lineTo(x + 34, y - 26); ctx.lineTo(x + 44, y - 22); ctx.lineTo(x + 40, y - 16); ctx.lineTo(x + 30, y + 2); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 5; [[-22, -12], [-12, -18], [14, 20], [22, 12]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(x + a, y + 8); ctx.lineTo(x + b, y + 28); ctx.stroke(); });
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 28, y - 2); ctx.quadraticCurveTo(x - 42, y + 4, x - 38, y + 18); ctx.stroke();
  };
  const cx = 88, cy = 74;
  const n = type;
  if (kw(type, 'Cavalleria')) {
    horse(cx - 4, cy + 8); body(cx - 6, cy - 6, 0.75); helmet(cx - 6, cy - 4);
    if (n === 'Cavalieri del Tempio') staff(cx + 10, cy - 10, 'cross'); else spear(cx + 10, cy - 10, 64);
    if (n === 'Cavalieri pesanti') shield(cx - 18, cy - 14, 14, 18);
  } else if (n === 'Cavalieri grifoni') {
    horse(cx - 4, cy + 8); body(cx - 6, cy - 6, 0.75);
    ctx.beginPath(); ctx.moveTo(cx - 10, cy - 2); ctx.lineTo(cx - 44, cy - 44); ctx.lineTo(cx - 30, cy - 22); ctx.lineTo(cx - 50, cy - 26); ctx.lineTo(cx - 26, cy - 8); ctx.closePath(); ctx.fill();
    spear(cx + 10, cy - 10, 60);
  } else if (n === 'Golem controllati') {
    ctx.fillRect(cx - 22, cy - 30, 44, 40); ctx.fillRect(cx - 12, cy - 48, 24, 18); ctx.fillRect(cx - 34, cy - 28, 12, 36); ctx.fillRect(cx + 22, cy - 28, 12, 36); ctx.fillRect(cx - 20, cy + 10, 14, 22); ctx.fillRect(cx + 6, cy + 10, 14, 22);
    ctx.fillStyle = '#c3dff0'; ctx.fillRect(cx - 7, cy - 42, 5, 4); ctx.fillRect(cx + 2, cy - 42, 5, 4);
  } else if (/Maghi/.test(n)) {
    body(cx - 4, cy, 1, true); ctx.beginPath(); ctx.moveTo(cx - 16, cy - 36); ctx.lineTo(cx - 4, cy - 62); ctx.lineTo(cx + 8, cy - 36); ctx.closePath(); ctx.fill(); staff(cx + 18, cy, 'star');
  } else if (/Sacerdoti|Guaritori|Inquisitori/.test(n)) {
    body(cx - 4, cy, 1, true); staff(cx + 18, cy, 'cross'); if (n === 'Inquisitori') sword(cx - 26, cy + 2);
  } else if (/Arcieri|Ranger|Guardiani/.test(n)) {
    body(cx - 10, cy); if (/elfici|Ranger|Guardiani/.test(n)) { ctx.beginPath(); ctx.moveTo(cx - 18, cy - 34); ctx.lineTo(cx - 30, cy - 40); ctx.lineTo(cx - 16, cy - 28); ctx.fill(); }
    bow(cx + 12, cy - 6);
  } else if (n === 'Balestrieri') {
    body(cx - 10, cy); helmet(cx - 10, cy); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - 4, cy - 12); ctx.lineTo(cx + 30, cy - 12); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx + 26, cy - 12, 14, -1.4, 1.4); ctx.stroke();
  } else if (/nanici/.test(n)) {
    body(cx, cy + 6, 0.85); ctx.beginPath(); ctx.moveTo(cx - 9, cy - 16); ctx.lineTo(cx + 9, cy - 16); ctx.lineTo(cx, cy + 4); ctx.closePath(); ctx.fill(); helmet(cx, cy + 6);
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx + 12, cy + 20); ctx.lineTo(cx + 22, cy - 26); ctx.stroke(); ctx.fillRect(cx + 12, cy - 36, 22, 12);
  } else if (n === 'Scudieri') {
    body(cx, cy); helmet(cx, cy); shield(cx - 8, cy - 2, 30, 40);
  } else if (n === 'Lancieri' || n === 'Picchieri') {
    body(cx - 6, cy); helmet(cx - 6, cy); spear(cx + 14, cy, n === 'Picchieri' ? 86 : 66); shield(cx - 16, cy - 4, 14, 20);
  } else if (n === 'Esploratori') {
    body(cx - 4, cy); ctx.beginPath(); ctx.moveTo(cx - 16, cy - 32); ctx.lineTo(cx + 8, cy - 32); ctx.lineTo(cx - 4, cy - 44); ctx.closePath(); ctx.fill(); sword(cx + 6, cy - 2);
  } else if (n === 'Paladini' || n === 'Campioni della Legge') {
    body(cx - 4, cy, 1.05); helmet(cx - 4, cy); shield(cx - 18, cy - 4, 18, 26); sword(cx + 6, cy - 6);
    ctx.fillStyle = '#c3dff0'; ctx.fillRect(cx - 19.5, cy - 12, 3, 14); ctx.fillRect(cx - 24, cy - 7, 12, 3);
  } else {
    body(cx - 4, cy); helmet(cx - 4, cy); shield(cx - 16, cy - 4, 16, 22); sword(cx + 6, cy - 4);
  }
}

function makeOrderCard(type) {
  const S = 176, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const ctx = cv.getContext('2d'), u = UNITS[type];
  ctx.fillStyle = '#c3dff0'; ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = '#3d5566'; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, S - 3, S - 3);
  ctx.save(); glyph(ctx, type); ctx.restore();
  ctx.fillStyle = '#111'; ctx.font = 'bold 22px DejaVu Sans, Verdana, sans-serif'; ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left'; ctx.fillText(u.V, 10, 28); ctx.fillText(u.F, 10, S - 10);
  ctx.textAlign = 'right'; ctx.fillText(u.R, S - 10, 28); ctx.fillText(u.D, S - 10, S - 10);
  ctx.textAlign = 'center';
  if (u.FM >= 1) { ctx.font = 'bold 30px DejaVu Sans, sans-serif'; ctx.fillText('*', S / 2, 34); }
  ctx.font = 'bold 12.5px DejaVu Sans, Verdana, sans-serif';
  const words = u.name.split(' '); const lines = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > 13 && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  lines.push(cur);
  lines.forEach((l, i) => ctx.fillText(l, S / 2, 128 + i * 14 - (lines.length - 1) * 7));
  if (u.P >= 1) { ctx.lineWidth = 1.8; ctx.strokeStyle = '#111'; const y = S - 14; ctx.beginPath(); ctx.moveTo(S / 2 - 16, y); ctx.lineTo(S / 2 + 16, y); ctx.moveTo(S / 2 + 10, y - 4); ctx.lineTo(S / 2 + 16, y); ctx.lineTo(S / 2 + 10, y + 4); ctx.stroke(); ctx.beginPath(); ctx.arc(S / 2 - 8, y, 8, -1.3, 1.3); ctx.stroke(); }
  return cv;
}
function makeColossusCard() {
  const S = 176, cv = document.createElement('canvas'); cv.width = cv.height = S; const ctx = cv.getContext('2d');
  ctx.fillStyle = '#d9d2c0'; ctx.fillRect(0, 0, S, S); ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, S - 3, S - 3);
  ctx.fillStyle = '#111';
  const cx = 88, cy = 74; ctx.fillRect(cx - 24, cy - 34, 48, 44); ctx.fillRect(cx - 14, cy - 54, 28, 20); ctx.fillRect(cx - 38, cy - 32, 13, 40); ctx.fillRect(cx + 25, cy - 32, 13, 40); ctx.fillRect(cx - 22, cy + 10, 16, 24); ctx.fillRect(cx + 6, cy + 10, 16, 24);
  ctx.font = 'bold 22px DejaVu Sans, sans-serif'; ctx.textAlign = 'left'; ctx.fillText('2', 10, 28); ctx.fillText('8', 10, S - 10); ctx.textAlign = 'right'; ctx.fillText('6', S - 10, 28); ctx.fillText('6', S - 10, S - 10);
  ctx.textAlign = 'center'; ctx.font = 'bold 13px DejaVu Sans, sans-serif'; ctx.fillText('Colosso', S / 2, 130); ctx.fillText('dormiente', S / 2, 145);
  return cv;
}
function counterImage(type) {
  if (IMG[type]) return IMG[type];
  if (SPRITE_KEY[type] && IMG[SPRITE_KEY[type]]) return IMG[SPRITE_KEY[type]];
  if (type === 'Colosso') return (IMG[type] = makeColossusCard());
  if (UNITS[type] && UNITS[type].fac === 'O') return (IMG[type] = makeOrderCard(type));
  // fallback generico
  const cv = makeOrderCard(type); IMG[type] = cv; return cv;
}

// Disegna una pedina (dimensione s, centro x,y)
function drawCounter(ctx, u, x, y, s, opts = {}) {
  const im = counterImage(u.type);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = s * 0.12; ctx.shadowOffsetX = s * 0.04; ctx.shadowOffsetY = s * 0.05;
  ctx.fillStyle = PAL.faction[u.fac] || '#555';
  const b = s * 0.06;
  ctx.fillRect(x - s / 2 - b, y - s / 2 - b, s + 2 * b, s + 2 * b);
  ctx.restore();
  ctx.drawImage(im, x - s / 2, y - s / 2, s, s);
  if (u.commander) { ctx.save(); ctx.fillStyle = '#f2c230'; ctx.strokeStyle = '#4a3000'; ctx.lineWidth = s * 0.02; ctx.beginPath(); const r = s * 0.13, cx = x + s / 2 - r * 0.2, cy = y + s / 2 - r * 0.2; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  if (u.grade === 'V') { ctx.save(); ctx.strokeStyle = '#f2c230'; ctx.lineWidth = s * 0.05; const cx = x - s / 2 + s * 0.12, cy = y + s * 0.18; ctx.beginPath(); ctx.moveTo(cx - s * 0.07, cy); ctx.lineTo(cx, cy - s * 0.07); ctx.lineTo(cx + s * 0.07, cy); ctx.stroke(); ctx.restore(); }
  if (u.status && u.status.includes('dormiente')) { ctx.save(); ctx.fillStyle = 'rgba(40,40,80,0.35)'; ctx.fillRect(x - s / 2, y - s / 2, s, s); ctx.fillStyle = '#fff'; ctx.font = `bold ${s * 0.22}px Georgia`; ctx.textAlign = 'center'; ctx.fillText('Zzz', x + s * 0.2, y - s * 0.22); ctx.restore(); }
}
