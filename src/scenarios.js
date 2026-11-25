// ============================================================
//  SCENARI (cap. 18, 19, 20)
//  Convenzione: l'Ordine occupa la metà ovest, il Caos la metà est.
// ============================================================
const gauss = (x, s) => Math.exp(-(x * x) / (s * s));

// Zone di schieramento (restituiscono un predicato sugli esagoni)
const Z = {
  edge: (d, side) => (m, fac) => { const s = side || (fac === 'O' ? 'W' : 'E'); return h => s === 'W' ? h.c < d : s === 'E' ? h.c >= m.W - d : s === 'N' ? h.r < d : h.r >= m.H - d; },
  nearOwn: (d, alsoPlaces) => (m, fac) => { const own = m.hexes.filter(h => h.feature && h.owner === fac && (TERRAIN[h.terrain].settlement || alsoPlaces)); return h => own.some(o => m.dist(o, h) <= d); },
  near: (names, d) => (m) => { const t = names.map(n => m.byName(n)).filter(Boolean); return h => t.some(o => m.dist(o, h) <= d); },
  ring: (name, a, b) => (m) => { const t = m.byName(name); return h => { const d = m.dist(t, h); return d >= a && d <= b; }; },
  far: (name, a) => (m) => { const t = m.byName(name); return h => m.dist(t, h) >= a; },
  side: () => (m, fac) => h => m.half(h) === fac,
  and: (...zs) => (m, fac) => { const ps = zs.map(z => z(m, fac)); return h => ps.every(p => p(h)); },
  or: (...zs) => (m, fac) => { const ps = zs.map(z => z(m, fac)); return h => ps.some(p => p(h)); },
};
const Z_DEFAULT = Z.or(Z.edge(3), Z.nearOwn(3));

