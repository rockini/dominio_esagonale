// Partite complete IA contro IA su tutti gli scenari: cerca eccezioni e stati incoerenti.
const fs=require('fs');const S=require('path').join(__dirname,'..','src')+'/';
const files=['units.js','core.js','map.js','mapgen.js','scenarios.js','armies.js','engine/scn_rules.js','engine/state.js','engine/move.js','engine/combat.js','engine/magic.js','engine/turn.js','engine/setup.js','ai/ai.js'];
const code=files.map(f=>fs.readFileSync(S+f,'utf8')).join('\n');
const only=process.argv[2]; const seeds=+(process.argv[3]||3);
eval(code+`
let errs=0; const wins={};
for(const scn of SCENARIOS){
  if(only&&scn.id!==only)continue;
  for(let seed=1;seed<=seeds;seed++){
    const t0=Date.now(); let g, acts=0;
    try{
      g=newGame(scn.id,seed*7919,null);
      g.start();
      let guard=0;
      while(!g.winner&&guard++<200){
        const fac=g.active, pti=g.pti;
        for(const a of AI.turn(g,fac)){acts++; if(acts>20000)throw new Error('troppe azioni');}
        if(g.pti===pti&&!g.winner)throw new Error('turno bloccato fase '+g.phase);
        // coerenza
        for(const u of g.units){ if(g.alive(u)&&g.curR(u)<=0)throw new Error('unità viva con R<=0 '+u.type); }
        const st=new Map();for(const u of g.units)if(g.alive(u)){const k=u.hex;if(!st.has(k))st.set(k,new Set());st.get(k).add(u.fac);}
        for(const [k,f] of st)if(f.size>1)throw new Error('pila mista in '+k+' '+[...f]);
      }
      if(!g.winner)throw new Error('partita senza fine');
      wins[scn.id]=(wins[scn.id]||'')+g.winner;
      console.log(scn.id.padEnd(5),seed,'vince',g.winner,'turno',g.turn,'azioni',acts,'ms',Date.now()-t0,'|',g.result);
    }catch(e){errs++;console.log('ERR',scn.id,seed,'turno',g&&g.turn,g&&g.phase,e.stack.split('\\n').slice(0,4).join(' | '));}
  }
}
console.log('vittorie',JSON.stringify(wins));
console.log('errori',errs);
`);
