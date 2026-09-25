/* Shared game rules remain unchanged: AI pays the same building and unit costs. */
unitSpecs.mercenary.name='Lázadó felderítő';
unitSpecs.mercenary.art='assets/rebel-scout-v1.png';
unitSpecs.mercenaryCarrier.name='Lázadó személyszállító';
unitSpecs.mercenaryCarrier.art='assets/rebel-carrier-v1.png';

Object.assign(difficulties.practice,{text:'Gyakorlás: gyárt és védi a várost, nem indít támadást.',tempo:0,army:1});
Object.assign(difficulties.easy,{text:'Termel, erősít és óvatosan terjeszkedik.',tempo:1,army:1});
Object.assign(difficulties.medium,{text:'Aktívan gyárt, több irányban foglal és folyamatosan erősít.',tempo:3,army:1});
Object.assign(difficulties.hard,{text:'Agresszív hadigazdaság, állandó erősítés és könyörtelen többfrontos nyomás.',tempo:5,army:1.18});

aiEconomy=function(){
  const level=state.difficulty,side=enemyOf(state.faction),infantry=side==='human'?'infantry':'alien';
  const carrier=side==='human'?'apc':'hover',heavy=side==='human'?'tank':'alienTank',air=side==='human'?'heli':'alienAir';
  const base=state.aiBase;

  /* V31: ugyanaz a kétlépcsős időzítés, mint a játékosnál.
     A korábbi körben elkészült egység most telepíthető.
     Az ebben a körben elkészülő egység csak a következő AI-körben települhet. */
  Object.entries(base.ready).forEach(([type,count])=>{
    for(let n=0;n<count;n++){reinforceEnemy(type);base.ready[type]--}
  });
  advanceAiQueue();

  Object.keys(state.aiResources).forEach(key=>state.aiResources[key]+=enemyResourceIncome(key));
  const buildingOrder=['barracks'];
  if((level==='hard'&&state.turn>=3)||(level==='medium'&&state.turn>=4)||(level==='easy'&&state.turn>=8))buildingOrder.push('vehicleFactory');
  if((level==='hard'&&state.turn>=5)||(level==='medium'&&state.turn>=7))buildingOrder.push('hangar');
  if(level==='hard'&&state.turn>=8)buildingOrder.push('researchCenter','depot');
  const construction=buildingOrder.find(key=>!base.buildings[key]&&aiCanAfford(buildings[key].cost));
  if(construction)aiBuild(construction);

  const owned=state.grid.filter(sector=>sector.unit?.side===side),strength=owned.reduce((sum,sector)=>sum+sector.unit.count,0);
  const queued=base.queue.length+Object.values(base.ready).reduce((sum,count)=>sum+count,0);
  const slots={practice:1,easy:1,medium:3,hard:5}[level]||1;
  const priorities=strength<2600?[infantry,infantry,carrier]:level==='practice'?[infantry]:
    level==='easy'?[infantry,carrier,infantry]:[infantry,carrier,heavy,infantry,air];
  for(let slot=0;slot<slots&&queued+slot<slots+2;slot++){
    const first=priorities[(state.turn+slot)%priorities.length];
    const options=[first,infantry,carrier,heavy,air];
    const type=options.find(candidate=>base.buildings[unitSpecs[candidate].building]&&aiCanAfford(unitSpecs[candidate].cost));
    if(!type||!aiQueue(type))break;
  }
  /* Az újonnan elkészült egységek itt már NEM települnek:
     a következő kör elején kerülnek ki a frontra. */
};

/* Distance across friendly sectors keeps newly trained units moving toward the front. */
function aiFrontDistances(side){
  const distance=new Map(),queue=[];
  for(const sector of state.grid){
    if(sector.owner!==side||!neighbors(sector).some(next=>next.owner!==side))continue;
    distance.set(sector.id,0);queue.push(sector);
  }
  for(let i=0;i<queue.length;i++){
    const current=queue[i];for(const next of neighbors(current)){
      if(next.owner!==side||distance.has(next.id))continue;
      distance.set(next.id,distance.get(current.id)+1);queue.push(next);
    }
  }
  return distance;
}

