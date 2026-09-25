const maps=[
  {id:'plains',name:'Terra-Prime // Széles kontinensfront',image:'continent-territory-map-v1.png',text:'A teljes kontinens látható: falvak, ipari pontok és két főváros a valódi körzethatárok között.',stats:['TELJES KONTINENS','FALVAK + IPAR','KÉT FŐVÁROS']},
  {id:'snow',name:'Terra-Prime // Jégfront',image:'continent-territory-map-v1.png',text:'Ugyanez a körzet- és útvonalhálózat hideg, havas megjelenéssel.',stats:['AZONOS KÖRZETEK','HAVAS LÁTVÁNY','KÉT FŐVÁROS']}
];
const difficulties={practice:{name:'Gyakorló',text:'Termel és védi a fővárost, ritkán kezdeményez.',tempo:0,army:.5},easy:{name:'Easy',text:'Egy lassú frontot épít, kis csapatokkal támad.',tempo:1,army:.64},medium:{name:'Medium',text:'Több irányban terjeszkedik és a nyersanyagmezőkre tör.',tempo:2,army:.82},hard:{name:'Hard',text:'Összehangolt frontvonal, járművek és több támadási irány.',tempo:3,army:1}};
const worldBlueprint=[
 ['Terra-Prime főváros',4,47,'energy','human'],['Kikötői öv',11,17,'food'],['Smaragd-gerinc',20,10,'tech'],['Északi fennsík',31,12,'energy'],['Jégperem',42,10,'food'],['Fagyott gerinc',54,11,'tech'],['Korona-hágó',65,10,'metal'],['Északi kapu',77,13,'energy'],['Xeno főváros',96,47,'tech','alien'],
 ['Nyugati őrtorony',10,31,'metal'],['Mirázs-gúnéc',20,28,'metal'],['Aster-síkság',31,28,'oil'],['Kobalt-öböl',42,27,'oil'],['Peremvidék',53,28,'food'],['Kőhát',64,28,'energy'],['Üresség-mező',75,28,'energy'],['Keleti erőd',87,31,'metal'],
 ['Nyugati átjáró',12,43,'food'],['Terra-Prime kapu',22,42,'energy'],['Delta-állomás',33,42,'food'],['Vörös Kanyon',44,42,'metal'],['Széttört híd',55,42,'energy'],['B-3 raj',66,42,'oil'],['Lila őrtorony',77,42,'tech'],['Xeno elővéd',88,42,'oil'],
 ['Tengeröböl',11,56,'tech'],['Mirázs-medence',21,56,'tech'],['Kék dűnék',32,56,'oil'],['Konfliktuszóna',43,56,'food'],['Hamuvölgy',54,56,'metal'],['Szuvas agy',65,56,'tech'],['C-9 falka',76,56,'energy'],['Keleti-láp',88,56,'food'],
 ['Nyugati sziget',9,70,'energy'],['Obszidián-fok',20,70,'energy'],['Viharöböl',31,70,'food'],['Sivatagi átjáró',42,70,'metal'],['Végtelen mélység',53,70,'oil'],['Ködtenger',64,70,'tech'],['Bíbor part',75,70,'metal'],['Xeno-szirt',88,70,'oil'],
 ['Déli kikötő',12,85,'food'],['Déli kapu',23,85,'metal'],['Ősi tranzit',34,85,'energy'],['Kőszakadék',45,85,'food'],['Napperem',56,85,'energy'],['Vasmező',67,85,'metal'],['Keleti-part',78,85,'oil'],['Fagyott öböl',89,85,'tech'],
 ['Nyugati perem',3,7,'metal'],['Nyugati domb',3,63,'food'],['Nyugati fok',3,94,'energy'],['Keleti perem',97,7,'tech'],['Keleti domb',97,63,'oil'],['Keleti fok',97,94,'energy'],['Felső-övezet',49,4,'metal'],['Alsó-völgy',49,96,'food'],
 ['Északnyugati lánc',15,3,'food'],['Északi hágó',32,3,'energy'],['Északkeleti lánc',68,3,'tech'],['Északi szirt',85,3,'metal'],['Délnyugati szirt',15,97,'oil'],['Déli hágó',32,97,'food'],['Délkeleti lánc',68,97,'energy'],['Déli perem',85,97,'metal']
];
const frontierExtensions=[
 ['Ködös tanyák',0,0,'food'],['Ércgyűrű',0,0,'metal'],['Északi vasút',0,0,'tech'],['Szélfarmok',0,0,'energy'],['Vaskapu gyártelep',0,0,'metal'],['Bányász-völgy',0,0,'metal'],['Régi csatorna',0,0,'oil'],['Kőhíd',0,0,'terrain'],['Fenyves falu',0,0,'food'],['Szürke fennsík',0,0,'terrain'],['Raktárnegyed',0,0,'tech'],['Keleti gyárkapu',0,0,'metal'],['Porvihar-mező',0,0,'terrain'],['Útmenti telep',0,0,'food'],['Mélyfúró állomás',0,0,'oil'],['Távvezeték-öböl',0,0,'energy'],['Elhagyott város',0,0,'terrain'],['Vasúti átkelő',0,0,'tech'],['Hídállás',0,0,'terrain'],['Peremi szántók',0,0,'food'],['Sziklafal',0,0,'terrain'],['Zöldövezet',0,0,'food'],['Fémhulladék-udvar',0,0,'metal'],['Előretolt rádió',0,0,'tech'],['Sivatagi műhely',0,0,'oil'],['Folyóparti falu',0,0,'food'],['Központi depó',0,0,'terrain'],['Külső üzem',0,0,'energy'],['Vadászerdő',0,0,'terrain'],['Kőbánya',0,0,'metal'],['Határállomás',0,0,'tech'],['Vízgyűjtő',0,0,'energy']
];
const strategicRows=[{y:5,x:[4,13,22,31,40,49,58,67,76,85,94]},{y:16,x:[4,13,22,31,40,49,58,67,76,85,94]},{y:27,x:[4,13,22,31,40,49,58,67,76,85,94]},{y:38,x:[4,13,22,31,40,49,58,67,76,85,94]},{y:50,x:[4,13,22,31,40,49,58,67,76,85,96]},{y:62,x:[4,13,22,31,40,49,58,67,76,85,94]},{y:73,x:[4,13,22,31,40,49,58,67,76,85,94]},{y:84,x:[4,13,22,31,40,49,58,67,76,85,94]},{y:95,x:[4,13,22,31,40,49,58,67,76,85,94]}];
const strategicSlots=strategicRows.flatMap(row=>row.x.filter(x=>!(row.y===50&&(x===4||x===96))).map(x=>({x,y:row.y})));
const unitSpecs={
 infantry:{name:'Gyalogsági osztag',art:'assets/infantry.png',badge:'GY',count:1000,cost:{food:50,metal:25},building:'barracks'},apc:{name:'Páncélozott szállító',art:'assets/apc.png',badge:'PSZ',count:10,cost:{metal:140,oil:60,energy:30},building:'vehicleFactory'},tank:{name:'Harckocsi',art:'assets/tank.png',badge:'HK',count:10,cost:{metal:240,oil:100,energy:65},building:'vehicleFactory'},heli:{name:'Támogató helikopter',art:'assets/helicopter.png',badge:'LÉGI',count:10,cost:{metal:210,oil:160,energy:90},building:'hangar'},alien:{name:'Xeno portyázóraj',art:'assets/xeno-raider-v2.png',badge:'XENO',count:1000,cost:{food:50,metal:25},building:'barracks'},hover:{name:'Lebegő szállítóraj',art:'assets/alien-hover.png',badge:'HOVER',count:10,cost:{metal:140,oil:60,energy:30},building:'vehicleFactory'},alienTank:{name:'Xeno ostromharckocsi',art:'assets/xeno-siege-tank-v1.png',badge:'X-TANK',count:10,cost:{metal:240,oil:100,energy:65},building:'vehicleFactory'},alienAir:{name:'Xeno légi elfogóraj',art:'assets/xeno-interceptor-v1.png',badge:'X-LÉGI',count:10,cost:{metal:210,oil:160,energy:90},building:'hangar'},mercenary:{name:'Zsoldos őrség',art:'assets/infantry.png',badge:'ZS',count:420,cost:{},building:'barracks'}
};
const buildings={barracks:{name:'Laktanya',icon:'▰',text:'Gyalogsági alakulatok képzése.',cost:{metal:180,energy:80,food:90}},vehicleFactory:{name:'Járműgyár',icon:'◫',text:'Páncélozott szállítók és harckocsik gyártása.',cost:{metal:420,energy:160,oil:110}},hangar:{name:'Légibázis',icon:'⌁',text:'Helikopterek / idegen légi rajok gyártása.',cost:{metal:380,energy:260,oil:180}},researchCenter:{name:'Kutatóközpont',icon:'◈',text:'Fejlesztési programok feloldása.',cost:{metal:250,energy:300,tech:100}},depot:{name:'Logisztikai raktár',icon:'▦',text:'Nagyobb készlet és gyorsabb telepítés.',cost:{metal:180,energy:100,food:110}}};
const upgrades={commander:{name:'Parancsnoki hálózat',text:'+8% támadóerő minden saját alakulatnak.',cost:{tech:80,energy:100}},repair:{name:'Javító ezred',text:'Járművek +10 morállal indulnak.',cost:{metal:100,tech:90}},medics:{name:'Orvosi tábor',text:'Gyalogság +10 morállal indul.',cost:{food:120,tech:90}},artillery:{name:'Tüzérségi koordináció',text:'Az első támadás nagyobb nyomást gyakorol.',cost:{metal:160,tech:130}},trenches:{name:'Lövészárok-hálózat',text:'Saját szektorok védelme erősebb.',cost:{metal:140,food:80}},logistics:{name:'Frontlogisztika',text:'Minden körben +5 energia és +5 étel.',cost:{metal:120,tech:80}},airSupport:{name:'Légi támogatás',text:'Légi egységek nagyobb morállal indulnak.',cost:{oil:130,tech:150}}};
const sectorBuilds={mine:{name:'Bánya',icon:'⛏',key:'metal',bonus:16,cost:{metal:80,energy:45}},refinery:{name:'Finomító',icon:'◉',key:'oil',bonus:16,cost:{metal:95,energy:60}},generator:{name:'Generátor',icon:'ϟ',key:'energy',bonus:16,cost:{metal:90,oil:35}},farm:{name:'Élelmiszer-dóm',icon:'◌',key:'food',bonus:16,cost:{metal:75,energy:45}},lab:{name:'Technológiai műhely',icon:'◇',key:'tech',bonus:16,cost:{metal:110,energy:80}},outpost:{name:'Őrtorony',icon:'⌂',key:'guard',bonus:0,cost:{metal:125,energy:70}},bunker:{name:'Bunker',icon:'▣',key:'bunker',bonus:0,cost:{metal:160,energy:90,food:45}}};
const state={view:'menuView',map:'plains',faction:'human',difficulty:'practice',turn:1,selected:null,pendingCommand:'move',log:[],grid:[],resources:{metal:1240,energy:410,food:530,oil:860,tech:320},base:null,aiBase:null,aiResources:null,sectorUpgrades:{},modal:null,pendingMerge:null,aiInProgress:false,aiActive:null,aiTarget:null,combatFlashes:[],moveFlash:null,combatInProgress:false,finished:false};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],enemyOf=side=>side==='human'?'alien':'human';
function emptyBase(){return {buildings:{barracks:false,vehicleFactory:false,hangar:false,researchCenter:false,depot:false},upgrades:{},queue:[],ready:{infantry:0,apc:0,tank:0,heli:0,alien:0,hover:0,alienTank:0,alienAir:0},deploymentTarget:null}}
function show(view){$$('.screen').forEach(el=>el.classList.toggle('active',el.id===view));state.view=view}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2400)}
function addLog(message){state.log.unshift(message);state.log=state.log.slice(0,7);const el=$('#eventLog');if(el)el.innerHTML=state.log.map(item=>`<p>${item}</p>`).join('')}
const audio={ctx:null,enabled:true,musicEnabled:true,fxEnabled:true,musicTimer:null,fx:null};
function audioContext(kind='fx'){if((kind==='fx'&&!audio.fxEnabled)||(kind==='music'&&!audio.musicEnabled))return null;try{audio.ctx??=new (window.AudioContext||window.webkitAudioContext)();if(audio.ctx.state==='suspended')audio.ctx.resume();return audio.ctx}catch{return null}}
function stopFx(){if(audio.fx){try{audio.fx.stop()}catch{}audio.fx=null}}
function tone({frequency=220,duration=.12,type='sine',volume=.045,slide=0}){const ctx=audioContext();if(!ctx)return;stopFx();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,ctx.currentTime);if(slide)osc.frequency.exponentialRampToValueAtTime(Math.max(25,frequency+slide),ctx.currentTime+duration);gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.012);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration+.02);audio.fx=osc}
function noise(duration=.12,volume=.05,lowpass=900){const ctx=audioContext();if(!ctx)return;stopFx();const buffer=ctx.createBuffer(1,Math.max(1,ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();filter.type='lowpass';filter.frequency.value=lowpass;gain.gain.setValueAtTime(volume,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);source.buffer=buffer;source.connect(filter).connect(gain).connect(ctx.destination);source.start();audio.fx=source}
function shotSound({duration=.16,volume=.07,crack=1000,boom=90,bursts=1,spacing=.045}={}){const ctx=audioContext();if(!ctx)return;stopFx();const rate=ctx.sampleRate,length=Math.max(1,Math.floor(rate*duration)),buffer=ctx.createBuffer(1,length,rate),data=buffer.getChannelData(0);for(let i=0;i<length;i++){const t=i/rate;let env=0;for(let b=0;b<bursts;b++){const local=t-b*spacing;if(local>=0&&local<.12)env+=Math.exp(-local*38)}const crackle=(Math.random()*2-1)*env;const thump=Math.sin(Math.PI*2*boom*t)*Math.exp(-t*13);const snap=Math.sin(Math.PI*2*crack*t)*Math.exp(-t*55);data[i]=(crackle*.72+thump*.72+snap*.18)*Math.min(1,env+Math.exp(-t*14))}const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();filter.type='lowpass';filter.frequency.value=Math.max(220,crack*1.25);gain.gain.setValueAtTime(volume,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);source.buffer=buffer;source.connect(filter).connect(gain).connect(ctx.destination);source.start();audio.fx=source}
function playMoveSound(unit){if(!unit)return;if(unit.side==='alien'){tone({frequency:unit.type==='alienAir'?420:150,duration:.2,type:'sawtooth',volume:.045,slide:-70});return}if(unit.type==='tank'){tone({frequency:72,duration:.2,type:'square',volume:.055,slide:-18});return}if(unit.type==='apc'){tone({frequency:105,duration:.16,type:'square',volume:.04,slide:-20});return}tone({frequency:185,duration:.09,type:'triangle',volume:.035,slide:-35})}
function playAttackSound(unit){if(!unit)return;if(unit.side==='alien'){tone({frequency:unit.type==='alienTank'?92:330,duration:unit.type==='alienTank'?.34:.20,type:'sawtooth',volume:.06,slide:unit.type==='alienTank'?-52:-170});return}if(unit.type==='tank'){shotSound({duration:.48,volume:.10,crack:190,boom:54});return}if(unit.type==='apc'){shotSound({duration:.24,volume:.07,crack:780,boom:96,bursts:3,spacing:.052});return}if(unit.type==='heli'){shotSound({duration:.30,volume:.065,crack:940,boom:120,bursts:4,spacing:.042});return}shotSound({duration:.18,volume:.06,crack:1250,boom:105,bursts:2,spacing:.052})}
function startMusic(){const ctx=audioContext('music');if(!ctx||audio.musicTimer)return;const notes=[55,65.4,73.4,82.4,73.4,61.7,49];let step=0;const pulse=()=>{if(!audio.musicEnabled)return;const now=ctx.currentTime,osc=ctx.createOscillator(),pad=ctx.createOscillator(),gain=ctx.createGain(),padGain=ctx.createGain();osc.type='triangle';pad.type='sine';osc.frequency.value=notes[step++%notes.length];pad.frequency.value=notes[(step+4)%notes.length]/2;gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(.018,now+.12);gain.gain.exponentialRampToValueAtTime(.0001,now+1.65);padGain.gain.setValueAtTime(.0001,now);padGain.gain.linearRampToValueAtTime(.008,now+.35);padGain.gain.exponentialRampToValueAtTime(.0001,now+1.85);osc.connect(gain).connect(ctx.destination);pad.connect(padGain).connect(ctx.destination);osc.start(now);pad.start(now);osc.stop(now+1.72);pad.stop(now+1.9)};pulse();audio.musicTimer=setInterval(pulse,1900)}
function toggleMusic(){audio.musicEnabled=!audio.musicEnabled;if(!audio.musicEnabled){clearInterval(audio.musicTimer);audio.musicTimer=null}else startMusic();const button=$('#musicToggle');if(button)button.textContent=audio.musicEnabled?'♫ ZENE: BE':'♫ ZENE: KI'}
function toggleFx(){audio.fxEnabled=!audio.fxEnabled;if(!audio.fxEnabled)stopFx();const button=$('#fxToggle');if(button)button.textContent=audio.fxEnabled?'◖ HANGOK: BE':'◖ HANGOK: KI'}
function flashCasualty(sectorId,loss,side){state.combatFlash={sectorId,loss,side};clearTimeout(flashCasualty.timer);flashCasualty.timer=setTimeout(()=>{state.combatFlash=null;if(state.view==='battleView')renderBattle()},1650)}
function flashMove(from,target,side){state.moveFlash={fromId:from.id,toId:target.id,side};clearTimeout(flashMove.timer);flashMove.timer=setTimeout(()=>{state.moveFlash=null;if(state.view==='battleView')renderBattle()},650)}
function costText(cost){return Object.entries(cost).map(([key,value])=>`${value} ${key.toUpperCase()}`).join(' · ')}
function canAfford(cost){return Object.entries(cost).every(([key,value])=>(state.resources[key]||0)>=value)}
function pay(cost){if(!canAfford(cost)){toast('Nincs elég nyersanyag ehhez.');return false}Object.entries(cost).forEach(([key,value])=>state.resources[key]-=value);return true}
function renderMaps(){const selected=maps.find(x=>x.id===state.map);$('#mapChoices').innerHTML=maps.map(map=>`<button class="map-choice ${state.map===map.id?'selected':''}" data-map="${map.id}"><img src="${map.image}" alt="${map.name}"/><span><b>${map.name}</b><small>${map.text}</small><em>${map.stats[0]}</em></span></button>`).join('');$('#setupPreviewTitle').textContent=selected.name;$('#setupPreviewText').textContent=selected.text;$('#setupPreviewStats').innerHTML=selected.stats.map(stat=>`<span>${stat}</span>`).join('');$('#setupPreviewArt').style.background=`linear-gradient(135deg,rgba(4,19,31,.16),rgba(2,6,12,.48)),url(${selected.image}) center/cover`}
function renderDifficulty(){$('#difficultyChoices').innerHTML=Object.entries(difficulties).map(([id,d])=>`<button class="difficulty-choice ${state.difficulty===id?'selected':''}" data-difficulty="${id}"><b>${d.name}</b><small>${d.text}</small></button>`).join('')}
function unitFor(side,index,type=null){const human=['infantry','apc','tank','heli'],alien=['alien','hover','alienTank','alienAir'],unitType=type||(side==='neutral'?'mercenary':(side==='human'?human:alien)[index%4]),spec=unitSpecs[unitType];return {side,type:unitType,morale:76,count:spec.count,composition:{[unitType]:spec.count},movedTurn:null}}
function createGrid(){let slot=0;state.grid=[...worldBlueprint,...frontierExtensions].map(([name,fallbackX,fallbackY,resource,initialOwner],index)=>{const owner=initialOwner||'neutral',isBase=Boolean(initialOwner),position=isBase?{x:owner==='human'?4:96,y:50}:strategicSlots[slot++]||{x:fallbackX,y:fallbackY};const productive=isBase||(resource!=='terrain'&&index%3!==1);return {id:`s${index}`,name,x:position.x,y:position.y,owner,resource:productive?resource:'terrain',isBase,unit:isBase?unitFor(owner,index,owner==='human'?'infantry':'alien'):unitFor('neutral',index,'mercenary')}});state.selected=null;state.turn=1;state.log=[];state.sectorUpgrades={};state.modal=null;state.aiInProgress=false;state.aiActive=null;state.aiTarget=null;state.combatFlashes=[];state.moveFlash=null;state.combatInProgress=false;state.finished=false;state.base=emptyBase();state.aiBase=emptyBase();state.aiResources={metal:1240,energy:410,food:530,oil:860,tech:320};addLog('Mindkét fél 1000 fős gyalogsággal indul a saját fővárosából. A semleges szektorokat zsoldosok védik.');addLog(`Ellenfél: ${difficulties[state.difficulty].name}. 97 mezőn épülhet fel a frontvonal.`)}
function neighbors(sector){return state.grid.filter(x=>x.id!==sector.id&&Math.hypot(x.x-sector.x,x.y-sector.y)<15)}
function isVisible(sector){if(sector.owner===state.faction)return true;return state.grid.some(own=>own.owner===state.faction&&Math.hypot(own.x-sector.x,own.y-sector.y)<19)}
function iconFor(unit){return unitSpecs[unit.type]?.badge||'ŐR'}function artFor(unit){return unitSpecs[unit.type]?.art||'assets/infantry.png'}function typeName(unit){return unitSpecs[unit.type]?.name||'Őrség'}function hasMoved(unit){return unit?.movedTurn===state.turn}function ownBase(){return state.grid.find(s=>s.owner===state.faction&&s.isBase)}
function resourceIncome(key){const holdings=state.grid.filter(s=>s.owner===state.faction&&s.resource===key).length*12,built=state.grid.filter(s=>(state.sectorUpgrades[s.id]||[]).some(id=>sectorBuilds[id]?.key===key)).reduce((total,s)=>total+(sectorBuilds[(state.sectorUpgrades[s.id]||[]).find(id=>sectorBuilds[id]?.key===key)]?.bonus||0),0);return 10+holdings+built+(key==='energy'&&state.base.upgrades.logistics?5:0)+(key==='food'&&state.base.upgrades.logistics?5:0)}
function resourceLabel(key){return ({metal:'⛏ FÉM',energy:'ϟ ENERGIA',food:'◌ ELLÁTMÁNY',oil:'◉ OLAJ',tech:'◈ TECH'})[key]||key.toUpperCase()}
function arrowMarkup(from,target,enemy=false){
  const x=(from.x+target.x)/2,y=(from.y+target.y)/2,deg=Math.atan2(target.y-from.y,target.x-from.x)*180/Math.PI;
  const attack=target.unit?.side&&target.unit.side!==state.faction;
  /* Az inline left/top Androidon is biztosan a megfelelő mező közepére teszi a jelzőt. */
  return `<button type="button" class="move-arrow ${enemy?'ai-route':''} ${attack?'attack-route':''}" data-move-target="${target.id}" onclick="event.preventDefault();event.stopPropagation();window.vzMove('${target.id}');return false;" style="left:${x}%;top:${y}%;--rot:${deg}deg" title="${attack?'Támadás':'Mozgás'}: ${target.name}" aria-label="${attack?'Támadás':'Mozgás'}: ${target.name}">${attack?'⚔':'➜'}</button>`
}
function renderBattle(){const own=state.faction,enemy=enemyOf(own),selected=state.grid.find(s=>s.id===state.selected),map=maps.find(x=>x.id===state.map);$('.planet-scene').style.setProperty('--map-image',`url(${map.image})`);$('#battleMapName').textContent=map.name.toUpperCase()+' // STRATÉGIAI TÉRKÉP';$('#fogStatus').textContent='FELDERÍTÉS: 1 SZEKTOR';$('#turnValue').textContent=state.turn;$('#resourceBar').innerHTML=Object.entries(state.resources).map(([key,val])=>`<div class="resource"><small>${key.toUpperCase()}</small><b>${val}</b><i>+${resourceIncome(key)}</i></div>`).join('');const sectors=state.grid.map(s=>{const visible=isVisible(s),active=state.selected===s.id,owner=visible?s.owner:'fog',guard=s.unit&&visible?`<span class="sector-guard ${s.unit.side} type-${s.unit.type} ${hasMoved(s.unit)?'spent':''}" data-select-unit="${s.id}" title="${typeName(s.unit)}"><img src="${artFor(s.unit)}" alt="${typeName(s.unit)}"/><i>${iconFor(s.unit)}</i><b>${s.unit.count}</b>${hasMoved(s.unit)?'<em>✓</em>':''}</span>`:'',label=visible?`<strong>${s.name}${s.isBase?' ★':''}</strong><small>${resourceLabel(s.resource)}${s.unit?.side==='neutral'?' · ZS':''}</small>`:'<strong>FELDERÍTETLEN</strong><small>?</small>',flash=state.combatFlash?.sectorId===s.id?`<span class="casualty ${state.combatFlash.side}">−${state.combatFlash.loss.toLocaleString('hu-HU')}</span>`:'';return `<button class="world-sector ${owner} ${active?'selected':''} ${s.isBase?'base-sector':''} ${hasMoved(s.unit)?'unit-spent':''}" style="left:${s.x}%;top:${s.y}%" data-sector="${s.id}" aria-label="${visible?s.name:'Felderítetlen szektor'}">${guard}${flash}<span class="sector-label">${label}</span></button>`}).join('');const arrows=selected?.unit?.side===own&&!hasMoved(selected.unit)?neighbors(selected).filter(isVisible).map(target=>arrowMarkup(selected,target)).join(''):'';const aiArrow=state.aiActive&&state.aiTarget?arrowMarkup(state.grid.find(s=>s.id===state.aiActive),state.grid.find(s=>s.id===state.aiTarget),true):'';const moving=state.moveFlash?(()=>{const from=state.grid.find(s=>s.id===state.moveFlash.fromId),to=state.grid.find(s=>s.id===state.moveFlash.toId);if(!from||!to)return '';const distance=Math.hypot(to.x-from.x,to.y-from.y),angle=Math.atan2(to.y-from.y,to.x-from.x)*180/Math.PI;return `<span class="movement-trail ${state.moveFlash.side}" style="left:${from.x}%;top:${from.y}%;width:${distance}%;--rot:${angle}deg"></span>`})():'';$('#sectorMap').innerHTML=sectors+arrows+aiArrow+moving;renderSelection();const mine=state.grid.filter(s=>s.owner===own).length,theirs=state.grid.filter(s=>s.owner===enemy).length,neutral=state.grid.filter(s=>s.owner==='neutral').length;$('#battleStatus').innerHTML=`<b>${map.name}</b><div class="status-line"><span>Saját szektorok</span><strong>${mine}</strong></div><div class="progress"><i style="width:${mine/state.grid.length*100}%"></i></div><div class="status-line"><span>Ellenséges szektorok</span><strong>${theirs}</strong></div><div class="progress red"><i style="width:${theirs/state.grid.length*100}%"></i></div><div class="status-line"><span>Zsoldos szektorok</span><strong>${neutral}</strong></div>`;$('#ownedList').innerHTML=state.grid.filter(s=>s.owner===own).map(s=>`<button class="${hasMoved(s.unit)?'spent':''}" data-sector="${s.id}"><i></i>${s.name}${s.isBase?' ★':''}<span>${s.unit?iconFor(s.unit):'◆'}</span></button>`).join('');$('#eventLog').innerHTML=state.log.map(item=>`<p>${item}</p>`).join('')}
function renderSelection(){const sector=state.grid.find(s=>s.id===state.selected),el=$('#selectedUnit'),detail=$('#squadDetails');if(!sector?.unit||sector.unit.side!==state.faction){el.innerHTML='<span class="unit-symbol">◈</span><b>Főszektor vagy egység</b><small>Kattints a bázisodra a képzéshez, vagy egy saját őrségre a mozgáshoz.</small>';if(detail)detail.innerHTML='<small>Jelölj ki egy saját egységet a pontos összetételhez.</small>';return}const u=sector.unit,parts=Object.entries(u.composition||{[u.type]:u.count}).filter(([,count])=>count>0),composition=parts.map(([type,count])=>`<span><i>${unitSpecs[type]?.badge||type}</i> ${count.toLocaleString('hu-HU')}</span>`).join(''),detailRows=parts.map(([type,count])=>`<div><img src="${unitSpecs[type]?.art||artFor(u)}" alt=""/><span>${unitSpecs[type]?.name||type}</span><b>${count.toLocaleString('hu-HU')}</b></div>`).join('');el.innerHTML=`<img class="selected-art" src="${artFor(u)}" alt=""/><span class="unit-symbol">${iconFor(u)}</span><b>${typeName(u)}</b><small>${sector.name} · ${u.count.toLocaleString('hu-HU')} egység</small><div class="unit-composition"><strong>ALAKULAT ÖSSZETÉTELE</strong>${composition}</div><div class="move-state ${hasMoved(u)?'spent':''}">${hasMoved(u)?'✓ Már lépett ebben a körben':'↗ 1 mozgás elérhető ebben a körben'}</div><div class="status-line"><span>Alakulat létszáma</span><strong>${u.count.toLocaleString('hu-HU')}</strong></div><div class="status-line"><span>Morál</span><strong>${u.morale}/100</strong></div><div class="progress"><i style="width:${u.morale}%;background:var(--cyan)"></i></div>`;if(detail)detail.innerHTML=`<b>${sector.name}</b><small>ÖSSZESEN: ${u.count.toLocaleString('hu-HU')} EGYSÉG</small>${detailRows}`}
function openModal(type,sectorId=null,tab='training'){state.modal={type,sectorId,tab};$('#modalLayer').classList.add('open');$('#modalLayer').setAttribute('aria-hidden','false');renderModal()}function closeModal(){state.modal=null;$('#modalLayer').classList.remove('open');$('#modalLayer').setAttribute('aria-hidden','true')}function openBaseModal(tab='training'){state.selected=null;openModal('base',ownBase()?.id,tab)}function openSectorModal(sector){openModal('sector',sector.id,'sector')}
function renderModal(){if(!state.modal)return;const isBase=state.modal.type==='base',sector=state.grid.find(s=>s.id===state.modal.sectorId),isAlien=state.faction==='alien';$('#modalKicker').textContent=isBase?'KOLÓNIA KÖZPONT':'ELFOGLALT SZEKTOR';$('#modalTitle').textContent=isBase?(sector?.name||'Főszektor'):sector?.name||'Szektor';if(!isBase){renderSectorModal(sector);return}const tabs=[['training','KÉPZÉS'],['manufacturing','GYÁRTÁS'],['deployment','TELEPÍTÉS'],['research','FEJLESZTÉS'],['construction','ÉPÍTKEZÉS']];$('#modalTabs').innerHTML=tabs.map(([id,label])=>`<button class="${state.modal.tab===id?'active':''}" data-modal-tab="${id}">${label}</button>`).join('');const content=$('#modalContent');if(state.modal.tab==='construction')content.innerHTML=Object.entries(buildings).map(([id,b])=>`<article class="build-card ${state.base.buildings[id]?'done':''}"><span>${b.icon}</span><div><b>${b.name}</b><p>${b.text}</p><small>${state.base.buildings[id]?'MEGÉPÜLT':costText(b.cost)}</small></div><button data-action="build" data-id="${id}" ${state.base.buildings[id]||!canAfford(b.cost)?'disabled':''}>${state.base.buildings[id]?'KÉSZ':'ÉPÍTÉS'}</button></article>`).join('');else if(state.modal.tab==='training')content.innerHTML=unitCard(isAlien?'alien':'infantry')+queueMarkup();else if(state.modal.tab==='manufacturing')content.innerHTML=(isAlien?['hover','alienTank','alienAir']:['apc','tank','heli']).map(unitCard).join('')+queueMarkup();else if(state.modal.tab==='deployment'){const target=state.base.deploymentTarget||ownBase()?.id,options=state.grid.filter(s=>s.owner===state.faction).map(s=>`<option value="${s.id}" ${target===s.id?'selected':''}>${s.name}</option>`).join(''),ready=Object.entries(state.base.ready).filter(([type,count])=>count&&unitSpecs[type]).map(([type,count])=>`<article class="build-card"><img src="${unitSpecs[type].art}" alt=""/><div><b>${unitSpecs[type].name}</b><p>Raktárban: ${count} · Telepítés után a kiválasztott mező őrsége lesz.</p></div><button data-action="deploy" data-id="${type}">TELEPÍTÉS</button></article>`).join('')||'<p class="empty-state">Nincs kész egység. A képzési vagy gyártási sorból a következő körben érkeznek meg.</p>';content.innerHTML=`<label class="deployment-select">Célterület <select id="deploymentTarget">${options}</select></label>${ready}`}else if(state.modal.tab==='research')content.innerHTML=Object.entries(upgrades).map(([id,up])=>`<article class="build-card ${state.base.upgrades[id]?'done':''}"><span>✦</span><div><b>${up.name}</b><p>${up.text}</p><small>${state.base.upgrades[id]?'AKTÍV':costText(up.cost)}</small></div><button data-action="upgrade" data-id="${id}" ${state.base.upgrades[id]||!state.base.buildings.researchCenter||!canAfford(up.cost)?'disabled':''}>${state.base.upgrades[id]?'AKTÍV':state.base.buildings.researchCenter?'KUTATÁS':'KUTATÓKÖZPONT KELL'}</button></article>`).join('')}
function unitCard(type){const s=unitSpecs[type],built=state.base.buildings[s.building],ready=state.base.ready[type]||0;return `<article class="build-card unit-build"><img src="${s.art}" alt=""/><div><b>${s.name}</b><p>Raktárban: ${ready} · A munka a következő kör végén készül el.</p><small>${costText(s.cost)}</small></div><button data-action="queue" data-id="${type}" ${!built||!canAfford(s.cost)?'disabled':''}>${built?'SORBA':buildings[s.building].name.toUpperCase()+' KELL'}</button></article>`}function queueMarkup(){return `<div class="queue-strip"><b>AKTÍV GYÁRTÁSI SOR</b>${state.base.queue.length?state.base.queue.map(item=>`<span>${unitSpecs[item.type].badge} · ${item.remaining} kör</span>`).join(''):'<small>A sor üres.</small>'}</div>`}
function renderSectorModal(sector){
  $('#modalTabs').innerHTML='<button class="active">FEJLESZTÉSEK</button>';
  if(!sector||sector.owner!==state.faction){$('#modalContent').innerHTML='<p class="empty-state">Ezt a szektort előbb biztosítani kell.</p>';return}
  const active=state.sectorUpgrades[sector.id]||[],from=state.grid.find(s=>s.id===state.selected),canMerge=from?.unit&&sector.unit?.side===state.faction&&from.id!==sector.id&&neighbors(from).some(s=>s.id===sector.id);
  const mergeCard=canMerge?`<article class="build-card merge-card"><span>⇄</span><div><b>Alakulat összevonása</b><p>A két csapat összetétele összeadódik, és a bal oldali panelen külön látszik minden egységtípus.</p><small>CSAK ERRE A KÖRRE LEZÁRJA A MOZGÁST</small></div><button data-action="merge-sector" data-id="${sector.id}">ÖSSZEVONÁS</button></article>`:'';
  const nonProductive=sector.resource==='terrain',allowed=Object.entries(sectorBuilds).filter(([id,build])=>id==='outpost'||id==='bunker'||(!nonProductive&&build.key===sector.resource));
  const intro=nonProductive?'Nem termelő stratégiai terület. Itt csak felderítő őrtorony vagy egységtelepítésre szolgáló bunker építhető.':`${resourceLabel(sector.resource)} lelőhely. A helyi fejlesztések a kör végi termelést erősítik.`;
  $('#modalContent').innerHTML=`<p class="modal-intro">${intro}</p>${mergeCard}`+allowed.map(([id,b])=>`<article class="build-card ${active.includes(id)?'done':''}"><span>${b.icon}</span><div><b>${b.name}</b><p>${id==='outpost'?'Kibővíti a felderítést és a helyi őrség morálja +10.':id==='bunker'?'Védett telepítési pont: új egységet ide lehet lehívni.':`+${b.bonus} ${b.key.toUpperCase()} minden körben.`}</p><small>${active.includes(id)?'MEGÉPÜLT':costText(b.cost)}</small></div><button data-action="sector-build" data-id="${id}" ${active.includes(id)||!canAfford(b.cost)?'disabled':''}>${active.includes(id)?'KÉSZ':'ÉPÍTÉS'}</button></article>`).join('');
}
function queueUnit(type){const spec=unitSpecs[type];if(!state.base.buildings[spec.building])return toast('Előbb építsd meg a szükséges létesítményt.');if(!pay(spec.cost))return;state.base.queue.push({type,remaining:1});addLog(`${spec.name} a gyártási sorba került.`);renderModal();renderBattle()}function buildBase(id){const build=buildings[id];if(state.base.buildings[id]||!pay(build.cost))return;state.base.buildings[id]=true;addLog(`${build.name} felépült a főszektorban.`);renderModal();renderBattle()}function research(id){const up=upgrades[id];if(!state.base.buildings.researchCenter)return toast('Ehhez kutatóközpont szükséges.');if(!pay(up.cost))return;state.base.upgrades[id]=true;addLog(`Fejlesztés aktív: ${up.name}.`);renderModal();renderBattle()}function sectorBuild(id){const sector=state.grid.find(s=>s.id===state.modal?.sectorId),build=sectorBuilds[id];if(!sector||!pay(build.cost))return;state.sectorUpgrades[sector.id]=[...(state.sectorUpgrades[sector.id]||[]),id];if(id==='outpost'&&sector.unit)sector.unit.morale=Math.min(100,sector.unit.morale+10);addLog(`${sector.name}: ${build.name} elkészült.`);renderModal();renderBattle()}
function makeReadyUnit(type){const unit=unitFor(state.faction,state.turn,type);if(state.base.upgrades.repair&&['apc','tank','heli','hover'].includes(type))unit.morale=86;if(state.base.upgrades.medics&&['infantry','alien'].includes(type))unit.morale=86;if(state.base.upgrades.airSupport&&['heli','hover'].includes(type))unit.morale=90;return unit}function deployUnit(type){const target=state.grid.find(s=>s.id===(state.base.deploymentTarget||ownBase()?.id));if(!target||target.owner!==state.faction)return toast('Válassz saját célterületet.');if(!state.base.ready[type])return;const fresh=makeReadyUnit(type);if(target.unit?.side===state.faction){const before=target.unit.count;target.unit.count+=fresh.count;target.unit.composition={...(target.unit.composition||{})};Object.entries(fresh.composition||{[fresh.type]:fresh.count}).forEach(([unitType,count])=>{target.unit.composition[unitType]=(target.unit.composition[unitType]||0)+count});target.unit.morale=Math.min(100,Math.round((target.unit.morale*before+fresh.morale*fresh.count)/target.unit.count))}else target.unit=fresh;state.base.ready[type]--;addLog(`${unitSpecs[type].name} telepítve: ${target.name}.`);renderModal();renderBattle()}function advanceQueues(){state.base.queue.forEach(item=>item.remaining--);const done=state.base.queue.filter(item=>item.remaining<=0);state.base.queue=state.base.queue.filter(item=>item.remaining>0);done.forEach(item=>{state.base.ready[item.type]++;addLog(`Elkészült: ${unitSpecs[item.type].name}. Telepítésre vár.`)})}
function selectUnit(id){const sector=state.grid.find(s=>s.id===id);if(!sector?.unit||sector.unit.side!==state.faction)return;if(state.selected===id){openSectorModal(sector);return}state.selected=id;renderBattle()}
function executeMove(targetId){
  const from=state.grid.find(s=>s.id===state.selected),target=state.grid.find(s=>s.id===targetId);
  if(!from?.unit||from.unit.side!==state.faction||!target)return;
  if(hasMoved(from.unit)){toast('Ez az egység már mozgott ebben a körben.');return}
  if(!neighbors(from).some(s=>s.id===target.id)){toast('Csak kapcsolódó szektorba adhatsz parancsot.');return}
  if(target.unit?.side===state.faction){playMoveSound(from.unit);askMerge(from,target);return}
  if(target.unit?.side&&target.unit.side!==state.faction){resolveConflict(from,target);return}
  playMoveSound(from.unit);flashMove(from,target,from.unit.side);from.unit.movedTurn=state.turn;target.unit=from.unit;from.unit=null;target.owner=state.faction;state.selected=target.id;addLog(`${target.name} szektort biztosítottad és őrséget telepítettél.`);renderBattle()
}
function askMerge(from,target){state.pendingMerge={from:from.id,target:target.id};$('#choiceText').textContent=`${from.name} és ${target.name} őrségét egyesíted? A közös alakulat ebben a körben már nem léphet.`;$('#choiceLayer').classList.add('open');$('#choiceLayer').setAttribute('aria-hidden','false')}function closeMerge(){state.pendingMerge=null;$('#choiceLayer').classList.remove('open');$('#choiceLayer').setAttribute('aria-hidden','true')}function mergeUnits(){const ids=state.pendingMerge;if(!ids)return;const from=state.grid.find(s=>s.id===ids.from),target=state.grid.find(s=>s.id===ids.target);if(!from?.unit||!target?.unit){closeMerge();return}const a=from.unit,b=target.unit,total=a.count+b.count;b.morale=Math.min(100,Math.round((a.morale*a.count+b.morale*b.count)/total));b.count=total;b.composition={...(b.composition||{})};Object.entries(a.composition||{}).forEach(([type,count])=>{b.composition[type]=(b.composition[type]||0)+count});b.movedTurn=state.turn;from.unit=null;state.selected=target.id;addLog(`${target.name}: két őrség összevonva.`);closeMerge();renderBattle()}
function selectSector(id){if(state.aiInProgress){toast('Az ellenség még végrehajtja a körét.');return}const sector=state.grid.find(s=>s.id===id);if(!sector)return;if(!state.selected&&sector.isBase&&sector.owner===state.faction){openBaseModal();return}if(sector.unit?.side===state.faction){if(state.selected===id){openSectorModal(sector);return}if(state.selected&&state.selected!==id){const from=state.grid.find(s=>s.id===state.selected);if(neighbors(from).some(x=>x.id===id)){openSectorModal(sector);return}}selectUnit(id);return}if(sector.owner===state.faction){openSectorModal(sector);return}if(!state.selected){toast('Előbb jelölj ki egy saját őrséget.');return}const from=state.grid.find(s=>s.id===state.selected);if(!from?.unit)return;if(hasMoved(from.unit)){toast('Ez az egység már mozgott ebben a körben.');return}if(!neighbors(from).some(x=>x.id===id)){toast('Csak kapcsolódó szektorba adhatsz parancsot.');return}if(sector.unit?.side&&sector.unit.side!==state.faction){resolveConflict(from,sector);return}from.unit.movedTurn=state.turn;sector.unit=from.unit;from.unit=null;sector.owner=state.faction;state.selected=sector.id;addLog(`${sector.name} szektort biztosítottad és őrséget telepítettél.`);renderBattle()}
function applyCasualties(unit,loss){
  let remaining=Math.max(0,Math.floor(loss));
  const composition=unit.composition||{[unit.type]:unit.count};
  Object.entries(composition).sort((a,b)=>b[1]-a[1]).forEach(([type,count])=>{
    if(!remaining)return;
    const removed=Math.min(count,remaining),next=count-removed;
    if(next>0)composition[type]=next;else delete composition[type];
    remaining-=removed;
  });
  unit.composition=composition;unit.count=Object.values(composition).reduce((sum,count)=>sum+count,0);return unit.count
}
function resolveConflict(from,target){
  const attacker=from.unit,defender=target.unit,commander=state.base.upgrades.commander?1.08:1,artillery=state.base.upgrades.artillery?1.1:1;
  const power=attacker.count*(attacker.morale/100)*commander*artillery;
  const defense=defender.count*(defender.morale/100)*(state.base.upgrades.trenches&&target.owner===state.faction?1.12:1);
  attacker.movedTurn=state.turn;
  const attackerFavored=power>=defense*.9;
  const defenderLoss=Math.max(1,Math.ceil(attacker.count*(attackerFavored?.22:.09)));
  const attackerLoss=Math.max(1,Math.ceil(defender.count*(attackerFavored?.08:.18)));
  playAttackSound(attacker);applyCasualties(defender,defenderLoss);applyCasualties(attacker,attackerLoss);flashCasualty(target.id,defenderLoss,defender.side);
  defender.morale=Math.max(0,defender.morale-(attackerFavored?28:10));attacker.morale=Math.max(0,attacker.morale-(attackerFavored?8:25));
  if(defender.count===0||defender.morale===0){target.unit=attacker.count?attacker:null;from.unit=null;target.owner=state.faction;state.selected=target.unit?target.id:null;addLog(`${target.name} őrsége feladta a szektort.`)}
  else if(attacker.count===0||attacker.morale===0){from.unit=null;state.selected=null;addLog(`${from.name}: a saját alakulat feladta a harcot.`)}
  else addLog(attackerFavored?`${target.name}: az ellenséges őrség létszáma csökkent.`:`${from.name}: a támadó alakulat visszatért a védőállásba.`);
  renderBattle()
}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function aiCanAfford(cost){return Object.entries(cost).every(([key,value])=>(state.aiResources[key]||0)>=value)}
function aiPay(cost){if(!aiCanAfford(cost))return false;Object.entries(cost).forEach(([key,value])=>state.aiResources[key]-=value);return true}
function enemyResourceIncome(key){const enemy=enemyOf(state.faction);return 10+state.grid.filter(s=>s.owner===enemy&&s.resource===key).length*12}
function advanceAiQueue(){const base=state.aiBase;base.queue.forEach(item=>item.remaining--);const done=base.queue.filter(item=>item.remaining<=0);base.queue=base.queue.filter(item=>item.remaining>0);done.forEach(item=>base.ready[item.type]++)}
function aiBuild(id){const build=buildings[id];if(!state.aiBase.buildings[id]&&aiPay(build.cost)){state.aiBase.buildings[id]=true;addLog(`Ellenség építkezik: ${build.name}.`);return true}return false}
function aiQueue(type){const spec=unitSpecs[type];if(!state.aiBase.buildings[spec.building]||!aiPay(spec.cost))return false;state.aiBase.queue.push({type,remaining:1});addLog(`Ellenség gyártásba kezd: ${spec.name}.`);return true}
function reinforceEnemy(type){const enemy=enemyOf(state.faction),base=state.grid.find(s=>s.owner===enemy&&s.isBase),targets=state.grid.filter(s=>s.owner===enemy).sort((a,b)=>(a.unit?.count||0)-(b.unit?.count||0)),target=targets[0]||base;if(!target)return;const fresh=unitFor(enemy,state.turn,type);if(target.unit?.side===enemy){const old=target.unit.count;target.unit.count+=fresh.count;target.unit.composition={...(target.unit.composition||{})};Object.entries(fresh.composition).forEach(([key,value])=>target.unit.composition[key]=(target.unit.composition[key]||0)+value);target.unit.morale=Math.round((target.unit.morale*old+fresh.morale*fresh.count)/target.unit.count)}else target.unit=fresh;addLog(`Ellenség telepít: ${unitSpecs[type].name} → ${target.name}.`)}
function aiEconomy(){
  const level=state.difficulty,enemy=enemyOf(state.faction),types=enemy==='human'?['infantry','apc','tank','heli']:['alien','hover','alienTank','alienAir'],profile={practice:{build:['barracks'],types:[types[0]],queue:1},easy:{build:['barracks','vehicleFactory'],types:[types[0],types[1]],queue:1},medium:{build:['barracks','vehicleFactory','hangar'],types,queue:1},hard:{build:['barracks','vehicleFactory','hangar','researchCenter','depot'],types,queue:2}}[level];
  advanceAiQueue();Object.keys(state.aiResources).forEach(key=>state.aiResources[key]+=enemyResourceIncome(key));
  const milestone={barracks:1,vehicleFactory:level==='hard'?2:level==='medium'?3:5,hangar:level==='hard'?4:level==='medium'?6:10,researchCenter:7,depot:8};
  const nextConstruction=profile.build.find(id=>!state.aiBase.buildings[id]&&state.turn>=milestone[id]);
  if(nextConstruction){aiBuild(nextConstruction)}else for(let slot=0;slot<profile.queue;slot++){const available=profile.types.filter(type=>state.aiBase.buildings[unitSpecs[type].building]);if(!available.length)break;const type=available[(state.turn+slot)%available.length];aiQueue(type)}
  Object.entries(state.aiBase.ready).forEach(([type,count])=>{while(count>0){reinforceEnemy(type);state.aiBase.ready[type]--;count--}})
}
function aiAttack(from,target,enemy,ai){const attacker=from.unit,defender=target.unit;attacker.movedTurn=state.turn;const power=attacker.count*(attacker.morale/100)*ai.army,defense=(defender?.count||0)*((defender?.morale||70)/100);if(!defender){playMoveSound(attacker);flashMove(from,target,attacker.side);target.owner=enemy;target.unit=attacker;from.unit=null;return}const attackerFavored=power>=defense*.88,defenderCount=defender.count;const defenderLoss=Math.max(1,Math.ceil(attacker.count*(attackerFavored?.19:.08))),attackerLoss=Math.max(1,Math.ceil(defenderCount*(attackerFavored?.07:.16)));playAttackSound(attacker);applyCasualties(defender,defenderLoss);applyCasualties(attacker,attackerLoss);flashCasualty(target.id,defenderLoss,defender.side);defender.morale=Math.max(0,defender.morale-(attackerFavored?24:9));attacker.morale=Math.max(0,attacker.morale-(attackerFavored?7:22));if(defender.count===0||defender.morale===0){flashMove(from,target,attacker.side);target.owner=enemy;target.unit=attacker.count?attacker:null;from.unit=null;addLog(`Ellenség elfoglalta: ${target.name}.`)}else if(attacker.count===0||attacker.morale===0){from.unit=null;addLog(`Ellenséges alakulat feladta: ${from.name}.`)}}
async function aiTurn(){const enemy=enemyOf(state.faction),ai=difficulties[state.difficulty];state.aiInProgress=true;if(ai.tempo===0){addLog('A gyakorló AI termel és védőállást épít, de nem kezdeményez támadást.');state.aiInProgress=false;renderBattle();return}for(let step=0;step<ai.tempo;step++){const candidates=state.grid.filter(s=>s.unit?.side===enemy&&!hasMoved(s.unit)).map(from=>{const target=neighbors(from).filter(n=>n.owner!==enemy).sort((a,b)=>{const score=s=>(s.owner===state.faction?0:s.owner==='neutral'?1:2)+(s.unit?.count||0)/100000;return score(a)-score(b)})[0];return {from,target}}).filter(x=>x.target);const action=candidates[step%candidates.length];if(!action)break;state.aiActive=action.from.id;state.aiTarget=action.target.id;addLog(`Ellenséges mozgás: ${action.from.name} → ${action.target.name}.`);renderBattle();await pause(680);const {from,target}=action;if(from.unit&&from.unit.count*ai.army>(target.unit?.count||0)*.34){aiAttack(from,target,enemy,ai)}state.aiActive=null;state.aiTarget=null;renderBattle();await pause(420)}state.aiInProgress=false;renderBattle()}
function hasWon(){return state.visualTerritoryGridReady&&state.grid.length>0&&state.grid.every(sector=>sector.owner===state.faction)}
function finishVictory(){if(state.finished)return;state.finished=true;const layer=$('#victoryLayer');layer.classList.add('open');layer.setAttribute('aria-hidden','false');addLog('Az ellenséges hadsereg feladta a bolygót.');setTimeout(()=>{layer.classList.remove('open');layer.setAttribute('aria-hidden','true');state.finished=false;show('menuView')},2600)}
async function endTurn(){if(state.aiInProgress||state.finished)return;state.turn++;state.selected=null;advanceQueues();Object.keys(state.resources).forEach(key=>state.resources[key]+=resourceIncome(key));aiEconomy();renderBattle();await aiTurn();if(hasWon()){finishVictory();return}renderBattle()}
function startBattle(){createGrid();show('battleView');renderBattle()}
document.addEventListener('change',e=>{if(e.target.matches('#deploymentTarget'))state.base.deploymentTarget=e.target.value});
document.addEventListener('click',e=>{const map=e.target.closest('[data-map]');if(map){state.map=map.dataset.map;renderMaps();return}const difficulty=e.target.closest('[data-difficulty]');if(difficulty){state.difficulty=difficulty.dataset.difficulty;renderDifficulty();return}const faction=e.target.closest('[data-faction]');if(faction){state.faction=faction.dataset.faction;$$('[data-faction]').forEach(x=>x.classList.toggle('selected',x===faction));return}const close=e.target.closest('[data-close-modal]');if(close){closeModal();return}const tab=e.target.closest('[data-modal-tab]');if(tab){state.modal.tab=tab.dataset.modalTab;renderModal();return}const action=e.target.closest('[data-action]');if(action){const id=action.dataset.id;if(action.dataset.action==='build')buildBase(id);if(action.dataset.action==='queue')queueUnit(id);if(action.dataset.action==='deploy')deployUnit(id);if(action.dataset.action==='upgrade')research(id);if(action.dataset.action==='sector-build')sectorBuild(id);if(action.dataset.action==='merge-sector'){const target=state.grid.find(s=>s.id===id),from=state.grid.find(s=>s.id===state.selected);if(from&&target){closeModal();askMerge(from,target)}}return}const merge=e.target.closest('[data-merge-choice]');if(merge){if(merge.dataset.mergeChoice==='yes')mergeUnits();else closeMerge();return}const arrow=e.target.closest('[data-move-target]');if(arrow){e.stopPropagation();executeMove(arrow.dataset.moveTarget);return}const unit=e.target.closest('[data-select-unit]');if(unit){e.stopPropagation();const target=state.grid.find(s=>s.id===unit.dataset.selectUnit);if(target?.unit?.side===state.faction)selectUnit(unit.dataset.selectUnit);else executeMove(unit.dataset.selectUnit);return}const sector=e.target.closest('[data-sector]');if(sector){selectSector(sector.dataset.sector);return}const back=e.target.closest('[data-back]');if(back){show(back.dataset.back);return}if(e.target.closest('#battleButton')){show('setupView');renderMaps();renderDifficulty();return}if(e.target.closest('#settingsButton'))return toast('A beállítások menü a következő verzióban nyílik meg.');if(e.target.closest('#startBattle')){startMusic();startBattle();return}if(e.target.closest('#soundToggle')){toggleSound();return}if(e.target.closest('#endTurn')){endTurn();return}const command=e.target.closest('[data-command]');if(command){if(command.dataset.command==='produce'){openBaseModal('manufacturing');return}state.pendingCommand=command.dataset.command;toast(`Parancs kiválasztva: ${command.textContent.trim()}`)}});
/* V2: the broad front uses deliberate, readable movement and combat feedback. */
function flashCasualtyEntries(entries){
  state.combatFlashes=entries;
  clearTimeout(flashCasualtyEntries.timer);
  flashCasualtyEntries.timer=setTimeout(()=>{state.combatFlashes=[];if(state.view==='battleView')renderBattle()},2050);
}
function flashMove(from,target,side,kind='move'){
  state.moveFlash={fromId:from.id,toId:target.id,side,kind};
  clearTimeout(flashMove.timer);
  flashMove.timer=setTimeout(()=>{state.moveFlash=null;if(state.view==='battleView')renderBattle()},940);
}
function resourceLabel(key){return ({metal:'⛏ FÉM',energy:'ϟ ENERGIA',food:'◌ ELLÁTMÁNY',oil:'◉ OLAJ',tech:'◈ TECH',terrain:'· JÁRHATÓ TERÜLET'})[key]||key.toUpperCase()}
function arrowMarkup(from,target,enemy=false){
  const x=(from.x+target.x)/2,y=(from.y+target.y)/2,deg=Math.atan2(target.y-from.y,target.x-from.x)*180/Math.PI;
  const attack=target.unit?.side&&target.unit.side!==from.unit?.side;
  const content=attack?'⚔':'➜',className=`move-arrow ${enemy?'ai-route':''} ${attack?'attack-route':''}`;
  if(enemy)return `<span class="${className}" style="left:${x}%;top:${y}%;--rot:${deg}deg" aria-hidden="true">${content}</span>`;
  return `<button type="button" class="${className}" data-move-target="${target.id}" onclick="event.preventDefault();event.stopPropagation();window.vzMove('${target.id}');return false;" style="left:${x}%;top:${y}%;--rot:${deg}deg" title="${attack?'Támadás':'Mozgás'}: ${target.name}" aria-label="${attack?'Támadás':'Mozgás'}: ${target.name}">${content}</button>`;
}
function sectorOutline(shape=0){
  return [
    'polygon(8% 0,82% 3%,100% 27%,92% 79%,70% 100%,19% 94%,0 65%,3% 22%)',
    'polygon(18% 0,88% 8%,100% 36%,83% 100%,25% 94%,0 61%,6% 21%)',
    'polygon(9% 11%,78% 0,100% 30%,92% 72%,64% 100%,14% 86%,0 43%)',
    'polygon(28% 0,87% 10%,100% 59%,74% 100%,17% 91%,0 48%,10% 15%)'
  ][shape%4];
}

/* A térképen látható fehér vonalak a valódi körzethatárok.  A képből egyszer
   beolvassuk ezeket a határokat, ezért a kattintás nem egy fölé rajzolt
   téglalapra, hanem pontosan a vonalak által körbezárt területre esik. */
function territoryPixelIsBoundary(data,offset){
  const r=data[offset],g=data[offset+1],b=data[offset+2],high=Math.max(r,g,b),low=Math.min(r,g,b);
  return r>165&&g>150&&b>105&&r>=g&&g>=b&&high-low<105;
}
function buildTerritoryHitModel(image){
  const source=document.createElement('canvas');source.width=image.naturalWidth;source.height=image.naturalHeight;
  const sourceContext=source.getContext('2d',{willReadFrequently:true});sourceContext.drawImage(image,0,0);
  const pixels=sourceContext.getImageData(0,0,source.width,source.height).data;
  const width=source.width,height=source.height,size=width*height,wall=new Uint8Array(size);
  for(let index=0;index<size;index++){
    const x=index%width,y=(index/width)|0;
    if(x<26||x>width-19||y<56||y>height-20){wall[index]=1;continue;}
    if(!territoryPixelIsBoundary(pixels,index*4))continue;
    for(let yy=Math.max(0,y-5);yy<=Math.min(height-1,y+5);yy++)for(let xx=Math.max(0,x-5);xx<=Math.min(width-1,x+5);xx++)wall[yy*width+xx]=1;
  }
  const region=new Int32Array(size);region.fill(-1);const areas=[],components=[],queue=new Int32Array(size);let regionId=0;
  for(let start=0;start<size;start++){
    if(wall[start]||region[start]!==-1)continue;
    let head=0,tail=0,area=0,sumX=0,sumY=0,minX=width,minY=height,maxX=0,maxY=0;queue[tail++]=start;region[start]=regionId;
    while(head<tail){
      const current=queue[head++],x=current%width,y=(current/width)|0;area++;sumX+=x;sumY+=y;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
      for(const candidate of [current-1,current+1,current-width,current+width]){
        if(candidate<0||candidate>=size||wall[candidate]||region[candidate]!==-1)continue;
        const cx=candidate%width,cy=(candidate/width)|0;
        if(Math.abs(cx-x)+Math.abs(cy-y)!==1)continue;
        region[candidate]=regionId;queue[tail++]=candidate;
      }
    }
    areas.push(area);components.push({id:regionId,area,x:sumX/area,y:sumY/area,minX,minY,maxX,maxY});regionId++;
  }
  /* A két nagy, a térkép szélére kifutó nyitott képrészlet nem stratégiai mező.
     Minden ténylegesen fehér vonallal bezárt szárazföldi körzet külön mező. */
  const valid=new Set(components.filter(item=>item.area>=900&&item.area<=65000).map(item=>item.id));
  return {width,height,region,areas,components,valid};
}
function territoryInfo(index){
  const catalogue=[['Fenyves falu','food'],['Vasérc bánya','metal'],['Folyóparti olajkút','oil'],['Régi ipartelep','tech'],['Szélenergia állomás','energy'],['Nyílt határvidék','terrain'],['Kőfejtő','metal'],['Tanyavilág','food'],['Elhagyott raktár','tech'],['Őrjáratmező','terrain']];
  return catalogue[index%catalogue.length];
}
function createVisualTerritoryGrid(model){
  if(state.visualTerritoryGridReady)return;
  const cells=model.components.filter(item=>model.valid.has(item.id)).sort((a,b)=>a.y-b.y||a.x-b.x);
  const nearest=(x,y,skip)=>cells.filter(cell=>cell.id!==skip).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
  /* A két induló körzetet a képen látható két főváros köré tesszük, nem egy
     általános térképi sarokba. */
  const humanCell=nearest(model.width*.085,model.height*.47),alienCell=nearest(model.width*.915,model.height*.28,humanCell?.id);
  const grid=cells.map((cell,index)=>{
    const [name,resource]=territoryInfo(index);const owner=cell.id===humanCell?.id?'human':cell.id===alienCell?.id?'alien':'neutral';
    const isBase=owner!=='neutral';return {id:`field-${cell.id}`,name:isBase?(owner==='human'?'Terra-Prime főváros':'Xeno dominion'):`${name} ${index+1}`,x:cell.x/model.width*100,y:cell.y/model.height*100,w:(cell.maxX-cell.minX)/model.width*100,h:(cell.maxY-cell.minY)/model.height*100,shape:index%4,resource:isBase?(owner==='human'?'energy':'tech'):resource,owner,isBase,productive:resource!=='terrain',bunker:isBase,watchtower:false,passable:true,terrain:'land',links:[],regionId:cell.id,unit:isBase?unitFor(owner,index,owner==='human'?'infantry':'alien'):unitFor('neutral',index,'mercenary')};
  });
  /* A mozgás a térképi mezők közelségéből felépített szomszédság szerint történik;
     az ugrás mindig egy fehér vonallal érintkező körzetre korlátozódik. */
  grid.forEach(source=>{source.links=grid.filter(target=>target!==source).map(target=>({id:target.id,distance:Math.hypot(source.x-target.x,source.y-target.y)})).sort((a,b)=>a.distance-b.distance).slice(0,5).map(item=>item.id)});
  state.grid=grid;state.territoryRegionBySector=Object.fromEntries(grid.map(item=>[item.id,item.regionId]));state.selected=null;state.visualTerritoryGridReady=true;
  addLog(`${grid.length} valódi, fehér határvonallal jelölt stratégiai mező betöltve.`);
}
function paintTerritorySelection(canvas,model,regionId,owner){
  const context=canvas.getContext('2d');context.clearRect(0,0,canvas.width,canvas.height);
  if(regionId===undefined||!model.valid.has(regionId)||model.areas[regionId]>120000)return;
  const colour=owner==='alien'?[231,60,94,66]:owner==='human'?[65,187,239,66]:[255,203,85,58];
  const image=context.createImageData(model.width,model.height),rgba=image.data;
  for(let index=0;index<model.region.length;index++)if(model.region[index]===regionId){const offset=index*4;rgba[offset]=colour[0];rgba[offset+1]=colour[1];rgba[offset+2]=colour[2];rgba[offset+3]=colour[3];}
  context.putImageData(image,0,0);
}
function installTerritoryHitLayer(){
  const map=$('#sectorMap');if(!map)return;
  const layer=document.createElement('canvas');layer.className='territory-hit-layer';layer.setAttribute('aria-label','Fehér vonallal jelölt stratégiai körzetek');
  map.prepend(layer);
  const draw=()=>{const model=state.territoryHitModel;if(!model)return;layer.width=model.width;layer.height=model.height;const selected=state.grid.find(sector=>sector.id===state.selected);const regionId=selected&&state.territoryRegionBySector?.[selected.id];paintTerritorySelection(layer,model,regionId,selected?.owner);};
  const ready=()=>{const wasReady=state.visualTerritoryGridReady;createVisualTerritoryGrid(state.territoryHitModel);
    /* Az első képfeldolgozás az előző, kísérleti mezőlista helyett azonnal a
       fehér körvonalak valódi körzeteit rajzolja ki. */
    if(!wasReady){renderBattle();return;}
    draw();layer.addEventListener('click',event=>{const rect=layer.getBoundingClientRect(),model=state.territoryHitModel;if(!model)return;const x=Math.max(0,Math.min(model.width-1,Math.floor((event.clientX-rect.left)/rect.width*model.width))),y=Math.max(0,Math.min(model.height-1,Math.floor((event.clientY-rect.top)/rect.height*model.height))),regionId=model.region[y*model.width+x];
    if(regionId<0||!model.valid.has(regionId))return;const sector=state.grid.find(item=>item.regionId===regionId);if(!sector)return;selectSector(sector.id);event.stopPropagation();
  });};
  if(state.territoryHitModel){ready();return;}
  const image=new Image();image.onload=()=>{state.territoryHitModel=buildTerritoryHitModel(image);ready();};image.src='continent-territory-map-v1.png';
}
function renderBattle(){
  const own=state.faction,enemy=enemyOf(own),selected=state.grid.find(s=>s.id===state.selected),map=maps.find(x=>x.id===state.map);
  $('.planet-scene').style.setProperty('--map-image',`url(${map.image})`);
  $('#battleMapName').textContent=map.name.toUpperCase()+' // STRATÉGIAI TÉRKÉP';
  $('#fogStatus').textContent='FELDERÍTÉS: 1 SZEKTOR';$('#turnValue').textContent=state.turn;
  $('#resourceBar').innerHTML=Object.entries(state.resources).map(([key,val])=>`<div class="resource"><small>${key.toUpperCase()}</small><b>${val}</b><i>+${resourceIncome(key)}</i></div>`).join('');
  const sectors=state.grid.map(s=>{
    const visible=isVisible(s),active=state.selected===s.id,owner=visible?s.owner:'fog';
    if(!visible&&!active)return '';
    /* Alapnézetben maga a térkép fehér vonalhálója jelöli a körzeteket.
       A régi, minden semleges mezőre kirakott őrségkártyák csak zavarták
       ezt a nézetet, ezért őrségjel csak saját/ellenséges vagy kijelölt
       körzeten látszik. */
    const showSectorMarker=active||s.isBase||s.owner!=='neutral';
    const guard=s.unit&&visible&&showSectorMarker?`<span class="sector-guard ${s.unit.side} type-${s.unit.type} ${hasMoved(s.unit)?'spent':''}" data-select-unit="${s.id}" title="${typeName(s.unit)}"><img src="${artFor(s.unit)}" alt="${typeName(s.unit)}"/><i>${iconFor(s.unit)}</i><b>${s.unit.count.toLocaleString('hu-HU')}</b>${hasMoved(s.unit)?'<em>✓</em>':''}</span>`:'';
    const installations=`${s.bunker?'<span class="sector-install bunker" title="Bunker · telepítési pont">▣</span>':''}${s.watchtower?'<span class="sector-install tower" title="Őrtorony · felderítés">⌂</span>':''}`;
    const label=visible&&(active||s.isBase)?`<strong>${s.name}${s.isBase?' ★':''}</strong><small>${resourceLabel(s.resource)}${s.unit?.side==='neutral'?' · ZS':''}</small>`:'';
    const flashes=state.combatFlashes.filter(f=>f.sectorId===s.id).map(f=>`<span class="casualty ${f.side} ${f.kind||''}">−${f.loss.toLocaleString('hu-HU')}</span>`).join('');
    if(!showSectorMarker)return '';
    return `<button class="territory-token ${owner} ${active?'selected':''} ${s.isBase?'base-sector':''} ${hasMoved(s.unit)?'unit-spent':''}" style="left:${s.x}%;top:${s.y}%" data-sector="${s.id}" aria-label="${visible?s.name:'Felderítetlen szektor'}">${guard}${flashes}${installations}<span class="sector-label">${label}</span></button>`;
  }).join('');
  const arrows=selected?.unit?.side===own&&!hasMoved(selected.unit)&&!state.combatInProgress?neighbors(selected).filter(isVisible).map(target=>arrowMarkup(selected,target)).join(''):'';
  const aiArrow=state.aiActive&&state.aiTarget?arrowMarkup(state.grid.find(s=>s.id===state.aiActive),state.grid.find(s=>s.id===state.aiTarget),true):'';
  const moving=state.moveFlash?(()=>{const from=state.grid.find(s=>s.id===state.moveFlash.fromId),to=state.grid.find(s=>s.id===state.moveFlash.toId);if(!from||!to)return '';const distance=Math.hypot(to.x-from.x,to.y-from.y),angle=Math.atan2(to.y-from.y,to.x-from.x)*180/Math.PI;return `<span class="movement-trail ${state.moveFlash.side} ${state.moveFlash.kind||''}" style="left:${from.x}%;top:${from.y}%;width:${distance}%;--rot:${angle}deg"></span>`})():'';
  $('#sectorMap').innerHTML=sectors+arrows+aiArrow+moving;installTerritoryHitLayer();renderSelection();
  const mine=state.grid.filter(s=>s.owner===own).length,theirs=state.grid.filter(s=>s.owner===enemy).length,neutral=state.grid.filter(s=>s.owner==='neutral').length;
  $('#battleStatus').innerHTML=`<b>${map.name}</b><div class="status-line"><span>Saját szektorok</span><strong>${mine}</strong></div><div class="progress"><i style="width:${mine/state.grid.length*100}%"></i></div><div class="status-line"><span>Ellenséges szektorok</span><strong>${theirs}</strong></div><div class="progress red"><i style="width:${theirs/state.grid.length*100}%"></i></div><div class="status-line"><span>Zsoldos szektorok</span><strong>${neutral}</strong></div>`;
  $('#ownedList').innerHTML=state.grid.filter(s=>s.owner===own).map(s=>`<button class="${hasMoved(s.unit)?'spent':''}" data-sector="${s.id}"><i></i>${s.name}${s.isBase?' ★':''}<span>${s.unit?iconFor(s.unit):'◆'}</span></button>`).join('');
  $('#eventLog').innerHTML=state.log.map(item=>`<p>${item}</p>`).join('');
}
function combatPower(unit,side,defending=false){
  if(!unit)return 0;const base=unit.count*(unit.morale/100);const isPlayer=side===state.faction;
  const commander=isPlayer&&state.base.upgrades.commander?1.08:1,artillery=isPlayer&&state.base.upgrades.artillery&&!defending?1.1:1;
  const trenches=isPlayer&&state.base.upgrades.trenches&&defending?1.12:1;return base*commander*artillery*trenches;
}
async function resolveConflict(from,target,aiMultiplier=1){
  if(state.combatInProgress||!from?.unit||!target?.unit)return;
  const attacker=from.unit,defender=target.unit;if(attacker.side===defender.side)return;
  state.combatInProgress=true;attacker.movedTurn=state.turn;state.selected=attacker.side===state.faction?from.id:null;
  playMoveSound(attacker);flashMove(from,target,attacker.side,'collision');addLog(`${from.name}: az alakulat ütközik ${target.name} védőivel.`);renderBattle();
  await pause(720);if(!from.unit||!target.unit){state.combatInProgress=false;renderBattle();return}
  const power=combatPower(attacker,attacker.side)*aiMultiplier,defense=combatPower(defender,defender.side,true);
  const attackerFavored=power>=defense*.92,defenderLoss=Math.max(1,Math.ceil(attacker.count*(attackerFavored?.24:.10))),attackerLoss=Math.max(1,Math.ceil(defender.count*(attackerFavored?.10:.20)));
  playAttackSound(attacker);applyCasualties(defender,defenderLoss);applyCasualties(attacker,attackerLoss);
  defender.morale=Math.max(0,defender.morale-(attackerFavored?27:12));attacker.morale=Math.max(0,attacker.morale-(attackerFavored?9:24));
  flashCasualtyEntries([{sectorId:target.id,loss:defenderLoss,side:defender.side},{sectorId:from.id,loss:attackerLoss,side:attacker.side,kind:'retaliation'}]);renderBattle();
  await pause(1180);
  if(defender.count===0||defender.morale===0){flashMove(from,target,attacker.side,'advance');target.unit=attacker.count?attacker:null;from.unit=null;target.owner=attacker.side;if(attacker.side===state.faction)state.selected=target.unit?target.id:null;addLog(`${target.name} védői feladták: a szektor gazdát cserélt.`)}
  else if(attacker.count===0||attacker.morale===0){from.unit=null;if(attacker.side===state.faction)state.selected=null;addLog(`${from.name}: a támadó alakulat feladta a támadást.`)}
  else addLog(`${target.name}: mindkét alakulat veszteséget szenvedett; a frontvonal tartja magát.`);
  state.combatInProgress=false;renderBattle();
}
function aiTargetScore(from,target,enemy){
  const value={metal:22,energy:18,food:15,oil:24,tech:28,terrain:4}[target.resource]||4;
  const player=target.owner===state.faction?85:target.owner==='neutral'?45:0;
  const defenders=(target.unit?.count||0)/55,nearEnemy=neighbors(target).filter(s=>s.owner===enemy).length*7;
  return player+value-defenders+nearEnemy;
}
async function aiTurn(){
  const enemy=enemyOf(state.faction),ai=difficulties[state.difficulty];state.aiInProgress=true;
  if(ai.tempo===0){addLog('A gyakorló AI termel és erősíti a védővonalát.');state.aiInProgress=false;renderBattle();return}
  for(let step=0;step<ai.tempo;step++){
    const candidates=state.grid.filter(s=>s.unit?.side===enemy&&!hasMoved(s.unit)).map(from=>({from,target:neighbors(from).filter(n=>n.owner!==enemy).sort((a,b)=>aiTargetScore(from,b,enemy)-aiTargetScore(from,a,enemy))[0]})).filter(x=>x.target);
    const action=candidates.sort((a,b)=>aiTargetScore(b.from,b.target,enemy)-aiTargetScore(a.from,a.target,enemy))[0];if(!action)break;
    const {from,target}=action;state.aiActive=from.id;state.aiTarget=target.id;addLog(`Ellenséges frontmozgás: ${from.name} → ${target.name}.`);renderBattle();await pause(750);
    if(from.unit&&from.unit.count*ai.army>(target.unit?.count||0)*.30){if(target.unit)await resolveConflict(from,target,ai.army);else{playMoveSound(from.unit);flashMove(from,target,enemy,'advance');from.unit.movedTurn=state.turn;target.owner=enemy;target.unit=from.unit;from.unit=null;addLog(`Ellenség biztosította: ${target.name}.`);renderBattle();await pause(700)}}
    state.aiActive=null;state.aiTarget=null;renderBattle();await pause(360);
  }
  state.aiInProgress=false;renderBattle();
}

/* 3.2 — ez a fájl utolsó, érvényes térképfelépítése. */
function createGrid(){
  /* Minden új csata a térképkép fehér határvonalait olvassa vissza; így nem
     maradhat az előző parti régi vagy eltolódott mezőlistája. */
  state.visualTerritoryGridReady=false;
  state.territoryRegionBySector={};
  const grid=terrainTerritories.map(([id,name,x,y,w,h,shape,resource,owner=null,isBase=false,terrain='land'],index)=>({
    id,name,x,y,w,h,shape,resource,owner:owner||'neutral',isBase,
    productive:resource!=='terrain',bunker:Boolean(isBase),watchtower:false,passable:true,terrain,links:[],
    unit:isBase?unitFor(owner,index,owner==='human'?'infantry':'alien'):unitFor('neutral',index,'mercenary')
  }));
  const byId=new Map(grid.map(point=>[point.id,point]));
  territoryLinks.forEach(([a,b])=>{byId.get(a)?.links.push(b);byId.get(b)?.links.push(a)});
  state.grid=grid;state.selected=null;state.turn=1;state.log=[];state.sectorUpgrades={};state.modal=null;
  state.aiInProgress=false;state.aiActive=null;state.aiTarget=null;state.combatFlashes=[];state.moveFlash=null;
  state.combatInProgress=false;state.finished=false;state.base=emptyBase();state.aiBase=emptyBase();
  state.aiResources={metal:1240,energy:410,food:530,oil:860,tech:320};
  addLog('A teljes kontinens kézzel kijelölt, terephez illesztett stratégiai körzetekből áll.');
  addLog('A semleges körzeteket zsoldosok védik; mindkét főváros bunkerrel indul.');
}
function isVisible(){return true}

/* 3.4 — részleges csapatparancs. A leválasztott alakulat csak a saját
   része; a hátrahagyott haderő a kiinduló körzetben marad. */
function mergeDetachment(home,detachment){
  if(!detachment?.count)return;
  if(!home.unit){home.unit=detachment;return}
  const before=home.unit.count,total=before+detachment.count;
  home.unit.composition={...(home.unit.composition||{})};
  Object.entries(detachment.composition||{[detachment.type]:detachment.count}).forEach(([type,count])=>home.unit.composition[type]=(home.unit.composition[type]||0)+count);
  home.unit.count=total;home.unit.morale=Math.min(100,Math.round((home.unit.morale*before+detachment.morale*detachment.count)/total));
}
function takeDetachment(unit,share){
  const wanted=Math.max(1,Math.round(unit.count*share));
  const original=unit.composition||{[unit.type]:unit.count},picked={};let remaining=wanted;
  Object.entries(original).sort((a,b)=>b[1]-a[1]).forEach(([type,count])=>{
    if(!remaining)return;const take=Math.min(count,remaining);picked[type]=take;original[type]=count-take;if(!original[type])delete original[type];remaining-=take;
  });
  unit.composition=original;unit.count=Object.values(original).reduce((sum,count)=>sum+count,0);
  const type=Object.entries(picked).sort((a,b)=>b[1]-a[1])[0]?.[0]||unit.type;
  return {side:unit.side,type,morale:unit.morale,count:wanted,composition:picked,movedTurn:state.turn};
}
function ensureMoveShareLayer(){
  if(document.querySelector('#moveShareLayer'))return;
  const layer=document.createElement('div');layer.id='moveShareLayer';layer.className='choice-layer move-share-layer';layer.setAttribute('aria-hidden','true');
  layer.innerHTML='<section class="choice-card"><span class="choice-icon">➜</span><h2>Mekkora alakulat induljon?</h2><p id="moveShareText">Válaszd ki a kiinduló egység részarányát.</p><div class="move-share-options"><button data-move-share=".25">25%</button><button data-move-share=".5">50%</button><button data-move-share=".75">75%</button><button class="confirm" data-move-share="1">100%</button></div><button class="move-cancel" data-cancel-move>MÉGSEM</button></section>';
  document.body.append(layer);
}
function askMoveShare(targetId){
  const from=state.grid.find(s=>s.id===state.selected),target=state.grid.find(s=>s.id===targetId);
  if(!from?.unit||from.unit.side!==state.faction||!target)return;
  if(hasMoved(from.unit)){toast('Ez az alakulat már mozgott ebben a körben.');return}
  if(!neighbors(from).some(s=>s.id===target.id)){toast('Csak kapcsolódó szektorba adhatsz parancsot.');return}
  if(target.unit?.side===state.faction){askMerge(from,target);return}
  ensureMoveShareLayer();state.pendingMove={fromId:from.id,targetId};
  $('#moveShareText').textContent=`${from.name} · ${from.unit.count.toLocaleString('hu-HU')} fő / egység. A kiválasztott rész indul ${target.name} felé.`;
  $('#moveShareLayer').classList.add('open');$('#moveShareLayer').setAttribute('aria-hidden','false');
}
function closeMoveShare(){state.pendingMove=null;$('#moveShareLayer')?.classList.remove('open');$('#moveShareLayer')?.setAttribute('aria-hidden','true')}
async function moveShare(share){
  const command=state.pendingMove;if(!command)return;const from=state.grid.find(s=>s.id===command.fromId),target=state.grid.find(s=>s.id===command.targetId);closeMoveShare();
  if(!from?.unit||!target)return;const detachment=takeDetachment(from.unit,share);
  if(!from.unit.count)from.unit=null;
  if(target.unit?.side&&target.unit.side!==state.faction){
    detachment.returnTo=from.id;from.unit=detachment;await resolveConflict(from,target);return;
  }
  playMoveSound(detachment);flashMove(from,target,detachment.side,'advance');target.unit=detachment;target.owner=state.faction;state.selected=target.id;
  addLog(`${Math.round(share*100)}% alakulat elindult: ${from.name} → ${target.name}.`);renderBattle();
}
function executeMove(targetId){askMoveShare(targetId)}
window.vzMove=targetId=>askMoveShare(targetId);
document.addEventListener('click',event=>{
  const share=event.target.closest('[data-move-share]');if(share){event.stopPropagation();moveShare(Number(share.dataset.moveShare));return}
  if(event.target.closest('[data-cancel-move]')){event.stopPropagation();closeMoveShare()}
},true);
async function resolveConflict(from,target,aiMultiplier=1){
  if(state.combatInProgress||!from?.unit||!target?.unit)return;
  const attacker=from.unit,defender=target.unit;if(attacker.side===defender.side)return;
  const returnTo=attacker.returnTo&&state.grid.find(s=>s.id===attacker.returnTo);
  state.combatInProgress=true;attacker.movedTurn=state.turn;state.selected=attacker.side===state.faction?from.id:null;
  playMoveSound(attacker);flashMove(from,target,attacker.side,'collision');addLog(`${from.name}: az alakulat ütközik ${target.name} védőivel.`);renderBattle();
  await pause(720);if(!from.unit||!target.unit){state.combatInProgress=false;renderBattle();return}
  const power=combatPower(attacker,attacker.side)*aiMultiplier,defense=combatPower(defender,defender.side,true),favored=power>=defense*.92;
  const defenderLoss=Math.max(1,Math.ceil(attacker.count*(favored?.24:.10))),attackerLoss=Math.max(1,Math.ceil(defender.count*(favored?.10:.20)));
  playAttackSound(attacker);applyCasualties(defender,defenderLoss);applyCasualties(attacker,attackerLoss);
  defender.morale=Math.max(0,defender.morale-(favored?27:12));attacker.morale=Math.max(0,attacker.morale-(favored?9:24));
  flashCasualtyEntries([{sectorId:target.id,loss:defenderLoss,side:defender.side},{sectorId:from.id,loss:attackerLoss,side:attacker.side,kind:'retaliation'}]);renderBattle();await pause(1180);
  if(defender.count===0||defender.morale===0){delete attacker.returnTo;target.unit=attacker.count?attacker:null;from.unit=null;target.owner=attacker.side;state.selected=attacker.side===state.faction?target.id:null;addLog(`${target.name} védői feladták: a szektor gazdát cserélt.`)}
  else if(returnTo){from.unit=null;delete attacker.returnTo;mergeDetachment(returnTo,attacker);state.selected=returnTo.id;addLog(`${target.name}: a leválasztott alakulat visszatért a kiinduló szektorba.`)}
  else if(attacker.count===0||attacker.morale===0){from.unit=null;state.selected=null;addLog(`${from.name}: a támadó alakulat feladta a támadást.`)}
  else addLog(`${target.name}: mindkét alakulat veszteséget szenvedett; a frontvonal tartja magát.`);
  state.combatInProgress=false;renderBattle();
}

/* 3.1 — végső térképfelépítés. A korábbi prototípus-körzeteket itt
   szándékosan felülírjuk: kizárólag a kézzel elhelyezett, a terepképhez
   igazított körzetek kerülhetnek a csatába. */
function createGrid(){
  const grid=terrainTerritories.map(([id,name,x,y,w,h,shape,resource,owner=null,isBase=false,terrain='land'],index)=>({
    id,name,x,y,w,h,shape,resource,owner:owner||'neutral',isBase,
    productive:resource!=='terrain',bunker:Boolean(isBase),watchtower:false,
    passable:true,terrain,links:[],
    unit:isBase?unitFor(owner,index,owner==='human'?'infantry':'alien'):unitFor('neutral',index,'mercenary')
  }));
  const byId=new Map(grid.map(point=>[point.id,point]));
  territoryLinks.forEach(([a,b])=>{byId.get(a)?.links.push(b);byId.get(b)?.links.push(a)});
  state.grid=grid;state.selected=null;state.turn=1;state.log=[];state.sectorUpgrades={};
  state.modal=null;state.aiInProgress=false;state.aiActive=null;state.aiTarget=null;
  state.combatFlashes=[];state.moveFlash=null;state.combatInProgress=false;state.finished=false;
  state.base=emptyBase();state.aiBase=emptyBase();state.aiResources={metal:1240,energy:410,food:530,oil:860,tech:320};
  addLog('A teljes kontinens kézzel kijelölt, terephez illesztett stratégiai körzetekből áll.');
  addLog('A semleges körzeteket zsoldosok védik; mindkét főváros bunkerrel indul.');
}
function isVisible(){return true}

/* 3.0 — Kézzel kiosztott, a teljes felülnézeti kontinenshez igazított körzetek.
   Ezek nem egy rácsgenerátor mezői: minden pont szárazföldi tájhoz, úthoz,
   hágóhoz, hídhoz vagy településhez tartozik. */
const terrainTerritories=[
 ['human-capital','Terra-Prime főváros',18,54,7.2,8.0,0,'energy','human',true],['west-harbour','Nyugati kikötő',8,47,6.3,7.3,1,'tech'],['coast-farms','Parti majorság',16,40,6.8,7.4,2,'food'],['west-woods','Fenyves perem',23,35,6.9,7.4,3,'terrain'],['granite-pass','Gránit hágó',25,22,6.3,7.0,0,'terrain',null,false,'pass'],['west-quarry','Nyugati kőfejtő',30,31,6.7,7.4,1,'metal'],
 ['north-farm','Északi falvak',35,13,7.0,7.5,2,'food'],['river-watch','Folyóőrség',38,23,6.3,7.0,3,'terrain'],['north-forest','Északi erdőség',45,13,7.0,7.4,0,'terrain'],['wind-station','Szélenergia telep',52,20,6.8,7.3,1,'energy'],['old-road','Régi országút',57,30,6.8,7.4,2,'terrain'],['north-market','Kereskedőfalu',48,30,6.9,7.3,3,'food'],
 ['lake-bridge','Tavi hídállás',42,39,6.1,6.8,0,'terrain',null,false,'bridge'],['central-village','Középső falu',31,43,6.9,7.5,1,'food'],['iron-ridge','Vasgerinc bánya',39,48,6.9,7.4,2,'metal'],['central-pasture','Központi legelő',49,43,7.0,7.5,3,'food'],['lake-road','Tóparti út',56,42,6.7,7.2,0,'terrain'],['river-crossing','Középső híd',59,51,6.0,6.8,1,'terrain',null,false,'bridge'],
 ['southwest-hills','Délnyugati dombok',20,65,6.9,7.4,2,'terrain'],['port-village','Déli halászfalu',28,72,6.8,7.4,3,'food'],['forest-line','Fenyves határ',36,63,6.9,7.5,0,'terrain'],['southern-mine','Déli érctelep',42,73,6.8,7.4,1,'metal'],['marsh-watch','Mocsári őrhely',51,64,6.7,7.3,2,'terrain'],['delta-farm','Deltavidék',58,72,6.9,7.5,3,'food'],
 ['east-meadow','Keleti mezőség',64,40,6.9,7.5,0,'terrain'],['power-relay','Energia-átjátszó',66,50,6.7,7.4,1,'energy'],['wetland-village','Lápi falu',70,58,6.8,7.4,2,'food'],['ridge-pass','Keleti hágó',76,63,6.1,6.8,3,'terrain',null,false,'pass'],['east-works','Keleti ipartelep',72,47,6.8,7.4,0,'tech'],['lowland-farm','Keleti tanyák',79,53,6.8,7.4,1,'food'],
 ['desert-gate','Sivatagi kapu',69,12,6.9,7.5,2,'terrain'],['red-mine','Vörös kőbánya',76,16,6.8,7.4,3,'metal'],['oil-well','Nyugati olajkút',84,13,6.8,7.5,0,'oil'],['desert-route','Homoki útvonal',70,24,6.7,7.3,1,'terrain'],['xeno-outpost','Xeno őrhely',79,26,6.8,7.4,2,'tech'],['canyon-village','Kanyon telep',88,24,6.8,7.4,3,'food'],
 ['refinery','Sivatagi finomító',72,35,6.8,7.4,0,'oil'],['mesa-watch','Mesa őrtorony',81,37,6.7,7.3,1,'terrain'],['xeno-capital','Xeno dominion',88,43,7.2,8.0,2,'tech','alien',true],['alien-forge','Idegen műhely',82,49,6.8,7.4,3,'tech'],['crimson-well','Bíbor olajmező',91,55,6.8,7.4,0,'oil'],['desert-power','Napperem erőmű',75,43,6.7,7.4,1,'energy'],
 ['south-river','Alsó folyópart',63,63,6.8,7.4,2,'terrain'],['floodplain','Ártéri falu',66,73,6.8,7.4,3,'food'],['eastern-woods','Keleti erdőség',76,74,6.9,7.5,0,'terrain'],['mountain-pass','Déli hegyhágó',84,67,6.1,6.8,1,'terrain',null,false,'pass'],['black-quarry','Fekete kőfejtő',88,75,6.8,7.4,2,'metal'],['alien-coast','Idegen partszakasz',93,66,6.8,7.4,3,'terrain'],
 ['island-watch','Nyugati szigetőr',5,69,5.9,6.8,0,'terrain'],['sea-farm','Szigeti község',10,78,6.2,7.0,1,'food'],['southern-road','Déli útállás',32,82,6.8,7.3,2,'terrain'],['supply-depot','Ellátmányraktár',46,82,6.7,7.4,3,'food'],['delta-crossing','Delta híd',55,80,6.0,6.8,0,'terrain',null,false,'bridge'],['harbour-east','Keleti kikötő',70,84,6.8,7.4,1,'tech'],['mountain-keep','Hegyi erőd',82,84,6.7,7.3,2,'terrain'],['far-east-coast','Távoli part',94,82,5.8,6.8,3,'terrain']
];
const territoryLinks=[
 ['human-capital','west-harbour'],['human-capital','coast-farms'],['human-capital','central-village'],['human-capital','southwest-hills'],['west-harbour','coast-farms'],['coast-farms','west-woods'],['west-woods','granite-pass'],['west-woods','west-quarry'],['granite-pass','north-farm'],['west-quarry','river-watch'],['west-quarry','central-village'],['north-farm','river-watch'],['north-farm','north-forest'],['river-watch','north-market'],['north-forest','wind-station'],['wind-station','old-road'],['wind-station','north-market'],['old-road','desert-gate'],['north-market','lake-bridge'],['north-market','central-pasture'],['lake-bridge','iron-ridge'],['central-village','iron-ridge'],['central-village','forest-line'],['iron-ridge','central-pasture'],['iron-ridge','lake-road'],['central-pasture','lake-road'],['lake-road','river-crossing'],['river-crossing','east-meadow'],['river-crossing','power-relay'],['southwest-hills','port-village'],['southwest-hills','forest-line'],['port-village','southern-road'],['forest-line','southern-mine'],['forest-line','marsh-watch'],['southern-mine','supply-depot'],['marsh-watch','delta-farm'],['marsh-watch','south-river'],['delta-farm','delta-crossing'],['east-meadow','power-relay'],['east-meadow','east-works'],['power-relay','wetland-village'],['power-relay','south-river'],['wetland-village','ridge-pass'],['wetland-village','lowland-farm'],['ridge-pass','eastern-woods'],['east-works','lowland-farm'],['east-works','desert-power'],['lowland-farm','alien-forge'],['desert-gate','red-mine'],['desert-gate','desert-route'],['red-mine','oil-well'],['red-mine','xeno-outpost'],['oil-well','canyon-village'],['desert-route','xeno-outpost'],['desert-route','refinery'],['xeno-outpost','mesa-watch'],['xeno-outpost','canyon-village'],['canyon-village','xeno-capital'],['refinery','mesa-watch'],['refinery','desert-power'],['mesa-watch','xeno-capital'],['xeno-capital','alien-forge'],['xeno-capital','crimson-well'],['alien-forge','crimson-well'],['alien-forge','mountain-pass'],['desert-power','alien-forge'],['south-river','floodplain'],['floodplain','eastern-woods'],['floodplain','harbour-east'],['eastern-woods','mountain-pass'],['mountain-pass','black-quarry'],['black-quarry','alien-coast'],['alien-coast','far-east-coast'],['island-watch','sea-farm'],['sea-farm','port-village'],['southern-road','supply-depot'],['supply-depot','delta-crossing'],['delta-crossing','floodplain'],['harbour-east','mountain-keep'],['mountain-keep','far-east-coast']
];
function createGrid(){
  const grid=terrainTerritories.map(([id,name,x,y,w,h,shape,resource,owner=null,isBase=false,terrain='land'],index)=>({id,name,x,y,w,h,shape,resource,owner:owner||'neutral',isBase,productive:resource!=='terrain',bunker:Boolean(isBase),watchtower:false,passable:true,terrain,links:[],unit:isBase?unitFor(owner,index,owner==='human'?'infantry':'alien'):unitFor('neutral',index,'mercenary')}));
  const byId=new Map(grid.map(point=>[point.id,point]));territoryLinks.forEach(([a,b])=>{byId.get(a)?.links.push(b);byId.get(b)?.links.push(a)});
  state.grid=grid;state.selected=null;state.turn=1;state.log=[];state.sectorUpgrades={};state.modal=null;state.aiInProgress=false;state.aiActive=null;state.aiTarget=null;state.combatFlashes=[];state.moveFlash=null;state.combatInProgress=false;state.finished=false;state.base=emptyBase();state.aiBase=emptyBase();state.aiResources={metal:1240,energy:410,food:530,oil:860,tech:320};
  addLog('A teljes kontinens kézzel kijelölt, összefüggő stratégiai körzetekből áll.');addLog('A semleges körzeteket zsoldosok védik; mindkét főváros bunkerrel indul.');
}
function isVisible(){return true}
globalThis.vzMove=targetId=>executeMove(targetId);

/* Kézzel rajzolt stratégiai körzetek: nem rács, hanem a falvak és ipari pontok köré simuló területek. */
const continentalVillageNames=['Fenyőliget','Kőpatak','Sárosrév','Nyárfalu','Vaserdő','Tölgyhát','Aranymező','Régi malom','Hídvége','Szélkapu','Lápfalu','Rónaőrs','Borókás','Kisvár','Tópart','Folyóköz'];
const continentalIndustryNames=['Központi üzem','Déli finomító','Északi depó','Vasúti csomópont','Külső gyárkapu','Raktárnegyed','Energiaudvar','Hajógyári öv'];
const continentalMineNames=['Gránit-bánya','Fekete ércmező','Holló-kőfejtő','Vasgerinc','Északi akna','Mélységi bánya','Kvarc-völgy','Peremi tárna'];
const continentalOilNames=['Delta olajmező','Keleti olajtorony','Sivatagi fúróhely','Folyóparti kút','Vörös homok olajmező','Külső vezeték','Bíbor olajmező','Hajnal-fúrás'];
function continentalTerrain(col,row){
  const bridge=(col===7&&[2,5,7].includes(row))||(col===14&&[2,5,8].includes(row))||(row===7&&[4,10,17].includes(col));
  const pass=(row===1&&[3,7,11,15,18].includes(col))||(col===17&&[2,5,8,11].includes(row));
  if(bridge)return {kind:'bridge',passable:true};
  if(pass)return {kind:'pass',passable:true};
  if((row===1&&col>0&&col<19)||(col===17&&row>1&&row<13))return {kind:'mountain',passable:false};
  if((col===7&&row>1&&row<11)||(col===14&&row>1&&row<12)||(row===7&&col>1&&col<18))return {kind:'river',passable:false};
  if((row===0&&col<3)||(row===9&&col<2)||(col===0&&row>10)||(col===19&&row<2))return {kind:'water',passable:false};
  return {kind:'land',passable:true};
}
function continentalSite(col,row){
  const key=(col*17+row*11)%19;
  if((col*3+row)%6===0||key===14)return {resource:'food',name:continentalVillageNames[(col*3+row)%continentalVillageNames.length]};
  if(key===0||key===12)return {resource:'metal',name:continentalMineNames[(col+row)%continentalMineNames.length]};
  if(key===3||key===8)return {resource:'oil',name:continentalOilNames[(col*2+row)%continentalOilNames.length]};
  if(key===5||key===15)return {resource:'tech',name:continentalIndustryNames[(col+row*2)%continentalIndustryNames.length]};
  if(key===11||key===18)return {resource:'energy',name:'Energiaállomás '+(col+row)};
  return {resource:'terrain',name:(col+row)%4===0?'Nyílt síkság':(col+row)%4===1?'Semleges határvidék':(col+row)%4===2?'Erdei átkelő':'Kopár mező'};
}
const strategicPoints=[
  ['terra','Terra-Prime főváros',7,55,6.4,10.8,2,'energy','human',true],['kikoto','Kikötői öv',17,48,5.5,8.0,1,'tech'],['delta','Delta-állomás',17,67,5.8,8.6,3,'food'],['fenyo','Fenyőliget',27,31,5.4,7.7,0,'food'],['vasgerinc','Vasgerinc bánya',30,48,6.0,8.3,1,'metal'],['hidnyugat','Nyugati hídállás',36,57,4.8,7.6,2,'terrain',null,false,'bridge'],['hago','Északi hágó',40,28,5.0,7.1,3,'terrain',null,false,'pass'],['folyopart','Folyóparti kút',39,42,5.6,8.0,0,'oil'],['kopatak','Kőpatak falu',45,55,5.2,7.7,3,'food'],['kozbanya','Központi bánya',51,45,6.2,9.0,1,'metal'],['iparnegyed','Iparnegyed',57,58,6.0,8.4,2,'tech'],['aranymezo','Aranymező',49,70,5.6,8.1,0,'food'],['delifin','Déli finomító',61,74,5.8,8.6,3,'oil'],['vasut','Vasúti csomópont',64,48,5.7,8.0,1,'tech'],['kozpontihid','Központi híd',68,57,4.8,7.5,2,'terrain',null,false,'bridge'],['sarkihaz','Sarki hágó',68,28,5.1,7.1,0,'terrain',null,false,'pass'],['eszakidepo','Északi depó',75,39,5.7,8.0,3,'tech'],['viharvolgy','Viharvölgy',76,57,5.5,8.1,1,'energy'],['olajmezo','Bíbor olajmező',80,70,5.9,8.4,0,'oil'],['xenohid','Keleti hídállás',82,52,4.9,7.4,2,'terrain',null,false,'bridge'],['xenofalu','Rohamosztag telep',89,44,5.6,8.0,1,'food'],['xenobazis','Xeno dominion',94,56,6.5,10.8,3,'tech','alien',true],['xenolegikikoto','Légiflotta fészek',91,70,5.7,8.1,0,'energy'],
  ['nyugat1','Déli őrtorony',9,79,5.1,7.1,1,'terrain'],['nyugat2','Mocsári falu',25,79,5.3,7.8,2,'food'],['nyugat3','Holló-kőfejtő',36,80,5.6,8.0,0,'metal'],['kozepdel','Szélmalom-major',45,86,5.3,7.7,3,'food'],['sivatag','Külső vezeték',57,87,5.8,8.0,1,'oil'],['keletdel','Hamuvölgy',72,84,5.4,7.8,2,'energy'],['xenodel','Peremi gyárkapu',85,84,5.8,8.0,0,'tech'],
  ['nyugateszak','Északnyugati falu',15,20,5.2,7.6,2,'food'],['hegylanc','Gránit-hegylánc',31,18,5.4,7.7,1,'metal'],['torony','Rádiótorony',53,19,5.0,7.4,3,'energy'],['kozepeszak','Kereskedőváros',59,31,5.9,8.2,0,'tech'],['xenoeszak','Idegen őrhely',84,22,5.4,7.7,2,'food'],
  ['part1','Nyugati partvidék',4,40,5.0,7.5,0,'terrain'],['part2','Tengeröböl',4,70,5.0,7.5,3,'terrain'],['keletpart1','Keleti őrvidék',96,32,4.8,7.3,1,'terrain'],['keletpart2','Fekete-part',97,78,4.8,7.3,2,'terrain']
];
const strategicLinks=[
  ['terra','kikoto'],['terra','delta'],['terra','part1'],['terra','part2'],['kikoto','fenyo'],['kikoto','vasgerinc'],['delta','nyugat1'],['delta','nyugat2'],['fenyo','hago'],['fenyo','vasgerinc'],['vasgerinc','hidnyugat'],['hidnyugat','folyopart'],['hidnyugat','kopatak'],['hago','folyopart'],['hago','hegylanc'],['folyopart','kopatak'],['folyopart','kozbanya'],['kopatak','kozbanya'],['kopatak','aranymezo'],['kozbanya','iparnegyed'],['kozbanya','kozepeszak'],['iparnegyed','aranymezo'],['iparnegyed','vasut'],['iparnegyed','delifin'],['aranymezo','nyugat3'],['aranymezo','kozepdel'],['delifin','sivatag'],['delifin','keletdel'],['vasut','kozpontihid'],['vasut','sarkihaz'],['kozpontihid','viharvolgy'],['kozpontihid','eszakidepo'],['sarkihaz','eszakidepo'],['sarkihaz','xenoeszak'],['eszakidepo','viharvolgy'],['eszakidepo','xenofalu'],['viharvolgy','olajmezo'],['viharvolgy','xenohid'],['olajmezo','xenolegikikoto'],['olajmezo','keletdel'],['xenohid','xenofalu'],['xenohid','xenobazis'],['xenofalu','xenobazis'],['xenobazis','xenolegikikoto'],['xenolegikikoto','xenodel'],['nyugat1','nyugat2'],['nyugat2','nyugat3'],['nyugat3','kozepdel'],['kozepdel','sivatag'],['sivatag','keletdel'],['keletdel','xenodel'],['nyugateszak','fenyo'],['nyugateszak','part1'],['hegylanc','hago'],['hegylanc','torony'],['torony','kozepeszak'],['kozepeszak','sarkihaz'],['xenoeszak','keletpart1'],['xenoeszak','xenofalu'],['part1','nyugateszak'],['part2','nyugat1'],['keletpart1','xenoeszak'],['keletpart2','xenodel']
];
function createGrid(){
  const grid=strategicPoints.map(([id,name,x,y,w,h,shape,resource,owner=null,isBase=false,terrain='land'],index)=>({id,name,x,y,w,h,shape,resource,owner:owner||'neutral',isBase,productive:resource!=='terrain',bunker:Boolean(isBase),watchtower:false,passable:true,terrain,links:[],unit:isBase?unitFor(owner,index,owner==='human'?'infantry':'alien'):unitFor('neutral',index,'mercenary')}));
  const byId=new Map(grid.map(point=>[point.id,point]));
  strategicLinks.forEach(([a,b])=>{byId.get(a)?.links.push(b);byId.get(b)?.links.push(a)});
  state.grid=grid;
  state.grid=grid;state.selected=null;state.turn=1;state.log=[];state.sectorUpgrades={};state.modal=null;state.aiInProgress=false;state.aiActive=null;state.aiTarget=null;state.combatFlashes=[];state.moveFlash=null;state.combatInProgress=false;state.finished=false;state.base=emptyBase();state.aiBase=emptyBase();state.aiResources={metal:1240,energy:410,food:530,oil:860,tech:320};
  addLog('A frontot kézzel kialakított stratégiai körzetek alkotják. A falvak és ipari pontok között csak a kijelölt útvonalakon mozoghatsz.');
  addLog('Mindkét főváros bunkerrel indul. Új egység csak bunkerrel rendelkező saját szektorba telepíthető.');
}
function neighbors(sector){return (sector?.links||[]).map(id=>state.grid.find(x=>x.id===id)).filter(Boolean)}
function isVisible(sector){
  if(sector.owner===state.faction)return true;
  const own=state.grid.filter(point=>point.owner===state.faction);
  return own.some(point=>point.links?.includes(sector.id)||point.watchtower&&neighbors(point).some(adjacent=>adjacent.links?.includes(sector.id)));
}
function resourceLabel(key){return ({metal:'⛏ BÁNYA',energy:'ϟ ENERGIA',food:'◌ FALU',oil:'◉ OLAJMEZŐ',tech:'◈ IPARI KÖRZET',terrain:'· SEMLEGES TERÜLET'})[key]||key.toUpperCase()}
renderMaps();renderDifficulty();

/* 2.7: bunker-szabályok és elkülönített hangvezérlés. */
function sectorBuild(id){
  const sector=state.grid.find(s=>s.id===state.modal?.sectorId),build=sectorBuilds[id];
  if(!sector||!build)return;
  if(!['outpost','bunker'].includes(id)&&sector.resource!==build.key)return toast('A fejlesztés csak a hozzá tartozó lelőhelyen építhető.');
  const active=state.sectorUpgrades[sector.id]||[];
  if(active.includes(id))return;
  if(!pay(build.cost))return;
  state.sectorUpgrades[sector.id]=[...active,id];
  if(id==='outpost'){sector.watchtower=true;if(sector.unit)sector.unit.morale=Math.min(100,sector.unit.morale+10)}
  if(id==='bunker')sector.bunker=true;
  addLog(`${sector.name}: ${build.name} elkészült.`);renderModal();renderBattle();
}
function deployUnit(type){
  const target=state.grid.find(s=>s.id===(state.base.deploymentTarget||ownBase()?.id));
  if(!target||target.owner!==state.faction)return toast('Válassz saját célterületet.');
  if(!target.bunker)return toast('Új egységet csak bunkerrel rendelkező saját szektorba telepíthetsz.');
  if(!state.base.ready[type])return;
  const fresh=makeReadyUnit(type);
  if(target.unit?.side===state.faction){
    const before=target.unit.count;target.unit.count+=fresh.count;target.unit.composition={...(target.unit.composition||{})};
    Object.entries(fresh.composition||{[fresh.type]:fresh.count}).forEach(([unitType,count])=>{target.unit.composition[unitType]=(target.unit.composition[unitType]||0)+count});
    target.unit.morale=Math.min(100,Math.round((target.unit.morale*before+fresh.morale*fresh.count)/target.unit.count));
  }else target.unit=fresh;
  state.base.ready[type]--;addLog(`${unitSpecs[type].name} telepítve: ${target.name}.`);renderModal();renderBattle();
}
document.addEventListener('click',event=>{
  if(event.target.closest('#musicToggle')){event.stopImmediatePropagation();toggleMusic();return}
  if(event.target.closest('#fxToggle')){event.stopImmediatePropagation();toggleFx()}
},true);

/* További, a látványhoz rögzített falvak és stratégiai pontok: nem négyzetrács. */
const landmarkExpansion=[
 ['westharbor','Nyugati halászfalu',10,39,4.5,6.6,0,'food'],['westfarm','Búzamezők',13,59,4.6,6.6,1,'food'],['westmine','Parti kőfejtő',22,44,4.7,6.8,2,'metal'],['pinepass','Fenyves hágó',25,24,4.5,6.4,0,'terrain',null,false,'pass'],['furnace','Vaskohó',34,36,4.8,6.8,1,'tech'],['quarry','Szürke bánya',35,61,4.8,6.8,2,'metal'],['market','Központi piac',47,46,4.8,6.7,1,'food'],['windfarm','Szélfarm',49,58,4.5,6.5,2,'energy'],['southbridge','Déli híd',47,78,4.3,6.2,3,'terrain',null,false,'bridge'],['saltmine','Sógerinc bánya',55,37,4.7,6.7,0,'metal'],['fueldepot','Üzemanyag-depó',57,48,4.8,6.8,1,'oil'],['railvillage','Vasúti falu',56,65,4.6,6.5,2,'food'],['radiostation','Rádióállomás',67,40,4.5,6.5,3,'energy'],['eastquarry','Keleti kőfejtő',72,48,4.8,6.7,1,'metal'],['farmside','Tanyavilág',69,75,4.7,6.6,2,'food'],['redwell','Vörös olajkút',77,48,4.7,6.7,3,'oil'],['xenotower','Xeno figyelő',81,33,4.5,6.5,0,'tech'],['crater','Krátermező',82,61,4.7,6.7,1,'terrain'],['mire','Fekete mocsár',84,73,4.7,6.6,2,'food'],['alienforge','Xeno műhely',91,62,4.8,6.8,2,'tech'],['portcity','Délnyugati kikötő',12,89,4.7,6.7,2,'tech'],['coastmine','Déli parti bánya',24,88,4.7,6.7,0,'metal'],['southernfarm','Délnyugati major',31,90,4.7,6.7,3,'food'],['drywell','Sivatagi fúrás',52,91,4.7,6.7,0,'oil'],['southenergy','Déli erőmű',65,91,4.7,6.7,1,'energy'],['eastport','Délkeleti ipari kikötő',78,91,4.8,6.8,2,'tech'],['aliencoast','Xeno partszakasz',91,91,4.7,6.7,3,'terrain'],['northwest','Északnyugati falu',8,15,4.6,6.6,0,'food'],['northeast','Északkeleti őrhely',92,16,4.6,6.6,1,'tech']
];
strategicPoints.push(...landmarkExpansion);
strategicLinks.push(['terra','westharbor'],['terra','westfarm'],['westharbor','westmine'],['westmine','pinepass'],['pinepass','fenyo'],['westmine','furnace'],['furnace','folyopart'],['furnace','quarry'],['quarry','hidnyugat'],['market','folyopart'],['market','kozbanya'],['market','windfarm'],['windfarm','iparnegyed'],['windfarm','southbridge'],['southbridge','aranymezo'],['saltmine','kozbanya'],['saltmine','fueldepot'],['fueldepot','iparnegyed'],['fueldepot','railvillage'],['railvillage','delifin'],['radiostation','vasut'],['radiostation','eastquarry'],['eastquarry','viharvolgy'],['eastquarry','redwell'],['farmside','keletdel'],['redwell','xenohid'],['redwell','xenobazis'],['xenotower','eszakidepo'],['xenotower','xenoeszak'],['crater','olajmezo'],['crater','alienforge'],['mire','xenolegikikoto'],['mire','xenodel'],['alienforge','xenolegikikoto'],['portcity','part2'],['portcity','coastmine'],['coastmine','delta'],['coastmine','southernfarm'],['southernfarm','kozepdel'],['drywell','sivatag'],['drywell','southenergy'],['southenergy','keletdel'],['southenergy','eastport'],['eastport','xenodel'],['eastport','aliencoast'],['aliencoast','xenodel'],['northwest','nyugateszak'],['northwest','part1'],['northeast','xenoeszak'],['northeast','keletpart1']);
const borderLandmarks=[
 ['baywatch','Öbölőr állás',7,28,4.4,6.4,1,'terrain'],['orchard','Gyümölcsöskert',18,35,4.6,6.6,2,'food'],['mill','Régi vízimalom',28,56,4.5,6.5,3,'food'],['gravel','Sóderbánya',41,25,4.6,6.6,0,'metal'],['relay','Adótorony',46,22,4.4,6.4,1,'energy'],['canal','Csatornaátkelő',58,55,4.3,6.2,2,'terrain',null,false,'bridge'],['ruins','Romvárosi körzet',63,62,4.8,6.8,3,'tech'],['reservoir','Víztározó',73,30,4.5,6.5,0,'energy'],['ashpit','Hamugödör',79,80,4.5,6.5,1,'terrain'],['nest','Idegen fészek',88,27,4.8,6.8,2,'tech'],['outlands','Külső határvidék',93,72,4.6,6.6,3,'terrain'],['refuge','Menekültfalu',20,69,4.6,6.6,0,'food']
];
strategicPoints.push(...borderLandmarks);
strategicLinks.push(['baywatch','westharbor'],['baywatch','nyugateszak'],['orchard','westmine'],['orchard','fenyo'],['mill','vasgerinc'],['mill','quarry'],['gravel','hago'],['gravel','oldroad'],['relay','torony'],['relay','saltmine'],['canal','iparnegyed'],['canal','ruins'],['ruins','delifin'],['ruins','railvillage'],['reservoir','eszakidepo'],['reservoir','xenotower'],['ashpit','keletdel'],['ashpit','mire'],['nest','xenoeszak'],['nest','xenofalu'],['outlands','xenolegikikoto'],['outlands','aliencoast'],['refuge','delta'],['refuge','nyugat2']);

/* Nehézségenként eltérő, frontvonalat építő AI: a jövedelmező célokat és több támadási irányt rangsorolja. */
function aiFrontScore(from,target,enemy,usedTargets){
  const resourceValue={metal:18,energy:16,food:14,oil:22,tech:26,terrain:5}[target.resource]||5;
  const playerPressure=target.owner===state.faction?72:target.owner==='neutral'?34:0;
  const defender=(target.unit?.count||0)/42;
  const morale=(target.unit?.morale||70)/8;
  const enemySupport=neighbors(target).filter(point=>point.owner===enemy).length*9;
  const playerSupport=neighbors(target).filter(point=>point.owner===state.faction).length*7;
  const bunkerBonus=target.bunker?8:0;
  const spreadPenalty=usedTargets.has(target.id)?46:0;
  const baseRisk=from.isBase&&neighbors(from).filter(point=>point.owner!==enemy).length>1?13:0;
  return resourceValue+playerPressure+enemySupport-playerSupport-defender-morale-bunkerBonus-spreadPenalty-baseRisk;
}
async function aiTurn(){
  const enemy=enemyOf(state.faction),ai=difficulties[state.difficulty];state.aiInProgress=true;
  if(ai.tempo===0){addLog('A gyakorló AI termel, őrzi a központját és nem indít támadást.');state.aiInProgress=false;renderBattle();return}
  const usedTargets=new Set(),steps=ai.tempo;
  for(let step=0;step<steps;step++){
    const candidates=state.grid.filter(from=>from.unit?.side===enemy&&!hasMoved(from.unit)).flatMap(from=>neighbors(from).filter(target=>target.owner!==enemy).map(target=>({from,target,score:aiFrontScore(from,target,enemy,usedTargets)}))).sort((a,b)=>b.score-a.score);
    const action=candidates.find(item=>!usedTargets.has(item.target.id))||candidates[0];if(!action)break;
    const {from,target}=action;usedTargets.add(target.id);state.aiActive=from.id;state.aiTarget=target.id;
    addLog(`Ellenséges frontmozgás: ${from.name} → ${target.name}.`);renderBattle();await pause(820);
    const defender=target.unit?.count||0;
    const confidence=from.unit.count*ai.army/(Math.max(1,defender));
    const threshold=state.difficulty==='easy'?.42:state.difficulty==='medium'?.34:.28;
    if(from.unit&&confidence>=threshold){
      if(target.unit)await resolveConflict(from,target,ai.army);
      else{playMoveSound(from.unit);flashMove(from,target,enemy,'advance');await pause(620);from.unit.movedTurn=state.turn;target.owner=enemy;target.unit=from.unit;from.unit=null;addLog(`Ellenség biztosította: ${target.name}.`);renderBattle()}
    }else addLog(`Ellenség visszatartja az alakulatát: ${from.name}.`);
    state.aiActive=null;state.aiTarget=null;renderBattle();await pause(420);
  }
  state.aiInProgress=false;renderBattle();
}

/* 3.3 — érvényes, kézzel elhelyezett kontinens-körzetek. */
function createGrid(){
  state.visualTerritoryGridReady=false;
  state.territoryRegionBySector={};
  const grid=terrainTerritories.map(([id,name,x,y,w,h,shape,resource,owner=null,isBase=false,terrain='land'],index)=>({
    id,name,x,y,w,h,shape,resource,owner:owner||'neutral',isBase,
    productive:resource!=='terrain',bunker:Boolean(isBase),watchtower:false,passable:true,terrain,links:[],
    unit:isBase?unitFor(owner,index,owner==='human'?'infantry':'alien'):unitFor('neutral',index,'mercenary')
  }));
  const byId=new Map(grid.map(point=>[point.id,point]));
  territoryLinks.forEach(([a,b])=>{byId.get(a)?.links.push(b);byId.get(b)?.links.push(a)});
  state.grid=grid;state.selected=null;state.turn=1;state.log=[];state.sectorUpgrades={};state.modal=null;
  state.aiInProgress=false;state.aiActive=null;state.aiTarget=null;state.combatFlashes=[];state.moveFlash=null;
  state.combatInProgress=false;state.finished=false;state.base=emptyBase();state.aiBase=emptyBase();
  state.aiResources={metal:1240,energy:410,food:530,oil:860,tech:320};
  addLog('A teljes kontinens kézzel kijelölt, terephez illesztett stratégiai körzetekből áll.');
  addLog('A semleges körzeteket zsoldosok védik; mindkét főváros bunkerrel indul.');
}
function isVisible(){return true}

/* 3.5 — a ténylegesen használt részleges csapatparancs. */
/* A két kiinduló bunker a látványképen látható két szélső fővárosra kerül. */
Object.assign(terrainTerritories.find(s=>s[0]==='human-capital'),{2:7.2,3:34.5,4:7.0,5:8.0});
Object.assign(terrainTerritories.find(s=>s[0]==='xeno-capital'),{2:92.5,3:21.5,4:7.0,5:8.0});
function mergeDetachment(home,detachment){if(!detachment?.count)return;if(!home.unit){home.unit=detachment;return}const before=home.unit.count,total=before+detachment.count;home.unit.composition={...(home.unit.composition||{})};Object.entries(detachment.composition||{[detachment.type]:detachment.count}).forEach(([type,count])=>home.unit.composition[type]=(home.unit.composition[type]||0)+count);home.unit.count=total;home.unit.morale=Math.min(100,Math.round((home.unit.morale*before+detachment.morale*detachment.count)/total))}
function takeDetachment(unit,share){const wanted=Math.max(1,Math.round(unit.count*share)),source=unit.composition||{[unit.type]:unit.count},picked={};let remaining=wanted;Object.entries(source).sort((a,b)=>b[1]-a[1]).forEach(([type,count])=>{if(!remaining)return;const take=Math.min(count,remaining);picked[type]=take;source[type]=count-take;if(!source[type])delete source[type];remaining-=take});unit.composition=source;unit.count=Object.values(source).reduce((sum,count)=>sum+count,0);const type=Object.entries(picked).sort((a,b)=>b[1]-a[1])[0]?.[0]||unit.type;return {side:unit.side,type,morale:unit.morale,count:wanted,composition:picked,movedTurn:state.turn}}
function ensureMoveShareLayer(){if(document.querySelector('#moveShareLayer'))return;const layer=document.createElement('div');layer.id='moveShareLayer';layer.className='choice-layer move-share-layer';layer.setAttribute('aria-hidden','true');layer.innerHTML='<section class="choice-card"><span class="choice-icon">➜</span><h2>Mekkora alakulat induljon?</h2><p id="moveShareText"></p><div class="move-share-options"><button data-move-share=".25">25%</button><button data-move-share=".5">50%</button><button data-move-share=".75">75%</button><button class="confirm" data-move-share="1">100%</button></div><button class="move-cancel" data-cancel-move>MÉGSEM</button></section>';document.body.append(layer)}
function askMoveShare(targetId){const from=state.grid.find(s=>s.id===state.selected),target=state.grid.find(s=>s.id===targetId);if(!from?.unit||from.unit.side!==state.faction||!target)return;if(hasMoved(from.unit)){toast('Ez az alakulat már mozgott ebben a körben.');return}if(!neighbors(from).some(s=>s.id===target.id)){toast('Csak kapcsolódó szektorba adhatsz parancsot.');return}if(target.unit?.side===state.faction){askMerge(from,target);return}ensureMoveShareLayer();state.pendingMove={fromId:from.id,targetId};$('#moveShareText').textContent=`${from.name} · ${from.unit.count.toLocaleString('hu-HU')} fő / egység. A kiválasztott rész indul ${target.name} felé.`;$('#moveShareLayer').classList.add('open');$('#moveShareLayer').setAttribute('aria-hidden','false')}
function closeMoveShare(){state.pendingMove=null;$('#moveShareLayer')?.classList.remove('open');$('#moveShareLayer')?.setAttribute('aria-hidden','true')}
async function moveShare(share){const command=state.pendingMove;if(!command)return;const from=state.grid.find(s=>s.id===command.fromId),target=state.grid.find(s=>s.id===command.targetId);closeMoveShare();if(!from?.unit||!target)return;const detachment=takeDetachment(from.unit,share);if(!from.unit.count)from.unit=null;if(target.unit?.side&&target.unit.side!==state.faction){detachment.returnTo=from.id;from.unit=detachment;await resolveConflict(from,target);return}playMoveSound(detachment);flashMove(from,target,detachment.side,'advance');target.unit=detachment;target.owner=state.faction;state.selected=target.id;addLog(`${Math.round(share*100)}% alakulat elindult: ${from.name} → ${target.name}.`);renderBattle()}
function executeMove(targetId){askMoveShare(targetId)}
window.vzMove=targetId=>askMoveShare(targetId);
document.addEventListener('click',event=>{const share=event.target.closest('[data-move-share]');if(share){event.stopPropagation();moveShare(Number(share.dataset.moveShare));return}if(event.target.closest('[data-cancel-move]')){event.stopPropagation();closeMoveShare()}},true);
async function resolveConflict(from,target,aiMultiplier=1){if(state.combatInProgress||!from?.unit||!target?.unit)return;const attacker=from.unit,defender=target.unit;if(attacker.side===defender.side)return;const returnTo=attacker.returnTo&&state.grid.find(s=>s.id===attacker.returnTo);state.combatInProgress=true;attacker.movedTurn=state.turn;state.selected=attacker.side===state.faction?from.id:null;playMoveSound(attacker);flashMove(from,target,attacker.side,'collision');addLog(`${from.name}: az alakulat ütközik ${target.name} védőivel.`);renderBattle();await pause(720);if(!from.unit||!target.unit){state.combatInProgress=false;renderBattle();return}const power=combatPower(attacker,attacker.side)*aiMultiplier,defense=combatPower(defender,defender.side,true),favored=power>=defense*.92,defenderLoss=Math.max(1,Math.ceil(attacker.count*(favored?.24:.10))),attackerLoss=Math.max(1,Math.ceil(defender.count*(favored?.10:.20)));playAttackSound(attacker);applyCasualties(defender,defenderLoss);applyCasualties(attacker,attackerLoss);defender.morale=Math.max(0,defender.morale-(favored?27:12));attacker.morale=Math.max(0,attacker.morale-(favored?9:24));flashCasualtyEntries([{sectorId:target.id,loss:defenderLoss,side:defender.side},{sectorId:from.id,loss:attackerLoss,side:attacker.side,kind:'retaliation'}]);renderBattle();await pause(1180);if(defender.count===0||defender.morale===0){delete attacker.returnTo;target.unit=attacker.count?attacker:null;from.unit=null;target.owner=attacker.side;state.selected=attacker.side===state.faction?target.id:null;addLog(`${target.name} védői feladták: a szektor gazdát cserélt.`)}else if(returnTo){from.unit=null;delete attacker.returnTo;mergeDetachment(returnTo,attacker);state.selected=returnTo.id;addLog(`${target.name}: a leválasztott alakulat visszatért a kiinduló szektorba.`)}else if(attacker.count===0||attacker.morale===0){from.unit=null;state.selected=null;addLog(`${from.name}: a támadó alakulat feladta a támadást.`)}else addLog(`${target.name}: mindkét alakulat veszteséget szenvedett; a frontvonal tartja magát.`);state.combatInProgress=false;renderBattle()}

/* 4.0 — Egyetlen hiteles térképrendszer.
   A PNG fehér körvonalai adják a kattintható mezőket, azok szomszédságát,
   a kijelölés alakját és a mozgás útvonalait is. */
function buildTerritoryHitModel(image){
  const source=document.createElement('canvas');
  source.width=image.naturalWidth;source.height=image.naturalHeight;
  const context=source.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
  const pixels=context.getImageData(0,0,source.width,source.height).data;
  const width=source.width,height=source.height,size=width*height,wall=new Uint8Array(size);
  for(let index=0;index<size;index++){
    const x=index%width,y=(index/width)|0;
    if(x<25||x>width-19||y<55||y>height-19){wall[index]=1;continue}
    if(!territoryPixelIsBoundary(pixels,index*4))continue;
    for(let yy=Math.max(0,y-4);yy<=Math.min(height-1,y+4);yy++)for(let xx=Math.max(0,x-4);xx<=Math.min(width-1,x+4);xx++)wall[yy*width+xx]=1;
  }
  const region=new Int32Array(size);region.fill(-1);
  const components=[],areas=[],queue=new Int32Array(size);let regionId=0;
  for(let start=0;start<size;start++){
    if(wall[start]||region[start]!==-1)continue;
    let head=0,tail=0,area=0,sumX=0,sumY=0,minX=width,minY=height,maxX=0,maxY=0;
    queue[tail++]=start;region[start]=regionId;
    while(head<tail){
      const current=queue[head++],x=current%width,y=(current/width)|0;
      area++;sumX+=x;sumY+=y;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
      const candidates=[current-1,current+1,current-width,current+width];
      for(const candidate of candidates){
        if(candidate<0||candidate>=size||wall[candidate]||region[candidate]!==-1)continue;
        const cx=candidate%width,cy=(candidate/width)|0;if(Math.abs(cx-x)+Math.abs(cy-y)!==1)continue;
        region[candidate]=regionId;queue[tail++]=candidate;
      }
    }
    areas.push(area);components.push({id:regionId,area,x:sumX/area,y:sumY/area,minX,minY,maxX,maxY});regionId++;
  }
  const valid=new Set(components.filter(item=>item.area>=760&&item.area<=72000).map(item=>item.id));
  /* A két színes városhatár nem fehér: a képre illesztett saját poligon
     ugyanúgy régióazonosítót kap, mint a többi körzet. */
  const cityOutlines=[
    {side:'human',points:[[30,296],[61,279],[82,285],[106,281],[132,286],[153,285],[174,302],[190,306],[193,322],[229,336],[240,364],[256,384],[236,415],[195,437],[159,448],[112,448],[68,424],[28,410]]},
    {side:'alien',points:[[1496,164],[1524,148],[1552,140],[1578,147],[1610,132],[1638,147],[1648,171],[1674,182],[1682,211],[1710,230],[1710,267],[1677,280],[1640,259],[1613,269],[1585,262],[1572,279],[1547,264],[1537,251],[1500,252],[1492,222]]}
  ];
  const inside=(x,y,points)=>{let hit=false;for(let a=0,b=points.length-1;a<points.length;b=a++){
    const p=points[a],q=points[b];if((p[1]>y)!==(q[1]>y)&&x<(q[0]-p[0])*(y-p[1])/(q[1]-p[1])+p[0])hit=!hit;
  }return hit};
  const cityIds={};
  cityOutlines.forEach(city=>{
    const id=components.length,minX=Math.max(0,Math.min(...city.points.map(p=>p[0]))),maxX=Math.min(width-1,Math.max(...city.points.map(p=>p[0]))),minY=Math.max(0,Math.min(...city.points.map(p=>p[1]))),maxY=Math.min(height-1,Math.max(...city.points.map(p=>p[1])));
    let area=0,sumX=0,sumY=0;for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++)if(inside(x+.5,y+.5,city.points)){
      region[y*width+x]=id;area++;sumX+=x;sumY+=y;
    }
    cityIds[city.side]=id;components.push({id,area,x:sumX/area,y:sumY/area,minX,minY,maxX,maxY});areas.push(area);valid.add(id);
  });
  /* The coastline and southern wetland break a few otherwise visible white
     outlines in the image. Bound those land patches explicitly so a tap on
     their village/oil illustration still selects an irregular map region. */
  const openLandOutlines=[
    {points:[[28,58],[255,58],[274,77],[294,110],[273,130],[229,135],[185,116],[146,125],[112,151],[28,150]],gateway:[270,137]},
    {points:[[28,192],[89,206],[140,193],[174,219],[173,260],[141,285],[95,282],[28,276]],gateway:[160,283]},
    {points:[[701,632],[748,616],[840,622],[874,656],[862,714],[811,739],[741,721],[694,679]],gateway:[836,610]},
    {points:[[880,612],[998,615],[1030,658],[1010,743],[931,762],[863,726]],gateway:[1008,606]}
  ];
  const extraGateways=[];
  openLandOutlines.forEach(({points,gateway})=>{
    const id=components.length,minX=Math.max(0,Math.min(...points.map(p=>p[0]))),maxX=Math.min(width-1,Math.max(...points.map(p=>p[0]))),minY=Math.max(0,Math.min(...points.map(p=>p[1]))),maxY=Math.min(height-1,Math.max(...points.map(p=>p[1])));
    let area=0,sumX=0,sumY=0;
    for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
      const index=y*width+x;
      if(wall[index]||valid.has(region[index])||!inside(x+.5,y+.5,points))continue;
      region[index]=id;area++;sumX+=x;sumY+=y;
    }
    if(area<500)return;
    components.push({id,area,x:sumX/area,y:sumY/area,minX,minY,maxX,maxY});areas.push(area);valid.add(id);extraGateways.push({id,x:gateway[0],y:gateway[1]});
  });
  const adjacency=new Map([...valid].map(id=>[id,new Set()]));
  const connect=(a,b)=>{if(a===b||!valid.has(a)||!valid.has(b))return;adjacency.get(a).add(b);adjacency.get(b).add(a)};
  /* A fehér vonal megvastagítása miatt a két oldali régiót a vonal két
     oldaláról mintavételezzük. Így nem a középpontok közelsége, hanem a
     tényleges közös határ dönti el, mely mezők szomszédok. */
  for(let y=61;y<height-25;y+=3)for(let x=31;x<width-25;x+=3){
    const center=y*width+x;if(!wall[center])continue;
    for(const d of [7,9,11,13]){
      connect(region[y*width+Math.max(0,x-d)],region[y*width+Math.min(width-1,x+d)]);
      connect(region[Math.max(0,y-d)*width+x],region[Math.min(height-1,y+d)*width+x]);
    }
  }
  /* A kikötői és idegen főváros a térkép szélén külön színnel körülhatárolt.
     Egyetlen, a képen látható szárazföldi kapun kapcsolódnak a frontvonalhoz. */
  const connectNearestCity=(side,gatewayX,gatewayY)=>{
    const id=cityIds[side],candidate=components.filter(cell=>valid.has(cell.id)&&cell.id!==id&&cell.id!==cityIds[side==='human'?'alien':'human']).sort((a,b)=>Math.hypot(a.x-gatewayX,a.y-gatewayY)-Math.hypot(b.x-gatewayX,b.y-gatewayY))[0];
    if(candidate)connect(id,candidate.id);
  };
  connectNearestCity('human',290,330);connectNearestCity('alien',1470,205);
  extraGateways.forEach(({id,x,y})=>{
    if(adjacency.get(id).size)return;
    const nearest=components.filter(cell=>valid.has(cell.id)&&cell.id!==id&&cell.id!==cityIds.alien).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
    if(nearest)connect(id,nearest.id);
  });
  return {width,height,region,areas,components,valid,adjacency,cityIds};
}

