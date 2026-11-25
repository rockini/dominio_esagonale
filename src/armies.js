// ============================================================
//  ARMATE e SCHIERAMENTO
// ============================================================
const kw = (t, k) => UNITS[t].kw.includes(k);
const isCav = t => kw(t, 'Cavalleria') || kw(t, 'Bestia');
const isBig = t => kw(t, 'Grande');
const isLeader = t => UNITS[t].kind !== 'unit';
const isRanged = t => UNITS[t].P >= 1 && UNITS[t].FM < 2 && UNITS[t].kind === 'unit' && !isBig(t);
const isCaster = t => UNITS[t].FM >= 2 && UNITS[t].kind === 'unit';
const stackPts = t => isLeader(t) ? 0 : isBig(t) ? 2 : 1;

let UID = 1;
function mkUnit(type, fac, extra = {}) { return Object.assign({ uid: UID++, type, fac, hex: null, grade: 'B', dmg: 0, status: [], fm: UNITS[type].FM, commander: false, reserve: false }, extra); }

function parseArmy(str, fac) {
  const out = [];
  for (const part of str.split(';').map(s => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s+(.+)$/);
    const n = m ? +m[1] : 1, name = m ? m[2] : part;
    if (!UNITS[name]) { console.warn('Unità sconosciuta', name); continue; }
    for (let i = 0; i < n; i++) out.push(mkUnit(name, fac));
  }
  return out;
}
const armyCost = list => list.reduce((s, u) => s + (UNITS[u.type].costs[u.grade === 'V' ? 1 : 0] || UNITS[u.type].cost), 0);

// Composizione preferita di un'armata a punti (pesi relativi)
const PREFS = {
  O: { 'Fanteria disciplinata': 3, 'Lancieri': 2.2, 'Picchieri': 1.2, 'Scudieri': 0.8, 'Cavalieri': 1.6, 'Cavalieri pesanti': 0.5, 'Cavalieri del Tempio': 0.3, 'Arcieri': 2, 'Arcieri lunghi': 1, 'Balestrieri': 1.1, 'Arcieri elfici': 0.4, 'Esploratori': 0.5, 'Guardie cittadine': 1, "Maghi dell'Ordine": 0.7, 'Maghi elementali': 0.3, 'Sacerdoti': 0.8, 'Guaritori': 0.3, 'Paladini': 0.4, 'Campioni della Legge': 0.25, 'Ranger elfici': 0.4, 'Guardiani del Bosco': 0.3, 'Guerrieri nanici': 0.6, 'Ingegneri nanici': 0.2, 'Cavalieri grifoni': 0.2, 'Golem controllati': 0.2, 'Inquisitori': 0.35 },
  C: { 'Orchi guerrieri': 3, 'Orchi berseker': 1.5, 'Goblin': 2, 'Goblin arcieri': 1.5, 'Goblin genieri': 0.3, 'Troll': 0.8, 'Troll di montagna': 0.3, 'Ogre': 0.7, 'Lupi giganti': 1.1, 'Chimere minori': 0.3, 'Scheletri': 0.6, 'Zombie': 0.3, 'Spettri': 0.3, 'Guerrieri del Caos': 1, 'Cavalieri del Caos': 0.4, 'Campioni mutati': 0.2, 'Draghi giovani': 0.15, 'Demoni minori': 0.4, 'Stregoni del Caos': 0.6, 'Sciamani': 0.6, 'Mutanti': 0.6, 'Abomini': 0.2, 'Sciami di insetti corrotti': 0.3 },
};
const HEROES = { O: ['Kael', 'Lyria', 'Theron', 'Seris', 'Capitano'], C: ['Gorath', 'Veyla', 'Korgash', 'Zhara', 'Capobanda'] };
const BOSSES = { O: ['Arcimago del Concilio', 'Gran Maestro dei Cavalieri', 'Re-Sacerdote'], C: ['Drago Antico', 'Signore del Caos', 'Demone Maggiore', 'Stregone Supremo del Caos'] };

