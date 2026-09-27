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
  if(!map){map={id,name:'Terra-Prime // 3v3 Kontinensfront',image:'assets/terra-prime-3v3-preview-bg.svg',text:'Hat kezdőbázis, 237 stratégiai körzet és teljes 3v3 hadszíntér.',stats:['3v3','237 KÖRZET','6 FŐVÁROS']};maps.push(map)}
  Object.assign(map,{name:'Terra-Prime // 3v3 Kontinensfront',image:'assets/terra-prime-3v3-preview-bg.svg',text:'Hat kezdőbázis, 237 stratégiai körzet és teljes 3v3 hadszíntér.',stats:['3v3','237 KÖRZET','6 FŐVÁROS']});
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
})();
