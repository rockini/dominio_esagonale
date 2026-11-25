// ============================================================
//  REGOLE SPECIALI DEGLI SCENARI e condizioni di vittoria
// ============================================================
const SR = {
  hex: (g, n) => g.map.byName(n),
  owner: (g, n) => (g.map.byName(n) || {}).owner,
  win(g, fac, why) { g.whyText = why; return fac; },
  pvWin(g, why) { const w = g.tiebreak(); g.whyText = (why ? why + ' ' : '') + (w === 'draw' ? 'Parità perfetta.' : g.pv('O') === g.pv('C') ? `Punti Vittoria pari (${g.pv('O')} a ${g.pv('C')}): vince ${FACTION_NAME[w]} allo spareggio.` : `Più Punti Vittoria: vince ${FACTION_NAME[w]} (Ordine ${g.pv('O')}, Caos ${g.pv('C')}).`); return w; },
  decap(g) {
    const o = g.commanderDead('C'), c = g.commanderDead('O');
    if (o && c) return SR.pvWin(g, 'Entrambi i Comandanti sono caduti.');
    if (o) return SR.win(g, 'O', 'Il Comandante del Caos è caduto: vince l’Ordine.');
    if (c) return SR.win(g, 'C', 'Il Comandante dell’Ordine è caduto: vince il Caos.');
    return null;
  },
  lostCost(g, fac) { return g.eliminated.filter(e => e.fac === fac && !(g.byUid(e.uid) || {}).summoned).reduce((s, e) => s + (UNITS[e.type].cost || 0), 0); },
  heroesAlive(g, fac) { return g.friends(fac).filter(u => UNITS[u.type].kind === 'hero').length; },
  // Rinforzi: unità Base gratuite piazzate nei siti indicati (i punti in eccesso si perdono)
  reinforce(g, fac, pts, sites, label) {
    const list = buildArmy(fac, pts, { heroes: 0 }, g.rng, new Set());
    let placed = 0;
    for (const u of list) {
      const site = sites.find(h => h && !g.enemyAt(h.id, fac) && g.canStack(h.id, [], [Object.assign({}, u, { hex: h.id })]));
      if (!site) continue;
      const nu = g.spawn(u.type, fac, site.id); nu.moved = false; placed++;
      g.ev({ type: 'recruit', uid: nu.uid, hex: site.id });
    }
    g.say(`${label || 'Rinforzi'}: ${placed} unità per ${FACTION_NAME[fac]}.`, 'turn');
  },
  edgeHexes(g, side) { const m = g.map; return m.hexes.filter(h => side === 'W' ? h.c === 0 : side === 'E' ? h.c === m.W - 1 : side === 'N' ? h.r === 0 : h.r === m.H - 1).filter(h => h.terrain !== 'lago'); },
  band(t) { return t <= 4 ? ['Goblin', 'Orchi guerrieri'] : t <= 8 ? ['Orchi guerrieri', 'Orchi guerrieri', 'Orchi berseker'] : t <= 12 ? ['Troll', 'Orchi guerrieri', 'Orchi guerrieri'] : ['Guerrieri del Caos', 'Troll', 'Demoni minori']; },
  // Generazione del Caos automatico (20.2): nell'esagono e poi negli adiacenti liberi più vicini
  generate(g, h, types) {
    let n = 0;
    for (const t of types) {
      const cands = [h, ...g.map.neighbors(h), ...g.map.within(h, 2)].filter(x => x.terrain !== 'lago' && !g.enemyAt(x.id, 'C'));
      const site = cands.find(x => g.canStack(x.id, [], [{ type: t, fac: 'C', hex: x.id }]) && !(UNITS[t].kw.includes('Cavalleria') && x.terrain === 'montagna'));
      if (!site) continue;
      const u = g.spawn(t, 'C', site.id); u.moved = false; n++;
      g.ev({ type: 'recruit', uid: u.uid, hex: site.id });
    }
    return n;
  },
  carry(g, name) { return g.units.find(u => g.alive(u) && u.items.some(i => i.name === name)); },
  drop(g, u, name, hid) { if (u.items.some(i => i.name === name)) { u.items = u.items.filter(i => i.name !== name); (g.flags.dropped = g.flags.dropped || {})[name] = (g.flags.dropped[name] || []).concat([hid]); g.say(`${name} cade a terra in ${g.hexLabel(hid)}.`); } },
  pick(g, us, h, name, who) {
    const d = g.flags.dropped && g.flags.dropped[name]; if (!d || !d.includes(h.id)) return;
    const u = us.find(x => !who || who(x)); if (!u) return;
    d.splice(d.indexOf(h.id), 1);
    u.items.push({ name, special: true });
    g.say(`${UNITS[u.type].name.split(',')[0]} raccoglie: ${name}.`, 'good');
  },
};

