// ============================================================
//  DISEGNO DELLA MAPPA (strato statico, in stile mappa illustrata)
// ============================================================
const PAL = {
  O: ['#f0b84a', '#f3cf5e', '#e99a3c', '#f6dd7a'],
  C: ['#e2445f', '#d6345a', '#e8697f', '#c9304c'],
  ink: '#3b2210', inkSoft: 'rgba(70,35,10,0.55)',
  tint: { bosco: ['#b8c24a', 0.45], palude: ['#bcd8cf', 0.6], deserto: ['#f6e2a2', 0.55], montagna: ['#d1ab83', 0.35], collina: ['#c98f3e', 0.12], pianura: ['#000', 0], lago: ['#93d3ea', 1] },
  faction: { O: '#2a5d9f', C: '#a3222f', N: '#7b7468' },
};
const MARGIN = 70;

function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; }
function shade(a, f) { const A = hexToRgb(a); return 'rgb(' + A.map(v => Math.max(0, Math.min(255, Math.round(v * f)))).join(',') + ')'; }
function hexPath(ctx, x, y, s = HEX) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const [px, py] = hexCorner(x, y, i, s); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); }
function chaikin(pts, it = 2) {
  for (let k = 0; k < it; k++) {
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; out.push([x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25], [x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75]); }
    out.push(pts[pts.length - 1]); pts = out;
  }
  return pts;
}
function strokePoly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
function spacedText(ctx, text, x, y, spacing) {
  const w = [...text].map(ch => ctx.measureText(ch).width);
  const tot = w.reduce((a, b) => a + b, 0) + spacing * (text.length - 1);
  let cx = x - tot / 2;
  [...text].forEach((ch, i) => { ctx.strokeText && ctx.lineWidth > 0 && ctx.strokeText(ch, cx + w[i] / 2, y); ctx.fillText(ch, cx + w[i] / 2, y); cx += w[i] + spacing; });
}

function regionColor(m, h) {
  const reg = m.regions[h.region] || { side: m.half(h), pal: 0 };
  return PAL[reg.side][reg.pal % 4];
}
function hexFill(m, h) {
  const base = regionColor(m, h);
  const t = h.terrain === 'lago' ? 'lago' : (h.base || h.terrain);
  const [c, k] = PAL.tint[t] || ['#000', 0];
  return k ? mix(base, c, k) : base;
}

// ---------------- illustrazioni del terreno
function drawHill(ctx, x, y, s, R) {
  ctx.beginPath(); ctx.moveTo(x - s, y); ctx.quadraticCurveTo(x - s * 0.2, y - s * 1.25, x + s, y);
  ctx.fillStyle = 'rgba(255,235,190,0.35)'; ctx.fill(); ctx.stroke();
  ctx.save(); ctx.lineWidth *= 0.7;
  for (let i = 0; i < 4; i++) { const t = 0.25 + i * 0.16; const px = x - s * 0.2 + s * t * 1.1; const py = y - s * (0.85 - t * 0.85); ctx.beginPath(); ctx.moveTo(px, py + 1); ctx.lineTo(px + s * 0.12, y - 0.5); ctx.stroke(); }
  ctx.restore();
}
function drawMountain(ctx, x, y, s, R) {
  const h = s * R.range(1.2, 1.6), lx = x - s, rx = x + s, tx = x + R.range(-0.2, 0.2) * s;
  ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(tx - s * 0.15, y - h * 0.7); ctx.lineTo(tx, y - h); ctx.lineTo(tx + s * 0.25, y - h * 0.72); ctx.lineTo(rx, y); ctx.closePath();
  ctx.fillStyle = '#f3e3c2'; ctx.fill();
  // lato in ombra
  ctx.beginPath(); ctx.moveTo(tx, y - h); ctx.lineTo(tx + s * 0.25, y - h * 0.72); ctx.lineTo(rx, y); ctx.lineTo(tx + s * 0.05, y); ctx.closePath(); ctx.fillStyle = 'rgba(120,70,30,0.45)'; ctx.fill();
  // neve
  ctx.beginPath(); ctx.moveTo(tx - s * 0.15, y - h * 0.7); ctx.lineTo(tx, y - h); ctx.lineTo(tx + s * 0.25, y - h * 0.72); ctx.lineTo(tx + s * 0.08, y - h * 0.78); ctx.lineTo(tx - s * 0.02, y - h * 0.68); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(tx - s * 0.15, y - h * 0.7); ctx.lineTo(tx, y - h); ctx.lineTo(tx + s * 0.25, y - h * 0.72); ctx.lineTo(rx, y); ctx.stroke();
  ctx.save(); ctx.lineWidth *= 0.6;
  for (let i = 1; i < 5; i++) { const t = i / 5; ctx.beginPath(); ctx.moveTo(tx + (rx - tx) * t * 0.9, y - h * (1 - t) * 0.95); ctx.lineTo(tx + (rx - tx) * t * 0.6, y - 1); ctx.stroke(); }
  ctx.restore();
}
function drawTree(ctx, x, y, s, R) {
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + s * 0.5); ctx.stroke();
  const g = R.chance(0.5) ? '#d4dc63' : '#b5c94a';
  ctx.beginPath();
  const n = 7; for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, rr = s * (0.82 + R.range(-0.12, 0.12)); const px = x + Math.cos(a) * rr, py = y - s * 0.25 + Math.sin(a) * rr * 0.9; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(60,80,10,0.55)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + R.range(-0.4, 0.5) * s, y - s * 0.25 + R.range(-0.3, 0.5) * s, s * 0.12, 0, 7); ctx.fill(); }
}