function regionNear(model,xPercent,yPercent,excluded){
  const cx=Math.round(model.width*xPercent/100),cy=Math.round(model.height*yPercent/100);
  for(let radius=0;radius<=110;radius+=3){
    for(let dy=-radius;dy<=radius;dy+=Math.max(3,radius||3))for(let dx=-radius;dx<=radius;dx+=Math.max(3,radius||3)){
      const x=Math.max(0,Math.min(model.width-1,cx+dx)),y=Math.max(0,Math.min(model.height-1,cy+dy)),id=model.region[y*model.width+x];
      if(model.valid.has(id)&&id!==excluded)return id;
    }
  }
  return model.components.filter(cell=>model.valid.has(cell.id)&&cell.id!==excluded).sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy))[0]?.id;
}

function territoryInfo(index){
  const terrain=['Fenyves határ','Nyílt legelő','Régi országút','Mocsári őrhely','Hegyi átjáró','Parti magaslat','Központi mezőség','Folyóőrség','Sziklás körzet'];
  const productive=[['Kereskedőfalu','food'],['Vasérc bánya','metal'],['Olajfúró telep','oil'],['Ipari romváros','tech'],['Energiaállomás','energy']];
  const slot=index%13;if([0,3,6,9,11].includes(slot))return productive[[0,3,6,9,11].indexOf(slot)];
  return [terrain[index%terrain.length],'terrain'];
}

