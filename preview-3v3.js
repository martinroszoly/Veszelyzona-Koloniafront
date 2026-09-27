(()=>{'use strict';
const map=window.KOLONIA_3V3_MAP;if(!map)throw new Error('3v3 mapdata missing');
const NS='http://www.w3.org/2000/svg',svg=document.getElementById('mapSvg'),stage=document.getElementById('mapStage');
const layers={territories:document.getElementById('territories'),resources:document.getElementById('resources'),units:document.getElementById('units'),markers:document.getElementById('markers'),effects:document.getElementById('effects')};
const PLAYER_ORDER=['blue','green','yellow','purple','red','pink'];
const TEAM={blue:'left',green:'left',yellow:'left',purple:'right',red:'right',pink:'right'};
const OWNER_LABEL={neutral:'Semleges',blue:'Kék',green:'Zöld',yellow:'Sárga',purple:'Lila',red:'Piros',pink:'Rózsaszín'};
const TYPE_LABEL={neutral:'Semleges terület',village:'Falu',city:'Kisváros',mine:'Bánya',oil:'Olajmező',energy:'Erőmű',tech:'Technológiai pont',industrial:'Ipari terület',port:'Kikötő',capital:'Főváros'};
const TYPE_ICON={village:'⌂',city:'▦',mine:'⛏',oil:'◉',energy:'ϟ',tech:'⚙',industrial:'▥',port:'⚓',capital:'★'};
const PLAYER_ART={
 blue:{infantry:'assets/ember-infantry.png',tank:'assets/ember-tank.png',strike:'assets/ember-strike-fighter.png'},
 green:{infantry:'assets/ember-infantry.png',tank:'assets/ember-tank.png',strike:'assets/ember-strike-fighter.png'},
 yellow:{infantry:'assets/ember-infantry.png',tank:'assets/ember-tank.png',strike:'assets/ember-strike-fighter.png'},
 purple:{infantry:'assets/xenon-infantry.png',tank:'assets/xenon-tank.png',strike:'assets/xenon-strike-fighter.png'},
 red:{infantry:'assets/xenon-infantry.png',tank:'assets/xenon-tank.png',strike:'assets/xenon-strike-fighter.png'},
 pink:{infantry:'assets/xenon-infantry.png',tank:'assets/xenon-tank.png',strike:'assets/xenon-strike-fighter.png'},
 neutral:{infantry:'assets/neutral-warden-v3.svg',tank:'assets/neutral-carrier-v3.svg',strike:'assets/neutral-warden-v3.svg'}
};
const UNIT={
 infantry:{name:'Gyalogság',power:1,defense:1,count:360,cost:{supply:120,metal:40}},
 tank:{name:'Harckocsi',power:8.8,defense:12.5,count:55,cost:{metal:220,oil:100,energy:65}},
 strike:{name:'Csapásmérő',power:14,defense:5.2,count:42,cost:{metal:290,oil:190,energy:145,tech:70}},
 mercenary:{name:'Semleges őrség',power:.9,defense:1.05,count:80,cost:{}}
};
const YIELD={
 capital:{supply:60,energy:20},village:{supply:40},city:{supply:65,tech:8},mine:{metal:45},oil:{oil:42},energy:{energy:42},tech:{tech:32},industrial:{metal:20,tech:18},port:{supply:18,oil:12},neutral:{}
};
const RESOURCE_VALUE={capital:80,village:28,city:38,mine:58,oil:58,energy:54,tech:66,industrial:52,port:46,neutral:18};
const DIFFICULTY={
 practice:{expansion:.76,combat:.78,caution:1.4,production:.65},
 easy:{expansion:.9,combat:.9,caution:1.22,production:.82},
 medium:{expansion:1,combat:1,caution:1.05,production:1},
 hard:{expansion:1.23,combat:1.09,caution:.92,production:1.18}
};
const STARTING_RES={supply:560,metal:520,oil:300,energy:300,tech:150};
const initialCapitals=Object.fromEntries(PLAYER_ORDER.map(p=>[p,map.fields.find(f=>f.land===p&&f.type==='capital')?.id]));
const state={turn:1,selected:null,aiRunning:false,difficulty:'hard',markerTest:false,fields:[],resources:{},history:{},gameOver:false};
let byId=new Map(),messageTimer=null;
function clone(v){return JSON.parse(JSON.stringify(v))}
function el(name,attrs={}){const n=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs)){if(k==='text')n.textContent=v;else n.setAttribute(k,String(v));}return n}
function polygonPoints(poly){return poly.map(p=>p.join(',')).join(' ')}
function teamOf(owner){return TEAM[owner]||null}
function isFriendly(a,b){return a!=='neutral'&&b!=='neutral'&&teamOf(a)===teamOf(b)}
function field(id){return byId.get(id)}
function neighbours(f){return (f?.neighbors||[]).map(field).filter(Boolean)}
function totalCount(unit){return unit?Object.values(unit.composition||{}).reduce((a,b)=>a+b,0):0}
function dominantType(unit){if(!unit)return null;let best='infantry',score=-1;for(const [type,count] of Object.entries(unit.composition||{})){const s=count*(UNIT[type]?.power||1);if(s>score){score=s;best=type}}return best}
function normalizeUnit(unit){if(!unit)return null;unit.count=totalCount(unit);unit.morale=Math.max(0,Math.min(100,unit.morale??84));return unit.count>0?unit:null}
function makeUnit(owner,type,count=UNIT[type]?.count||100){return {owner,composition:{[type]:count},count,morale:88,movedTurn:0}}
function mergeUnit(target,incoming){if(!incoming)return;target.composition=target.composition||{};for(const [t,c]of Object.entries(incoming.composition||{}))target.composition[t]=(target.composition[t]||0)+c;target.morale=Math.round(((target.morale||85)*Math.max(1,target.count||0)+(incoming.morale||85)*incoming.count)/Math.max(1,(target.count||0)+incoming.count));normalizeUnit(target)}
function neutralCount(f){const base={neutral:58,village:72,city:110,mine:96,oil:102,energy:102,tech:115,industrial:108,port:90}[f.type]||70;return base+((parseInt(f.id.match(/\d+/)?.[0]||'0',10)*17)%28)}
function resetGame(){
 state.turn=1;state.selected=null;state.aiRunning=false;state.gameOver=false;state.markerTest=false;state.fields=clone(map.fields);byId=new Map(state.fields.map(f=>[f.id,f]));state.resources={};state.history={};
 for(const p of PLAYER_ORDER){state.resources[p]=clone(STARTING_RES);state.history[p]=[]}
 for(const f of state.fields){
   f.owner=f.type==='capital'?f.land:'neutral';f.unit=null;f.originalOwner=f.type==='capital'?f.land:null;
   if(f.type==='capital')f.unit=makeUnit(f.owner,'infantry',1000);else f.unit=makeUnit('neutral','mercenary',neutralCount(f));
 }
 Object.assign(cam,{x:0,y:0,w:base.w,h:base.h});applyCam();renderAll();showMessage('3v3 preview elindult. Kék a játékos; zöld és sárga szövetséges AI. A kamera WASD-del is mozgatható.');
}
function resourceIncome(owner){const out={supply:8,metal:8,oil:5,energy:5,tech:3};for(const f of state.fields)if(f.owner===owner){for(const[k,v]of Object.entries(YIELD[f.type]||{}))out[k]=(out[k]||0)+v}return out}
function collectIncome(owner){const inc=resourceIncome(owner);for(const[k,v]of Object.entries(inc))state.resources[owner][k]=(state.resources[owner][k]||0)+v}
function canAfford(owner,cost){return Object.entries(cost).every(([k,v])=>(state.resources[owner][k]||0)>=v)}
function pay(owner,cost){if(!canAfford(owner,cost))return false;for(const[k,v]of Object.entries(cost))state.resources[owner][k]-=v;return true}
function recruit(owner,type,targetId=null){const target=field(targetId||initialCapitals[owner]);if(!target||target.owner!==owner)return false;const spec=UNIT[type];if(!spec||!pay(owner,spec.cost))return false;const fresh=makeUnit(owner,type,spec.count);if(target.unit&&target.unit.owner===owner)mergeUnit(target.unit,fresh);else if(!target.unit)target.unit=fresh;else return false;showMessage(`${OWNER_LABEL[owner]}: ${spec.name} erősítés érkezett (${spec.count}).`);renderAll();return true}
function typeMultiplier(attacker,defender){
 if(attacker==='strike'&&defender==='infantry')return 2.15;
 if(attacker==='strike'&&defender==='mercenary')return 2.0;
 if(attacker==='strike'&&defender==='tank')return .34;
 if(attacker==='tank'&&defender==='strike')return 1.72;
 if(attacker==='tank'&&defender==='infantry')return 1.2;
 if(attacker==='infantry'&&defender==='tank')return .55;
 return 1;
}
function unitStrength(unit,attacking,targetUnit=null){if(!unit)return 0;let total=0;const defenderTypes=Object.entries(targetUnit?.composition||{});for(const [type,count] of Object.entries(unit.composition||{})){let matchup=1;if(attacking&&defenderTypes.length){let weighted=0,den=0;for(const[dt,dc]of defenderTypes){weighted+=typeMultiplier(type,dt)*dc;den+=dc}matchup=den?weighted/den:1}const s=UNIT[type]||UNIT.mercenary;total+=count*(attacking?s.power:s.defense)*matchup}return total*(.58+(unit.morale||80)/190)}
function applyLoss(unit,lossFraction){if(!unit)return 0;const before=totalCount(unit),fraction=Math.max(0,Math.min(.92,lossFraction));for(const t of Object.keys(unit.composition||{})){const n=unit.composition[t];unit.composition[t]=Math.max(0,n-Math.max(n>0?1:0,Math.round(n*fraction)))}normalizeUnit(unit);return before-(unit?.count||0)}
function terrainDefense(f){let m=f.type==='capital'?1.28:f.type==='city'?1.16:f.type==='industrial'?1.12:f.type==='mine'?1.08:1;if(f.land!=='central')m*=1.04;return m}
function combatPreview(attacker,target){const defender=target.unit;if(!attacker||!defender)return {ratio:9,good:true};const a=unitStrength(attacker,true,defender),d=unitStrength(defender,false,attacker)*terrainDefense(target);const ratio=a/Math.max(1,d);return {ratio,good:ratio>=.86,a,d}}
function capture(from,target,owner){target.owner=owner;target.unit=from.unit;from.unit=null;target.unit.owner=owner;target.unit.movedTurn=state.turn;state.selected=target.id}
function resolveCombat(from,target,owner){
 const attacker=from.unit,defender=target.unit;if(!attacker||!defender)return false;const prev=combatPreview(attacker,target),r=prev.ratio;
 const defenderLossFrac=Math.max(.07,Math.min(.62,.12+.27*(r/(r+.72))));
 const attackerLossFrac=Math.max(.055,Math.min(.55,.09+.24*((1/r)/(1/r+.86))));
 const dLoss=applyLoss(defender,defenderLossFrac),aLoss=applyLoss(attacker,attackerLossFrac);
 if(defender){defender.morale=Math.max(0,defender.morale-Math.round(10+16*Math.min(2,r)))}
 if(attacker){attacker.morale=Math.max(0,attacker.morale-Math.round(7+13*Math.min(2,1/r)))}
 flashLoss(target,dLoss);flashLoss(from,aLoss);
 const defenderBroken=!target.unit||target.unit.count<=0||target.unit.morale<=8||(defender.owner==='neutral'&&r>=2.8)||r>=5.5;const attackerBroken=!from.unit||from.unit.count<=0||from.unit.morale<=8;
 if(defenderBroken&&!attackerBroken){target.unit=null;capture(from,target,owner);showMessage(`${OWNER_LABEL[owner]} elfoglalta: ${target.name}.`);return true}
 if(attackerBroken){from.unit=null;showMessage(`${OWNER_LABEL[owner]} támadása elbukott: ${target.name}.`);return false}
 attacker.movedTurn=state.turn;showMessage(`${target.name}: támadás lezajlott. Támadó −${aLoss}, védő −${dLoss}.`);return false
}
function legalTargets(from,owner){if(!from?.unit||from.unit.owner!==owner||from.unit.movedTurn===state.turn)return[];return neighbours(from).map(t=>{
   if(t.owner===owner){return t.unit?{field:t,kind:'merge'}:{field:t,kind:'move'}}
   if(isFriendly(owner,t.owner))return {field:t,kind:'blocked'};
   if(t.unit&&t.unit.owner!==owner)return {field:t,kind:'attack'};
   return {field:t,kind:'move'};
 }).filter(x=>x.kind!=='blocked')}
