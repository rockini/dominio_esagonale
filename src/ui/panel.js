// ============================================================
//  PANNELLO LATERALE e AZIONI del giocatore umano
// ============================================================
const Panel = {
  draw(c) {
    const pw = App.panelW, x0 = App.W - pw, g = App.g;
    c.save();
    c.fillStyle = 'rgba(244,232,205,0.97)'; c.fillRect(x0, 48, pw, App.H - 48);
    c.fillStyle = '#7a5530'; c.fillRect(x0, 48, 2, App.H - 48);
    c.beginPath(); c.rect(x0, 48, pw, App.H - 48); c.clip();
    const P = this.P = { c, x: x0 + 14, w: pw - 28, y: 60 - App.panelScroll };
    App.button(c, App.W - 34, 54, 26, 22, '✕', () => { App.show.panel = false; }, { size: 11 });
    const m = App.mode;
    if (m && m.kind === 'attack') this.attack(m);
    else if (m && (m.kind === 'spellPick' || m.kind === 'spell')) this.spells(m);
    else if (m && m.kind === 'ability') { this.T(m.name, { b: true, s: 16, serif: true }); this.T(m.text); this.T('Tocca un bersaglio evidenziato sulla mappa.', { i: true, col: '#7a5530' }); this.btn('Annulla', () => App.mode = null); }
    else if (App.sel) this.hex(App.sel);
    else this.overview();
    App.panelContentH = P.y + App.panelScroll - 48 + 30;
    c.restore();
  },
  // ---------------- primitive di impaginazione
  T(txt, o = {}) {
    const P = this.P, c = P.c, s = o.s || 12.5;
    c.font = `${o.b ? 'bold ' : ''}${o.i ? 'italic ' : ''}${s}px ${o.serif ? SERIF : FONT}`; c.fillStyle = o.col || '#2b1a0c'; c.textAlign = 'left'; c.textBaseline = 'top';
    for (const l of wrap(c, txt, P.w - (o.indent || 0))) { c.fillText(l, P.x + (o.indent || 0), P.y); P.y += s * 1.35; }
    P.y += o.after ?? 3;
  },
  H2(t) { const P = this.P, c = P.c; P.y += 6; c.font = `bold 11px ${FONT}`; c.fillStyle = '#8a5a22'; c.textBaseline = 'top'; c.textAlign = 'left'; c.fillText(t.toUpperCase(), P.x, P.y); c.fillStyle = 'rgba(122,85,48,0.35)'; c.fillRect(P.x, P.y + 14, P.w, 1); P.y += 20; },
  btn(label, on, opt = {}) { const P = this.P; App.button(P.c, P.x + (opt.dx || 0), P.y, opt.w || P.w, opt.h || 28, label, on, Object.assign({ size: 12 }, opt)); if (!opt.inline) P.y += (opt.h || 28) + 5; },
  // fila di bottoni che va a capo
  row(items) {
    const P = this.P, c = P.c; let x = 0;
    c.font = `12px ${FONT}`;
    for (const it of items) {
      const w = Math.min(P.w, c.measureText(it.label).width + 22 + (it.icon ? 22 : 0));
      if (x + w > P.w) { x = 0; P.y += 30; }
      App.button(c, P.x + x, P.y, w, 26, it.label, it.on, { size: 11.5, disabled: it.disabled, color: it.color, icon: it.icon, active: it.active });
      x += w + 5;
    }
    if (items.length) P.y += 31;
  },
  // ---------------- panoramica
  overview() {
    const g = App.g, s = g.scn;
    this.T(s.group + ' · ' + s.id, { s: 11, col: '#7a5530', after: 0 });
    this.T(s.title, { b: true, s: 18, serif: true, after: 6 });
    this.T(`Turno ${g.turn} di ${s.turns} · primo giocatore ${FACTION_NAME[s.first]}`, { s: 12 });
    this.H2('Obiettivi');
    for (const v of s.victory) this.T('• ' + v, { s: 12 });
    this.H2('Situazione');
    for (const f of ['O', 'C']) {
      const us = g.friends(f); if (!us.length && !(s.coop && f === 'C')) continue;
      const cmd = g.commander(f);
      this.T(`${FACTION_NAME[f]}${g.human === f ? ' (tu)' : ''}`, { b: true, col: PAL.faction[f], after: 0 });
      this.T(`${us.length} unità · ${g.gold[f]} Oro · ${g.pv(f)} PV · ${g.settlements(f).length} insediamenti${cmd ? ' · comandante ' + uname(cmd) + (cmd.dead ? ' (caduto)' : '') : ''}`, { s: 11.5, after: 6 });
    }
    if (App.isHumanTurn()) {
      this.H2('Le tue pile');
      const stacks = new Map(); for (const u of g.friends(g.human)) { if (!stacks.has(u.hex)) stacks.set(u.hex, []); stacks.get(u.hex).push(u); }
      const ready = [...stacks.entries()].filter(([, us]) => g.phase === 'move' ? us.some(u => g.canMove(u)) : g.phase === 'combat' ? us.some(u => g.canAttack(u) || g.canCast(u)) : true);
      if (!ready.length) this.T('Nessuna pila deve ancora agire in questa fase.', { i: true, col: '#7a5530' });
      this.row(ready.slice(0, 24).map(([hid, us]) => ({ label: `${g.hexLabel(hid)} (${us.length})`, on: () => { const h = g.map.hexes[hid]; App.select(h); App.centerOn(h); } })));
      if (g.phase === 'recruit') {
        const sites = g.recruitSites(g.human).filter(h => g.recruitOptions(h.id).list.some(o => o.ok) || g.buildOptions(h.id).some(o => o.ok));
        if (sites.length) { this.H2('Dove reclutare'); this.row(sites.map(h => ({ label: h.feature.name, on: () => { App.select(h); App.centerOn(h); } }))); }
      }
    }
  },
  // ---------------- esagono selezionato
  hex(h) {
    const g = App.g, tr = TERRAIN[h.terrain], P = this.P;
    App.button(P.c, App.W - 96, P.y - 4, 56, 22, '← Info', () => { App.sel = null; App.picked = new Set(); App.R = null; App.panelScroll = 0; }, { size: 11 });
    this.T(h.feature ? h.feature.name : tr.name, { b: true, s: 17, serif: true, after: 0 });
    let sub = `${String(h.c + 1).padStart(2, '0')}${String(h.r + 1).padStart(2, '0')} · ${tr.name}`;
    if (h.feature) sub += ' · ' + (h.owner ? FACTION_NAME[h.owner] : 'neutrale');
    if (h.state !== 'normale') sub += ' · ' + (h.state === 'corrotto' ? 'Corrotto' : 'Purificato');
    if (h.plague) sub += ' · Piaga'; if (h.fortified) sub += ' · Fortificata'; if (h.breaches) sub += ` · ${h.breaches} brecce`; if (h.sacked) sub += ' · saccheggiata';
    this.T(sub, { s: 11.5, col: '#7a5530', after: 2 });
    const cost = tr.cost === Infinity ? 'vietato' : `${tr.cost} PM`;
    this.T(`Movimento ${cost} · mischia ${fmtCol(tr.melee)} · tiro ${fmtCol(tr.ranged)}${tr.settlement ? ` · ${tr.gold} Oro, ${tr.pv} PV` : ''}${h.key ? ' · esagono chiave' : ''}`, { s: 11, col: '#5a4026', after: 4 });
    const human = App.isHumanTurn() && !App.busy();
    // reclutamento e costruzioni
    if (human && g.phase === 'recruit' && h.owner === g.human) {
      const ro = g.recruitOptions(h.id);
      if (ro.list.length) {
        this.H2(`Reclutamento (${ro.used}/${ro.max}) · ${g.gold[g.human]} Oro`);
        this.row(ro.list.map(o => ({ label: `${UNITS[o.type].name.split(',')[0]}${o.grade === 'V' ? ' (V)' : ''} ${o.cost}`, icon: counterImage(o.type), disabled: !o.ok, on: () => Act.recruit(h.id, o.type, o.grade) })));
      }
      const bo = g.buildOptions(h.id);
      if (bo.length) { this.H2('Costruzioni'); this.row(bo.map(o => ({ label: `${o.name} · ${o.cost} Oro`, disabled: !o.ok, on: () => Act.build(h.id, o.id) }))); }
    }
    const us = App.stackOrder(g.unitsAt(h.id));
    if (!us.length) return;
    const mine = us[0].fac === g.human;
    this.H2(`Pila (${us.length}) · ${FACTION_NAME[us[0].fac] || 'Neutrali'}`);
    const ld = stackLoad(us);
    this.T(`Impilamento ${ld.p}/4 punti, ${ld.l}/2 Eroi o Boss`, { s: 11, col: '#7a5530' });
    // controlli di movimento
    if (human && mine && g.phase === 'move') {
      const pk = App.pickedUnits().filter(u => g.canMove(u));
      const items = [];
      if (us.filter(u => g.canMove(u)).length > 1) items.push({ label: 'Tutte', on: () => { App.picked = new Set(us.filter(u => g.canMove(u)).map(u => u.uid)); App.updateReach(); } });
      if (pk.length && g.canForce(pk)) items.push({ label: 'Marcia Forzata', active: App.forced, on: () => { App.forced = !App.forced; App.updateReach(); } });
      if (pk.length && pk.every(u => g.canFly(u))) items.push({ label: 'In volo', active: App.fly, on: () => { App.fly = !App.fly; App.updateReach(); } });
      if (pk.some(u => g.canExit(u))) items.push({ label: 'Esci dalla mappa', color: '#6a2a10', on: () => Act.exit(pk.filter(u => g.canExit(u))) });
      this.row(items);
      if (App.R) this.T(`${fmtPM(App.R.mp)} PM disponibili${App.R.fly ? ', in volo' : ''}. Tocca un esagono verde per muovere.`, { s: 11.5, i: true, col: '#2a5a2a' });
      else if (pk.length) this.T('Queste unità non possono muovere insieme.', { s: 11.5, i: true, col: '#8a2a1a' });
    }
    if (human && mine && g.phase === 'combat' && g.step <= 2 && us.some(u => g.canAttack(u))) this.T('Tocca un esagono nemico evidenziato per attaccare con le unità spuntate.', { s: 11.5, i: true, col: '#7a2a1a' });
    for (const u of us) this.unit(u, human && mine);
  },
  unit(u, act) {
    const g = App.g, P = this.P, c = P.c, U = g.U(u);
    const y0 = P.y;
    const picked = App.picked.has(u.uid);
    if (act) {
      App.button(c, P.x, y0 + 14, 20, 20, picked ? '✓' : '', () => { if (picked) App.picked.delete(u.uid); else App.picked.add(u.uid); App.updateReach(); }, { size: 13, active: picked });
    }
    const cx = P.x + (act ? 26 : 0);
    App.counter(c, u, cx + 24, y0 + 24, 46, false, true);
    c.save(); c.textBaseline = 'top'; c.textAlign = 'left';
    const tx = cx + 56, tw = P.w - (tx - P.x);
    c.font = `bold 12.5px ${FONT}`; c.fillStyle = PAL.faction[u.fac] || '#333';
    c.fillText(uname(u) + (u.grade !== 'B' ? ` (${GRADE_NAME[u.grade]})` : '') + (u.commander ? ' ★' : ''), tx, y0, tw);
    c.font = `11.5px ${FONT}`; c.fillStyle = '#2b1a0c';
    const fm = g.isCaster(u) ? ` FM ${u.fm}/${g.maxFM(u)}` : '';
    c.fillText(`V${g.V(u)} F${g.F(u)} D${g.D(u)} P${g.P(u)} R ${g.curR(u)}/${g.maxR(u)}${fm} · PE ${u.pe}`, tx, y0 + 16, tw);
    const tags = [];
    for (const s of u.status) tags.push(STATUS_NAME[s] || s);
    if (u.moved && g.active === u.fac) tags.push('ha mosso'); if (u.attacked) tags.push('ha attaccato');
    for (const e of u.effects) tags.push(`${e.src || e.k}${e.k.length === 1 ? ` ${e.v > 0 ? '+' : ''}${e.v} ${e.k}` : ''}`);
    for (const i of u.items) tags.push('✦ ' + i.name);
    c.fillStyle = '#5a4026'; c.font = `italic 11px ${FONT}`;
    let yy = y0 + 31;
    const info = wrap(c, (tags.length ? tags.join(' · ') + ' — ' : '') + U.kw.join(', ') + (U.ab && U.ab !== '—' ? ' — ' + U.ab : ''), tw);
    const maxL = App.sel && g.unitsAt(App.sel.id).length <= 2 ? 6 : 3;
    for (const l of info.slice(0, maxL)) { c.fillText(l, tx, yy); yy += 13; }
    c.restore();
    P.y = Math.max(y0 + 54, yy + 3);
    if (!act) { P.y += 4; return; }
    // azioni dell'unità
    const items = [];
    if (g.phase === 'recruit') {
      if (g.trainOptions().includes(u)) items.push({ label: 'Addestra · 2 Oro', disabled: g.gold.O < 2, on: () => Act.run(() => g.train(u.uid)) });
      if (g.forcedMutationOptions().includes(u)) items.push({ label: 'Mutazione Forzata', on: () => Act.run(() => g.forcedMutation(u.uid)) });
    }
    if (g.phase === 'combat') {
      if (g.canCast(u)) items.push({ label: `Magie (${u.fm} FM)`, color: u.fac === 'O' ? '#2a4a8a' : '#5a1a6a', on: () => { App.mode = { kind: 'spellPick', uid: u.uid }; App.panelScroll = 0; } });
      if (g.canFury(u)) items.push({ label: 'Furia', color: '#8a2010', on: () => Act.run(() => g.fury(u.uid)) });
      for (const ab of g.heroAbilities(u)) items.push({ label: ab.name, color: '#5a1a6a', on: () => Act.ability(u, ab) });
      const sp = g.specialOptions(u);
      for (const o of sp) items.push({ label: `${o.name}${o.hex !== u.hex ? ' ' + DIR_NAMES[g.map.dirTo(g.hexOf(u), g.map.hexes[o.hex])] : ''}`, color: '#4a3a10', on: () => Act.run(() => g.doSpecial(u.uid, o.id, o.hex, { uid: o.uid })) });
    }
    if (g.canUseItem(u)) for (const it of g.consumables(u)) items.push({ label: 'Usa ' + it.name, color: '#6a5010', on: () => Act.run(() => g.useItem(u.uid, it.name)) });
    if (items.length) { const x0 = P.x; P.x += 26; P.w -= 26; this.row(items); P.x = x0; P.w += 26; }
    P.y += 2;
  },
  // ---------------- attacco
  attack(m) {
    const g = App.g, h = g.map.hexes[m.hex];
    const cand = m.type === 'ranged' ? g.rangedCandidates(m.hex) : g.meleeCandidates(m.hex);
    this.T((m.type === 'ranged' ? 'Tiro contro ' : 'Mischia contro ') + g.hexLabel(m.hex), { b: true, s: 17, serif: true });
    const both = g.step <= 1 && g.rangedCandidates(m.hex).length && g.meleeCandidates(m.hex).length;
    if (both) this.row([{ label: 'Tiro', active: m.type === 'ranged', on: () => Act.openAttack(m.hex, 'ranged') }, { label: 'Mischia', active: m.type === 'melee', on: () => Act.openAttack(m.hex, 'melee') }]);
    const us = [...m.uids].map(id => g.byUid(id)).filter(u => cand.includes(u));
    if (us.length) {
      const pv = m.type === 'ranged' ? g.rangedPreview(us, m.hex) : g.meleePreview(us, m.hex);
      if (m.type === 'ranged') this.T(`Fattore di Tiro ${pv.ft} → colonna ${RANGED_COLS[pv.col0]}${pv.tot ? ` spostata a ${pv.colName}` : ''}`, { b: true });
      else this.T(`Forza ${pv.ftA} contro Difesa ${pv.ftD} → ${MELEE_COLS[pv.col0]}${pv.tot ? `, spostata a ${pv.colName}` : ''}`, { b: true });
      for (const s of pv.shifts) this.T(`${s.label}: ${s.v > 0 ? '+' : ''}${s.v}`, { s: 11.5, indent: 10, col: s.v > 0 ? '#1a5a1a' : '#8a1a1a', after: 0 });
      this.P.y += 4;
      this.H2('Probabilità dei risultati (1d6)');
      const order = m.type === 'ranged' ? Object.keys(pv.probs) : ['AE', 'AR', 'EX', 'DR', 'DE', 'DE*', 'DE**', 'DE***'].filter(k => pv.probs[k]);
      for (const k of order) {
        const p = pv.probs[k]; const P = this.P, c = P.c;
        const good = m.type === 'ranged' ? k !== '—' : k.startsWith('D');
        c.fillStyle = good ? '#3a7a2a' : k === 'EX' ? '#a08020' : '#9a2a1a';
        c.fillRect(P.x, P.y + 2, Math.max(2, (P.w - 150) * p), 12);
        c.fillStyle = '#2b1a0c'; c.font = `bold 11.5px ${FONT}`; c.textBaseline = 'top'; c.fillText(`${Math.round(p * 6)}/6`, P.x + (P.w - 150) * p + 6, P.y + 2);
        c.font = `11.5px ${FONT}`; c.fillText(this.resText(k, m.type), P.x + P.w - 140, P.y + 2, 140);
        P.y += 18;
      }
      this.P.y += 4;
      this.btn(m.type === 'ranged' ? '➶ Tira!' : '⚔ Attacca!', () => Act.doAttack(), { bold: true, color: '#7a2a1a', h: 34, size: 14 });
    } else this.T('Spunta almeno un’unità attaccante.', { i: true, col: '#8a2a1a' });
    this.btn('Annulla', () => App.mode = null);
    this.H2('Attaccanti');
    for (const u of cand) {
      const P = this.P, on = m.uids.has(u.uid);
      App.button(P.c, P.x, P.y, P.w, 30, `${uname(u)} · ${m.type === 'ranged' ? 'P' + g.P(u) + ' F' + g.F(u) : 'F' + g.F(u)} · da ${DIR_NAMES[g.map.dirTo(h, g.hexOf(u))] || ''}`, () => { if (on) m.uids.delete(u.uid); else m.uids.add(u.uid); }, { active: on, left: true, icon: counterImage(u.type), size: 12 });
      P.y += 34;
    }
    this.H2('Difensori');
    for (const u of g.unitsAt(m.hex)) this.unit(u, false);
  },
  resText(k, type) {
    if (type === 'ranged') return k === '—' ? 'nessun effetto' : k.endsWith('D') ? `${k[0]} danno, test di morale` : `${k[0]} danni, test di morale`;
    return { AE: 'attaccanti eliminati', AR: 'attaccanti respinti', EX: 'scambio', DR: 'difensori respinti', DE: 'difensori eliminati', 'DE*': 'DE + 1 danno extra', 'DE**': 'DE + 2 danni extra', 'DE***': 'DE + 3 danni extra' }[k] || k;
  },
  // ---------------- magie
  spells(m) {
    const g = App.g, u = g.byUid(m.uid);
    this.T('Magie di ' + uname(u), { b: true, s: 17, serif: true, after: 0 });
    this.T(`${u.fm} Forza Magica · ${u.casts}/${g.maxCasts(u)} lanci in questo turno`, { s: 11.5, col: '#7a5530' });
    if (m.kind === 'spell') {
      const sp = SPELL_BY_NAME[m.sp];
      this.H2(sp.name);
      this.T(sp.text, { s: 12 });
      if (sp.name === 'Colonna di Fuoco') this.row([{ label: '3 danni a un’unità', active: m.cmode === 'unit', on: () => m.cmode = 'unit' }, { label: '1 danno a tutte', active: m.cmode === 'hex', on: () => m.cmode = 'hex' }]);
      if (m.choose !== undefined) {
        this.T('Scegli il bersaglio:', { b: true });
        for (const t of m.targets.filter(t => t.hex === m.choose)) { const x = g.byUid(t.uid); this.btn(`${uname(x)} · R ${g.curR(x)}/${g.maxR(x)}`, () => Act.cast(t), { left: true, icon: counterImage(x.type) }); }
      } else this.T(m.targets.length ? 'Tocca un esagono evidenziato sulla mappa.' : 'Nessun bersaglio valido in portata.', { i: true, col: '#7a5530' });
      this.btn('← Altre magie', () => App.mode = { kind: 'spellPick', uid: m.uid });
      return;
    }
    this.btn('Annulla', () => App.mode = null);
    for (const { sp, cost, ok } of g.spellsFor(u)) {
      const P = this.P, c = P.c;
      const ts = ok ? g.spellTargets(u, sp) : [];
      const can = ok && ts.length > 0;
      const icon = IMG['M:' + sp.name];
      const y0 = P.y;
      App.button(c, P.x, y0, P.w, 62, '', () => Act.pickSpell(u, sp), { disabled: !can });
      c.save(); if (!can) c.globalAlpha = 0.5;
      if (icon) c.drawImage(icon, P.x + 5, y0 + 5, 52, 52);
      c.fillStyle = '#f6e7c4'; c.font = `bold 12.5px ${FONT}`; c.textBaseline = 'top'; c.textAlign = 'left';
      c.fillText(`${sp.name} · ${cost} FM${sp.range ? ' · portata ' + g.spellRange(u, sp) : ''}`, P.x + 64, y0 + 6, P.w - 70);
      c.font = `11px ${FONT}`; c.fillStyle = '#e0cfa8';
      wrap(c, sp.text + (sp.reaction ? ' (reazione)' : ''), P.w - 72).slice(0, 3).forEach((l, i) => c.fillText(l, P.x + 64, y0 + 22 + i * 12.5));
      c.restore();
      P.y += 67;
    }
  },
};