function createVisualTerritoryGrid(model){
  if(state.visualTerritoryGridReady)return;
  const cells=model.components.filter(cell=>model.valid.has(cell.id)).sort((a,b)=>a.y-b.y||a.x-b.x);
  const humanRegion=model.cityIds.human,alienRegion=model.cityIds.alien;
  /* The resource sites are traced to the actual illustrated landmarks.
     A coordinate chooses the enclosed white outline containing that art;
     no empty grassland gets a production type from an index pattern. */
  const landmarks=[
    [239,110,'food','Északi falvak'],[335,100,'food','Folyóparti falu'],[459,145,'food','Északi telep'],
    [228,175,'food','Nyugati falu'],[94,243,'food','Parti falvak'],[664,216,'food','Fenyves falu'],
    [902,279,'food','Hegylábi falu'],[1366,290,'food','Keleti falvak'],[1231,386,'food','Átkelő falu'],
    [1554,470,'food','Keleti telep'],[1329,542,'food','Hídfő falu'],[1121,571,'food','Déli falu'],
    [892,471,'food','Központi falu'],[558,470,'food','Nyugati falu'],[194,666,'food','Parti telep'],
    [620,747,'food','Déli falvak'],[791,676,'food','Mocsári falu'],[1424,738,'food','Keleti falvak'],
    [1008,625,'food','Központi telep'],
    [467,231,'metal','Nyugati kőfejtő'],[699,433,'metal','Központi bánya'],[797,538,'metal','Déli bánya'],
    [1481,645,'metal','Keleti kőfejtő'],
    [588,336,'oil','Nyugati olajkút'],[1189,152,'oil','Északi olajmező'],[1175,485,'oil','Központi olajmező'],
    [951,710,'oil','Déli olajkút'],[538,659,'oil','Nyugati olajmező'],
    [437,310,'tech','Nyugati gyár'],[637,288,'tech','Kutatótelep'],[1202,236,'tech','Keleti gyár'],
    [1558,463,'tech','Keleti ipartelep'],
    [1021,379,'energy','Központi erőmű'],[1260,652,'energy','Déli energiaállomás']
  ];
  const landmarksByRegion=new Map();
  landmarks.forEach(([x,y,resource,name])=>{
    let regionId=-1;
    for(let radius=0;radius<=24&&regionId<0;radius+=3){
      for(const [dx,dy] of [[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius],[radius,radius],[-radius,radius]]){
        const px=Math.max(0,Math.min(model.width-1,x+dx)),py=Math.max(0,Math.min(model.height-1,y+dy));
        const id=model.region[py*model.width+px];
        if(model.valid.has(id)&&id!==humanRegion&&id!==alienRegion){regionId=id;break}
      }
    }
    if(regionId>=0&&!landmarksByRegion.has(regionId))landmarksByRegion.set(regionId,{name,resource,x,y});
  });
  const byRegion=new Map();
  const grid=cells.map((cell,index)=>{
    const terrainNames=['Fenyves határ','Nyílt legelő','Régi országút','Mocsári őrhely','Hegyi átjáró','Parti magaslat','Központi mezőség','Folyóőrség','Sziklás körzet'];
    const landmark=landmarksByRegion.get(cell.id),terrainName=terrainNames[index%terrainNames.length],owner=cell.id===humanRegion?'human':cell.id===alienRegion?'alien':'neutral',isBase=owner!=='neutral';
    const anchor=isBase?(owner==='human'?{x:8.2,y:37.8}:{x:91.2,y:22.7}):landmark?{x:landmark.x/model.width*100,y:landmark.y/model.height*100}:{x:cell.x/model.width*100,y:cell.y/model.height*100};
    const resource=isBase?(owner==='human'?'food':'tech'):(landmark?.resource||'terrain');
    const sector={id:`field-${cell.id}`,name:isBase?(owner==='human'?'Terra-Prime főváros':'Xeno dominion'):`${landmark?.name||terrainName} ${index+1}`,x:anchor.x,y:anchor.y,w:(cell.maxX-cell.minX)/model.width*100,h:(cell.maxY-cell.minY)/model.height*100,resource,owner,isBase,productive:resource!=='terrain',bunker:isBase,watchtower:false,passable:true,terrain:'land',links:[],regionId:cell.id,unit:isBase?unitFor(owner,index,owner==='human'?'infantry':'alien'):unitFor('neutral',index,'mercenary')};
    byRegion.set(cell.id,sector);return sector;
  });
  grid.forEach(sector=>{sector.links=[...(model.adjacency.get(sector.regionId)||[])].map(id=>byRegion.get(id)?.id).filter(Boolean)});
  /* Ritka képhiba esetén sem maradhat teljesen leválasztott körzet, de a
     tartalék kapcsolat csak a legközelebbi egyetlen szárazföldi régió. */
  grid.filter(sector=>!sector.links.length).forEach(sector=>{const near=grid.filter(other=>other!==sector).sort((a,b)=>Math.hypot(a.x-sector.x,a.y-sector.y)-Math.hypot(b.x-sector.x,b.y-sector.y))[0];if(near){sector.links=[near.id];if(!near.links.includes(sector.id))near.links.push(sector.id)}});
  state.grid=grid;state.territoryRegionBySector=Object.fromEntries(grid.map(sector=>[sector.id,sector.regionId]));state.selected=null;state.hoveredRegion=null;state.visualTerritoryGridReady=true;
  addLog(`${grid.length} valódi, fehér határvonallal körbezárt stratégiai mező aktív.`);
}

