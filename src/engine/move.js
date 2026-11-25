// ============================================================
//  MOTORE: movimento (cap. 6 e 8)
// ============================================================
Object.assign(Game.prototype, {
  // Esagoni in Zona di Controllo dei nemici di fac
  zoc(fac) {
    const set = new Set();
    for (const u of this.units) {
      if (!this.alive(u) || u.fac === fac || u.fac === 'N' || this.st(u, 'dormiente')) continue;
      const h = this.hexOf(u);
      for (let i = 0; i < 6; i++) {
        const n = this.map.nb(h, i); if (!n) continue;
        const e = this.map.edge(h, n);
        if (e && e.type === 'fiume') continue;        // la ZdC non attraversa i fiumi
        set.add(n.id);
      }
    }
    return set;
  },
  terrainCost(u, t) {
    const T = TERRAIN[t];
    if (t === 'lago') return this.has(u, 'Anfibia') ? 2 : Infinity;
    if (t === 'montagna') { if (this.has(u, 'Cavalleria') || this.has(u, 'Bestia')) return Infinity; return this.has(u, 'Nanica') ? 2 : 3; }
    if (t === 'collina') return u.type === 'Lyria' ? 1 : this.has(u, 'Pesante') ? 3 : 2;
    if (t === 'bosco') return this.has(u, 'Elfica') ? 1 : this.has(u, 'Pesante') ? 3 : 2;
    if (t === 'palude') return this.has(u, 'Anfibia') ? 1 : this.has(u, 'Pesante') ? 4 : 3;
    return T.cost;
  },
  canEnterTerrain(u, h) { return isFinite(this.terrainCost(u, h.terrain)); },
  sideCost(u, a, b) {
    const e = this.map.edge(a, b); if (!e) return 0;
    switch (e.type) {
      case 'fiume': return this.has(u, 'Anfibia') ? 0 : this.has(u, 'Pesante') ? Infinity : 2;
      case 'guado': return 1;
      case 'ponte': return 0;
      case 'cresta': return e.high === b.id ? 1 : 0;
      case 'mura': return 1;
      case 'barriera': return e.fac === u.fac ? Infinity : 0;
    }
    return 0;
  },
  canFly(u) { return this.has(u, 'Volante') || u.type === 'Spettri'; },
  groupMP(us, forced) {
    let mp = Math.min(...us.map(u => this.V(u)));
    if (forced) mp += 2;
    if (us.every(u => u.elixir)) mp = Math.min(...us.map(u => this.V(u) + 3));
    return mp;
  },
  // Raggiungibilità per un gruppo di unità della stessa pila
  reachable(us, opt = {}) {
    const fac = us[0].fac, start = this.hexOf(us[0]);
    const fly = !!opt.fly && us.every(u => this.canFly(u));
    const elixir = us.every(u => u.elixir);
    const mp = opt.mp ?? this.groupMP(us, opt.forced);
    const zoc = fly ? new Set() : this.zoc(fac);
    const leggera = us.every(u => this.has(u, 'Leggera'));
    const dist = new Map([[start.id, 0]]), prev = new Map();
    const pq = new PQ(); pq.push(start, 0);
    while (pq.size) {
      const a = pq.pop(); const da = dist.get(a.id);
      if (da > mp) continue;
      for (let i = 0; i < 6; i++) {
        const b = this.map.nb(a, i); if (!b) continue;
        const enemy = this.blockedAt(b.id, fac);
        let c;
        if (fly) {
          const e = this.map.edge(a, b);
          if (e && e.type === 'barriera' && e.fac === fac) continue;
          c = 1;
        } else {
          if (enemy) continue;
          const road = this.map.roadLinks.has(edgeKey(a.id, b.id));
          c = 0;
          if (elixir) c = 1;
          else if (road) c = 0.5;
          else for (const u of us) c = Math.max(c, this.terrainCost(u, b.terrain) + this.sideCost(u, a, b));
          if (road || elixir) for (const u of us) { if (!this.canEnterTerrain(u, b)) c = Infinity; const e = this.map.edge(a, b); if (e && e.type === 'barriera' && e.fac === fac) c = Infinity; }
          if (!isFinite(c)) continue;
          if (zoc.has(b.id)) c += 1;
          if (zoc.has(a.id) && !leggera) c += 1;
        }
        const nd = da + c;
        if (nd <= mp + 1e-9 && nd < (dist.get(b.id) ?? Infinity)) { dist.set(b.id, nd); prev.set(b.id, a.id); pq.push(b, nd); }
      }
    }
    // destinazioni valide
    const dests = new Map();
    for (const [id, d] of dist) {
      if (id === start.id) continue;
      const h = this.map.hexes[id];
      if (this.blockedAt(id, fac)) continue;
      if (!us.every(u => this.canEnterTerrain(u, h))) continue;
      if (!this.canStack(id, us)) continue;
      dests.set(id, d);
    }
    // movimento minimo
    if (!opt.forced && !fly && us.every(u => !u.moved) && !us.some(u => u.effects.some(e => e.k === 'immobile'))) {
      for (const b of this.map.neighbors(start)) {
        if (dests.has(b.id) || this.blockedAt(b.id, fac)) continue;
        if (!us.every(u => this.canEnterTerrain(u, b) && isFinite(this.sideCost(u, start, b)))) continue;
        if (!this.canStack(b.id, us)) continue;
        dests.set(b.id, mp); prev.set(b.id, start.id); dist.set(b.id, mp); (opt.minimal = opt.minimal || new Set()).add(b.id);
      }
    }
    return { dests, prev, dist, mp, fly, minimal: opt.minimal || new Set() };
  },
  pathTo(R, dest) { const p = [dest]; let k = dest; while (R.prev.has(k)) { k = R.prev.get(k); p.push(k); } return p.reverse(); },
  canMove(u) { return this.alive(u) && u.fac === this.active && this.phase === 'move' && !u.moved && this.V(u) > 0 && !this.st(u, 'dormiente'); },
  canForce(us) { return us.every(u => !this.st(u, 'disgregato') && !this.st(u, 'esausto') && !this.outOfCommand(u)); },
  move(uids, dest, opt = {}) {
    const us = uids.map(id => this.byUid(id));
    if (!us.length || !us.every(u => this.canMove(u)) || new Set(us.map(u => u.hex)).size !== 1) return { ok: false, why: 'Queste unità non possono muovere.' };
    if (opt.forced && !this.canForce(us)) return { ok: false, why: 'Marcia Forzata non consentita.' };
    const R = this.reachable(us, opt);
    if (!R.dests.has(dest)) return { ok: false, why: 'Destinazione non raggiungibile.' };
    const path = this.pathTo(R, dest);
    const cost = R.dests.get(dest);
    for (const u of us) { u.hex = dest; u.moved = true; u.mpUsed = cost; u.flew = R.fly; u.forced = !!opt.forced; u.elixir = false; }
    this.ev({ type: 'move', uids, path, fac: us[0].fac });
    const name = us.length === 1 ? this.U(us[0]).name.split(',')[0] : `${us.length} unità`;
    this.say(`${name} ${us.length === 1 ? 'muove' : 'muovono'} verso ${this.hexLabel(dest)} (${fmtPM(cost)} PM)${opt.forced ? ' in Marcia Forzata' : ''}${R.fly ? ' in volo' : ''}.`);
    const out = { ok: true, path, captured: [] };
    // Marcia forzata
    if (opt.forced) for (const u of us) {
      const r = this.rng.d6() + (u.grade === 'E' ? 1 : 0);
      if (r < 3) { if (this.st(u, 'stanco')) { this.delStatus(u, 'stanco'); this.addStatus(u, 'esausto'); } else this.addStatus(u, 'stanco'); this.say(`${this.U(u).name.split(',')[0]} affatica la marcia (${r}).`, 'bad'); }
    }
    this.afterArrive(us, dest, out, { fromMove: true });
    return out;
  },
  // Effetti dell'arrivo in un esagono (movimento, ritirata, avanzata)
  afterArrive(us, hid, out = { captured: [] }, opt = {}) {
    const h = this.map.hexes[hid];
    const fac = us[0].fac;
    if (opt.fromMove && h.terrain === 'deserto') for (const u of us) {
      if (u.flew || this.has(u, 'Demone') || this.has(u, 'Volante')) continue;
      const r = this.rng.d6(); if (r < 3) { this.addStatus(u, 'stanco'); this.say(`${this.U(u).name.split(',')[0]} soffre il deserto (${r}): Stanco.`, 'bad'); }
    }
    if (opt.fromMove) for (const u of us) if (u.type === 'Demone Maggiore' && h.state !== 'corrotto') { h.state = 'corrotto'; this.ev({ type: 'hexstate', hex: hid }); }
    // controllo
    if (h.feature && h.owner !== fac && h.feature.type !== 'testa' || (h.feature && h.feature.type === 'testa' && h.owner !== fac)) {
      const prevOwner = h.owner;
      h.owner = fac; h.everOwned[fac] = true;
      if (h.feature) h.feature.owner = fac;
      this.ev({ type: 'capture', hex: hid, fac });
      this.say(`${FACTION_NAME[fac]} prende il controllo di ${h.feature.name}.`, 'good');
      out.captured.push(hid);
      if (TERRAIN[h.terrain].settlement) h.siege = 0;
      if (TERRAIN[h.terrain].settlement && prevOwner !== fac) this.pendingSack = { hex: hid, fac };
      // luoghi sacri: bottino la prima volta
      const sacred = (fac === 'O' && h.terrain === 'tempio') || (fac === 'C' && (h.terrain === 'altare' || h.terrain === 'fenditura'));
      if (sacred && !this.flags.takenPlace[hid + fac]) { this.flags.takenPlace[hid + fac] = true; this.sacredLoot(us, fac); }
    }
    const r = SCN_RULES[this.scn.id]; if (r && r.arrive) r.arrive(this, us, h);
  },
  // Saccheggio (14.7): mode = 'none' | 'normal' | 'violent' (Caos) | 'requisition' (Ordine)
  sack(hid, mode) {
    const h = this.map.hexes[hid]; this.pendingSack = null;
    if (mode === 'none' || !mode) return null;
    const fac = h.owner, us = this.unitsAt(hid).filter(u => u.fac === fac);
    let mod = 0;
    if (['cittamag', 'castellomag', 'capitale'].includes(h.terrain)) mod++;
    if (us.some(u => this.isLeader(u))) mod++;
    if (us.some(u => this.ab(u, 'Esploratore'))) mod++;
    if (h.sacked > 0) mod -= 2;
    if (mode === 'violent') mod++; if (mode === 'requisition') mod--;
    const roll = this.rng.d6(); const r = Math.max(1, Math.min(6, roll + mod));
    const castle = TERRAIN[h.terrain].castle;
    const res = (castle ? LOOT.castle : LOOT.city)[r - 1];
    this.gold[fac] += res.gold;
    const items = this.lootItems(res, fac, us);
    this.say(`Saccheggio di ${h.feature.name}: ${roll}${mod ? (mod > 0 ? '+' : '') + mod : ''} → ${res.gold} Oro${items.length ? ', ' + items.join(', ') : ''}.`, 'good');
    this.ev({ type: 'loot', hex: hid, gold: res.gold, items });
    if (mode !== 'requisition') h.sacked = 2;
    if (mode === 'violent') this.tryCorruptSettlement(h);
    return { roll, gold: res.gold, items };
  },
  // 19.4: le unità del Caos sul bordo dell'Ordine possono uscire
  canExit(u) {
    if (this.scn.id !== '19.4' || u.fac !== 'C' || !this.alive(u) || this.active !== 'C' || this.phase !== 'move') return false;
    const h = this.hexOf(u); if (h.c !== 0) return false;
    const left = this.V(u) + (u.forced ? 2 : 0) - (u.mpUsed || 0);
    return !u.moved || left >= 1;
  },
  exitMap(uids) {
    let n = 0;
    for (const id of uids) { const u = this.byUid(id); if (!this.canExit(u)) continue; this.ev({ type: 'exit', uid: id, hex: u.hex }); u.exited = true; u.hex = null; n++; const w = (this.isLeader(u) || this.has(u, 'Grande')) ? 2 : 1; this.flags.passed += w; this.say(`${this.U(u).name.split(',')[0]} supera il passo (+${w}).`, 'good'); }
    return n;
  },
});
function fmtPM(x) { return Number.isInteger(x) ? String(x) : (Math.floor(x) ? Math.floor(x) : '') + '½'; }
