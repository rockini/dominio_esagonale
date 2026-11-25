// ============================================================
//  MOTORE: magia (cap. 11)
//  target: 'self' (portata 0), 'friendHex', 'friendUnit', 'enemyUnit', 'anyHex', 'enemyHex', 'emptyHex', 'hex'
// ============================================================
const SPELLS = {
  O: [
    { name: 'Barriera di Luce', cost: 3, range: 2, target: 'friendHex', reaction: true, text: 'Le unità amiche in un esagono hanno +2 D fino al tuo prossimo turno.' },
    { name: 'Purga del Caos', cost: 4, range: 3, target: 'enemyUnit', filter: 'evil', dmg: true, text: '3 danni a un Demone, Non-morto o Mutante; l’esagono Corrotto torna Normale.' },
    { name: 'Giuramento di Ferro', cost: 3, range: 2, target: 'friendUnit', text: 'Un’unità amica non può diventare Disgregata e supera i Test di Morale.' },
    { name: 'Luce Guaritrice', cost: 2, range: 2, target: 'friendUnit', filter: 'hurt', text: 'Un’unità amica recupera 2 R e perde lo stato Stanco.' },
    { name: 'Sigillo di Immobilità', cost: 4, range: 3, target: 'enemyUnit', text: 'Un’unità nemica ha V 0 nel suo prossimo turno.' },
    { name: 'Aura di Disciplina', cost: 4, range: 0, target: 'self', text: 'Le unità amiche nell’esagono e adiacenti hanno +1 F e +1 D.' },
    { name: 'Colonna di Fuoco', cost: 5, range: 3, target: 'enemyHex', dmg: true, text: '3 danni a un’unità, oppure 1 danno a ogni unità di un esagono.' },
    { name: 'Purificazione del Terreno', cost: 3, range: 2, target: 'hex', filter: 'notPure', text: 'Un esagono diventa Purificato.' },
    { name: 'Scudo di Fede', cost: 2, range: 1, target: 'friendUnit', reaction: true, text: 'Un’unità amica ignora il primo danno che subisce.' },
    { name: "Chiamata all'Ordine", cost: 3, range: 3, target: 'self', text: 'Tutte le unità amiche entro 3 non sono più Disgregate.' },
  ],
  C: [
    { name: 'Vampata Mutante', cost: 4, range: 2, target: 'enemyHex', dmg: true, text: '1 danno a ogni unità di un esagono; Mutazione per il Caos, Corruzione per l’Ordine.' },
    { name: 'Sussurro della Fenditura', cost: 2, range: 3, target: 'enemyUnit', text: 'Un’unità nemica fa un Test di Morale con –1.' },
    { name: 'Piaga Strisciante', cost: 5, range: 2, target: 'hex', filter: 'notPlague', text: 'L’esagono diventa Corrotto con la Piaga: 1 danno a chi vi si trova a ogni Manutenzione.' },
    { name: 'Furia Bestiale', cost: 2, range: 2, target: 'friendUnit', filter: 'canFury', text: 'Un’unità amica entra In Furia con +2 F.' },
    { name: 'Tentacoli della Corruzione', cost: 4, range: 2, target: 'enemyUnit', dmg: true, text: '2 danni e –1 V nel prossimo turno; l’esagono diventa Corrotto.' },
    { name: 'Urlo del Vuoto', cost: 4, range: 0, target: 'self', filter: 'enemyAdj', text: 'Le unità nemiche adiacenti fanno un Test di Morale con –1.' },
    { name: 'Dono Mutante', cost: 3, range: 1, target: 'friendUnit', filter: 'normal', text: 'Un’unità normale amica fa un Test di Mutazione con +1.' },
    { name: 'Pioggia di Cenere Nera', cost: 5, range: 3, target: 'enemyHex', dmg: true, text: '1 danno a ogni unità di un esagono, che blocca la vista fino alla fine del TG.' },
    { name: 'Risveglio Demoniaco', cost: 6, range: 2, target: 'emptyHex', text: 'Compare un Demone minore fino alla fine del tuo prossimo turno.' },
    { name: 'Frattura della Realtà', cost: 6, range: 3, target: 'enemyUnit', dmg: true, text: '4 danni a un’unità; l’esagono diventa Corrotto.' },
  ],
};
const SPELL_BY_NAME = {}; for (const f of ['O', 'C']) for (const s of SPELLS[f]) SPELL_BY_NAME[s.name] = Object.assign({ fac: f }, s);