function paintTerritoryMap(canvas,model){
  const context=canvas.getContext('2d');context.clearRect(0,0,canvas.width,canvas.height);
  const selected=state.grid.find(sector=>sector.id===state.selected),selectedRegion=selected?.regionId,hovered=state.hoveredRegion;
  const ownerByRegion=new Map(state.grid.map(sector=>[sector.regionId,sector.owner]));
  const image=context.createImageData(model.width,model.height),rgba=image.data;
  for(let index=0;index<model.region.length;index++){
    const regionId=model.region[index];if(!model.valid.has(regionId))continue;
    const owner=ownerByRegion.get(regionId);let colour=null;
    if(regionId===selectedRegion)colour=owner==='alien'?[255,45,87,132]:owner==='human'?[30,174,255,132]:[255,205,70,126];
    else if(regionId===hovered)colour=[255,238,166,58];
    else if(owner==='human')colour=[25,150,235,35];
    else if(owner==='alien')colour=[236,45,82,35];
    if(!colour)continue;const offset=index*4;rgba[offset]=colour[0];rgba[offset+1]=colour[1];rgba[offset+2]=colour[2];rgba[offset+3]=colour[3];
  }
  context.putImageData(image,0,0);
}

function installTerritoryHitLayer(){
  const map=$('#sectorMap');if(!map)return;
  const layer=document.createElement('canvas');layer.className='territory-hit-layer';layer.setAttribute('aria-label','A fehér határvonalak valódi stratégiai mezői');map.prepend(layer);
  const regionFromEvent=event=>{
    const rect=layer.getBoundingClientRect(),model=state.territoryHitModel;if(!model)return -1;
    const x=Math.max(0,Math.min(model.width-1,Math.floor((event.clientX-rect.left)/rect.width*model.width))),y=Math.max(0,Math.min(model.height-1,Math.floor((event.clientY-rect.top)/rect.height*model.height))),direct=model.region[y*model.width+x];
    if(model.valid.has(direct))return direct;
    /* A vonal néhány pixeles, ezért a közvetlenül rá bökő játékosnak is
       a mellette fekvő valódi mezőt adjuk vissza. */
    for(let radius=2;radius<=8;radius+=2)for(const [dx,dy] of [[radius,0],[-radius,0],[0,radius],[0,-radius],[radius,radius],[-radius,-radius]]){
      const sx=Math.max(0,Math.min(model.width-1,x+dx)),sy=Math.max(0,Math.min(model.height-1,y+dy)),id=model.region[sy*model.width+sx];if(model.valid.has(id))return id;
    }
    return -1;
  };
  const bind=()=>{
    const model=state.territoryHitModel;if(!model)return;layer.width=model.width;layer.height=model.height;paintTerritoryMap(layer,model);
    layer.addEventListener('pointermove',event=>{const id=regionFromEvent(event);if(state.hoveredRegion===id)return;state.hoveredRegion=model.valid.has(id)?id:null;paintTerritoryMap(layer,model)});
    layer.addEventListener('pointerleave',()=>{state.hoveredRegion=null;paintTerritoryMap(layer,model)});
    layer.addEventListener('click',event=>{const id=regionFromEvent(event);if(!model.valid.has(id))return;const sector=state.grid.find(item=>item.regionId===id);if(!sector)return;event.preventDefault();event.stopPropagation();selectSector(sector.id)});
  };
  const ready=()=>{const first=!state.visualTerritoryGridReady;createVisualTerritoryGrid(state.territoryHitModel);if(first){renderBattle();return}bind()};
  if(state.territoryHitModel){ready();return}
  const image=new Image();image.onload=()=>{state.territoryHitModel=buildTerritoryHitModel(image);ready()};image.src='continent-territory-map-v1.png';
}