function drawTerrain(ctx, m, h) {
  const R = new RNG(h.id * 9973 + m.seed);
  const t = h.base || h.terrain;
  ctx.save();
  hexPath(ctx, h.x, h.y, HEX * 0.98); ctx.clip();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.1; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (t === 'collina') {
    const pts = []; for (let i = 0; i < 6; i++) pts.push([h.x + R.range(-24, 22), h.y + R.range(-20, 26)]);
    pts.sort((a, b) => a[1] - b[1]); pts.forEach(p => drawHill(ctx, p[0], p[1], R.range(8, 12), R));
  } else if (t === 'montagna') {
    const pts = [[h.x - 14, h.y - 8], [h.x + 12, h.y - 12], [h.x - 2, h.y + 6], [h.x - 20, h.y + 22], [h.x + 18, h.y + 20]];
    pts.forEach(p => { p[0] += R.range(-4, 4); p[1] += R.range(-4, 4); });
    pts.sort((a, b) => a[1] - b[1]); pts.forEach(p => drawMountain(ctx, p[0], p[1], R.range(11, 15), R));
  } else if (t === 'bosco') {
    const pts = []; for (let i = 0; i < 11; i++) pts.push([h.x + R.range(-28, 28), h.y + R.range(-26, 28)]);
    pts.sort((a, b) => a[1] - b[1]); ctx.lineWidth = 0.9; pts.forEach(p => drawTree(ctx, p[0], p[1], R.range(6, 8.5), R));
  } else if (t === 'palude') {
    ctx.strokeStyle = 'rgba(40,90,100,0.8)';
    for (let i = 0; i < 9; i++) { const x = h.x + R.range(-28, 22), y = h.y + R.range(-26, 26); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + R.range(6, 12), y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(70,90,30,0.9)';
    for (let i = 0; i < 5; i++) { const x = h.x + R.range(-24, 24), y = h.y + R.range(-20, 24); for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + k * 3, y - 8 + Math.abs(k) * 2); ctx.stroke(); } }
  } else if (t === 'deserto') {
    ctx.fillStyle = 'rgba(120,70,20,0.5)';
    for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.arc(h.x + R.range(-30, 30), h.y + R.range(-28, 28), 0.9, 0, 7); ctx.fill(); }
    ctx.strokeStyle = 'rgba(120,70,20,0.6)';
    for (let i = 0; i < 2; i++) { const x = h.x + R.range(-18, 8), y = h.y + R.range(-10, 18); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y - 7, x + 22, y); ctx.stroke(); }
  } else if (t === 'pianura' && !h.feature) {
    ctx.strokeStyle = 'rgba(90,50,15,0.45)'; ctx.lineWidth = 0.9;
    for (let i = 0; i < 4; i++) { const x = h.x + R.range(-24, 24), y = h.y + R.range(-22, 24); ctx.beginPath(); ctx.moveTo(x - 2.5, y - 3); ctx.lineTo(x, y); ctx.lineTo(x + 2.5, y - 3.5); ctx.stroke(); }
  }
  ctx.restore();
}

