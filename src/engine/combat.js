// ============================================================
//  MOTORE: combattimento (cap. 9), morale (cap. 10), esperienza (cap. 13)
// ============================================================
const MELEE_COLS = ['1:3', '1:2', '1:1', '3:2', '2:1', '3:1', '4:1'];
const MELEE_TABLE = [
  ['AE', 'AE', 'AE', 'AR', 'EX', 'DR', 'DE'],
  ['AE', 'AE', 'AR', 'EX', 'DR', 'DE', 'DE'],
  ['AE', 'AR', 'EX', 'DR', 'DE', 'DE', 'DE*'],
  ['AR', 'AR', 'DR', 'DE', 'DE', 'DE*', 'DE**'],
  ['AR', 'EX', 'DE', 'DE', 'DE*', 'DE**', 'DE**'],
  ['DR', 'DR', 'DE', 'DE*', 'DE**', 'DE**', 'DE***'],
];
const RANGED_COLS = ['1–2', '3–4', '5–7', '8–11', '12–15', '16–20', '21+'];
const RANGED_TABLE = [
  ['—', '—', '1D', '1D', '2D', '1E', '2E'],
  ['—', '1D', '1D', '2D', '1E', '2E', '3E'],
  ['—', '1D', '2D', '1E', '2E', '3E', '3E'],
  ['1D', '1D', '1E', '2E', '3E', '3E', '4E'],
  ['1D', '2D', '2E', '3E', '3E', '4E', '5E'],
  ['1D', '1E', '2E', '3E', '4E', '5E', '6E'],
];
const RESULT_TEXT = {
  AE: 'Attaccanti eliminati: 2 danni, ritirata e Disgregati', AR: 'Attaccanti respinti: 1 danno e ritirata', EX: 'Scambio: 1 danno a ciascuno',
  DR: 'Difensori respinti: 1 danno e ritirata', DE: 'Difensori eliminati: 2 danni, ritirata e Disgregati',
};
function meleeColumn(r) { return r < 0.5 ? 0 : r < 1 ? 1 : r < 1.5 ? 2 : r < 2 ? 3 : r < 3 ? 4 : r < 4 ? 5 : 6; }
function rangedColumn(ft) { return ft <= 2 ? 0 : ft <= 4 ? 1 : ft <= 7 ? 2 : ft <= 11 ? 3 : ft <= 15 ? 4 : ft <= 20 ? 5 : 6; }