function selectSector(id){
  if(state.aiInProgress){toast('Az ellenség még végrehajtja a körét.');return}
  const sector=state.grid.find(item=>item.id===id);if(!sector)return;
  if(state.selected===id){
    if(sector.owner===state.faction){if(sector.isBase)openBaseModal();else openSectorModal(sector)}
    return;
  }
  /* A mezőre kattintás kizárólag kijelöl. Mozgást és támadást csak a külön
     megjelenő irányjelző indíthat, ezért többé nem ugrik fel véletlenül a
     fejlesztési ablak egy mozgási parancs helyett. */
  state.selected=id;renderBattle();
}

function renderSelection(){
  const sector=state.grid.find(item=>item.id===state.selected),el=$('#selectedUnit'),detail=$('#squadDetails');
  if(!sector){el.innerHTML='<span class="unit-symbol">◈</span><b>Válassz körzetet</b><small>A fehér vonallal határolt területre kattintva kijelölöd a valódi mezőt.</small>';if(detail)detail.innerHTML='<small>A kijelölt körzet és alakulat adatai itt jelennek meg.</small>';return}
  const ownerName=sector.owner==='human'?'Emberi terület':sector.owner==='alien'?'Idegen terület':'Semleges terület';
  if(!sector.unit||sector.unit.side!==state.faction){
    el.innerHTML=`<span class="unit-symbol">${sector.isBase?'▣':'◇'}</span><b>${sector.name}</b><small>${ownerName} · ${resourceLabel(sector.resource)}</small><div class="move-state">${sector.bunker?'▣ Bunker telepítve':sector.watchtower?'⌂ Őrtorony telepítve':'Kattints újra a saját mezőre a fejlesztésekhez.'}</div>`;
    if(detail)detail.innerHTML=`<b>${sector.name}</b><small>${ownerName.toUpperCase()}</small>${sector.unit?`<div class="field-garrison"><span>${typeName(sector.unit)}</span><b>${sector.unit.count.toLocaleString('hu-HU')}</b></div>`:'<p>Nincs látható alakulat.</p>'}`;return;
  }
  const unit=sector.unit,parts=Object.entries(unit.composition||{[unit.type]:unit.count}).filter(([,count])=>count>0),composition=parts.map(([type,count])=>`<span><i>${unitSpecs[type]?.badge||type}</i> ${count.toLocaleString('hu-HU')}</span>`).join(''),rows=parts.map(([type,count])=>`<div><img src="${unitSpecs[type]?.art||artFor(unit)}" alt=""/><span>${unitSpecs[type]?.name||type}</span><b>${count.toLocaleString('hu-HU')}</b></div>`).join('');
  el.innerHTML=`<img class="selected-art" src="${artFor(unit)}" alt=""/><span class="unit-symbol">${iconFor(unit)}</span><b>${typeName(unit)}</b><small>${sector.name} · ${unit.count.toLocaleString('hu-HU')} egység</small><div class="unit-composition"><strong>ALAKULAT ÖSSZETÉTELE</strong>${composition}</div><div class="move-state ${hasMoved(unit)?'spent':''}">${hasMoved(unit)?'✓ Már lépett ebben a körben':'↗ Válassz egy irányjelzőt a mozgáshoz'}</div><div class="status-line"><span>Alakulat létszáma</span><strong>${unit.count.toLocaleString('hu-HU')}</strong></div><div class="status-line"><span>Morál</span><strong>${unit.morale}/100</strong></div><div class="progress"><i style="width:${unit.morale}%;background:var(--cyan)"></i></div>`;
  if(detail)detail.innerHTML=`<b>${sector.name}</b><small>ÖSSZESEN: ${unit.count.toLocaleString('hu-HU')} EGYSÉG</small>${rows}`;
}

