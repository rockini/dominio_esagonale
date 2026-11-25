'use strict';
// ============================================================
//  CORE: RNG, geometria esagonale, rumore
// ============================================================
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
class RNG {
  constructor(seed) { this.seed = seed >>> 0; this.f = mulberry32(this.seed); }
  next() { return this.f(); }
  range(a, b) { return a + (b - a) * this.f(); }
  int(a, b) { return a + Math.floor(this.f() * (b - a + 1)); }
  pick(arr) { return arr[Math.floor(this.f() * arr.length)]; }
  chance(p) { return this.f() < p; }
  shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(this.f() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
  weighted(items, wf) { let tot = 0; for (const it of items) tot += Math.max(0, wf(it)); let x = this.f() * tot; for (const it of items) { x -= Math.max(0, wf(it)); if (x <= 0) return it; } return items[items.length - 1]; }
}
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// --- Esagoni "flat-top", coordinate offset odd-q (colonne dispari spostate in basso)
const SQ3 = Math.sqrt(3);
const HEX = 40; // raggio esagono in unità mondo
// Direzioni in coordinate assiali, ordinate per angolo (30°, 90°, 150°, 210°, 270°, 330°)
// Il lato i è compreso fra i vertici i e i+1.
const DIRS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
function offToAx(c, r) { return [c, r - ((c - (c & 1)) >> 1)]; }
function axToOff(q, s) { return [q, s + ((q - (q & 1)) >> 1)]; }
function axDist(a, b) { const dq = a[0] - b[0], dr = a[1] - b[1]; return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2; }
function hexCenter(c, r) { return [HEX * 1.5 * c + HEX, HEX * SQ3 * (r + 0.5 * (c & 1)) + HEX * SQ3 / 2]; }
function hexCorner(cx, cy, i, size = HEX) { const a = Math.PI / 180 * 60 * i; return [cx + size * Math.cos(a), cy + size * Math.sin(a)]; }
function edgeKey(a, b) { return a < b ? a + '_' + b : b + '_' + a; }

// --- Rumore a valori con fbm
function makeNoise(rng) {
  const P = new Float32Array(512); for (let i = 0; i < 512; i++) P[i] = rng.next();
  const perm = []; for (let i = 0; i < 256; i++) perm.push(i); rng.shuffle(perm);
  const pp = perm.concat(perm);
  const v = (x, y) => P[pp[(pp[x & 255] + y) & 511]];
  const sm = t => t * t * (3 - 2 * t);
  function n2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = v(xi, yi), b = v(xi + 1, yi), c = v(xi, yi + 1), d = v(xi + 1, yi + 1);
    const u = sm(xf), w = sm(yf);
    return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
  }
  return function fbm(x, y, oct = 4) { let s = 0, amp = 1, f = 1, tot = 0; for (let o = 0; o < oct; o++) { s += amp * n2(x * f, y * f); tot += amp; amp *= 0.5; f *= 2.03; } return s / tot; };
}

// Coda di priorità minima (binary heap)
class PQ {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(item, pr) { const a = this.a; a.push([pr, item]); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a; const top = a[0]; const last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top[1]; }
}