function buildArmy(fac, points, opt, rng, taken) {
  const list = []; let left = points;
  const add = (t, grade = 'B') => { const c = UNITS[t].costs[grade === 'V' ? 1 : 0]; list.push(mkUnit(t, fac, { grade })); left -= c; };
  // Boss
  if (opt.boss) { const b = opt.boss === 'random' ? rng.pick(BOSSES[fac]) : opt.boss; add(b); }
  // Eroi
  const nH = opt.heroes ?? 1;
  const pool = rng.shuffle(HEROES[fac].filter(h => !taken.has(h)));
  for (let i = 0; i < nH; i++) { const h = pool.find(x => !taken.has(x) && UNITS[x].cost <= left - 10) || (fac === 'O' ? 'Capitano' : 'Capobanda'); if (h !== 'Capitano' && h !== 'Capobanda') taken.add(h); add(h); }
  // Requisiti
  const req = opt.req || {};
  for (const [k, n] of Object.entries(req)) {
    for (let i = 0; i < n; i++) {
      let t = k;
      if (k === '_sacre') t = rng.pick(['Sacerdoti', 'Inquisitori', 'Sacerdoti', 'Guaritori']);
      if (k === '_caster') t = rng.pick(['Sciamani', 'Stregoni del Caos', 'Sciamani']);
      add(t);
    }
  }
  const prefs = Object.assign({}, PREFS[fac], opt.prefs || {});
  const count = t => list.filter(u => u.type === t).length;
  const ok = t => {
    const c = UNITS[t].cost; if (c == null || c > left) return false;
    if (c >= 9 && count(t) >= 3) return false;
    if (opt.maxCav != null && isCav(t) && list.filter(u => isCav(u.type)).length >= opt.maxCav) return false;
    if (isCaster(t) && list.filter(u => isCaster(u.type)).length >= 3) return false;
    if (count(t) >= 6) return false;
    return true;
  };
  let guard = 0;
  while (left > 0 && guard++ < 200) {
    const cands = Object.keys(prefs).filter(ok);
    if (!cands.length) break;
    // nelle fasi finali preferisce le unità che riempiono bene il budget
    const t = rng.weighted(cands, x => prefs[x] * (left < 8 ? (UNITS[x].cost <= left ? 1 + UNITS[x].cost / 4 : 0) : 1));
    const vet = opt.vet && UNITS[t].costs[1] && rng.chance(0.35) && UNITS[t].costs[1] <= left;
    add(t, vet ? 'V' : 'B');
  }
  return list;
}

function makeArmies(scn, rng) {
  const A = { O: [], C: [] }, taken = new Set(), notes = [];
  for (const fac of ['O', 'C']) {
    if (scn.armies && scn.armies[fac]) { A[fac] = parseArmy(scn.armies[fac], fac); continue; }
    const pts = scn.points && scn.points[fac];
    if (pts == null) continue;
    const opt = { heroes: scn.minHeroes || 1, maxCav: scn.maxCav, prefs: scn.armyPrefs && scn.armyPrefs[fac], req: scn.req && scn.req[fac] };
    if (fac === 'C' && scn.chaosBoss) { opt.boss = scn.chaosBoss; opt.heroes = 0; }
    if (scn.allowBoss && rng.chance(0.4)) { opt.boss = 'random'; opt.heroes = Math.max(0, opt.heroes); }
    if (fac === 'O' && scn.vetO) opt.vet = true;
    if (Array.isArray(pts)) { pts.forEach((p, i) => { const part = buildArmy(fac, p, opt, rng, taken); part.forEach(u => u.player = i + 1); A[fac].push(...part); }); notes.push(`Ordine: ${pts.length} contingenti da ${pts[0]} punti, uno per giocatore cooperativo.`); }
    else A[fac] = buildArmy(fac, pts, opt, rng, taken);
  }
  for (const fac of ['O', 'C']) {
    const L = A[fac]; if (!L.length) continue;
    const cmdName = scn.commanders && scn.commanders[fac];
    const cmd = L.find(u => u.type === cmdName) || L.find(u => UNITS[u.type].kind === 'boss') || L.find(u => UNITS[u.type].kind === 'hero');
    if (cmd) cmd.commander = true;
  }
  return { A, notes };
}

