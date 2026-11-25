// ============================================================
//  HUD: barra superiore, barra delle fasi, registro, finestre
// ============================================================
const Hud = {
  top(c) {
    const g = App.g, W = App.W;
    c.save();
    const grd = c.createLinearGradient(0, 0, 0, 48); grd.addColorStop(0, '#4a2f18'); grd.addColorStop(1, '#2e1d0f');
    c.fillStyle = grd; c.fillRect(0, 0, W, 48); c.fillStyle = '#c9a25a'; c.fillRect(0, 47, W, 1.5);
    c.restore();
    App.button(c, 8, 9, 64, 30, '☰ Menu', () => Modals.menu(), { size: 12 });
    let x = 82;
    c.save(); c.textBaseline = 'middle'; c.textAlign = 'left';
    const wide = W > 1250;
    if (wide) { c.fillStyle = '#f2d27a'; c.font = `bold 15px ${SERIF}`; c.fillText(`${g.scn.id} ${g.scn.title}`, x, 17, 300); c.fillStyle = '#c9b48a'; c.font = `italic 11.5px ${SERIF}`; c.fillText(`Seme ${g.seed}${g.human ? ' · tu giochi ' + FACTION_NAME[g.human] : ' · IA contro IA'}`, x, 34, 300); x += 310; }
    // turno e fase
    c.fillStyle = '#f6e7c4'; c.font = `bold 15px ${FONT}`;
    const tt = `TG ${g.turn}/${g.scn.turns}`; c.fillText(tt, x, 24); x += c.measureText(tt).width + 12;
    const fac = g.active, fc = fac === 'O' ? '#3d6fd0' : '#c0283a';
    const ph = g.phase === 'combat' ? `${PHASE_NAME.combat}: ${STEP_NAME[Math.min(3, g.step)]}` : PHASE_NAME[g.phase] || g.phase;
    const lab = `${FACTION_NAME[fac]} · ${ph}`; c.font = `bold 13px ${FONT}`;
    const lw = c.measureText(lab).width + 22;
    c.fillStyle = fc; roundRect(c, x, 11, lw, 26, 13); c.fill(); c.fillStyle = '#fff'; c.fillText(lab, x + 11, 24.5); x += lw + 14;
    // risorse
    const res = (f, xx) => {
      const col = f === 'O' ? '#8fb4ff' : '#ff8f9a';
      c.fillStyle = col; c.font = `bold 12px ${FONT}`; c.fillText(FACTION_NAME[f], xx, 16);
      c.fillStyle = '#f6e7c4'; c.font = `12px ${FONT}`;
      const n = g.friends(f).length;
      c.fillText(`${g.gold[f]} Oro · ${g.pv(f)} PV · ${n} unità`, xx, 33);
    };
    if (W > 900) { res('O', x); res('C', x + 150); x += 300; }
    c.restore();
    let bx = W - 8;
    const B = (w, label, on, active) => { bx -= w; if (bx < x) return; App.button(c, bx, 9, w, 30, label, on, { active, size: 12 }); bx -= 6; };
    B(34, '?', () => App.show.help = !App.show.help, App.show.help);
    B(70, 'Legenda', () => App.show.legend = !App.show.legend, App.show.legend);
    B(70, 'Registro', () => App.show.log = !App.show.log, App.show.log);
    B(60, 'Adatta', () => App.fit());
    B(62, `▶ ×${App.speed}`, () => App.speed = App.speed >= 4 ? 1 : App.speed * 2);
  },
  bottom(c) {
    const g = App.g, W = App.W - App.panelW, H = App.H, y = H - 56;
    c.save();
    c.fillStyle = 'rgba(36,24,12,0.92)'; roundRect(c, 8, y, W - 16, 48, 8); c.fill(); c.strokeStyle = '#a07a4a'; c.lineWidth = 1; c.stroke();
    c.restore();
    // fasi
    const phases = [['recruit', 'Reclutamento'], ['move', 'Movimento'], ['combat', 'Combattimento'], ['final', 'Fine']];
    let x = 18;
    c.save(); c.textBaseline = 'middle'; c.font = `12px ${FONT}`;
    const compact = W < 900;
    if (!compact) for (const [k, l] of phases) {
      const cur = g.phase === k || (k === 'final' && (g.phase === 'final' || g.phase === 'endTG'));
      const lab = k === 'combat' && cur ? `${l}: ${STEP_NAME[Math.min(3, g.step)]}` : l;
      const w = c.measureText(lab).width + 18;
      c.fillStyle = cur ? '#8a5a22' : 'rgba(255,255,255,0.06)'; roundRect(c, x, y + 12, w, 24, 12); c.fill();
      c.fillStyle = cur ? '#fff' : '#a89070'; c.fillText(lab, x + 9, y + 24.5); x += w + 6;
    }
    c.restore();
    const bw = 190, bxx = W - 8 - bw - 8;
    if (g.winner) { App.button(c, bxx, y + 7, bw, 34, 'Risultato', () => Modals.over(), { bold: true, color: '#6a4a10' }); return; }
    if (g.phase === 'deploy' && g.human) {
      const f = () => Deploy.finish();
      App.advanceButton = f; App.button(c, bxx, y + 7, bw, 34, 'Inizia la partita ▶', f, { bold: true, color: '#2f6a2a' });
      this.hint(c, x, y, 'Trascina la mappa, tocca una tua pila e poi un esagono della tua zona per spostarla.'); return;
    }
    if (!App.isHumanTurn()) {
      this.hint(c, x, y, App.g.human ? `L’avversario sta giocando…` : 'IA contro IA');
      return;
    }
    const busy = App.busy();
    let main = null, label = '', second = null;
    if (g.phase === 'recruit') { label = 'Al Movimento ▶'; main = () => { g.nextPhase(); App.afterAction(); }; }
    else if (g.phase === 'move') { label = 'Al Combattimento ▶'; main = () => { App.mode = null; g.nextPhase(); App.afterAction(); }; }
    else if (g.phase === 'combat') {
      label = 'Fine turno ▶'; main = () => { App.mode = null; App.sel = null; App.picked = new Set(); g.nextPhase(); App.afterAction(); };
      if (g.step < 3) second = ['Azioni speciali', () => { App.mode = null; g.toSpecialStep(); App.afterAction(); }];
    }
    if (main) { const f = () => { if (!App.busy()) main(); }; App.advanceButton = f; App.button(c, bxx, y + 7, bw, 34, label, f, { bold: true, color: g.phase === 'combat' ? '#7a2a1a' : '#2f6a2a', disabled: busy }); }
    if (second) App.button(c, bxx - 150, y + 7, 142, 34, second[0], second[1], { disabled: busy });
    const tip = {
      recruit: 'Tocca un tuo insediamento per reclutare o costruire. Pozioni e addestramento sono nel pannello delle unità.',
      move: 'Tocca una tua pila: verdi gli esagoni raggiungibili. M = Marcia Forzata. Tasto destro o Esc per annullare.',
      combat: ['Seleziona un incantatore e scegli una magia dal pannello, oppure attacca subito.', 'Tocca un nemico evidenziato per tirare a distanza.', 'Tocca un nemico adiacente per la mischia.', 'Purificare, Corrompere, Esplorare: dal pannello delle unità.'][Math.min(3, g.step)],
    }[g.phase];
    if (tip) this.hint(c, x, y, tip, bxx - (second ? 160 : 10) - x);
  },
  hint(c, x, y, t, w) { c.save(); c.fillStyle = '#d8c39a'; c.font = `italic 12px ${FONT}`; c.textBaseline = 'middle'; c.fillText(t, x + 6, y + 24.5, w || (App.W - App.panelW - x - 230)); c.restore(); },
  log(c) {
    const g = App.g, W = Math.min(520, App.W - App.panelW - 70), open = App.show.log;
    const lines = open ? 18 : 4, lh = 15, h = lines * lh + 14, x = 56, y = App.H - 64 - h;
    App.logRect = { x, y, w: W, h };
    c.save();
    c.fillStyle = open ? 'rgba(244,232,205,0.96)' : 'rgba(30,18,8,0.55)'; roundRect(c, x, y, W, h, 7); c.fill();
    if (open) { c.strokeStyle = '#7a5530'; c.stroke(); }
    c.beginPath(); c.rect(x, y + 4, W, h - 8); c.clip();
    c.font = `11.5px ${FONT}`; c.textBaseline = 'top';
    const L = g.log, maxScroll = Math.max(0, (L.length - lines) * lh);
    App.logScroll = Math.min(App.logScroll, maxScroll);
    const off = open ? App.logScroll : 0;
    const start = Math.max(0, L.length - lines - Math.floor(off / lh));
    for (let i = 0; i < lines && start + i < L.length; i++) {
      const l = L[start + i];
      const col = open ? (l.kind === 'turn' ? '#6a3a10' : l.kind === 'bad' ? '#8a1a1a' : l.kind === 'good' ? '#1a5a1a' : l.fac === 'O' ? '#1e3c78' : '#6a1420')
        : (l.kind === 'turn' ? '#f2d27a' : l.kind === 'bad' ? '#ffb0a0' : l.kind === 'good' ? '#b0f0b0' : l.fac === 'O' ? '#c0d4ff' : '#ffc4c8');
      c.fillStyle = col; c.font = `${l.kind === 'turn' ? 'bold ' : ''}11.5px ${FONT}`;
      c.fillText(l.text, x + 10, y + 7 + i * lh, W - 20);
    }
    c.restore();
    App.button(c, x + W - 26, y + 3, 22, 18, open ? '▾' : '▴', () => App.show.log = !App.show.log, { size: 11 });
  },
  zoom(c) {
    const x = 12, y = App.H - 140;
    App.button(c, x, y, 34, 34, '+', () => App.zoomAt((App.W - App.panelW) / 2, App.H / 2, 1.25), { size: 18 });
    App.button(c, x, y + 38, 34, 34, '−', () => App.zoomAt((App.W - App.panelW) / 2, App.H / 2, 0.8), { size: 18 });
  },
  tooltip(c) {
    const g = App.g, h = App.hover, [mx, my] = App.mouse;
    let t = TERRAIN[h.terrain].name;
    if (h.feature) t = h.feature.name + ' · ' + (h.feature.type === 'testa' ? 'Testa di guado' : TERRAIN[h.terrain].name) + (h.owner ? ' (' + FACTION_NAME[h.owner] + ')' : '');
    if (h.state !== 'normale') t += h.state === 'corrotto' ? ' · Corrotto' : ' · Purificato';
    const st = g.unitsAt(h.id); if (st.length) t += ` · ${st.length} ${st.length === 1 ? 'unità' : 'unità'} ${FACTION_NAME[st[0].fac] || ''}`;
    // anteprima d'attacco
    if (App.isHumanTurn() && g.phase === 'combat' && g.enemyAt(h.id, g.active)) {
      const pk = App.pickedUnits();
      const rc = g.step <= 1 ? g.rangedCandidates(h.id) : [], mc = g.meleeCandidates(h.id);
      const useR = rc.length && (pk.some(u => rc.includes(u)) || !mc.length);
      const cand = useR ? rc : mc; const sel = pk.filter(u => cand.includes(u));
      const us = sel.length ? sel : cand;
      if (us.length) { const pv = useR ? g.rangedPreview(us, h.id) : g.meleePreview(us, h.id); t += useR ? ` · Tiro: colonna ${pv.colName}` : ` · Mischia ${pv.ftA}:${pv.ftD} → colonna ${pv.colName}`; }
    }
    c.save(); c.font = `12px ${FONT}`; const w = Math.min(520, c.measureText(t).width + 16);
    let x = mx + 16, y = my + 18; if (x + w > App.W - App.panelW) x = mx - w - 10;
    c.fillStyle = 'rgba(30,18,8,0.9)'; roundRect(c, x, y, w, 24, 5); c.fill();
    c.fillStyle = '#f6e7c4'; c.textBaseline = 'middle'; c.fillText(t, x + 8, y + 12.5, w - 16); c.restore();
  },
  toast(c) {
    const t = App.toast; const W = App.W - App.panelW;
    c.save(); c.font = `bold 13px ${FONT}`; const w = Math.min(W - 40, c.measureText(t.text).width + 28);
    c.fillStyle = 'rgba(120,30,20,0.94)'; roundRect(c, (W - w) / 2, 60, w, 32, 8); c.fill();
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t.text, W / 2, 76.5, w - 20); c.restore();
  },
};

