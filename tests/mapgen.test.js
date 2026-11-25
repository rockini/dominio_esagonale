const fs=require('fs');const S=require('path').join(__dirname,'..','src')+'/';
const code=['units.js','core.js','map.js','mapgen.js','scenarios.js','armies.js'].map(f=>fs.readFileSync(S+f,'utf8')).join('\n');
eval(code+`
let errs=0;
for(const scn of SCENARIOS){
  const stats={res:0,feat:0,rivers:0,roads:0,ms:0,bridges:0,fords:0,crests:0,dep:{O:0,C:0},cost:{O:0,C:0}};
  for(let seed=1;seed<=15;seed++){
    try{
      const t=Date.now();UID=1;
      const ctx=generateMap(scn,seed*7919);
      const {A,notes}=makeArmies(scn,new RNG(seed+99));
      const d=deployAll(ctx,A);
      stats.ms+=Date.now()-t;
      const m=ctx.map;
      stats.res+=d.units.filter(u=>u.reserve&&!u.arrives).length;
      stats.feat+=m.features().length;stats.rivers+=m.rivers.length;stats.roads+=m.roads.length;
      for(const e of m.edges.values()){if(e.type==='ponte')stats.bridges++;if(e.type==='guado')stats.fords++;if(e.type==='cresta')stats.crests++;}
      for(const f of ['O','C']){stats.dep[f]+=d.units.filter(u=>u.fac===f&&u.hex!==null).length;stats.cost[f]+=armyCost(A[f]);}
      // verifica impilamento
      const g=new Map();for(const u of d.units)if(u.hex!==null){if(!g.has(u.hex))g.set(u.hex,[]);g.get(u.hex).push(u);}
      for(const [id,us] of g){const l=stackLoad(us);if(l.p>4||l.l>2){console.log('STACK',scn.id,seed,l);errs++;}
        if(new Set(us.map(u=>u.fac)).size>1){console.log('MIXED',scn.id,seed);errs++;}
        const h=m.hexes[id];for(const u of us)if(!canStand(m,h,u.type)){console.log('BADTERR',scn.id,u.type,h.terrain);errs++;}}
      // ogni luogo raggiungibile (no laghi) dal centro
      const start=m.hexes.find(h=>h.terrain!=='lago');const seen=new Set([start.id]);const st=[start];
      while(st.length){const x=st.pop();for(const n of m.neighbors(x))if(n.terrain!=='lago'&&!seen.has(n.id)){seen.add(n.id);st.push(n);}}
      const unreach=m.hexes.filter(h=>h.terrain!=='lago'&&!seen.has(h.id)).length; if(unreach){console.log('UNREACH',scn.id,seed,unreach);}
      if(scn.id==='19.1'){const crossings=[...m.edges.values()].filter(e=>e.type==='ponte').length;if(crossings)console.log('19.1 bridges!',crossings);}
    }catch(e){console.log('ERR',scn.id,seed,e.stack.split('\\n').slice(0,3).join(' | '));errs++;}
  }
  const n=15;console.log(scn.id.padEnd(6),'feat',(stats.feat/n).toFixed(1),'riv',(stats.rivers/n).toFixed(1),'roads',(stats.roads/n).toFixed(1),'ponti',(stats.bridges/n).toFixed(1),'guadi',(stats.fords/n).toFixed(1),'creste',(stats.crests/n).toFixed(1),'dep',(stats.dep.O/n).toFixed(1),(stats.dep.C/n).toFixed(1),'cost',(stats.cost.O/n).toFixed(0),(stats.cost.C/n).toFixed(0),'riserva',stats.res,'ms',(stats.ms/n).toFixed(0));
}
console.log('errori',errs);
`);