// ------------------------------------------------------------
// Schieramento automatico
// ------------------------------------------------------------
function canStand(m, h, t) {
  if (!h || h.terrain === 'lago') return kw(t, 'Anfibia');
  if (h.terrain === 'montagna' && isCav(t)) return false;
  return true;
}
function stackLoad(units) { let p = 0, l = 0; for (const u of units) { if (isLeader(u.type)) l++; else p += stackPts(u.type); } return { p, l }; }

function formStacks(units, rng) {
  const heroes = units.filter(u => isLeader(u.type));
  const cav = units.filter(u => !isLeader(u.type) && isCav(u.type));
  const ranged = units.filter(u => !isLeader(u.type) && !isCav(u.type) && (isRanged(u.type)));
  const casters = units.filter(u => !isLeader(u.type) && isCaster(u.type));
  const guards = units.filter(u => u.type === 'Guardie cittadine');
  const melee = units.filter(u => !isLeader(u.type) && !isCav(u.type) && !isRanged(u.type) && !isCaster(u.type) && u.type !== 'Guardie cittadine');
  // le unità più forti in testa
  melee.sort((a, b) => (UNITS[b.type].F + UNITS[b.type].D) - (UNITS[a.type].F + UNITS[a.type].D));
  const stacks = [];
  const mk = (role, us) => { const s = { role, units: us }; stacks.push(s); return s; };
  for (const g of guards) mk('garrison', [g]);
  // linee: 2 unità di mischia (o 1 grande) + talvolta un tiratore
  let i = 0;
  while (i < melee.length) {
    const s = mk('line', []);
    while (i < melee.length && stackLoad(s.units).p + stackPts(melee[i].type) <= 3) { s.units.push(melee[i++]); if (s.units.length >= 2) break; }
    if (!s.units.length) s.units.push(melee[i++]);
  }
  for (let k = 0; k < cav.length; k += 2) mk('cav', cav.slice(k, k + 2));
  // tiratori: prima rinforzano le linee (1 per pila), poi pile di supporto
  const lines = stacks.filter(s => s.role === 'line');
  rng.shuffle(lines);
  let li = 0;
  const rest = [];
  for (const r of ranged) { const s = lines[li]; if (s && stackLoad(s.units).p + 1 <= 3 && rng.chance(0.5)) { s.units.push(r); li++; } else rest.push(r); }
  for (let k = 0; k < rest.length; k += 2) mk('support', rest.slice(k, k + 2));
  // eroi: il comandante al centro della linea, gli altri sparsi
  heroes.sort((a, b) => (b.commander ? 1 : 0) - (a.commander ? 1 : 0));
  const lineStacks = stacks.filter(s => s.role === 'line');
  heroes.forEach((h, k) => {
    const s = lineStacks[k] || stacks[k % Math.max(1, stacks.length)] || mk('line', []);
    s.units.push(h); if (h.commander) s.cmd = true;
  });
  // incantatori: con gli eroi o nelle pile di supporto
  for (const c of casters) {
    const s = stacks.find(s => s.units.some(u => isLeader(u.type)) && stackLoad(s.units).p < 4) || stacks.find(s => s.role === 'support' && stackLoad(s.units).p < 3);
    if (s) s.units.push(c); else mk('support', [c]);
  }
  return stacks.filter(s => s.units.length);
}