Object.assign(Game.prototype, {
  spellCost(u, sp) {
    let c = sp.cost;
    if (sp.name === 'Barriera di Luce' && (u.type === 'Seris' || u.type === 'Arcimago del Concilio')) c = 2;
    if (sp.name === 'Colonna di Fuoco' && u.type === 'Maghi elementali') c--;
    if (sp.name === 'Furia Bestiale' && u.type === 'Sciamani') c--;
    if (sp.name === 'Risveglio Demoniaco' && (u.type === 'Zhara' || u.type === 'Demone Maggiore')) c = 4;
    if (!u.moved && this.active === u.fac) c--;           // Concentrazione
    return Math.max(1, c);
  },
  spellRange(u, sp) {
    let r = sp.range;
    if (u.type === 'Veyla' && ['Piaga Strisciante', 'Tentacoli della Corruzione', 'Frattura della Realtà'].includes(sp.name)) r++;
    if (u.type === 'Stregone Supremo del Caos') r++;
    return r;
  },
  maxCasts(u) { return ['Arcimago del Concilio', 'Stregone Supremo del Caos'].includes(u.type) ? 2 : 1; },
  canCast(u) { return this.alive(u) && u.fac === this.active && this.phase === 'combat' && this.step <= 0 && this.isCaster(u) && u.casts < this.maxCasts(u) && !this.st(u, 'dormiente'); },
  spellsFor(u) { return SPELLS[u.fac === 'N' ? 'O' : u.fac].map(sp => ({ sp, cost: this.spellCost(u, sp), ok: u.fm >= this.spellCost(u, sp) && this.spellTargets(u, sp).length > 0 })); },
  spellTargets(u, sp) {
    const h = this.hexOf(u), R = this.spellRange(u, sp), out = [];
    if (sp.target === 'self') {
      if (sp.filter === 'enemyAdj' && !this.map.neighbors(h).some(n => this.enemyAt(n.id, u.fac))) return [];
      if (sp.name === "Chiamata all'Ordine" && !this.friends(u.fac).some(f => this.st(f, 'disgregato') && this.map.dist(this.hexOf(f), h) <= R)) return [];
      return [{ hex: h.id }];
    }
    for (const t of this.map.hexes) {
      const d = this.map.dist(h, t); if (d > R) continue;
      if (d > 1 && !this.lineOfSight(h, t)) continue;
      const us = this.unitsAt(t.id);
      switch (sp.target) {
        case 'friendHex': if (us.some(x => x.fac === u.fac)) out.push({ hex: t.id }); break;
        case 'enemyHex': if (us.some(x => x.fac === OTHER[u.fac])) out.push({ hex: t.id }); break;
        case 'emptyHex': if (!us.length && t.terrain !== 'lago' && t.terrain !== 'montagna') out.push({ hex: t.id }); break;
        case 'hex': if (sp.filter === 'notPure' && t.state === 'purificato') break; if (sp.filter === 'notPlague' && t.plague) break; if (t.terrain === 'lago') break; out.push({ hex: t.id }); break;
        case 'friendUnit': for (const x of us) if (x.fac === u.fac && this.spellFilter(sp, x)) out.push({ hex: t.id, uid: x.uid }); break;
        case 'enemyUnit': for (const x of us) if (x.fac === OTHER[u.fac] && this.spellFilter(sp, x)) out.push({ hex: t.id, uid: x.uid }); break;
      }
    }
    return out;
  },
  spellFilter(sp, x) {
    if (sp.filter === 'evil') return this.has(x, 'Demone') || this.has(x, 'Non-morto') || this.has(x, 'Mutante');
    if (sp.filter === 'hurt') return x.dmg > 0 || this.st(x, 'stanco');
    if (sp.filter === 'canFury') return !this.st(x, 'disgregato') && !this.st(x, 'furia');
    if (sp.filter === 'normal') return !this.isLeader(x);
    return true;
  },
  castRoll(u, sp, targetHex) {
    let mod = 0; const h = this.hexOf(u); const why = [];
    const M = (v, t) => { mod += v; why.push((v > 0 ? '+' : '') + v + ' ' + t); };
    if (u.fac === 'O' && this.map.hexes.some(t => t.terrain === 'tempio' && t.owner === 'O' && this.map.dist(t, h) <= 3)) M(1, 'Tempio');
    if (u.fac === 'C' && this.map.hexes.some(t => (t.terrain === 'altare' || t.terrain === 'fenditura') && t.owner === 'C' && this.map.dist(t, h) <= 3)) M(1, 'Altare/Fenditura');
    if ((u.fac === 'C' && h.state === 'corrotto') || (u.fac === 'O' && h.state === 'purificato')) M(1, 'terreno favorevole');
    if ((u.fac === 'O' && h.state === 'corrotto') || (u.fac === 'C' && h.state === 'purificato')) M(-1, 'terreno ostile');
    if (this.st(u, 'disgregato') || this.st(u, 'stanco') || this.st(u, 'esausto')) M(-1, 'stato');
    if (sp.dmg && targetHex && this.isFortified(targetHex)) M(-1, 'fortificazione');
    if (this.isBoss(u)) M(1, 'Boss');
    if (u.fac === 'O' && targetHex && this.unitsAt(targetHex.id).some(x => this.item(x, 'Corazza di Scaglie Demoniache'))) M(-1, 'Corazza');
    return { mod, why };
  },
  // Lancia una magia. target: {hex, uid}; opt.mode per Colonna di Fuoco ('unit'|'hex')
  cast(uid, name, target, opt = {}) {
    const u = this.byUid(uid), sp = SPELL_BY_NAME[name];
    if (!u || !sp || sp.fac !== u.fac || !this.canCast(u)) return { ok: false, why: 'Questo incantatore non può lanciare ora.' };
    const cost = this.spellCost(u, sp);
    if (u.fm < cost) return { ok: false, why: 'Fattore Magico insufficiente.' };
    const tg = this.spellTargets(u, sp).find(t => t.hex === target.hex && (target.uid === undefined || t.uid === target.uid));
    if (!tg) return { ok: false, why: 'Bersaglio non valido.' };
    u.fm -= cost; u.casts++; this.step = Math.max(this.step, 0);
    return this.resolveSpell(u, sp, tg, opt, false);
  },
  resolveSpell(u, sp, tg, opt, reaction) {
    const th = this.map.hexes[tg.hex];
    // Controincantesimo di Seris
    const seris = this.friends(OTHER[u.fac]).find(s => s.type === 'Seris' && this.map.dist(this.hexOf(s), this.hexOf(u)) <= 3 && s.counterTG !== this.turn);
    if (seris && (sp.dmg || sp.name === 'Sigillo di Immobilità' || sp.name === 'Risveglio Demoniaco')) {
      const c = Math.ceil(sp.cost / 2);
      if (seris.fm >= c) {
        seris.fm -= c; seris.counterTG = this.turn;
        const r = this.rng.d6();
        this.say(`Seris tenta un Controincantesimo (${r}).`);
        if (r >= 4) { this.ev({ type: 'spell', name: sp.name, from: u.hex, hex: tg.hex, fac: u.fac, fail: true }); this.say(`${sp.name} è annullata!`, 'good'); return { ok: true, countered: true }; }
      }
    }
    const { mod, why } = this.castRoll(u, sp, th);
    const nat = this.rng.d6(), tot = nat + mod;
    let level; // 0 fallimento, 1 successo, 2 potenziato, 3 trionfo, -1 catastrofe
    if (u.fac === 'O') level = tot <= 1 ? 0 : tot <= 5 ? 1 : 2;
    else level = tot <= 2 ? (nat === 1 ? -1 : 0) : tot <= 4 ? 1 : (nat === 6 && tot >= 6 ? 3 : 2);
    const bonus = level === 2 ? 1 : level === 3 ? 2 : 0;
    const lname = { '-1': 'Catastrofe', 0: 'Fallimento', 1: 'Successo', 2: 'Successo potenziato', 3: 'Trionfo' }[level];
    this.ev({ type: 'spell', name: sp.name, from: u.hex, hex: tg.hex, fac: u.fac, fail: level <= 0, roll: nat, tot, level: lname });
    this.say(`${this.U(u).name.split(',')[0]} lancia ${sp.name}${reaction ? ' (Reazione)' : ''}: ${nat}${mod ? (mod > 0 ? '+' : '') + mod : ''} = ${lname}.`, 'magic');
    if (level === -1) { this.damage(u, 1, 'backlash'); return { ok: true, level: lname }; }
    if (level === 0) return { ok: true, level: lname };
    const tu = tg.uid !== undefined ? this.byUid(tg.uid) : null;
    const dur = bonus && !sp.dmg ? 'nextOwn+' : 'nextOwn';
    const addDur = (x, k, v, d = 'nextOwn') => { this.addEffect(x, k, v, d, sp.name, u.fac); if (bonus && d === 'nextOwn' && !sp.dmg && !['D', 'F'].includes(k)) { const e = x.effects[x.effects.length - 1]; e.expPTI += 2; } };
    const orderSpellOn = x => { if (u.fac === 'O' && x.fac === 'C') this.instability(x); };
    switch (sp.name) {
      case 'Barriera di Luce': for (const x of this.unitsAt(tg.hex)) if (x.fac === u.fac) addDur(x, 'D', (u.type === 'Seris' ? 3 : 2) + bonus); break;
      case 'Purga del Caos': this.damage(tu, 3 + bonus, 'spell'); if (th.state === 'corrotto') { th.state = 'normale'; this.ev({ type: 'hexstate', hex: th.id }); } if (tu && this.alive(tu)) orderSpellOn(tu); break;
      case 'Giuramento di Ferro': addDur(tu, 'iron', 1); addDur(tu, 'noDisrupt', 1); break;
      case 'Luce Guaritrice': tu.dmg = Math.max(0, tu.dmg - (u.type === 'Theron' ? 3 : 2) - bonus); this.delStatus(tu, 'stanco'); this.ev({ type: 'heal', uid: tu.uid, hex: tu.hex }); break;
      case 'Sigillo di Immobilità': this.addEffect(tu, 'immobile', 1, 'endNextEnemy', sp.name); if (bonus) tu.effects[tu.effects.length - 1].expEndPTI += 2; orderSpellOn(tu); break;
      case 'Aura di Disciplina': for (const x of this.friends(u.fac)) if (this.map.dist(this.hexOf(x), th) <= 1) { addDur(x, 'F', 1 + bonus); addDur(x, 'D', 1 + bonus); } break;
      case 'Colonna di Fuoco': {
        const enemies = this.unitsAt(tg.hex).filter(x => x.fac !== u.fac);
        if (opt.mode === 'unit' || (opt.mode !== 'hex' && enemies.length === 1)) { const v = tu || enemies.sort((a, b) => (this.isLeader(b) - this.isLeader(a)) || (this.U(b).cost - this.U(a).cost))[0]; this.damage(v, 3 + bonus, 'spell'); if (this.alive(v)) orderSpellOn(v); }
        else for (const x of enemies) { this.damage(x, 1 + bonus, 'spell'); if (this.alive(x)) orderSpellOn(x); }
        break;
      }
      case 'Purificazione del Terreno': th.state = 'purificato'; th.plague = false; this.ev({ type: 'hexstate', hex: th.id }); break;
      case 'Scudo di Fede': addDur(tu, 'shieldFirst', 1 + bonus); break;
      case "Chiamata all'Ordine": for (const x of this.friends(u.fac)) if (this.map.dist(this.hexOf(x), th) <= this.spellRange(u, sp) && this.st(x, 'disgregato')) { this.delStatus(x, 'disgregato'); this.ev({ type: 'status', uid: x.uid, hex: x.hex, s: 'Riorganizzata' }); } break;
      case 'Vampata Mutante': for (const x of this.unitsAt(tg.hex)) { this.damage(x, 1 + bonus, 'spell'); if (!this.alive(x)) continue; if (x.fac === 'C') this.mutation(x); else this.corruptionTest(x); } break;
      case 'Sussurro della Fenditura': if (!(tu.type === 'Seris') && !this.item(tu, 'Amuleto di Chiarezza')) this.moraleTest(tu, -1 - bonus, sp.name); break;
      case 'Piaga Strisciante': th.state = 'corrotto'; th.plague = true; this.ev({ type: 'hexstate', hex: th.id }); break;
      case 'Furia Bestiale': this.addStatus(tu, 'furia'); tu.furiaBonus = 2 + bonus; break;
      case 'Tentacoli della Corruzione': this.damage(tu, 2 + bonus, 'spell'); if (this.alive(tu)) this.addEffect(tu, 'V', -1, 'endNextEnemy', sp.name); th.state = 'corrotto'; this.ev({ type: 'hexstate', hex: th.id }); break;
      case 'Urlo del Vuoto': for (const n of this.map.neighbors(this.hexOf(u))) for (const x of this.unitsAt(n.id)) if (x.fac === OTHER[u.fac] && x.type !== 'Seris' && !this.item(x, 'Amuleto di Chiarezza')) this.moraleTest(x, -1 - bonus, sp.name); break;
      case 'Dono Mutante': this.mutation(tu, 1 + bonus); break;
      case 'Pioggia di Cenere Nera': for (const x of this.unitsAt(tg.hex)) this.damage(x, 1 + bonus, 'spell'); th.ash = this.turn; break;
      case 'Risveglio Demoniaco': {
        const d = this.spawn('Demoni minori', u.fac, tg.hex, { summoned: true });
        d.summonUntil = this.pti + (u.type === 'Zhara' ? 4 : 2) + (bonus ? 2 : 0);
        if (u.type === 'Zhara') this.addEffect(d, 'F', 1, 99, 'Legame oscuro');
        d.moved = false; d.attacked = false;
        this.ev({ type: 'summon', uid: d.uid, hex: tg.hex });
        break;
      }
      case 'Frattura della Realtà': this.damage(tu, 4 + bonus, 'spell'); th.state = 'corrotto'; this.ev({ type: 'hexstate', hex: th.id }); for (const x of this.unitsAt(th.id)) if (x.fac === 'C' && x.grade !== 'B') this.instability(x); break;
    }
    return { ok: true, level: lname };
  },
  // Magie di Reazione dell'Ordine (11.5): risolte automaticamente quando una pila amica è bersaglio
  reactions(hid, attackers) {
    const defs = this.unitsAt(hid); if (!defs.length) return;
    const fac = defs[0].fac; if (fac !== 'O' || this.active === 'O') return;
    const t = this.map.hexes[hid];
    const casters = this.friends('O').filter(c => this.isCaster(c) && !this.st(c, 'dormiente'));
    const threat = attackers.reduce((s, a) => s + this.F(a), 0) / Math.max(1, defs.reduce((s, d) => s + this.D(d), 0));
    for (const c of casters) {
      const d = this.map.dist(this.hexOf(c), t);
      const bar = SPELL_BY_NAME['Barriera di Luce'], sh = SPELL_BY_NAME['Scudo di Fede'];
      const costB = (c.type === 'Seris' || c.type === 'Arcimago del Concilio' ? 2 : 3) + 1;
      if (d <= 2 && c.fm >= costB && (threat >= 1.2 || defs.some(x => this.isLeader(x))) && !defs.some(x => x.effects.some(e => e.src === 'Barriera di Luce'))) {
        c.fm -= costB; this.resolveSpell(c, bar, { hex: hid }, {}, true); return;
      }
      if (d <= 1 && c.fm >= 3) {
        const v = defs.filter(x => !x.effects.some(e => e.k === 'shieldFirst')).sort((a, b) => (this.isLeader(b) - this.isLeader(a)) || (this.U(b).cost - this.U(a).cost))[0];
        if (v) { c.fm -= 3; this.resolveSpell(c, sh, { hex: hid, uid: v.uid }, {}, true); return; }
      }
    }
  },
  // Abilità attivabili degli Eroi (una volta per turno)
  heroAbilities(u) {
    const out = [];
    if (!this.alive(u) || u.fac !== this.active || this.phase !== 'combat') return out;
    if (u.type === 'Veyla' && u.whisperPTI !== this.pti) {
      const t = this.units.filter(x => this.alive(x) && x.fac === OTHER[u.fac] && this.map.dist(this.hexOf(x), this.hexOf(u)) <= 2);
      if (t.length) out.push({ id: 'sussurri', name: 'Sussurri del vuoto', text: 'Un’unità nemica entro 2 fa un Test di Morale con –1.', targets: t.map(x => ({ hex: x.hex, uid: x.uid })) });
    }
    if (u.type === 'Veyla' && u.pactPTI !== this.pti && this.curR(u) > 1) out.push({ id: 'patto', name: 'Patto oscuro', text: 'Perde 1 R per avere +2 FM in questo turno.', targets: [{ hex: u.hex }] });
    if (u.type === 'Zhara' && u.sacrPTI !== this.pti) {
      const t = this.friends('C').filter(x => !this.isLeader(x) && this.U(x).cost >= 2 && this.map.dist(this.hexOf(x), this.hexOf(u)) <= 1);
      if (t.length) out.push({ id: 'sacrificio', name: 'Sacrificio del sangue', text: 'Elimina un’unità amica vicina per +2 FM (o 2 R se ferita).', targets: t.map(x => ({ hex: x.hex, uid: x.uid })) });
    }
    return out;
  },
  useHeroAbility(uid, id, target) {
    const u = this.byUid(uid);
    const ab = this.heroAbilities(u).find(a => a.id === id); if (!ab) return { ok: false };
    if (id === 'sussurri') { u.whisperPTI = this.pti; const t = this.byUid(target.uid); this.ev({ type: 'spell', name: 'Sussurro della Fenditura', from: u.hex, hex: t.hex, fac: u.fac }); this.moraleTest(t, -1, 'Sussurri del vuoto'); }
    if (id === 'patto') { u.pactPTI = this.pti; this.damage(u, 1, 'pact'); u.fm += 2; this.say('Veyla stringe un Patto oscuro: +2 FM.', 'magic'); }
    if (id === 'sacrificio') { u.sacrPTI = this.pti; const t = this.byUid(target.uid); this.eliminate(t, 'sacrifice'); if (u.dmg >= 2) u.dmg -= 2; else u.fm += 2; this.say('Zhara compie un Sacrificio del sangue.', 'magic'); }
    return { ok: true };
  },
});
