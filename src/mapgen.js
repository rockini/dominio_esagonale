// ============================================================
//  GENERATORE DI MAPPE
// ============================================================
const NAMES = {
  pre: ['Pietra', 'Valle', 'Monte', 'Rocca', 'Borgo', 'Castel', 'Fonte', 'Torre', 'Ponte', 'Selva', 'Colle', 'Poggio', 'Vigna', 'Campo', 'Porta', 'Riva', 'Guado', 'Acqua', 'Sasso', 'Corte'],
  suf: ['luce', 'scura', 'nera', 'verde', 'fredda', 'alta', 'bianca', 'rossa', 'chiara', 'grande', 'antica', 'serena', 'dorata', 'ferrata', 'grigia', 'vento', 'fiorita', 'sole', 'stella', 'quercia'],
  chaosPre: ['Gola', 'Fossa', 'Cripta', 'Antro', 'Spira', 'Bocca', 'Zanna', 'Rovo', 'Cenere', 'Teschio'],
  chaosSuf: ['del Vuoto', 'Sanguigna', 'dei Teschi', 'Ritorta', 'Cinerea', "dell'Abisso", 'Marcia', 'dei Corvi', 'Urlante', 'Spezzata'],
  regO: ['Marca Dorata', 'Contea del Grano', 'Piana Serena', 'Terre del Giuramento', 'Valle dei Gigli', 'Marca del Sole', 'Contea Alta', 'Baronia di Ferro'],
  regC: ['Landa Cremisi', 'Terre Arse', 'Marche Spezzate', 'Piana dei Teschi', 'Desolazione Rossa', 'Regno delle Zanne', 'Terre Ritorte', 'Valle Urlante'],
  bosco: ['Selva dei Sussurri', 'Bosco Antico', 'Selva Fonda', 'Bosco dei Cervi', 'Macchia Nera', 'Selva Ombrosa', 'Bosco Vecchio'],
  montagna: ['Monti Ferrigni', 'Picchi Grigi', 'Monti del Drago', 'Denti di Pietra', 'Corna Bianche', 'Monti Freddi'],
  collina: ['Colli Ventosi', 'Alture Brune', 'Colline Rosse', 'Poggi Ondosi', 'Colli del Pastore'],
  palude: ['Paludi Grigie', 'Acquitrino Lento', 'Paludi Morte', 'Pantano dei Rospi'],
  deserto: ['Sabbie Rosse', 'Distesa Arida', 'Piana Bruciata', 'Dune di Sale'],
  fiume: ['Argento', 'Lento', 'Torbo', 'Chiaro', 'Serpe', 'Vena Azzurra', 'Gelido'],
};