aiTurn=async function(){
  const side=enemyOf(state.faction),level=state.difficulty,profile=difficulties[level];state.aiInProgress=true;
  const buildable=state.grid.filter(sector=>sector.owner===side&&!sector.bunker&&(!sector.productive||sector.resource==='food')&&neighbors(sector).some(next=>next.owner!==side));
  const bunkerLimit=level==='practice'?0:level==='easy'?1:level==='medium'?2:3;
  if(state.turn>=3&&state.grid.filter(sector=>sector.owner===side&&sector.bunker&&!sector.isBase).length<bunkerLimit&&buildable.length){
    const target=buildable.sort((a,b)=>(b.unit?.count||0)-(a.unit?.count||0))[0];
    if(aiPay(sectorBuilds.bunker.cost)){target.bunker=true;addLog(`Ellenség bunkert épített: ${target.name}.`)}
  }
  if(profile.tempo===0){state.aiInProgress=false;renderBattle();return}
  const usedSources=new Set(),usedTargets=new Set();
  for(let step=0;step<profile.tempo;step++){
    const distances=aiFrontDistances(side),risk=level==='hard'?.88:level==='medium'?1.05:1.35;
    const share=level==='hard'?.96:level==='medium'?.9:.8;
    const choices=[];
    for(const from of state.grid){
      if(from.unit?.side!==side||hasMoved(from.unit)||usedSources.has(from.id)||from.unit.count<=1)continue;
      const available=neighbors(from);
      for(const target of available){
        if(usedTargets.has(target.id))continue;
        if(target.owner===side){
          if(target.unit?.side&&target.unit.side!==side)continue;
          if((distances.get(target.id)??Infinity)>=(distances.get(from.id)??Infinity))continue;
          const reinforcements=target.unit?.count||0;
          choices.push({from,target,score:reinforcements<600?18:6,share:1,friendly:true});
          continue;
        }
        const proposed=combatPower(from.unit,side)*share;
        const defense=combatPower(target.unit,target.unit?.side,true);
        if(target.unit&&proposed<defense*risk)continue;
        const value={metal:19,oil:19,food:17,energy:17,tech:20,terrain:9}[target.resource]||9;
        const spread=neighbors(target).filter(s=>s.owner===side).length;
        const opponent=target.owner===state.faction?4:0;
        choices.push({from,target,score:value+spread*2+opponent+(target.unit?Math.min(6,proposed/Math.max(1,defense)):8),share,friendly:false});
      }
    }
    choices.sort((a,b)=>b.score-a.score);
    const action=choices[0];if(!action)break;
    const {from,target}=action;usedSources.add(from.id);usedTargets.add(target.id);
    state.aiActive=from.id;state.aiTarget=target.id;renderBattle();await pause(420);
    if(!from.unit){state.aiActive=null;state.aiTarget=null;continue}
    const detachment=takeDetachment(from.unit,action.share);
    if(!from.unit.count)from.unit=null;
    if(action.friendly){
      playMoveSound(detachment);flashMove(from,target,side,'advance');await pause(400);
      mergeDetachment(target,detachment);target.unit.movedTurn=state.turn;
      addLog(`Ellenséges alakulat előrenyomul: ${target.name}.`);
    }else if(target.unit){
      await resolveDetachedConflict(from,target,detachment,1);
    }else{
      playMoveSound(detachment);flashMove(from,target,side,'advance');await pause(450);
      target.owner=side;target.unit=detachment;addLog(`Ellenség biztosította: ${target.name}.`);
    }
    state.aiActive=null;state.aiTarget=null;renderBattle();await pause(160);
  }
  state.aiInProgress=false;renderBattle();
};