// ------------------------------------------------------------
//  Finestre modali
// ------------------------------------------------------------
const Modals = {
  open(m) { App.modal = m; },
  sack() {
    const g = App.g, p = g.pendingSack, h = g.map.hexes[p.hex];
    const opts = p.fac === 'O'
      ? [['Requisizione', 'requisition', 'tiro –1, la città non resta saccheggiata'], ['Saccheggio', 'normal', 'tiro normale, rendita dimezzata per 2 turni'], ['Nessuno', 'none', '']]
      : [['Saccheggio violento', 'violent', 'tiro +1, rischio di Corruzione della città'], ['Saccheggio', 'normal', 'tiro normale'], ['Nessuno', 'none', '']];
    this.open({ title: `Hai conquistato ${h.feature.name}`, text: h.sacked ? 'La città è già stata saccheggiata di recente (–2 al tiro).' : 'Vuoi saccheggiarla?', options: opts.map(([l, mode, sub]) => ({ label: l, sub, on: () => { App.modal = null; g.sack(p.hex, mode); App.afterAction(); } })) });
  },
  advance(uids, hid) {
    const g = App.g, h = g.map.hexes[hid];
    this.open({ title: 'Avanzata dopo il combattimento', text: `L’esagono ${g.hexLabel(hid)} è libero. Vuoi avanzare con le unità che hanno attaccato (${uids.length})?`, options: [
      { label: 'Avanza', on: () => { App.modal = null; g.advance(uids, hid); App.sel = h; App.afterAction(); } },
      { label: 'Resta sul posto', on: () => { App.modal = null; } },
    ] });
  },
  over() {
    const g = App.g, w = g.winner, hu = g.human;
    const title = w === 'draw' ? 'Partita pari' : hu ? (w === hu ? 'Vittoria!' : 'Sconfitta') : `Vince ${FACTION_NAME[w]}`;
    this.open({ title, text: `${g.result}\n\nPunti Vittoria: Ordine ${g.pv('O')}, Caos ${g.pv('C')}. Unità eliminate: Ordine ${g.eliminated.filter(e => e.fac === 'O').length}, Caos ${g.eliminated.filter(e => e.fac === 'C').length}.`, options: [
      { label: 'Nuova partita', on: () => { App.modal = null; App.screen = 'menu'; App.overShown = false; } },
      { label: 'Rivedi la mappa', on: () => { App.modal = null; } },
    ] });
  },
  menu() {
    this.open({ title: 'Menu', text: 'La partita in corso andrà persa se torni alla scelta dello scenario.', options: [
      { label: 'Continua a giocare', on: () => { App.modal = null; } },
      { label: 'Torna ai scenari', on: () => { App.modal = null; App.screen = 'menu'; App.overShown = false; App.ai = null; } },
    ] });
  },
  draw(c) {
    const m = App.modal, W = App.W, H = App.H;
    c.save(); c.fillStyle = 'rgba(15,8,3,0.55)'; c.fillRect(0, 0, W, H);
    const w = Math.min(460, W - 30);
    c.font = `13px ${FONT}`; const lines = wrap(c, m.text || '', w - 40);
    const h = 70 + lines.length * 18 + m.options.length * 46 + 10;
    const x = (W - w) / 2, y = Math.max(20, (H - h) / 2);
    c.fillStyle = '#f4e8cd'; roundRect(c, x, y, w, h, 10); c.fill(); c.strokeStyle = '#7a5530'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#2b1a0c'; c.font = `bold 19px ${SERIF}`; c.textBaseline = 'top'; c.fillText(m.title, x + 20, y + 16, w - 40);
    c.font = `13px ${FONT}`; c.fillStyle = '#3b2a1a'; lines.forEach((l, i) => c.fillText(l, x + 20, y + 50 + i * 18));
    c.restore();
    let yy = y + 60 + lines.length * 18;
    for (const o of m.options) { App.button(c, x + 20, yy, w - 40, 38, o.label + (o.sub ? ' · ' + o.sub : ''), o.on, { bold: !o.sub, size: 13 }); yy += 46; }
    App.buttons.unshift({ x: 0, y: 0, w: W, h: H, on: () => { } });
  },
  drawHelp(c) {
    const W = App.W, H = App.H;
    c.save(); c.fillStyle = 'rgba(15,8,3,0.55)'; c.fillRect(0, 48, W, H - 48);
    const w = Math.min(640, W - 30), h = Math.min(520, H - 80), x = (W - w) / 2, y = 62;
    c.fillStyle = '#f4e8cd'; roundRect(c, x, y, w, h, 10); c.fill(); c.strokeStyle = '#7a5530'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#2b1a0c'; c.font = `bold 18px ${SERIF}`; c.textBaseline = 'top'; c.fillText('Come si gioca', x + 20, y + 14);
    const txt = [
      'Ogni Turno di Gioco ha due turni giocatore. Nel tuo turno passi per Reclutamento, Movimento e Combattimento (Magie, Tiro, Mischia, Azioni speciali), poi premi “Fine turno”.',
      'Reclutamento: tocca un tuo insediamento. Nel pannello trovi le unità reclutabili, le costruzioni e (Ordine) l’addestramento o (Caos) la Mutazione Forzata.',
      'Movimento: tocca una tua pila. Con le caselle del pannello scegli quali unità muovere. Gli esagoni verdi sono raggiungibili, passandoci sopra vedi il percorso e il costo in PM. Il tasto M attiva la Marcia Forzata.',
      'Combattimento: tocca un esagono nemico evidenziato (arancio per il tiro, rosso per la mischia). Nel pannello vedi la colonna, gli spostamenti e le probabilità di ogni risultato; scegli gli attaccanti e premi “Attacca”.',
      'Magie: seleziona un incantatore, premi “Magie” nella sua scheda, scegli l’incantesimo e tocca il bersaglio. Le magie si lanciano prima di tiri e mischie.',
      'Le scritte sulle pedine: barra verde/rossa = Resistenza, S Stanco, E Esausto, C Corrotto, V Vacillante, ✦ oggetti. Grigio barrato = Disgregato. Le pedine scurite hanno già agito.',
      'Comandi: trascina per spostare la mappa, rotella o pizzico per lo zoom, tasto destro o Esc per annullare, Invio per passare alla fase successiva, L per il registro.',
    ];
    let yy = y + 48; c.font = `13px ${FONT}`; c.fillStyle = '#3b2a1a';
    for (const t of txt) { for (const l of wrap(c, t, w - 40)) { c.fillText(l, x + 20, yy); yy += 17.5; } yy += 8; }
    c.restore();
  },
};