function arrowMarkup(from,target,enemy=false){
  const x=(from.x+target.x)/2,y=(from.y+target.y)/2,deg=Math.atan2(target.y-from.y,target.x-from.x)*180/Math.PI,attack=target.unit?.side&&target.unit.side!==from.unit?.side;
  if(enemy)return `<span class="move-arrow ai-route ${attack?'attack-route':''}" style="left:${x}%;top:${y}%;--rot:${deg}deg" aria-hidden="true"><span>${attack?'⚔':'➜'}</span></span>`;
  return `<button type="button" class="move-arrow ${attack?'attack-route':''}" data-move-target="${target.id}" onclick="event.preventDefault();event.stopPropagation();window.vzMove('${target.id}');return false;" style="left:${x}%;top:${y}%;--rot:${deg}deg" title="${attack?'Támadás':'Mozgás'}: ${target.name}" aria-label="${attack?'Támadás':'Mozgás'}: ${target.name}"><span>${attack?'⚔':'➜'}</span></button>`;
}

function renderBattle(){
  const own=state.faction,enemy=enemyOf(own),selected=state.grid.find(sector=>sector.id===state.selected),map=maps.find(item=>item.id===state.map);
  $('.planet-scene').style.setProperty('--map-image','url(continent-territory-map-v1.png)');
  $('.planet-scene').classList.toggle('snowfront',state.map==='snow');
  $('#battleMapName').textContent=(map?.name||'Terra-Prime')+' // STRATÉGIAI TÉRKÉP';$('#fogStatus').textContent=selected?`${selected.name} · ${resourceLabel(selected.resource)}`:'TELJES HADISZÍNTÉR';$('#turnValue').textContent=state.turn;
  $('#resourceBar').innerHTML=Object.entries(state.resources).map(([key,value])=>`<div class="resource"><small>${key.toUpperCase()}</small><b>${value}</b><i>+${resourceIncome(key)}</i></div>`).join('');
  const incomeNames={metal:'FÉM',energy:'ENERGIA',food:'ELLÁTMÁNY',oil:'OLAJ',tech:'TECHNOLÓGIA'};
  const incomePanel=document.querySelector('.resource-production');
  if(incomePanel)incomePanel.innerHTML=Object.keys(state.resources).map(key=>`<div><span>${incomeNames[key]}</span><b>+${resourceIncome(key)} / kör</b></div>`).join('');
  const markers=state.grid.map(sector=>{
    const active=state.selected===sector.id,showUnit=sector.unit&&(active||sector.isBase||sector.owner!=='neutral'),showLabel=active||sector.isBase||sector.productive;
    if(!showUnit&&!showLabel)return '';
    const guard=showUnit?`<span class="sector-guard ${sector.unit.side} type-${sector.unit.type} ${hasMoved(sector.unit)?'spent':''}" ${sector.unit.side===own?`data-select-unit="${sector.id}"`:''} title="${typeName(sector.unit)}"><img src="${artFor(sector.unit)}" alt="${typeName(sector.unit)}"/><b>${sector.unit.count.toLocaleString('hu-HU')}</b>${hasMoved(sector.unit)?'<em>✓</em>':''}</span>`:'';
    const installations=`${sector.bunker?'<span class="sector-install bunker" title="Bunker">▣</span>':''}${sector.watchtower?'<span class="sector-install tower" title="Őrtorony">⌂</span>':''}`;
    const label=showLabel?`<span class="sector-label"><strong>${sector.name}${sector.isBase?' ★':''}</strong><small>${resourceLabel(sector.resource)}</small></span>`:'';
    const flashes=(state.combatFlashes||[]).filter(item=>item.sectorId===sector.id).map(item=>`<span class="casualty ${item.side} ${item.kind||''}">−${item.loss.toLocaleString('hu-HU')}</span>`).join('');
    return `<button class="territory-token ${sector.owner} ${active?'selected':''} ${sector.isBase?'base-sector':''}" style="left:${sector.x}%;top:${sector.y}%" data-sector="${sector.id}" aria-label="${sector.name}">${guard}${flashes}${installations}${label}</button>`;
  }).join('');
  const arrows=selected?.unit?.side===own&&!hasMoved(selected.unit)&&!state.combatInProgress?neighbors(selected).map(target=>arrowMarkup(selected,target)).join(''):'';
  const aiArrow=state.aiActive&&state.aiTarget?arrowMarkup(state.grid.find(item=>item.id===state.aiActive),state.grid.find(item=>item.id===state.aiTarget),true):'';
  const moving=state.moveFlash?(()=>{const from=state.grid.find(item=>item.id===state.moveFlash.fromId),to=state.grid.find(item=>item.id===state.moveFlash.toId);if(!from||!to)return '';const distance=Math.hypot(to.x-from.x,to.y-from.y),angle=Math.atan2(to.y-from.y,to.x-from.x)*180/Math.PI;return `<span class="movement-trail ${state.moveFlash.side} ${state.moveFlash.kind||''}" style="left:${from.x}%;top:${from.y}%;width:${distance}%;--rot:${angle}deg"></span>`})():'';
  $('#sectorMap').innerHTML=markers+arrows+aiArrow+moving;installTerritoryHitLayer();renderSelection();
  const mine=state.grid.filter(sector=>sector.owner===own).length,theirs=state.grid.filter(sector=>sector.owner===enemy).length,neutral=state.grid.filter(sector=>sector.owner==='neutral').length;
  $('#battleStatus').innerHTML=`<b>${map?.name||'Terra-Prime'}</b><div class="status-line"><span>Saját szektorok</span><strong>${mine}</strong></div><div class="progress"><i style="width:${mine/state.grid.length*100}%"></i></div><div class="status-line"><span>Ellenséges szektorok</span><strong>${theirs}</strong></div><div class="progress red"><i style="width:${theirs/state.grid.length*100}%"></i></div><div class="status-line"><span>Zsoldos szektorok</span><strong>${neutral}</strong></div>`;
  $('#ownedList').innerHTML=state.grid.filter(sector=>sector.owner===own).map(sector=>`<button class="${hasMoved(sector.unit)?'spent':''}" data-sector="${sector.id}"><i></i>${sector.name}${sector.isBase?' ★':''}<span>${sector.unit?iconFor(sector.unit):'◆'}</span></button>`).join('');$('#eventLog').innerHTML=state.log.map(item=>`<p>${item}</p>`).join('');
}