function performAction(from,target,owner){if(state.gameOver||!from?.unit||from.unit.owner!==owner||from.unit.movedTurn===state.turn)return false;const action=legalTargets(from,owner).find(x=>x.field.id===target.id);if(!action)return false;if(action.kind==='attack')resolveCombat(from,target,owner);else if(action.kind==='merge'){mergeUnit(target.unit,from.unit);target.unit.movedTurn=state.turn;from.unit=null;state.selected=target.id;showMessage(`${OWNER_LABEL[owner]} erősítést vont össze: ${target.name}.`)}else{capture(from,target,owner);showMessage(`${OWNER_LABEL[owner]} elfoglalta: ${target.name}.`)}checkVictory();renderAll();return true}
function frontThreat(f,owner){let score=0;for(const n of neighbours(f)){if(n.unit&&!isFriendly(owner,n.unit.owner)&&n.unit.owner!=='neutral')score+=unitStrength(n.unit,true,f.unit);if(n.owner!=='neutral'&&!isFriendly(owner,n.owner))score+=45}return score}
function connectivityValue(target,owner){const ns=neighbours(target),own=ns.filter(n=>n.owner===owner).length,team=ns.filter(n=>isFriendly(owner,n.owner)).length,hostile=ns.filter(n=>n.owner!=='neutral'&&!isFriendly(owner,n.owner)).length;return own*18+team*5+hostile*7+(ns.length<=3?16:0)}
function aiTargetScore(from,target,owner,diff){
 const isNew=target.owner!==owner&&!isFriendly(owner,target.owner),hostile=Boolean(target.unit&&target.unit.owner!==owner),neutral=target.owner==='neutral';
 let score=isNew?120*diff.expansion:10;if(target.owner===owner){const threat=frontThreat(target,owner);score+=Math.min(95,threat/Math.max(1,unitStrength(target.unit,false))*55);if(target.type==='capital'&&threat>0)score+=85;}
 if(isNew)score+=(RESOURCE_VALUE[target.type]||18)*diff.expansion;
 if(neutral)score+=34*diff.expansion;
 score+=connectivityValue(target,owner)*diff.expansion;
 if(target.type==='port')score+=24;if(target.type==='capital')score+=70;
 const prev=hostile?combatPreview(from.unit,target):{ratio:3,good:true};
 if(hostile){score+=Math.min(45,prev.ratio*18)*diff.combat;if(prev.ratio<.68*diff.caution)score-=160;if(prev.ratio>.95)score+=22}
 const cap=field(initialCapitals[owner]);if(cap&&from.id===cap.id&&frontThreat(cap,owner)>0&&target.type!=='capital')score-=45;
 const h=state.history[owner]||[];if(h.length&&h[h.length-1]?.from===target.id&&h[h.length-1]?.to===from.id)score-=80;
 if(state.difficulty==='hard'){
   if(['mine','oil','energy','tech'].includes(target.type))score+=30;
   if(target.neighbors.length<=3)score+=18;
   const ownLinks=neighbours(target).filter(n=>n.owner===owner).length;if(ownLinks>=2)score+=28;
   const weak=frontThreat(from,owner)>unitStrength(from.unit,false)*.8;if(weak&&target.owner==='neutral')score-=25;
 }
 return score;
}
function chooseAiProduction(owner){const diff=DIFFICULTY[state.difficulty];const cap=field(initialCapitals[owner]);if(!cap||cap.owner!==owner)return;const threat=frontThreat(cap,owner);let type='infantry';if(threat>unitStrength(cap.unit,false)*.55&&canAfford(owner,UNIT.tank.cost))type='tank';else if(state.difficulty==='hard'&&canAfford(owner,UNIT.strike.cost)&&state.turn%3===0)type='strike';else if(canAfford(owner,UNIT.tank.cost)&&state.turn%2===0)type='tank';if(Math.random()>diff.production*.76)return;recruit(owner,type,cap.id)}
async function runAiPlayer(owner){
 if(state.gameOver)return;collectIncome(owner);chooseAiProduction(owner);renderEconomy();const diff=DIFFICULTY[state.difficulty];
 const units=state.fields.filter(f=>f.unit?.owner===owner&&f.unit.movedTurn!==state.turn).sort((a,b)=>frontThreat(b,owner)-frontThreat(a,owner));
 for(const from of units){if(state.gameOver)break;if(!from.unit||from.unit.owner!==owner||from.unit.movedTurn===state.turn)continue;const options=legalTargets(from,owner);if(!options.length){from.unit.movedTurn=state.turn;continue}
   const ranked=options.map(o=>({target:o.field,score:aiTargetScore(from,o.field,owner,diff)})).sort((a,b)=>b.score-a.score);const pick=ranked[0];if(!pick||pick.score<16){from.unit.movedTurn=state.turn;continue}
   const fromId=from.id,toId=pick.target.id;performAction(from,pick.target,owner);state.history[owner].push({turn:state.turn,from:fromId,to:toId});state.history[owner]=state.history[owner].slice(-8);await pause(state.difficulty==='hard'?55:95);
 }
}
async function endTurn(){if(state.aiRunning||state.gameOver)return;state.aiRunning=true;state.selected=null;document.getElementById('endTurn').disabled=true;document.getElementById('phaseText').textContent='AI körök futnak…';renderAll();
 for(const p of ['green','yellow','purple','red','pink']){if(state.gameOver)break;document.getElementById('phaseText').textContent=`${OWNER_LABEL[p]} AI köre`;await runAiPlayer(p)}
 if(!state.gameOver){state.turn++;collectIncome('blue');for(const f of state.fields)if(f.unit?.owner==='blue')f.unit.movedTurn=0;document.getElementById('phaseText').textContent='Kék játékos köre';showMessage(`Új kör: ${state.turn}. A területbevételek jóváírva.`)}state.aiRunning=false;document.getElementById('endTurn').disabled=state.gameOver;renderAll()}
