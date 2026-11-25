// ============================================================
//  Creazione di una partita completa da uno scenario
// ============================================================
function newGame(scnId, seed, human) {
  const scn = SCENARIOS.find(s => s.id === scnId);
  UID = 1;
  const ctx = generateMap(scn, seed);
  const { A, notes } = makeArmies(scn, new RNG(seed + 99));
  const dep = deployAll(ctx, A);
  const g = new Game({ scn, seed, map: ctx.map, units: dep.units, human });
  g.dep = dep; g.armyNotes = notes;
  return g;
}
