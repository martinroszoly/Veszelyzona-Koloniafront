/* V104 — a 3v3 hadszíntér garantáltan a normál pályaválasztóban jelenik meg. */
(function(){
  const id='island3v3';
  const colors={blue:'#32bfff',green:'#45d17a',yellow:'#ffd34f',purple:'#a56cff',red:'#ff4f58',pink:'#ff68c9'};
  const names={blue:'Kék',green:'Zöld',yellow:'Sárga',purple:'Lila',red:'Piros',pink:'Rózsaszín'};
  const defaults=[
    ['blue','A','player','human'],['green','A','ai','human'],['yellow','A','ai','human'],
    ['purple','B','ai','alien'],['red','B','ai','alien'],['pink','B','ai','alien']
  ];
  let map=maps.find(item=>item.id===id);
  if(!map){map={id,name:'Terra-Prime // 3v3 Kontinensfront',image:'assets/battlemap-grandfront-v28.png',text:'Hat kezdőbázis, nagy központi front és teljes 3v3 hadszíntér.',stats:['3v3','6 BÁZIS','3V3']};maps.push(map)}
  Object.assign(map,{name:'Terra-Prime // 3v3 Kontinensfront',image:'assets/battlemap-grandfront-v28.png',text:'Hat kezdőbázis, nagy központi front és teljes 3v3 hadszíntér.',stats:['3v3','6 BÁZIS','3V3']});
  state.teamSlots=state.teamSlots||defaults.map(([position,team,controller,race])=>({position,color:position,team,controller,race,difficulty:'medium'}));

  function options(list,value){return list.map(([key,label])=>`<option value="${key}" ${key===value?'selected':''}>${label}</option>`).join('')}
  function renderSlots(){
    const setup=document.querySelector('#setupView'),host=document.querySelector('#teamSetup');if(!setup||!host)return;
    setup.classList.toggle('setup-island3v3',state.map===id);if(state.map!==id)return;
    let panel=document.querySelector('#v104TeamSlots');if(!panel){panel=document.createElement('section');panel.id='v104TeamSlots';panel.className='v103-team-slots';host.append(panel)}
    const colorOptions=Object.keys(colors).map(key=>[key,names[key]]),difficultyOptions=Object.entries(difficulties).map(([key,item])=>[key,item.name]);
    panel.innerHTML=`<div class="v103-heading"><small>3V3 CSAPATBEÁLLÍTÁS</small><b>6 külön kezdőbázis</b></div><div class="v103-slot-grid">${state.teamSlots.map((slot,index)=>`<article class="v103-slot" style="--slot:${colors[slot.color]}"><header><i></i><strong>${slot.team}. SZÖVETSÉG · ${index%3+1}. CSAPAT</strong></header><div><label><span>IRÁNYÍTÁS</span><select data-v104="controller" data-index="${index}">${options([['player','Játékos'],['ai','AI'],['off','Kikapcsolva']],slot.controller)}</select></label><label><span>FAJ</span><select data-v104="race" data-index="${index}">${options([['human','Emberi'],['alien','Idegen']],slot.race)}</select></label><label><span>SZÍN</span><select data-v104="color" data-index="${index}">${options(colorOptions,slot.color)}</select></label><label><span>AI ERŐSSÉG</span><select data-v104="difficulty" data-index="${index}" ${slot.controller==='ai'?'':'disabled'}>${options(difficultyOptions,slot.difficulty)}</select></label></div></article>`).join('')}</div>`;
  }
  const previousRenderMaps=renderMaps;
  renderMaps=function(){previousRenderMaps();renderSlots()};
  document.addEventListener('change',event=>{
    const select=event.target.closest('[data-v104]');if(!select)return;
    const slot=state.teamSlots[+select.dataset.index],field=select.dataset.v104;if(!slot)return;
    if(field==='color'){const other=state.teamSlots.find((item,index)=>index!==+select.dataset.index&&item.color===select.value);if(other)other.color=slot.color}
    slot[field]=select.value;const local=state.teamSlots.find(item=>item.controller==='player');if(local){state.spawnColor=local.position;state.faction=local.race}renderSlots();
  });
  document.addEventListener('click',event=>{if(event.target.closest('[data-map]'))requestAnimationFrame(renderSlots)});

  /* A dedicated six-island silhouette: no extra tiles sit above it.  The
     regular territory layer remains clickable above these terrain pieces. */
  const style=document.createElement('style');
  style.textContent=`
    .planet-scene.island3v3{background:#04283a!important;overflow:hidden}
    .planet-scene.island3v3 .map-island{position:absolute;z-index:0;pointer-events:none;background-image:url('assets/battlemap-grandfront-v28.png');background-size:cover;background-repeat:no-repeat;filter:drop-shadow(0 8px 9px rgba(0,0,0,.6));opacity:.98}
    .planet-scene.island3v3 .map-island.center{left:20%;top:3%;width:60%;height:94%;background-position:center;clip-path:polygon(8% 3%,30% 0,54% 4%,78% 0,95% 9%,100% 30%,95% 50%,100% 70%,88% 94%,62% 100%,40% 95%,14% 100%,0 83%,4% 60%,0 39%)}
    .planet-scene.island3v3 .map-island.blue{left:-2%;top:3%;width:22%;height:27%;background-position:12% 20%;clip-path:polygon(5% 9%,38% 0,79% 6%,100% 32%,91% 76%,61% 100%,15% 90%,0 56%)}
    .planet-scene.island3v3 .map-island.green{left:-2%;top:36%;width:22%;height:27%;background-position:8% 50%;clip-path:polygon(8% 0,55% 3%,98% 23%,100% 70%,74% 100%,23% 92%,0 62%)}
    .planet-scene.island3v3 .map-island.yellow{left:-2%;top:70%;width:22%;height:27%;background-position:20% 80%;clip-path:polygon(5% 20%,33% 0,79% 10%,100% 45%,86% 90%,42% 100%,7% 79%)}
    .planet-scene.island3v3 .map-island.purple{right:-2%;top:3%;width:22%;height:27%;background-position:88% 18%;clip-path:polygon(9% 9%,42% 0,91% 10%,100% 49%,86% 85%,38% 100%,0 70%,3% 26%)}
    .planet-scene.island3v3 .map-island.red{right:-2%;top:36%;width:22%;height:27%;background-position:92% 48%;clip-path:polygon(16% 0,67% 6%,100% 34%,94% 77%,62% 100%,16% 93%,0 52%)}
    .planet-scene.island3v3 .map-island.pink{right:-2%;top:70%;width:22%;height:27%;background-position:87% 82%;clip-path:polygon(12% 8%,54% 0,95% 15%,100% 59%,77% 97%,31% 100%,0 67%)}
    .planet-scene.island3v3 .territory-hit-layer,.planet-scene.island3v3 .territory-token,.planet-scene.island3v3 .world-sector{z-index:5!important}
  `;
  document.head.appendChild(style);
  const battleRender=renderBattle;
  renderBattle=function(){battleRender();if(state.map!==id)return;const scene=document.querySelector('.planet-scene');if(!scene||scene.querySelector('.map-island'))return;['center','blue','green','yellow','purple','red','pink'].forEach(name=>{const island=document.createElement('i');island.className=`map-island ${name}`;scene.prepend(island)});};
})();
