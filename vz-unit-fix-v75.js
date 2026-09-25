/* V76 — visibly smaller map unit icons for every side. */
(function(){
  const style=document.createElement('style');
  style.textContent=`
    #battleView .planet-scene::before,
    #battleView .planet-scene::after{display:none!important;content:none!important}
    #battleView .territory-token.base-sector::before{display:none!important;content:none!important}
    #battleView .territory-token .sector-guard{display:none!important}
    #battleView .territory-token.neutral.selected .sector-label{display:none!important}
    #battleView .map-unit-marker>span{
      filter:drop-shadow(0 1px 1px rgba(0,0,0,.95))!important;
      image-rendering:auto!important;
    }
    #battleView .map-unit-marker>b{
      font-family:Inter,ui-sans-serif,system-ui,sans-serif!important;
      font-weight:900!important;
      letter-spacing:0!important;
      white-space:nowrap!important;
      box-shadow:0 1px 3px rgba(0,0,0,.7)!important;
    }
  `;
  document.head.appendChild(style);

  function normalizeUnitMarkers(){
    const map=document.querySelector('#sectorMap');
    if(!map||typeof state==='undefined')return;
    map.querySelectorAll('.territory-token[data-sector]').forEach(token=>{
      const sector=state.grid.find(s=>String(s.id)===String(token.dataset.sector));
      const marker=token.querySelector('.map-unit-marker');
      if(!marker||!sector?.unit)return;
      const visible=sector.unit.side!=='neutral'||String(state.selected)===String(sector.id);
      marker.style.setProperty('display',visible?'block':'none','important');
      marker.style.setProperty('position','absolute','important');
      marker.style.setProperty('left','50%','important');
      marker.style.setProperty('top','-10px','important');
      marker.style.setProperty('width','20px','important');
      marker.style.setProperty('height','17px','important');
      marker.style.setProperty('min-width','20px','important');
      marker.style.setProperty('min-height','17px','important');
      marker.style.setProperty('max-width','20px','important');
      marker.style.setProperty('max-height','17px','important');
      marker.style.setProperty('transform','translateX(-50%)','important');
      marker.style.setProperty('overflow','visible','important');
      marker.style.setProperty('background','transparent','important');
      marker.style.setProperty('border','0','important');
      marker.style.setProperty('border-radius','0','important');
      marker.style.setProperty('box-shadow','none','important');
      marker.style.setProperty('z-index','120','important');
      const art=marker.querySelector('span');
      if(art){
        art.style.setProperty('display','block','important');
        art.style.setProperty('position','absolute','important');
        art.style.setProperty('left','50%','important');
        art.style.setProperty('top','0','important');
        art.style.setProperty('width','20px','important');
        art.style.setProperty('height','17px','important');
        art.style.setProperty('min-width','20px','important');
        art.style.setProperty('min-height','17px','important');
        art.style.setProperty('max-width','20px','important');
        art.style.setProperty('max-height','17px','important');
        art.style.setProperty('transform','translateX(-50%)','important');
        art.style.setProperty('background-size','contain','important');
        art.style.setProperty('background-repeat','no-repeat','important');
        art.style.setProperty('background-position','center bottom','important');
        art.style.setProperty('background-color','transparent','important');
        art.style.setProperty('border','0','important');
        art.style.setProperty('border-radius','0','important');
        art.style.setProperty('box-shadow','none','important');
        art.style.setProperty('opacity','1','important');
        art.style.setProperty('visibility','visible','important');
        art.style.setProperty('z-index','121','important');
      }
      const count=marker.querySelector('b');
      if(count){
        count.style.setProperty('display','block','important');
        count.style.setProperty('position','absolute','important');
        count.style.setProperty('left','50%','important');
        count.style.setProperty('top','19px','important');
        count.style.setProperty('transform','translateX(-50%)','important');
        count.style.setProperty('min-width','0','important');
        count.style.setProperty('padding','1px 4px','important');
        count.style.setProperty('border-radius','999px','important');
        count.style.setProperty('border','1px solid rgba(214,235,242,.35)','important');
        count.style.setProperty('background','rgba(3,10,15,.94)','important');
        count.style.setProperty('color','#fff','important');
        count.style.setProperty('font-size','6px','important');
        count.style.setProperty('line-height','1','important');
        count.style.setProperty('z-index','122','important');
      }
    });
  }

  const previousRenderBattle=renderBattle;
  renderBattle=function(){
    previousRenderBattle();
    normalizeUnitMarkers();
  };
  normalizeUnitMarkers();
})();