Object.assign(Game.prototype, {
  // ---------------- chi può attaccare
  canAttack(u) { return this.alive(u) && u.fac === this.active && this.phase === 'combat' && !u.attacked && !u.advanced && !this.st(u, 'disgregato') && this.F(u) > 0 && this.U(u).F > 0 && !this.st(u, 'dormiente') && u.type !== 'Guaritori'; },
  isFortified(h) { return TERRAIN[h.terrain].castle || h.fortified; },
  terrainShift(h, kind, attackers, defenders) {
    let v = kind === 'melee' ? TERRAIN[h.terrain].melee || 0 : TERRAIN[h.terrain].ranged || 0;
    if (h.fortified && TERRAIN[h.terrain].settlement && !TERRAIN[h.terrain].castle) v = -2;
    if (h.terrain === 'bosco' && kind === 'melee' && attackers.some(u => this.has(u, 'Cavalleria') || this.has(u, 'Bestia'))) v = -2;
    if (h.terrain === 'tempio') v = defenders.length && defenders[0].fac === 'O' ? -1 : 0;
    if (h.terrain === 'altare' || h.terrain === 'fenditura') v = defenders.length && defenders[0].fac === 'C' ? -1 : 0;
    if (this.isFortified(h) && h.breaches) v = Math.min(-1, v + h.breaches);
    return v;
  },
  // ---------------- mischia
  meleeCandidates(hid) {
    const t = this.map.hexes[hid];
    return this.friends(this.active).filter(u => this.canAttack(u) && this.map.dist(this.hexOf(u), t) === 1);
  },
  canBeMeleed(hid) {
    const d = this.unitsAt(hid);
    return d.length && d.every(u => u.fac === OTHER[this.active]) && !this.meleeTargets.has(hid);
  },
  meleePreview(attackers, hid) {
    const t = this.map.hexes[hid];
    const defs = this.unitsAt(hid);
    const shifts = [];
    const S = (label, v) => { if (v) shifts.push({ label, v }); };
    const defFac = defs[0] ? defs[0].fac : OTHER[this.active];
    const hasCavA = attackers.some(u => this.has(u, 'Cavalleria') || this.has(u, 'Bestia'));
    const defHasCav = defs.some(u => this.has(u, 'Cavalleria') || this.has(u, 'Bestia'));
    const evilDef = defs.some(u => this.has(u, 'Demone') || this.has(u, 'Non-morto') || this.has(u, 'Mutante'));
    // FT attaccante
    let ftA = 0; const fParts = [];
    for (const u of attackers) {
      let f = this.F(u);
      const fromH = this.hexOf(u);
      const charge = this.ab(u, 'Carica') || this.U(u).ab.includes('Carica') || u.type === 'Gran Maestro dei Cavalieri';
      const startAdj = u.startHex !== null && u.startHex !== undefined && this.map.dist(this.map.hexes[u.startHex], t) <= 1;
      const chargeTerrain = t.terrain === 'pianura' || t.terrain === 'deserto' || (u.type === 'Cavalieri grifoni' && u.flew && (t.terrain === 'collina' || t.terrain === 'bosco'));
      if (charge && chargeTerrain && !startAdj && !defs.some(d => d.type === 'Picchieri')) f++;
      if (this.ab(u, 'Anti-cavalleria') && defHasCav) f++;
      const fl = (this.U(u).ab.match(/Flagello \+(\d)/) || [])[1]; if (fl && evilDef) f += +fl;
      if (this.item(u, 'Spada della Legge') && evilDef) f++;
      ftA += f; fParts.push(f);
    }
    // FT difensore
    let ftD = 0; for (const d of defs) ftD += this.D(d);
    if (attackers.some(u => this.item(u, 'Lama del Giuramento Spezzato'))) ftD -= 2;
    ftD = Math.max(1, ftD);
    const ratio = ftA / ftD;
    const col0 = meleeColumn(ratio);
    // spostamenti
    S('Terreno: ' + TERRAIN[t.terrain].name, this.terrainShift(t, 'melee', attackers, defs));
    // lati attraversati: si applica il malus più piccolo
    let side = -Infinity, sideName = '';
    for (const u of attackers) {
      const a = this.hexOf(u), e = this.map.edge(a, t);
      let v = 0;
      if (e) { if (e.type === 'fiume') v = -2; else if (e.type === 'guado' || e.type === 'ponte' || e.type === 'mura') v = -1; else if (e.type === 'cresta' && e.high === t.id) v = -1; }
      if (v > side) { side = v; sideName = e ? EDGE_TYPES[e.type] : ''; }
    }
    if (side < 0) S('Lato: ' + sideName, side);
    // comando
    const cmdA = Math.max(0, ...attackers.map(u => this.isBoss(u) ? 2 : this.isLeader(u) ? 1 : 0));
    S('Comando (attacco)', cmdA);
    let cmdD = Math.max(0, ...defs.map(u => this.isBoss(u) ? 2 : this.isLeader(u) ? 1 : 0));
    if (cmdD && defs.some(u => u.type === 'Kael') && TERRAIN[t.terrain].settlement) cmdD++;
    S('Comando (difesa)', -cmdD);
    if (defFac === 'O' && this.formation(hid)) S('Formazione', -1);
    if (this.active === 'C' && attackers.filter(u => this.has(u, 'Orda')).length >= 3) S('Orda', 1);
    if (new Set(attackers.map(u => u.hex)).size >= 3) S('Accerchiamento', 1);
    if (t.state === 'corrotto') S('Esagono Corrotto', this.active === 'C' ? 1 : -1);
    if (t.state === 'purificato') S('Esagono Purificato', this.active === 'O' ? 1 : -1);
    if (hasCavA && defs.some(u => this.ab(u, 'Anti-cavalleria'))) S('Anti-cavalleria', -1);
    if (attackers.some(u => this.has(u, 'Volante')) && defs.some(u => this.ab(u, 'Anti-volo'))) S('Anti-volo', -1);
    if (attackers.some(u => this.ab(u, 'Imboscata') && this.hexOf(u).terrain === 'bosco')) S('Imboscata', 1);
    if (t.terrain === 'bosco' && defs.some(u => this.ab(u, 'Difensori del bosco'))) S('Difensori del bosco', -1);
    if (this.isFortified(t) && attackers.some(u => this.has(u, 'Assedio'))) S('Assedio', 1);
    let tot = shifts.reduce((s, x) => s + x.v, 0);
    tot = Math.max(-3, Math.min(3, tot));
    const col = Math.max(0, Math.min(6, col0 + tot));
    // probabilità dei risultati
    const probs = {}; for (let r = 0; r < 6; r++) { const k = MELEE_TABLE[r][col]; probs[k] = (probs[k] || 0) + 1 / 6; }
    return { ftA, ftD, ratio, col0, shifts, tot, col, colName: MELEE_COLS[col], probs, attackers, defs, hex: hid };
  },
  melee(uids, hid, opt = {}) {
    const attackers = uids.map(id => this.byUid(id)).filter(u => this.canAttack(u) && this.map.dist(this.hexOf(u), this.map.hexes[hid]) === 1);
    if (!attackers.length) return { ok: false, why: 'Nessun attaccante valido.' };
    if (!this.canBeMeleed(hid)) return { ok: false, why: 'Questo esagono non può essere attaccato in mischia.' };
    this.reactions(hid, attackers);
    if (!this.unitsAt(hid).length) { for (const u of attackers) u.attacked = true; return { ok: true, empty: true, canAdvance: attackers.filter(u => !this.st(u, 'disgregato')).map(u => u.uid) }; }
    const pv = this.meleePreview(attackers, hid);
    this.step = Math.max(this.step, 2);
    this.meleeTargets.add(hid);
    for (const u of attackers) u.attacked = true;
    const roll = opt.roll || this.rng.d6();
    const res = MELEE_TABLE[roll - 1][pv.col];
    const defs = pv.defs;
    const fromHexes = [...new Set(attackers.map(u => u.hex))];
    this.ev({ type: 'melee', from: fromHexes, hex: hid, roll, res, col: pv.colName, fac: this.active });
    this.say(`Mischia contro ${this.hexLabel(hid)}: ${pv.ftA}:${pv.ftD} → colonna ${pv.colName}, dado ${roll} → ${res}.`, 'combat');
    const base = res.replace(/\*/g, ''), stars = (res.match(/\*/g) || []).length;
    const out = { ok: true, roll, res, preview: pv, canAdvance: [] };
    const killedBefore = new Set(this.units.filter(u => u.dead).map(u => u.uid));
    let dA = 0, dD = 0;
    if (base === 'AE') dA = 2; if (base === 'AR') dA = 1; if (base === 'EX') { dA = 1; dD = 1; }
    if (base === 'DR') dD = 1; if (base === 'DE') dD = 2;
    if (stars === 1) dD += 1; if (stars === 2) dD += 1; if (stars === 3) dD += 2;
    // danni
    if (dA) this.applyDamage(attackers, dA, { side: 'A', src: 'melee' });
    if (dD) this.applyDamage(defs, dD, { side: 'D', src: 'melee' });
    // stati
    if (base === 'AE') for (const u of attackers) if (this.alive(u)) this.disrupt(u);
    if (base === 'DE') for (const u of defs) if (this.alive(u)) this.disrupt(u);
    if (stars === 2) for (const u of defs) if (this.alive(u)) { u.mustTest = true; u.moraleMod = (u.moraleMod || 0) - 1; u.starHit = true; }
    // ritirate
    const enemiesOfDef = attackers.filter(u => this.alive(u)), enemiesOfAtt = defs.filter(u => this.alive(u));
    if (base === 'AE' || base === 'AR') this.retreatGroup(attackers.filter(u => this.alive(u)), 1, enemiesOfAtt.length ? enemiesOfAtt : defs);
    if (base === 'DR' || base === 'DE') this.retreatGroup(defs.filter(u => this.alive(u)), stars === 3 ? 2 : 1, enemiesOfDef.length ? enemiesOfDef : attackers);
    // esperienza
    const killed = this.units.filter(u => u.dead && !killedBefore.has(u.uid));
    this.gainXP(attackers, defs, killed, { melee: true, hid });
    // Massacro / Travolgere
    if (base.startsWith('DE') || base === 'DE') {
      const ab = attackers.find(u => u.type === 'Abomini' && this.alive(u));
      if (ab) { const adj = this.map.neighbors(this.hexOf(ab)).flatMap(n => this.unitsAt(n.id)).filter(x => x.fac !== ab.fac && x.hex !== hid && x.fac !== 'N'); if (adj.length) { const v = adj.sort((a, b) => this.curR(a) - this.curR(b))[0]; this.applyDamage([v], 1, { side: 'D', src: 'travolgere' }); this.say('Gli Abomini travolgono un’unità vicina.'); } }
    }
    if (!this.unitsAt(hid).length) {
      out.canAdvance = attackers.filter(u => this.alive(u) && !this.st(u, 'disgregato')).map(u => u.uid);
      const k = attackers.find(u => u.type === 'Korgash' && this.alive(u) && !u.massacreUsed);
      if (k) { k.massacreUsed = true; k.attacked = false; k.massacre = true; this.say('Korgash, Massacro: può attaccare di nuovo da solo.'); }
    }
    out.text = RESULT_TEXT[base] + (stars ? ` (${'*'.repeat(stars)})` : '');
    return out;
  },
  advance(uids, hid) {
    const us = uids.map(id => this.byUid(id)).filter(u => this.alive(u) && !this.st(u, 'disgregato'));
    const h = this.map.hexes[hid];
    if (this.unitsAt(hid).length) return false;
    const ok = us.filter(u => this.canEnterTerrain(u, h) && isFinite(this.sideCost(u, this.hexOf(u), h)));
    const go = [];
    for (const u of ok) if (this.canStack(hid, go.concat([u]))) go.push(u);
    if (!go.length) return false;
    for (const u of go) { this.ev({ type: 'move', uids: [u.uid], path: [u.hex, hid], fac: u.fac, fast: true }); u.hex = hid; u.advanced = true; u.attacked = true; }
    this.say(`${go.length} unità avanzano in ${this.hexLabel(hid)}.`);
    this.afterArrive(go, hid);
    return true;
  },
  // ---------------- tiro a distanza
  lineOfSight(a, b, shooter) {
    if (this.map.dist(a, b) <= 1) return true;
    const N = Math.ceil(this.map.dist(a, b) * 6);
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), px = -dy / L * 0.8, py = dx / L * 0.8;
    const blocks = h => h && h !== a && h !== b && (TERRAIN[h.terrain].los || h.ash) && !(h.terrain === 'bosco' && shooter && shooter.every(u => this.ab(u, 'Vista silvana')));
    for (let i = 1; i < N; i++) {
      const t = i / N, x = a.x + dx * t, y = a.y + dy * t;
      const h1 = this.map.hexAtPoint(x + px, y + py), h2 = this.map.hexAtPoint(x - px, y - py);
      if (h1 === h2) { if (blocks(h1)) return false; }
      else if (blocks(h1) && blocks(h2)) return false;
    }
    return true;
  },
  canShoot(u) { return this.canAttack(u) && (this.has(u, 'Tiratore') || this.ab(u, 'Soffio')) && this.P(u) > 0; },
  rangedCandidates(hid) {
    const t = this.map.hexes[hid];
    return this.friends(this.active).filter(u => this.canShoot(u) && this.map.dist(this.hexOf(u), t) <= this.P(u) && this.lineOfSight(this.hexOf(u), t, [u]));
  },
  rangedPreview(shooters, hid) {
    const t = this.map.hexes[hid], defs = this.unitsAt(hid);
    let ft = 0; for (const u of shooters) { let f = this.F(u); if (this.item(u, "Arco d'Ossa Corrotte")) f++; if (this.item(u, 'Arco delle Radici Antiche') && ['bosco', 'collina'].includes(this.hexOf(u).terrain)) f++; if (u.type === 'Lyria' && !u.oathUsed && defs.some(d => d.fac === 'C')) f += 2; ft += f; }
    const shifts = []; const S = (l, v) => { if (v) shifts.push({ label: l, v }); };
    let terr = this.terrainShift(t, 'ranged', shooters, defs);
    if (t.terrain === 'bosco' && shooters.every(u => this.ab(u, 'Vista silvana'))) terr = 0;
    S('Terreno: ' + TERRAIN[t.terrain].name, terr);
    const maxD = Math.max(0, ...defs.map(d => this.D(d)));
    if (!shooters.some(u => this.ab(u, 'Perforante'))) S('Difesa alta', maxD >= 6 ? -2 : maxD >= 4 ? -1 : 0);
    if (defs.some(d => this.ab(d, 'Copertura'))) S('Copertura', -1);
    if (defs.some(d => this.ab(d, 'Sciame'))) S('Sciame', -1);
    if (shooters.some(u => this.ab(u, 'Imboscata') && this.hexOf(u).terrain === 'bosco')) S('Imboscata', 1);
    if (shooters.some(u => this.ab(u, 'Anti-volo')) && defs.some(d => this.has(d, 'Volante'))) S('Anti-volo', 1);
    let tot = shifts.reduce((s, x) => s + x.v, 0);
    if (shooters.length === 1 && shooters[0].type === 'Lyria' && tot < 0) tot++;
    tot = Math.max(-3, Math.min(3, tot));
    const col0 = rangedColumn(ft), col = Math.max(0, Math.min(6, col0 + tot));
    const probs = {}; for (let r = 0; r < 6; r++) { const k = RANGED_TABLE[r][col]; probs[k] = (probs[k] || 0) + 1 / 6; }
    return { ft, col0, shifts, tot, col, colName: RANGED_COLS[col], probs, defs, hex: hid };
  },
  ranged(uids, hid, opt = {}) {
    const t = this.map.hexes[hid];
    const shooters = uids.map(id => this.byUid(id)).filter(u => this.canShoot(u) && this.map.dist(this.hexOf(u), t) <= this.P(u) && this.lineOfSight(this.hexOf(u), t, [u]));
    const defs0 = this.unitsAt(hid);
    if (!shooters.length || !defs0.length || defs0[0].fac === this.active) return { ok: false, why: 'Tiro non valido.' };
    if (this.step > 1) return { ok: false, why: 'I tiri vanno risolti prima della mischia.' };
    this.reactions(hid, shooters);
    const pv = this.rangedPreview(shooters, hid);
    this.step = Math.max(this.step, 1);
    for (const u of shooters) { u.attacked = true; if (u.type === 'Lyria' && pv.defs.some(d => d.fac === 'C')) u.oathUsed = true; }
    const roll = opt.roll || this.rng.d6();
    const res = RANGED_TABLE[roll - 1][pv.col];
    this.ev({ type: 'ranged', from: [...new Set(shooters.map(u => u.hex))], hex: hid, roll, res, col: pv.colName, fac: this.active });
    this.say(`Tiro su ${this.hexLabel(hid)}: FT ${pv.ft} → colonna ${pv.colName}, dado ${roll} → ${res}.`, 'combat');
    const killedBefore = new Set(this.units.filter(u => u.dead).map(u => u.uid));
    const defs = pv.defs;
    if (res !== '—') {
      const n = +res[0];
      if (res[1] === 'E') this.applyDamage(defs, n, { side: 'D', src: 'ranged' });
      else {
        // nD: n unità diverse Disgregate, il resto in danni
        const order = defs.filter(u => !this.isLeader(u)).sort((a, b) => (this.st(a, 'disgregato') - this.st(b, 'disgregato')) || (this.U(a).cost - this.U(b).cost)).concat(defs.filter(u => this.isLeader(u)));
        let k = 0; for (const u of order) { if (k >= n) break; this.disrupt(u); k++; }
        if (n > defs.length) this.applyDamage(defs, n - defs.length, { side: 'D', src: 'ranged' });
      }
      if (shooters.some(u => this.item(u, "Arco d'Ossa Corrotte")) && res[1] === 'E') this.corruptHex(t);
    }
    const killed = this.units.filter(u => u.dead && !killedBefore.has(u.uid));
    this.gainXP(shooters, defs, killed, { melee: false });
    return { ok: true, roll, res, preview: pv };
  },
  // ---------------- danni e stati
  // Assegna i danni come farebbe il proprietario: prima le unità di costo più basso, gli Eroi per ultimi
  applyDamage(us, n, opt = {}) {
    const alive = us.filter(u => this.alive(u));
    if (!alive.length || n <= 0) return 0;
    let dealt = 0;
    // assorbimenti
    for (const u of alive) {
      const shield = u.effects.find(e => e.k === 'shieldFirst');
      if (shield && n > 0) { u.effects = u.effects.filter(e => e !== shield); n--; this.say(`${this.U(u).name.split(',')[0]}: lo Scudo di Fede assorbe un danno.`); }
    }
    const theron = this.friends(alive[0].fac).find(t => t.type === 'Theron' && this.map.dist(this.hexOf(t), this.hexOf(alive[0])) <= 1);
    for (let i = 0; i < n; i++) {
      const cand = alive.filter(u => this.alive(u));
      if (!cand.length) break;
      let pool = cand.filter(u => !this.isLeader(u));
      if (!pool.length) pool = cand;
      pool.sort((a, b) => (this.U(a).cost - this.U(b).cost) || (this.curR(a) - this.curR(b)));
      let v = pool[0];
      if (v.type === 'Korgash' && v.scarTG !== this.pti) { v.scarTG = this.pti; this.say('Korgash ignora il primo danno (Pelle cicatrizzata).'); continue; }
      // Giuramento di protezione di Theron: fino a 2 danni una volta per TG
      if (theron && theron !== v && this.alive(theron) && !this.isLeader(v) && this.curR(v) <= 1 && this.curR(theron) > 2) {
        if (theron.oathTG !== this.turn) { theron.oathTG = this.turn; theron.oathLeft = 2; }
        if (theron.oathLeft > 0) { theron.oathLeft--; v = theron; }
      }
      this.damage(v, 1, opt.src);
      dealt++;
    }
    // Pericolo per l'Eroe
    if (dealt >= 2) for (const u of alive) if (this.alive(u) && this.isLeader(u) && this.rng.d6() === 1) { this.say(`${this.U(u).name.split(',')[0]} è ferito nella mischia (Pericolo per l'Eroe).`, 'bad'); this.damage(u, 1, 'danger'); }
    return dealt;
  },
  damage(u, n, src) {
    if (!this.alive(u)) return;
    u.dmg += n; u.dmgPhase = (u.dmgPhase || 0) + n;
    this.ev({ type: 'damage', uid: u.uid, hex: u.hex, n });
    if (this.curR(u) <= 0) {
      if (u.type === 'Kael' && !u.lastStand) { u.lastStand = true; u.dmg = this.maxR(u) - 1; this.disrupt(u); this.say('Kael, Ultimo baluardo: resta in piedi con 1 R.', 'good'); return; }
      this.eliminate(u, src);
    } else if (this.phase === 'combat' && u.dmgPhase >= Math.ceil(this.maxR(u) / 2)) u.mustTest = true;
  },
  eliminate(u, src) {
    const h = u.hex;
    this.ev({ type: 'death', uid: u.uid, hex: h, fac: u.fac, type2: u.type });
    this.say(`${this.U(u).name.split(',')[0]} ${u.fac === 'O' ? 'dell’Ordine' : u.fac === 'C' ? 'del Caos' : ''} è eliminato.`, 'death');
    u.dead = true; u.deadHex = h; u.hex = null;
    this.eliminated.push({ uid: u.uid, type: u.type, fac: u.fac, commander: u.commander, turn: this.turn });
    if (this.isLeader(u)) {
      const enemy = OTHER[u.fac] || this.active;
      if (u.fac !== 'N') this.pvElim[enemy] += u.commander ? 5 : this.isBoss(u) ? 5 : 2;
      // Test di Morale per chi aveva l'Eroe entro 2
      for (const f of this.friends(u.fac)) if (this.map.dist(this.hexOf(f), this.map.hexes[h]) <= 2) { f.mustTest = true; f.leaderLost = true; }
      if (u.fac !== 'N' && enemy) this.heroLoot(u, enemy);
    }
    const r = SCN_RULES[this.scn.id]; if (r && r.death) r.death(this, u, h);
  },
  disrupt(u) {
    if (!this.alive(u)) return;
    if (u.effects.some(e => e.k === 'noDisrupt') || this.unitsAt(u.hex).some(o => this.item(o, "Scudo dell'Ultimo Baluardo"))) return;
    const sh = this.item(u, 'Scudo del Giuramento');
    if (sh && sh.usedPTI !== this.pti) { sh.usedPTI = this.pti; return; }
    if (this.st(u, 'disgregato')) { this.damage(u, 1, 'disrupt'); return; }
    this.addStatus(u, 'disgregato'); this.delStatus(u, 'furia');
    this.ev({ type: 'status', uid: u.uid, hex: u.hex, s: 'Disgregato' });
    if (u.fac === 'C' && u.grade !== 'B' && !this.isLeader(u)) this.instability(u);
  },
  // ---------------- ritirata (9.8)
  retreatGroup(us, n, enemies) {
    for (const u of us) this.retreat(u, n, enemies);
  },
  retreat(u, n, enemies, missingDamage = true) {
    if (!this.alive(u)) return;
    const enemyHexes = enemies.filter(e => e.hex !== null || e.deadHex !== undefined).map(e => this.map.hexes[e.hex ?? e.deadHex]).filter(Boolean);
    const zoc = this.zoc(u.fac);
    let cur = this.hexOf(u); const path = [cur.id];
    let steps = 0, extra = 0;
    const minD = h => Math.min(...enemyHexes.map(e => this.map.dist(e, h)));
    while (steps < n + extra && extra < 3) {
      const opts = this.map.neighbors(cur).filter(h => !this.blockedAt(h.id, u.fac) && this.canEnterTerrain(u, h) && isFinite(this.sideCost(u, cur, h)) && minD(h) > minD(cur) && !path.includes(h.id));
      if (!opts.length) break;
      const free = opts.filter(h => !zoc.has(h.id));
      const pool = free.length ? free : opts;
      const own = h => (u.fac === 'O' ? -h.c : h.c);
      pool.sort((a, b) => (this.canStack(b.id, [u]) - this.canStack(a.id, [u])) || (minD(b) - minD(a)) || (own(b) - own(a)) || ((TERRAIN[a.terrain].cost || 9) - (TERRAIN[b.terrain].cost || 9)));
      const nx = pool[0];
      cur = nx; path.push(nx.id); steps++;
      if (!free.length) { u.hex = nx.id; this.damage(u, 1, 'retreat'); if (!this.alive(u)) break; }
      if (steps >= n + extra && !this.canStack(cur.id, [u])) extra++;
    }
    if (!this.alive(u)) return;
    const missing = Math.max(0, n - steps);
    u.hex = cur.id;
    if (path.length > 1) { this.ev({ type: 'move', uids: [u.uid], path, fac: u.fac, fast: true, retreat: true }); this.afterArrive([u], cur.id); }
    if (missing && missingDamage) { this.say(`${this.U(u).name.split(',')[0]} non può ritirarsi: ${missing} danno.`, 'bad'); this.damage(u, missing, 'retreat'); }
  },
  // ---------------- morale (cap. 10)
  moraleValue(u, extra = 0) {
    let m = this.moraleBase(u) + extra;
    const h = this.hexOf(u); if (!h) return m;
    let cmd = 0;
    for (const l of this.friends(u.fac)) {
      if (!this.isLeader(l) || l === u) continue;
      const d = this.map.dist(this.hexOf(l), h);
      if (this.isBoss(l) && d <= 2) cmd = Math.max(cmd, 2);
      else if (d === 0 || (l.type === 'Kael' && d <= 2)) cmd = Math.max(cmd, 1);
    }
    m += cmd;
    if (u.fac === 'O' && this.formation(u.hex)) m++;
    if (this.st(u, 'furia')) m++;
    if (TERRAIN[h.terrain].settlement && h.owner === u.fac) m++;
    if (this.unitsAt(u.hex).some(o => this.item(o, 'Stendardo della Disciplina') || o.type === 'Paladini') && u.fac === 'O') m++;
    if (this.st(u, 'disgregato')) m--;
    if (u.dmg >= Math.ceil(this.maxR(u) * 0.75)) m--;
    if (!this.item(u, 'Amuleto di Chiarezza') && !u.portatore) {
      const terror = this.units.some(e => this.alive(e) && e.fac !== u.fac && e.fac !== 'N' && (this.ab(e, 'Terrore') || ['Gorath', 'Korgash', 'Demone Maggiore', 'Drago Antico'].includes(e.type)) && this.map.dist(this.hexOf(e), h) <= (e.type === 'Drago Antico' ? 2 : 1));
      if (terror) m--;
    }
    if ((u.fac === 'O' && h.state === 'corrotto') || (u.fac === 'C' && h.state === 'purificato')) m--;
    if (this.st(u, 'corrotto')) m--;
    if (u.leaderLost) m -= 2;
    if (u.moraleMod) m += u.moraleMod;
    if (this.scn.id === '20.8' && u.fac === 'C' && SR.lostCost(this, 'C') >= this.initialCost.C / 2) m--;
    return m;
  },
  moraleTest(u, mod = 0, cause = '') {
    if (!this.alive(u) || this.immuneMorale(u)) return true;
    if (u.effects.some(e => e.k === 'iron')) return true;
    const v = this.moraleValue(u, mod);
    const r = this.rng.d6();
    const ok = r !== 6 && r <= v;
    this.ev({ type: 'morale', uid: u.uid, hex: u.hex, ok, roll: r, v });
    if (ok) { this.say(`${this.U(u).name.split(',')[0]} supera il Test di Morale (${r} su ${v})${cause ? ' – ' + cause : ''}.`); return true; }
    const rr = this.rng.d6();
    let res = rr;
    if (res === 1 && (this.isLeader(u) || this.unitsAt(u.hex).some(o => o !== u && this.isLeader(o) && o.fac === u.fac))) res = 2;
    const name = this.U(u).name.split(',')[0];
    const enemies = this.units.filter(e => this.alive(e) && e.fac !== u.fac && e.fac !== 'N').sort((a, b) => this.map.dist(this.hexOf(a), this.hexOf(u)) - this.map.dist(this.hexOf(b), this.hexOf(u))).slice(0, 1);
    switch (res) {
      case 1: this.say(`${name} fallisce il Morale (${r}/${v}) e si sbanda: eliminato.`, 'bad'); this.eliminate(u, 'rout'); break;
      case 2: this.say(`${name} fallisce il Morale (${r}/${v}): Rotta.`, 'bad'); this.retreat(u, 2, enemies); this.disrupt(u); break;
      case 3: this.say(`${name} fallisce il Morale (${r}/${v}): Fuga.`, 'bad'); this.retreat(u, 1, enemies); this.disrupt(u); break;
      case 4: this.say(`${name} fallisce il Morale (${r}/${v}): Disgregato.`, 'bad'); this.disrupt(u); break;
      case 5: this.say(`${name} fallisce il Morale (${r}/${v}): Vacillante.`, 'bad'); this.setVacillante(u); break;
      default: this.say(`${name} fallisce il Morale (${r}/${v}) ma tiene.`);
    }
    return false;
  },
  combatMoraleStep() {
    for (const u of this.units) {
      if (!this.alive(u) || !u.mustTest) continue;
      this.moraleTest(u, 0, u.starHit ? 'colpo devastante' : u.leaderLost ? 'Eroe caduto' : 'perdite');
    }
    for (const u of this.units) { u.mustTest = false; u.moraleMod = null; u.leaderLost = false; u.starHit = false; u.dmgPhase = 0; }
  },
  // ---------------- esperienza (13.1)
  gainXP(attackers, defenders, killed, opt) {
    const award = (side, enemiesKilled, survived) => {
      const leaderPresent = side.some(u => this.isLeader(u) && u.fac === 'O');
      for (const u of side) {
        if (!this.alive(u) || this.isLeader(u)) continue;
        let pe = 0;
        if (opt.melee && survived) pe += 1;
        for (const k of enemiesKilled) { if (this.isLeader(k) || k.grade === 'E') pe += 3; else pe += this.U(k).cost <= this.U(u).cost ? 1 : 2; }
        if (opt.melee && side === defenders && TERRAIN[this.map.hexes[opt.hid].terrain].settlement && u.hex === opt.hid) pe += 1;
        if (pe && leaderPresent && u.fac === 'O') pe += 1;
        if (pe) this.addPE(u, pe);
      }
    };
    award(attackers, killed.filter(k => k.fac !== this.active), true);
    award(defenders, killed.filter(k => k.fac === this.active), true);
  },
  vetLimit(fac) { return Math.max(2, this.settlements(fac).length * 2); },
  vetCount(fac) { return this.friends(fac).filter(u => !this.isLeader(u) && u.grade !== 'B').length; },
  addPE(u, n) {
    if (u.grade === 'V' && this.U(u).costs[2] == null) return;
    u.pe += n;
    this.tryAdvance(u);
  },
  tryAdvance(u) {
    if (u.grade === 'E') return;
    const need = u.grade === 'B' ? 4 : 6;
    if (u.pe < need) return;
    if (u.grade === 'V' && this.U(u).costs[2] == null) { u.pe = 0; return; }
    if (this.vetCount(u.fac) >= this.vetLimit(u.fac)) { u.pe = need; u.waitingAdvance = true; return; }
    u.grade = u.grade === 'B' ? 'V' : 'E'; u.pe = 0; u.waitingAdvance = false;
    if (this.U(u).vet === 'FM') u.fm++;
    this.ev({ type: 'promote', uid: u.uid, hex: u.hex, grade: u.grade });
    this.say(`${this.U(u).name} diventa ${GRADE_NAME[u.grade]}!`, 'good');
  },
  instability(u) {
    if (u.fac !== 'C' || u.grade === 'B' || this.isLeader(u)) return;
    const r = this.rng.d6();
    if (r === 1) { u.grade = u.grade === 'E' ? 'V' : 'B'; u.pe = 0; if (u.dmg >= this.maxR(u)) u.dmg = this.maxR(u) - 1; this.say(`${this.U(u).name}: Instabilità, perde un grado.`, 'bad'); }
    else if (r === 6) this.addPE(u, 1);
  },
  mutation(u, mod = 0) {
    if (u.fac !== 'C' || !this.alive(u)) return;
    const r = Math.min(6, this.rng.d6() + mod + (u.items.some(i => i.name === 'Amuleto della Fenditura') ? 1 : 0));
    const name = this.U(u).name.split(',')[0];
    if (r === 1) { this.say(`${name}: la mutazione ferisce (1 danno).`, 'bad'); this.damage(u, 1, 'mutation'); }
    else if (r >= 4 && u.mutF < 2) { u.mutF++; if (r === 6) { u.mutR++; u.dmg = Math.max(0, u.dmg - 1); } this.say(`${name} muta: +1 F${r === 6 ? ' e +1 R' : ''}.`, 'good'); this.ev({ type: 'status', uid: u.uid, hex: u.hex, s: 'Mutazione' }); }
    else this.say(`${name}: la mutazione non ha effetto (${r}).`);
  },
  corruptionTest(u) {
    if (u.fac !== 'O' || !this.alive(u)) return;
    if (['Sacerdoti', 'Paladini', 'Campioni della Legge', 'Inquisitori'].includes(u.type) || this.U(u).ab.includes('immuni al Test di Corruzione')) return;
    if (this.friends('O').some(t => t.type === 'Theron' && this.map.dist(this.hexOf(t), this.hexOf(u)) <= 1)) return;
    if (this.rng.d6() === 1) {
      u.corruptCount++;
      if (u.corruptCount >= 2) { this.say(`${this.U(u).name.split(',')[0]} cede alla Corruzione e diserta!`, 'bad'); this.eliminate(u, 'corruption'); }
      else { this.addStatus(u, 'corrotto'); this.say(`${this.U(u).name.split(',')[0]} diventa Corrotto.`, 'bad'); this.ev({ type: 'status', uid: u.uid, hex: u.hex, s: 'Corrotto' }); }
    }
  },
  hexLabel(hid) { const h = this.map.hexes[hid]; return h.feature ? h.feature.name : String(h.c + 1).padStart(2, '0') + String(h.r + 1).padStart(2, '0'); },
});
