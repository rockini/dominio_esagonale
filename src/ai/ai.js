// ============================================================
//  INTELLIGENZA ARTIFICIALE
//  Un generatore che esegue il turno un'azione alla volta (yield dopo ogni
//  azione), così l'interfaccia può animare le mosse dell'avversario.
// ============================================================
const AI = {
  value(g, u) {
    const U = g.U(u); let v = (U.cost || 6) + (u.grade === 'V' ? 3 : u.grade === 'E' ? 6 : 0);
    if (g.isLeader(u)) v *= 1.5; if (u.commander) v += 15; if (u.items.some(i => i.special)) v += 25;
    return v;
  },
  material(g, fac) {
    let s = 0;
    for (const u of g.units) if (u.fac === fac && g.alive(u)) s += this.value(g, u) * (0.35 + 0.65 * g.curR(u) / g.maxR(u)) * (g.st(u, 'disgregato') ? 0.85 : 1);
    return s;
  },
  evaluate(g, fac) {
    const e = OTHER[fac];
    let s = this.material(g, fac) - this.material(g, e);
    s += 4 * (g.pv(fac) - g.pv(e));
    if (g.winner) s += g.winner === fac ? 1000 : g.winner === 'draw' ? 0 : -1000;
    return s;
  },
  isAttacker(g, fac) { const id = g.scn.id; return (fac === 'C' && ['18.1', '18.3', '19.4', '20.8', '19.2'].includes(id)) || (fac === 'O' && ['20.6', '20.5', '19.8'].includes(id)); },
  strength(g, fac) { return g.friends(fac).reduce((s, u) => s + g.F(u) + g.D(u), 0); },
  // ---------------- obiettivi strategici
  objectives(g, fac) {
    const out = [], m = g.map, id = g.scn.id;
    const push = (h, v, kind) => { if (h) out.push({ h, v, kind }); };
    for (const h of m.hexes) {
      if (!h.feature) continue;
      const T = TERRAIN[h.terrain];
      let v = T.settlement ? 4 + T.pv * 3 + (T.gold || 0) : 3;
      if (h.terrain === 'tempio' || h.terrain === 'altare' || h.terrain === 'fenditura') v = 6;
      if (h.feature.type === 'testa') v = 10;
      if (h.terrain === 'rovina' && !h.explored) v = 5;
      if (h.key) v += 6;
      if (h.owner === fac) push(h, v * 0.8, 'defend'); else push(h, v, 'take');
    }
    if (id === '18.1') { const p = m.byName('Pietraluce'); push(p, 30, p.owner === fac ? 'defend' : 'take'); }
    if (id === '18.3') { const p = m.byName('Luminara'); push(p, 30, p.owner === fac ? 'defend' : 'take'); }
    if (id === '20.4') { const p = m.byName('Torre del Faro'); push(p, 30, p.owner === fac ? 'defend' : 'take'); }
    if (id === '19.4' && fac === 'C') for (const h of m.hexes) if (h.c === 0) push(h, 12, 'take');
    if (id === '19.4' && fac === 'O') { for (const h of m.hexes) if (h.c > m.W * 0.3 && h.c < m.W * 0.5 && h.terrain !== 'montagna') push(h, 5, 'defend'); }
    if (id === '19.3' || id === '20.6' || id === '20.5') {
      const name = id === '19.3' ? 'Reliquia' : id === '20.6' ? 'Lama del Giuramento Spezzato' : 'Sigillo';
      const c = SR.carry(g, name);
      if (c && c.fac !== fac) push(g.hexOf(c), 25, 'take');
      for (const hid of ((g.flags.dropped || {})[name] || [])) push(m.hexes[hid], 25, 'take');
      if (id === '20.6' && fac === 'O') push(m.hexes.find(h => h.terrain === 'tempio'), 40, 'take');
      if (id === '19.3' && c && c.fac === fac) push(m.hexes[g.flags.castle[fac]], 30, 'take');
    }
    if (id === '19.7') { const c = g.units.find(u => u.type === 'Colosso' && g.alive(u)); if (c && c.fac === 'N') push(g.hexOf(c), 20, 'take'); }
    // eroi nemici come bersagli secondari
    for (const u of g.friends(OTHER[fac])) if (u.commander) push(g.hexOf(u), 8, 'hunt');
    return out;
  },
  // pressione nemica: forza di mischia che può raggiungere ciascun esagono
  threatMap(g, fac) {
    const t = new Float32Array(g.map.hexes.length);
    for (const e of g.friends(OTHER[fac])) {
      if (e.fac === 'N' || g.st(e, 'dormiente')) continue;
      const r = g.V(e) + 1, h = g.hexOf(e), f = g.F(e);
      for (const x of g.map.hexes) { const d = g.map.dist(h, x); if (d <= r) t[x.id] += f * (d <= 1 ? 1 : 0.7); }
    }
    return t;
  },
  // ---------------- turno completo
  *turn(g, fac) {
    if (g.scn.coop && fac === 'C') { yield* AUTO_CHAOS.turn(g); return; }
    // reclutamento
    yield* this.recruitPhase(g, fac);
    g.nextPhase();
    yield { phase: 'move' };
    yield* this.movePhase(g, fac);
    g.nextPhase();
    yield { phase: 'combat' };
    yield* this.combatPhase(g, fac);
    g.nextPhase();
  },
  *recruitPhase(g, fac) {
    // oggetti: pozioni sulle unità ferite
    for (const u of g.friends(fac)) for (const it of g.consumables(u)) {
      if (it.name === 'Pozione di Guarigione' && g.curR(u) <= g.maxR(u) / 2) { g.useItem(u.uid, it.name); yield { act: 'item' }; }
    }
    if (fac === 'C') { const c = g.forcedMutationOptions().filter(u => u.grade === 'B' && g.U(u).cost >= 5).sort((a, b) => g.U(b).cost - g.U(a).cost)[0]; if (c && g.gold.C >= 12) { g.forcedMutation(c.uid); yield { act: 'mutation' }; } }
    if (fac === 'O') for (const u of g.trainOptions()) if (g.gold.O >= 14) g.train(u.uid);
    // costruzioni difensive negli insediamenti minacciati
    const threat = this.threatMap(g, fac);
    for (const h of g.settlements(fac)) {
      if (threat[h.id] < 6) continue;
      const b = g.buildOptions(h.id).filter(o => o.ok && (o.id === 'fortify' || o.id === 'repair'));
      if (b.length && g.gold[fac] >= b[0].cost + 8) { g.build(h.id, b[0].id); yield { act: 'build', hex: h.id }; }
    }
    // reclutamento
    let guard = 0;
    while (guard++ < 12) {
      const sites = g.recruitSites(fac).filter(h => g.recruitOptions(h.id, fac).list.some(o => o.ok));
      if (!sites.length) break;
      const enemies = g.friends(OTHER[fac]);
      const near = h => Math.min(99, ...enemies.map(e => g.map.dist(g.hexOf(e), h)));
      sites.sort((a, b) => near(a) - near(b));
      const site = sites[0];
      const opts = g.recruitOptions(site.id, fac).list.filter(o => o.ok);
      const mine = g.friends(fac);
      const ranged = mine.filter(u => g.has(u, 'Tiratore')).length / Math.max(1, mine.length);
      const casters = mine.filter(u => g.isCaster(u) && !g.isLeader(u)).length;
      const score = o => {
        const U = UNITS[o.type]; let s = (U.F + U.D + U.R * 1.5 + U.V * 0.5) / Math.sqrt(o.cost + 1);
        if (U.P > 0 && ranged < 0.3) s *= 1.4;
        if (U.FM >= 3 && casters < 2) s *= 1.5;
        if (U.kw.includes('Cavalleria') && near(site) > 4) s *= 1.15;
        if (near(site) <= 3) s *= 1 + U.D / 10;
        if (o.grade === 'V') s *= 1.1;
        return s * (0.8 + g.rng.next() * 0.4);
      };
      opts.sort((a, b) => score(b) - score(a));
      const keep = g.turn >= g.scn.turns - 1 ? 0 : 2;
      const pick = opts.find(o => g.gold[fac] - o.cost >= keep);
      if (!pick) break;
      g.recruit(site.id, pick.type, pick.grade);
      yield { act: 'recruit', hex: site.id };
    }
  },
  // ---------------- movimento
  *movePhase(g, fac) {
    const myStr = this.strength(g, fac), enStr = this.strength(g, OTHER[fac]);
    const aggr = Math.max(0.4, Math.min(1.6, myStr / Math.max(1, enStr)));
    const attackerRole = this.isAttacker(g, fac);
    const late = g.turn >= g.scn.turns - 2;
    let guard = 0;
    for (;;) {
      if (guard++ > 80) break;
      // pile con unità che possono muovere
      const stacks = new Map();
      for (const u of g.friends(fac)) if (g.canMove(u)) { if (!stacks.has(u.hex)) stacks.set(u.hex, []); stacks.get(u.hex).push(u); }
      if (!stacks.size) break;
      const enemies = g.friends(OTHER[fac]).filter(e => e.fac !== 'N');
      const distE = h => Math.min(99, ...enemies.map(e => g.map.dist(g.hexOf(e), h)));
      const order = [...stacks.entries()].sort((a, b) => distE(g.map.hexes[a[0]]) - distE(g.map.hexes[b[0]]));
      const [hid, us0] = order[0];
      let us = us0;
      const h0 = g.map.hexes[hid];
      // 19.4: chi è sul bordo dell'Ordine esce
      if (g.canExit(us[0])) { g.exitMap(us.filter(u => g.canExit(u)).map(u => u.uid)); yield { act: 'exit' }; continue; }
      // presidio: lascia un'unità negli insediamenti propri minacciati
      const threat = this.threatMap(g, fac);
      if (h0.feature && h0.owner === fac && distE(h0) <= 4) {
        const all = g.unitsAt(hid).filter(u => u.fac === fac);
        const stayers = all.filter(u => !g.canMove(u));
        if (stayers.filter(u => !g.isLeader(u)).length === 0 && us.length > 1) {
          const keep = us.filter(u => !g.isLeader(u)).sort((a, b) => g.D(b) - g.D(a))[0];
          if (keep) { keep.moved = true; us = us.filter(u => u !== keep); }
        } else if (us.length && h0.key) { for (const u of us) u.moved = true; continue; }
        if (!us.length) continue;
      }
      const objs = this.objectives(g, fac);
      const fly = us.every(u => g.canFly(u));
      const R = g.reachable(us, { fly });
      const cands = [hid, ...R.dests.keys()];
      const stackD = us.reduce((s, u) => s + g.D(u), 0), stackF = us.reduce((s, u) => s + g.F(u), 0);
      const ranged = us.every(u => g.has(u, 'Tiratore') || g.isCaster(u));
      const cav = us.some(u => g.has(u, 'Cavalleria') || g.has(u, 'Bestia'));
      const friendsNow = g.friends(fac).filter(u => !us.includes(u));
      const enemyStacks = new Map();
      for (const e of enemies) { const eh = g.hexOf(e); if (!enemyStacks.has(eh)) enemyStacks.set(eh, { D: 0, value: 0 }); const o = enemyStacks.get(eh); o.D += g.D(e); o.value += this.value(g, e); }
      let best = hid, bs = -Infinity;
      for (const id of cands) {
        const h = g.map.hexes[id];
        let s = 0;
        // obiettivi
        for (const o of objs) {
          const d = g.map.dist(h, o.h);
          if (o.kind === 'take') s += o.v * (attackerRole ? 1.3 : 1) * (0.6 + 0.4 * aggr) * (late ? 1.5 : 1) / (1 + d * 0.9) + (d === 0 && o.h.owner !== fac && !g.blockedAt(o.h.id, fac) ? o.v * 0.8 : 0);
          else if (o.kind === 'defend') { if (distE(o.h) <= 5) s += o.v * 0.9 / (1 + d * 1.2) + (d === 0 ? o.v * 0.4 : 0); }
          else s += o.v * aggr / (2 + d);
        }
        // avvicinamento al nemico se siamo più forti
        const de = distE(h);
        if (aggr > 1 || attackerRole) s += (aggr + (attackerRole ? 0.5 : 0)) * 6 / (1 + de);
        // sicurezza
        const def = (stackD + (g.unitsAt(id).filter(u => u.fac === fac && !us.includes(u)).reduce((a, u) => a + g.D(u), 0))) * (1 - (TERRAIN[h.terrain].melee || 0) * 0.25);
        const danger = threat[id] / Math.max(1, def);
        s -= Math.max(0, danger - (aggr > 1.2 ? 3 : 2.2)) * (ranged ? 5 : 2.2);
        if (ranged && de <= 1) s -= 5;
        if (ranged) { const inRange = enemies.some(e => g.map.dist(g.hexOf(e), h) <= Math.max(...us.map(u => g.P(u, h)))); if (inRange && de >= 2) s += 4; }
        // terreno e supporto
        s += -(TERRAIN[h.terrain].melee || 0) * 0.8;
        if (cav && (h.terrain === 'bosco' || h.terrain === 'palude')) s -= 2;
        const sup = friendsNow.filter(f => g.map.dist(g.hexOf(f), h) === 1).length;
        s += Math.min(3, sup) * 0.6;
        // possibilità d'attacco dal nuovo esagono
        if (!ranged) {
          // attrazione verso pile nemiche che possiamo battere (contando gli amici già vicini)
          for (const [eh, ed] of enemyStacks) {
            const d = g.map.dist(h, eh); if (d > 3) continue;
            const helpF = friendsNow.filter(f => g.map.dist(g.hexOf(f), eh) <= 1 && !g.has(f, 'Tiratore')).reduce((a, f) => a + g.F(f), 0);
            const ratio = (stackF + helpF) / Math.max(1, ed.D);
            if (ratio >= 1.5 - (attackerRole ? 0.3 : 0)) s += Math.min(6, ratio * 1.5 + ed.value / 10) * (0.7 + 0.3 * aggr) / (d === 1 ? 1 : d * 1.5);
          }
        }
        if (late && h.feature && h.owner !== fac) s += 6;
        // ordine fuori comando
        if (fac === 'O' && !us.some(u => g.isLeader(u)) && !g.friends('O').some(l => g.isLeader(l) && !us.includes(l) && g.map.dist(g.hexOf(l), h) <= 4)) s -= 1.5;
        if (id === hid) s += 0.3;
        if (s > bs) { bs = s; best = id; }
      }
      if (best === hid) { for (const u of us) u.moved = true; continue; }
      const r = g.move(us.map(u => u.uid), best, { fly });
      if (!r.ok) { for (const u of us) u.moved = true; continue; }
      if (g.pendingSack) this.decideSack(g);
      yield { act: 'move', path: r.path };
    }
  },
  decideSack(g) {
    const p = g.pendingSack; if (!p) return;
    const h = g.map.hexes[p.hex];
    if (p.fac === 'O') g.sack(p.hex, h.sacked ? 'none' : 'requisition');
    else g.sack(p.hex, h.sacked ? 'none' : (g.scn.id === '19.5' || g.scn.id === '20.7' ? 'normal' : 'violent'));
  },
  // ---------------- combattimento
  simulate(g, fn) {
    // valore atteso su tutti i tiri del dado
    const fac = g.active; const base = this.evaluate(g, fac); let ev = 0;
    for (let r = 1; r <= 6; r++) { const c = g.clone(); fn(c, r); ev += (this.evaluate(c, fac) - base) / 6; }
    return ev;
  },
  *combatPhase(g, fac) {
    const myStr = this.strength(g, fac), enStr = this.strength(g, OTHER[fac]);
    const aggr = Math.max(0.5, Math.min(1.5, myStr / Math.max(1, enStr)));
    const attackerRole = this.isAttacker(g, fac);
    // Furia
    for (const u of g.friends(fac)) if (g.canFury(u) && g.map.neighbors(g.hexOf(u)).some(n => g.enemyAt(n.id, fac))) { g.fury(u.uid); }
    // abilità degli Eroi
    for (const u of g.friends(fac)) for (const ab of g.heroAbilities(u)) {
      if (ab.id === 'sussurri') { const t = ab.targets.map(t => g.byUid(t.uid)).sort((a, b) => g.moraleValue(a) - g.moraleValue(b))[0]; if (t && !g.immuneMorale(t)) { g.useHeroAbility(u.uid, 'sussurri', { uid: t.uid }); yield { act: 'ability' }; } }
    }
    // magie
    for (const c of g.friends(fac).filter(u => g.isCaster(u))) {
      let tries = 0;
      while (g.canCast(c) && tries++ < 2) {
        const best = this.bestSpell(g, c);
        if (!best || best.score < 1.5) break;
        g.cast(c.uid, best.sp.name, best.t, { mode: best.mode });
        yield { act: 'spell', name: best.sp.name, hex: best.t.hex };
        if (g.winner) return;
      }
    }
    // tiri a distanza
    for (let k = 0; k < 20; k++) {
      const shooters = g.friends(fac).filter(u => g.canShoot(u));
      if (!shooters.length) break;
      const targets = new Set(); for (const s of shooters) for (const x of g.map.within(g.hexOf(s), g.P(s))) if (g.enemyAt(x.id, fac)) targets.add(x.id);
      let best = null;
      for (const t of targets) {
        const sh = g.rangedCandidates(t); if (!sh.length) continue;
        const ev = this.simulate(g, (c, r) => c.ranged(sh.map(u => u.uid), t, { roll: r }));
        // preferisci i bersagli che si attaccheranno in mischia
        const adjMelee = g.map.neighbors(g.map.hexes[t]).some(n => g.unitsAt(n.id).some(u => u.fac === fac && g.canAttack(u) && !g.has(u, 'Tiratore')));
        const sc = ev + (adjMelee ? 1 : 0);
        if (!best || sc > best.sc) best = { t, sh, sc };
      }
      if (!best || best.sc <= 0.2) break;
      g.ranged(best.sh.map(u => u.uid), best.t);
      yield { act: 'ranged', hex: best.t };
      if (g.winner) return;
    }
    // mischia
    for (let k = 0; k < 25; k++) {
      const atk = g.friends(fac).filter(u => g.canAttack(u));
      if (!atk.length) break;
      const targets = new Set(); for (const a of atk) for (const n of g.map.neighbors(g.hexOf(a))) if (g.canBeMeleed(n.id)) targets.add(n.id);
      let best = null;
      for (const t of targets) {
        let cand = g.meleeCandidates(t).filter(u => !(u.type === 'Guaritori'));
        // i tiratori deboli non partecipano se non servono
        const variants = [cand];
        const strong = cand.filter(u => !g.has(u, 'Tiratore') || g.F(u) >= 3);
        if (strong.length && strong.length < cand.length) variants.push(strong);
        const noRiver = cand.filter(u => { const e = g.map.edge(g.hexOf(u), g.map.hexes[t]); return !e || e.type !== 'fiume'; });
        if (noRiver.length && noRiver.length < cand.length) variants.push(noRiver);
        for (const v of variants) {
          if (!v.length) continue;
          const ev = this.simulate(g, (c, r) => { const o = c.melee(v.map(u => u.uid), t, { roll: r }); if (o.canAdvance && o.canAdvance.length) c.advance(o.canAdvance, t); });
          const h = g.map.hexes[t];
          let sc = ev + (h.feature && h.owner !== fac ? 3 : 0) * aggr;
          if (g.unitsAt(t).some(u => u.commander)) sc += 4;
          if (!best || sc > best.sc) best = { t, v, sc };
        }
      }
      const thr = Math.max(-1, Math.min(1, 0.4 - (aggr - 1) * 1.2 - (attackerRole ? 0.6 : 0) - (g.turn >= g.scn.turns - 2 ? 0.6 : 0)));
      if (!best || best.sc < thr) break;
      const out = g.melee(best.v.map(u => u.uid), best.t);
      yield { act: 'melee', hex: best.t };
      if (out.ok && out.canAdvance && out.canAdvance.length) {
        const h = g.map.hexes[best.t];
        const threat = this.threatMap(g, fac);
        const go = h.feature || (TERRAIN[h.terrain].melee || 0) < 0 || threat[h.id] < 8 || g.scn.coop;
        if (go) { g.advance(out.canAdvance, best.t); if (g.pendingSack) this.decideSack(g); yield { act: 'advance', hex: best.t }; }
      }
      if (g.winner) return;
    }
    g.toSpecialStep();
    yield { act: 'morale' };
    // azioni speciali
    for (const u of g.friends(fac)) {
      const opts = g.specialOptions(u); if (!opts.length) continue;
      const pick = opts.find(o => o.id === 'awaken') || opts.find(o => o.id === 'explore') || opts.find(o => o.id === 'cleanse') || opts.find(o => o.id === 'breach')
        || opts.filter(o => o.id === 'purify' || o.id === 'corrupt').sort((a, b) => this.hexStateValue(g, b.hex, fac) - this.hexStateValue(g, a.hex, fac))[0];
      if (pick) { g.doSpecial(u.uid, pick.id, pick.hex, { uid: pick.uid }); yield { act: 'special', hex: pick.hex }; }
    }
  },
  hexStateValue(g, hid, fac) {
    const h = g.map.hexes[hid]; let v = 1;
    if (h.feature) v += 4; if (h.key) v += 6;
    if (fac === 'O' && h.state === 'corrotto') v += 2;
    if (g.unitsAt(hid).some(u => u.fac === fac)) v += 1;
    return v;
  },
  bestSpell(g, c) {
    let best = null;
    const fac = c.fac;
    for (const { sp, cost, ok } of g.spellsFor(c)) {
      if (!ok) continue;
      for (const t of g.spellTargets(c, sp)) {
        let s = 0, mode;
        const us = g.unitsAt(t.hex), tu = t.uid !== undefined ? g.byUid(t.uid) : null;
        const enemies = us.filter(u => u.fac !== fac), friends = us.filter(u => u.fac === fac);
        const pSucc = fac === 'O' ? 0.83 : 0.66;
        const killV = (u, d) => (g.curR(u) <= d ? this.value(g, u) : this.value(g, u) * d / g.maxR(u) * 0.8);
        switch (sp.name) {
          case 'Colonna di Fuoco': { const one = Math.max(0, ...enemies.map(u => killV(u, 3))); const all = enemies.reduce((a, u) => a + killV(u, 1), 0); s = Math.max(one, all); mode = one >= all ? 'unit' : 'hex'; break; }
          case 'Purga del Caos': s = killV(tu, 3); break;
          case 'Frattura della Realtà': s = killV(tu, 4); break;
          case 'Tentacoli della Corruzione': s = killV(tu, 2) + 1; break;
          case 'Vampata Mutante': case 'Pioggia di Cenere Nera': s = enemies.reduce((a, u) => a + killV(u, 1), 0) - friends.reduce((a, u) => a + killV(u, 1), 0); break;
          case 'Luce Guaritrice': s = Math.min(2, tu.dmg) * this.value(g, tu) / g.maxR(tu) * 0.8; break;
          case 'Barriera di Luce': case 'Aura di Disciplina': { const thr = this.threatMap(g, fac)[t.hex]; s = thr > 6 ? friends.length * 2 + 1 : 0; if (sp.name === 'Aura di Disciplina') s = g.friends(fac).filter(u => g.map.dist(g.hexOf(u), g.map.hexes[t.hex]) <= 1 && g.map.neighbors(g.hexOf(u)).some(n => g.enemyAt(n.id, fac))).length * 2; break; }
          case 'Sigillo di Immobilità': s = g.F(tu) >= 5 || tu.commander ? 4 : 1; break;
          case 'Giuramento di Ferro': s = g.isLeader(tu) || g.U(tu).cost >= 8 ? (g.map.neighbors(g.hexOf(tu)).some(n => g.enemyAt(n.id, fac)) ? 3 : 0.5) : 0; break;
          case 'Scudo di Fede': s = g.map.neighbors(g.hexOf(tu)).some(n => g.enemyAt(n.id, fac)) ? this.value(g, tu) / 8 : 0; break;
          case 'Purificazione del Terreno': { const h = g.map.hexes[t.hex]; s = h.state === 'corrotto' ? (h.feature ? 5 : 2) : (h.feature && h.owner === 'O' ? 1.6 : 0); break; }
          case "Chiamata all'Ordine": s = g.friends(fac).filter(u => g.st(u, 'disgregato') && g.map.dist(g.hexOf(u), g.hexOf(c)) <= 3).length * 2.5; break;
          case 'Sussurro della Fenditura': s = g.immuneMorale(tu) ? 0 : this.value(g, tu) * 0.12 * (7 - g.moraleValue(tu, -1)) / 6; break;
          case 'Urlo del Vuoto': s = g.map.neighbors(g.hexOf(c)).flatMap(n => g.unitsAt(n.id)).filter(u => u.fac !== fac && !g.immuneMorale(u)).length * 1.5; break;
          case 'Piaga Strisciante': { const h = g.map.hexes[t.hex]; s = enemies.length * 2 + (h.feature && h.owner !== fac ? 2 : 0) + (h.key ? 4 : 0) - friends.length * 2; break; }
          case 'Furia Bestiale': s = g.map.neighbors(g.hexOf(tu)).some(n => g.enemyAt(n.id, fac)) ? g.F(tu) * 0.5 : 0; break;
          case 'Dono Mutante': s = g.U(tu).cost >= 6 && tu.mutF < 2 ? 1.6 : 0; break;
          case 'Risveglio Demoniaco': { const h = g.map.hexes[t.hex]; s = g.map.neighbors(h).some(n => g.enemyAt(n.id, fac)) ? 5 : 2; break; }
        }
        s = s * pSucc - cost * 0.25;
        if (!best || s > best.score) best = { sp, t, score: s, mode };
      }
    }
    return best;
  },
};