class MapContext {
  constructor(scn, seed) {
    this.scn = scn; this.seed = seed;
    this.rng = new RNG(seed ^ hashStr(scn.id));
    const [W, H] = scn.size;
    this.map = new GameMap(W, H);
    this.map.scenarioId = scn.id; this.map.seed = seed;
    this.usedNames = new Set();
    this.notes = [];
    this.riversPlaced = false;
  }
  // ---------- nomi
  name(kind) {
    const r = this.rng;
    for (let k = 0; k < 40; k++) {
      let n;
      if (kind === 'C') n = r.pick(NAMES.chaosPre) + ' ' + r.pick(NAMES.chaosSuf);
      else if (NAMES[kind]) n = r.pick(NAMES[kind]);
      else { const p = r.pick(NAMES.pre), s = r.pick(NAMES.suf); n = s === 'vento' || s === 'sole' || s === 'stella' || s === 'quercia' ? p + ' del ' + s.charAt(0).toUpperCase() + s.slice(1) : p + s; if (s === 'stella' || s === 'quercia') n = p + ' della ' + s.charAt(0).toUpperCase() + s.slice(1); }
      if (!this.usedNames.has(n)) { this.usedNames.add(n); return n; }
    }
    return 'Senza nome';
  }
  // ---------- utilità di posizione: fx, fy in [0,1]
  pt(fx, fy) { const m = this.map; return m.at(Math.round(fx * (m.W - 1)), Math.round(fy * (m.H - 1))); }
  hexNear(fx, fy) { return this.pt(fx, fy); }
  // Piazza un luogo/insediamento scegliendo l'esagono con punteggio migliore
  place(type, opt = {}) {
    const m = this.map, r = this.rng;
    const minDist = opt.minDist ?? 3;
    let best = null, bs = -Infinity;
    const target = opt.at ? this.pt(opt.at[0], opt.at[1]) : null;
    for (const h of m.hexes) {
      if (h.feature || h.terrain === 'lago') continue;
      if (opt.hex && h !== opt.hex) continue;
      if (opt.side && m.half(h) !== opt.side) continue;
      if (opt.filter && !opt.filter(h)) continue;
      let tooClose = false;
      for (const f of m.hexes) if (f.feature && m.dist(f, h) < minDist) { tooClose = true; break; }
      if (tooClose && !opt.hex) continue;
      let s = r.range(0, opt.jitter ?? 2);
      if (target) s -= m.dist(h, target) * 1.2;
      if (!opt.allowRough) { if (h.terrain === 'montagna') s -= 6; if (h.terrain === 'palude') s -= 3; }
      if (opt.edgeAvoid !== false && m.isBorder(h)) s -= 4;
      if (opt.score) s += opt.score(h);
      if (s > bs) { bs = s; best = h; }
    }
    if (!best) return null;
    this.setFeature(best, type, opt);
    return best;
  }
  setFeature(h, type, opt = {}) {
    const isTesta = type === 'testa';
    if (!isTesta) { if (h.terrain === 'montagna' || h.terrain === 'lago') h.base = 'collina'; else h.base = h.terrain; h.terrain = type; }
    const owner = opt.owner || null;
    h.feature = { type, name: opt.name || this.name(owner === 'C' ? 'C' : 'O'), owner, corrupt: !!opt.corrupt };
    h.owner = owner;
    if (opt.key) h.key = true;
    if (opt.corrupt) h.state = 'corrotto';
    return h;
  }
  forceTerrain(h, t) { if (!h.feature) h.terrain = t; h.base = t; }
  // ---------- campi di base
  baseFields() {
    const m = this.map, r = this.rng, scn = this.scn;
    const nE = makeNoise(r), nM = makeNoise(r), nF = makeNoise(r);
    this.nCrest = makeNoise(r); this.nWarp = makeNoise(r);
    const sc = 1 / 6.5;
    for (const h of m.hexes) {
      const fx = h.c / (m.W - 1), fy = h.r / (m.H - 1);
      let e = nE(h.c * sc, h.r * sc * 1.1, 4);
      let mo = nM(h.c * sc * 0.9 + 50, h.r * sc + 20, 3) * 0.75 + nF(h.c * sc * 2.2, h.r * sc * 2.2, 2) * 0.25;
      if (scn.shape) e += scn.shape(fx, fy, h, this) || 0;
      if (scn.moistShape) mo += scn.moistShape(fx, fy, h, this) || 0;
      h.elev = e; h.moist = mo;
    }
  }
  assignTerrain() {
    const m = this.map, scn = this.scn;
    const mix = Object.assign({ montagna: 0.06, collina: 0.13, bosco: 0.17, palude: 0.04, deserto: 0.04 }, scn.mix || {});
    const N = m.hexes.length;
    const byE = [...m.hexes].sort((a, b) => b.elev - a.elev);
    const nMon = Math.round(N * mix.montagna), nCol = Math.round(N * mix.collina);
    byE.forEach((h, i) => { h.terrain = i < nMon ? 'montagna' : i < nMon + nCol ? 'collina' : 'pianura'; });
    // paludi: bassa quota e umido
    const low = m.hexes.filter(h => h.terrain === 'pianura').sort((a, b) => (a.elev - a.moist * 0.8) - (b.elev - b.moist * 0.8));
    for (let i = 0; i < Math.round(N * mix.palude); i++) low[i].terrain = 'palude';
    const flat = m.hexes.filter(h => h.terrain === 'pianura' || h.terrain === 'collina');
    flat.sort((a, b) => b.moist - a.moist);
    let nB = Math.round(N * mix.bosco);
    for (const h of flat) { if (nB <= 0) break; if (h.terrain === 'collina' && this.rng.chance(0.55)) continue; h.terrain = 'bosco'; nB--; }
    const dry = m.hexes.filter(h => h.terrain === 'pianura').sort((a, b) => a.moist - b.moist);
    for (let i = 0; i < Math.round(N * mix.deserto) && i < dry.length; i++) dry[i].terrain = 'deserto';
    // pulizia: esagoni isolati di montagna diventano colline
    for (const h of m.hexes) {
      if (h.terrain === 'montagna' && !m.neighbors(h).some(n => n.terrain === 'montagna' || n.terrain === 'collina')) h.terrain = 'collina';
    }
    for (const h of m.hexes) h.base = h.terrain;
  }
  lakes(n) {
    const m = this.map, r = this.rng;
    const cands = m.hexes.filter(h => !h.feature && !m.isBorder(h) && (h.terrain === 'pianura' || h.terrain === 'palude' || h.terrain === 'bosco')
      && !m.neighbors(h).some(x => x.feature)).sort((a, b) => a.elev - b.elev);
    let placed = 0;
    for (const h of cands) {
      if (placed >= n) break;
      if (m.hexes.some(x => x.terrain === 'lago' && m.dist(x, h) < 6)) continue;
      h.terrain = h.base = 'lago'; placed++;
      // eventuale secondo esagono
      if (r.chance(0.6)) {
        const nb = m.neighbors(h).filter(x => !x.feature && !m.isBorder(x) && x.terrain !== 'montagna' && !m.neighbors(x).some(y => y.feature));
        if (nb.length) { const x = r.pick(nb); x.terrain = x.base = 'lago'; }
      }
      for (const x of m.neighbors(h)) if (x.terrain !== 'lago' && !x.feature && r.chance(0.35)) x.terrain = x.base = 'palude';
    }
  }
  // ---------- fiumi lungo i lati
  river(spec = {}) {
    const m = this.map, r = this.rng;
    const V = m.V || m.buildVertexGraph();
    const verts = [...V.values()];
    const borderV = verts.filter(v => v.hexes.size === 2 && v.adj.some(e => e.b !== null));
    const sideOf = v => {
      const minX = HEX * 0.6, maxX = m.pxW - HEX * 1.6, maxY = m.pxH - SQ3 * HEX * 0.6;
      const out = [];
      if (v.y < SQ3 * HEX * 0.6) out.push('N'); if (v.y > maxY) out.push('S');
      if (v.x < minX + HEX * 0.6) out.push('W'); if (v.x > maxX) out.push('E');
      return out;
    };
    const pickVert = (side, frac) => {
      const cand = borderV.filter(v => sideOf(v).includes(side));
      if (!cand.length) return null;
      const horiz = side === 'N' || side === 'S';
      const f = frac ?? r.range(0.2, 0.8);
      const tgt = horiz ? f * m.pxW : f * m.pxH;
      cand.sort((a, b) => Math.abs((horiz ? a.x : a.y) - tgt) - Math.abs((horiz ? b.x : b.y) - tgt));
      return cand[0];
    };
    const sides = ['N', 'S', 'W', 'E'];
    const opp = { N: 'S', S: 'N', W: 'E', E: 'W' };
    let from = spec.from || r.pick(sides);
    let start = pickVert(from, spec.fromFrac);
    let targets;
    if (spec.joinExisting && this.riverVerts && this.riverVerts.size) targets = new Set(this.riverVerts);
    else if (spec.toLake) targets = new Set(verts.filter(v => [...v.hexes].some(id => m.hexes[id].terrain === 'lago')).map(v => v.key));
    if (!targets || !targets.size) { const to = spec.to || opp[from]; const e = pickVert(to, spec.toFrac); targets = new Set([e.key]); }
    const via = spec.via ? (() => { const h = this.pt(spec.via[0], spec.via[1]); let best = null, bd = 1e9; for (const v of verts) { const d = Math.hypot(v.x - h.x, v.y - h.y); if (d < bd) { bd = d; best = v; } } return best; })() : null;
    const noise = this.nWarp;
    const segCost = (u, e) => {
      if (e.b === null) return Infinity;              // niente fiumi sul bordo
      const ek = edgeKey(e.a, e.b);
      if (m.edges.has(ek)) return Infinity;
      const ha = m.hexes[e.a], hb = m.hexes[e.b];
      if (ha.terrain === 'lago' && hb.terrain === 'lago') return Infinity;
      let c = 1 + (ha.elev + hb.elev) * 3 + noise((u.x + e.v.x) / 140, (u.y + e.v.y) / 140) * 4;
      if (ha.terrain === 'montagna' || hb.terrain === 'montagna') c += 4;
      if (m.isBorder(ha) && m.isBorder(hb)) c += 6;
      if (ha.feature && hb.feature) c += 30;
      return c;
    };
    const dijkstra = (src, tset) => {
      const dist = new Map([[src.key, 0]]), prev = new Map(), pq = new PQ(); pq.push(src, 0);
      while (pq.size) {
        const u = pq.pop(); const du = dist.get(u.key);
        if ((tset.has(u.key) || (this.riverVerts && this.riverVerts.has(u.key))) && u !== src) { const path = [u]; let k = u.key; while (prev.has(k)) { const p = prev.get(k); path.push(p.v); k = p.v.key; } return path.reverse(); }
        for (const e of u.adj) {
          const c = segCost(u, e); if (!isFinite(c)) continue;
          const nd = du + c;
          if (nd < (dist.get(e.v.key) ?? Infinity)) { dist.set(e.v.key, nd); prev.set(e.v.key, { v: u }); pq.push(e.v, nd); }
        }
      }
      return null;
    };
    let path;
    if (via) { const p1 = dijkstra(start, new Set([via.key])); if (!p1) return null; const p2 = dijkstra(via, targets); if (!p2) return null; path = p1.concat(p2.slice(1)); }
    else path = dijkstra(start, targets);
    if (!path) return null;
    this.riverVerts = this.riverVerts || new Set();
    const segs = [];
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i], v = path[i + 1];
      const e = u.adj.find(x => x.v === v);
      if (e && e.b !== null) { const k = edgeKey(e.a, e.b); m.edges.set(k, { type: 'fiume' }); segs.push(k); }
      this.riverVerts.add(u.key);
    }
    this.riverVerts.add(path[path.length - 1].key);
    const river = { pts: path.map(v => [v.x, v.y]), segs, name: 'Fiume ' + this.name('fiume') };
    // prolunga di mezzo esagono fuori dal bordo per un aspetto naturale
    const extend = (a, b) => [a[0] + (a[0] - b[0]) * 0.8, a[1] + (a[1] - b[1]) * 0.8];
    if (borderV.includes(path[0])) river.pts.unshift(extend(river.pts[0], river.pts[1]));
    const L = river.pts.length; if (borderV.includes(path[path.length - 1])) river.pts.push(extend(river.pts[L - 1], river.pts[L - 2]));
    m.rivers.push(river);
    this.riversPlaced = true;
    return river;
  }
  autoRivers() {
    const r = this.rng, scn = this.scn;
    const n = scn.rivers ?? r.int(1, 2);
    for (let i = 0; i < n; i++) {
      const vertical = r.chance(0.5);
      const spec = vertical ? { from: 'N', to: 'S', fromFrac: r.range(0.25, 0.75), toFrac: r.range(0.25, 0.75) } : { from: r.pick(['W', 'E']), fromFrac: r.range(0.25, 0.75), toFrac: r.range(0.25, 0.75) };
      this.river(spec);
    }
    if (r.chance(scn.tributary ?? 0.6) && this.riverVerts) this.river({ from: r.pick(['N', 'S', 'W', 'E']), joinExisting: true });
  }
  // ---------- strade: rete minima (albero ricoprente) fra insediamenti e luoghi
  roads() {
    const m = this.map, r = this.rng, scn = this.scn;
    const nodes = m.hexes.filter(h => h.feature);
    // ingressi dai bordi est e ovest
    const entry = (c) => { let best = null, bs = Infinity; for (const h of m.hexes) if (h.c === c && h.terrain !== 'lago' && h.terrain !== 'montagna') { const s = Math.abs(h.r - m.H / 2) + r.range(0, m.H * 0.5); if (s < bs) { bs = s; best = h; } } return best; };
    if (scn.roadEntries !== false) { const a = entry(0), b = entry(m.W - 1); if (a) { a.entry = true; nodes.push(a); } if (b) { b.entry = true; nodes.push(b); } }
    const baseCost = { pianura: 1, deserto: 1.6, collina: 2.4, bosco: 2.2, palude: 3.6, montagna: 9, lago: Infinity };
    const stepCost = (a, b, reuse) => {
      let c = b.feature ? 1 : baseCost[b.terrain] ?? 1;
      const e = m.edge(a, b);
      if (e) {
        if (e.type === 'fiume') c += scn.noBridges ? Infinity : 4;
        else if (e.type === 'guado') c += 0.5; else if (e.type === 'cresta') c += 1.5; else if (e.type === 'mura') c += 1;
      }
      if (reuse && m.roadLinks.has(edgeKey(a.id, b.id))) c = 0.3;
      return c;
    };
    const search = (src, reuse, goal) => {
      const dist = new Map([[src.id, 0]]), prev = new Map(), pq = new PQ(); pq.push(src, 0);
      while (pq.size) {
        const u = pq.pop(); const du = dist.get(u.id);
        if (goal && u === goal) break;
        for (const v of m.neighbors(u)) {
          const c = stepCost(u, v, reuse); if (!isFinite(c)) continue;
          const nd = du + c;
          if (nd < (dist.get(v.id) ?? Infinity)) { dist.set(v.id, nd); prev.set(v.id, u.id); pq.push(v, nd); }
        }
      }
      return { dist, prev };
    };
    // matrice delle distanze
    const D = nodes.map(n => search(n, false).dist);
    // Prim
    const inT = new Set([0]), links = [];
    while (inT.size < nodes.length) {
      let best = null, bd = Infinity;
      for (const i of inT) for (let j = 0; j < nodes.length; j++) if (!inT.has(j)) {
        let d = D[i].get(nodes[j].id) ?? Infinity;
        if (nodes[i].entry && nodes[j].entry) d *= 3;
        if (d < bd) { bd = d; best = [i, j]; }
      }
      if (!best) break;
      inT.add(best[1]); links.push(best);
    }
    links.sort((a, b) => (D[a[0]].get(nodes[a[1]].id)) - (D[b[0]].get(nodes[b[1]].id)));
    const major = h => h.feature && ['capitale', 'castellomag', 'castello', 'cittamag'].includes(h.feature.type);
    for (const [i, j] of links) {
      const a = nodes[i], b = nodes[j];
      const { prev } = search(a, true, b);
      if (!prev.has(b.id)) continue;
      const path = [b.id]; let k = b.id; while (prev.has(k)) { k = prev.get(k); path.push(k); }
      path.reverse();
      for (let t = 0; t < path.length - 1; t++) {
        const ha = m.hexes[path[t]], hb = m.hexes[path[t + 1]];
        const ek = edgeKey(ha.id, hb.id);
        m.roadLinks.add(ek); ha.road = hb.road = true;
        const e = m.edges.get(ek);
        if (e && e.type === 'fiume') m.edges.set(ek, { type: 'ponte' });
        if (e && e.type === 'cresta') m.edges.delete(ek);
      }
      m.roads.push({ path, main: (major(a) || a.entry) && (major(b) || b.entry) });
    }
  }
  fords() {
    const m = this.map, r = this.rng;
    for (const rv of m.rivers) {
      const segs = rv.segs.filter(k => m.edges.get(k)?.type === 'fiume');
      if (segs.length < 6) continue;
      const bridges = rv.segs.filter(k => m.edges.get(k)?.type !== 'fiume').length;
      const n = bridges >= 2 ? r.int(0, 1) : r.int(1, 2);
      for (let i = 0; i < n; i++) { const k = r.pick(segs.slice(2, -2)); if (k && m.edges.get(k).type === 'fiume') m.edges.set(k, { type: 'guado' }); }
    }
  }
  crests() {
    const m = this.map, r = this.rng, n = this.nCrest;
    const high = t => t === 'collina' || t === 'montagna';
    for (const h of m.hexes) for (let i = 0; i < 3; i++) {
      const o = m.nb(h, i); if (!o) continue;
      const k = edgeKey(h.id, o.id);
      if (m.edges.has(k) || m.roadLinks.has(k)) continue;
      const hh = high(h.base), ho = high(o.base);
      if (hh === ho) continue;
      const up = hh ? h : o, low = hh ? o : h;
      if (low.terrain === 'lago' || up.feature || low.feature) continue;
      const mx = (h.x + o.x) / 2, my = (h.y + o.y) / 2;
      const v = n(mx / 150, my / 150, 2);
      if (v > (this.scn.crestThr ?? 0.67)) m.edges.set(k, { type: 'cresta', high: up.id });
    }
  }
  walls(h) { for (const n of this.map.neighbors(h)) { const k = edgeKey(h.id, n.id); const e = this.map.edges.get(k); if (!e || e.type === 'cresta') this.map.edges.set(k, { type: 'mura' }); } }
  // ---------- regioni colorate e etichette
  regions() {
    const m = this.map, r = this.rng;
    const seeds = [];
    const kO = r.int(2, 3), kC = r.int(2, 3);
    const regO = r.shuffle([...NAMES.regO]), regC = r.shuffle([...NAMES.regC]);
    const hueO = r.shuffle([0, 1, 2, 3]), hueC = r.shuffle([0, 1, 2, 3]);
    for (let i = 0; i < kO; i++) seeds.push({ side: 'O', x: r.range(0.05, 0.45) * m.pxW, y: ((i + r.range(0.15, 0.85)) / kO) * m.pxH, name: regO[i], pal: hueO[i] });
    for (let i = 0; i < kC; i++) seeds.push({ side: 'C', x: r.range(0.55, 0.95) * m.pxW, y: ((i + r.range(0.15, 0.85)) / kC) * m.pxH, name: regC[i], pal: hueC[i] });
    const w = this.nWarp;
    for (const h of m.hexes) {
      let best = 0, bd = Infinity;
      const wx = h.x + (w(h.x / 300, h.y / 300) - 0.5) * 260, wy = h.y + (w(h.x / 300 + 9, h.y / 300 + 9) - 0.5) * 260;
      seeds.forEach((s, i) => { const d = Math.hypot(s.x - wx, s.y - wy) * (s.side === m.half(h) ? 1 : 1.6); if (d < bd) { bd = d; best = i; } });
      h.region = best;
    }
    m.regions = seeds;
    // etichette di regione
    seeds.forEach((s, i) => {
      const hs = m.hexes.filter(h => h.region === i); if (hs.length < 12) return;
      let cx = 0, cy = 0; hs.forEach(h => { cx += h.x; cy += h.y; }); cx /= hs.length; cy /= hs.length;
      m.labels.push({ text: s.name.toUpperCase(), x: cx, y: cy, size: 24, kind: 'region', angle: r.range(-0.12, 0.12) });
    });
    // etichette dei gruppi di terreno
    const seen = new Set();
    for (const h of m.hexes) {
      if (seen.has(h.id) || !['bosco', 'montagna', 'palude', 'deserto', 'collina'].includes(h.terrain)) continue;
      const t = h.terrain, grp = [], st = [h]; seen.add(h.id);
      while (st.length) { const x = st.pop(); grp.push(x); for (const n of m.neighbors(x)) if (!seen.has(n.id) && n.terrain === t) { seen.add(n.id); st.push(n); } }
      if (grp.length >= (t === 'collina' ? 9 : 6)) {
        let cx = 0, cy = 0; grp.forEach(g => { cx += g.x; cy += g.y; }); cx /= grp.length; cy /= grp.length;
        m.labels.push({ text: this.name(t), x: cx, y: cy, size: 15, kind: 'terrain', angle: 0 });
      }
    }
    m.rivers.forEach(rv => { if (rv.pts.length > 10) { const i = Math.floor(rv.pts.length * r.range(0.3, 0.7)); const a = rv.pts[i], b = rv.pts[i + 1] || rv.pts[i - 1]; let ang = Math.atan2(b[1] - a[1], b[0] - a[0]); if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI; m.labels.push({ text: rv.name, x: a[0], y: a[1] - 9, size: 11, kind: 'river', angle: ang }); } });
  }
  finalizeStates() {
    for (const h of this.map.hexes) {
      if (!h.feature) continue;
      const t = h.feature.type;
      if (t === 'tempio' && h.owner === 'O') h.state = 'purificato';
      if ((t === 'altare' || t === 'fenditura') && h.owner === 'C') h.state = 'corrotto';
    }
  }
}

function generateMap(scn, seed) {
  const ctx = new MapContext(scn, seed);
  ctx.baseFields();
  ctx.assignTerrain();
  ctx.map.buildVertexGraph();
  if (scn.terrainPost) scn.terrainPost(ctx);
  scn.layout(ctx);
  if (scn.lakes !== 0) ctx.lakes(scn.lakes ?? ctx.rng.int(0, 2));
  if (!ctx.riversPlaced && scn.rivers !== 0) ctx.autoRivers();
  if (scn.afterRivers) scn.afterRivers(ctx);
  ctx.roads();
  if (!scn.noFords) ctx.fords();
  ctx.crests();
  if (scn.post) scn.post(ctx);
  ctx.finalizeStates();
  ctx.regions();
  ctx.map.notes = ctx.notes;
  return ctx;
}
