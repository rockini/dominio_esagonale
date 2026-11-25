// ============================================================
//  MOTORE: sequenza del turno (cap. 7), economia (cap. 14), luoghi (cap. 12),
//  oggetti (cap. 15), assedi (cap. 16), vittoria (cap. 17)
// ============================================================
const LOOT = {
  city: [{ gold: 2 }, { gold: 3 }, { gold: 4 }, { gold: 5, cons: 1 }, { gold: 6, min: 1 }, { gold: 8, min: 1, cons: 1 }],
  castle: [{ gold: 4 }, { gold: 5, cons: 1 }, { gold: 7, min: 1 }, { gold: 9, min: 1 }, { gold: 11, min: 1, cons: 1 }, { gold: 14, mag: 1 }],
  ruin: [{ trap: 1 }, { gold: 2, cons: 1 }, { gold: 4, min: 1 }, { gold: 6, min: 1 }, { gold: 8, min: 1, cons: 1 }, { gold: 10, mag: 1 }],
  hero: [{ gold: 3 }, { gold: 3 }, { gold: 5, min: 1 }, { gold: 5, min: 1 }, { gold: 7, min: 1, cons: 1 }, { gold: 9, mag: 1 }],
  boss: [{ gold: 8, mag: 1 }, { gold: 8, mag: 1 }, { gold: 12, mag: 1 }, { gold: 12, mag: 1 }, { gold: 16, mag: 1, min: 1 }, { gold: 20, mag: 2 }],
};
const ITEMS = {
  cons: ['Pozione di Guarigione', 'Pergamena di Barriera', 'Runa di Purificazione', 'Fiala di Mutazione', 'Polvere di Terrore', 'Elisir di Velocità'],
  min: { O: ['Spada della Legge', 'Scudo del Giuramento', 'Arco delle Radici Antiche', 'Amuleto di Chiarezza', 'Talismano', '*mag'], C: ['Lama Mutante', 'Elmo delle Corna Rotte', "Arco d'Ossa Corrotte", 'Amuleto della Fenditura', 'Talismano', '*mag'] },
  mag: { O: ['Stendardo della Disciplina', 'Stendardo della Disciplina', 'Elmo del Guardiano', 'Elmo del Guardiano', '*2min', '*2min'], C: ['Totem del Sangue', 'Totem del Sangue', 'Corazza di Scaglie Demoniache', 'Corazza di Scaglie Demoniache', '*2min', '*2min'] },
};
const ITEM_TEXT = {
  'Pozione di Guarigione': 'Recupera 3 R e perde Stanco, Disgregato o Corrotto.', 'Pergamena di Barriera': 'La pila ha +3 D fino al tuo prossimo turno.',
  'Runa di Purificazione': 'L’esagono torna Normale, o un’unità non è più Corrotta.', 'Fiala di Mutazione': '+3 F fino alla fine del TG, poi Test di Mutazione o Corruzione.',
  'Polvere di Terrore': 'Le unità nemiche di un esagono adiacente fanno un Test di Morale.', 'Elisir di Velocità': 'Per un movimento +3 V e ogni esagono costa 1 PM.',
  'Pergamena di Richiamo': 'Compare una Fanteria disciplinata adiacente per due turni.', 'Cuore di Demone Imprigionato': 'Compare un Demone minore adiacente per due turni.',
  'Spada della Legge': '+1 F; Flagello +1', 'Scudo del Giuramento': '+1 D; ignora una Disgregazione per turno', 'Arco delle Radici Antiche': '+1 P; +1 F a distanza in Bosco o Collina',
  'Amuleto di Chiarezza': '+1 FM; immune al Terrore', 'Lama Mutante': '+1 F', 'Elmo delle Corna Rotte': '+1 F e +1 R', "Arco d'Ossa Corrotte": '+1 F a distanza; corrompe il bersaglio',
  'Amuleto della Fenditura': '+1 FM; +1 ai Test di Mutazione', 'Talismano': '+1 a una caratteristica', 'Stendardo della Disciplina': 'La pila ha +1 D e +1 Morale',
  'Elmo del Guardiano': '+1 D', 'Totem del Sangue': 'Unità del Caos nella pila e adiacenti +1 F', 'Corazza di Scaglie Demoniache': '+2 D, –1 V',
  'Lama del Giuramento Spezzato': '+3 F; il FT del difensore è ridotto di 2', 'Reliquia': 'La Reliquia Perduta', 'Sigillo': 'Un Sigillo della Frattura',
};
const CONSUMABLES = new Set([...ITEMS.cons, 'Pergamena di Richiamo', 'Cuore di Demone Imprigionato']);