function deployFaction(m, units, zonePred, fac, target, rng, occupied) {
  const notes = [];
  if (!units.length) return notes;
  let zone = m.hexes.filter(h => zonePred(h) && h.terrain !== 'lago' && !(h.feature && h.owner && h.owner !== fac));
  // niente esagoni con nemici o adiacenti a nemici
  const enemyAt = h => occupied.has(h.id) && occupied.get(h.id) !== fac;
  zone = zone.filter(h => !enemyAt(h) && !m.neighbors(h).some(enemyAt));
  // gli insediamenti neutrali non si occupano allo schieramento
  zone = zone.filter(h => !(h.feature && !h.owner && TERRAIN[h.terrain].settlement));
  if (!zone.length) { notes.push(`Nessun esagono disponibile per lo schieramento di ${FACTION_NAME[fac]}.`); return notes; }
  const stacks = formStacks(units, rng);
  // asse fronte: verso il bersaglio
  const ax = [target.x, target.y];
  const cz = zone.reduce((a, h) => [a[0] + h.x / zone.length, a[1] + h.y / zone.length], [0, 0]);
  let dx = ax[0] - cz[0], dy = ax[1] - cz[1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
  const front = h => (h.x - cz[0]) * dx + (h.y - cz[1]) * dy;   // più alto = più avanti
  const lat = h => (h.x - cz[0]) * -dy + (h.y - cz[1]) * dx;
  const fMax = Math.max(...zone.map(front)), latMax = Math.max(1, ...zone.map(h => Math.abs(lat(h))));
  const used = new Map(); // hexId -> stack
  const def = h => -(TERRAIN[h.terrain].melee || 0);
  const own = h => h.feature && h.owner === fac;
  const place = (s, scoreFn, spacing) => {
    let best = null, bs = -Infinity;
    for (const h of zone) {
      if (used.has(h.id)) continue;
      if (!s.units.every(u => canStand(m, h, u.type))) continue;
      let sc = scoreFn(h) + rng.range(0, 0.6);
      for (const [id] of used) { const d = m.dist(h, m.hexes[id]); if (d < spacing) sc -= (spacing - d) * 3; }
      if (sc > bs) { bs = sc; best = h; }
    }
    if (best) { used.set(best.id, s); for (const u of s.units) u.hex = best.id; occupied.set(best.id, fac); }
    return best;
  };
  const order = ['garrison', 'line', 'cav', 'support'];
  stacks.sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role) || (b.cmd ? 1 : 0) - (a.cmd ? 1 : 0));
  const ownPlaces = zone.filter(own).sort((a, b) => (TERRAIN[b.terrain].pv || 0) - (TERRAIN[a.terrain].pv || 0));
  for (const s of stacks) {
    if (s.role === 'garrison') {
      place(s, h => (own(h) ? 20 + (TERRAIN[h.terrain].pv || 0) * 2 : 0) + front(h) / 200, 1);
    } else if (s.role === 'line') {
      place(s, h => (front(h) - fMax) / 40 + def(h) * 1.2 + (own(h) && TERRAIN[h.terrain].castle ? 4 : own(h) ? 1.5 : 0) - (s.cmd ? Math.abs(lat(h)) / latMax * 3 : 0) - (h.terrain === 'palude' ? 2 : 0), 2);
    } else if (s.role === 'cav') {
      place(s, h => (front(h) - fMax) / 50 + Math.abs(lat(h)) / latMax * 3 + (h.terrain === 'pianura' ? 2 : 0) - (h.terrain === 'bosco' || h.terrain === 'palude' ? 3 : 0), 2);
    } else {
      // supporto: subito dietro una pila di linea
      place(s, h => { let near = 0; for (const [id, st] of used) if (st.role === 'line' && m.dist(h, m.hexes[id]) === 1 && front(m.hexes[id]) > front(h)) near = 3; return near + (front(h) - fMax) / 80 + (h.terrain === 'collina' ? 1.5 : 0) + def(h) * 0.3; }, 1);
    }
  }
  // pile non piazzate: unisci dove c'è spazio
  for (const s of stacks) {
    if (s.units[0].hex !== null) continue;
    for (const u of s.units) {
      const h = zone.find(h => { const here = units.filter(x => x.hex === h.id); const l = stackLoad(here.concat([u])); return canStand(m, h, u.type) && l.p <= 4 && l.l <= 2; });
      if (h) { u.hex = h.id; occupied.set(h.id, fac); } else { u.reserve = true; }
    }
  }
  const nRes = units.filter(u => u.hex === null).length;
  if (nRes) notes.push(`${nRes} unità di ${FACTION_NAME[fac]} non trovano posto e restano in riserva.`);
  return notes;
}

