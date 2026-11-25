// ============================================================
//  INTERFACCIA (tutto nel canvas)
// ============================================================
const DIR_NAMES = ['sud-est', 'sud', 'sud-ovest', 'nord-ovest', 'nord', 'nord-est'];
const FONT = 'DejaVu Sans, Segoe UI, Verdana, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

const App = {
  cv: null, ctx: null, dpr: 1, W: 0, H: 0,
  game: null, stat: null,
  cam: { x: 0, y: 0, z: 1 },
  hover: null, sel: null,
  show: { zones: true, units: true, legend: false, list: false, panel: true },
  buttons: [], panelScroll: 0, panelContentH: 0, listScroll: 0,
  pointers: new Map(), drag: null, fade: 0,

  init() {
    this.cv = document.getElementById('c'); this.ctx = this.cv.getContext('2d');
    addEventListener('resize', () => this.resize()); this.resize();
    this.bindInput();
    let p; try { p = new URLSearchParams(location.hash.slice(1)); } catch (e) { p = new URLSearchParams(); }
    const sid = p.get('scenario'), seed = +p.get('seed');
    const idx = Math.max(0, SCENARIOS.findIndex(s => s.id === sid));
    loadSprites().then(() => {
      this.newGame(idx, seed || ((Math.random() * 1e9) >>> 0));
      const ui = p.get('ui'), sel = p.get('sel');
      if (ui === 'legend') this.show.legend = true; if (ui === 'list') this.show.list = true;
      if (sel) { this.sel = this.game.map.at(+sel.slice(0, 2) - 1, +sel.slice(2) - 1); }
      if (p.get('zoom')) { const h = this.sel || this.game.map.hexes[0]; this.cam.z = +p.get('zoom'); this.cam.x = (this.W - this.panelW) / 2 - h.x * this.cam.z; this.cam.y = this.H / 2 - h.y * this.cam.z; }
      this.loop();
    });
  },
  resize() {
    this.dpr = window.devicePixelRatio || 1; this.W = innerWidth; this.H = innerHeight;
    this.cv.width = Math.round(this.W * this.dpr); this.cv.height = Math.round(this.H * this.dpr);
    this.cv.style.width = this.W + 'px'; this.cv.style.height = this.H + 'px';
    this.show.panel = this.W >= 900 ? this.show.panel : false;
    if (this.stat) this.fit();
  },
  get panelW() { return this.show.panel ? Math.min(340, this.W * 0.42) : 0; },
  newGame(idx, seed) {
    const scn = SCENARIOS[idx];
    UID = 1;
    const t0 = performance.now();
    const ctx = generateMap(scn, seed);
    const { A, notes } = makeArmies(scn, new RNG(seed + 99));
    const dep = deployAll(ctx, A);
    this.game = { idx, scn, seed, ctx, map: ctx.map, units: dep.units, A, zones: dep.zones, depText: dep.depText, depFirst: dep.depFirst, notes: [...ctx.notes, ...notes, ...dep.notes] };
    this.stat = renderStaticMap(this.game);
    this.genMs = Math.round(performance.now() - t0);
    this.sel = null; this.panelScroll = 0; this.t0 = performance.now();
    try { history.replaceState(null, '', '#scenario=' + scn.id + '&seed=' + seed); } catch (e) { }
    this.fit();
  },
  fit() {
    const top = 52, aw = this.W - this.panelW - 20, ah = this.H - top - 20;
    const z = Math.min(aw / this.stat.W, ah / this.stat.H);
    this.cam.z = Math.max(0.2, z);
    this.cam.x = 10 + (aw - this.stat.W * this.cam.z) / 2 + MARGIN * this.cam.z;
    this.cam.y = top + (ah - this.stat.H * this.cam.z) / 2 + MARGIN * this.cam.z;
  },
  toWorld(sx, sy) { return [(sx - this.cam.x) / this.cam.z, (sy - this.cam.y) / this.cam.z]; },
  zoomAt(sx, sy, f) {
    const [wx, wy] = this.toWorld(sx, sy);
    this.cam.z = Math.max(0.15, Math.min(4, this.cam.z * f));
    this.cam.x = sx - wx * this.cam.z; this.cam.y = sy - wy * this.cam.z;
  },
  // ---------------- input
  bindInput() {
    const cv = this.cv;
    cv.addEventListener('contextmenu', e => e.preventDefault());
    cv.addEventListener('wheel', e => {
      e.preventDefault();
      if (this.show.list) { this.listScroll = Math.max(0, this.listScroll + e.deltaY); return; }
      if (this.show.panel && e.clientX > this.W - this.panelW) { this.panelScroll = Math.max(0, Math.min(this.panelScroll + e.deltaY, Math.max(0, this.panelContentH - (this.H - 60)))); return; }
      this.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015));
    }, { passive: false });
    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (this.pointers.size === 1) this.drag = { sx: e.clientX, sy: e.clientY, cx: this.cam.x, cy: this.cam.y, moved: false, onUI: this.uiHit(e.clientX, e.clientY) };
      else if (this.pointers.size === 2) { const [a, b] = [...this.pointers.values()]; this.pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: this.cam.z }; if (this.drag) this.drag.moved = true; }
    });
    cv.addEventListener('pointermove', e => {
      if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (this.pointers.size === 2 && this.pinch) {
        const [a, b] = [...this.pointers.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        this.zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (this.pinch.z * d / this.pinch.d) / this.cam.z); return;
      }
      if (this.drag && !this.drag.onUI) {
        const dx = e.clientX - this.drag.sx, dy = e.clientY - this.drag.sy;
        if (Math.abs(dx) + Math.abs(dy) > 5) this.drag.moved = true;
        if (this.drag.moved) { this.cam.x = this.drag.cx + dx; this.cam.y = this.drag.cy + dy; }
      }
      this.mouse = [e.clientX, e.clientY];
      this.hover = this.uiHit(e.clientX, e.clientY) ? null : this.hexAt(e.clientX, e.clientY);
    });
    const up = e => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinch = null;
      if (this.drag && this.pointers.size === 0) {
        if (!this.drag.moved) this.click(e.clientX, e.clientY);
        this.drag = null;
      }
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    addEventListener('keydown', e => {
      if (e.key === 'r' || e.key === 'R') this.newGame(this.game.idx, (Math.random() * 1e9) >>> 0);
      if (e.key === 'ArrowRight') this.newGame((this.game.idx + 1) % SCENARIOS.length, this.game.seed);
      if (e.key === 'ArrowLeft') this.newGame((this.game.idx + SCENARIOS.length - 1) % SCENARIOS.length, this.game.seed);
      if (e.key === 'Escape') { this.show.list = false; this.show.legend = false; this.sel = null; }
      if (e.key === '+') this.zoomAt(this.W / 2, this.H / 2, 1.2);
      if (e.key === '-') this.zoomAt(this.W / 2, this.H / 2, 1 / 1.2);
    });
  },
  hexAt(sx, sy) { const [wx, wy] = this.toWorld(sx, sy); return this.game ? this.game.map.hexAtPoint(wx, wy) : null; },
  uiHit(x, y) {
    if (y < 48) return true;
    if (this.show.list || this.show.legend) return true;
    if (this.show.panel && x > this.W - this.panelW) return true;
    return this.buttons.some(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
  },
  click(x, y) {
    for (const b of [...this.buttons].reverse()) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { b.on(); return; }
    if (this.show.list || this.show.legend) { this.show.list = false; this.show.legend = false; return; }
    if (this.uiHit(x, y)) return;
    const h = this.hexAt(x, y);
    this.sel = h && h !== this.sel ? h : null;
    if (this.sel && !this.show.panel) this.show.panel = true;
    this.panelScroll = 0;
  },
  // ---------------- ciclo di disegno
  loop() {
    const step = () => { this.draw(); requestAnimationFrame(step); };
    requestAnimationFrame(step);
  },
  draw() {
    const c = this.ctx, d = this.dpr; this.buttons = [];
    c.setTransform(d, 0, 0, d, 0, 0);
    c.fillStyle = '#2b1d12'; c.fillRect(0, 0, this.W, this.H);
    if (!this.game) return;
    this.fade = Math.min(1, (performance.now() - this.t0) / 450);
    // mappa
    const z = this.cam.z;
    c.setTransform(d * z, 0, 0, d * z, d * this.cam.x, d * this.cam.y);
    c.globalAlpha = this.fade;
    c.imageSmoothingQuality = 'high';
    c.drawImage(this.stat.canvas, -MARGIN, -MARGIN, this.stat.W, this.stat.H);
    c.globalAlpha = 1;
    const m = this.game.map;
    if (this.show.zones) this.drawZones(c, m);
    if (this.hover) { c.save(); hexPath(c, this.hover.x, this.hover.y, HEX * 0.95); c.strokeStyle = 'rgba(255,255,240,0.9)'; c.lineWidth = 2.5 / Math.max(z, 0.6); c.stroke(); c.restore(); }
    if (this.sel) { c.save(); hexPath(c, this.sel.x, this.sel.y, HEX * 0.95); c.strokeStyle = '#fff'; c.lineWidth = 4; c.setLineDash([8, 5]); c.lineDashOffset = -performance.now() / 50; c.stroke(); c.restore(); }
    if (this.show.units) this.drawUnits(c, m);
    // interfaccia
    c.setTransform(d, 0, 0, d, 0, 0);
    this.drawTopBar(c);
    if (this.show.panel) this.drawPanel(c);
    else this.button(c, this.W - 92, 56, 82, 30, 'ℹ Dettagli', () => { this.show.panel = true; this.fit(); });
    this.drawZoomButtons(c);
    if (this.hover && !this.show.list && !this.show.legend) this.drawTooltip(c);
    if (this.show.legend) this.drawLegend(c);
    if (this.show.list) this.drawList(c);
  },
  drawZones(c, m) {
    const z = this.game.zones;
    for (const fac of ['O', 'C']) {
      if (!z[fac]) continue;
      c.save();
      c.fillStyle = fac === 'O' ? 'rgba(40,100,200,0.14)' : 'rgba(200,30,50,0.14)';
      c.strokeStyle = fac === 'O' ? 'rgba(30,70,160,0.85)' : 'rgba(150,20,40,0.85)';
      for (const id of z[fac]) { const h = m.hexes[id]; hexPath(c, h.x, h.y, HEX); c.fill(); }
      c.lineWidth = 2.5; c.setLineDash([6, 4]);
      for (const id of z[fac]) {
        const h = m.hexes[id];
        for (let i = 0; i < 6; i++) { const n = m.nb(h, i); if (n && z[fac].has(n.id)) continue; const [a, b] = [hexCorner(h.x, h.y, i), hexCorner(h.x, h.y, (i + 1) % 6)]; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
      }
      c.restore();
    }
  },
  stackAt(id) {
    const us = this.game.units.filter(u => u.hex === id && !u.reserve);
    // in cima: eroi/boss, poi la più forte
    us.sort((a, b) => (isLeader(b.type) - isLeader(a.type)) || (UNITS[b.type].F - UNITS[a.type].F));
    return us;
  },
  drawUnits(c, m) {
    const groups = new Map();
    for (const u of this.game.units) if (u.hex !== null && !u.reserve) { if (!groups.has(u.hex)) groups.set(u.hex, []); groups.get(u.hex).push(u); }
    const s = HEX * 1.18;
    for (const [id] of groups) {
      const h = m.hexes[id], us = this.stackAt(id), n = us.length;
      const off = s * 0.07;
      const show = Math.min(n, 4);
      for (let i = show - 1; i >= 0; i--) drawCounter(c, us[i], h.x + i * off - (show - 1) * off / 2, h.y - i * off + (show - 1) * off / 2 - 2, s);
      if (n > 1) {
        const bx = h.x - s / 2 - (show - 1) * off / 2 - 2, by = h.y - s / 2 + (show - 1) * off / 2 - 4;
        c.save(); c.fillStyle = '#1d1208'; c.beginPath(); c.arc(bx, by, 9, 0, 7); c.fill(); c.strokeStyle = '#f2d27a'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#fff'; c.font = `bold 11px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(n, bx, by + 0.5); c.restore();
      }
    }
  },
  // ---------------- widget
  button(c, x, y, w, h, label, on, opt = {}) {
    const hot = this.mouse && this.mouse[0] >= x && this.mouse[0] <= x + w && this.mouse[1] >= y && this.mouse[1] <= y + h;
    c.save();
    c.fillStyle = opt.active ? '#8a5a22' : hot ? '#5a3c20' : '#3d2816';
    c.strokeStyle = opt.active ? '#f2d27a' : '#a07a4a'; c.lineWidth = 1;
    roundRect(c, x, y, w, h, 6); c.fill(); c.stroke();
    c.fillStyle = '#f6e7c4'; c.font = `${opt.bold ? 'bold ' : ''}${opt.size || 13}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(label, x + w / 2, y + h / 2 + 0.5, w - 8);
    c.restore();
    this.buttons.push({ x, y, w, h, on });
  },
  drawTopBar(c) {
    const g = this.game, W = this.W;
    c.save();
    const grd = c.createLinearGradient(0, 0, 0, 48); grd.addColorStop(0, '#4a2f18'); grd.addColorStop(1, '#2e1d0f');
    c.fillStyle = grd; c.fillRect(0, 0, W, 48);
    c.fillStyle = '#c9a25a'; c.fillRect(0, 47, W, 1.5);
    c.fillStyle = '#f2d27a'; c.font = `bold 18px ${SERIF}`; c.textBaseline = 'middle'; c.textAlign = 'left';
    const compact = W < 1100;
    if (!compact) { c.fillText('Dominio Esagonale', 14, 18); c.fillStyle = '#c9b48a'; c.font = `italic 12px ${SERIF}`; c.fillText('Ordine e Caos · generatore di mappe', 14, 35); }
    c.restore();
    const x0 = compact ? 8 : 230;
    this.button(c, x0, 9, 30, 30, '◀', () => this.newGame((g.idx + SCENARIOS.length - 1) % SCENARIOS.length, g.seed), { size: 14 });
    const tw = Math.min(360, W - x0 - 400);
    this.button(c, x0 + 34, 9, tw, 30, `${g.scn.id}  ${g.scn.title}  ▾`, () => { this.show.list = !this.show.list; this.listScroll = 0; }, { bold: true, size: 13 });
    this.button(c, x0 + 38 + tw, 9, 30, 30, '▶', () => this.newGame((g.idx + 1) % SCENARIOS.length, g.seed), { size: 14 });
    let x = x0 + tw + 76;
    const B = (w, label, on, active) => { if (x + w > W - 6) return; this.button(c, x, 9, w, 30, label, on, { active }); x += w + 6; };
    B(118, '🎲 Nuova mappa', () => this.newGame(g.idx, (Math.random() * 1e9) >>> 0));
    B(70, 'Zone', () => this.show.zones = !this.show.zones, this.show.zones);
    B(76, 'Pedine', () => this.show.units = !this.show.units, this.show.units);
    B(84, 'Legenda', () => this.show.legend = !this.show.legend, this.show.legend);
    B(64, 'Adatta', () => this.fit());
  },
  drawZoomButtons(c) {
    const x = 12, y = this.H - 84;
    this.button(c, x, y, 32, 32, '+', () => this.zoomAt(this.W / 2, this.H / 2, 1.25), { size: 18 });
    this.button(c, x, y + 36, 32, 32, '−', () => this.zoomAt(this.W / 2, this.H / 2, 0.8), { size: 18 });
    c.save(); c.fillStyle = 'rgba(246,231,196,0.65)'; c.font = `11px ${FONT}`; c.textBaseline = 'middle';
    c.fillText(`Seme ${this.game.seed} · trascina per spostare, rotella o pizzico per lo zoom, clic su un esagono per i dettagli · R nuova mappa`, x + 42, this.H - 14);
    c.restore();
  },
  drawTooltip(c) {
    const h = this.hover, [mx, my] = this.mouse || [0, 0];
    let t = TERRAIN[h.terrain].name;
    if (h.feature) t = h.feature.name + ' · ' + (h.feature.type === 'testa' ? 'Testa di guado' : TERRAIN[h.terrain].name);
    const st = this.stackAt(h.id); if (st.length) t += ` · ${st.length} unità`;
    c.save(); c.font = `12px ${FONT}`; const w = c.measureText(t).width + 16;
    let x = mx + 16, y = my + 18; if (x + w > this.W - this.panelW) x = mx - w - 10;
    c.fillStyle = 'rgba(30,18,8,0.88)'; roundRect(c, x, y, w, 24, 5); c.fill();
    c.fillStyle = '#f6e7c4'; c.textBaseline = 'middle'; c.fillText(t, x + 8, y + 12.5); c.restore();
  },
  // ---------------- pannello laterale
  drawPanel(c) {
    const pw = this.panelW, x0 = this.W - pw, g = this.game, m = g.map;
    c.save();
    c.fillStyle = 'rgba(244,232,205,0.97)'; c.fillRect(x0, 48, pw, this.H - 48);
    c.fillStyle = '#7a5530'; c.fillRect(x0, 48, 2, this.H - 48);
    c.beginPath(); c.rect(x0, 48, pw, this.H - 48); c.clip();
    let y = 62 - this.panelScroll;
    const X = x0 + 16, TW = pw - 32;
    const T = (txt, o = {}) => { c.font = `${o.b ? 'bold ' : ''}${o.i ? 'italic ' : ''}${o.s || 12.5}px ${o.serif ? SERIF : FONT}`; c.fillStyle = o.col || '#2b1a0c'; c.textAlign = 'left'; c.textBaseline = 'top'; for (const l of wrap(c, txt, TW - (o.indent || 0))) { c.fillText(l, X + (o.indent || 0), y); y += (o.s || 12.5) * 1.35; } y += o.after ?? 3; };
    const HR = () => { c.fillStyle = 'rgba(122,85,48,0.4)'; c.fillRect(X, y + 2, TW, 1); y += 10; };
    const H2 = (t) => { y += 4; c.font = `bold 11px ${FONT}`; c.fillStyle = '#8a5a22'; c.textBaseline = 'top'; c.fillText(t.toUpperCase(), X, y); y += 17; };
    if (this.sel) {
      const h = this.sel, tr = TERRAIN[h.terrain];
      this.button(c, x0 + pw - 98, y - 4, 84, 24, '← Scenario', () => { this.sel = null; this.panelScroll = 0; }, { size: 11 });
      T(h.feature ? h.feature.name : tr.name, { b: true, s: 17, serif: true, after: 0 });
      T(`Esagono ${String(h.c + 1).padStart(2, '0')}${String(h.r + 1).padStart(2, '0')}`, { s: 11, col: '#7a5530', after: 6 });
      H2('Terreno');
      T(`${tr.name}${h.feature && TERRAIN[h.base] && h.base !== h.terrain && !tr.settlement ? '' : ''}`, { b: true });
      const cost = tr.cost === Infinity ? 'vietato (Anfibie 2)' : `${tr.cost} PM` + (tr.heavy ? `, Pesanti ${tr.heavy}` : '') + (tr.elf ? `, Elfiche ${tr.elf}` : '') + (tr.dwarf ? `, Naniche ${tr.dwarf}` : '') + (tr.amph ? `, Anfibie ${tr.amph}` : '');
      T('Movimento: ' + cost);
      if (h.terrain === 'tempio') T('Combattimento: –1 colonna se difende l’Ordine');
      else if (h.terrain === 'altare' || h.terrain === 'fenditura') T('Combattimento: –1 colonna se difende il Caos');
      else T(`Combattimento: mischia ${fmtCol(tr.melee)}, distanza ${fmtCol(tr.ranged)}`);
      if (tr.los) T('Blocca la linea di vista');
      if (tr.noCav) T('Vietata a Cavalleria e Bestie');
      if (h.terrain === 'palude') T('Unità non Anfibie: –1 F');
      if (h.terrain === 'deserto') T('Fine movimento: 3+ o l’unità diventa Stanca');
      if (h.terrain === 'collina') T('Tiratore in Collina: +1 P');
      if (h.road) T('Strada: ½ PM seguendo la strada, ponte incluso');
      T('Stato: ' + { normale: 'Normale', corrotto: 'Corrotto', purificato: 'Purificato' }[h.state], { col: h.state === 'corrotto' ? '#6b1d7a' : h.state === 'purificato' ? '#9a7a10' : '#2b1a0c' });
      if (h.key) T('Esagono chiave dello scenario', { b: true, col: '#8a6a10' });
      if (h.feature) {
        H2(h.feature.type === 'testa' ? 'Luogo di scenario' : tr.settlement ? 'Insediamento' : 'Luogo');
        T('Controllo: ' + (h.owner ? FACTION_NAME[h.owner] : 'neutrale'), { b: true, col: PAL.faction[h.owner || 'N'] });
        if (tr.settlement) T(`Rendita ${tr.gold} Oro · ${tr.pv} PV · recluta ${tr.recruit} unità per turno`);
        if (h.terrain === 'tempio') T('Ordine: +1 Oro, cura 1 R, +1 Prove di Lancio entro 3, recluta 1 unità Sacra');
        if (h.terrain === 'altare' || h.terrain === 'fenditura') T('Caos: +1 Oro, cura 1 R, +1 Prove di Lancio entro 3, recluta 1 Demone o Mutante');
        if (h.terrain === 'rovina') T('Esplorabile una volta (14.8)');
      }
      const ed = [];
      for (let i = 0; i < 6; i++) { const n = m.nb(h, i); if (!n) continue; const e = m.edge(h, n); const rd = m.roadLinks.has(edgeKey(h.id, n.id)); if (e || rd) ed.push([i, e, rd]); }
      if (ed.length) {
        H2('Lati');
        for (const [i, e, rd] of ed) {
          let s = DIR_NAMES[i] + ': ';
          if (e) { s += EDGE_TYPES[e.type]; if (e.type === 'cresta') s += e.high === h.id ? ' (questo è il lato alto)' : ' (salita verso il vicino)'; if (e.type === 'fiume') s += ' · +2 PM, vietato ai Pesanti, mischia –2'; if (e.type === 'guado') s += ' · +1 PM, mischia –1'; if (e.type === 'ponte') s += ' · mischia –1'; if (e.type === 'mura') s += ' · +1 PM, mischia –1'; }
          if (rd) s += (e ? ' · ' : '') + 'strada';
          T(s, { s: 11.5 });
        }
      }
      const st = this.stackAt(h.id);
      if (st.length) {
        H2(`Pila (${st.length})`);
        const ld = stackLoad(st);
        T(`Impilamento: ${ld.p}/4 punti, ${ld.l}/2 Eroi o Boss`, { s: 11, col: '#7a5530' });
        for (const u of st) y = this.unitRow(c, u, X, y, TW);
      }
    } else {
      const s = g.scn;
      T(s.group + ' · ' + s.id, { s: 11, col: '#7a5530', after: 0 });
      T(s.title, { b: true, s: 18, serif: true, after: 6 });
      T(s.mapDesc, { i: true, s: 12, serif: true, after: 6 });
      HR();
      const pts = f => s.points && s.points[f] != null ? (Array.isArray(s.points[f]) ? s.points[f].join(' + ') : s.points[f]) + ' punti' : null;
      T(`Durata: ${s.turns} TG · Primo giocatore: ${FACTION_NAME[s.first]}`);
      if (s.gold) T(`Oro iniziale: Ordine ${s.gold.O}, Caos ${s.gold.C}`); else if (!s.coop) T('Oro iniziale: 10 ciascuno');
      const cmd = f => { const u = g.units.find(u => u.fac === f && u.commander); return u ? UNITS[u.type].name.split(',')[0] : '—'; };
      T(`Comandanti: ${cmd('O')} (Ordine) e ${s.coop && !g.A.C.length ? 'Caos automatico' : cmd('C')} (Caos)`);
      H2('Schieramento');
      if (g.depText) { const f1 = g.depFirst, f2 = f1 === 'O' ? 'C' : 'O'; T(`1. ${FACTION_NAME[f1]}: ${g.depText[f1]}`); if (g.depText[f2]) T(`2. ${FACTION_NAME[f2]}: ${g.depText[f2]}`); }
      H2('Armate');
      for (const f of ['O', 'C']) {
        const L = g.units.filter(u => u.fac === f); if (!L.length) continue;
        const cost = armyCost(L);
        T(`${FACTION_NAME[f]}: ${L.length} pedine, ${cost} punti${pts(f) ? ' (budget ' + pts(f) + ')' : ''}`, { b: true, col: PAL.faction[f] });
        const counts = {}; L.forEach(u => counts[u.type] = (counts[u.type] || 0) + 1);
        T(Object.entries(counts).map(([t, n]) => (n > 1 ? n + ' ' : '') + (UNITS[t].kind === 'unit' ? t : UNITS[t].name.split(',')[0])).join('; '), { s: 11.5, after: 6 });
        const res = L.filter(u => u.reserve); if (res.length) T(`In riserva: ${res.length} pedine` + (res[0].arrives ? ` (entrano nel TG ${res[0].arrives})` : ''), { s: 11.5, col: '#7a5530' });
      }
      H2('Vittoria');
      for (const v of s.victory) T('• ' + v, { s: 12, indent: 0 });
      if (g.notes.length) { H2('Note di generazione'); for (const n of g.notes) T('• ' + n, { s: 11.5, col: '#5a4026' }); }
      H2('Mappa');
      const cnt = {}; m.hexes.forEach(h => cnt[h.base] = (cnt[h.base] || 0) + 1);
      const ec = {}; for (const e of m.edges.values()) ec[e.type] = (ec[e.type] || 0) + 1;
      T(`${m.W}×${m.H} esagoni · ${m.rivers.length} fiumi · ${m.roads.length} tratti di strada`, { s: 11.5 });
      T(Object.entries(ec).map(([k, v]) => `${EDGE_TYPES[k]} ${v}`).join(' · '), { s: 11.5, col: '#5a4026' });
      T(`Generata in ${this.genMs} ms`, { s: 10.5, col: '#8a7a60' });
    }
    this.panelContentH = y + this.panelScroll - 48 + 20;
    c.restore();
  },
  unitRow(c, u, X, y, TW) {
    const U = UNITS[u.type];
    drawCounter(c, u, X + 26, y + 26, 48);
    c.save(); c.textBaseline = 'top'; c.textAlign = 'left';
    c.font = `bold 12.5px ${FONT}`; c.fillStyle = PAL.faction[u.fac];
    c.fillText(U.name.split(',')[0] + (u.grade === 'V' ? ' (Veterano)' : '') + (u.commander ? ' ★' : ''), X + 60, y, TW - 60);
    c.font = `11.5px ${FONT}`; c.fillStyle = '#2b1a0c';
    c.fillText(`V${U.V} F${U.F} D${U.D} P${U.P} R${U.R}${U.FM ? ' FM' + U.FM : ''} · costo ${U.cost}`, X + 60, y + 16, TW - 60);
    c.fillStyle = '#5a4026'; c.font = `italic 11px ${FONT}`;
    const lines = wrap(c, U.kw.join(', ') + (U.ab && U.ab !== '—' ? ' — ' + U.ab : ''), TW - 60).slice(0, 3);
    lines.forEach((l, i) => c.fillText(l, X + 60, y + 31 + i * 13));
    c.restore();
    return y + Math.max(58, 36 + lines.length * 13);
  },
  // ---------------- elenco scenari
  drawList(c) {
    c.save(); c.fillStyle = 'rgba(15,8,3,0.6)'; c.fillRect(0, 48, this.W, this.H - 48);
    const w = Math.min(560, this.W - 40), x = (this.W - w) / 2, top = 64, hh = this.H - 90;
    c.fillStyle = '#f4e8cd'; roundRect(c, x, top, w, hh, 10); c.fill(); c.strokeStyle = '#7a5530'; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.rect(x, top, w, hh); c.clip();
    let y = top + 14 - this.listScroll, grp = null;
    SCENARIOS.forEach((s, i) => {
      if (s.group !== grp) { grp = s.group; c.font = `bold 12px ${FONT}`; c.fillStyle = '#8a5a22'; c.textBaseline = 'top'; c.fillText(grp.toUpperCase(), x + 18, y + 4); y += 26; }
      const cur = i === this.game.idx;
      this.button(c, x + 14, y, w - 28, 40, '', () => { this.show.list = false; this.newGame(i, this.game.seed); }, { active: cur });
      c.save(); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#f6e7c4';
      c.font = `bold 13.5px ${SERIF}`; c.fillText(`${s.id}  ${s.title}`, x + 26, y + 13, w - 60);
      c.font = `11px ${FONT}`; c.fillStyle = '#d8c39a';
      const pts = s.points ? Object.entries(s.points).map(([f, p]) => `${FACTION_NAME[f]} ${Array.isArray(p) ? p.join('+') : p}`).join(' / ') : 'armate fisse';
      c.fillText(`${s.turns} TG · ${s.size[0]}×${s.size[1]} · ${pts}${s.coop ? ' · cooperativo' : ''}`, x + 26, y + 29, w - 60);
      c.restore();
      y += 46;
    });
    c.restore();
    this.buttons.push({ x: 0, y: 48, w: this.W, h: this.H, on: () => { this.show.list = false; } });
    // il pannello va per ultimo nella verifica dei clic, quindi riordina: bottoni dell'elenco prima dello sfondo
    const bg = this.buttons.pop(); this.buttons.unshift(bg);
  },
  // ---------------- legenda
  drawLegend(c) {
    c.save(); c.fillStyle = 'rgba(15,8,3,0.55)'; c.fillRect(0, 48, this.W, this.H - 48);
    const w = Math.min(760, this.W - 30), hh = Math.min(500, this.H - 80), x = (this.W - w) / 2, y = 62;
    c.fillStyle = '#f4e8cd'; roundRect(c, x, y, w, hh, 10); c.fill(); c.strokeStyle = '#7a5530'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#2b1a0c'; c.font = `bold 17px ${SERIF}`; c.textBaseline = 'top'; c.fillText('Legenda', x + 18, y + 12);
    const items = [['pianura', 'Pianura'], ['collina', 'Collina'], ['bosco', 'Bosco'], ['palude', 'Palude'], ['deserto', 'Deserto'], ['montagna', 'Montagna'], ['lago', 'Lago']];
    const fm = { seed: this.game.seed, regions: [{ side: 'O', pal: 0 }], half: () => 'O' };
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

function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function wrap(c, text, w) { const out = []; let cur = ''; for (const word of String(text).split(' ')) { const t = cur ? cur + ' ' + word : word; if (c.measureText(t).width > w && cur) { out.push(cur); cur = word; } else cur = t; } if (cur) out.push(cur); return out; }
function fmtCol(v) { return !v ? '0' : (v > 0 ? '+' : '–') + Math.abs(v) + (Math.abs(v) === 1 ? ' colonna' : ' colonne'); }

addEventListener('load', () => App.init());
