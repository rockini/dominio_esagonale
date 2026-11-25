// ============================================================
//  MAPPA: struttura dati, terreni, lati
// ============================================================
const TERRAIN = {
  pianura:   { name: 'Pianura', cost: 1, melee: 0, ranged: 0, los: false },
  collina:   { name: 'Collina', cost: 2, heavy: 3, melee: -1, ranged: -1, los: false },
  bosco:     { name: 'Bosco', cost: 2, elf: 1, heavy: 3, melee: -1, ranged: -1, los: true },
  palude:    { name: 'Palude', cost: 3, amph: 1, heavy: 4, melee: -1, ranged: 0, los: false },
  deserto:   { name: 'Deserto', cost: 2, melee: 0, ranged: 0, los: false },
  montagna:  { name: 'Montagna', cost: 3, dwarf: 2, melee: -2, ranged: -2, los: true, noCav: true },
  lago:      { name: 'Lago', cost: Infinity, amphCost: 2, melee: 0, ranged: 0, los: false },
  citta:     { name: 'Città minore', cost: 1, melee: -1, ranged: -1, los: true, settlement: true, gold: 2, pv: 1, recruit: 1 },
  cittamag:  { name: 'Città maggiore', cost: 1, melee: -1, ranged: -1, los: true, settlement: true, gold: 4, pv: 2, recruit: 2 },
  castello:  { name: 'Castello minore', cost: 1, melee: -2, ranged: -2, los: true, settlement: true, gold: 3, pv: 2, recruit: 1, castle: true },
  castellomag: { name: 'Castello maggiore', cost: 1, melee: -3, ranged: -3, los: true, settlement: true, gold: 5, pv: 3, recruit: 2, castle: true },
  capitale:  { name: 'Capitale', cost: 1, melee: -3, ranged: -3, los: true, settlement: true, gold: 6, pv: 4, recruit: 3, castle: true },
  rovina:    { name: 'Rovina', cost: 2, melee: -1, ranged: -1, los: false, place: true },
  tempio:    { name: "Tempio dell'Ordine", cost: 1, los: false, place: true },
  altare:    { name: 'Altare del Caos', cost: 1, los: false, place: true },
  fenditura: { name: 'Fenditura del Caos', cost: 1, los: false, place: true },
};
const EDGE_TYPES = {
  fiume: 'Fiume', guado: 'Guado', ponte: 'Ponte', cresta: 'Cresta', mura: 'Mura', barriera: 'Barriera magica',
};
const FACTION_NAME = { O: 'Ordine', C: 'Caos', N: 'Neutrale' };

class GameMap {
  constructor(W, H) {
    this.W = W; this.H = H;
    this.hexes = [];
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      const [q, s] = offToAx(c, r);
      const [x, y] = hexCenter(c, r);
      this.hexes.push({ id: r * W + c, c, r, q, s, x, y, terrain: 'pianura', base: 'pianura', elev: 0, moist: 0, region: -1,
        state: 'normale', feature: null, owner: null, key: false, road: false });
    }
    this.edges = new Map();      // edgeKey -> {type, high?}
    this.roadLinks = new Set();  // edgeKey dei collegamenti stradali
    this.roads = [];             // [{path:[hexId...], main:bool}]
    this.rivers = [];            // [[[x,y]...]] polilinee dei vertici
    this.labels = [];            // etichette di regione
    this.regions = [];
    this.pxW = HEX * 1.5 * W + HEX * 0.5 + HEX;
    this.pxH = HEX * SQ3 * (H + 0.5) ;
  }
  at(c, r) { return (c < 0 || r < 0 || c >= this.W || r >= this.H) ? null : this.hexes[r * this.W + c]; }
  ax(q, s) { const [c, r] = axToOff(q, s); return this.at(c, r); }
  nb(h, i) { const d = DIRS[i]; return this.ax(h.q + d[0], h.s + d[1]); }
  neighbors(h) { const out = []; for (let i = 0; i < 6; i++) { const n = this.nb(h, i); if (n) out.push(n); } return out; }
  dist(a, b) { return axDist([a.q, a.s], [b.q, b.s]); }
  dirTo(a, b) { for (let i = 0; i < 6; i++) { const d = DIRS[i]; if (a.q + d[0] === b.q && a.s + d[1] === b.s) return i; } return -1; }
  edge(a, b) { return this.edges.get(edgeKey(a.id, b.id)) || null; }
  setEdge(a, b, e) { this.edges.set(edgeKey(a.id, b.id), e); }
  within(h, d) { const out = []; for (const x of this.hexes) if (this.dist(h, x) <= d) out.push(x); return out; }
  isBorder(h) { return h.c === 0 || h.r === 0 || h.c === this.W - 1 || h.r === this.H - 1; }
  half(h) { return h.c < this.W / 2 ? 'O' : 'C'; }
  features() { return this.hexes.filter(h => h.feature); }
  byName(n) { return this.hexes.find(h => h.feature && h.feature.name === n); }
  hexAtPoint(x, y) {
    // conversione pixel -> esagono (flat-top)
    const px = x - HEX, py = y - HEX * SQ3 / 2;
    const qf = (2 / 3 * px) / HEX, rf = (-1 / 3 * px + SQ3 / 3 * py) / HEX;
    let xq = qf, zq = rf, yq = -xq - zq;
    let rx = Math.round(xq), ry = Math.round(yq), rz = Math.round(zq);
    const dx = Math.abs(rx - xq), dy = Math.abs(ry - yq), dz = Math.abs(rz - zq);
    if (dx > dy && dx > dz) rx = -ry - rz; else if (dy > dz) ry = -rx - rz; else rz = -rx - ry;
    return this.ax(rx, rz);
  }
  // Grafo dei vertici: ogni segmento è un lato d'esagono
  buildVertexGraph() {
    const V = new Map(); // key -> {key,x,y,adj:[{v,edge:[aId,bId|null]}], hexes:Set}
    const vk = (x, y) => Math.round(x * 10) + ',' + Math.round(y * 10);
    const getV = (x, y) => { const k = vk(x, y); let v = V.get(k); if (!v) { v = { key: k, x, y, adj: [], hexes: new Set() }; V.set(k, v); } return v; };
    for (const h of this.hexes) {
      for (let i = 0; i < 6; i++) {
        const [x1, y1] = hexCorner(h.x, h.y, i), [x2, y2] = hexCorner(h.x, h.y, (i + 1) % 6);
        const a = getV(x1, y1), b = getV(x2, y2);
        a.hexes.add(h.id); b.hexes.add(h.id);
        const n = this.nb(h, i);
        if (!a.adj.some(e => e.v === b)) { a.adj.push({ v: b, a: h.id, b: n ? n.id : null }); b.adj.push({ v: a, a: h.id, b: n ? n.id : null }); }
      }
    }
    this.V = V;
    return V;
  }
}