// ---------------- icone di insediamenti e luoghi
function drawHouse(ctx, x, y, s, roof) {
  ctx.fillStyle = '#f4ead2'; ctx.fillRect(x - s / 2, y - s * 0.55, s, s * 0.55); ctx.strokeRect(x - s / 2, y - s * 0.55, s, s * 0.55);
  ctx.beginPath(); ctx.moveTo(x - s * 0.62, y - s * 0.5); ctx.lineTo(x, y - s * 1.05); ctx.lineTo(x + s * 0.62, y - s * 0.5); ctx.closePath(); ctx.fillStyle = roof; ctx.fill(); ctx.stroke();
}
function drawTower(ctx, x, y, w, hgt, roof) {
  ctx.fillStyle = '#efe6d2'; ctx.fillRect(x - w / 2, y - hgt, w, hgt); ctx.strokeRect(x - w / 2, y - hgt, w, hgt);
  const n = 3, cw = w / (n * 2 - 1);
  for (let i = 0; i < n; i++) { ctx.fillStyle = '#efe6d2'; ctx.fillRect(x - w / 2 + i * cw * 2, y - hgt - cw, cw, cw); ctx.strokeRect(x - w / 2 + i * cw * 2, y - hgt - cw, cw, cw); }
  if (roof) { ctx.beginPath(); ctx.moveTo(x - w * 0.6, y - hgt - cw); ctx.lineTo(x, y - hgt - cw - w * 0.9); ctx.lineTo(x + w * 0.6, y - hgt - cw); ctx.closePath(); ctx.fillStyle = roof; ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = '#3b2210'; ctx.fillRect(x - w * 0.12, y - hgt * 0.55, w * 0.24, hgt * 0.22);
}
function drawFlag(ctx, x, y, color) {
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x + 11, y - 13); ctx.lineTo(x, y - 9); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.stroke();
}
function drawFeature(ctx, m, h, zoomLabel = true) {
  const f = h.feature, x = h.x, y = h.y + 4;
  ctx.save();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1.1; ctx.lineJoin = 'round';
  const roofO = '#c4472f', roofC = '#5b3a5e';
  const roof = f.owner === 'C' ? roofC : roofO;
  // medaglione di fondo come nelle mappe illustrate
  const medal = (r, fill) => { ctx.beginPath(); ctx.arc(x, y - 6, r, 0, 7); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 1.4; ctx.stroke(); ctx.lineWidth = 1.1; };
  switch (f.type) {
    case 'citta': case 'cittamag': {
      medal(f.type === 'cittamag' ? 21 : 18, '#e9d9b6');
      const H = [[-8, 2], [3, 3], [-2, -6], [9, -4], [-10, -8]];
      H.forEach(([dx, dy], i) => drawHouse(ctx, x + dx, y + dy, 8.5, i % 2 ? roof : shade(roof, 0.8)));
      break;
    }
    case 'castello': {
      medal(19, '#ded2bb');
      ctx.fillStyle = '#efe6d2'; ctx.fillRect(x - 14, y - 10, 28, 12); ctx.strokeRect(x - 14, y - 10, 28, 12);
      drawTower(ctx, x - 10, y + 2, 8, 18, roof); drawTower(ctx, x + 10, y + 2, 8, 18, roof); drawTower(ctx, x, y + 1, 10, 24, null);
      break;
    }
    case 'castellomag': case 'capitale': {
      medal(f.type === 'capitale' ? 26 : 23, '#d9ccb2');
      ctx.fillStyle = '#efe6d2'; ctx.fillRect(x - 18, y - 12, 36, 14); ctx.strokeRect(x - 18, y - 12, 36, 14);
      drawTower(ctx, x - 15, y + 3, 8, 20, roof); drawTower(ctx, x + 15, y + 3, 8, 20, roof);
      drawTower(ctx, x - 5, y + 2, 9, 27, roof); drawTower(ctx, x + 6, y + 2, 9, 24, null);
      if (f.type === 'capitale') { ctx.fillStyle = '#d9a227'; ctx.beginPath(); ctx.moveTo(x - 6, y - 42); ctx.lineTo(x - 3, y - 47); ctx.lineTo(x, y - 42); ctx.lineTo(x + 3, y - 47); ctx.lineTo(x + 6, y - 42); ctx.lineTo(x + 6, y - 39); ctx.lineTo(x - 6, y - 39); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      break;
    }
    case 'tempio': {
      medal(18, '#f3efe3');
      ctx.fillStyle = '#fbf8ee';
      ctx.beginPath(); ctx.moveTo(x - 15, y - 12); ctx.lineTo(x, y - 22); ctx.lineTo(x + 15, y - 12); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillRect(x - 15, y - 12, 30, 3); ctx.strokeRect(x - 15, y - 12, 30, 3);
      for (let i = 0; i < 5; i++) { ctx.fillRect(x - 13 + i * 6, y - 9, 3, 13); ctx.strokeRect(x - 13 + i * 6, y - 9, 3, 13); }
      ctx.fillRect(x - 17, y + 4, 34, 3); ctx.strokeRect(x - 17, y + 4, 34, 3);
      ctx.fillStyle = '#e8b93a'; ctx.beginPath(); ctx.arc(x, y - 16, 2.2, 0, 7); ctx.fill();
      break;
    }
    case 'altare': {
      const g = ctx.createRadialGradient(x, y - 6, 2, x, y - 6, 24); g.addColorStop(0, 'rgba(255,60,40,0.75)'); g.addColorStop(1, 'rgba(120,0,40,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 6, 24, 0, 7); ctx.fill();
      ctx.fillStyle = '#3a2a33'; ctx.beginPath(); ctx.moveTo(x - 6, y + 4); ctx.lineTo(x - 3, y - 26); ctx.lineTo(x + 3, y - 26); ctx.lineTo(x + 6, y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#58434e'; ctx.fillRect(x - 14, y - 2, 28, 7); ctx.strokeRect(x - 14, y - 2, 28, 7);
      ctx.fillStyle = '#ff6a3a'; ctx.beginPath(); ctx.arc(x, y - 18, 2.5, 0, 7); ctx.fill();
      break;
    }
    case 'fenditura': {
      const g = ctx.createRadialGradient(x, y - 4, 2, x, y - 4, 26); g.addColorStop(0, 'rgba(200,80,255,0.8)'); g.addColorStop(1, 'rgba(70,0,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 4, 26, 0, 7); ctx.fill();
      ctx.fillStyle = '#1e0b26'; ctx.beginPath(); ctx.moveTo(x - 4, y - 24); ctx.lineTo(x + 3, y - 14); ctx.lineTo(x - 2, y - 8); ctx.lineTo(x + 6, y + 2); ctx.lineTo(x + 1, y + 12); ctx.lineTo(x - 3, y + 2); ctx.lineTo(x - 8, y - 6); ctx.lineTo(x - 3, y - 13); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#d78cff'; ctx.lineWidth = 1.3; ctx.stroke();
      break;
    }
    case 'rovina': {
      medal(17, '#d8ccb5');
      ctx.fillStyle = '#ece3cf';
      [[-11, 16], [-4, 22], [4, 12], [11, 18]].forEach(([dx, hh]) => { ctx.beginPath(); ctx.moveTo(x + dx - 2.5, y + 3); ctx.lineTo(x + dx - 2.5, y + 3 - hh); ctx.lineTo(x + dx, y + 1 - hh); ctx.lineTo(x + dx + 2.5, y + 4 - hh); ctx.lineTo(x + dx + 2.5, y + 3); ctx.closePath(); ctx.fill(); ctx.stroke(); });
      ctx.fillRect(x - 15, y + 3, 30, 3); ctx.strokeRect(x - 15, y + 3, 30, 3);
      ctx.beginPath(); ctx.ellipse(x + 15, y + 1, 4, 2.5, 0.3, 0, 7); ctx.fill(); ctx.stroke();
      break;
    }
    case 'testa': {
      ctx.fillStyle = '#f2e6c4'; ctx.beginPath(); ctx.arc(x, y - 6, 12, 0, 7); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x, y - 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x + 12, y - 16); ctx.lineTo(x, y - 11); ctx.closePath(); ctx.fillStyle = '#e8c547'; ctx.fill(); ctx.stroke();
      break;
    }
  }
  if (f.type !== 'testa' && (TERRAIN[h.terrain] && (TERRAIN[h.terrain].settlement || TERRAIN[h.terrain].place))) drawFlag(ctx, x + 14, y - 18, PAL.faction[f.owner || 'N']);
  ctx.restore();
}

function drawEdgeFeatures(ctx, m) {
  const segOf = (a, b) => { const i = m.dirTo(a, b); return [hexCorner(a.x, a.y, i), hexCorner(a.x, a.y, (i + 1) % 6)]; };
  for (const [k, e] of m.edges) {
    const [ia, ib] = k.split('_').map(Number); const a = m.hexes[ia], b = m.hexes[ib];
    const [p1, p2] = segOf(a, b);
    const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
    const ux = (b.x - a.x) / (HEX * SQ3), uy = (b.y - a.y) / (HEX * SQ3); // da a verso b
    const vx = (p2[0] - p1[0]) / HEX, vy = (p2[1] - p1[1]) / HEX;     // lungo il lato
    ctx.save();
    if (e.type === 'ponte') {
      ctx.translate(mx, my); ctx.rotate(Math.atan2(uy, ux));
      ctx.fillStyle = '#b07b45'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1;
      ctx.fillRect(-11, -5, 22, 10); ctx.strokeRect(-11, -5, 22, 10);
      for (let i = -7; i <= 7; i += 4.5) { ctx.beginPath(); ctx.moveTo(i, -5); ctx.lineTo(i, 5); ctx.stroke(); }
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-12, -6); ctx.lineTo(12, -6); ctx.moveTo(-12, 6); ctx.lineTo(12, 6); ctx.stroke();
    } else if (e.type === 'guado') {
      ctx.translate(mx, my); ctx.rotate(Math.atan2(uy, ux));
      ctx.fillStyle = '#d8d2c4'; ctx.strokeStyle = '#4a4036'; ctx.lineWidth = 0.9;
      [[-9, -3], [-4, 3], [0, -2.5], [4, 3], [9, -1]].forEach(([x, y]) => { ctx.beginPath(); ctx.ellipse(x, y, 2.8, 2, 0.4, 0, 7); ctx.fill(); ctx.stroke(); });
    } else if (e.type === 'cresta') {
      const low = e.high === a.id ? b : a, high = e.high === a.id ? a : b;
      const lx = (low.x - high.x) / (HEX * SQ3), ly = (low.y - high.y) / (HEX * SQ3);
      ctx.strokeStyle = '#fffaf0'; ctx.lineWidth = 3.2; ctx.lineJoin = 'miter';
      const pts = []; const n = 8;
      for (let i = 0; i <= n; i++) { const t = i / n; const j = (i % 2 ? 2.5 : -1.5); pts.push([p1[0] + (p2[0] - p1[0]) * t + lx * j, p1[1] + (p2[1] - p1[1]) * t + ly * j]); }
      ctx.strokeStyle = 'rgba(60,30,10,0.85)'; ctx.lineWidth = 4.4; strokePoly(ctx, pts);
      ctx.strokeStyle = '#fffaf0'; ctx.lineWidth = 2.4; strokePoly(ctx, pts);
      ctx.strokeStyle = 'rgba(60,30,10,0.75)'; ctx.lineWidth = 1;
      for (let i = 1; i < n; i += 1) { const t = i / n; const sx = p1[0] + (p2[0] - p1[0]) * t + lx * 2, sy = p1[1] + (p2[1] - p1[1]) * t + ly * 2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + lx * 6, sy + ly * 6); ctx.stroke(); }
    } else if (e.type === 'mura') {
      ctx.strokeStyle = PAL.ink; ctx.lineWidth = 7; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
      ctx.strokeStyle = '#cfc6b4'; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#cfc6b4'; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) { const t = (i + 0.5) / 5; const cx = p1[0] + (p2[0] - p1[0]) * t, cy = p1[1] + (p2[1] - p1[1]) * t; ctx.fillRect(cx - 2.5, cy - 2.5, 5, 5); ctx.strokeRect(cx - 2.5, cy - 2.5, 5, 5); }
    } else if (e.type === 'barriera') {
      ctx.strokeStyle = 'rgba(160,120,255,0.9)'; ctx.lineWidth = 4; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
    }
    ctx.restore();
  }
}

function roadPoints(m, path) {
  const pts = path.map(id => [m.hexes[id].x, m.hexes[id].y]);
  // leggero ondeggiamento deterministico per un tratto disegnato a mano
  const out = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const R = new RNG(path[i] * 31 + path[i + 1]);
    const nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1, w = R.range(-5, 5);
    out.push([(x0 + x1) / 2 + nx / L * w, (y0 + y1) / 2 + ny / L * w]);
    out.push(pts[i + 1]);
  }
  return chaikin(out, 2);
}