// ------------------------------------------------------------
//  Legenda
// ------------------------------------------------------------
const Legend = {
  draw(c) {
    c.save(); c.fillStyle = 'rgba(15,8,3,0.55)'; c.fillRect(0, 48, App.W, App.H - 48);
    const w = Math.min(760, App.W - 30), hh = Math.min(500, App.H - 80), x = (App.W - w) / 2, y = 62;
    c.fillStyle = '#f4e8cd'; roundRect(c, x, y, w, hh, 10); c.fill(); c.strokeStyle = '#7a5530'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#2b1a0c'; c.font = `bold 17px ${SERIF}`; c.textBaseline = 'top'; c.fillText('Legenda', x + 18, y + 12);
    const items = [['pianura', 'Pianura'], ['collina', 'Collina'], ['bosco', 'Bosco'], ['palude', 'Palude'], ['deserto', 'Deserto'], ['montagna', 'Montagna'], ['lago', 'Lago']];
    const fm = { seed: App.g.seed, regions: [{ side: 'O', pal: 0 }], half: () => 'O' };
    const cols = Math.max(2, Math.floor((w - 20) / 185));
    let i = 0;
    const cell = (draw, label) => {
      const cx = x + 20 + (i % cols) * ((w - 40) / cols), cy = y + 50 + Math.floor(i / cols) * 62; i++;
      c.save(); c.translate(cx + 24, cy + 24); c.scale(0.55, 0.55); draw(); c.restore();
      c.fillStyle = '#2b1a0c'; c.font = `12px ${FONT}`; c.textBaseline = 'middle'; c.fillText(label, cx + 56, cy + 24);
    };
    for (const [t, l] of items) cell(() => { const h = { id: 7 + i, x: 0, y: 0, base: t, terrain: t, region: 0 }; hexPath(c, 0, 0); c.fillStyle = hexFill(fm, h); c.fill(); if (t === 'lago') { c.fillStyle = '#9ad7ee'; hexPath(c, 0, 0, HEX * 0.85); c.fill(); } else drawTerrain(c, fm, h); c.strokeStyle = 'rgba(90,40,10,0.5)'; hexPath(c, 0, 0); c.stroke(); }, l);
    const feats = [['citta', 'Città minore'], ['castello', 'Castello minore'], ['castellomag', 'Castello maggiore'], ['capitale', 'Capitale'], ['tempio', 'Tempio dell’Ordine'], ['altare', 'Altare del Caos'], ['fenditura', 'Fenditura del Caos'], ['rovina', 'Rovina']];
    for (const [t, l] of feats) cell(() => { hexPath(c, 0, 0); c.fillStyle = '#f0c470'; c.fill(); c.strokeStyle = 'rgba(90,40,10,0.5)'; c.stroke(); drawFeature(c, fm, { x: 0, y: 0, terrain: t, feature: { type: t, owner: 'O' } }); }, l);
    const line = (fn) => () => { hexPath(c, 0, 0); c.fillStyle = '#f0c470'; c.fill(); c.strokeStyle = 'rgba(90,40,10,0.5)'; c.stroke(); fn(); };
    cell(line(() => { c.lineCap = 'round'; c.strokeStyle = '#2f7fae'; c.lineWidth = 7; c.beginPath(); c.moveTo(-36, 10); c.quadraticCurveTo(0, -20, 36, 10); c.stroke(); c.strokeStyle = '#7fcdea'; c.lineWidth = 4; c.stroke(); }), 'Fiume (sui lati)');
    cell(line(() => { c.strokeStyle = '#24150a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-36, 0); c.lineTo(36, 0); c.stroke(); }), 'Strada principale');
    cell(line(() => { c.strokeStyle = '#24150a'; c.lineWidth = 3; c.setLineDash([9, 6]); c.beginPath(); c.moveTo(-36, 0); c.lineTo(36, 0); c.stroke(); }), 'Strada secondaria');
    cell(line(() => { c.strokeStyle = 'rgba(60,30,10,0.85)'; c.lineWidth = 6; c.beginPath(); for (let k = 0; k <= 8; k++) c.lineTo(-34 + k * 8.5, k % 2 ? 3 : -2); c.stroke(); c.strokeStyle = '#fffaf0'; c.lineWidth = 3; c.stroke(); }), 'Cresta (lato)');
    cell(line(() => { c.strokeStyle = '#cfc6b4'; c.lineWidth = 8; c.beginPath(); c.moveTo(-34, 0); c.lineTo(34, 0); c.stroke(); }), 'Mura (lato)');
    cell(line(() => { c.fillStyle = 'rgba(80,10,90,0.35)'; hexPath(c, 0, 0); c.fill(); }), 'Esagono Corrotto');
    cell(line(() => { c.fillStyle = 'rgba(255,250,200,0.8)'; hexPath(c, 0, 0, HEX * 0.7); c.fill(); }), 'Esagono Purificato');
    cell(line(() => { c.setLineDash([5, 4]); c.strokeStyle = '#b8860b'; c.lineWidth = 3; hexPath(c, 0, 0, HEX * 0.86); c.stroke(); }), 'Esagono chiave');
    c.fillStyle = '#5a4026'; c.font = `italic 11.5px ${FONT}`; c.textBaseline = 'top';
    c.fillText('Ponti e guadi compaiono dove strade e fiumi si incrociano. Bandierine: blu Ordine, rosso Caos, grigio neutrale.', x + 18, y + hh - 24, w - 36);
    c.restore();
  },
};