// ------------------------------------------------------------
//  Caos automatico (20.2) per gli scenari cooperativi
// ------------------------------------------------------------
const AUTO_CHAOS = {
  target(g, h) {
    if (g.scn.id === '20.4') return g.map.byName('Torre del Faro');
    const sets = g.map.hexes.filter(x => TERRAIN[x.terrain].settlement && x.owner !== 'C');
    if (sets.length) return sets.sort((a, b) => g.map.dist(a, h) - g.map.dist(b, h))[0];
    const heroes = g.friends('O').filter(u => g.isLeader(u));
    if (heroes.length) return g.hexOf(heroes.sort((a, b) => g.map.dist(g.hexOf(a), h) - g.map.dist(g.hexOf(b), h))[0]);
    return null;
  },
  *turn(g) {
    g.nextPhase(); // niente reclutamento: la Generazione avviene in Manutenzione
    yield { phase: 'move' };
    const O = () => g.friends('O');
    const dO = h => Math.min(99, ...O().map(u => g.map.dist(g.hexOf(u), h)));
    let guard = 0;
    for (;;) {
      if (guard++ > 80) break;
      const stacks = new Map();
      for (const u of g.friends('C')) if (g.canMove(u)) { if (!stacks.has(u.hex)) stacks.set(u.hex, []); stacks.get(u.hex).push(u); }
      if (!stacks.size) break;
      const [hid, us] = [...stacks.entries()].sort((a, b) => dO(g.map.hexes[a[0]]) - dO(g.map.hexes[b[0]]))[0];
      const h = g.map.hexes[hid];
      if (dO(h) <= 1) { for (const u of us) u.moved = true; continue; }
      const T = this.target(g, h); if (!T) { for (const u of us) u.moved = true; continue; }
      const R = g.reachable(us, {});
      let best = null, bd = g.map.dist(h, T) * 10;
      for (const [id, cost] of R.dests) { const d = g.map.dist(g.map.hexes[id], T) * 10 + cost * 0.1; if (d < bd) { bd = d; best = id; } }
      if (best === null) { for (const u of us) u.moved = true; continue; }
      const r = g.move(us.map(u => u.uid), best);
      if (!r.ok) { for (const u of us) u.moved = true; continue; }
      if (g.pendingSack) g.sack(g.pendingSack.hex, 'violent');
      yield { act: 'move', path: r.path };
    }
    g.nextPhase();
    yield { phase: 'combat' };
    for (const u of g.friends('C')) if (g.canFury(u)) g.fury(u.uid);
    // magie
    for (const c of g.friends('C').filter(u => g.isCaster(u))) {
      if (!g.canCast(c)) continue;
      const dmg = g.spellsFor(c).filter(x => x.ok && x.sp.dmg).sort((a, b) => b.cost - a.cost);
      let done = false;
      for (const x of dmg) {
        const ts = g.spellTargets(c, x.sp); if (!ts.length) continue;
        const byHex = {}; for (const t of ts) byHex[t.hex] = t;
        const t = Object.values(byHex).sort((a, b) => g.unitsAt(b.hex).filter(u => u.fac === 'O').length - g.unitsAt(a.hex).filter(u => u.fac === 'O').length)[0];
        g.cast(c.uid, x.sp.name, t, { mode: 'hex' }); done = true; yield { act: 'spell', hex: t.hex }; break;
      }
      if (!done) { const sp = g.spellsFor(c).find(x => x.ok && x.sp.name === 'Sussurro della Fenditura'); if (sp) { const ts = g.spellTargets(c, sp.sp).sort((a, b) => g.map.dist(g.map.hexes[a.hex], g.hexOf(c)) - g.map.dist(g.map.hexes[b.hex], g.hexOf(c))); if (ts.length) { g.cast(c.uid, sp.sp.name, ts[0]); yield { act: 'spell', hex: ts[0].hex }; } } }
    }
    const ftD = hid => g.unitsAt(hid).reduce((s, u) => s + g.D(u), 0);
    // tiri
    for (const s of g.friends('C').filter(u => g.canShoot(u))) {
      if (!g.canShoot(s)) continue;
      const ts = g.map.within(g.hexOf(s), g.P(s)).filter(x => g.enemyAt(x.id, 'C') && g.lineOfSight(g.hexOf(s), x, [s])).sort((a, b) => ftD(a.id) - ftD(b.id));
      if (ts.length) { g.ranged([s.uid], ts[0].id); yield { act: 'ranged', hex: ts[0].id }; }
    }
    // mischia: tutti gli adiacenti a uno stesso esagono attaccano insieme, verso il FT più basso
    for (let k = 0; k < 30; k++) {
      const atk = g.friends('C').filter(u => g.canAttack(u)); if (!atk.length) break;
      const choice = new Map();
      for (const a of atk) { const ts = g.map.neighbors(g.hexOf(a)).filter(n => g.canBeMeleed(n.id)).sort((x, y) => ftD(x.id) - ftD(y.id)); if (ts.length) { if (!choice.has(ts[0].id)) choice.set(ts[0].id, []); choice.get(ts[0].id).push(a); } }
      if (!choice.size) break;
      const [t, us] = [...choice.entries()][0];
      const out = g.melee(us.map(u => u.uid), t);
      yield { act: 'melee', hex: t };
      if (out.ok && out.canAdvance && out.canAdvance.length) { g.advance(out.canAdvance, t); if (g.pendingSack) g.sack(g.pendingSack.hex, 'violent'); }
      if (g.winner) return;
    }
    g.toSpecialStep();
    for (const u of g.friends('C')) { const o = g.specialOptions(u).find(o => o.id === 'corrupt'); if (o) g.doSpecial(u.uid, o.id, o.hex); }
    g.nextPhase();
  },
};