const SCN_RULES = {
  '18.1': {
    check(g) {
      if (g.hold('pietraC', SR.owner(g, 'Pietraluce') === 'C') >= 2) return SR.win(g, 'C', 'Il Caos tiene Pietraluce per due turni.');
      const o = g.commanderDead('C') && g.settlements('O').length >= 3, c = g.commanderDead('O') && g.settlements('C').length >= 3;
      if (o && c) return SR.pvWin(g); if (o) return SR.win(g, 'O', 'Gorath è caduto e l’Ordine tiene 3 insediamenti.'); if (c) return SR.win(g, 'C', 'Kael è caduto e il Caos tiene 3 insediamenti.');
      return null;
    },
    final(g) { if (SR.owner(g, 'Pietraluce') === 'O') return SR.win(g, 'O', 'L’Ordine tiene Pietraluce fino alla fine.'); return SR.pvWin(g); },
  },
  '18.2': {
    pv(g, f) {
      let p = 0;
      for (const h of g.map.hexes) {
        if (h.owner !== f || !h.feature) continue;
        if (f === 'O' && h.terrain === 'tempio') p += 3;
        if (f === 'C' && h.terrain === 'altare' && h.feature.profaned) p += 4;
        if (f === 'C' && h.terrain === 'fenditura') p += 1;
        if (f === 'C' && TERRAIN[h.terrain].settlement && h.state === 'corrotto') p += 1;
      }
      return p;
    },
    check(g) {
      const alt = g.map.hexes.find(h => h.feature && h.feature.profaned);
      if (g.hold('altare', alt && alt.owner === 'C') >= 2) return SR.win(g, 'C', 'Il Caos tiene l’Altare profanato per due turni.');
      if (!SR.heroesAlive(g, 'C') && !g.settlements().some(h => h.state === 'corrotto')) return SR.win(g, 'O', 'Gli Eroi del Caos sono caduti e nessuna Città è Corrotta.');
      const o = g.pv('O') >= 15, c = g.pv('C') >= 15;
      if (o || c) return o && c ? SR.pvWin(g) : SR.win(g, o ? 'O' : 'C', `Soglia di 15 PV raggiunta da ${o ? 'l’Ordine' : 'il Caos'}.`);
      return null;
    },
  },
  '18.3': {
    startTurn(g, fac) {
      if (![4, 8, 12, 16].includes(g.turn)) return;
      if (fac === 'O') SR.reinforce(g, 'O', 25, g.map.hexes.filter(h => h.owner === 'O' && ['capitale', 'castello', 'castellomag'].includes(h.terrain)), 'Rinforzi a Luminara');
      else { const s = g.map.hexes.filter(h => h.owner === 'C' && ['fenditura', 'altare'].includes(h.terrain)); SR.reinforce(g, 'C', 30, s.length ? s.flatMap(h => [h, ...g.map.neighbors(h)]) : SR.edgeHexes(g, 'E'), 'Rinforzi del Caos'); }
    },
    finalPhase(g, fac) {
      if (fac !== 'C') return;
      const L = SR.hex(g, 'Luminara');
      const places = g.map.hexes.filter(h => h.owner === 'C' && ['altare', 'fenditura'].includes(h.terrain)).length;
      const casters = g.friends('C').filter(u => g.isCaster(u) && g.map.dist(g.hexOf(u), L) <= 3);
      if (places < 3 || !casters.length || g.gold.C < 15 || g.flags.ritualPTI === g.pti) return;
      g.gold.C -= 15; g.flags.ritualPTI = g.pti;
      const r = g.rng.d6() + (places - 3);
      g.ev({ type: 'spell', name: 'Frattura della Realtà', from: casters[0].hex, hex: L.id, fac: 'C' });
      if (r >= 5) { g.flags.ritual = true; g.say('Il Rituale Finale riesce!', 'bad'); }
      else { g.say(`Il Rituale Finale fallisce (${r}).`); for (const c of casters) g.damage(c, 1, 'ritual'); }
    },
    check(g) {
      if (g.flags.ritual) return SR.win(g, 'C', 'Il Rituale Finale è compiuto.');
      if (g.hold('lum', SR.owner(g, 'Luminara') === 'C') >= 2) return SR.win(g, 'C', 'Il Caos tiene Luminara per due turni.');
      const all = g.settlements().length;
      if (!SR.heroesAlive(g, 'C') && g.settlements('O').length >= Math.ceil(all * 0.7)) return SR.win(g, 'O', 'Gli Eroi del Caos sono caduti e l’Ordine tiene il 70% degli insediamenti.');
      return null;
    },
    final(g) { if (SR.owner(g, 'Luminara') === 'O' && g.pv('O') > g.pv('C')) return SR.win(g, 'O', 'L’Ordine tiene Luminara e ha più PV.'); return SR.pvWin(g); },
  },
  '19.1': {
    check: g => SR.decap(g),
    final(g) {
      const teste = g.map.hexes.filter(h => h.feature && h.feature.type === 'testa');
      for (const f of ['O', 'C']) if (teste.every(h => h.owner === f) && g.settlements(f).length >= 1) return SR.win(g, f, `${FACTION_NAME[f]} tiene entrambe le Teste di guado e una Città.`);
      return SR.pvWin(g);
    },
  },
  '19.2': {
    init(g) { g.flags.wolfCities = g.settlements('O').map(h => h.id); },
    final(g) { const n = g.flags.wolfCities.filter(id => g.map.hexes[id].owner === 'O').length; return n >= 2 ? SR.win(g, 'O', `L’Ordine difende ${n} Città su 3.`) : SR.win(g, 'C', 'I lupi hanno preso le Città.'); },
  },
  '19.3': {
    init(g) { g.flags.castle = {}; for (const h of g.map.hexes) if (h.terrain === 'castello' && h.owner) g.flags.castle[h.owner] = h.id; g.flags.ruinsExplored = 0; },
    explore(g, u, h) {
      if (g.flags.relicFound) return null;
      g.flags.ruinsExplored++;
      const r = g.rng.d6();
      if (r >= 5 || g.flags.ruinsExplored >= 3) { g.flags.relicFound = true; u.items.push({ name: 'Reliquia', special: true }); g.say(`${UNITS[u.type].name.split(',')[0]} trova la Reliquia Perduta!`, 'good'); g.ev({ type: 'loot', hex: h.id, gold: 0, items: ['Reliquia'] }); return true; }
      g.say(`La Rovina non custodisce la Reliquia (${r}).`); return true;
    },
    death(g, u, hid) { SR.drop(g, u, 'Reliquia', hid); },
    arrive(g, us, h) { SR.pick(g, us, h, 'Reliquia'); },
    check(g) {
      const c = SR.carry(g, 'Reliquia');
      for (const f of ['O', 'C']) if (g.hold('relic' + f, c && c.fac === f && c.hex === g.flags.castle[f]) >= 2) return SR.win(g, f, `${FACTION_NAME[f]} custodisce la Reliquia nel proprio Castello.`);
      return null;
    },
  },
  '19.4': { final(g) { return g.flags.passed >= 6 ? SR.win(g, 'C', `Sono passate ${g.flags.passed} unità: il Caos sfonda il Passo.`) : SR.win(g, 'O', `Solo ${g.flags.passed} unità passate: l’Ordine tiene il Passo.`); } },
  '19.5': { final(g) { const o = g.settlements('O').length, c = g.settlements('C').length; if (o !== c) return SR.win(g, o > c ? 'O' : 'C', `Quartieri controllati: Ordine ${o}, Caos ${c}.`); return SR.pvWin(g, 'Quartieri pari.'); } },
  '19.7': {
    final(g) { const c = g.units.find(u => u.type === 'Colosso' && g.alive(u)); if (c && c.fac !== 'N') return SR.win(g, c.fac, `${FACTION_NAME[c.fac]} controlla il Colosso.`); return SR.pvWin(g); },
  },
  '19.8': {
    final(g) {
      const keys = g.map.hexes.filter(h => h.key), cor = keys.filter(h => h.state === 'corrotto').length;
      if (keys.length - cor >= 5) return SR.win(g, 'O', `${keys.length - cor} luoghi chiave purificati.`);
      if (cor >= 4 && g.settlements('C').length >= 3) return SR.win(g, 'C', `${cor} luoghi chiave restano Corrotti.`);
      return SR.pvWin(g);
    },
  },
  '19.9': {
    check(g) {
      const towers = g.map.hexes.filter(h => h.feature && /^Torre/.test(h.feature.name));
      const res = {}; for (const f of ['O', 'C']) { const n = towers.filter(h => h.owner === f).length; res[f] = n >= 3 || (n >= 2 && g.commanderDead(OTHER[f])); }
      if (res.O && res.C) return SR.pvWin(g); if (res.O || res.C) return SR.win(g, res.O ? 'O' : 'C', `${FACTION_NAME[res.O ? 'O' : 'C']} domina le Torri.`);
      return null;
    },
  },
  '19.10': {
    startTurn(g, fac) { if ([4, 8, 12, 16].includes(g.turn)) SR.reinforce(g, fac, 35, g.settlements(fac).filter(h => !g.besieged(h)), 'Rinforzi'); },
    check(g) { const o = g.pv('O') >= 20, c = g.pv('C') >= 20; if (o && c) return SR.pvWin(g); if (o || c) return SR.win(g, o ? 'O' : 'C', 'Soglia di 20 PV raggiunta.'); return null; },
  },
  '20.3': {
    startTurn(g, fac) {
      if (fac !== 'C') return;
      for (const h of g.map.hexes) {
        if (h.owner !== 'C') continue;
        if (h.terrain === 'fenditura') SR.generate(g, h, SR.band(g.turn));
        else if (TERRAIN[h.terrain].settlement) SR.generate(g, h, ['Goblin']);
      }
    },
    check(g) {
      if (!g.settlements('O').length || !SR.heroesAlive(g, 'O')) return SR.win(g, 'C', 'L’Ordine ha perso tutte le Città o tutti gli Eroi.');
      return null;
    },
    final(g) { const sealed = Object.keys(g.flags.seals).length; return sealed >= 2 && g.settlements('O').length >= 3 ? SR.win(g, 'O', `${sealed} Fenditure Sigillate: la Contea è salva.`) : SR.win(g, 'C', 'L’Ombra si stende sulla Contea.'); },
  },
  '20.4': {
    init(g) { g.flags.chaosStart = g.friends('C').length; },
    startTurn(g, fac) {
      const T = SR.hex(g, 'Torre del Faro');
      if (fac === 'C') {
        const sides = ['N', 'S', 'W', 'E'].map(s => ({ s, d: s === 'W' ? T.c : s === 'E' ? g.map.W - 1 - T.c : s === 'N' ? T.r : g.map.H - 1 - T.r })).sort((a, b) => b.d - a.d);
        const edge = SR.edgeHexes(g, sides[0].s).sort((a, b) => g.map.dist(a, T) - g.map.dist(b, T));
        const t = g.turn <= 5 ? ['Orchi guerrieri', 'Orchi guerrieri'] : g.turn <= 10 ? ['Orchi guerrieri', 'Orchi guerrieri', 'Goblin genieri'] : ['Troll', 'Orchi guerrieri', 'Orchi guerrieri'];
        const mid = edge[Math.floor(edge.length / 2)] || edge[0];
        SR.generate(g, mid, t);
      } else if ([8, 12].includes(g.turn)) SR.reinforce(g, 'O', 25, SR.edgeHexes(g, 'W'), 'Rinforzi dell’Ordine');
    },
    check(g) {
      if (SR.owner(g, 'Torre del Faro') === 'C') return SR.win(g, 'C', 'Il Caos prende la Torre del Faro.');
      const boss = g.units.find(u => u.type === 'Signore del Caos');
      const lost = g.eliminated.filter(e => e.fac === 'C').length;
      if (g.turn <= 14 && boss && boss.dead && lost >= g.flags.chaosStart / 2) return SR.win(g, 'O', 'Il Signore del Caos è caduto e l’assedio è spezzato.');
      return null;
    },
    final(g) { return SR.owner(g, 'Torre del Faro') === 'O' ? SR.win(g, 'O', 'La Torre del Faro resiste fino alla fine.') : SR.win(g, 'C', 'La Torre è perduta.'); },
  },
  '20.5': {
    startTurn(g, fac) {
      if (fac !== 'C') return;
      for (const h of g.map.hexes) if (h.owner === 'C' && h.terrain === 'fenditura') { const b = SR.band(g.turn); SR.generate(g, h, h.feature.name === 'Fenditura Primaria' ? b.concat(b) : b); }
    },
    explore(g, u, h) { if (u.fac === 'O') { u.items.push({ name: 'Sigillo', special: true }); g.say(`${UNITS[u.type].name.split(',')[0]} trova un Sigillo!`, 'good'); g.ev({ type: 'loot', hex: h.id, gold: 0, items: ['Sigillo'] }); return true; } return null; },
    death(g, u, hid) { while (u.items.some(i => i.name === 'Sigillo')) { u.items.splice(u.items.findIndex(i => i.name === 'Sigillo'), 1); (g.flags.dropped = g.flags.dropped || {}).Sigillo = (g.flags.dropped.Sigillo || []).concat([hid]); } },
    arrive(g, us, h) { while (g.flags.dropped && g.flags.dropped.Sigillo && g.flags.dropped.Sigillo.includes(h.id) && us.some(u => u.fac === 'O')) SR.pick(g, us, h, 'Sigillo', u => u.fac === 'O'); },
    check(g) {
      if (!SR.heroesAlive(g, 'O')) return SR.win(g, 'C', 'Tutti gli Eroi dell’Ordine sono caduti.');
      const T = g.map.hexes.find(h => h.terrain === 'tempio');
      const n = T ? g.unitsAt(T.id).reduce((s, u) => s + u.items.filter(i => i.name === 'Sigillo').length, 0) : 0;
      if (g.hold('seals', n >= 3 && g.unitsAt(T.id).some(u => u.fac === 'O')) >= 2) return SR.win(g, 'O', 'I tre Sigilli chiudono la Frattura.');
      return null;
    },
    final(g) { return SR.win(g, 'C', 'La Frattura non è stata chiusa in tempo.'); },
  },
  '20.6': {
    init(g) {
      const h = g.friends('O').find(u => UNITS[u.type].kind === 'hero') || g.friends('O')[0];
      if (h) { h.items.push({ name: 'Lama del Giuramento Spezzato', special: true }); h.portatore = true; }
    },
    startTurn(g, fac) {
      if (fac !== 'C' || g.turn !== 3) return;
      const res = g.units.filter(u => u.fac === 'C' && u.reserve && !u.dead);
      const edges = ['N', 'E', 'S', 'W'].flatMap(s => SR.edgeHexes(g, s));
      const O = g.friends('O'); const far = h => Math.min(...O.map(o => g.map.dist(g.hexOf(o), h)), 99);
      edges.sort((a, b) => far(a) - far(b));
      for (const u of res) {
        const site = edges.find(h => far(h) > 1 && !g.enemyAt(h.id, 'C') && g.canStack(h.id, [], [Object.assign({}, u, { hex: h.id })]) && g.canEnterTerrain(u, h));
        if (site) { u.reserve = false; u.hex = site.id; u.moved = false; u.startHex = site.id; g.ev({ type: 'recruit', uid: u.uid, hex: site.id }); }
      }
      g.say('La seconda ondata del Caos entra in mappa.', 'turn');
    },
    death(g, u, hid) { SR.drop(g, u, 'Lama del Giuramento Spezzato', hid); },
    arrive(g, us, h) {
      SR.pick(g, us, h, 'Lama del Giuramento Spezzato');
      const c = SR.carry(g, 'Lama del Giuramento Spezzato');
      if (c && c.fac === 'O' && g.isLeader(c) && h.terrain === 'tempio' && us.includes(c)) g.flags.bladeHome = true;
    },
    check(g) {
      if (g.flags.bladeHome) return SR.win(g, 'O', 'Il Portatore raggiunge il Santuario con la Lama.');
      const c = SR.carry(g, 'Lama del Giuramento Spezzato');
      if (g.hold('blade', c && c.fac === 'C') >= 2) return SR.win(g, 'C', 'Il Caos si impadronisce della Lama.');
      return null;
    },
    final(g) { return SR.win(g, 'C', 'Il Portatore non è arrivato in tempo.'); },
  },
  '20.7': {
    finalPhase(g, fac) {
      if (fac !== 'C') return;
      const cor = g.map.hexes.filter(h => h.state === 'corrotto');
      for (const h of cor) {
        const opts = g.map.neighbors(h).filter(n => n.state !== 'corrotto' && n.terrain !== 'lago');
        if (!opts.length) continue;
        opts.sort((a, b) => (b.key - a.key) || (b.state === 'purificato' ? -1 : 0));
        const t = opts[0];
        const r = g.rng.d6() + (g.map.neighbors(t).some(n => g.unitsAt(n.id).some(u => u.fac === 'C' && g.isCaster(u))) ? 1 : 0);
        if (r >= 5) { g.corruptHex(t); }
      }
    },
    check(g) {
      const keys = g.map.hexes.filter(h => h.key);
      const T = g.map.hexes.find(h => h.key && (h.terrain === 'tempio' || h.terrain === 'altare'));
      if (keys.filter(h => h.state === 'corrotto').length >= 6 || (T && T.state === 'corrotto')) return SR.win(g, 'C', 'Il Contagio dilaga sugli esagoni chiave.');
      if (!g.friends('C').some(u => g.isCaster(u)) && Object.keys(g.flags.seals).length) return SR.win(g, 'O', 'Incantatori del Caos eliminati e Fenditura Sigillata.');
      return null;
    },
    final(g) {
      const cor = g.map.hexes.filter(h => h.state === 'corrotto').length;
      const cities = g.map.hexes.filter(h => h.key && TERRAIN[h.terrain].settlement);
      if (cor < 4 && cities.every(h => h.owner === 'O')) return SR.win(g, 'O', 'Il Contagio è contenuto.');
      return SR.pvWin(g);
    },
  },
  '20.8': {
    startTurn(g, fac) { if (fac === 'O' && g.turn === 12) SR.reinforce(g, 'O', 40, SR.edgeHexes(g, 'W'), 'Rinforzi dell’Ordine'); },
    check(g) {
      const keys = g.map.hexes.filter(h => h.key);
      if (keys.every(h => h.owner === 'C')) return SR.win(g, 'C', 'Il Caos espugna la Roccaforte.');
      const boss = g.units.find(u => u.fac === 'C' && UNITS[u.type].kind === 'boss');
      if (boss && boss.dead && SR.lostCost(g, 'C') >= g.initialCost.C * 0.6) return SR.win(g, 'O', 'Il Boss è caduto e l’assedio è spezzato.');
      return null;
    },
    final(g) { return SR.win(g, 'O', 'La Roccaforte resiste.'); },
  },
};