function createGrid(){
  state.visualTerritoryGridReady=false;state.territoryRegionBySector={};state.hoveredRegion=null;state.territoryHitModel=null;
  /* Az aszinkron képfeldolgozás néhány ezredmásodpercéig ez a két jelző tartja
     életben a kezelőfelületet; utána kizárólag a fehér vonalas régiók maradnak. */
  state.grid=[{id:'loading-human',name:'Terra-Prime főváros',x:7.2,y:34.5,owner:'human',resource:'energy',isBase:true,bunker:true,watchtower:false,links:[],unit:unitFor('human',0,'infantry')},{id:'loading-alien',name:'Xeno dominion',x:92.3,y:20.5,owner:'alien',resource:'tech',isBase:true,bunker:true,watchtower:false,links:[],unit:unitFor('alien',1,'alien')}];
  state.selected=null;state.turn=1;state.log=[];state.sectorUpgrades={};state.modal=null;state.aiInProgress=false;state.aiActive=null;state.aiTarget=null;state.combatFlashes=[];state.moveFlash=null;state.combatInProgress=false;state.finished=false;state.base=emptyBase();state.aiBase=emptyBase();state.aiResources={metal:1240,energy:410,food:530,oil:860,tech:320};
  addLog('A fehér határvonalakkal rajzolt kontinens körzetei betöltés alatt.');addLog('Mindkét fél 1000 fős gyalogsággal és bunkerrel indul a saját fővárosában.');
}

