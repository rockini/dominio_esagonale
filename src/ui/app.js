// ============================================================
//  INTERFACCIA DI GIOCO (tutto nel canvas): nucleo, camera, input, disegno
// ============================================================
const DIR_NAMES = ['sud-est', 'sud', 'sud-ovest', 'nord-ovest', 'nord', 'nord-est'];
const FONT = 'DejaVu Sans, Segoe UI, Verdana, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';
const PHASE_NAME = { deploy: 'Schieramento', maint: 'Manutenzione', recruit: 'Reclutamento', move: 'Movimento', combat: 'Combattimento', final: 'Fase Finale', endTG: 'Fine del turno', over: 'Partita finita' };
const STEP_NAME = ['Magie', 'Tiro', 'Mischia', 'Azioni speciali'];

const App = {
  cv: null, ctx: null, dpr: 1, W: 0, H: 0,
  screen: 'menu', g: null, stat: null,
  cam: { x: 0, y: 0, z: 1 },
  hover: null, sel: null, picked: new Set(), mode: null, forced: false, fly: false, R: null,
  modal: null, show: { legend: false, log: false, panel: true, help: false },
  buttons: [], panelScroll: 0, panelContentH: 0, logScroll: 0, listScroll: 0,
  pointers: new Map(), drag: null, mouse: [0, 0],
  evq: [], anim: null, floats: [], banner: null, ai: null, speed: 1, aiPause: 0, mapDirty: false,
  toast: null,

  init() {
    this.cv = document.getElementById('c'); this.ctx = this.cv.getContext('2d');
    addEventListener('resize', () => this.resize()); this.resize();
    this.bindInput();
    let p; try { p = new URLSearchParams(location.hash.slice(1)); } catch (e) { p = new URLSearchParams(); }
    this.params = p;
    loadSprites().then(() => {
      Menu.init(p);
      if (p.get('play')) Menu.start();
      this.loop();
    });
  },
  resize() {
    this.dpr = window.devicePixelRatio || 1; this.W = innerWidth; this.H = innerHeight;
    this.cv.width = Math.round(this.W * this.dpr); this.cv.height = Math.round(this.H * this.dpr);
    this.cv.style.width = this.W + 'px'; this.cv.style.height = this.H + 'px';
    if (this.W < 760) this.show.panel = false;
  },
  get panelW() { return this.screen === 'game' && this.show.panel ? Math.min(360, Math.max(280, this.W * 0.3)) : 0; },
  // ---------------- avvio di una partita
  startGame(scnId, seed, human) {
    const t0 = performance.now();
    this.g = newGame(scnId, seed, human);
    this.stat = renderStaticMap(this.g);
    this.screen = 'game'; this.sel = null; this.picked = new Set(); this.mode = null; this.modal = null;
    this.evq = []; this.anim = null; this.laterFn = null; this.floats = []; this.ai = null; this.banner = null;
    this.t0 = performance.now(); this.genMs = Math.round(this.t0 - t0);
    try { history.replaceState(null, '', '#scenario=' + scnId + '&seed=' + seed + '&side=' + (human || 'ai')); } catch (e) { }
    this.fit();
    const g = this.g;
    g.say(`${g.scn.id} ${g.scn.title}. ${g.scn.turns} Turni di Gioco.`, 'turn');
    if (human) { g.phase = 'deploy'; this.banner = { text: 'Schieramento', sub: 'Puoi spostare le tue pedine nella tua zona, poi premi “Inizia la partita”.', t0: performance.now(), dur: 2600 }; }
    else this.beginPlay();
  },
  beginPlay() { this.g.start(); this.pump(); this.afterAction(); },
  isHumanTurn() { const g = this.g; return g && !g.winner && g.human && g.active === g.human && g.phase !== 'deploy'; },
  busy() { return !!(this.anim || this.evq.length || this.laterFn); },
  animating() { return !!(this.anim || this.evq.length); },
  later(fn) { this.laterFn = fn; },
  fit() {
    if (!this.stat) return;
    const top = 52, bottom = 64, aw = this.W - this.panelW - 20, ah = this.H - top - bottom;
    const z = Math.min(aw / this.stat.W, ah / this.stat.H);
    this.cam.z = Math.max(0.2, z);
    this.cam.x = 10 + (aw - this.stat.W * this.cam.z) / 2 + MARGIN * this.cam.z;
    this.cam.y = top + (ah - this.stat.H * this.cam.z) / 2 + MARGIN * this.cam.z;
  },
  centerOn(h) { const z = this.cam.z, aw = this.W - this.panelW; this.cam.x = aw / 2 - h.x * z; this.cam.y = (this.H + 52 - 64) / 2 - h.y * z; },
  toWorld(sx, sy) { return [(sx - this.cam.x) / this.cam.z, (sy - this.cam.y) / this.cam.z]; },
  toScreen(wx, wy) { return [wx * this.cam.z + this.cam.x, wy * this.cam.z + this.cam.y]; },
  zoomAt(sx, sy, f) {
    const [wx, wy] = this.toWorld(sx, sy);
    this.cam.z = Math.max(0.15, Math.min(4, this.cam.z * f));
    this.cam.x = sx - wx * this.cam.z; this.cam.y = sy - wy * this.cam.z;
  },
  say(text) { this.toast = { text, t0: performance.now() }; },
  // ---------------- input
  bindInput() {
    const cv = this.cv;
    cv.addEventListener('contextmenu', e => { e.preventDefault(); if (this.screen === 'game') this.cancel(); });
    cv.addEventListener('wheel', e => {
      e.preventDefault();
      if (this.screen === 'menu') { Menu.wheel(e.clientX, e.clientY, e.deltaY); return; }
      if (this.show.log && this.inLog(e.clientX, e.clientY)) { this.logScroll = Math.max(0, this.logScroll + e.deltaY); return; }
      if (this.show.panel && e.clientX > this.W - this.panelW && e.clientY > 48) { this.panelScroll = Math.max(0, Math.min(this.panelScroll + e.deltaY, Math.max(0, this.panelContentH - (this.H - 60)))); return; }
      this.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015));
    }, { passive: false });
    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (this.pointers.size === 1) this.drag = { sx: e.clientX, sy: e.clientY, cx: this.cam.x, cy: this.cam.y, ps: this.panelScroll, moved: false, onUI: this.uiHit(e.clientX, e.clientY), onPanel: this.show.panel && e.clientX > this.W - this.panelW && e.clientY > 48, right: e.button === 2 };
      else if (this.pointers.size === 2) { const [a, b] = [...this.pointers.values()]; this.pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: this.cam.z }; if (this.drag) this.drag.moved = true; }
    });
    cv.addEventListener('pointermove', e => {
      if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, [e.clientX, e.clientY]);
      this.mouse = [e.clientX, e.clientY];
      if (this.pointers.size === 2 && this.pinch) {
        const [a, b] = [...this.pointers.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        this.zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (this.pinch.z * d / this.pinch.d) / this.cam.z); return;
      }
      if (this.drag) {
        const dx = e.clientX - this.drag.sx, dy = e.clientY - this.drag.sy;
        if (Math.abs(dx) + Math.abs(dy) > 6) this.drag.moved = true;
        if (this.drag.moved && this.screen === 'game') {
          if (this.drag.onPanel) this.panelScroll = Math.max(0, Math.min(this.drag.ps - dy, Math.max(0, this.panelContentH - (this.H - 60))));
          else if (!this.drag.onUI) { this.cam.x = this.drag.cx + dx; this.cam.y = this.drag.cy + dy; }
        }
      }
      this.hover = this.screen === 'game' && !this.uiHit(e.clientX, e.clientY) ? this.hexAt(e.clientX, e.clientY) : null;
    });
    const up = e => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinch = null;
      if (this.drag && this.pointers.size === 0) {
        if (!this.drag.moved && !this.drag.right) this.click(e.clientX, e.clientY);
        this.drag = null;
      }
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    addEventListener('keydown', e => {
      if (this.screen === 'menu') { Menu.key(e); return; }
      if (e.key === 'Escape') { if (this.show.legend || this.show.help) { this.show.legend = this.show.help = false; } else this.cancel(); }
      if (e.key === '+') this.zoomAt(this.W / 2, this.H / 2, 1.2);
      if (e.key === '-') this.zoomAt(this.W / 2, this.H / 2, 1 / 1.2);
      if (e.key === 'l' || e.key === 'L') this.show.log = !this.show.log;
      if ((e.key === 'Enter' || e.key === ' ') && !this.modal) { e.preventDefault(); this.advanceButton && this.advanceButton(); }
      if ((e.key === 'm' || e.key === 'M') && this.g.phase === 'move') { this.forced = !this.forced; this.updateReach(); }
    });
  },
  hexAt(sx, sy) { const [wx, wy] = this.toWorld(sx, sy); return this.g ? this.g.map.hexAtPoint(wx, wy) : null; },
  inLog(x, y) { return this.logRect && x >= this.logRect.x && x <= this.logRect.x + this.logRect.w && y >= this.logRect.y && y <= this.logRect.y + this.logRect.h; },
  uiHit(x, y) {
    if (this.screen === 'menu') return true;
    if (y < 48 || this.modal || this.show.legend || this.show.help) return true;
    if (this.show.panel && x > this.W - this.panelW) return true;
    if (this.inLog(x, y)) return true;
    return this.buttons.some(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
  },
  click(x, y) {
    for (const b of [...this.buttons].reverse()) if (!b.disabled && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { b.on(); return; }
    if (this.screen === 'menu') return;
    if (this.modal) return;
    if (this.show.legend || this.show.help) { this.show.legend = this.show.help = false; return; }
    if (this.uiHit(x, y)) return;
    const h = this.hexAt(x, y);
    if (h) this.clickHex(h); else this.cancel();
  },
  cancel() { if (this.mode) { this.mode = null; return; } this.sel = null; this.picked = new Set(); this.R = null; },
  // ---------------- logica del clic sulla mappa
  clickHex(h) {
    const g = this.g;
    if (g.phase === 'deploy' && g.human) { Deploy.click(h); return; }
    const human = this.isHumanTurn() && !this.busy();
    const m = this.mode;
    if (human && m && m.kind === 'spell') { Act.spellClick(h); return; }
    if (human && m && m.kind === 'ability') { Act.abilityClick(h); return; }
    if (human && m && m.kind === 'item') { Act.itemClick(h); return; }
    if (human && g.phase === 'move' && this.R && this.R.dests.has(h.id)) { Act.move(h.id); return; }
    if (human && g.phase === 'combat' && g.enemyAt(h.id, g.active) && (g.rangedCandidates(h.id).length || g.meleeCandidates(h.id).length)) {
      Act.openAttack(h.id); return;
    }
    if (m && m.kind === 'attack' && m.hex === h.id) return;
    this.mode = null;
    this.select(h);
  },
  select(h) {
    const g = this.g;
    if (this.sel === h) { this.sel = null; this.picked = new Set(); this.R = null; return; }
    this.sel = h; this.panelScroll = 0;
    const own = g.unitsAt(h.id).filter(u => u.fac === (g.human || g.active));
    this.picked = new Set(own.filter(u => g.phase === 'move' ? g.canMove(u) : true).map(u => u.uid));
    this.fly = own.length > 0 && own.every(u => g.canFly(u)) && this.fly;
    this.updateReach();
    if (!this.show.panel && this.W >= 760) { this.show.panel = true; }
  },
  pickedUnits() { return [...this.picked].map(id => this.g.byUid(id)).filter(u => u && this.g.alive(u)); },
  updateReach() {
    const g = this.g; this.R = null;
    if (!this.isHumanTurn() || g.phase !== 'move') return;
    const us = this.pickedUnits().filter(u => g.canMove(u));
    if (!us.length || us.length !== this.picked.size) return;
    if (this.forced && !g.canForce(us)) this.forced = false;
    const fly = this.fly && us.every(u => g.canFly(u));
    this.R = g.reachable(us, { forced: this.forced, fly });
  },
  // dopo ogni azione: eventi, saccheggi, aggiornamenti
  afterAction() {
    const g = this.g;
    this.pump();
    if (g.pendingSack && g.pendingSack.fac === g.human) this.later(() => Modals.sack());
    if (this.sel) { const own = g.unitsAt(this.sel.id); for (const id of [...this.picked]) if (!own.some(u => u.uid === id)) this.picked.delete(id); }
    this.updateReach();
  },
  pump() { const g = this.g; if (!g) return; while (g.events.length) this.evq.push(g.events.shift()); },
  // ---------------- ciclo
  loop() {
    const step = () => { try { this.frame(); } catch (e) { console.error(e); this.say('Errore: ' + e.message); } requestAnimationFrame(step); };
    requestAnimationFrame(step);
  },
  frame() {
    if (this.screen === 'game') { Anim.update(); if (this.laterFn && !this.animating() && !this.modal) { const f = this.laterFn; this.laterFn = null; f(); } this.driveAI(); }
    this.draw();
  },
  driveAI() {
    const g = this.g;
    if (!g || g.winner || this.modal || g.phase === 'deploy') { if (g && g.winner && !this.busy() && !this.modal && !this.overShown) { this.overShown = true; Modals.over(); } return; }
    if (g.human && g.active === g.human && !this.ai) return;
    if (this.busy()) return;
    if (performance.now() < this.aiPause) return;
    if (!this.ai) { this.ai = AI.turn(g, g.active); this.sel = null; this.picked = new Set(); this.R = null; this.mode = null; }
    const t = performance.now();
    let r;
    do { r = this.ai.next(); this.pump(); } while (!r.done && !this.evq.length && performance.now() - t < 30);
    if (g.pendingSack) AI.decideSack(g);
    this.pump();
    if (r.done) { this.ai = null; this.aiPause = performance.now() + 250 / this.speed; }
  },
  // ---------------- disegno
  draw() {
    const c = this.ctx, d = this.dpr; this.buttons = []; this.advanceButton = null;
    c.setTransform(d, 0, 0, d, 0, 0);
    c.fillStyle = '#2b1d12'; c.fillRect(0, 0, this.W, this.H);
    if (this.screen === 'menu') { Menu.draw(c); return; }
    if (this.mapDirty && !this.anim) { this.stat = renderStaticMap(this.g); this.mapDirty = false; }
    const z = this.cam.z, g = this.g, m = g.map;
    c.setTransform(d * z, 0, 0, d * z, d * this.cam.x, d * this.cam.y);
    c.globalAlpha = Math.min(1, (performance.now() - this.t0) / 450);
    c.imageSmoothingQuality = 'high';
    c.drawImage(this.stat.canvas, -MARGIN, -MARGIN, this.stat.W, this.stat.H);
    c.globalAlpha = 1;
    this.drawOverlays(c, m);
    this.drawUnits(c, m);
    Anim.drawWorld(c);
    c.setTransform(d, 0, 0, d, 0, 0);
    Anim.drawScreen(c);
    Hud.top(c);
    Hud.bottom(c);
    if (this.show.panel) Panel.draw(c); else this.button(c, this.W - 92, 56, 82, 30, '☰ Pannello', () => { this.show.panel = true; });
    Hud.log(c);
    Hud.zoom(c);
    if (this.hover && !this.modal) Hud.tooltip(c);
    if (this.show.legend) Legend.draw(c);
    if (this.show.help) Modals.drawHelp(c);
    if (this.modal) Modals.draw(c);
    if (this.toast && performance.now() - this.toast.t0 < 3200) Hud.toast(c);
  },
  drawOverlays(c, m) {
    const g = this.g, z = this.cam.z, now = performance.now();
    // zone di schieramento
    if (g.phase === 'deploy' && g.dep && g.dep.zones) Deploy.drawZones(c, m);
    // movimento possibile
    if (this.R && !this.busy()) {
      c.save();
      for (const [id, cost] of this.R.dests) { const h = m.hexes[id]; hexPath(c, h.x, h.y, HEX * 0.93); c.fillStyle = this.forced ? 'rgba(255,170,60,0.28)' : 'rgba(120,230,140,0.27)'; c.fill(); }
      c.lineWidth = 2; c.strokeStyle = this.forced ? 'rgba(200,110,20,0.7)' : 'rgba(30,140,60,0.65)';
      for (const [id] of this.R.dests) { const h = m.hexes[id]; hexPath(c, h.x, h.y, HEX * 0.93); c.stroke(); }
      if (this.hover && this.R.dests.has(this.hover.id)) {
        const path = g.pathTo(this.R, this.hover.id).map(id => m.hexes[id]);
        c.strokeStyle = 'rgba(255,255,240,0.95)'; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round'; c.setLineDash([2, 9]);
        c.beginPath(); path.forEach((h, i) => i ? c.lineTo(h.x, h.y) : c.moveTo(h.x, h.y)); c.stroke(); c.setLineDash([]);
        const h = this.hover; c.fillStyle = 'rgba(20,12,4,0.85)'; roundRect(c, h.x - 22, h.y + 16, 44, 18, 5); c.fill();
        c.fillStyle = '#fff'; c.font = `bold 12px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(fmtPM(this.R.dests.get(h.id)) + ' PM', h.x, h.y + 25.5);
      }
      c.restore();
    }
    // bersagli
    const targets = this.targetHexes();
    if (targets) {
      c.save();
      const pulse = 0.55 + 0.25 * Math.sin(now / 220);
      for (const [id, col] of targets) { const h = m.hexes[id]; hexPath(c, h.x, h.y, HEX * 0.9); c.strokeStyle = col; c.globalAlpha = pulse; c.lineWidth = 4; c.stroke(); c.globalAlpha = 0.16; c.fillStyle = col; c.fill(); c.globalAlpha = 1; }
      c.restore();
    }
    if (this.hover) { c.save(); hexPath(c, this.hover.x, this.hover.y, HEX * 0.95); c.strokeStyle = 'rgba(255,255,240,0.9)'; c.lineWidth = 2.5 / Math.max(z, 0.6); c.stroke(); c.restore(); }
    if (this.sel) { c.save(); hexPath(c, this.sel.x, this.sel.y, HEX * 0.95); c.strokeStyle = '#fff'; c.lineWidth = 4; c.setLineDash([8, 5]); c.lineDashOffset = -now / 50; c.stroke(); c.restore(); }
    const am = this.mode && this.mode.kind === 'attack' ? this.mode : null;
    if (am) {
      const t = m.hexes[am.hex];
      c.save(); c.strokeStyle = am.type === 'melee' ? '#ff4030' : '#ffb020'; c.lineWidth = 3.5; c.lineCap = 'round';
      for (const id of am.uids) { const u = g.byUid(id); if (!u) continue; const a = g.hexOf(u); Anim.arrow(c, a.x, a.y, t.x, t.y, am.type === 'ranged'); }
      hexPath(c, t.x, t.y, HEX * 0.95); c.lineWidth = 4; c.setLineDash([6, 4]); c.lineDashOffset = now / 40; c.stroke();
      c.restore();
    }
  },
  // esagoni da evidenziare come bersagli: Map id -> colore
  targetHexes() {
    const g = this.g, m = this.mode, out = new Map();
    if (!this.isHumanTurn() || this.busy()) return null;
    if (m && m.kind === 'spell') { for (const t of m.targets) out.set(t.hex, SPELL_BY_NAME[m.sp].dmg ? '#ff5a30' : '#7ad0ff'); return out; }
    if (m && (m.kind === 'ability' || m.kind === 'item')) { for (const t of m.targets) out.set(t.hex, '#e0a0ff'); return out; }
    if (g.phase === 'combat' && g.step <= 2) {
      const us = this.pickedUnits().filter(u => g.canAttack(u));
      for (const u of us) {
        const h = g.hexOf(u);
        if (g.step <= 1 && g.canShoot(u)) for (const x of g.map.within(h, g.P(u))) if (g.enemyAt(x.id, g.active) && g.rangedCandidates(x.id).includes(u)) out.set(x.id, '#ffb020');
        for (const n of g.map.neighbors(h)) if (g.canBeMeleed(n.id) && g.meleeCandidates(n.id).includes(u) && !out.has(n.id)) out.set(n.id, '#ff4030');
      }
      return out.size ? out : null;
    }
    return null;
  },
  // posizioni disegnate delle unità (tiene conto delle animazioni in coda)
  unitPositions() {
    const g = this.g, pos = new Map();
    for (const u of g.units) if (g.alive(u)) pos.set(u.uid, { hex: u.hex });
    // eventi non ancora mostrati: le unità restano dov'erano
    for (let i = this.evq.length - 1; i >= 0; i--) {
      const e = this.evq[i];
      if (e.type === 'move') for (const id of e.uids) pos.set(id, { hex: e.path[0] });
      else if (e.type === 'death') pos.set(e.uid, { hex: e.hex, ghost: true });
      else if (e.type === 'recruit' || e.type === 'summon') pos.delete(e.uid);
      else if (e.type === 'exit') pos.set(e.uid, { hex: e.hex });
    }
    const a = this.anim;
    if (a && a.e.type === 'move') for (const id of a.e.uids) pos.set(id, { xy: Anim.movePos(a) });
    if (a && a.e.type === 'death') pos.set(a.e.uid, { hex: a.e.hex, alpha: 1 - a.p });
    return pos;
  },
  stackOrder(us) {
    const g = this.g;
    return us.sort((a, b) => (g.isLeader(b) - g.isLeader(a)) || (b.commander ? 1 : 0) - (a.commander ? 1 : 0) || (g.U(b).F - g.U(a).F));
  },
  drawUnits(c, m) {
    const g = this.g, pos = this.unitPositions();
    const groups = new Map(), free = [];
    for (const [uid, p] of pos) {
      const u = g.byUid(uid); if (!u) continue;
      if (p.xy) free.push([u, p]); else { if (!groups.has(p.hex)) groups.set(p.hex, []); groups.get(p.hex).push([u, p]); }
    }
    const s = HEX * 1.18;
    const active = this.isHumanTurn();
    for (const [id, list] of groups) {
      const h = m.hexes[id]; if (!h) continue;
      const us = this.stackOrder(list.map(x => x[0])), n = us.length;
      const off = s * 0.07, show = Math.min(n, 4);
      for (let i = show - 1; i >= 0; i--) {
        const u = us[i], p = list.find(x => x[0] === u)[1];
        c.save(); if (p.alpha !== undefined) c.globalAlpha = Math.max(0, p.alpha);
        this.counter(c, u, h.x + i * off - (show - 1) * off / 2, h.y - i * off + (show - 1) * off / 2 - 2, s, active, i === 0);
        c.restore();
      }
      if (n > 1) {
        const bx = h.x - s / 2 - (show - 1) * off / 2 - 2, by = h.y - s / 2 + (show - 1) * off / 2 - 4;
        c.save(); c.fillStyle = '#1d1208'; c.beginPath(); c.arc(bx, by, 9, 0, 7); c.fill(); c.strokeStyle = '#f2d27a'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#fff'; c.font = `bold 11px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(n, bx, by + 0.5); c.restore();
      }
    }
    const done = new Set();
    for (const [u, p] of free) {
      const key = p.xy[0] + ',' + p.xy[1]; const k = done.has(key) ? 1 : 0; done.add(key);
      this.counter(c, u, p.xy[0] + k * 3, p.xy[1] - k * 3, s, false, true);
    }
  },
  // pedina con indicatori di stato
  counter(c, u, x, y, s, active, top) {
    const g = this.g;
    drawCounter(c, u, x, y, s);
    if (!top) return;
    c.save();
    const L = x - s / 2, T = y - s / 2;
    // spento se non ha più nulla da fare nel turno del giocatore
    if (active && u.fac === g.active) {
      const spent = g.phase === 'move' ? !g.canMove(u) : g.phase === 'combat' ? !(g.canAttack(u) || g.canCast(u) || g.specialOptions(u).length) : false;
      if (spent) { c.fillStyle = 'rgba(30,20,10,0.38)'; c.fillRect(L, T, s, s); }
    }
    if (g.st(u, 'disgregato')) { c.fillStyle = 'rgba(90,90,90,0.45)'; c.fillRect(L, T, s, s); c.strokeStyle = '#ddd'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(L + 4, T + 4); c.lineTo(L + s - 4, T + s - 4); c.stroke(); }
    if (g.st(u, 'furia')) { c.strokeStyle = '#ff3010'; c.lineWidth = 3; c.shadowColor = '#ff3010'; c.shadowBlur = 8; c.strokeRect(L - 1, T - 1, s + 2, s + 2); c.shadowBlur = 0; }
    // barra di Resistenza
    const R = g.maxR(u), cur = g.curR(u);
    if (u.dmg > 0) {
      const w = (s - 6) / R;
      for (let i = 0; i < R; i++) { c.fillStyle = i < cur ? '#5ad04a' : '#c02018'; c.fillRect(L + 3 + i * w, T + s - 6, w - 1, 4); }
    }
    // icone di stato
    const icons = [];
    if (g.st(u, 'stanco')) icons.push(['S', '#c08020']); if (g.st(u, 'esausto')) icons.push(['E', '#a03010']);
    if (g.st(u, 'corrotto')) icons.push(['C', '#7a2a9a']); if (g.st(u, 'vacillante')) icons.push(['V', '#4060a0']);
    if (u.effects.some(e => e.k === 'immobile')) icons.push(['✋', '#3a6aa0']);
    if (u.items.length) icons.push(['✦', '#b08a20']);
    icons.forEach(([t, col], i) => {
      const cx = L + s - 6 - i * 12, cy = T + 6;
      c.fillStyle = col; c.beginPath(); c.arc(cx, cy, 5.5, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#fff'; c.font = `bold 7.5px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, cx, cy + 0.5);
    });
    c.restore();
  },
  // ---------------- widget
  button(c, x, y, w, h, label, on, opt = {}) {
    const hot = !opt.disabled && this.mouse && this.mouse[0] >= x && this.mouse[0] <= x + w && this.mouse[1] >= y && this.mouse[1] <= y + h;
    c.save();
    if (opt.disabled) c.globalAlpha = 0.45;
    c.fillStyle = opt.color ? opt.color : opt.active ? '#8a5a22' : hot ? '#5a3c20' : '#3d2816';
    if (opt.color && hot) c.filter = 'brightness(1.2)';
    c.strokeStyle = opt.active ? '#f2d27a' : '#a07a4a'; c.lineWidth = 1;
    roundRect(c, x, y, w, h, 6); c.fill(); c.filter = 'none'; c.stroke();
    if (opt.icon) { c.drawImage(opt.icon, x + 4, y + (h - (h - 8)) / 2, h - 8, h - 8); }
    c.fillStyle = '#f6e7c4'; c.font = `${opt.bold ? 'bold ' : ''}${opt.size || 13}px ${FONT}`; c.textAlign = opt.left ? 'left' : 'center'; c.textBaseline = 'middle';
    const tx = opt.left ? x + (opt.icon ? h : 8) : x + w / 2 + (opt.icon ? h / 2 - 4 : 0);
    c.fillText(label, tx, y + h / 2 + 0.5, w - 10 - (opt.icon ? h : 0));
    c.restore();
    this.buttons.push({ x, y, w, h, on, disabled: opt.disabled });
  },
};

function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function wrap(c, text, w) { const out = []; for (const para of String(text).split('\n')) { let cur = ''; for (const word of para.split(' ')) { const t = cur ? cur + ' ' + word : word; if (c.measureText(t).width > w && cur) { out.push(cur); cur = word; } else cur = t; } out.push(cur); } return out; }
function fmtCol(v) { return !v ? '0' : (v > 0 ? '+' : '–') + Math.abs(v) + (Math.abs(v) === 1 ? ' colonna' : ' colonne'); }
function uname(u) { return UNITS[u.type].name.split(',')[0]; }

addEventListener('load', () => App.init());
