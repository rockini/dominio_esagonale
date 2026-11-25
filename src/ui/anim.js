// ============================================================
//  ANIMAZIONI: riproduce gli eventi del motore uno alla volta
// ============================================================
const Anim = {
  // durata (ms) e se blocca la coda
  spec(e) {
    const sp = App.speed;
    switch (e.type) {
      case 'move': return { dur: (e.fast ? 90 : 150) * Math.max(1, e.path.length - 1) / sp, block: true };
      case 'melee': case 'ranged': return { dur: 750 / sp, block: true };
      case 'spell': return { dur: 900 / sp, block: true };
      case 'death': return { dur: 450 / sp, block: true };
      case 'turn': return { dur: 1100 / sp, block: true };
      case 'recruit': case 'summon': return { dur: 300 / sp, block: true };
      case 'capture': case 'loot': case 'explore': case 'build': return { dur: 350 / sp, block: true };
      default: return { dur: 0, block: false };
    }
  },
  update() {
    const now = performance.now();
    let guard = 0;
    while (guard++ < 50) {
      if (App.anim) {
        const a = App.anim; a.p = Math.min(1, (now - a.t0) / Math.max(1, a.dur));
        if (a.p < 1) break;
        this.finish(a); App.anim = null;
      }
      if (!App.evq.length) break;
      const e = App.evq.shift();
      this.begin(e);
      const s = this.spec(e);
      if (s.block && s.dur > 0) App.anim = { e, t0: now, dur: s.dur, p: 0 };
    }
    App.floats = App.floats.filter(f => now - f.t0 < f.dur);
  },
  hexXY(id) { const h = App.g.map.hexes[id]; return h ? [h.x, h.y] : [0, 0]; },
  float(hid, text, color, opt = {}) { const [x, y] = this.hexXY(hid); App.floats.push({ x: x + (opt.dx || 0), y: y + (opt.dy || 0), text, color, t0: performance.now() + (opt.delay || 0), dur: (opt.dur || 1400) / App.speed + (opt.delay || 0), size: opt.size || 15, box: opt.box }); },
  begin(e) {
    const g = App.g;
    switch (e.type) {
      case 'damage': this.float(e.hex, '−' + e.n, '#ff3a20', { size: 20, dy: -10 }); break;
      case 'heal': this.float(e.hex, '+R', '#40d060', { size: 16 }); break;
      case 'status': this.float(e.hex, e.s, e.s === 'Disgregato' ? '#d0d0d0' : e.s === 'Corrotto' ? '#c070f0' : '#ffd060', { dy: 18 }); break;
      case 'promote': this.float(e.hex, e.grade === 'E' ? 'Elite!' : 'Veterano!', '#f2d27a', { dy: -24 }); break;
      case 'morale': this.float(e.hex, `Morale ${e.roll} ${e.ok ? '✓' : '✗'}`, e.ok ? '#a0e0ff' : '#ff9070', { dy: 26, size: 12 }); break;
      case 'melee': { const r = e.res.replace(/\*/g, ''); this.float(e.hex, `⚔ ${e.col} · 🎲${e.roll} → ${e.res}`, '#fff', { dy: -34, size: 13, box: e.fac === 'O' ? '#1e3c78' : '#7a1420', dur: 2400 }); break; }
      case 'ranged': this.float(e.hex, `➶ ${e.col} · 🎲${e.roll} → ${e.res}`, '#fff', { dy: -34, size: 13, box: e.fac === 'O' ? '#1e3c78' : '#7a1420', dur: 2400 }); break;
      case 'spell': break;
      case 'capture': this.float(e.hex, 'Conquistata!', e.fac === 'O' ? '#9cc4ff' : '#ff8a8a', { dy: -30, size: 14 }); App.mapDirty = true; break;
      case 'loot': this.float(e.hex, `+${e.gold} Oro${e.items && e.items.length ? ' · ' + e.items.join(', ') : ''}`, '#ffd040', { dy: 30, size: 12, dur: 2200 }); break;
      case 'hexstate': case 'build': case 'explore': App.mapDirty = true; break;
      case 'turn': App.banner = { text: `Turno ${e.turn} · ${FACTION_NAME[e.fac]}`, sub: g.human ? (e.fac === g.human ? 'Tocca a te' : 'Muove l’avversario') : '', t0: performance.now(), dur: 1300 / App.speed, fac: e.fac }; break;
      case 'over': App.mapDirty = true; break;
      case 'exit': this.float(e.hex, 'Esce dalla mappa', '#ffd0a0'); break;
    }
  },
  finish(a) {
    const e = a.e;
    if (e.type === 'spell') { if (e.fail) this.float(e.hex, 'Fallita', '#c0c0c0', { dy: -20 }); else if (e.level) this.float(e.hex, e.level, '#ffe080', { dy: -20, size: 13 }); }
  },
  movePos(a) {
    const path = a.e.path, n = path.length - 1;
    if (n <= 0) return this.hexXY(path[0]);
    const t = a.p * n, i = Math.min(n - 1, Math.floor(t)), f = t - i;
    const ease = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    const [x0, y0] = this.hexXY(path[i]), [x1, y1] = this.hexXY(path[i + 1]);
    return [x0 + (x1 - x0) * ease, y0 + (y1 - y0) * ease - Math.sin(ease * Math.PI) * 5];
  },
  arrow(c, x0, y0, x1, y1, dashed) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const sx = x0 + ux * 14, sy = y0 + uy * 14, ex = x1 - ux * 16, ey = y1 - uy * 16;
    c.save(); if (dashed) c.setLineDash([6, 6]);
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - ux * 10 - uy * 6, ey - uy * 10 + ux * 6); c.lineTo(ex - ux * 10 + uy * 6, ey - uy * 10 - ux * 6); c.closePath(); c.fillStyle = c.strokeStyle; c.fill();
    c.restore();
  },
  // disegno nello spazio della mappa
  drawWorld(c) {
    const a = App.anim, now = performance.now();
    if (a) {
      const e = a.e, p = a.p;
      if (e.type === 'melee' || e.type === 'ranged') {
        const [tx, ty] = this.hexXY(e.hex);
        c.save();
        for (const f of e.from) {
          const [fx, fy] = this.hexXY(f);
          if (e.type === 'ranged') {
            // frecce in volo
            for (let k = 0; k < 3; k++) { const q = Math.min(1, Math.max(0, p * 1.6 - k * 0.15)); if (q <= 0 || q >= 1) continue; const x = fx + (tx - fx) * q, y = fy + (ty - fy) * q - Math.sin(q * Math.PI) * 30; const ang = Math.atan2((ty - fy) - Math.cos(q * Math.PI) * 30 * Math.PI / 2 * 0, tx - fx); c.save(); c.translate(x + k * 4, y); c.rotate(ang); c.strokeStyle = '#2a1a0a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-9, 0); c.lineTo(7, 0); c.stroke(); c.fillStyle = '#2a1a0a'; c.beginPath(); c.moveTo(9, 0); c.lineTo(4, -3); c.lineTo(4, 3); c.fill(); c.restore(); }
          } else {
            const q = p < 0.5 ? p * 2 : 2 - p * 2;
            c.strokeStyle = `rgba(255,60,30,${0.9 - p * 0.6})`; c.lineWidth = 4;
            const mx = fx + (tx - fx) * (0.35 + q * 0.3), my = fy + (ty - fy) * (0.35 + q * 0.3);
            this.arrow(c, fx, fy, mx, my);
          }
        }
        if (p > 0.45) {
          const q = (p - 0.45) / 0.55;
          c.globalAlpha = 1 - q; c.fillStyle = e.type === 'melee' ? '#ffe070' : '#ffffff';
          c.beginPath(); for (let i = 0; i < 16; i++) { const r = (i % 2 ? 10 : 28) * (0.6 + q); const an = i / 16 * Math.PI * 2; c.lineTo(tx + Math.cos(an) * r, ty + Math.sin(an) * r); } c.closePath(); c.fill();
        }
        c.restore();
      }
      if (e.type === 'spell') {
        const [fx, fy] = this.hexXY(e.from), [tx, ty] = this.hexXY(e.hex);
        const col = e.fac === 'O' ? [255, 230, 140] : [190, 60, 255];
        c.save();
        const icon = IMG['M:' + e.name];
        if (p < 0.55) {
          const q = p / 0.55, x = fx + (tx - fx) * q, y = fy + (ty - fy) * q - Math.sin(q * Math.PI) * 40;
          const gr = c.createRadialGradient(x, y, 2, x, y, 26); gr.addColorStop(0, `rgba(${col},0.95)`); gr.addColorStop(1, `rgba(${col},0)`);
          c.fillStyle = gr; c.beginPath(); c.arc(x, y, 26, 0, 7); c.fill();
          for (let k = 1; k < 6; k++) { const qq = Math.max(0, q - k * 0.04), xx = fx + (tx - fx) * qq, yy = fy + (ty - fy) * qq - Math.sin(qq * Math.PI) * 40; c.fillStyle = `rgba(${col},${0.5 - k * 0.08})`; c.beginPath(); c.arc(xx, yy, 7 - k, 0, 7); c.fill(); }
        } else {
          const q = (p - 0.55) / 0.45;
          if (!e.fail) {
            c.globalAlpha = 1 - q;
            const gr = c.createRadialGradient(tx, ty, 4, tx, ty, 30 + q * 50); gr.addColorStop(0, `rgba(${col},0.9)`); gr.addColorStop(1, `rgba(${col},0)`);
            c.fillStyle = gr; c.beginPath(); c.arc(tx, ty, 30 + q * 50, 0, 7); c.fill();
            c.strokeStyle = `rgb(${col})`; c.lineWidth = 3; c.beginPath(); c.arc(tx, ty, 10 + q * 45, 0, 7); c.stroke();
          } else { c.globalAlpha = 1 - q; c.fillStyle = 'rgba(80,80,80,0.6)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(tx + Math.cos(k) * q * 30, ty - q * 20 + Math.sin(k * 2) * 8, 8 * (1 - q) + 2, 0, 7); c.fill(); } }
        }
        if (icon) { c.globalAlpha = p < 0.8 ? 1 : (1 - p) * 5; const s = 54; c.drawImage(icon, fx - s / 2, fy - s - 26, s, s); c.strokeStyle = '#000'; c.lineWidth = 1.5; c.strokeRect(fx - s / 2, fy - s - 26, s, s); }
        c.restore();
      }
      if (e.type === 'recruit' || e.type === 'summon') {
        const [x, y] = this.hexXY(e.hex); const u = App.g.byUid(e.uid);
        if (u) { c.save(); const s = HEX * 1.18 * (0.3 + 0.7 * p); c.globalAlpha = p; drawCounter(c, u, x, y, s); c.restore(); }
        c.save(); c.strokeStyle = `rgba(255,240,180,${1 - p})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 10 + p * 40, 0, 7); c.stroke(); c.restore();
      }
      if (e.type === 'capture' || e.type === 'loot' || e.type === 'build' || e.type === 'explore') {
        const [x, y] = this.hexXY(e.hex); c.save(); c.strokeStyle = `rgba(255,215,80,${1 - p})`; c.lineWidth = 4; hexPath(c, x, y, HEX * (0.6 + 0.5 * p)); c.stroke(); c.restore();
      }
    }
    // testi fluttuanti
    for (const f of App.floats) {
      const q = (now - f.t0) / (f.dur - 0); if (q < 0) continue;
      c.save(); c.globalAlpha = q > 0.75 ? (1 - q) * 4 : 1;
      const y = f.y - q * 22;
      c.font = `bold ${f.size}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      if (f.box) { const w = c.measureText(f.text).width + 14; c.fillStyle = f.box; roundRect(c, f.x - w / 2, y - f.size * 0.8, w, f.size * 1.6, 5); c.fill(); c.strokeStyle = '#f2d27a'; c.lineWidth = 1; c.stroke(); }
      else { c.strokeStyle = 'rgba(0,0,0,0.85)'; c.lineWidth = 3.5; c.strokeText(f.text, f.x, y); }
      c.fillStyle = f.color; c.fillText(f.text, f.x, y);
      c.restore();
    }
  },
  // disegno nello spazio dello schermo (striscioni)
  drawScreen(c) {
    const b = App.banner; if (!b) return;
    const q = (performance.now() - b.t0) / b.dur; if (q >= 1) { App.banner = null; return; }
    const al = q < 0.15 ? q / 0.15 : q > 0.8 ? (1 - q) / 0.2 : 1;
    const W = App.W - App.panelW, y = App.H * 0.38;
    c.save(); c.globalAlpha = al;
    const gr = c.createLinearGradient(0, 0, W, 0); const col = b.fac === 'C' ? '120,16,30' : b.fac === 'O' ? '24,52,120' : '60,40,20';
    gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(0.2, `rgba(${col},0.88)`); gr.addColorStop(0.8, `rgba(${col},0.88)`); gr.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = gr; c.fillRect(0, y - 40, W, b.sub ? 92 : 76);
    c.fillStyle = '#f6e7c4'; c.font = `bold 32px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(b.text, W / 2, y - 4);
    if (b.sub) { c.font = `italic 15px ${SERIF}`; c.fillStyle = '#f2d27a'; c.fillText(b.sub, W / 2, y + 30, W - 40); }
    c.restore();
  },
};
