// ============================================================
//  MENU INIZIALE: scenario, schieramento, seme
// ============================================================
const Menu = {
  idx: 0, side: 'O', seed: 0, scroll: 0, preview: null,
  init(p) {
    const sid = p.get('scenario');
    this.idx = Math.max(0, SCENARIOS.findIndex(s => s.id === sid));
    this.seed = +p.get('seed') || ((Math.random() * 1e9) >>> 0);
    const side = p.get('side'); if (side === 'O' || side === 'C') this.side = side; else if (side === 'ai') this.side = null;
    this.fixSide();
  },
  get scn() { return SCENARIOS[this.idx]; },
  fixSide() { if (this.scn.coop && this.side === 'C') this.side = 'O'; },
  start() { App.startGame(this.scn.id, this.seed, this.side); },
  key(e) {
    if (e.key === 'ArrowDown') { this.idx = (this.idx + 1) % SCENARIOS.length; this.fixSide(); }
    if (e.key === 'ArrowUp') { this.idx = (this.idx + SCENARIOS.length - 1) % SCENARIOS.length; this.fixSide(); }
    if (e.key === 'Enter') this.start();
  },
  wheel(x, y, d) { if (x < this.listW) this.scroll = Math.max(0, this.scroll + d); },
  getPreview() {
    const key = this.scn.id + ':' + this.seed;
    if (this.preview && this.preview.key === key) return this.preview;
    try {
      const g = newGame(this.scn.id, this.seed, null);
      const st = renderStaticMap(g);
      this.preview = { key, g, st };
    } catch (e) { console.error(e); this.preview = { key, err: e.message }; }
    return this.preview;
  },
  draw(c) {
    const W = App.W, H = App.H;
    const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#3a2614'); bg.addColorStop(1, '#1c120a');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    // titolo
    c.save(); c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillStyle = '#f2d27a'; c.font = `bold ${W < 700 ? 24 : 34}px ${SERIF}`; c.fillText('Dominio Esagonale', W / 2, 14);
    c.fillStyle = '#c9b48a'; c.font = `italic ${W < 700 ? 13 : 16}px ${SERIF}`; c.fillText('Ordine e Caos', W / 2, W < 700 ? 44 : 54);
    c.restore();
    const top = W < 700 ? 70 : 86;
    const narrow = W < 820;
    const lw = this.listW = narrow ? W - 20 : Math.min(400, W * 0.36);
    const lh = narrow ? Math.min(260, H * 0.33) : H - top - 16;
    // elenco scenari
    c.save(); c.fillStyle = 'rgba(244,232,205,0.06)'; roundRect(c, 10, top, lw, lh, 10); c.fill();
    c.beginPath(); c.rect(10, top, lw, lh); c.clip();
    let y = top + 10 - this.scroll, grp = null;
    SCENARIOS.forEach((s, i) => {
      if (s.group !== grp) { grp = s.group; c.font = `bold 11.5px ${FONT}`; c.fillStyle = '#c9a25a'; c.textBaseline = 'top'; c.textAlign = 'left'; c.fillText(grp.toUpperCase(), 24, y + 4, lw - 30); y += 24; }
      if (y > top - 50 && y < top + lh) {
        App.button(c, 20, y, lw - 20, 40, '', () => { this.idx = i; this.fixSide(); }, { active: i === this.idx });
        c.save(); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#f6e7c4';
        c.font = `bold 13px ${SERIF}`; c.fillText(`${s.id}  ${s.title}`, 32, y + 13, lw - 44);
        c.font = `11px ${FONT}`; c.fillStyle = '#d8c39a';
        c.fillText(`${s.turns} TG · ${s.size[0]}×${s.size[1]}${s.coop ? ' · cooperativo' : ''}`, 32, y + 29, lw - 44);
        c.restore();
      } else App.buttons.push({ x: -1, y: -1, w: 0, h: 0, on: () => { } });
      y += 46;
    });
    c.restore();
    this.maxScroll = Math.max(0, y + this.scroll - top - lh + 10);
    this.scroll = Math.min(this.scroll, this.maxScroll);
    // dettagli
    const s = this.scn;
    const x = narrow ? 10 : lw + 26, dw = narrow ? W - 20 : W - x - 12, dy = narrow ? top + lh + 10 : top, dh = H - dy - 12;
    c.save(); c.fillStyle = '#f4e8cd'; roundRect(c, x, dy, dw, dh, 10); c.fill(); c.strokeStyle = '#7a5530'; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.rect(x, dy, dw, dh); c.clip();
    let yy = dy + 14;
    const T = (t, o = {}) => { c.font = `${o.b ? 'bold ' : ''}${o.i ? 'italic ' : ''}${o.s || 13}px ${o.serif ? SERIF : FONT}`; c.fillStyle = o.col || '#2b1a0c'; c.textBaseline = 'top'; c.textAlign = 'left'; for (const l of wrap(c, t, (o.w || dw - 32))) { c.fillText(l, x + 16 + (o.dx || 0), yy); yy += (o.s || 13) * 1.35; } yy += o.after ?? 3; };
    // anteprima della mappa
    const pv = this.getPreview();
    const pw = narrow ? 0 : Math.min(dw * 0.45, 420);
    if (pv && pv.st && pw > 120) {
      const ph = pw * pv.st.H / pv.st.W;
      c.drawImage(pv.st.canvas, x + dw - pw - 16, dy + 16, pw, ph);
      c.strokeStyle = '#7a5530'; c.lineWidth = 1.5; c.strokeRect(x + dw - pw - 16, dy + 16, pw, ph);
      // pedine in miniatura
      const sc = pw / pv.st.W;
      for (const u of pv.g.units) if (u.hex !== null && !u.reserve) { const h = pv.g.map.hexes[u.hex]; c.fillStyle = PAL.faction[u.fac]; c.fillRect(x + dw - pw - 16 + (h.x + MARGIN) * sc - 3, dy + 16 + (h.y + MARGIN) * sc - 3, 6, 6); }
    }
    const tw = dw - 32 - (pw > 120 ? pw + 16 : 0);
    T(s.group + ' · ' + s.id, { s: 11.5, col: '#7a5530', after: 0, w: tw });
    T(s.title, { b: true, s: 22, serif: true, after: 6, w: tw });
    T(s.mapDesc, { i: true, s: 13, serif: true, after: 8, w: tw });
    T(`Durata ${s.turns} Turni di Gioco · primo giocatore ${FACTION_NAME[s.first]}${s.coop ? ' · il Caos è automatico' : ''}`, { s: 12.5, w: tw });
    if (pv && pv.g) {
      for (const f of ['O', 'C']) { const L = pv.g.units.filter(u => u.fac === f); if (!L.length) continue; const cmd = L.find(u => u.commander); T(`${FACTION_NAME[f]}: ${L.length} pedine, ${armyCost(L)} punti${cmd ? ', comandante ' + uname(cmd) : ''}`, { s: 12, col: PAL.faction[f], b: true, w: tw, after: 1 }); }
    }
    yy += 6;
    c.font = `bold 11px ${FONT}`; c.fillStyle = '#8a5a22'; c.fillText('VITTORIA', x + 16, yy); yy += 18;
    for (const v of s.victory) T('• ' + v, { s: 12, w: tw });
    yy = Math.max(yy + 10, pw > 120 && pv && pv.st ? dy + 32 + pw * pv.st.H / pv.st.W : 0);
    // opzioni
    c.font = `bold 11px ${FONT}`; c.fillStyle = '#8a5a22'; c.fillText('LA TUA PARTE', x + 16, yy); yy += 18;
    c.restore();
    const opt = [['O', 'Ordine'], ['C', 'Caos'], [null, 'IA contro IA']];
    let bx = x + 16;
    const ow = Math.min(130, (dw - 32 - 16) / 3);
    for (const [f, l] of opt) {
      const dis = f === 'C' && s.coop;
      App.button(c, bx, yy, ow, 34, l, () => { this.side = f; }, { active: this.side === f, disabled: dis, bold: true, color: this.side === f ? (f === 'O' ? '#2a4a8a' : f === 'C' ? '#7a1a26' : '#6a4a10') : undefined });
      bx += ow + 8;
    }
    yy += 46;
    App.button(c, x + 16, yy, 150, 30, `Seme ${this.seed}`, () => { }, { size: 12 });
    App.button(c, x + 172, yy, 130, 30, '🎲 Nuova mappa', () => { this.seed = (Math.random() * 1e9) >>> 0; }, { size: 12 });
    yy += 44;
    App.button(c, x + 16, yy, Math.min(300, dw - 32), 46, 'Gioca ▶', () => this.start(), { bold: true, size: 17, color: '#2f6a2a' });
  },
};