function deployAll(ctx, armies) {
  const m = ctx.map, scn = ctx.scn, rng = new RNG(ctx.seed * 7 + 13);
  const units = [];
  const occupied = new Map();
  const notes = [];
  const dep = scn.deploy || { first: scn.first === 'O' ? 'C' : 'O', O: Z_DEFAULT, C: Z_DEFAULT, text: { O: 'entro 3 esagoni dal proprio bordo o dai propri insediamenti', C: 'entro 3 esagoni dal proprio bordo o dai propri insediamenti' } };
  // Caos automatico iniziale (cooperativi)
  if (scn.chaosStart) {
    for (const g of scn.chaosStart(ctx)) for (const t of g.units) { const u = mkUnit(t, 'C', { hex: g.hex.id }); units.push(u); occupied.set(g.hex.id, 'C'); }
  }
  const firstF = dep.first, secondF = firstF === 'O' ? 'C' : 'O';
  for (const fac of [firstF, secondF]) {
    let list = armies[fac]; if (!list || !list.length) continue;
    if (scn.chaosStart && fac === 'C') continue;
    if (fac === 'C' && scn.chaosSplit) {
      // metà dei punti in riserva per il TG 3
      const half = armyCost(list) / 2; let acc = 0; const sorted = [...list].sort((a, b) => (a.commander ? -1 : 0) - (b.commander ? -1 : 0));
      for (const u of sorted) { if (acc < half || u.commander) acc += UNITS[u.type].cost; else { u.reserve = true; u.arrives = 3; } }
      list = list.filter(u => !u.reserve);
      notes.push('Caos: metà dei punti in riserva, entra nel TG 3 da qualsiasi bordo.');
    }
    const pred = dep[fac](m, fac);
    // bersaglio: obiettivo principale o il centro delle forze nemiche già schierate
    const enemyPlaced = units.filter(u => u.fac !== fac && u.hex !== null);
    let target;
    if (enemyPlaced.length) { const xs = enemyPlaced.map(u => m.hexes[u.hex]); target = { x: xs.reduce((s, h) => s + h.x, 0) / xs.length, y: xs.reduce((s, h) => s + h.y, 0) / xs.length }; }
    else {
      const obj = m.hexes.filter(h => h.feature && (h.owner !== fac));
      const enemyHalf = m.hexes.filter(h => m.half(h) !== fac);
      const src = obj.length ? obj : enemyHalf;
      target = { x: src.reduce((s, h) => s + h.x, 0) / src.length, y: src.reduce((s, h) => s + h.y, 0) / src.length };
    }
    notes.push(...deployFaction(m, list, pred, fac, target, rng, occupied));
    units.push(...armies[fac]);
  }
  // Colosso dormiente (19.7)
  if (scn.colossus) { const h = m.hexes.find(h => h.feature && h.feature.name === 'Rovine del Colosso'); units.push(mkUnit('Colosso', 'N', { hex: h.id, status: ['dormiente'] })); }
  // zone di schieramento per il disegno
  const zones = {};
  for (const fac of ['O', 'C']) { if (!dep[fac]) continue; const p = dep[fac](m, fac); zones[fac] = new Set(m.hexes.filter(h => p(h) && h.terrain !== 'lago').map(h => h.id)); }
  return { units, notes, zones, depText: dep.text, depFirst: firstF };
}

// Colosso (nota C, 19.7)
UNITS['Colosso'] = { id: 'Colosso', name: 'Colosso dormiente', fac: 'N', kind: 'boss', V: 2, F: 8, D: 6, P: 0, R: 6, FM: 0, cost: 0, costs: [0], kw: ['Grande', 'Immune al Morale'], ab: 'Dormiente: non può essere attaccato, non esercita ZdC e blocca il suo esagono. Un Eroe adiacente può risvegliarlo con 5+.' };