function pause(ms){return new Promise(r=>setTimeout(r,ms))}
function checkVictory(){const leftCaps=PLAYER_ORDER.filter(p=>TEAM[p]==='left').filter(p=>teamOf(field(initialCapitals[p])?.owner)==='left').length,rightCaps=PLAYER_ORDER.filter(p=>TEAM[p]==='right').filter(p=>teamOf(field(initialCapitals[p])?.owner)==='right').length;if(rightCaps===0){state.gameOver=true;showMessage('GYŐZELEM — a jobb oldali szövetség mindhárom fővárosa elesett.','win')}else if(leftCaps===0){state.gameOver=true;showMessage('VERESÉG — a bal oldali szövetség mindhárom fővárosa elesett.','loss')}}
function showMessage(text,kind=''){const box=document.getElementById('message');box.textContent=text;box.className=`message show ${kind}`;clearTimeout(messageTimer);messageTimer=setTimeout(()=>box.classList.remove('show'),kind?5000:2200)}
function flashLoss(f,loss){if(!f||!loss)return;const[x,y]=f.anchor,node=el('text',{x,y:y-15,class:'combat-flash',text:`−${loss}`});layers.effects.append(node);setTimeout(()=>node.remove(),950)}
function renderTerritories(){const frag=document.createDocumentFragment();const selectedField=field(state.selected);const legal=selectedField?.unit?.owner==='blue'?new Map(legalTargets(selectedField,'blue').map(o=>[o.field.id,o.kind])):new Map();for(const f of state.fields){const extra=legal.get(f.id);const p=el('polygon',{points:polygonPoints(f.polygon),'data-id':f.id,class:`field ${f.owner} ${f.type==='capital'?'capital':''} ${f.id===state.selected?'selected':''} ${extra==='move'||extra==='merge'?'reachable':''} ${extra==='attack'?'attackable':''}`});frag.appendChild(p)}layers.territories.replaceChildren(frag)}
function renderResources(){const frag=document.createDocumentFragment();for(const f of state.fields){if(!TYPE_ICON[f.type]||f.type==='capital')continue;const[x,y]=f.anchor,g=el('g',{class:'resource-dot','data-resource':f.type});g.append(el('circle',{cx:x,cy:y,r:7.3}),el('text',{x,y:y+.5,text:TYPE_ICON[f.type]}));frag.append(g)}layers.resources.replaceChildren(frag)}
function unitArt(unit){const owner=unit?.owner||'neutral',type=dominantType(unit);return PLAYER_ART[owner]?.[type]||PLAYER_ART.neutral.infantry}
function renderUnits(){const frag=document.createDocumentFragment();for(const f of state.fields){const unit=f.unit;if(!unit)continue;if(unit.owner==='neutral'&&f.id!==state.selected)continue;const[x,y]=f.anchor,type=dominantType(unit),size=type==='strike'?46:type==='tank'?42:38,g=el('g',{class:'unit-root','data-sector':f.id});g.append(el('image',{href:unitArt(unit),x:x-size/2,y:y-(size*.82),width:size,height:size*.72,class:'unit-sprite',preserveAspectRatio:'xMidYMax meet'}),el('text',{x,y:y+12,class:'unit-count',text:String(unit.count)}));if(unit.owner!=='neutral')g.append(el('text',{x,y:y+22,class:'unit-owner',text:OWNER_LABEL[unit.owner].toUpperCase()}));if(f.type==='capital')g.append(el('text',{x,y:y+32,class:'capital-label',text:`${OWNER_LABEL[f.owner]} HQ`}));frag.append(g)}layers.units.replaceChildren(frag)}
function renderMarkers(){layers.markers.replaceChildren();const f=field(state.selected);if(!f)return;const[x,y]=f.anchor;layers.markers.append(el('circle',{cx:x,cy:y,r:12,class:'selection-ring'}));if(f.unit?.owner==='blue'&&f.unit.movedTurn!==state.turn&&!state.aiRunning){for(const action of legalTargets(f,'blue'))addMarker(action.field,action.kind)}else if(state.markerTest){for(const [i,t] of neighbours(f).slice(0,5).entries())addMarker(t,i%3===2?'attack':'move',true)}}
function addMarker(target,kind,test=false){const visual=kind==='merge'?'move':kind,[x,y]=target.anchor,g=el('g',{class:`marker ${visual} ${test?'test':''}`});g.append(el('circle',{cx:x,cy:y,r:11}),el('text',{x,y:y+.5,text:visual==='move'?'➜':'⚔'}));layers.markers.append(g)}
function renderSelection(){const f=field(state.selected),name=document.getElementById('fieldName'),owner=document.getElementById('fieldOwner'),meta=document.getElementById('fieldMeta'),unitInfo=document.getElementById('unitInfo'),prod=document.getElementById('production');if(!f){name.textContent='Kattints egy mezőre';owner.textContent='—';meta.textContent='Egérgörgő = zoom · húzás = kamera · WASD = kamera · mobilon pinch + egyujjas húzás.';unitInfo.textContent='';prod.innerHTML='';return}
 name.textContent=f.name;owner.textContent=OWNER_LABEL[f.owner]||f.owner;meta.textContent=`${f.id} · ${TYPE_LABEL[f.type]} · ${f.neighbors.length} szomszéd · anchor ${f.anchor[0]}, ${f.anchor[1]}`;
 if(f.unit){const comp=Object.entries(f.unit.composition||{}).map(([t,c])=>`${UNIT[t]?.name||t}: ${c}`).join(' · ');unitInfo.textContent=`${OWNER_LABEL[f.unit.owner]} egység · ${comp} · morál ${f.unit.morale}%${f.unit.movedTurn===state.turn?' · ebben a körben már cselekedett':''}`}else unitInfo.textContent='Nincs egység ezen a mezőn.';
 prod.innerHTML='';if(f.type==='capital'&&f.owner==='blue'&&!state.aiRunning&&!state.gameOver){for(const type of ['infantry','tank','strike']){const s=UNIT[type],b=document.createElement('button');b.dataset.recruit=type;b.disabled=!canAfford('blue',s.cost);b.innerHTML=`<b>${s.name}</b><small>+${s.count} · ${costText(s.cost)}</small>`;prod.append(b)}}
}
function costText(cost){const short={supply:'E',metal:'F',oil:'O',energy:'N',tech:'T'};return Object.entries(cost).map(([k,v])=>`${v}${short[k]}`).join(' ') }
function renderEconomy(){const r=state.resources.blue||STARTING_RES;document.getElementById('turnValue').textContent=state.turn;document.getElementById('resSupply').textContent=Math.round(r.supply);document.getElementById('resMetal').textContent=Math.round(r.metal);document.getElementById('resOil').textContent=Math.round(r.oil);document.getElementById('resEnergy').textContent=Math.round(r.energy);document.getElementById('resTech').textContent=Math.round(r.tech)}
function renderAll(){renderTerritories();renderResources();renderUnits();renderMarkers();renderSelection();renderEconomy();document.getElementById('fieldCount').textContent=state.fields.length;document.getElementById('endTurn').disabled=state.aiRunning||state.gameOver}
function selectField(id){if(state.aiRunning||state.gameOver)return;const target=field(id),from=field(state.selected);if(from?.unit?.owner==='blue'&&from.id!==target.id&&performAction(from,target,'blue'))return;state.selected=id;renderAll()}