Object.assign(Game.prototype, {
  // ================= oggetti
  slots(u) { const k = this.U(u).kind; return k === 'boss' ? { perm: 3, cons: 2 } : k === 'hero' || u.ascended ? { perm: 2, cons: 2 } : { perm: 1, cons: 1 }; },
  giveItem(us, name, fac) {
    const kind = CONSUMABLES.has(name) ? 'cons' : 'perm';
    const fits = u => this.alive(u) && u.items.filter(i => (CONSUMABLES.has(i.name) ? 'cons' : 'perm') === kind && !i.special).length < this.slots(u)[kind];
    const ranged = name.startsWith('Arco');
    const pool = us.filter(u => fits(u) && (!ranged || this.has(u, 'Tiratore')));
    pool.sort((a, b) => (this.isLeader(b) - this.isLeader(a)) || (this.U(b).cost - this.U(a).cost));
    if (!pool.length) return null;
    const it = { name }; if (name === 'Talismano') it.stat = this.has(pool[0], 'Tiratore') ? 'F' : 'D';
    pool[0].items.push(it);
    if (['Amuleto di Chiarezza', 'Amuleto della Fenditura'].includes(name)) pool[0].fm++;
    return pool[0];
  },
  rollItem(table, fac) {
    const r = this.rng.d6();
    if (table === 'cons') return [ITEMS.cons[r - 1]];
    let n = ITEMS[table][fac][r - 1];
    if (n === '*mag') return this.rollItem('mag', fac);
    if (n === '*2min') return this.rollItem('min', fac).concat(this.rollItem('min', fac));
    return [n];
  },
  lootItems(res, fac, us) {
    const names = [];
    for (const k of ['cons', 'min', 'mag']) for (let i = 0; i < (res[k] || 0); i++) names.push(...this.rollItem(k, fac));
    const got = [];
    for (const n of names) { const who = this.giveItem(us, n, fac); if (who) got.push(n); }
    return got;
  },
  sacredLoot(us, fac) {
    const r = this.rng.d6();
    let names = r <= 2 ? this.rollItem('cons', fac) : r <= 4 ? this.rollItem('min', fac) : r === 5 ? this.rollItem('mag', fac) : [fac === 'O' ? 'Pergamena di Richiamo' : 'Cuore di Demone Imprigionato'];
    const got = names.filter(n => this.giveItem(us, n, fac));
    if (got.length) this.say(`Il luogo sacro dona: ${got.join(', ')}.`, 'good');
  },
  heroLoot(u, fac) {
    const r = this.rng.d6(); const res = (this.isBoss(u) ? LOOT.boss : LOOT.hero)[r - 1];
    this.gold[fac] += res.gold;
    const near = this.friends(fac).filter(x => this.map.dist(this.hexOf(x), this.map.hexes[u.deadHex]) <= 3);
    const got = this.lootItems(res, fac, near);
    // gli oggetti dell'Eroe passano a chi lo ha eliminato
    for (const it of u.items) if (!it.special) { const w = this.giveItem(near, it.name, fac); if (w) got.push(it.name); }
    this.say(`Bottino dall’Eroe caduto: ${res.gold} Oro${got.length ? ', ' + got.join(', ') : ''}.`, 'good');
  },
  consumables(u) { return u.items.filter(i => CONSUMABLES.has(i.name)); },
  canUseItem(u) { return this.alive(u) && u.fac === this.active && ['recruit', 'move', 'combat'].includes(this.phase); },
  useItem(uid, name, target = {}) {
    const u = this.byUid(uid); if (!this.canUseItem(u)) return { ok: false };
    const it = u.items.find(i => i.name === name); if (!it || !CONSUMABLES.has(name)) return { ok: false };
    const h = this.hexOf(u);
    const free = () => this.map.neighbors(h).find(n => !this.unitsAt(n.id).length && n.terrain !== 'lago' && n.terrain !== 'montagna');
    switch (name) {
      case 'Pozione di Guarigione': u.dmg = Math.max(0, u.dmg - 3); for (const s of ['stanco', 'disgregato', 'corrotto']) if (this.st(u, s)) { this.delStatus(u, s); break; } this.ev({ type: 'heal', uid, hex: u.hex }); break;
      case 'Pergamena di Barriera': for (const x of this.unitsAt(u.hex)) if (x.fac === u.fac) this.addEffect(x, 'D', 3, 'nextOwn', name); break;
      case 'Runa di Purificazione': { const c = this.unitsAt(u.hex).find(x => this.st(x, 'corrotto')); if (c) this.delStatus(c, 'corrotto'); else { h.state = 'normale'; h.plague = false; this.ev({ type: 'hexstate', hex: h.id }); } break; }
      case 'Fiala di Mutazione': this.addEffect(u, 'F', 3, 'endTG', name); if (u.fac === 'C') this.mutation(u); else this.corruptionTest(u); break;
      case 'Polvere di Terrore': { const t = target.hex !== undefined ? target.hex : (this.map.neighbors(h).find(n => this.enemyAt(n.id, u.fac)) || {}).id; if (t === undefined) return { ok: false, why: 'Nessun nemico adiacente.' }; for (const x of this.unitsAt(t)) if (x.fac !== u.fac) this.moraleTest(x, 0, name); break; }
      case 'Elisir di Velocità': if (u.moved) return { ok: false, why: 'L’unità ha già mosso.' }; u.elixir = true; break;
      case 'Pergamena di Richiamo': case 'Cuore di Demone Imprigionato': { const n = free(); if (!n) return { ok: false, why: 'Nessun esagono libero adiacente.' }; const s = this.spawn(name === 'Pergamena di Richiamo' ? 'Fanteria disciplinata' : 'Demoni minori', u.fac, n.id, { summoned: true }); s.summonUntil = this.pti + 4; s.moved = false; this.ev({ type: 'summon', uid: s.uid, hex: n.id }); break; }
    }
    u.items = u.items.filter(i => i !== it);
    this.say(`${this.U(u).name.split(',')[0]} usa ${name}.`, 'magic');
    return { ok: true };
  },
  // ================= reclutamento e costruzioni (14.3-14.6)
  besieged(h) {
    if (!this.isFortified(h) && !TERRAIN[h.terrain].settlement) return false;
    if (!h.owner) return false;
    const zoc = this.zoc(h.owner);
    return this.map.neighbors(h).every(n => this.enemyAt(n.id, h.owner) || (zoc.has(n.id) && !this.unitsAt(n.id).some(x => x.fac === h.owner)));
  },
  recruitSites(fac = this.active) {
    if (this.scn.coop && fac === 'C') return [];
    return this.map.hexes.filter(h => h.owner === fac && h.feature && (TERRAIN[h.terrain].recruit || ['tempio', 'altare', 'fenditura'].includes(h.terrain))
      && !this.map.neighbors(h).some(n => this.enemyAt(n.id, fac)) && !this.besieged(h));
  },
  recruitOptions(hid, fac = this.active) {
    const h = this.map.hexes[hid];
    const used = (this.recruitedAt && this.recruitedAt[hid]) || 0;
    const T = TERRAIN[h.terrain];
    let max = T.recruit || 0;
    let filter = () => true;
    if (h.terrain === 'tempio') { max = fac === 'O' ? 1 : 0; filter = t => UNITS[t].kw.includes('Sacra'); }
    if (h.terrain === 'altare' || h.terrain === 'fenditura') { max = fac === 'C' ? 1 : 0; filter = t => UNITS[t].kw.includes('Demone') || UNITS[t].kw.includes('Mutante'); }
    const vetOK = h.terrain === 'castellomag' || h.terrain === 'capitale';
    const out = [];
    for (const [t, U] of Object.entries(UNITS)) {
      if (U.fac !== fac || U.kind !== 'unit' || !filter(t)) continue;
      for (const g of vetOK ? ['B', 'V'] : ['B']) {
        const c = U.costs[g === 'V' ? 1 : 0]; if (c == null) continue;
        const fake = { type: t, hex: hid, fac };
        const ok = used < max && this.gold[fac] >= c && this.canStack(hid, [], [fake]) && (g === 'B' || this.vetCount(fac) < this.vetLimit(fac));
        out.push({ type: t, grade: g, cost: c, ok });
      }
    }
    return { max, used, list: out };
  },
  recruit(hid, type, grade = 'B') {
    if (this.phase !== 'recruit') return { ok: false, why: 'Si recluta solo nella Fase di Reclutamento.' };
    if (!this.recruitSites().some(h => h.id === hid)) return { ok: false, why: 'Qui non si può reclutare.' };
    const o = this.recruitOptions(hid).list.find(x => x.type === type && x.grade === grade);
    if (!o || !o.ok) return { ok: false, why: 'Reclutamento non possibile.' };
    this.gold[this.active] -= o.cost;
    this.recruitedAt = this.recruitedAt || {}; this.recruitedAt[hid] = (this.recruitedAt[hid] || 0) + 1;
    const u = this.spawn(type, this.active, hid, { grade });
    u.moved = false; u.startHex = hid;
    this.ev({ type: 'recruit', uid: u.uid, hex: hid });
    this.say(`${FACTION_NAME[this.active]} recluta ${type}${grade === 'V' ? ' (Veterano)' : ''} a ${this.hexLabel(hid)}.`);
    return { ok: true, uid: u.uid };
  },
  buildOptions(hid) {
    const h = this.map.hexes[hid], fac = this.active, out = [];
    if (this.phase !== 'recruit' || h.owner !== fac || (this.builtAt && this.builtAt[hid])) return out;
    if (this.map.neighbors(h).some(n => this.enemyAt(n.id, fac))) return out;
    const genio = this.unitsAt(hid).some(u => u.type === 'Ingegneri nanici') ? 2 : 0;
    const c = x => Math.max(0, x - genio);
    if ((h.terrain === 'citta' || h.terrain === 'cittamag') && !h.fortified) out.push({ id: 'fortify', name: 'Fortificare la Città', cost: c(10) });
    if (h.terrain === 'castello') out.push({ id: 'upgrade', name: 'Castello maggiore', cost: c(15) });
    if (h.breaches) out.push({ id: 'repair', name: 'Riparare una Breccia', cost: c(5) });
    if (TERRAIN[h.terrain].settlement) {
      const sides = this.map.neighbors(h).filter(n => { const e = this.map.edge(h, n); return !e || e.type === 'cresta'; });
      if (sides.length) out.push({ id: 'wall', name: 'Mura sul lato più esposto', cost: c(5) });
    }
    if (this.unitsAt(hid).some(u => this.has(u, 'Assedio') && u.fac === fac) && this.map.neighbors(h).some(n => (this.map.edge(h, n) || {}).type === 'fiume')) out.push({ id: 'bridge', name: 'Ponte sul fiume', cost: c(5) });
    return out.map(o => Object.assign(o, { ok: this.gold[fac] >= o.cost }));
  },
  build(hid, id) {
    const o = this.buildOptions(hid).find(x => x.id === id); if (!o || !o.ok) return { ok: false, why: 'Costruzione non possibile.' };
    const h = this.map.hexes[hid], fac = this.active;
    this.gold[fac] -= o.cost; this.builtAt = this.builtAt || {}; this.builtAt[hid] = true;
    if (id === 'fortify') h.fortified = true;
    if (id === 'upgrade') h.terrain = 'castellomag', h.feature.type = 'castellomag';
    if (id === 'repair') h.breaches--;
    if (id === 'wall') {
      const enemyC = this.friends(OTHER[fac]); const cand = this.map.neighbors(h).filter(n => { const e = this.map.edge(h, n); return !e || e.type === 'cresta'; });
      cand.sort((a, b) => Math.min(...enemyC.map(e => this.map.dist(this.hexOf(e), a)), 99) - Math.min(...enemyC.map(e => this.map.dist(this.hexOf(e), b)), 99));
      this.map.setEdge(h, cand[0], { type: 'mura' });
    }
    if (id === 'bridge') { const n = this.map.neighbors(h).find(n => (this.map.edge(h, n) || {}).type === 'fiume'); this.map.setEdge(h, n, { type: 'ponte' }); }
    this.ev({ type: 'build', hex: hid, what: id });
    this.say(`${FACTION_NAME[fac]} costruisce: ${o.name} a ${this.hexLabel(hid)}.`);
    return { ok: true };
  },
  trainOptions() {
    if (this.active !== 'O' || this.phase !== 'recruit') return [];
    return this.friends('O').filter(u => !this.isLeader(u) && u.grade !== 'E' && !u.trained && ['castello', 'castellomag', 'capitale', 'tempio'].includes(this.hexOf(u).terrain) && this.hexOf(u).owner === 'O');
  },
  train(uid) { const u = this.byUid(uid); if (!this.trainOptions().includes(u) || this.gold.O < 2) return { ok: false }; this.gold.O -= 2; u.trained = true; this.addPE(u, 1); this.say(`${this.U(u).name} si addestra (+1 PE).`); return { ok: true }; },
  forcedMutationOptions() {
    if (this.active !== 'C' || this.phase !== 'recruit' || this.flags.mutationUsed[this.pti]) return [];
    return this.friends('C').filter(u => !this.isLeader(u) && u.grade !== 'E');
  },
  forcedMutation(uid) {
    const u = this.byUid(uid); if (!this.forcedMutationOptions().includes(u) || this.gold.C < 2) return { ok: false };
    this.gold.C -= 2; this.flags.mutationUsed[this.pti] = true;
    const r = this.rng.d6(); const name = this.U(u).name;
    if (r === 1) { if (u.grade === 'V') { u.grade = 'B'; this.say(`${name}: degenerazione, torna Base.`, 'bad'); } else { this.say(`${name}: degenerazione (1 danno).`, 'bad'); this.damage(u, 1, 'mutation'); } }
    else if (r === 2) this.say(`${name}: la Mutazione Forzata non ha effetto.`);
    else if (r <= 4) { this.say(`${name}: +2 PE dalla Mutazione Forzata.`); this.addPE(u, 2); }
    else if (r === 5) { this.say(`${name}: +3 PE dalla Mutazione Forzata.`); this.addPE(u, 3); }
    else { this.say(`${name}: la Mutazione Forzata lo fa avanzare!`, 'good'); this.addPE(u, u.grade === 'B' ? 4 : 6); }
    return { ok: true, roll: r };
  },
  // ================= azioni speciali (passo 6 della Fase di Combattimento)
  specialOptions(u) {
    const out = [];
    if (!this.alive(u) || u.fac !== this.active || this.phase !== 'combat' || u.attacked || u.casts || u.acted || u.advanced) return out;
    const h = this.hexOf(u);
    if (u.fac === 'O' && this.has(u, 'Sacra')) {
      for (const t of [h, ...this.map.neighbors(h)]) if (t.state !== 'purificato' && !this.special.has(t.id) && t.terrain !== 'lago') out.push({ id: 'purify', name: 'Purificare', hex: t.id });
      for (const c of this.unitsAt(h.id)) if (this.st(c, 'corrotto')) out.push({ id: 'cleanse', name: 'Purificare ' + this.U(c).name, hex: h.id, uid: c.uid });
    }
    if (u.fac === 'C' && this.isCaster(u)) for (const t of [h, ...this.map.neighbors(h)]) if (t.state !== 'corrotto' && !this.special.has(t.id) && t.terrain !== 'lago') out.push({ id: 'corrupt', name: 'Corrompere', hex: t.id });
    if (h.terrain === 'rovina' && !h.explored && !this.st(u, 'disgregato')) out.push({ id: 'explore', name: 'Esplorare la Rovina', hex: h.id });
    if (this.has(u, 'Assedio')) for (const t of this.map.neighbors(h)) if (this.isFortified(t) && t.owner === OTHER[u.fac] && (t.breaches || 0) < 2 && this.unitsAt(t.id).length) out.push({ id: 'breach', name: 'Aprire una breccia', hex: t.id });
    if (this.isLeader(u)) for (const t of this.map.neighbors(h)) if (this.unitsAt(t.id).some(x => this.st(x, 'dormiente'))) out.push({ id: 'awaken', name: 'Risvegliare il Colosso', hex: t.id });
    return out;
  },
  doSpecial(uid, id, hid, extra = {}) {
    const u = this.byUid(uid);
    const o = this.specialOptions(u).find(x => x.id === id && x.hex === hid && (extra.uid === undefined || x.uid === extra.uid));
    if (!o) return { ok: false, why: 'Azione non disponibile.' };
    this.step = 3; u.acted = true;
    const t = this.map.hexes[hid]; const r = this.rng.d6();
    const near = (types, fac) => this.map.hexes.some(x => types.includes(x.terrain) && x.owner === fac && this.map.dist(x, t) <= 3);
    let ok = false;
    if (id === 'purify' || id === 'cleanse') {
      const m = r + (u.type === 'Inquisitori' ? 1 : 0) + (near(['tempio'], 'O') ? 1 : 0);
      ok = m >= 4;
      if (id === 'purify') { this.special.add(hid); if (ok) { t.state = t.state === 'corrotto' ? 'normale' : 'purificato'; t.plague = t.state === 'corrotto' && t.plague; if (t.state !== 'corrotto') t.plague = false; this.ev({ type: 'hexstate', hex: hid }); } }
      else if (ok) this.delStatus(this.byUid(extra.uid), 'corrotto');
      this.say(`${this.U(u).name.split(',')[0]} purifica (${m}): ${ok ? 'riuscito' : 'fallito'}.`, ok ? 'good' : 'info');
    }
    if (id === 'corrupt') {
      const m = r + (near(['altare', 'fenditura'], 'C') ? 1 : 0);
      ok = m >= 4; this.special.add(hid);
      if (ok) this.corruptHex(t);
      this.say(`${this.U(u).name.split(',')[0]} corrompe (${m}): ${ok ? 'riuscito' : 'fallito'}.`, ok ? 'good' : 'info');
    }
    if (id === 'explore') {
      t.explored = true;
      const rr = SCN_RULES[this.scn.id] && SCN_RULES[this.scn.id].explore ? SCN_RULES[this.scn.id].explore(this, u, t) : null;
      if (!rr) {
        const m = Math.min(6, r + (this.ab(u, 'Esploratore') ? 1 : 0)); const res = LOOT.ruin[m - 1];
        if (res.trap) { this.say('Trappola nella Rovina!', 'bad'); this.damage(u, 1, 'trap'); }
        else { this.gold[u.fac] += res.gold; const got = this.lootItems(res, u.fac, [u]); this.say(`Esplorazione (${m}): ${res.gold} Oro${got.length ? ', ' + got.join(', ') : ''}.`, 'good'); }
      }
      this.ev({ type: 'explore', hex: hid });
      ok = true;
    }
    if (id === 'breach') { ok = r >= 4; if (ok) { t.breaches = (t.breaches || 0) + 1; this.ev({ type: 'build', hex: hid, what: 'breach' }); } this.say(`Tentativo di breccia (${r}): ${ok ? 'aperta!' : 'fallito'}.`, ok ? 'good' : 'info'); }
    if (id === 'awaken') {
      ok = r >= 5;
      if (ok) { const c = this.unitsAt(hid).find(x => this.st(x, 'dormiente')); c.fac = u.fac; this.delStatus(c, 'dormiente'); this.ev({ type: 'status', uid: c.uid, hex: hid, s: 'Risvegliato' }); this.say(`Il Colosso si risveglia e obbedisce a ${FACTION_NAME[u.fac]}!`, 'good'); }
      else this.say(`Il Colosso dorme ancora (${r}).`);
    }
    return { ok: true, success: ok, roll: r };
  },
  corruptHex(h) { if (h.state === 'purificato') h.state = 'normale'; else h.state = 'corrotto'; this.ev({ type: 'hexstate', hex: h.id }); },
  tryCorruptSettlement(h) {
    if (h.state === 'corrotto') return;
    let m = this.rng.d6();
    if (this.unitsAt(h.id).some(u => u.fac === 'C' && this.isCaster(u))) m++;
    if (this.map.hexes.some(x => (x.terrain === 'altare' || x.terrain === 'fenditura') && x.owner === 'C' && this.map.dist(x, h) <= 3)) m++;
    if (m >= 4) { h.state = 'corrotto'; this.ev({ type: 'hexstate', hex: h.id }); this.say(`${h.feature.name} viene Corrotta.`, 'bad'); }
  },
  // ================= sequenza del turno
  start() {
    this.phase = 'maint';
    this.say(`Turno ${this.turn}: inizia ${FACTION_NAME[this.active]}.`, 'turn');
    this.startPlayerTurn();
  },
  startPlayerTurn() {
    const fac = this.active;
    this.pti++;
    this.expireStart();
    this.recruitedAt = {}; this.builtAt = {}; this.special = new Set(); this.meleeTargets = new Set();
    this.step = 0; this.moraleDone = false;
    this.ev({ type: 'turn', fac, turn: this.turn });
    // A. Manutenzione
    const own = this.friends(fac);
    for (const u of this.units) if (u.fac === fac) { this.resetTurnFlags(u); u.trained = false; }
    for (const u of own) u.fm = this.maxFM(u);
    // rendita
    let inc = 0;
    if (!(this.scn.coop && fac === 'C')) {
      for (const h of this.map.hexes) {
        if (h.owner !== fac || !h.feature) continue;
        let g = TERRAIN[h.terrain].gold || 0;
        if (h.terrain === 'tempio' && fac === 'O') g = 1; if ((h.terrain === 'altare' || h.terrain === 'fenditura') && fac === 'C') g = 1;
        if (TERRAIN[h.terrain].settlement) { if (h.sacked) g = Math.floor(g / 2); if (fac === 'O' && h.state === 'corrotto') g = Math.max(0, g - 1); if (this.besieged(h)) g = 0; }
        inc += g;
      }
      if (this.scn.id === '19.10') { const n = Math.floor(own.filter(u => !this.isLeader(u)).length / 5); inc -= n; }
      this.gold[fac] = Math.max(0, this.gold[fac] + inc);
      for (const h of this.map.hexes) if (h.owner === fac && h.sacked) h.sacked--;
    }
    // piaga
    for (const u of own) if (this.hexOf(u).plague) { this.say(`La Piaga colpisce ${this.U(u).name.split(',')[0]}.`, 'bad'); this.damage(u, 1, 'plague'); }
    // cure
    for (const u of this.friends(fac)) {
      const h = this.hexOf(u);
      if (this.ab(u, 'Rigenerazione') && u.dmg) u.dmg--;
      if ((fac === 'O' && h.terrain === 'tempio' && h.owner === 'O') || (fac === 'C' && (h.terrain === 'altare' || h.terrain === 'fenditura') && h.owner === 'C')) if (u.dmg) u.dmg--;
      if (u.type === 'Guaritori') { const w = this.unitsAt(u.hex).filter(x => x.fac === fac && x.dmg).sort((a, b) => b.dmg - a.dmg)[0]; if (w) w.dmg--; }
      if (u.type === 'Re-Sacerdote') for (const x of this.friends(fac)) if (x.dmg && this.map.dist(this.hexOf(x), h) <= 2) x.dmg--;
      if (u.items.some(i => i.name === 'Cuore della Fenditura') && this.rng.d6() <= 2) this.damage(u, 1, 'item');
    }
    // stanchezza, riorganizzazione
    const scorte = this.scn.id === '20.8' && this.turn >= 10 && fac === 'O';
    for (const u of this.friends(fac)) {
      const keyHex = scorte && this.hexOf(u).key;
      if (!keyHex) { if (this.st(u, 'esausto')) { this.delStatus(u, 'esausto'); this.addStatus(u, 'stanco'); } else this.delStatus(u, 'stanco'); }
      if (this.st(u, 'disgregato')) {
        if (this.unitsAt(u.hex).some(o => o !== u && o.fac === fac && this.isLeader(o)) || this.isLeader(u)) this.delStatus(u, 'disgregato');
        else { const v = this.moraleValue(u, 1); const r = this.rng.d6(); if (r !== 6 && r <= v) this.delStatus(u, 'disgregato'); }
      }
      // oggetti della fazione avversaria
      if (fac === 'O' && u.items.some(i => ITEMS.min.C.includes(i.name) || ITEMS.mag.C.includes(i.name))) this.corruptionTest(u);
      if (fac === 'C') u.items = u.items.filter(i => !(ITEMS.min.O.includes(i.name) || ITEMS.mag.O.includes(i.name)) || this.rng.d6() !== 1);
      if (u.waitingAdvance) this.tryAdvance(u);
    }
    // assedi prolungati
    for (const h of this.map.hexes) if (h.owner === fac && this.isFortified(h)) {
      if (this.besieged(h)) { h.siege = (h.siege || 0) + 1; if (h.siege >= 3) for (const u of this.unitsAt(h.id)) if (u.fac === fac) this.addStatus(u, 'stanco'); }
      else h.siege = 0;
    }
    const r = SCN_RULES[this.scn.id]; if (r && r.startTurn) r.startTurn(this, fac);
    if (scorte) for (const h of this.map.hexes.filter(h => h.key)) if (this.unitsAt(h.id).some(u => u.fac === 'O') && this.rng.d6() === 1) { const us = this.unitsAt(h.id).filter(u => u.fac === 'O'); this.say(`Scorte esaurite a ${h.feature.name}: 1 danno.`, 'bad'); this.applyDamage(us, 1); }
    this.say(`${FACTION_NAME[fac]}: Manutenzione (+${inc} Oro, totale ${this.gold[fac]}).`, 'turn');
    this.phase = 'recruit';
  },
  // passa alla fase successiva del giocatore attivo
  nextPhase() {
    if (this.winner) return;
    if (this.phase === 'recruit') { this.phase = 'move'; return; }
    if (this.phase === 'move') { this.phase = 'combat'; this.step = 0; this.startCombat(); return; }
    if (this.phase === 'combat') { if (!this.moraleDone) { this.combatMoraleStep(); this.moraleDone = true; } this.finalPhase(); return; }
  },
  startCombat() {
    for (const u of this.friends(this.active)) {
      if (u.type === 'Campioni mutati') { const r = this.rng.d6(); this.addEffect(u, r <= 2 ? 'F' : r <= 4 ? 'D' : 'V', 1, 'endTG', 'Mutazione instabile'); }
      if (u.type === 'Gorath') { if (u.dmg) u.dmg--; else this.addEffect(u, 'F', 1, 'endTG', 'Mutazione continua'); }
    }
  },
  canFury(u) { return this.alive(u) && u.fac === this.active && this.phase === 'combat' && this.step <= 2 && !this.st(u, 'furia') && !this.st(u, 'disgregato') && (this.ab(u, 'Furia') || u.type === 'Gorath' || u.type === 'Capobanda' || this.friends(u.fac).some(l => l.type === 'Signore del Caos' && this.map.dist(this.hexOf(l), this.hexOf(u)) <= 2)); },
  fury(uid) { const u = this.byUid(uid); if (!this.canFury(u)) return false; this.addStatus(u, 'furia'); this.ev({ type: 'status', uid, hex: u.hex, s: 'In Furia' }); this.say(`${this.U(u).name.split(',')[0]} entra In Furia.`); return true; },
  toSpecialStep() { if (this.phase !== 'combat') return; if (!this.moraleDone) { this.combatMoraleStep(); this.moraleDone = true; } this.step = 3; },
  finalPhase() {
    const fac = this.active;
    this.phase = 'final';
    if (fac === 'C') for (const h of this.settlements('C')) this.tryCorruptSettlement(h);
    for (const u of this.friends('O')) if (this.hexOf(u).state === 'corrotto') this.corruptionTest(u);
    for (const u of this.friends(fac)) if ((this.has(u, 'Demone') || this.has(u, 'Non-morto')) && this.hexOf(u).state === 'purificato' && this.rng.d6() === 1) { this.say(`${this.U(u).name} brucia sul suolo Purificato.`, 'bad'); this.damage(u, 1, 'purified'); }
    // profanazione, consacrazione, sigillatura
    for (const h of this.map.hexes) {
      if (!h.feature) continue;
      const key = 'hold' + h.id + fac;
      let cond = false;
      if (fac === 'C' && h.terrain === 'tempio' && h.owner === 'C') cond = true;
      if (fac === 'O' && (h.terrain === 'altare' || h.terrain === 'fenditura') && h.owner === 'O' && this.unitsAt(h.id).some(u => u.fac === 'O' && this.has(u, 'Sacra'))) cond = true;
      this.streak[key] = cond ? (this.streak[key] || 0) + 1 : 0;
      const need = (fac === 'O' && h.terrain === 'fenditura' && this.unitsAt(h.id).some(u => this.item(u, 'Lama del Giuramento Spezzato'))) ? 1 : 2;
      if (this.streak[key] >= need) {
        this.streak[key] = 0;
        if (h.terrain === 'tempio') { h.terrain = 'altare'; h.feature.type = 'altare'; h.feature.profaned = true; h.state = 'corrotto'; h.feature.name = 'Altare di ' + h.feature.name.replace(/^Tempio (di )?/, ''); this.say(`Il Tempio è profanato: ora è ${h.feature.name}!`, 'bad'); }
        else if (h.terrain === 'altare') { h.terrain = 'tempio'; h.feature.type = 'tempio'; h.state = 'purificato'; this.say(`L’Altare è consacrato: ora è un Tempio dell’Ordine.`, 'good'); }
        else { h.terrain = 'rovina'; h.feature.type = 'rovina'; h.explored = true; h.feature.sealed = true; h.owner = null; h.feature.owner = null; h.state = 'normale'; this.flags.seals[h.id] = true; this.say(`La ${h.feature.name} è Sigillata!`, 'good'); }
        this.ev({ type: 'hexstate', hex: h.id, rebuild: true });
      }
    }
    // stati fissi dei luoghi
    for (const h of this.map.hexes) { if (h.terrain === 'tempio' && h.owner === 'O') h.state = 'purificato'; if ((h.terrain === 'altare' || h.terrain === 'fenditura') && h.owner === 'C') h.state = 'corrotto'; }
    const r = SCN_RULES[this.scn.id]; if (r && r.finalPhase) r.finalPhase(this, fac);
    // Totem del Sangue
    for (const u of this.friends(fac)) if (u.items.some(i => i.name === 'Totem del Sangue')) this.instability(u);
    this.expireEndPlayerTurn();
    this.say(`${FACTION_NAME[fac]} termina il turno.`, 'turn');
    // prossimo giocatore o fine del TG
    if (fac === this.first) { this.active = OTHER[fac]; this.startPlayerTurn(); }
    else this.endTG();
  },
  endTG() {
    this.phase = 'endTG';
    this.expireEndTG();
    this.checkVictory();
    if (this.winner) { this.phase = 'over'; this.ev({ type: 'over', winner: this.winner }); return; }
    this.turn++;
    this.active = this.first;
    this.say(`— Turno di Gioco ${this.turn} —`, 'turn');
    this.startPlayerTurn();
  },
  // ================= vittoria
  hold(key, cond) { this.streak[key] = cond ? (this.streak[key] || 0) + 1 : 0; return this.streak[key]; },
  tiebreak() {
    const sc = f => [this.pv(f), this.settlements(f).filter(h => TERRAIN[h.terrain].castle).length, this.eliminated.filter(e => e.fac === OTHER[f] && UNITS[e.type].kind !== 'unit').length, this.friends(f).filter(u => u.grade === 'E').length, this.gold[f]];
    const a = sc('O'), b = sc('C');
    for (let i = 0; i < a.length; i++) { if (a[i] > b[i]) return 'O'; if (b[i] > a[i]) return 'C'; }
    return 'draw';
  },
  checkVictory() {
    const r = SCN_RULES[this.scn.id] || {};
    let w = r.check ? r.check(this) : null;
    // sconfitta immediata (17.5)
    const lost = f => {
      if (this.scn.coop && f === 'C') return false;
      if (!this.friends(f).length && !this.units.some(u => u.fac === f && u.reserve && !u.dead)) return true;
      const had = this.map.hexes.some(h => h.everOwned && h.everOwned[f] && TERRAIN[h.terrain].settlement);
      return had && !this.settlements(f).length;
    };
    const lO = lost('O'), lC = lost('C');
    if (!w && (lO || lC)) w = lO && lC ? 'draw' : lO ? 'C' : 'O';
    if (!w && this.turn >= this.scn.turns) w = r.final ? r.final(this) : this.tiebreak();
    if (w) {
      this.winner = w;
      this.result = this.whyText || (w === 'draw' ? 'Partita pari.' : `Vince ${FACTION_NAME[w]}.`);
      this.say(this.result, 'turn');
    }
  },
});