// ------------------------------------------------------------
//  Azioni
// ------------------------------------------------------------
const Act = {
  run(fn) { const r = fn(); if (r && r.ok === false && r.why) App.say(r.why); App.afterAction(); return r; },
  recruit(hid, type, grade) { this.run(() => App.g.recruit(hid, type, grade)); },
  build(hid, id) { this.run(() => App.g.build(hid, id)); App.mapDirty = true; },
  move(dest) {
    const g = App.g, us = App.pickedUnits().filter(u => g.canMove(u));
    const r = g.move(us.map(u => u.uid), dest, { forced: App.forced, fly: App.fly && us.every(u => g.canFly(u)) });
    if (!r.ok) { App.say(r.why || 'Movimento non valido.'); return; }
    App.forced = false; App.sel = g.map.hexes[dest];
    App.picked = new Set(g.unitsAt(dest).filter(u => u.fac === g.human && g.canMove(u)).map(u => u.uid));
    App.afterAction();
  },
  exit(us) { this.run(() => App.g.exitMap(us.map(u => u.uid))); },
  openAttack(hid, force) {
    const g = App.g;
    const rc = g.step <= 1 ? g.rangedCandidates(hid) : [], mc = g.meleeCandidates(hid);
    const pk = App.pickedUnits();
    let type = force || (rc.length && (pk.some(u => rc.includes(u)) || !mc.length) ? 'ranged' : 'melee');
    if (type === 'melee' && !mc.length) type = 'ranged';
    if (type === 'ranged' && !rc.length) { App.say(g.step > 1 ? 'I tiri vanno risolti prima della mischia.' : 'Nessun tiratore può colpire quell’esagono.'); return; }
    const cand = type === 'ranged' ? rc : mc;
    let uids = pk.filter(u => cand.includes(u));
    if (!uids.length) uids = cand.filter(u => type === 'ranged' || !g.has(u, 'Tiratore') || cand.every(x => g.has(x, 'Tiratore')));
    if (!uids.length) uids = cand;
    App.mode = { kind: 'attack', type, hex: hid, uids: new Set(uids.map(u => u.uid)) };
    App.show.panel = true; App.panelScroll = 0;
  },
  doAttack() {
    const g = App.g, m = App.mode; if (!m || App.busy()) return;
    const uids = [...m.uids];
    App.mode = null;
    if (m.type === 'ranged') { this.run(() => g.ranged(uids, m.hex)); return; }
    const out = g.melee(uids, m.hex);
    if (!out.ok) { App.say(out.why || 'Attacco non valido.'); return; }
    App.afterAction();
    if (out.canAdvance && out.canAdvance.length && !g.winner) App.later(() => Modals.advance(out.canAdvance, m.hex));
  },
  pickSpell(u, sp) {
    const g = App.g, ts = g.spellTargets(u, sp);
    if (sp.target === 'self') { App.mode = null; this.run(() => g.cast(u.uid, sp.name, ts[0])); return; }
    App.mode = { kind: 'spell', uid: u.uid, sp: sp.name, targets: ts, cmode: 'unit' };
  },
  spellClick(h) {
    const m = App.mode, ts = m.targets.filter(t => t.hex === h.id);
    if (!ts.length) { App.say('Bersaglio non valido per questa magia.'); return; }
    const sp = SPELL_BY_NAME[m.sp];
    if (sp.name === 'Colonna di Fuoco' && m.cmode === 'unit') {
      const en = App.g.unitsAt(h.id).filter(x => x.fac !== App.g.active);
      if (en.length > 1) { m.choose = h.id; m.targets = m.targets.filter(t => t.hex === h.id).length ? m.targets : m.targets; m.targets = [...m.targets.filter(t => t.hex !== h.id), ...en.map(x => ({ hex: h.id, uid: x.uid }))]; App.show.panel = true; return; }
      this.cast({ hex: h.id, uid: en[0] && en[0].uid }); return;
    }
    if (ts.length > 1 && ts[0].uid !== undefined) { m.choose = h.id; App.show.panel = true; return; }
    this.cast(ts[0]);
  },
  cast(t) {
    const g = App.g, m = App.mode; App.mode = null;
    const r = g.cast(m.uid, m.sp, t, { mode: m.cmode });
    if (r && r.ok === false) App.say(r.why || 'Magia non lanciata.');
    App.afterAction();
  },
  ability(u, ab) {
    if (ab.targets.length === 1 && ab.targets[0].uid === undefined) { this.run(() => App.g.useHeroAbility(u.uid, ab.id, ab.targets[0])); return; }
    App.mode = { kind: 'ability', uid: u.uid, id: ab.id, name: ab.name, text: ab.text, targets: ab.targets };
  },
  abilityClick(h) {
    const m = App.mode, t = m.targets.find(t => t.hex === h.id);
    if (!t) { App.say('Bersaglio non valido.'); return; }
    App.mode = null; this.run(() => App.g.useHeroAbility(m.uid, m.id, t));
  },
  itemClick() { App.mode = null; },
};

