/* V16 — victory, percentage merge, expanded map and team modes. */
(function(){
  const grandId='grandfront';
  /* V28: a grandfront ismét a három választható pálya egyike. */
  if(!maps.some(map=>map.id===state.map))state.map='plains';
  state.battleMode=state.battleMode||'1v1';
  state.teamDifficulty=state.teamDifficulty||{humanAlly:'medium',enemy:'medium',alienAlly:'medium'};

  function teamMarkup(){
    const large=true, mode=state.battleMode;
    const difficulty=(key,label)=>`<label class="ally-difficulty"><span>${label}</span><select data-team-difficulty="${key}">${Object.entries(difficulties).map(([id,d])=>`<option value="${id}" ${state.teamDifficulty[key]===id?'selected':''}>${d.name}</option>`).join('')}</select></label>`;
    $('#teamSetup').innerHTML=`<div class="section-heading"><small>CSAPATMÓD</small><h2>${large?'Szövetségek a teljes kontinensen':'A csapatmód a teljes kontinens pályán érhető el'}</h2></div><div class="team-mode-choices ${large?'':'locked'}"><button data-team-mode="1v1" class="${mode==='1v1'?'selected':''}">1v1<small>Két főváros</small></button><button data-team-mode="2v1" ${large?'':'disabled'} class="${mode==='2v1'?'selected':''}">2v1<small>Emberi AI társ</small></button><button data-team-mode="1v2" ${large?'':'disabled'} class="${mode==='1v2'?'selected':''}">1v2<small>Idegen AI társ</small></button><button data-team-mode="2v2" ${large?'':'disabled'} class="${mode==='2v2'?'selected':''}">2v2<small>Két-két frakció</small></button></div>${large&&mode!=='1v1'?`<div class="ally-difficulties">${(mode==='2v1'||mode==='2v2')?difficulty('humanAlly','EMBERI AI · ZÖLD'):''}${difficulty('enemy','IDEGEN FŐPARANCSNOK')}${(mode==='1v2'||mode==='2v2')?difficulty('alienAlly','IDEGEN AI · PIROS'):''}</div>`:''}`;
  }
  const mapsRender=renderMaps;
  renderMaps=function(){mapsRender();teamMarkup()};
  document.addEventListener('change',event=>{const choice=event.target.closest('[data-team-difficulty]');if(!choice)return;state.teamDifficulty[choice.dataset.teamDifficulty]=choice.value;if(choice.dataset.teamDifficulty==='enemy'){state.difficulty=choice.value;renderDifficulty()}teamMarkup()});
  document.addEventListener('click',event=>{const choice=event.target.closest('[data-team-mode]');if(!choice||choice.disabled)return;state.battleMode=choice.dataset.teamMode;teamMarkup()});

  /* The victory condition is enemy control, not clearing every neutral village. */
  checkGameEnd=function(){
    if(state.view!=='battleView'||!state.visualTerritoryGridReady||!state.grid.length||state.finished||state.aiInProgress||state.combatInProgress)return;
    const enemy=enemyOf(state.faction);
    if(!state.grid.some(sector=>sector.owner===enemy)){finishOutcome(true);return}
    const own=state.grid.some(sector=>sector.unit?.side===state.faction),ready=Object.values(state.base?.ready||{}).some(Boolean),queued=Boolean(state.base?.queue.length);
    if(!own&&!ready&&!queued)finishOutcome(false);
  };

  function friendlyTransit(from,owner=state.faction){
    if(from?.owner!==owner)return new Map();
    const paths=new Map([[from.id,[from.id]]]),queue=[from],destinations=new Map();
    for(let at=0;at<queue.length;at++){
      const current=queue[at],path=paths.get(current.id);
      for(const next of neighbors(current)){
        if(next.owner===owner){
          if(path.length>=4||paths.has(next.id)||next.unit?.side&&next.unit.side!==owner&&next.unit.side!==`${owner}Ally`)continue;
          paths.set(next.id,[...path,next.id]);queue.push(next);
        }else if(path.length>1&&!destinations.has(next.id))destinations.set(next.id,[...path,next.id]);
      }
    }
    return destinations;
  }

  /* Friendly movement uses the same 25/50/75/100 choice as attack. */
  askMoveShare=function(targetId){
    const from=state.grid.find(item=>item.id===state.selected),target=state.grid.find(item=>item.id===targetId);
    if(!from?.unit||from.unit.side!==state.faction||!target)return;
    if(hasMoved(from.unit)){toast('Ez az alakulat már mozgott ebben a körben.');return}
    const adjacent=neighbors(from).some(item=>item.id===target.id),route=adjacent?null:friendlyTransit(from).get(target.id);
    if(!adjacent&&!route){toast('Csak szomszédos körzetbe vagy saját mezőkön át a frontig léphetsz.');return}
    if(target.controlSide&&target.owner===state.faction){toast('A szövetséges körzeten áthaladhatsz, de nem foglalhatod el. Válassz egy mögötte lévő célt.');return}
    if(target.owner===state.faction&&target.unit&&target.unit.side!==state.faction){toast('A szövetséges őrség a helyén marad. Válassz a mögötte elérhető körzetekből.');return}
    ensureMoveShareLayer();state.pendingMove={fromId:from.id,targetId,route};
    const joining=target.unit?.side===state.faction;
    $('#moveShareLayer h2').textContent=joining?'Mekkora alakulatot vonsz össze?':'Mekkora alakulat induljon?';
    $('#moveShareText').textContent=`${from.name} · ${from.unit.count.toLocaleString('hu-HU')} egység. A kiválasztott ${joining?'rész összevonul ':route?'rész a saját körzeteken át indul ':'rész elindul '}${target.name} felé.`;
    $('#moveShareLayer').classList.add('open');$('#moveShareLayer').setAttribute('aria-hidden','false');
  };
  const directMoveShare=moveShare;
  moveShare=async function(share){
    const route=state.pendingMove?.route;
    if(route?.length>2){
      const sectors=route.map(id=>state.grid.find(item=>item.id===id));
      if(sectors.some(item=>!item)||sectors.slice(1,-1).some(item=>item.owner!==state.faction)){
        closeMoveShare();toast('Az útvonal közben megváltozott. Válassz új irányt.');return;
      }
      for(let index=1;index<sectors.length-1;index++){
        flashMove(sectors[index-1],sectors[index],state.faction,'advance');renderBattle();await pause(320);
      }
    }
    const targetId=state.pendingMove?.targetId;
    await directMoveShare(share);
    const target=state.grid.find(item=>item.id===targetId);
    if(target?.owner===state.faction&&target.unit?.side===state.faction&&target.controlSide){target.controlSide=null;renderBattle()}
  };

  state.surrenderFlags=state.surrenderFlags||[];
  window.vzBeforeCapture=async function(target){
    const flag={sectorId:target.id};state.surrenderFlags.push(flag);renderBattle();
    await pause(850);
    state.surrenderFlags=state.surrenderFlags.filter(item=>item!==flag);renderBattle();
  };
  const detachedConflict=resolveDetachedConflict;
  resolveDetachedConflict=async function(home,target,attacker,multiplier){
    const defender=target?.unit,defenderSide=defender?.side,attackerSide=attacker?.side;
    const won=await detachedConflict(home,target,attacker,multiplier);
    if(won&&target?.unit){const owner=attackerSide==='humanAlly'?'human':attackerSide==='alienAlly'?'alien':attackerSide;target.controlSide=attackerSide==='humanAlly'||attackerSide==='alienAlly'?attackerSide:null;if(target.owner!==owner)target.owner=owner;renderBattle()}
    if(won&&defenderSide)addLog(`${target.name}: ${defenderSide==='neutral'?'a lázadó őrség':'az alakulat'} fehér zászlót vont.`);
    if(!won&&attackerSide&&attacker.count===0)addLog(`${home.name}: a támadó alakulat fehér zászlót vont.`);
    return won;
  };
  const baseRender=renderBattle;
  renderBattle=function(){
    baseRender();
    const scene=$('.planet-scene');scene.classList.remove('grandfront');
    const map=$('#sectorMap');if(map){
      for(const flag of state.surrenderFlags){const sector=state.grid.find(item=>item.id===flag.sectorId);if(sector)map.insertAdjacentHTML('beforeend',`<span class="surrender-flag" style="left:${sector.x}%;top:${sector.y}%">🏳</span>`)}
      const from=state.grid.find(item=>item.id===state.selected);
      if(from?.unit?.side===state.faction&&!hasMoved(from.unit)&&!state.combatInProgress){
        const routes=[...friendlyTransit(from)].sort((a,b)=>a[1].length-b[1].length).slice(0,10);
        for(const [id] of routes){const target=state.grid.find(item=>item.id===id);if(!target)continue;
          const hostile=Boolean(target.unit);
          map.insertAdjacentHTML('beforeend',`<button type="button" class="move-arrow transit-route ${hostile?'attack-route':''}" data-move-target="${target.id}" style="left:${target.x}%;top:${target.y}%;--rot:0deg" title="Áthaladás saját körzeteken: ${target.name}" aria-label="Áthaladás saját körzeteken: ${target.name}"><span>${hostile?'⚔':'➜'}</span></button>`);
        }
      }
    }
  };

  /* A separate image and a separate hit-model. Every visible white border below
     is drawn from the same region array that receives clicks and movement. */
  const newLandmarks=[
    [115,762,'food','Terra-Prime főváros','human'],[1433,68,'tech','Xeno dominion','alien'],
    [68,347,'food','Parti liget'],[141,287,'food','Nyugati falu'],[211,296,'food','Folyóházi telep'],[108,234,'food','Dombközi falu'],[67,174,'food','Északnyugati telep'],[280,364,'food','Átkelőfalu'],[406,383,'food','Nyárfa község'],[520,414,'food','Felső rév'],[594,337,'food','Kőréti falu'],[741,339,'food','Felső gabonás'],[846,322,'food','Vasúti falu'],[964,297,'food','Középvidék'],[1098,289,'food','Fenyőtelep'],[1182,334,'food','Keleti szántók'],[1313,365,'food','Völgyháza'],[1467,405,'food','Keleti perem'],
    [84,579,'food','Parti házak'],[268,466,'food','Nyugati kert'],[354,495,'food','Folyóliget'],[442,517,'food','Déli házcsoport'],[550,569,'food','Mocsárszéli falu'],[641,554,'food','Zöld csomópont'],[759,577,'food','Tiszta mező'],[913,543,'food','Központi házak'],[1033,548,'food','Völgyi őrhely'],[1146,562,'food','Hídfő'],[1277,605,'food','Keletrév'],[1372,658,'food','Szélfalu'],[124,680,'food','Külső kerület'],[296,785,'food','Déli kisváros'],[543,776,'food','Partmenti falu'],[723,793,'food','Szélesrét'],[913,801,'food','Deltafalva'],[1101,675,'food','Hegyalja'],[1213,741,'food','Fenyőhát'],
    [170,151,'metal','Nyugati bánya'],[655,236,'metal','Északi kőfejtő'],[1107,204,'metal','Magaspart bánya'],[107,430,'metal','Sziklakút'],[1027,365,'metal','Központi bánya'],[1410,482,'metal','Keleti kőfejtő'],[575,701,'metal','Déli fejtés'],[769,727,'metal','Régi érctelep'],[1475,836,'metal','Perembánya'],[1285,136,'metal','Krómgerinc'],[365,220,'metal','Kővölgy'],[1318,514,'metal','Szürke bánya'],
    [438,138,'oil','Északi olajmező'],[822,231,'oil','Felső kútsor'],[1083,239,'oil','Keleti fúrás'],[186,404,'oil','Nyugati olajtorony'],[430,671,'oil','Déli olajkút'],[353,731,'oil','Partmenti kutak'],[1290,569,'oil','Keletrét olajtelep'],[836,120,'oil','Tavi fúrás'],[565,93,'oil','Vasmező olajkút'],[1173,446,'oil','Fenyvesi fúrás'],
    [527,347,'tech','Nyugati gyár'],[928,188,'tech','Központi ipar'],[1420,423,'tech','Keleti üzem'],[182,547,'tech','Parti gyártelep'],[475,559,'tech','Öreg finomító'],[624,725,'tech','Déli ipari park'],[1212,75,'tech','Xeno előőrs'],
    [334,219,'energy','Nyugati generátor'],[708,468,'energy','Központi erőtelep'],[1184,363,'energy','Keleti energiamező'],[805,45,'energy','Felső energiadóm'],[1046,480,'energy','Híd menti állomás']
  ];
  // This contour follows the walled human capital, not the surrounding farms
  // or harbour. Coordinates refer to the 3584 × 1800 background illustration.
  const capitalWall=[[168,1493],[207,1421],[295,1372],[384,1365],[473,1400],[544,1453],[567,1540],[549,1632],[480,1691],[384,1710],[284,1692],[203,1638],[169,1563]];
  function insidePolygon(x,y,points){
    let inside=false;
    for(let a=0,b=points.length-1;a<points.length;b=a++){
      const p=points[a],q=points[b];
      if((p[1]>y)!==(q[1]>y)&&x<(q[0]-p[0])*(y-p[1])/(q[1]-p[1])+p[0])inside=!inside;
    }
    return inside;
  }
  function grandModel(image){
    const width=896,height=450,size=width*height,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const context=canvas.getContext('2d',{willReadFrequently:true});
    context.drawImage(image[0],0,0,width/2,height);
    context.drawImage(image[1],width/2,0,width/2,height);
    const rgba=context.getImageData(0,0,width,height).data;
    const blockedTerrain=new Uint8Array(size),region=new Int32Array(size);region.fill(-1);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){const at=y*width+x,j=at*4,r=rgba[j],g=rgba[j+1],b=rgba[j+2];blockedTerrain[at]=x<4||x>=width-4||y<4||y>=height-4||(g>r*1.22&&b>r*1.25&&b>g*.83&&g>68)?1:0}
    const seeds=[],bins=new Map(),stepX=40,stepY=38;
    const add=(x,y,landmark=null)=>{x=Math.round(x);y=Math.round(y);if(x<5||y<5||x>=width-5||y>=height-5||blockedTerrain[y*width+x])return;if(!landmark&&seeds.some(seed=>Math.hypot(seed.x-x,seed.y-y)<20))return;const seed={id:seeds.length,x,y,landmark};seeds.push(seed);const key=`${Math.floor(x/stepX)}:${Math.floor(y/stepY)}`;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(seed)};
    newLandmarks.forEach(item=>add(item[0]*width/1536,item[1]*height/920,item));
    // Further visible roof clusters in the illustration. Give each cluster a
    // single site seed before placing the remaining empty-terrain seeds.
    const villages=[[526,94],[847,54],[714,195],[935,193],[1170,137],[1328,63],[1558,147],[1905,270],[590,305],[923,290],[1040,302],[1290,330],[1680,330],[384,420],[585,438],[1167,450],[1700,513],[1210,553],[1400,538],[1750,596],[280,730],[700,777],[886,696],[1185,639],[1380,690],[885,810],[1100,758],[1300,1005]];
    villages.forEach(([px,py],index)=>{const x=px*width/2048,y=py*height/1029;
      if(seeds.some(seed=>seed.landmark&&Math.hypot(seed.x-x,seed.y-y)<27))return;
      add(x,y,[px*1536/2048,py*920/1029,'food',`${py<330?'Északi':py>690?'Déli':'Középső'} falucsoport ${index+1}`]);
    });
    for(let row=0;row<8;row++)for(let col=0;col<16;col++){const jx=Math.sin((col+1)*14.371+(row+1)*7.913)*10,jy=Math.cos((row+1)*11.231+(col+1)*5.181)*9;add(28+col*56+jx,28+row*56+jy)}
    const sites=[...seeds].filter(seed=>seed.landmark&&seed.landmark[4]!=='human'&&seed.landmark[4]!=='alien');
    const siteBins=new Map();
    for(const site of sites){
      const radius=site.landmark[2]==='food'?29:site.landmark[2]==='tech'?34:31;
      for(let by=Math.floor((site.y-radius*.8)/32);by<=Math.floor((site.y+radius*.8)/32);by++)
        for(let bx=Math.floor((site.x-radius)/32);bx<=Math.floor((site.x+radius)/32);bx++){
          const key=`${bx}:${by}`;if(!siteBins.has(key))siteBins.set(key,[]);siteBins.get(key).push(site)
        }
    }
    const siteAt=(x,y)=>{
      let chosen=null,best=Infinity;
      for(const site of siteBins.get(`${Math.floor(x/32)}:${Math.floor(y/32)}`)||[]){
        const radius=site.landmark[2]==='food'?29:site.landmark[2]==='tech'?34:31;
        const distance=((x-site.x)/radius)**2+((y-site.y)/(radius*.8))**2;
        if(distance<1&&distance<best){chosen=site.id;best=distance}
      }
      return chosen;
    };
    const nearest=(x,y)=>{let best=-1,dist=Infinity,cx=Math.floor(x/stepX),cy=Math.floor(y/stepY);for(let radius=1;radius<=3&&best<0;radius++)for(let by=cy-radius;by<=cy+radius;by++)for(let bx=cx-radius;bx<=cx+radius;bx++)for(const seed of bins.get(`${bx}:${by}`)||[]){const d=(seed.x-x)**2+(seed.y-y)**2;if(d<dist){dist=d;best=seed.id}}return best};
    const components=seeds.map(seed=>({id:seed.id,x:seed.x,y:seed.y,minX:width,minY:height,maxX:0,maxY:0,area:0}));
    const humanCity=seeds.find(seed=>seed.landmark?.[4]==='human')?.id;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const at=y*width+x;if(blockedTerrain[at])continue;
      const insideCapital=humanCity!==undefined&&x>=40&&x<=145&&y>=335&&y<=435&&insidePolygon((x+.5)*3584/width,(y+.5)*1800/height,capitalWall);
      const id=insideCapital?humanCity:(siteAt(x,y)??nearest(x,y));region[at]=id;
      if(id<0)continue;const cell=components[id];cell.area++;cell.minX=Math.min(x,cell.minX);cell.maxX=Math.max(x,cell.maxX);cell.minY=Math.min(y,cell.minY);cell.maxY=Math.max(y,cell.maxY);
    }
    const valid=new Set(components.filter(cell=>cell.area>45).map(cell=>cell.id)),adjacency=new Map([...valid].map(id=>[id,new Set()])),linkPoints=new Map();
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){const at=y*width+x,a=region[at];if(!valid.has(a))continue;for(const b of [region[at+1],region[at+width]]){if(!valid.has(b)||a===b)continue;adjacency.get(a).add(b);adjacency.get(b).add(a);const key=[a,b].sort((m,n)=>m-n).join(':'),point=linkPoints.get(key)||{x:0,y:0,samples:0,strong:1};point.x+=x;point.y+=y;point.samples++;linkPoints.set(key,point)}}
    const findLandmark=kind=>seeds.find(seed=>seed.landmark?.[4]===kind)?.id;
    return {width,height,region,blockedTerrain,components,seeds,valid,adjacency,linkPoints,cityIds:{human:findLandmark('human'),alien:findLandmark('alien')}};
  }
  function createGrandGrid(model){
    if(state.visualTerritoryGridReady)return;
    const grid=model.components.filter(cell=>model.valid.has(cell.id)).map((cell,index)=>{
      const seed=model.seeds[cell.id],landmark=seed.landmark,isHuman=cell.id===model.cityIds.human,isAlien=cell.id===model.cityIds.alien,isBase=isHuman||isAlien,owner=isHuman?'human':isAlien?'alien':'neutral',resource=landmark?.[2]||'terrain';
      const shore=cell.x<60||cell.x>model.width-60||cell.y>model.height-42;
      const terrainName=shore?'Parti terület':cell.y<model.height*.18?'Hegylábi körzet':cell.y>model.height*.69?'Déli mezőség':'Szabad terület';
      return {id:`new-field-${cell.id}`,regionId:cell.id,name:landmark?.[3]||`${terrainName} ${index+1}`,x:(cell.x+.5)/model.width*100,y:(cell.y+.5)/model.height*100,w:(cell.maxX-cell.minX)/model.width*100,h:(cell.maxY-cell.minY)/model.height*100,resource,owner,isBase,productive:resource!=='terrain',bunker:isBase,watchtower:false,passable:true,terrain:'land',links:[],unit:isBase?unitFor(owner,index,isHuman?'infantry':'alien'):neutralUnitFor(resource,cell.area,index)};
    });
    const byRegion=new Map(grid.map(sector=>[sector.regionId,sector]));
    grid.forEach(sector=>sector.links=[...(model.adjacency.get(sector.regionId)||[])].map(id=>byRegion.get(id)?.id).filter(Boolean));
    // The illustrated east bridge must remain connected even if its blue
    // handrails were classified as water by the colour mask.
    const alienCity=grid.find(item=>item.regionId===model.cityIds.alien);
    if(alienCity&&!alienCity.links.length){const bridge=grid.filter(item=>item.id!==alienCity.id&&item.x<alienCity.x&&item.x>alienCity.x-13&&item.y<26).sort((a,b)=>Math.hypot(a.x-86,a.y-13)-Math.hypot(b.x-86,b.y-13))[0];if(bridge){alienCity.links.push(bridge.id);bridge.links.push(alienCity.id)}}
    state.grid=grid;state.territoryRegionBySector=Object.fromEntries(grid.map(sector=>[sector.id,sector.regionId]));state.selected=null;state.visualTerritoryGridReady=true;
    addLog(`${grid.length} új, eltérő alakú és kattintható körzet az új kontinensen.`);
  }
  const originalPaint=paintTerritoryMap;
  paintTerritoryMap=function(canvas,model){
    if(state.map!==grandId||!model?.seeds){originalPaint(canvas,model);return}
    const context=canvas.getContext('2d');context.clearRect(0,0,canvas.width,canvas.height);
    if(!model.fillLayer){model.fillLayer=document.createElement('canvas');model.fillLayer.width=model.width;model.fillLayer.height=model.height}
    originalPaint(model.fillLayer,model);
    const allies=new Map(state.grid.filter(item=>item.controlSide&&item.regionId!==undefined).map(item=>[item.regionId,item.controlSide]));
    if(allies.size){
      if(!model.allyLayer){model.allyLayer=document.createElement('canvas');model.allyLayer.width=model.width;model.allyLayer.height=model.height}
      const layer=model.allyLayer.getContext('2d'),image=layer.createImageData(model.width,model.height),selected=state.grid.find(item=>item.id===state.selected)?.regionId;
      for(let i=0;i<model.region.length;i++){const side=allies.get(model.region[i]);if(!side)continue;const p=i*4;if(side==='humanAlly'){image.data[p]=36;image.data[p+1]=198;image.data[p+2]=100}else{image.data[p]=235;image.data[p+1]=65;image.data[p+2]=68}image.data[p+3]=model.region[i]===selected?148:104}
      layer.putImageData(image,0,0);model.fillLayer.getContext('2d').drawImage(model.allyLayer,0,0);
    }
    context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(model.fillLayer,0,0,canvas.width,canvas.height);
    if(!model.borderLayer){
      const border=document.createElement('canvas');border.width=model.width*2;border.height=model.height*2;
      const pen=border.getContext('2d');pen.scale(2,2);pen.beginPath();
      for(let y=1;y<model.height-1;y++)for(let x=1;x<model.width-1;x++){
        const index=y*model.width+x,id=model.region[index];if(!model.valid.has(id))continue;
        const right=model.region[index+1],below=model.region[index+model.width];
        if(model.valid.has(right)&&right!==id){pen.moveTo(x+1,y);pen.lineTo(x+1,y+1)}
        if(model.valid.has(below)&&below!==id){pen.moveTo(x,y+1);pen.lineTo(x+1,y+1)}
      }
      pen.strokeStyle='rgba(225,237,216,.49)';pen.lineWidth=.55;pen.lineJoin='round';pen.stroke();model.borderLayer=border;
    }
    context.drawImage(model.borderLayer,0,0,canvas.width,canvas.height);
  };
  function installGrandLayer(){
    const map=$('#sectorMap');if(!map)return;
    const layer=document.createElement('canvas');layer.className='territory-hit-layer';map.prepend(layer);
    const idAt=event=>{const model=state.territoryHitModel,rect=layer.getBoundingClientRect();if(!model)return -1;const x=Math.max(0,Math.min(model.width-1,Math.floor((event.clientX-rect.left)/rect.width*model.width))),y=Math.max(0,Math.min(model.height-1,Math.floor((event.clientY-rect.top)/rect.height*model.height))),id=model.region[y*model.width+x];return model.valid.has(id)&&!model.blockedTerrain[y*model.width+x]?id:-1};
    const bind=()=>{const model=state.territoryHitModel;layer.width=model.width*2;layer.height=model.height*2;paintTerritoryMap(layer,model);layer.addEventListener('click',event=>{const id=idAt(event),sector=state.grid.find(item=>item.regionId===id);if(!sector)return;event.preventDefault();event.stopPropagation();selectSector(sector.id)})};
    const ready=()=>{const first=!state.visualTerritoryGridReady;createGrandGrid(state.territoryHitModel);configureTeams();if(first){renderBattle();return}bind()};
    if(state.territoryHitModel){ready();return}
    Promise.all(['continent-new-world-left.webp','continent-new-world-right.webp'].map(src=>new Promise((resolve,reject)=>{
      const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;
    }))).then(images=>{state.territoryHitModel=grandModel(images);ready()}).catch(()=>toast('A térképkép nem töltődött be. Frissítsd az oldalt.'));
  }
  const baseInstall=installTerritoryHitLayer;
  installTerritoryHitLayer=function(){return state.map===grandId?installGrandLayer():baseInstall()};

  function modeHas(side){return state.battleMode==='2v2'||(side==='humanAlly'&&state.battleMode==='2v1')||(side==='alienAlly'&&state.battleMode==='1v2')}
  function configureTeams(){
    if(state.map!==grandId||state.teamConfigured)return;
    state.teamConfigured=true;
    const locate=(x,y)=>state.grid.filter(item=>!item.isBase).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
    const humanBase=state.grid.find(item=>item.owner==='human'&&item.isBase),alienBase=state.grid.find(item=>item.owner==='alien'&&item.isBase);
    if(humanBase)humanBase.name='Terra-Prime főváros';
    if(alienBase)alienBase.name='Xeno dominion';
    /* The two outposts are at the exact marked locations in the image edit. */
    [['humanAlly',8.6,36.5,'human','Nyugati szövetséges bázis'],['alienAlly',92.3,45.0,'alien','Keleti Xeno előőrs']].forEach(([side,x,y,owner,name],index)=>{if(!modeHas(side))return;const base=locate(x,y);if(!base)return;base.owner=owner;base.controlSide=side;base.isBase=true;base.bunker=true;base.name=name;const unit=unitFor(owner,index+31,owner==='human'?'infantry':'alien');unit.side=side;base.unit=unit});
    state.grid.forEach(item=>{if(item.owner==='human'&&item.isBase)item.unit&& (item.unit.side=item.unit.side==='humanAlly'?'humanAlly':'human');if(item.owner==='alien'&&item.isBase)item.unit&&(item.unit.side=item.unit.side==='alienAlly'?'alienAlly':'alien')});
  }
  const baseCreate=createGrid;
  createGrid=function(){state.teamConfigured=false;state.surrenderFlags=[];baseCreate()};
  const baseStart=startBattle;
  startBattle=function(){
    if(state.battleMode!=='1v1'&&state.map!==grandId){state.map=grandId;toast('A csapatmód a Teljes kontinensfront pályán indul.');}
    baseStart();
  };

  /* Extra AI commands for green/red allies. They pay from their own stocks. */
  function allyState(side){state.teamAi=state.teamAi||{};return state.teamAi[side]||(state.teamAi[side]={metal:800,energy:420,food:760,oil:600,tech:420})}
  async function allyTurn(side,owner,level){
    if(!modeHas(side))return;
    const stock=allyState(side),base=state.grid.find(item=>item.controlSide===side&&item.isBase)||state.grid.find(item=>item.unit?.side===side&&item.isBase);
    if(!base)return;
    const profile={practice:{tempo:0,builds:1},easy:{tempo:1,builds:1},medium:{tempo:3,builds:2},hard:{tempo:4,builds:3}}[level]||{tempo:2,builds:2};
    const productive=state.grid.filter(item=>item.owner===owner&&item.productive).length;
    Object.keys(stock).forEach(key=>stock[key]+=18+Math.floor(productive/3));
    const types=owner==='human'?['infantry','apc','tank','heli','strike']:['alien','hover','alienTank','alienAir','alienStrike'];
    for(let build=0;build<profile.builds;build++){
      const affordable=types.map((type,offset)=>types[(state.turn+build+offset)%types.length]).find(type=>Object.entries(unitSpecs[type].cost).every(([key,val])=>stock[key]>=val));
      if(!affordable)break;
      const spec=unitSpecs[affordable];Object.entries(spec.cost).forEach(([key,val])=>stock[key]-=val);
      const fresh=unitFor(owner,state.turn+build,affordable);fresh.side=side;mergeDetachment(base,fresh);
      addLog(`${side==='humanAlly'?'Emberi szövetséges':'Idegen szövetséges'} gyártott: ${spec.name}.`);
    }
    for(let step=0;step<profile.tempo;step++){
      const candidates=state.grid.filter(item=>item.unit?.side===side&&!hasMoved(item.unit)&&item.unit.count>1);
      const choices=[];
      for(const from of candidates){
        for(const target of neighbors(from).filter(item=>item.owner!==owner))choices.push({from,target,route:[from.id,target.id]});
        for(const [id,route] of friendlyTransit(from,owner)){const target=state.grid.find(item=>item.id===id);if(target)choices.push({from,target,route})}
      }
      /* V20: a szövetséges AI összefüggő frontot épít, nem szigeteket foglal. */
      const enemyOwner=owner==='human'?'alien':'human';
      const scoreChoice=choice=>{
        const target=choice.target;
        const adjacentFriendly=neighbors(target).filter(n=>n.owner===owner).length;
        const adjacentAlly=neighbors(target).filter(n=>n.controlSide===side||n.unit?.side===side).length;
        const adjacentEnemy=neighbors(target).filter(n=>n.owner===enemyOwner).length;
        const isolated=target.owner!==owner&&adjacentFriendly===0;
        const weak=(target.unit?.count||0)/250;
        const routePenalty=(choice.route.length-1)*2.5;
        const resourceBonus={metal:5,oil:5,energy:4,tech:5,food:3,terrain:1}[target.resource]||1;
        return adjacentFriendly*10+adjacentAlly*7+adjacentEnemy*5+resourceBonus-weak-routePenalty-(isolated?40:0);
      };
      choices.sort((a,b)=>scoreChoice(b)-scoreChoice(a));
      const action=choices.find(c=>scoreChoice(c)>-20)||choices[0];if(!action)break;
      const {from,target,route}=action;
      for(let hop=1;hop<route.length-1;hop++){const prev=state.grid.find(item=>item.id===route[hop-1]),next=state.grid.find(item=>item.id===route[hop]);flashMove(prev,next,side,'advance');renderBattle();await pause(180)}
      const part=takeDetachment(from.unit,level==='hard'?.9:.82);if(!from.unit.count)from.unit=null;
      if(target.unit)await resolveDetachedConflict(from,target,part,level==='hard'?1.08:1);
      else{target.owner=owner;target.controlSide=side;target.unit=part;flashMove(from,target,side,'advance');await pause(240)}
    }
  }
  const coreAiTurn=aiTurn;
  aiTurn=async function(){
    await coreAiTurn();
    if(state.map!==grandId||state.battleMode==='1v1'||state.finished||state.difficulty==='practice')return;
    const enemy=enemyOf(state.faction),units=state.grid.filter(item=>item.unit?.side===enemy);
    if(!units.length||units.some(item=>hasMoved(item.unit)))return;
    const choices=units.flatMap(from=>[
      ...neighbors(from).filter(target=>target.owner!==enemy).map(target=>({from,target,route:[from.id,target.id]})),
      ...[...friendlyTransit(from,enemy)].map(([id,route])=>({from,target:state.grid.find(item=>item.id===id),route}))
    ]).filter(item=>item.target&&item.from.unit?.count>1).sort((a,b)=>a.route.length-b.route.length||(a.target.unit?.count||0)-(b.target.unit?.count||0));
    const action=choices[0];if(!action)return;
    state.aiInProgress=true;
    try{
      const {from,target,route}=action;
      for(let step=1;step<route.length-1;step++){const previous=state.grid.find(item=>item.id===route[step-1]),next=state.grid.find(item=>item.id===route[step]);flashMove(previous,next,enemy,'advance');renderBattle();await pause(280)}
      const part=takeDetachment(from.unit,.8);if(!from.unit.count)from.unit=null;
      if(target.unit)await resolveDetachedConflict(from,target,part,1);
      else{flashMove(from,target,enemy,'advance');await pause(430);target.owner=enemy;target.controlSide=null;target.unit=part;addLog(`Ellenséges alakulat továbbhaladt: ${target.name}.`)}
    }finally{state.aiInProgress=false;renderBattle()}
  };
  const coreEndTurn=endTurn;
  endTurn=async function(){if(state.map===grandId&&state.battleMode!=='1v1')state.difficulty=state.teamDifficulty.enemy||state.difficulty;await coreEndTurn();if(state.finished||state.battleMode==='1v1')return;await allyTurn('humanAlly','human',state.teamDifficulty.humanAlly);await allyTurn('alienAlly','alien',state.teamDifficulty.alienAlly);renderBattle();checkGameEnd()};

  /* Main AI prioritises vehicles as soon as the appropriate facilities exist. */
  const economy=aiEconomy;
  aiEconomy=function(){economy();const base=state.aiBase,side=enemyOf(state.faction);if(!base?.buildings?.vehicleFactory)return;const vehicle=side==='human'?'apc':'hover',heavy=side==='human'?'tank':'alienTank';if(state.turn>5&&base.queue.length<3){const type=state.turn%3===0?heavy:vehicle;if(base.buildings[unitSpecs[type].building]&&aiCanAfford(unitSpecs[type].cost))aiQueue(type)}};
})();


