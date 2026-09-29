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
  if(!map){map={id,name:'Terra-Prime // 3v3 Kontinensfront',image:'assets/terra-prime-3v3-clean-v2.webp',text:'Egybefüggő, hat bázisos hadszíntér: szabálytalan mezőkkel, pont- és vonalháló nélkül.',stats:['3v3','6 BÁZIS','3V3']};maps.push(map)}
  Object.assign(map,{name:'Terra-Prime // 3v3 Kontinensfront',image:'assets/terra-prime-3v3-clean-v2.webp',text:'Egybefüggő, hat bázisos hadszíntér: szabálytalan mezőkkel, pont- és vonalháló nélkül.',stats:['3v3','6 BÁZIS','3V3']});
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

  /* Egyetlen, teljes felbontású 3v3 hadszíntér. Nincsenek összeragasztott
     térképdarabok, valamint nincs pontokat összekötő útvonalháló. */
  const style=document.createElement('style');
  style.textContent=`
    .planet-scene.island3v3{background:#052637 url('assets/terra-prime-3v3-clean-v2.webp') center/100% 100% no-repeat!important;aspect-ratio:2048/1150!important;overflow:hidden;transform:none!important}
    .planet-scene.island3v3 .territory-hit-layer{z-index:5!important;image-rendering:auto!important}
    .planet-scene.island3v3 .territory-token{z-index:6!important}
    .planet-scene.island3v3 .resource-pin,.planet-scene.island3v3 .territory-token:not(.selected) .sector-label,.planet-scene.island3v3 .base-star{display:none!important}
  `;
  document.head.appendChild(style);
  /* A 3v3 mezői ugyanabból a kattintható régiómodellből készülnek, mint a
     többi pálya. Itt a közös határokat határozottan kirajzoljuk: nem pontok
     és nem útvonalvonalak, hanem egymáshoz érő szabálytalan körzetek. */
  const previousPaintTerritoryMap=paintTerritoryMap;
  paintTerritoryMap=function(canvas,model){
    previousPaintTerritoryMap(canvas,model);
    if(state.map!==id||!model?.region||!model?.valid)return;
    const ctx=canvas.getContext('2d'),w=model.width,h=model.height,regions=model.region,valid=model.valid;
    const image=ctx.getImageData(0,0,w,h),data=image.data;
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
      const at=y*w+x,current=regions[at];
      if(!valid.has(current))continue;
      const edge=(valid.has(regions[at+1])&&regions[at+1]!==current)||(valid.has(regions[at+w])&&regions[at+w]!==current);
      if(!edge)continue;
      for(const offset of [at,at+1,at+w]){const p=offset*4;data[p]=230;data[p+1]=241;data[p+2]=220;data[p+3]=145;}
    }
    ctx.putImageData(image,0,0);
  };
  const battleRender=renderBattle;
  renderBattle=function(){battleRender();if(state.map!==id)return;const scene=document.querySelector('.planet-scene');if(!scene)return;scene.querySelectorAll('.map-island').forEach(node=>node.remove());scene.style.transform='none';};
  /* A kísérleti zoom az egész vásznat széthúzta. A 3v3 pálya alapállapota
     ezért mindig a teljes, egyben látható térkép marad. */
  document.addEventListener('wheel',event=>{if(state.map===id&&event.target.closest?.('#sectorMap'))event.stopImmediatePropagation()},{capture:true,passive:true});
  document.addEventListener('touchmove',event=>{if(state.map===id&&event.target.closest?.('#sectorMap')&&event.touches.length>1)event.stopImmediatePropagation()},{capture:true,passive:true});
})();

/* V105 — a 3v3 saját földrajzi mezőmodellje. A mezők nem egy régi pálya
   képfeldolgozásából származnak: ugyanazon a hat-szigetes rajzon keletkeznek,
   amelyet a játékos lát és amelyen kattint. */