function renderStaticMap(game) {
  const m = game.map;
  const WW = m.pxW + MARGIN * 2, HH = m.pxH + MARGIN * 2;
  const S = Math.min(2, 4096 / Math.max(WW, HH));
  const cv = document.createElement('canvas'); cv.width = Math.ceil(WW * S); cv.height = Math.ceil(HH * S);
  const ctx = cv.getContext('2d');
  const W2 = (c) => c.setTransform(S, 0, 0, S, MARGIN * S, MARGIN * S);
  // ---- pergamena
  ctx.fillStyle = '#ead6aa'; ctx.fillRect(0, 0, cv.width, cv.height);
  const R = new RNG(m.seed + 5);
  for (let i = 0; i < cv.width * cv.height / 900; i++) { ctx.fillStyle = `rgba(${R.chance(0.5) ? '120,80,30' : '255,250,230'},${R.range(0.03, 0.09)})`; ctx.fillRect(R.next() * cv.width, R.next() * cv.height, R.range(1, 3) * S, R.range(1, 3) * S); }
  // ---- colori di regione sfumati (aerografo)
  const blur = document.createElement('canvas'); blur.width = cv.width; blur.height = cv.height;
  const bx = blur.getContext('2d'); W2(bx);
  for (const h of m.hexes) { hexPath(bx, h.x, h.y, HEX + 0.8); bx.fillStyle = hexFill(m, h); bx.fill(); }
  // bordi di regione più scuri, solo sfumati
  const bnd = document.createElement('canvas'); bnd.width = cv.width; bnd.height = cv.height;
  const nx = bnd.getContext('2d'); W2(nx); nx.lineCap = 'round';
  for (const h of m.hexes) for (let i = 0; i < 3; i++) {
    const n = m.nb(h, i); if (!n || n.region === h.region) continue;
    const [p1, p2] = [hexCorner(h.x, h.y, i), hexCorner(h.x, h.y, (i + 1) % 6)];
    nx.strokeStyle = 'rgba(120,40,10,0.45)'; nx.lineWidth = 14; nx.beginPath(); nx.moveTo(p1[0], p1[1]); nx.lineTo(p2[0], p2[1]); nx.stroke();
  }
  ctx.save(); ctx.filter = `blur(${Math.round(5 * S)}px)`; ctx.drawImage(blur, 0, 0); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.55; ctx.drawImage(blur, 0, 0); ctx.restore();
  ctx.save(); ctx.filter = `blur(${Math.round(7 * S)}px)`; ctx.globalAlpha = 0.8; ctx.drawImage(bnd, 0, 0); ctx.restore();
  // ritaglia il bordo della mappa
  W2(ctx);
  // ---- grana
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  for (let i = 0; i < m.hexes.length * 30; i++) { ctx.fillStyle = `rgba(110,60,20,${R.range(0.04, 0.12)})`; ctx.fillRect(R.next() * m.pxW, R.next() * m.pxH, R.range(0.6, 1.6), R.range(0.6, 1.6)); }
  ctx.restore();
  // ---- laghi
  const lakes = m.hexes.filter(h => h.terrain === 'lago');
  if (lakes.length) {
    ctx.save(); ctx.lineJoin = 'round';
    ctx.strokeStyle = '#3d8db5'; ctx.lineWidth = 7; lakes.forEach(h => { hexPath(ctx, h.x, h.y, HEX * 0.9); ctx.stroke(); });
    ctx.fillStyle = '#9ad7ee'; ctx.strokeStyle = '#9ad7ee'; ctx.lineWidth = 5; lakes.forEach(h => { hexPath(ctx, h.x, h.y, HEX * 0.9); ctx.fill(); ctx.stroke(); });
    ctx.strokeStyle = 'rgba(40,110,160,0.5)'; ctx.lineWidth = 1;
    lakes.forEach(h => { const r = new RNG(h.id); for (let i = 0; i < 5; i++) { const x = h.x + r.range(-22, 12), y = h.y + r.range(-20, 20); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 5, y - 3, x + 10, y); ctx.stroke(); } });
    ctx.restore();
  }
  // ---- stati: corrotto / purificato
  for (const h of m.hexes) {
    if (h.state === 'corrotto') {
      ctx.save(); hexPath(ctx, h.x, h.y, HEX); ctx.clip();
      ctx.fillStyle = 'rgba(80,10,90,0.28)'; ctx.fill();
      const r = new RNG(h.id * 3 + 1); ctx.strokeStyle = 'rgba(40,0,50,0.55)'; ctx.lineWidth = 1.1;
      for (let k = 0; k < 4; k++) { let x = h.x + r.range(-10, 10), y = h.y + r.range(-10, 10); ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 5; j++) { x += r.range(-9, 9); y += r.range(-9, 9); ctx.lineTo(x, y); } ctx.stroke(); }
      ctx.restore();
    } else if (h.state === 'purificato') {
      const g = ctx.createRadialGradient(h.x, h.y, 4, h.x, h.y, HEX); g.addColorStop(0, 'rgba(255,250,200,0.65)'); g.addColorStop(1, 'rgba(255,240,170,0.05)');
      hexPath(ctx, h.x, h.y, HEX); ctx.fillStyle = g; ctx.fill();
    }
  }
  // ---- illustrazioni del terreno
  for (const h of m.hexes) if (h.terrain !== 'lago') drawTerrain(ctx, m, h);
  // ---- griglia
  ctx.save(); ctx.strokeStyle = 'rgba(90,40,10,0.32)'; ctx.lineWidth = 0.9;
  for (const h of m.hexes) { hexPath(ctx, h.x, h.y); ctx.stroke(); }
  ctx.fillStyle = 'rgba(70,30,5,0.45)'; ctx.font = '7px sans-serif'; ctx.textAlign = 'center';
  for (const h of m.hexes) ctx.fillText(String(h.c + 1).padStart(2, '0') + String(h.r + 1).padStart(2, '0'), h.x, h.y - HEX * 0.68);
  ctx.restore();
  // ---- fiumi
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const rv of m.rivers) {
    const pts = chaikin(rv.pts, 3);
    ctx.strokeStyle = '#2f7fae'; ctx.lineWidth = 6; strokePoly(ctx, pts);
    ctx.strokeStyle = '#7fcdea'; ctx.lineWidth = 3.6; strokePoly(ctx, pts);
  }
  ctx.restore();
  // ---- strade
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const rd of m.roads) {
    const pts = roadPoints(m, rd.path);
    ctx.strokeStyle = 'rgba(255,245,220,0.55)'; ctx.lineWidth = 5; ctx.setLineDash([]); strokePoly(ctx, pts);
    ctx.strokeStyle = '#24150a'; ctx.lineWidth = rd.main ? 2.6 : 2.2; ctx.setLineDash(rd.main ? [] : [7, 5]); strokePoly(ctx, pts);
  }
  ctx.restore();
  // ---- lati speciali
  drawEdgeFeatures(ctx, m);
  // ---- esagoni chiave
  ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2.4;
  for (const h of m.hexes) if (h.key) { hexPath(ctx, h.x, h.y, HEX * 0.86); ctx.stroke(); }
  ctx.restore();
  // ---- etichette
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const L of m.labels) {
    ctx.save(); ctx.translate(L.x, L.y); ctx.rotate(L.angle || 0);
    if (L.kind === 'region') { ctx.font = `bold ${L.size}px Georgia, 'Times New Roman', serif`; ctx.fillStyle = 'rgba(45,20,8,0.5)'; ctx.lineWidth = 0; spacedText(ctx, L.text, 0, 0, L.size * 0.6); }
    else if (L.kind === 'terrain') { ctx.font = `italic bold ${L.size}px Georgia, serif`; ctx.fillStyle = 'rgba(45,20,8,0.75)'; ctx.strokeStyle = 'rgba(255,240,210,0.6)'; ctx.lineWidth = 3; spacedText(ctx, L.text.toUpperCase(), 0, 0, 3); }
    else { ctx.font = `italic ${L.size}px Georgia, serif`; ctx.fillStyle = '#1f5f86'; ctx.strokeStyle = 'rgba(255,245,225,0.7)'; ctx.lineWidth = 2.5; spacedText(ctx, L.text, 0, 0, 1.5); }
    ctx.restore();
  }
  ctx.restore();
  // ---- insediamenti e luoghi
  for (const h of m.hexes) if (h.feature) drawFeature(ctx, m, h);
  ctx.save(); ctx.textAlign = 'center'; ctx.font = 'bold 9.5px Georgia, serif';
  for (const h of m.hexes) if (h.feature) {
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,245,220,0.9)'; ctx.strokeText(h.feature.name, h.x, h.y + HEX * 0.72);
    ctx.fillStyle = '#2a160a'; ctx.fillText(h.feature.name, h.x, h.y + HEX * 0.72);
  }
  ctx.restore();
  // ---- cornice
  ctx.setTransform(S, 0, 0, S, 0, 0);
  ctx.save();
  // pulisce fuori dagli esagoni con la pergamena: maschera morbida verso il bordo
  const vg = ctx.createRadialGradient(WW / 2, HH / 2, Math.min(WW, HH) * 0.45, WW / 2, HH / 2, Math.max(WW, HH) * 0.75);
  vg.addColorStop(0, 'rgba(80,40,10,0)'); vg.addColorStop(1, 'rgba(80,40,10,0.28)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, WW, HH);
  ctx.strokeStyle = '#4a2a12'; ctx.lineWidth = 3; ctx.strokeRect(MARGIN * 0.35, MARGIN * 0.35, WW - MARGIN * 0.7, HH - MARGIN * 0.7);
  ctx.lineWidth = 1; ctx.strokeRect(MARGIN * 0.5, MARGIN * 0.5, WW - MARGIN, HH - MARGIN);
  // rosa dei venti
  const cx = WW - MARGIN * 0.5 - 46, cy = HH - MARGIN * 0.5 - 46;
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(245,232,200,0.9)'; ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); ctx.fill(); ctx.strokeStyle = '#4a2a12'; ctx.stroke();
  for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * Math.PI / 4); const L = i % 2 ? 18 : 30; ctx.beginPath(); ctx.moveTo(0, -L); ctx.lineTo(4, 0); ctx.lineTo(0, 4); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fillStyle = i % 2 ? '#b98a4a' : (i === 0 ? '#a3222f' : '#4a2a12'); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = '#4a2a12'; ctx.font = 'bold 11px Georgia'; ctx.textAlign = 'center'; ctx.fillText('N', 0, -38);
  ctx.restore();
  return { canvas: cv, scale: S, W: WW, H: HH };
}
