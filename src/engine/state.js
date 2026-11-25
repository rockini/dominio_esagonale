// ============================================================
//  MOTORE: stato della partita, caratteristiche, effetti
// ============================================================
const OTHER = { O: 'C', C: 'O' };
const GRADE_NAME = { B: 'Base', V: 'Veterano', E: 'Elite' };
const STATUS_NAME = { disgregato: 'Disgregato', stanco: 'Stanco', esausto: 'Esausto', vacillante: 'Vacillante', furia: 'In Furia', corrotto: 'Corrotto', dormiente: 'Dormiente' };

class Game {
  constructor(opt) {
    // opt: {scn, seed, map, units, human: 'O'|'C'|null}
    this.scn = opt.scn; this.seed = opt.seed; this.map = opt.map; this.units = opt.units;
    this.human = opt.human === undefined ? 'O' : opt.human;
    this.rng = new RNG((opt.seed * 2654435761) >>> 0);
    this.turn = 1; this.first = opt.scn.first || 'O'; this.active = this.first;
    this.phase = 'deploy'; this.step = 0;     // step di combattimento: 0 magie, 1 tiro, 2 mischia, 3 azioni speciali
    this.pti = 0;                             // indice progressivo dei turni giocatore
    this.gold = { O: (opt.scn.gold && opt.scn.gold.O) ?? 10, C: (opt.scn.gold && opt.scn.gold.C) ?? 10 };
    if (opt.scn.coop) this.gold.C = 0;
    this.pvElim = { O: 0, C: 0 };
    this.eliminated = [];                     // {type, fac, uid, commander}
    this.log = []; this.events = [];
    this.streak = {};                         // contatori "per N turni consecutivi"
    this.flags = { onceAscension: {}, takenPlace: {}, relic: null, blade: null, seals: {}, passed: 0, ritual: false, mutationUsed: {} };
    this.meleeTargets = new Set();
    this.special = new Set();                 // esagoni già bersaglio di Corruzione/Purificazione nel turno
    this.winner = null; this.result = null;
    this.initialChaosValue = 0;
    this.nextUid = Math.max(0, ...this.units.map(u => u.uid)) + 1;
    for (const u of this.units) this.initUnit(u);
    this.initialCost = { O: armyCost(this.units.filter(u => u.fac === 'O')), C: armyCost(this.units.filter(u => u.fac === 'C')) };
    for (const h of this.map.hexes) { h.breaches = h.breaches || 0; h.sacked = h.sacked || 0; h.siege = 0; h.everOwned = h.owner ? { [h.owner]: true } : {}; }
    if (SCN_RULES[this.scn.id] && SCN_RULES[this.scn.id].init) SCN_RULES[this.scn.id].init(this);
  }
  initUnit(u) {
    u.dmg = u.dmg || 0; u.status = u.status || []; u.pe = u.pe || 0; u.mutF = u.mutF || 0; u.mutR = u.mutR || 0;
    u.items = u.items || []; u.effects = u.effects || []; u.corruptCount = u.corruptCount || 0;
    u.fm = this.maxFM(u); this.resetTurnFlags(u);
  }
  resetTurnFlags(u) { u.moved = false; u.mpUsed = 0; u.attacked = false; u.casts = 0; u.advanced = false; u.flew = false; u.acted = false; u.startHex = u.hex; u.dmgPhase = 0; u.moraleMod = null; u.mustTest = false; }
  // ---------------- registro ed eventi per l'interfaccia
  say(text, kind = 'info') { this.log.push({ t: this.turn, fac: this.active, text, kind }); if (this.log.length > 400) this.log.shift(); }
  ev(e) { this.events.push(e); }
  // ---------------- accesso
  U(t) { return UNITS[t.type || t]; }
  hexOf(u) { return u.hex === null || u.hex === undefined ? null : this.map.hexes[u.hex]; }
  alive(u) { return u.hex !== null && u.hex !== undefined && !u.dead && !u.reserve && !u.exited; }
  unitsAt(hid) { return this.units.filter(u => u.hex === hid && this.alive(u)); }
  enemyAt(hid, fac) { return this.units.some(u => u.hex === hid && this.alive(u) && u.fac !== fac && u.fac !== 'N'); }
  blockedAt(hid, fac) { return this.units.some(u => u.hex === hid && this.alive(u) && u.fac !== fac); }
  friends(fac) { return this.units.filter(u => u.fac === fac && this.alive(u)); }
  byUid(id) { return this.units.find(u => u.uid === id); }
  isLeader(u) { const k = this.U(u).kind; return k === 'hero' || k === 'boss' || u.ascended; }
  isBoss(u) { return this.U(u).kind === 'boss'; }
  has(u, k) { return this.U(u).kw.includes(k); }
  ab(u, name) { return (this.U(u).ab || '').includes(name); }
  st(u, s) { return u.status.includes(s); }
  addStatus(u, s) { if (!u.status.includes(s)) u.status.push(s); }
  delStatus(u, s) { u.status = u.status.filter(x => x !== s); }
  setVacillante(u) { this.addStatus(u, 'vacillante'); u.vacUntil = this.pti + (u.fac === this.active ? 2 : 1); }
  item(u, name) { return u.items.find(i => i.name === name); }
  // ---------------- caratteristiche modificate
  maxR(u) { let r = this.U(u).R + (u.grade !== 'B' ? 1 : 0) + u.mutR + (u.ascended ? 1 : 0); if (this.item(u, 'Elmo delle Corna Rotte')) r++; return r; }
  curR(u) { return this.maxR(u) - u.dmg; }
  maxFM(u) {
    let fm = this.U(u).FM;
    if (this.U(u).vet === 'FM' && u.grade !== 'B') fm++;
    for (const it of u.items) { if (it.name === 'Amuleto di Chiarezza' || it.name === 'Amuleto della Fenditura') fm++; if (it.name === 'Cuore della Fenditura') fm += 2; }
    return fm;
  }
  isCaster(u) { return this.maxFM(u) >= 1; }
  effSum(u, k) { let s = 0; for (const e of u.effects) if (e.k === k) s += e.v; return s; }
  gradeBonus(u, stat) {
    const U = this.U(u); let b = 0;
    if (u.grade !== 'B' && U.vet === stat) b++;
    if (u.grade === 'E' && stat === 'D') b++;
    return b;
  }
  stackItemsBonus(u, stat) {
    // oggetti che danno bonus alla pila
    let b = 0; if (!this.alive(u)) return 0;
    for (const o of this.unitsAt(u.hex)) for (const it of o.items) {
      if (stat === 'D' && it.name === 'Stendardo della Disciplina') b++;
      if (stat === 'D' && it.name === 'Pergamena di Barriera (attiva)') b += 3;
      if (stat === 'D' && it.name === "Scudo dell'Ultimo Baluardo") b += 2;
    }
    if (stat === 'F' && u.fac === 'C') {
      for (const o of this.friends('C')) if (o.items.some(i => i.name === 'Totem del Sangue') && this.map.dist(this.hexOf(o), this.hexOf(u)) <= 1) { b++; break; }
    }
    return b;
  }
  F(u) {
    const U = this.U(u); if (U.F === 0) return 0;
    let f = U.F + this.gradeBonus(u, 'F') + u.mutF + this.effSum(u, 'F');
    for (const it of u.items) { if (it.name === 'Spada della Legge' || it.name === 'Lama Mutante' || it.name === 'Elmo delle Corna Rotte') f++; if (it.name === 'Talismano' && it.stat === 'F') f++; if (it.name === 'Lama del Giuramento Spezzato') f += 3; }
    f += this.stackItemsBonus(u, 'F');
    if (this.st(u, 'disgregato')) f--; if (this.st(u, 'stanco')) f--; if (this.st(u, 'esausto')) f -= 2; if (this.st(u, 'vacillante')) f--;
    if (this.st(u, 'corrotto')) f--;
    if (this.st(u, 'furia')) f += u.type === 'Gorath' ? 2 : (u.furiaBonus || 1);
    if (u.type === 'Orchi berseker' && u.dmg > 0) f++;
    const h = this.hexOf(u);
    if (h && h.terrain === 'palude' && !this.has(u, 'Anfibia')) f--;
    return Math.max(1, f);
  }
  D(u) {
    const U = this.U(u);
    let d = U.D + this.gradeBonus(u, 'D') + this.effSum(u, 'D');
    for (const it of u.items) { if (it.name === 'Scudo del Giuramento' || it.name === 'Elmo del Guardiano') d++; if (it.name === 'Corazza di Scaglie Demoniache') d += 2; if (it.name === 'Talismano' && it.stat === 'D') d++; }
    d += this.stackItemsBonus(u, 'D');
    if (this.st(u, 'disgregato')) d--; if (this.st(u, 'stanco')) d--; if (this.st(u, 'esausto')) d -= 2; if (this.st(u, 'furia')) d--;
    if (u.portatore) d++;
    const h = this.hexOf(u);
    if (h) {
      if (u.type === 'Guardie cittadine' && TERRAIN[h.terrain].settlement && h.owner === 'O') d++;
      if ((u.type === 'Guerrieri nanici' || u.type === 'Troll di montagna') && (h.terrain === 'collina' || h.terrain === 'montagna')) d++;
    }
    return Math.max(1, d);
  }
  V(u) {
    const U = this.U(u);
    if (u.effects.some(e => e.k === 'immobile')) return 0;
    let v = U.V + this.gradeBonus(u, 'V') + this.effSum(u, 'V');
    for (const it of u.items) { if (it.name === 'Corazza di Scaglie Demoniache') v--; if (it.name === 'Talismano' && it.stat === 'V') v++; }
    if (this.st(u, 'stanco')) v--; if (this.st(u, 'esausto')) v -= 2;
    if (this.scn.id === '19.2' && u.fac === 'C' && this.has(u, 'Bestia')) v++;
    return Math.max(1, v);
  }
  P(u, fromHex) {
    let p = this.U(u).P; if (p === 0) return 0;
    const h = fromHex || this.hexOf(u);
    if (h && h.terrain === 'collina' && this.has(u, 'Tiratore')) p++;
    if (this.item(u, 'Arco delle Radici Antiche')) p++;
    return p;
  }
  // Valore di Morale (base, senza modificatori di situazione)
  moraleBase(u) { if (this.isBoss(u)) return 6; if (this.isLeader(u)) return 5; return { B: 3, V: 4, E: 5 }[u.grade]; }
  immuneMorale(u) { return this.has(u, 'Immune al Morale') || this.has(u, 'Non-morto') || this.st(u, 'dormiente'); }
  // ---------------- comando
  outOfCommand(u) {
    if (u.fac !== 'O' || this.isLeader(u)) return false;
    const h = this.hexOf(u); if (!h) return false;
    return !this.friends('O').some(l => this.isLeader(l) && this.map.dist(this.hexOf(l), h) <= 4);
  }
  formation(hid) {
    // 9.4: la pila dell'Ordine con 2 Disciplinate (o una Fanteria disciplinata)
    const us = this.unitsAt(hid).filter(u => u.fac === 'O');
    if (!us.length) return false;
    const h = this.map.hexes[hid];
    const gm = this.friends('O').some(l => l.type === 'Gran Maestro dei Cavalieri' && this.map.dist(this.hexOf(l), h) <= 2);
    const ok = us.filter(u => this.has(u, 'Disciplinata') && !this.st(u, 'disgregato') && (gm || !this.outOfCommand(u)));
    if (us.some(u => this.st(u, 'disgregato'))) return false;
    return ok.length >= 2 || ok.some(u => u.type === 'Fanteria disciplinata');
  }
  // ---------------- effetti a durata
  addEffect(u, k, v, dur, src, fac = this.active) {
    // dur: 'nextOwn' (fino al prossimo turno di chi lancia), 'endTG', 'endNextEnemy', 'endOwnNext'
    const e = { k, v, src };
    if (dur === 'nextOwn') e.expPTI = this.pti + (fac === this.active ? 2 : 1);   // all'inizio del prossimo turno di chi lo crea
    else if (dur === 'endTG') e.expTG = this.turn;
    else if (dur === 'endNextEnemy') e.expEndPTI = this.pti + 1;
    else if (dur === 'endOwnNextOf') e.expEndPTI = this.pti + 2;
    else if (typeof dur === 'number') e.expPTI = this.pti + dur;
    u.effects.push(e);
  }
  expireStart() { for (const u of this.units) u.effects = u.effects.filter(e => !(e.expPTI !== undefined && e.expPTI <= this.pti)); }
  expireEndPlayerTurn() {
    for (const u of this.units) {
      u.effects = u.effects.filter(e => !(e.expEndPTI !== undefined && e.expEndPTI <= this.pti));
      if (u.vacUntil !== undefined && u.vacUntil <= this.pti) { this.delStatus(u, 'vacillante'); delete u.vacUntil; }
    }
  }
  expireEndTG() {
    for (const u of this.units) { u.effects = u.effects.filter(e => !(e.expTG !== undefined && e.expTG <= this.turn)); this.delStatus(u, 'furia'); u.furiaBonus = 0; }
    for (const h of this.map.hexes) if (h.ash && h.ash <= this.turn) h.ash = 0;
    for (const u of this.units) if (u.summonUntil !== undefined && u.summonUntil <= this.pti && this.alive(u)) { u.dead = true; u.hex = null; this.say(`${this.U(u).name} evocato svanisce.`); }
  }
  // ---------------- controllo e punti
  settlements(fac) { return this.map.hexes.filter(h => TERRAIN[h.terrain].settlement && (fac === undefined || h.owner === fac)); }
  places(fac) { return this.map.hexes.filter(h => h.feature && (fac === undefined || h.owner === fac)); }
  pvTerritory(fac) { let p = 0; for (const h of this.settlements(fac)) p += TERRAIN[h.terrain].pv; return p; }
  pv(fac) {
    let p = this.pvTerritory(fac) + this.pvElim[fac];
    const r = SCN_RULES[this.scn.id];
    if (r && r.pv) p += r.pv(this, fac);
    return p;
  }
  commander(fac) { return this.units.find(u => u.fac === fac && u.commander); }
  commanderDead(fac) { const c = this.commander(fac); return c ? !!c.dead : false; }
  // ---------------- unità nuove
  spawn(type, fac, hid, extra = {}) {
    const u = mkUnit(type, fac, Object.assign({ hex: hid }, extra));
    u.uid = this.nextUid++;
    this.initUnit(u); u.moved = true; u.attacked = false;
    this.units.push(u);
    return u;
  }
  canStack(hid, us, extra = []) {
    const all = this.unitsAt(hid).concat(us.filter(u => u.hex !== hid)).concat(extra);
    let p = 0, l = 0;
    for (const u of all) { if (this.isLeader(u)) l++; else p += this.has(u, 'Grande') ? 2 : 1; }
    return p <= 4 && l <= 2;
  }
  clone() {
    // copia profonda per le simulazioni dell'IA (la mappa condivide la geometria)
    const g = Object.create(Game.prototype);
    Object.assign(g, this);
    g.units = this.units.map(u => Object.assign({}, u, { status: [...u.status], effects: u.effects.map(e => Object.assign({}, e)), items: u.items.map(i => Object.assign({}, i)) }));
    g.map = Object.create(GameMap.prototype); Object.assign(g.map, this.map);
    g.map.hexes = this.map.hexes.map(h => Object.assign({}, h, { everOwned: Object.assign({}, h.everOwned), feature: h.feature && Object.assign({}, h.feature) }));
    g.eliminated = [...this.eliminated]; g.initialCost = this.initialCost; g.recruitedAt = Object.assign({}, this.recruitedAt); g.builtAt = Object.assign({}, this.builtAt);
    g.gold = Object.assign({}, this.gold); g.pvElim = Object.assign({}, this.pvElim);
    g.rng = new RNG(0); g.rng.s = this.rng.s;
    g.log = []; g.events = []; g.sim = true;
    g.meleeTargets = new Set(this.meleeTargets); g.special = new Set(this.special);
    g.streak = Object.assign({}, this.streak); g.flags = JSON.parse(JSON.stringify(this.flags));
    return g;
  }
}