// Kamera: kizárólag az SVG viewBox változik; a HUD és a panelek fixek maradnak.
const base={w:map.width,h:map.height},cam={x:0,y:0,w:base.w,h:base.h},minW=base.w/5;
function clampCam(){cam.w=Math.max(minW,Math.min(base.w,cam.w));cam.h=cam.w*base.h/base.w;cam.x=Math.max(0,Math.min(base.w-cam.w,cam.x));cam.y=Math.max(0,Math.min(base.h-cam.h,cam.y))}
function applyCam(){clampCam();svg.setAttribute('viewBox',`${cam.x} ${cam.y} ${cam.w} ${cam.h}`);document.getElementById('zoomReadout').textContent=`${Math.round(base.w/cam.w*100)}%`}
function clientToWorld(cx,cy,c=cam){const r=svg.getBoundingClientRect();return{x:c.x+(cx-r.left)/r.width*c.w,y:c.y+(cy-r.top)/r.height*c.h,fx:(cx-r.left)/r.width,fy:(cy-r.top)/r.height}}
function zoomAt(factor,cx,cy){const before=clientToWorld(cx,cy),nw=cam.w/factor,nh=nw*base.h/base.w;cam.x=before.x-before.fx*nw;cam.y=before.y-before.fy*nh;cam.w=nw;cam.h=nh;applyCam()}
function focusField(id,zoom=2){const f=field(id);if(!f)return;cam.w=base.w/zoom;cam.h=cam.w*base.h/base.w;cam.x=f.anchor[0]-cam.w/2;cam.y=f.anchor[1]-cam.h/2;applyCam()}
svg.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.deltaY<0?1.16:1/1.16,e.clientX,e.clientY)},{passive:false});
document.getElementById('zoomIn').onclick=()=>{const r=svg.getBoundingClientRect();zoomAt(1.28,r.left+r.width/2,r.top+r.height/2)};
document.getElementById('zoomOut').onclick=()=>{const r=svg.getBoundingClientRect();zoomAt(1/1.28,r.left+r.width/2,r.top+r.height/2)};
document.getElementById('resetCam').onclick=()=>{Object.assign(cam,{x:0,y:0,w:base.w,h:base.h});applyCam()};
document.getElementById('focusBlue').onclick=()=>focusField(initialCapitals.blue,2.1);
document.getElementById('markerTest').onclick=e=>{state.markerTest=!state.markerTest;e.currentTarget.classList.toggle('active',state.markerTest);if(!state.selected)state.selected=initialCapitals.blue;renderAll()};