async function resolveDetachedConflict(home,target,attacker,aiMultiplier=1){
  if(state.combatInProgress||!attacker?.count||!target?.unit)return false;
  const defender=target.unit;if(attacker.side===defender.side)return false;state.combatInProgress=true;attacker.movedTurn=state.turn;
  playMoveSound(attacker);flashMove(home,target,attacker.side,'collision');addLog(`${home.name}: az alakulat ütközik ${target.name} védőivel.`);renderBattle();await pause(720);
  const power=combatPower(attacker,attacker.side)*aiMultiplier,defense=combatPower(defender,defender.side,true),favored=power>=defense*.92,defenderBefore=defender.count;
  const defenderLoss=Math.max(1,Math.ceil(attacker.count*(favored?.24:.10))),attackerLoss=Math.max(1,Math.ceil(defenderBefore*(favored?.10:.20)));
  playAttackSound(attacker);applyCasualties(defender,defenderLoss);applyCasualties(attacker,attackerLoss);defender.morale=Math.max(0,defender.morale-(favored?27:12));attacker.morale=Math.max(0,attacker.morale-(favored?9:24));flashCasualtyEntries([{sectorId:target.id,loss:defenderLoss,side:defender.side},{sectorId:home.id,loss:attackerLoss,side:attacker.side,kind:'retaliation'}]);renderBattle();await pause(1550);
  const won=defender.count===0||defender.morale===0;
  if(won&&attacker.count){target.unit=attacker;target.owner=attacker.side;if(attacker.side===state.faction)state.selected=target.id;addLog(`${target.name} védői feladták: az előrenyomuló alakulat elfoglalta a körzetet.`)}
  else{if(attacker.count){mergeDetachment(home,attacker);home.unit.movedTurn=state.turn}if(attacker.side===state.faction)state.selected=home.id;addLog(`${target.name}: a támadás nem tört át, az alakulat visszatért és újra egyesült.`)}
  state.combatInProgress=false;renderBattle();return won;
}

async function moveShare(share){
  const command=state.pendingMove;if(!command)return;const from=state.grid.find(item=>item.id===command.fromId),target=state.grid.find(item=>item.id===command.targetId);closeMoveShare();if(!from?.unit||!target)return;
  const detachment=takeDetachment(from.unit,share);if(!from.unit.count)from.unit=null;
  if(target.unit?.side&&target.unit.side!==state.faction){await resolveDetachedConflict(from,target,detachment);return}
  playMoveSound(detachment);flashMove(from,target,detachment.side,'advance');await pause(650);
  if(target.unit?.side===state.faction)mergeDetachment(target,detachment);else target.unit=detachment;target.owner=state.faction;state.selected=target.id;addLog(`${Math.round(share*100)}% alakulat átvonult: ${from.name} → ${target.name}.`);renderBattle();
}

function selectUnit(id){selectSector(id)}

function reinforceEnemy(type){
  const enemy=enemyOf(state.faction),base=state.grid.find(sector=>sector.owner===enemy&&sector.isBase),targets=state.grid.filter(sector=>sector.owner===enemy&&sector.bunker).sort((a,b)=>(a.unit?.count||0)-(b.unit?.count||0)),target=targets[0]||base;if(!target)return;
  const fresh=unitFor(enemy,state.turn,type);if(target.unit?.side===enemy)mergeDetachment(target,fresh);else target.unit=fresh;addLog(`Ellenség telepít: ${unitSpecs[type].name} → ${target.name}.`);
}

async function aiTurn(){
  const enemy=enemyOf(state.faction),profile=difficulties[state.difficulty];state.aiInProgress=true;
  const frontline=state.grid.filter(sector=>sector.owner===enemy&&!sector.bunker&&neighbors(sector).some(next=>next.owner!==enemy));
  if(frontline.length&&state.turn>=3&&state.aiResources.metal>=160&&state.aiResources.energy>=90){const sector=frontline[0];state.aiResources.metal-=160;state.aiResources.energy-=90;sector.bunker=true;addLog(`Ellenség bunkert épített: ${sector.name}.`)}
  if(profile.tempo===0){addLog('A gyakorló AI gyárt, épít és a saját frontját védi.');state.aiInProgress=false;renderBattle();return}
  const usedTargets=new Set();
  for(let step=0;step<profile.tempo;step++){
    const candidates=state.grid.filter(from=>from.unit?.side===enemy&&!hasMoved(from.unit)&&from.unit.count>1).flatMap(from=>neighbors(from).filter(target=>target.owner!==enemy).map(target=>({from,target,score:aiFrontScore(from,target,enemy,usedTargets)}))).sort((a,b)=>b.score-a.score),action=candidates.find(item=>!usedTargets.has(item.target.id))||candidates[0];if(!action)break;
    const {from,target}=action;usedTargets.add(target.id);state.aiActive=from.id;state.aiTarget=target.id;addLog(`Ellenséges frontmozgás: ${from.name} → ${target.name}.`);renderBattle();await pause(760);
    if(!from.unit)continue;const share=state.difficulty==='easy'?.35:state.difficulty==='medium'?.55:.75,detachment=takeDetachment(from.unit,from.unit.count<700?1:share);if(!from.unit.count)from.unit=null;
    if(target.unit)await resolveDetachedConflict(from,target,detachment,profile.army);else{playMoveSound(detachment);flashMove(from,target,enemy,'advance');await pause(620);target.owner=enemy;target.unit=detachment;addLog(`Ellenség biztosította: ${target.name}.`);renderBattle()}
    state.aiActive=null;state.aiTarget=null;await pause(360);
  }
  state.aiInProgress=false;renderBattle();
}