const SCENARIOS = [
  // ---------------------------------------------------------------- 18.1
  {
    id: '18.1', group: 'Scenari principali', title: 'La Difesa del Passo di Pietraluce', size: [26, 18],
    turns: 12, first: 'C', gold: { O: 10, C: 15 }, commanders: { O: 'Kael', C: 'Gorath' },
    mapDesc: 'Passo montano al centro con il Castello maggiore di Pietraluce; 2 Città minori dell’Ordine; nella metà del Caos 1 Città neutrale e 1 Fenditura.',
    victory: ['Caos: controlla Pietraluce per 2 turni consecutivi.', 'Ordine: controlla Pietraluce alla fine del TG 12.', 'Entrambi: Comandante nemico eliminato e almeno 3 insediamenti controllati.', 'Altrimenti, alla fine del TG 12, più PV.'],
    mix: { montagna: 0.13, collina: 0.13, bosco: 0.15 }, rivers: 1, lakes: 1,
    shape: (fx, fy) => 0.75 * gauss(fx - 0.5 - 0.035 * Math.sin(fy * 7), 0.075),
    terrainPost(ctx) {
      const m = ctx.map, r = ctx.rng, mid = Math.floor(m.W / 2);
      ctx.passRow = Math.floor(m.H / 2) + r.int(-2, 2);
      for (let row = 0; row < m.H; row++) {
        const cR = mid + Math.round(1.2 * Math.sin(row * 0.7 + ctx.seed % 7));
        for (let c = cR - 1; c <= cR + 1; c++) { const h = m.at(c, row); if (h && (c === cR || r.chance(0.7))) ctx.forceTerrain(h, 'montagna'); }
        for (const c of [cR - 2, cR + 2]) { const h = m.at(c, row); if (h && h.terrain !== 'montagna' && r.chance(0.6)) ctx.forceTerrain(h, 'collina'); }
      }
      for (let c = mid - 4; c <= mid + 4; c++) { const h = m.at(c, ctx.passRow); if (h) ctx.forceTerrain(h, Math.abs(c - mid) <= 1 ? 'collina' : 'pianura'); }
    },
    layout(ctx) {
      const m = ctx.map, mid = Math.floor(m.W / 2);
      ctx.place('castellomag', { hex: m.at(mid - 1, ctx.passRow), name: 'Pietraluce', owner: 'O' });
      ctx.place('citta', { side: 'O', at: [0.25, 0.3], owner: 'O', minDist: 4 });
      ctx.place('citta', { side: 'O', at: [0.2, 0.75], owner: 'O', minDist: 4 });
      ctx.place('citta', { side: 'C', at: [0.75, 0.3 + ctx.rng.range(0, 0.4)], owner: null, minDist: 4 });
      ctx.place('fenditura', { side: 'C', at: [0.85, ctx.rng.range(0.2, 0.8)], owner: 'C', minDist: 4 });
    },
    armies: {
      O: 'Kael; 1 Sacerdoti; 2 Cavalieri; 4 Fanteria disciplinata; 3 Lancieri; 2 Arcieri; 1 Picchieri; 1 Balestrieri; 1 Arcieri lunghi; 2 Guardie cittadine; 1 Ingegneri nanici; 2 Scudieri; 1 Esploratori',
      C: 'Gorath; 1 Stregoni del Caos; 1 Sciamani; 5 Orchi guerrieri; 2 Orchi berseker; 4 Goblin; 2 Goblin arcieri; 1 Goblin genieri; 1 Troll; 1 Ogre; 2 Lupi giganti; 1 Guerrieri del Caos',
    },
    deploy: { first: 'O', O: Z.and(Z.near(['Pietraluce'], 4), Z.side()), C: Z.edge(3), text: { O: 'entro 4 esagoni da Pietraluce, nella propria metà', C: 'entro 3 esagoni dal bordo della propria metà' } },
  },
  // ---------------------------------------------------------------- 18.2
  {
    id: '18.2', group: 'Scenari principali', title: 'La Corruzione di Vallearida', size: [26, 18],
    turns: 16, first: 'C', gold: { O: 10, C: 10 }, commanders: { O: 'Kael', C: 'Veyla' },
    mapDesc: 'Una valle arida con 5 Città minori, 1 Tempio dell’Ordine e 2 Fenditure del Caos.',
    victory: ['Soglia: 15 PV (Tempio dell’Ordine 3 PV; Altare 4 PV al Caos; Fenditura 1 PV; Città Corrotta +1 PV).', 'Caos: controlla l’Altare nato dalla profanazione del Tempio per 2 turni.', 'Ordine: tutti gli Eroi del Caos eliminati e nessuna Città Corrotta.', 'Alla fine del TG 16, più PV.'],
    mix: { montagna: 0.1, collina: 0.17, bosco: 0.07, palude: 0.02, deserto: 0.16 }, lakes: 0, tributary: 0.8,
    shape: (fx, fy) => 0.55 * Math.pow(2 * fy - 1, 2) - 0.1,
    moistShape: (fx, fy) => -0.12 + 0.2 * gauss(fy - 0.5, 0.15),
    layout(ctx) {
      const r = ctx.rng;
      ctx.river({ from: 'W', to: 'E', fromFrac: r.range(0.4, 0.6), toFrac: r.range(0.4, 0.6) });
      ctx.place('tempio', { side: 'O', at: [0.3, 0.5], owner: 'O', name: 'Tempio di ' + ctx.name('O'), minDist: 3 });
      ctx.place('citta', { side: 'O', at: [0.12, 0.35], owner: 'O', minDist: 4 });
      ctx.place('citta', { side: 'O', at: [0.18, 0.7], owner: 'O', minDist: 4 });
      ctx.place('citta', { side: 'O', at: [0.4, 0.3], owner: 'O', minDist: 4 });
      ctx.place('citta', { at: [0.6, 0.65], owner: null, minDist: 4 });
      ctx.place('citta', { side: 'C', at: [0.72, 0.35], owner: null, minDist: 4 });
      ctx.place('fenditura', { side: 'C', at: [0.9, r.range(0.3, 0.7)], owner: 'C', minDist: 4 });
      ctx.place('fenditura', { side: 'C', at: [0.62, r.range(0.25, 0.75)], owner: null, minDist: 4 });
      ctx.notes.push('Bordo di schieramento del Caos scelto dall’Ordine: bordo est.');
    },
    armies: {
      O: 'Kael; Theron; 1 Sacerdoti; 1 Inquisitori; 1 Maghi dell\'Ordine; 1 Paladini; 3 Cavalieri; 4 Fanteria disciplinata; 3 Lancieri; 3 Arcieri; 1 Picchieri; 2 Guardie cittadine',
      C: 'Veyla; Korgash; 2 Stregoni del Caos; 1 Sciamani; 5 Orchi guerrieri; 2 Orchi berseker; 5 Goblin; 2 Goblin arcieri; 1 Troll; 2 Mutanti; 2 Guerrieri del Caos; 1 Demoni minori; 1 Lupi giganti',
    },
    deploy: { first: 'O', O: Z.nearOwn(3), C: Z.edge(2, 'E'), text: { O: 'entro 3 esagoni dai propri insediamenti', C: 'entro 2 esagoni dal bordo est (scelto dall’Ordine)' } },
  },
  // ---------------------------------------------------------------- 18.3
  {
    id: '18.3', group: 'Scenari principali', title: 'L’Assedio della Capitale di Luminara', size: [34, 22],
    turns: 20, first: 'C', gold: { O: 15, C: 10 }, commanders: { O: 'Kael', C: 'Gorath' },
    mapDesc: 'Mappa grande. Capitale Luminara, 2 Castelli minori e 2 Città dell’Ordine; nella metà del Caos 2 Città Corrotte, 1 Altare e 1 Fenditura; 6 esagoni Corrotti.',
    victory: ['Caos: controlla Luminara per 2 turni consecutivi, oppure il Rituale Finale riesce.', 'Ordine: tutti gli Eroi del Caos eliminati e almeno il 70% degli insediamenti.', 'Alla fine del TG 20: Ordine se controlla Luminara e ha più PV; altrimenti più PV.'],
    rivers: 2, lakes: 2,
    layout(ctx) {
      const r = ctx.rng;
      ctx.place('capitale', { side: 'O', at: [0.2, r.range(0.4, 0.6)], owner: 'O', name: 'Luminara', minDist: 4 });
      ctx.place('castello', { side: 'O', at: [0.33, 0.22], owner: 'O', minDist: 5 });
      ctx.place('castello', { side: 'O', at: [0.33, 0.78], owner: 'O', minDist: 5 });
      ctx.place('citta', { side: 'O', at: [0.08, 0.2], owner: 'O', minDist: 4 });
      ctx.place('citta', { side: 'O', at: [0.1, 0.82], owner: 'O', minDist: 4 });
      ctx.place('citta', { side: 'C', at: [0.7, 0.25], owner: 'C', corrupt: true, minDist: 5 });
      ctx.place('citta', { side: 'C', at: [0.72, 0.75], owner: 'C', corrupt: true, minDist: 5 });
      ctx.place('altare', { side: 'C', at: [0.88, 0.5], owner: 'C', name: 'Altare di ' + ctx.name('C'), minDist: 4 });
      ctx.place('fenditura', { side: 'C', at: [0.62, 0.5], owner: 'C', minDist: 4 });
    },
    post(ctx) {
      // il Caos corrompe 6 esagoni nella propria metà, verso Luminara e vicino alle proprie basi
      const m = ctx.map, L = m.byName('Luminara');
      const c = m.hexes.filter(h => m.half(h) === 'C' && !h.feature && h.terrain !== 'lago' && h.state === 'normale');
      c.sort((a, b) => (m.dist(a, L) - (a.road ? 2 : 0) + ctx.rng.range(0, 4)) - (m.dist(b, L) - (b.road ? 2 : 0) + ctx.rng.range(0, 4)));
      c.slice(0, 6).forEach(h => h.state = 'corrotto');
      ctx.notes.push('Il Caos ha reso Corrotti 6 esagoni nella propria metà, verso Luminara.');
    },
    armies: {
      O: 'Kael; Seris; Theron; 1 Sacerdoti; 1 Maghi dell\'Ordine; 1 Paladini; 2 Cavalieri; 1 Cavalieri pesanti; 4 Fanteria disciplinata; 2 Lancieri; 2 Picchieri; 2 Arcieri lunghi; 2 Balestrieri; 3 Guardie cittadine; 1 Golem controllati; 1 Guerrieri nanici',
      C: 'Gorath; Zhara; Korgash; 2 Stregoni del Caos; 6 Orchi guerrieri; 3 Orchi berseker; 2 Goblin; 3 Goblin arcieri; 2 Goblin genieri; 2 Troll; 1 Draghi giovani; 2 Guerrieri del Caos; 1 Cavalieri del Caos; 1 Demoni minori',
    },
    deploy: { first: 'O', O: Z.nearOwn(3), C: Z.and(Z.side(), Z.far('Luminara', 6)), text: { O: 'entro 3 esagoni dai propri insediamenti', C: 'nella propria metà, ad almeno 6 esagoni da Luminara' } },
  },
  // ---------------------------------------------------------------- 19.x
  {
    id: '19.1', group: 'Scenari brevi', title: 'Scontro al Guado di Pietranera', size: [22, 15], turns: 8, first: 'C', points: { O: 90, C: 90 },
    mapDesc: 'Un fiume al centro con un solo Guado; le Teste di guado sulle due sponde; 2 Città minori neutrali, una per sponda.',
    victory: ['Alla fine del TG 8 vince chi controlla entrambe le Teste di guado e almeno 1 Città.', 'Decapitazione in qualsiasi momento.', 'Altrimenti PV.'],
    rivers: 0, lakes: 1, noBridges: true, noFords: true,
    layout(ctx) {
      const m = ctx.map, r = ctx.rng;
      let rv = null;
      for (let k = 0; k < 6 && !rv; k++) rv = ctx.river({ from: 'N', to: 'S', fromFrac: r.range(0.42, 0.58), toFrac: r.range(0.42, 0.58), via: [0.5, 0.5] });
      // guado: il segmento più vicino al centro
      const C = ctx.pt(0.5, 0.5);
      let best = null, bd = Infinity;
      for (const k of rv.segs) { const [a, b] = k.split('_').map(Number); const ha = m.hexes[a], hb = m.hexes[b]; const d = Math.hypot((ha.x + hb.x) / 2 - C.x, (ha.y + hb.y) / 2 - C.y); if (d < bd) { bd = d; best = [ha, hb, k]; } }
      m.edges.set(best[2], { type: 'guado' });
      const [w, e] = best[0].x < best[1].x ? [best[0], best[1]] : [best[1], best[0]];
      for (const [h, nm] of [[w, 'Testa di guado ovest'], [e, 'Testa di guado est']]) { ctx.forceTerrain(h, 'pianura'); ctx.setFeature(h, 'testa', { name: nm, owner: null }); }
      ctx.name('O');
      ctx.place('citta', { side: 'O', at: [0.22, r.range(0.25, 0.75)], owner: null, minDist: 4 });
      ctx.place('citta', { side: 'C', at: [0.78, r.range(0.25, 0.75)], owner: null, minDist: 4 });
    },
  },
  {
    id: '19.2', group: 'Scenari brevi', title: 'La Notte dei Lupi', size: [22, 15], turns: 10, first: 'C', points: { O: 100, C: 110 },
    mapDesc: '3 Città minori dell’Ordine al centro; per tutta la partita le Bestie del Caos hanno +1 V.',
    victory: ['Alla fine del TG 10 l’Ordine vince se controlla almeno 2 delle 3 Città; altrimenti vince il Caos.'],
    armyPrefs: { C: { 'Lupi giganti': 3, 'Chimere minori': 1 } },
    layout(ctx) {
      const r = ctx.rng;
      ctx.place('citta', { at: [0.45, 0.3], owner: 'O', minDist: 3 });
      ctx.place('citta', { at: [0.5, 0.7], owner: 'O', minDist: 3 });
      ctx.place('citta', { at: [0.55, r.range(0.4, 0.6)], owner: 'O', minDist: 3 });
    },
  },
  {
    id: '19.3', group: 'Scenari brevi', title: 'La Reliquia Perduta', size: [22, 15], turns: 12, first: 'O', points: { O: 110, C: 110 },
    mapDesc: '3 Rovine al centro; 1 Castello minore per fazione sul proprio bordo.',
    victory: ['Chi ha la Reliquia nel proprio Castello per 2 turni consecutivi (nota A).', 'Alla fine del TG 12 senza vincitore, PV.'],
    layout(ctx) {
      const r = ctx.rng;
      ctx.place('rovina', { at: [0.5, 0.2], minDist: 3, name: 'Rovine di ' + ctx.name('O') });
      ctx.place('rovina', { at: [0.5, 0.5], minDist: 3, name: 'Rovine di ' + ctx.name('O') });
      ctx.place('rovina', { at: [0.5, 0.8], minDist: 3, name: 'Rovine di ' + ctx.name('O') });
      ctx.place('castello', { filter: h => h.c <= 1, at: [0, r.range(0.3, 0.7)], owner: 'O', edgeAvoid: false });
      ctx.place('castello', { filter: h => h.c >= ctx.map.W - 2, at: [1, r.range(0.3, 0.7)], owner: 'C', edgeAvoid: false });
    },
  },
  {
    id: '19.4', group: 'Scenari brevi', title: 'Blocco del Passo del Drago', size: [24, 15], turns: 12, first: 'C', points: { O: 100, C: 130 },
    mapDesc: 'Un passo montano largo 3 esagoni; il Caos entra dal bordo opposto a quello dell’Ordine.',
    victory: ['Un’unità del Caos sul bordo dell’Ordine può uscire spendendo 1 PM (nota B).', 'Il Caos vince se alla fine del TG 12 sono passate almeno 6 unità (Eroi e Grandi contano 2); altrimenti vince l’Ordine.'],
    mix: { montagna: 0.08, collina: 0.12, bosco: 0.14 }, rivers: 1, lakes: 0, tributary: 0,
    terrainPost(ctx) {
      const m = ctx.map, r = ctx.rng, ph = r.range(0, 6);
      const x0 = Math.floor(m.W * 0.25), x1 = Math.ceil(m.W * 0.75);
      for (let c = x0; c <= x1; c++) {
        const rc = Math.floor(m.H / 2) + Math.round(1.6 * Math.sin(c / 3.2 + ph));
        for (let row = 0; row < m.H; row++) {
          const h = m.at(c, row), d = Math.abs(row - rc);
          if (d <= 1) { if (h.terrain === 'montagna' || h.terrain === 'lago') ctx.forceTerrain(h, 'collina'); }
          else if (d <= 3 || (c > x0 && c < x1 && r.chance(0.8))) ctx.forceTerrain(h, d === 2 && r.chance(0.15) ? 'collina' : 'montagna');
        }
      }
      // le colline sul ciglio del passo restano rare: garantisce il corridoio di 3 esagoni
      ctx.notes.push('Il passo è il corridoio di 3 esagoni fra le montagne; ai lati si passa solo a piedi su Montagna.');
    },
    layout() {},
    deploy: { first: 'C', O: Z.edge(3), C: Z.edge(3), text: { O: 'entro 3 esagoni dal proprio bordo (ovest)', C: 'entro 3 esagoni dal bordo opposto (est)' } },
  },
  {
    id: '19.5', group: 'Scenari brevi', title: 'La Città Divisa', size: [22, 15], turns: 13, first: 'O', points: { O: 120, C: 120 }, maxCav: 2,
    mapDesc: '7 Città minori adiacenti (i quartieri): 3 dell’Ordine, 3 del Caos, quella centrale neutrale. Massimo 2 unità di Cavalleria per armata.',
    victory: ['Alla fine del TG 13 vince chi controlla più quartieri; in parità 17.4.'],
    layout(ctx) {
      const m = ctx.map, c0 = ctx.pt(0.5, 0.5);
      for (const h of [c0, ...m.neighbors(c0)]) { if (h.terrain === 'lago') h.terrain = 'pianura'; }
      ctx.place('citta', { hex: c0, owner: null, name: 'Quartiere del Mercato' });
      const nm = ['Quartiere dei Fabbri', 'Quartiere del Porto', 'Quartiere Alto', 'Quartiere dei Templi', 'Quartiere delle Torri', 'Quartiere Basso'];
      for (let i = 0; i < 6; i++) { const h = m.nb(c0, i); const owner = (i === 2 || i === 3 || i === 1) ? 'O' : 'C'; ctx.place('citta', { hex: h, owner, name: nm[i], minDist: 0 }); }
    },
  },
  {
    id: '19.6', group: 'Scenari brevi', title: 'Fuoco sulla Frontiera', size: [22, 15], turns: 14, first: 'O', points: { O: 130, C: 130 }, minHeroes: 2,
    mapDesc: '6 Castelli minori in linea al centro, 3 per fazione. Almeno 2 Eroi per armata.',
    victory: ['Limite di turni: alla fine del TG 14 vince chi ha più PV.'],
    layout(ctx) {
      const m = ctx.map, r = ctx.rng, row = Math.floor(m.H / 2), mid = Math.floor(m.W / 2);
      [-6, -4, -2, 1, 3, 5].forEach((dc, i) => { const h = m.at(mid + dc, row + r.int(-1, 1)); ctx.place('castello', { hex: h, owner: i < 3 ? 'O' : 'C', minDist: 0 }); });
    },
  },
  {
    id: '19.7', group: 'Scenari brevi', title: 'Il Risveglio dell’Antico', size: [22, 15], turns: 15, first: 'C', points: { O: 140, C: 140 },
    mapDesc: 'Una Rovina al centro con il Colosso dormiente; 2 Città minori per fazione.',
    victory: ['Alla fine del TG 15 vince chi controlla il Colosso; se nessuno lo controlla, PV.'],
    colossus: true,
    layout(ctx) {
      ctx.place('rovina', { at: [0.5, 0.5], name: 'Rovine del Colosso', minDist: 3 });
      ctx.place('citta', { side: 'O', at: [0.15, 0.3], owner: 'O', minDist: 4 });
      ctx.place('citta', { side: 'O', at: [0.2, 0.75], owner: 'O', minDist: 4 });
      ctx.place('citta', { side: 'C', at: [0.85, 0.25], owner: 'C', minDist: 4 });
      ctx.place('citta', { side: 'C', at: [0.8, 0.72], owner: 'C', minDist: 4 });
    },
  },
  {
    id: '19.8', group: 'Scenari brevi', title: 'Operazione Purificazione', size: [22, 15], turns: 16, first: 'O', points: { O: 130, C: 140 },
    mapDesc: '8 luoghi chiave: 3 Città e 2 Altari del Caos Corrotti, più 3 Pianure Corrotte; 2 Città minori dell’Ordine.',
    victory: ['Alla fine del TG 16: l’Ordine vince se almeno 5 luoghi chiave non sono Corrotti.', 'Il Caos vince se almeno 4 sono Corrotti e controlla almeno 3 Città.', 'Altrimenti PV.'],
    layout(ctx) {
      const r = ctx.rng;
      ctx.place('citta', { side: 'O', at: [0.12, 0.3], owner: 'O', minDist: 4 });
      ctx.place('citta', { side: 'O', at: [0.15, 0.75], owner: 'O', minDist: 4 });
      ctx.place('citta', { at: [0.45, 0.25], owner: 'C', corrupt: true, key: true, minDist: 4 });
      ctx.place('citta', { at: [0.5, 0.75], owner: 'C', corrupt: true, key: true, minDist: 4 });
      ctx.place('citta', { side: 'C', at: [0.75, 0.45], owner: 'C', corrupt: true, key: true, minDist: 4 });
      ctx.place('altare', { side: 'C', at: [0.88, 0.2], owner: 'C', key: true, name: 'Altare di ' + ctx.name('C'), minDist: 4 });
      ctx.place('altare', { side: 'C', at: [0.85, 0.8], owner: 'C', key: true, name: 'Altare di ' + ctx.name('C'), minDist: 4 });
    },
    post(ctx) {
      const m = ctx.map, r = ctx.rng;
      let n = 0; const c = r.shuffle(m.hexes.filter(h => h.terrain === 'pianura' && !h.feature && h.c > m.W * 0.35 && h.c < m.W * 0.85 && !m.isBorder(h)));
      for (const h of c) { if (n >= 3) break; if (m.hexes.some(x => x.key && m.dist(x, h) < 3)) continue; h.key = true; h.state = 'corrotto'; n++; }
    },
  },
  {
    id: '19.9', group: 'Scenari brevi', title: 'La Battaglia delle Quattro Torri', size: [22, 15], turns: 17, first: 'O', points: { O: 150, C: 150 }, allowBoss: true,
    mapDesc: '4 Castelli minori (torri) neutrali al centro; 2 Città minori per fazione; ammesso 1 Boss.',
    victory: ['Controllare 3 torri, oppure 2 torri con il Comandante nemico eliminato.', 'Alla fine del TG 17, PV.'],
    layout(ctx) {
      const tn = ['Torre del Nord', 'Torre del Sud', 'Torre dell’Alba', 'Torre del Tramonto'];
      [[0.5, 0.2], [0.5, 0.8], [0.4, 0.5], [0.6, 0.5]].forEach((p, i) => ctx.place('castello', { at: p, owner: null, minDist: 3, name: tn[i], jitter: 0.5 }));
      ctx.place('citta', { side: 'O', at: [0.1, 0.25], owner: 'O', minDist: 4 });
      ctx.place('citta', { side: 'O', at: [0.12, 0.75], owner: 'O', minDist: 4 });
      ctx.place('citta', { side: 'C', at: [0.9, 0.25], owner: 'C', minDist: 4 });
      ctx.place('citta', { side: 'C', at: [0.88, 0.75], owner: 'C', minDist: 4 });
    },
  },
  {
    id: '19.10', group: 'Scenari brevi', title: 'Guerra di Logoramento', size: [32, 20], turns: 20, first: 'O', points: { O: 160, C: 160 }, allowBoss: true,
    mapDesc: 'Mappa grande; per fazione 1 Capitale, 2 Castelli minori e 3 Città minori; ammesso 1 Boss; si usa il Mantenimento.',
    victory: ['Soglia di 20 PV; alla fine del TG 20, PV.', 'Rinforzi: 35 punti nei TG 4, 8, 12 e 16.'],
    rivers: 2, lakes: 2,
    layout(ctx) {
      const r = ctx.rng;
      for (const [s, x0] of [['O', 0], ['C', 1]]) {
        const fx = x => x0 ? 1 - x : x;
        ctx.place('capitale', { side: s, at: [fx(0.1), r.range(0.35, 0.65)], owner: s, minDist: 4 });
        ctx.place('castello', { side: s, at: [fx(0.3), 0.25], owner: s, minDist: 4 });
        ctx.place('castello', { side: s, at: [fx(0.3), 0.75], owner: s, minDist: 4 });
        ctx.place('citta', { side: s, at: [fx(0.15), 0.12], owner: s, minDist: 4 });
        ctx.place('citta', { side: s, at: [fx(0.16), 0.88], owner: s, minDist: 4 });
        ctx.place('citta', { side: s, at: [fx(0.4), 0.5], owner: s, minDist: 4 });
      }
    },
  },
  // ---------------------------------------------------------------- 20.x
  {
    id: '20.3', group: 'Cooperativi e asimmetrici', title: 'L’Ombra sulla Contea dei Tre Fiumi', size: [24, 16], turns: 14, first: 'O', coop: true,
    points: { O: [65, 65] }, mapDesc: '5 Città minori dell’Ordine e 3 Fenditure del Caos attive, ciascuna con le unità della fascia TG 1–4. Caos automatico.',
    victory: ['Vittoria: alla fine del TG 14 almeno 2 Fenditure Sigillate e l’Ordine controlla almeno 3 Città.', 'Sconfitta: nessuna Città o nessun Eroe in una Fase di Fine Turno.'],
    rivers: 3, tributary: 0,
    layout(ctx) {
      ctx.place('citta', { at: [0.12, 0.25], owner: 'O', minDist: 4 });
      ctx.place('citta', { at: [0.15, 0.75], owner: 'O', minDist: 4 });
      ctx.place('citta', { at: [0.35, 0.5], owner: 'O', minDist: 4 });
      ctx.place('citta', { at: [0.5, 0.15], owner: 'O', minDist: 4 });
      ctx.place('citta', { at: [0.5, 0.85], owner: 'O', minDist: 4 });
      ctx.place('fenditura', { at: [0.75, 0.25], owner: 'C', minDist: 4 });
      ctx.place('fenditura', { at: [0.88, 0.6], owner: 'C', minDist: 4 });
      ctx.place('fenditura', { at: [0.65, 0.7], owner: 'C', minDist: 4 });
    },
    chaosStart: ctx => ctx.map.hexes.filter(h => h.feature && h.feature.type === 'fenditura').map(h => ({ hex: h, units: ['Goblin', 'Orchi guerrieri'] })),
  },
  {
    id: '20.4', group: 'Cooperativi e asimmetrici', title: 'L’Assedio della Torre del Faro', size: [24, 16], turns: 16, first: 'O', coop: true,
    points: { O: [75, 75], C: 200 }, chaosBoss: 'Signore del Caos', req: { C: { 'Goblin genieri': 2 } },
    mapDesc: 'La Torre del Faro è un Castello maggiore con Mura su tutti i lati; entro 5 esagoni 2 Città minori dell’Ordine. Caos automatico con 200 punti a 4–6 esagoni dalla Torre.',
    victory: ['Vittoria: l’Ordine controlla la Torre alla fine del TG 16, oppure entro il TG 14 elimina il Signore del Caos e metà delle unità del Caos.', 'Sconfitta: il Caos controlla la Torre in una Fase di Fine Turno.'],
    layout(ctx) {
      const t = ctx.place('castellomag', { at: [0.32, 0.5], owner: 'O', name: 'Torre del Faro', minDist: 0 });
      ctx.place('citta', { filter: h => ctx.map.dist(h, t) <= 5 && ctx.map.dist(h, t) >= 3, at: [0.2, 0.3], owner: 'O', minDist: 3 });
      ctx.place('citta', { filter: h => ctx.map.dist(h, t) <= 5 && ctx.map.dist(h, t) >= 3, at: [0.2, 0.75], owner: 'O', minDist: 3 });
    },
    post(ctx) { ctx.walls(ctx.map.byName('Torre del Faro')); },
    deploy: { first: 'O', O: Z.nearOwn(3), C: Z.ring('Torre del Faro', 4, 6), text: { O: 'entro 3 esagoni dai propri insediamenti', C: 'a 4–6 esagoni dalla Torre' } },
  },
  {
    id: '20.5', group: 'Cooperativi e asimmetrici', title: 'La Corsa contro la Frattura', size: [30, 20], turns: 18, first: 'O', coop: true,
    points: { O: [60, 60] }, mapDesc: 'Mappa grande: Fenditura primaria al centro (genera il doppio), 4 Rovine con i Sigilli, 1 Tempio dell’Ordine e 3 Città minori dell’Ordine.',
    victory: ['Vittoria: almeno 3 Sigilli nel Tempio con un’unità dell’Ordine per 2 turni, entro il TG 18.', 'Sconfitta: qualsiasi altro esito, o tutti gli Eroi dell’Ordine eliminati.'],
    rivers: 2, lakes: 2,
    layout(ctx) {
      ctx.place('fenditura', { at: [0.5, 0.5], owner: 'C', name: 'Fenditura Primaria', minDist: 0, jitter: 0.5 });
      ctx.place('tempio', { at: [0.1, 0.5], owner: 'O', name: 'Tempio di ' + ctx.name('O'), minDist: 4 });
      ctx.place('citta', { at: [0.2, 0.2], owner: 'O', minDist: 4 });
      ctx.place('citta', { at: [0.22, 0.8], owner: 'O', minDist: 4 });
      ctx.place('citta', { at: [0.32, 0.5], owner: 'O', minDist: 4 });
      [[0.55, 0.12], [0.85, 0.3], [0.8, 0.8], [0.5, 0.88]].forEach(p => ctx.place('rovina', { at: p, minDist: 4, name: 'Rovine di ' + ctx.name('O') }));
    },
    chaosStart: () => [],
  },
  {
    id: '20.6', group: 'Cooperativi e asimmetrici', title: 'La Caccia al Portatore', size: [24, 16], turns: 14, first: 'O',
    points: { O: 75, C: 140 }, chaosSplit: true,
    mapDesc: 'L’Ordine parte da un angolo con il Portatore della Lama; il Tempio è nell’angolo opposto. Metà del Caos entra nel TG 3.',
    victory: ['Ordine: un Eroe con la Lama termina un movimento nel Tempio entro il TG 14.', 'Caos: un’unità del Caos porta la Lama per 2 turni, oppure l’Ordine non vince entro il TG 14.'],
    layout(ctx) {
      ctx.place('tempio', { filter: h => h.c >= ctx.map.W - 3 && h.r <= 2, at: [1, 0], owner: 'O', name: 'Santuario della Lama', edgeAvoid: false });
      ctx.place('citta', { at: [0.4, 0.35], owner: null, minDist: 5 });
      ctx.place('citta', { at: [0.65, 0.7], owner: null, minDist: 5 });
    },
    deploy: { first: 'C', O: (m) => h => h.c <= 2 && h.r >= m.H - 3, C: Z.or(Z.edge(2, 'N'), Z.edge(2, 'E')), text: { O: 'entro 2 esagoni dall’angolo sud-ovest', C: 'metà dei punti entro 2 esagoni dai bordi nord ed est; l’altra metà entra nel TG 3' } },
  },
  {
    id: '20.7', group: 'Cooperativi e asimmetrici', title: 'Il Contagio', size: [24, 16], turns: 16, first: 'C',
    points: { O: 140, C: 85 }, req: { O: { _sacre: 3 }, C: { _caster: 3 } },
    mapDesc: '10 esagoni chiave: il Tempio, 5 Città minori dell’Ordine e 4 Pianure scelte dall’Ordine. Il Caos controlla 1 Fenditura e 3 esagoni Corrotti.',
    victory: ['Caos: in una Fase di Fine Turno almeno 6 esagoni chiave Corrotti, oppure il Tempio Corrotto.', 'Ordine: Incantatori del Caos eliminati e Fenditura Sigillata; oppure alla fine del TG 16 meno di 4 esagoni Corrotti e tutte le 5 Città.', 'Altrimenti PV.'],
    layout(ctx) {
      ctx.place('tempio', { at: [0.25, 0.5], owner: 'O', key: true, name: 'Tempio di ' + ctx.name('O'), minDist: 3 });
      [[0.1, 0.2], [0.12, 0.8], [0.4, 0.2], [0.45, 0.75], [0.6, 0.45]].forEach(p => ctx.place('citta', { at: p, owner: 'O', key: true, minDist: 4 }));
      ctx.place('fenditura', { side: 'C', at: [0.85, 0.5], owner: 'C', minDist: 4 });
    },
    post(ctx) {
      const m = ctx.map, r = ctx.rng, F = m.hexes.find(h => h.feature && h.feature.type === 'fenditura');
      let n = 0;
      for (const h of r.shuffle(m.hexes.filter(h => h.terrain === 'pianura' && !h.feature && !m.isBorder(h) && m.half(h) === 'O'))) { if (n >= 4) break; if (m.hexes.some(x => x.key && m.dist(x, h) < 3)) continue; h.key = true; n++; }
      n = 0;
      for (const h of m.hexes.filter(h => !h.feature && !h.key && h.terrain !== 'lago').sort((a, b) => m.dist(a, F) - m.dist(b, F) + r.range(-1, 1))) { if (n >= 3) break; if (m.dist(h, F) < 1) continue; h.state = 'corrotto'; n++; }
    },
  },
  {
    id: '20.8', group: 'Cooperativi e asimmetrici', title: 'L’Ultima Roccaforte', size: [24, 16], turns: 18, first: 'C',
    points: { O: 100, C: 200 }, vetO: true, chaosBoss: 'random', req: { C: { 'Goblin genieri': 2 } },
    mapDesc: 'La fortezza (Castello maggiore con Mura su tutti i lati) e 2 bastioni (Castelli minori adiacenti): i 3 esagoni chiave dell’Ordine.',
    victory: ['Caos: controlla tutti e 3 gli esagoni chiave in una Fase di Fine Turno entro il TG 18.', 'Ordine: Boss del Caos eliminato e il Caos ha perso il 60% dei punti; oppure il Caos non ha vinto entro il TG 18.'],
    layout(ctx) {
      const m = ctx.map, f = ctx.pt(0.4, 0.5);
      ctx.place('castellomag', { hex: f, owner: 'O', name: 'Roccaforte', key: true, minDist: 0 });
      ctx.place('castello', { hex: m.nb(f, 4), owner: 'O', name: 'Bastione Nord', key: true, minDist: 0 });
      ctx.place('castello', { hex: m.nb(f, 1), owner: 'O', name: 'Bastione Sud', key: true, minDist: 0 });
    },
    post(ctx) { ctx.walls(ctx.map.byName('Roccaforte')); },
    deploy: { first: 'O', O: Z.near(['Roccaforte'], 2), C: Z.ring('Roccaforte', 3, 5), text: { O: 'nella fortezza e nei dintorni', C: 'a 3–5 esagoni dalla fortezza' } },
  },
];