// ------------------------------------------------------------
//  Schieramento iniziale
// ------------------------------------------------------------
const Deploy = {
  zone() { const g = App.g, z = g.dep && g.dep.zones; return z && z[g.human]; },
  click(h) {
    const g = App.g, z = this.zone();
    const pk = App.pickedUnits().filter(u => u.fac === g.human);
    if (App.sel && pk.length && h !== App.sel && z && z.has(h.id)) {
      const here = g.unitsAt(h.id);
      if (here.some(u => u.fac !== g.human)) { App.say('Esagono occupato dal nemico.'); return; }
      if (!pk.every(u => canStand(g.map, h, u.type))) { App.say('Terreno non adatto a queste unità.'); return; }
      const ld = stackLoad([...here, ...pk]);
      if (ld.p > 4 || ld.l > 2) { App.say('Limite di impilamento superato.'); return; }
      for (const u of pk) { u.hex = h.id; u.startHex = h.id; }
      App.sel = h; App.picked = new Set(pk.map(u => u.uid));
      return;
    }
    if (App.sel === h) { App.sel = null; App.picked = new Set(); return; }
    App.sel = h; App.panelScroll = 0;
    App.picked = new Set(g.unitsAt(h.id).filter(u => u.fac === g.human).map(u => u.uid));
  },
  finish() { App.sel = null; App.picked = new Set(); App.beginPlay(); },
  drawZones(c, m) {
    const z = App.g.dep.zones;
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
};