/* V99 — field-centered orders, aggressive team AI, stronger Hard. */
(function(){
  /* Put move/attack buttons on the destination field itself. */
  const v99Render=renderBattle;
  renderBattle=function(){
    v99Render();
    const map=document.querySelector('#sectorMap');
    if(!map)return;
    map.querySelectorAll('.move-arrow[data-move-target]').forEach(btn=>{
      const target=state.grid.find(x=>String(x.id)===String(btn.dataset.moveTarget));
      if(!target)return;
      btn.style.setProperty('left',target.x+'%','important');
      btn.style.setProperty('top',target.y+'%','important');
      btn.style.setProperty('--rot','0deg');
      btn.title=(target.unit&&target.unit.side!==state.faction?'Támadás: ':'Mozgás: ')+target.name;
    });
  };

  /* Team AI: territory expansion first, enemy destruction second. */
  const oldAllyTurn=allyTurn;
  allyTurn=async function(side,owner,level){
    if(!modeHas(side))return oldAllyTurn(side,owner,level);
    const stock=allyState(side),base=state.grid.find(x=>x.controlSide===side&&x.isBase)||state.grid.find(x=>x.unit?.side===side&&x.isBase);
    if(!base)return;
    const profile={practice:{tempo:0,builds:1,share:.72,mult:1},easy:{tempo:2,builds:1,share:.78,mult:1},medium:{tempo:4,builds:2,share:.86,mult:1.04},hard:{tempo:7,builds:4,share:.96,mult:1.24}}[level]||{tempo:3,builds:2,share:.84,mult:1};
    const productive=state.grid.filter(x=>x.owner===owner&&x.productive).length;
    Object.keys(stock).forEach(k=>stock[k]+=18+Math.floor(productive/3)+(level==='hard'?10:0));
    const types=owner==='human'?['tank','strike','infantry','apc','heli']:['alienTank','alienStrike','alien','hover','alienAir'];
    for(let build=0;build<profile.builds;build++){
      const type=types.find(t=>Object.entries(unitSpecs[t].cost).every(([k,v])=>stock[k]>=v));
      if(!type)break;
      Object.entries(unitSpecs[type].cost).forEach(([k,v])=>stock[k]-=v);
      const fresh=unitFor(owner,state.turn+build,type);fresh.side=side;mergeDetachment(base,fresh);
    }
    const enemyOwner=owner==='human'?'alien':'human';
    for(let step=0;step<profile.tempo;step++){
      const choices=[];
      for(const from of state.grid.filter(x=>x.unit?.side===side&&!hasMoved(x.unit)&&x.unit.count>1)){
        for(const target of neighbors(from).filter(x=>x.owner!==owner))choices.push({from,target,route:[from.id,target.id]});
        for(const [id,route] of friendlyTransit(from,owner)){const target=state.grid.find(x=>x.id===id);if(target)choices.push({from,target,route})}
      }
      const score=c=>{
        const t=c.target, hostile=t.unit&&t.unit.side!==side&&t.unit.side!==owner;
        const enemyUnit=hostile&&(t.owner===enemyOwner||t.unit.side===enemyOwner||t.unit.side===enemyOwner+'Ally');
        const enemyBase=enemyUnit&&t.isBase;
        const connected=neighbors(t).filter(n=>n.owner===owner).length;
        const resource={metal:10,oil:11,energy:8,tech:12,food:7,terrain:2}[t.resource]||2;
        const defense=(t.unit?.count||0)/180;
        /* Expansion dominates target choice; enemy elimination is the secondary objective. */
        const expansion=t.owner!==owner ? 150 : 0;
        const neutralBonus=t.owner==='neutral' ? 70 : 0;
        const enemyTerritory=t.owner===enemyOwner ? 45 : 0;
        const combat=enemyBase?55:enemyUnit?38:hostile?22:0;
        return expansion+neutralBonus+enemyTerritory+combat+connected*12+resource*2-defense-(c.route.length-1)*3;
      };
      choices.sort((a,b)=>score(b)-score(a));
      const action=choices[0];if(!action)break;
      const {from,target,route}=action;
      for(let hop=1;hop<route.length-1;hop++){const prev=state.grid.find(x=>x.id===route[hop-1]),next=state.grid.find(x=>x.id===route[hop]);flashMove(prev,next,side,'advance');renderBattle();await pause(140)}
      const part=takeDetachment(from.unit,profile.share);if(!from.unit.count)from.unit=null;
      if(target.unit)await resolveDetachedConflict(from,target,part,profile.mult);
      else{target.owner=owner;target.controlSide=side;target.unit=part;flashMove(from,target,side,'advance');await pause(160)}
    }
  };
})();