// WASD/AWSD + nyílbillentyűs folyamatos kameramozgatás.
const keys=new Set();let lastKeyFrame=performance.now();
function cameraKey(k){return ['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright'].includes(k)}
window.addEventListener('keydown',e=>{const tag=e.target?.tagName;if(tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA')return;const k=e.key.toLowerCase();if(cameraKey(k)){keys.add(k);e.preventDefault()}});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
function keyboardCamera(now){const dt=Math.min(.05,(now-lastKeyFrame)/1000);lastKeyFrame=now;if(keys.size){const speed=cam.w*.54*(keys.has('shift')?1.7:1),dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);if(dx||dy){const norm=Math.hypot(dx,dy)||1;cam.x+=dx/norm*speed*dt;cam.y+=dy/norm*speed*dt;applyCam()}}requestAnimationFrame(keyboardCamera)}requestAnimationFrame(keyboardCamera);

// Egységes pointer-kezelés: tap = kijelölés/parancs, húzás = pan, két pointer = pinch zoom.
const ptr=new Map();let gesture=null;
function targetField(e){return e.target&&e.target.closest?e.target.closest('.field'):null}
svg.addEventListener('pointerdown',e=>{e.preventDefault();svg.setPointerCapture?.(e.pointerId);ptr.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,field:targetField(e)?.dataset.id||null});if(ptr.size===1){gesture={mode:'pan',startCam:{...cam},startX:e.clientX,startY:e.clientY,moved:false}}else if(ptr.size===2){const a=[...ptr.values()],dx=a[1].x-a[0].x,dy=a[1].y-a[0].y,midX=(a[0].x+a[1].x)/2,midY=(a[0].y+a[1].y)/2;gesture={mode:'pinch',startCam:{...cam},dist:Math.hypot(dx,dy),world:clientToWorld(midX,midY,{...cam})}}});
svg.addEventListener('pointermove',e=>{const p=ptr.get(e.pointerId);if(!p)return;p.x=e.clientX;p.y=e.clientY;if(ptr.size>=2){const a=[...ptr.values()].slice(0,2),dx=a[1].x-a[0].x,dy=a[1].y-a[0].y,dist=Math.max(10,Math.hypot(dx,dy)),midX=(a[0].x+a[1].x)/2,midY=(a[0].y+a[1].y)/2;if(!gesture||gesture.mode!=='pinch'){gesture={mode:'pinch',startCam:{...cam},dist,world:clientToWorld(midX,midY,{...cam})};return}const scale=dist/gesture.dist,nw=gesture.startCam.w/scale,nh=nw*base.h/base.w,r=svg.getBoundingClientRect(),fx=(midX-r.left)/r.width,fy=(midY-r.top)/r.height;cam.w=nw;cam.h=nh;cam.x=gesture.world.x-fx*nw;cam.y=gesture.world.y-fy*nh;applyCam();stage.classList.add('dragging');return}if(gesture?.mode==='pan'){const dx=e.clientX-gesture.startX,dy=e.clientY-gesture.startY;if(Math.hypot(dx,dy)>7)gesture.moved=true;const r=svg.getBoundingClientRect();cam.x=gesture.startCam.x-dx/r.width*gesture.startCam.w;cam.y=gesture.startCam.y-dy/r.height*gesture.startCam.h;applyCam();if(gesture.moved)stage.classList.add('dragging')}});
function endPointer(e){const p=ptr.get(e.pointerId);if(!p)return;const wasSingle=ptr.size===1,moved=Math.hypot(e.clientX-p.startX,e.clientY-p.startY)>7;ptr.delete(e.pointerId);if(wasSingle&&!moved&&p.field)selectField(p.field);if(ptr.size===0){gesture=null;stage.classList.remove('dragging')}else if(ptr.size===1){const q=[...ptr.values()][0];gesture={mode:'pan',startCam:{...cam},startX:q.x,startY:q.y,moved:true}}}
svg.addEventListener('pointerup',endPointer);svg.addEventListener('pointercancel',endPointer);

document.getElementById('endTurn').addEventListener('click',endTurn);
document.getElementById('newGame').addEventListener('click',resetGame);
document.getElementById('difficultySelect').addEventListener('change',e=>{state.difficulty=e.target.value;showMessage(`AI nehézség: ${e.target.options[e.target.selectedIndex].text}. A prioritás továbbra is területfoglalás → ellenséges egységek.`)});
document.getElementById('production').addEventListener('click',e=>{const b=e.target.closest('[data-recruit]');if(!b)return;if(!recruit('blue',b.dataset.recruit,state.selected))showMessage('Nincs elég nyersanyag, vagy a főváros nem elérhető.')});
resetGame();applyCam();
})();