(function(){
  const MAP='island3v3';
  const priorInstall=installTerritoryHitLayer;
  const priorPaint=paintTerritoryMap;
  const priorRender=renderBattle;
  const W=1200,H=675;
  const inside=(x,y,p)=>{let hit=false;for(let a=0,b=p.length-1;a<p.length;b=a++){const A=p[a],B=p[b];if((A[1]>y)!==(B[1]>y)&&x<(B[0]-A[0])*(y-A[1])/(B[1]-A[1])+A[0])hit=!hit}return hit};
  const central=[[155,112],[235,48],[405,22],[620,30],[820,58],[1005,115],[1054,232],[1032,380],[955,525],[775,628],[553,654],[350,625],[190,540],[138,405],[145,258]];
  const islands=[
    [[15,55],[105,25],[160,55],[177,122],[149,184],[70,190],[20,147]],
    [[12,230],[77,197],[151,214],[181,283],[161,361],[75,378],[17,330]],
    [[18,461],[91,428],[158,450],[180,519],[145,618],[61,632],[15,574]],
    [[1028,55],[1110,23],[1182,49],[1194,143],[1152,189],[1073,178],[1031,123]],
    [[1029,221],[1115,194],[1188,224],[1198,317],[1157,373],[1077,360],[1024,301]],
    [[1026,460],[1108,430],[1182,456],[1192,550],[1150,628],[1066,616],[1024,555]]
  ];
  const bridgeRects=[[145,108,194,143],[142,270,194,304],[144,510,194,545],[1005,108,1053,143],[1003,270,1056,304],[1004,510,1056,545]];
  const pointOnLand=(x,y)=>inside(x,y,central)||islands.some(poly=>inside(x,y,poly))||bridgeRects.some(([x1,y1,x2,y2])=>x>=x1&&x<=x2&&y>=y1&&y<=y2);
  function seeded(x,y,label){return {x,y,label,id:-1}}
  function model3v3(){
    const size=W*H,blockedTerrain=new Uint8Array(size),region=new Int32Array(size);region.fill(-1);
    const seeds=[];
    const add=(x,y,label)=>{if(pointOnLand(x,y))seeds.push(seeded(x,y,label))};
    /* A hat főváros pontosan a hat külső szigeten áll. */
    const capitals=[['blue',92,106],['green',90,286],['yellow',92,532],['purple',1109,106],['red',1112,286],['pink',1110,532]];
    capitals.forEach(([color,x,y])=>add(x,y,{name:color+' főváros',resource:'terrain',base:color}));
    const landmarkData=[
      [270,115,'Északi falvak','food'],[380,93,'Havas kőfejtő','metal'],[510,100,'Szélfarm','energy'],[650,112,'Felső olajmező','oil'],[790,112,'Vasútváros','food'],[905,135,'Északi gyártelep','tech'],
      [245,205,'Folyóparti falu','food'],[375,195,'Központi bánya','metal'],[515,205,'Erdőőrs','terrain'],[665,208,'Kutatóállomás','tech'],[815,205,'Keleti kútsor','oil'],[930,225,'Hegyháti falu','food'],
      [236,310,'Régi hídfő','terrain'],[355,300,'Kővölgyi telep','food'],[490,305,'Ipari romváros','tech'],[625,308,'Központi erőmű','energy'],[760,310,'Zöldmező falu','food'],[900,320,'Keleti kőfejtő','metal'],
      [240,415,'Déli falvak','food'],[370,410,'Mocsári olajtorony','oil'],[505,410,'Központi tábor','terrain'],[635,410,'Acélgyár','tech'],[770,418,'Ártéri falu','food'],[910,425,'Keleti generátor','energy'],
      [270,520,'Parti halászfalu','food'],[395,520,'Déli bánya','metal'],[530,520,'Régi országút','terrain'],[670,522,'Déli olajkút','oil'],[805,522,'Delta-ipartelep','tech'],[920,520,'Keleti kikötő','food'],
      [420,590,'Fenyvesi falu','food'],[560,585,'Mélyfúrás','oil'],[705,585,'Déli erőtelep','energy'],[840,575,'Hegyoldali bánya','metal']
    ];
    landmarkData.forEach(([x,y,name,resource])=>add(x,y,{name,resource}));
    /* Ritkább, nagyobb, szabálytalan üres körzetek: nincs apró négyzetrács. */
    for(let row=0;row<8;row++)for(let col=0;col<12;col++){
      const x=205+col*65+Math.sin(row*7.1+col*3.7)*15,y=65+row*67+Math.cos(row*4.7+col*9.2)*14;
      if(pointOnLand(x,y)&&!seeds.some(s=>Math.hypot(s.x-x,s.y-y)<43))add(x,y,null);
    }
    islands.forEach((poly,index)=>{for(let n=0;n<7;n++){const x=(index<3?35:1050)+(n%3)*38+Math.sin(n*4.9+index)*9,y=(index%3)*210+62+Math.floor(n/3)*46+Math.cos(n*3.1+index)*8;if(pointOnLand(x,y)&&!seeds.some(s=>Math.hypot(s.x-x,s.y-y)<32))add(x,y,null)}});
    bridgeRects.forEach((r,n)=>add((r[0]+r[2])/2,(r[1]+r[3])/2,{name:'Hídátkelő '+(n+1),resource:'terrain',bridge:true}));
    seeds.forEach((s,i)=>s.id=i);
    const cells=seeds.map(s=>({id:s.id,x:s.x,y:s.y,minX:W,minY:H,maxX:0,maxY:0,area:0}));
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const at=y*W+x;if(!pointOnLand(x+.5,y+.5)){blockedTerrain[at]=1;continue}
      let nearest=0,best=Infinity;for(let i=0;i<seeds.length;i++){const s=seeds[i],d=(s.x-x)*(s.x-x)+(s.y-y)*(s.y-y);if(d<best){best=d;nearest=i}}
      region[at]=nearest;const c=cells[nearest];c.area++;c.minX=Math.min(c.minX,x);c.maxX=Math.max(c.maxX,x);c.minY=Math.min(c.minY,y);c.maxY=Math.max(c.maxY,y);
    }
    const valid=new Set(cells.filter(c=>c.area>55).map(c=>c.id)),adjacency=new Map([...valid].map(k=>[k,new Set()])),linkPoints=new Map();
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const at=y*W+x,a=region[at];if(!valid.has(a))continue;for(const b of [region[at+1],region[at+W]]){if(!valid.has(b)||a===b)continue;adjacency.get(a).add(b);adjacency.get(b).add(a);const key=[a,b].sort((m,n)=>m-n).join(':');const p=linkPoints.get(key)||{x:0,y:0,samples:0};p.x+=x;p.y+=y;p.samples++;linkPoints.set(key,p)}}
    return {is3v3:true,width:W,height:H,region,blockedTerrain,components:cells,seeds,valid,adjacency,linkPoints,cityIds:{human:seeds.find(s=>s.label?.base==='blue')?.id,alien:seeds.find(s=>s.label?.base==='purple')?.id}};
  }
  function create3v3Grid(model){
    if(state.visualTerritoryGridReady)return;
    const byId=new Map();
    const terrain=['Fenyves határ','Nyílt mezőség','Sziklás magaslat','Régi országút','Mocsári őrhely','Parti magaslat'];
    const grid=model.components.filter(c=>model.valid.has(c.id)).map((cell,index)=>{
      const seed=model.seeds[cell.id],info=seed.label||{},base=info.base;
      const sector={id:'island-field-'+cell.id,regionId:cell.id,name:info.name||terrain[index%terrain.length]+' '+(index+1),x:cell.x/W*100,y:cell.y/H*100,w:(cell.maxX-cell.minX)/W*100,h:(cell.maxY-cell.minY)/H*100,resource:info.resource||'terrain',owner:'neutral',controlSide:null,isBase:false,bunker:false,watchtower:false,productive:(info.resource||'terrain')!=='terrain',passable:true,terrain:'land',links:[],unit:null,spawnColor:base||null};
      byId.set(cell.id,sector);return sector;
    });
    grid.forEach(s=>s.links=[...(model.adjacency.get(s.regionId)||[])].map(key=>byId.get(key)?.id).filter(Boolean));
    state.grid=grid;state.territoryRegionBySector=Object.fromEntries(grid.map(s=>[s.id,s.regionId]));state.selected=null;state.hoveredRegion=null;state.visualTerritoryGridReady=true;
    addLog(`${grid.length} valódi, szabálytalan 3v3 mező készült; a tengeri részek járhatatlanok.`);
  }
  function paint3v3(canvas,model){
    const ctx=canvas.getContext('2d',{alpha:true}),image=ctx.createImageData(model.width,model.height),data=image.data,byRegion=new Map(state.grid.map(s=>[s.regionId,s]));
    const color={blue:[40,174,255],green:[52,210,119],yellow:[255,205,62],purple:[164,93,255],red:[255,73,89],pink:[255,93,192],human:[40,174,255],alien:[168,74,214],neutral:[220,225,210]};
    for(let i=0;i<model.region.length;i++){const region=model.region[i],s=byRegion.get(region);if(!s)continue;const side=s.controlSide||s.owner,c=color[side]||color.neutral,o=i*4;data[o]=c[0];data[o+1]=c[1];data[o+2]=c[2];data[o+3]=side==='neutral'?0:92;}
    /* Két pixeles, világos kontúr: a határ a valódi kattintási rasterből
       készül, ezért amit a játékos vonalnak lát, az ugyanaz a mezőhatár. */
    for(let y=2;y<model.height-2;y++)for(let x=2;x<model.width-2;x++){const i=y*model.width+x,a=model.region[i];if(!model.valid.has(a))continue;const b=model.region[i+1],d=model.region[i+model.width];if((model.valid.has(b)&&b!==a)||(model.valid.has(d)&&d!==a)){const s=byRegion.get(a),c=color[s?.controlSide||s?.owner]||color.neutral;for(const at of [i,i+1,i+model.width,i+model.width+1]){const o=at*4;data[o]=c[0];data[o+1]=c[1];data[o+2]=c[2];data[o+3]=s?.owner==='neutral'?225:245;}}}
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.putImageData(image,0,0);
  }
  function install3v3(){
    const map=$('#sectorMap');if(!map)return;let layer=map.querySelector('.territory-hit-layer');if(layer)layer.remove();layer=document.createElement('canvas');layer.className='territory-hit-layer';map.prepend(layer);
    const ready=()=>{const model=state.territoryHitModel,first=!state.visualTerritoryGridReady;create3v3Grid(model);if(first){renderBattle();return}layer.width=model.width;layer.height=model.height;paint3v3(layer,model);
      const idAt=e=>{const r=layer.getBoundingClientRect(),x=Math.max(0,Math.min(model.width-1,Math.floor((e.clientX-r.left)/r.width*model.width))),y=Math.max(0,Math.min(model.height-1,Math.floor((e.clientY-r.top)/r.height*model.height))),id=model.region[y*model.width+x];return model.valid.has(id)&&!model.blockedTerrain[y*model.width+x]?id:-1};
      layer.onclick=e=>{const rid=idAt(e),sector=state.grid.find(s=>s.regionId===rid);if(!sector)return;e.preventDefault();e.stopPropagation();selectSector(sector.id)};
      layer.onpointermove=e=>{const rid=idAt(e);if(state.hoveredRegion===rid)return;state.hoveredRegion=rid;paint3v3(layer,model)};
      layer.onpointerleave=()=>{state.hoveredRegion=null;paint3v3(layer,model)};
    };
    if(state.territoryHitModel?.is3v3){ready();return}state.territoryHitModel=model3v3();ready();
  }
  installTerritoryHitLayer=function(){return state.map===MAP?install3v3():priorInstall()};
  /* Zoom/pan directly on the visual map; controls retain the same hit canvas. */
  let view={z:1,x:0,y:0},drag=null;
  const apply=()=>{const map=$('#sectorMap');if(!map||state.map!==MAP)return;map.style.transformOrigin='0 0';map.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.z})`;};
  document.addEventListener('wheel',e=>{if(state.map!==MAP||!e.target.closest?.('#sectorMap'))return;e.preventDefault();const r=$('#sectorMap').getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top,old=view.z;view.z=Math.max(1,Math.min(3,view.z*(e.deltaY<0?1.18:.85)));const q=view.z/old;view.x=px-(px-view.x)*q;view.y=py-(py-view.y)*q;apply()},{passive:false,capture:true});
  document.addEventListener('pointerdown',e=>{if(state.map!==MAP||!e.target.closest?.('#sectorMap'))return;drag={x:e.clientX,y:e.clientY,ox:view.x,oy:view.y,moved:false};},{capture:true});
  document.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>7)drag.moved=true;if(drag.moved){view.x=drag.ox+dx;view.y=drag.oy+dy;apply()}},{capture:true});
  document.addEventListener('pointerup',()=>{drag=null},{capture:true});
  renderBattle=function(){priorRender();if(state.map!==MAP)return;const scene=$('.planet-scene');if(scene)scene.classList.add('island3v3');apply();};
  const oldCreate=createGrid;createGrid=function(){state.territoryHitModel=null;state.visualTerritoryGridReady=false;view={z:1,x:0,y:0};oldCreate()};
})();