/* V102 — Hat Sziget 3v3 integrated test map.
   Keeps the existing maps, adds a separate 3v3-only battlefield and six coloured capitals. */
(function(){
  const id='island3v3';
  if(!maps.some(m=>m.id===id))maps.push({
    id,
    name:'Terra-Prime // Hat Sziget 3v3',
    image:'assets/battlemap-island3v3-v102.svg',
    text:'Három-három kezdősziget, hat főváros és egy nagy, semleges központi hadszíntér.',
    stats:['3v3','6 FŐVÁROS','KÖZPONTI FRONT']
  });
  state.spawnColor=state.spawnColor||'blue';
  const positions=[
    ['blue','KÉK','human',8,18],['green','ZÖLD','human',8,50],['yellow','SÁRGA','human',8,82],
    ['purple','LILA','alien',92,18],['red','PIROS','alien',92,50],['pink','RÓZSASZÍN','alien',92,82]
  ];
  const colors={blue:'#32bfff',green:'#45d17a',yellow:'#ffd34f',purple:'#a56cff',red:'#ff4f58',pink:'#ff68c9'};

  function addPositionPicker(){
    const setup=document.querySelector('#teamSetup');if(!setup||state.map!==id)return;
    let box=document.querySelector('#v102SpawnPicker');
    if(!box){box=document.createElement('div');box.id='v102SpawnPicker';box.className='v102-spawn-picker';setup.appendChild(box)}
    box.innerHTML='<small>KEZDŐ FŐVÁROS</small><div>'+positions.map(([key,label])=>'<button type="button" data-v102-spawn="'+key+'" class="'+(state.spawnColor===key?'selected':'')+'" style="--c:'+colors[key]+'"><i></i>'+label+'</button>').join('')+'</div>';
  }
  const oldRenderMaps=renderMaps;
  renderMaps=function(){oldRenderMaps();addPositionPicker()};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-v102-spawn]');if(!b)return;state.spawnColor=b.dataset.v102Spawn;addPositionPicker()});

  const oldStart=startBattle;
  startBattle=function(){
    if(state.map===id){state.battleMode='3v3';}
    oldStart();
  };

  /* Six capitals only; every other field starts neutral. */
  function configure(){
    if(state.map!==id||state._v102configured||!state.grid?.length)return;
    state._v102configured=true;
    const used=new Set(),closest=(x,y)=>state.grid.filter(g=>!used.has(g.id)).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
    state.grid.forEach((g,i)=>{
      g.owner='neutral';g.controlSide=null;g.isBase=false;g.bunker=false;
      if(g.resource==='metal'||g.resource==='oil'||g.resource==='energy'){
        const u=unitFor('neutral',i+500,'mercenary');u.count=240;u.composition={mercenary:240,mercenaryCarrier:2};g.unit=u;
      }else if(g.resource==='food'){
        const u=unitFor('neutral',i+500,'mercenary');u.count=145;u.composition={mercenary:145};g.unit=u;
      }else g.unit=null;
    });
    positions.forEach(([key,label,defaultRace,x,y],i)=>{
      const g=closest(x,y);if(!g)return;used.add(g.id);
      const player=key===state.spawnColor,race=player?state.faction:defaultRace;
      g.owner=race;g.controlSide=key;g.isBase=true;g.bunker=true;g.spawnColor=key;g.name=label+' főváros';
      const u=unitFor(race,800+i,race==='human'?'infantry':'alien');u.side=player?state.faction:key;u.count=1000;u.composition={[u.type]:1000};g.unit=u;
    });
  }
  const oldCreate=createGrid;
  createGrid=function(){state._v102configured=false;oldCreate()};
  const oldRender=renderBattle;
  renderBattle=function(){if(state.map===id&&!state._v102configured)configure();oldRender();
    if(state.map!==id)return;
    document.querySelectorAll('.territory-token[data-sector]').forEach(el=>{
      const g=state.grid.find(x=>String(x.id)===String(el.dataset.sector));if(g?.spawnColor)el.style.setProperty('--spawn-color',colors[g.spawnColor]);
    });
  };

  /* Desktop wheel zoom + touch pinch zoom, centred on the point being inspected. */
  let z=1,tx=0,ty=0,pinch=null;
  function apply(){
    const map=document.querySelector('#sectorMap');if(!map||state.map!==id)return;
    map.style.transformOrigin='0 0';map.style.transform='translate('+tx+'px,'+ty+'px) scale('+z+')';
  }
  document.addEventListener('wheel',e=>{
    if(state.map!==id||!e.target.closest?.('#sectorMap'))return;e.preventDefault();
    const map=document.querySelector('#sectorMap'),r=map.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top,old=z;
    z=Math.max(1,Math.min(3.5,z*(e.deltaY<0?1.13:.885)));const q=z/old;tx=px-(px-tx)*q;ty=py-(py-ty)*q;apply();
  },{passive:false});
  document.addEventListener('touchstart',e=>{if(state.map!==id||!e.target.closest?.('#sectorMap')||e.touches.length!==2)return;
    const a=e.touches[0],b=e.touches[1];pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),z,tx,ty,cx:(a.clientX+b.clientX)/2,cy:(a.clientY+b.clientY)/2};
  },{passive:true});
  document.addEventListener('touchmove',e=>{if(!pinch||e.touches.length!==2)return;e.preventDefault();
    const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),old=z;
    z=Math.max(1,Math.min(3.5,pinch.z*d/pinch.d));const q=z/old,cx=(a.clientX+b.clientX)/2,cy=(a.clientY+b.clientY)/2;tx=cx-(cx-tx)*q;ty=cy-(cy-ty)*q;apply();
  },{passive:false});
  document.addEventListener('touchend',()=>pinch=null,{passive:true});
})();
