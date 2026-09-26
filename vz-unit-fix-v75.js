/* V78 — pseudo-3D battlefield miniatures instead of enlarged bitmap icons. */
(function(){
  const BOX_W=72,BOX_H=84,MODEL_W=68,MODEL_H=72,COUNT_Y=74;
  const style=document.createElement('style');
  style.textContent=`
    #battleView .planet-scene::before,
    #battleView .planet-scene::after{display:none!important;content:none!important}
    #battleView .territory-token.base-sector::before{display:none!important;content:none!important}
    #battleView .territory-token .sector-guard{display:none!important}
    #battleView .territory-token.neutral.selected .sector-label{display:none!important}
    #battleView .map-unit-marker{pointer-events:none!important}
    #battleView .unit-miniature{
      --armor1:#2e5163;--armor2:#07171f;--metal:#9fb7c1;--accent:#39dcff;--dark:#02070a;
      display:block!important;position:absolute!important;box-sizing:border-box!important;
      background:none!important;background-image:none!important;border:0!important;border-radius:0!important;
      box-shadow:none!important;overflow:visible!important;transform-origin:50% 100%!important;
      filter:drop-shadow(0 5px 3px rgba(0,0,0,.72))!important;
    }
    #battleView .unit-miniature.side-human{--armor1:#356b83;--armor2:#071923;--metal:#a9c5d0;--accent:#36ddff;--dark:#02080c}
    #battleView .unit-miniature.side-alien{--armor1:#702745;--armor2:#160711;--metal:#a87a92;--accent:#ff3566;--dark:#080208}
    #battleView .unit-miniature.side-neutral{--armor1:#7b6c4e;--armor2:#2b2519;--metal:#b7ad91;--accent:#f0cd70;--dark:#0d0b07}
    #battleView .unit-miniature i{display:block!important;position:absolute!important;box-sizing:border-box!important;margin:0!important;padding:0!important;border:0!important}

    /* standing infantry / alien / mercenary */
    #battleView .unit-miniature.kind-soldier .u-shadow{left:11px;bottom:1px;width:46px;height:10px;border-radius:50%!important;background:rgba(0,0,0,.52)!important;filter:blur(2px)!important;transform:skewX(-12deg)}
    #battleView .unit-miniature.kind-soldier .u-leg{bottom:8px;width:11px;height:29px;border-radius:6px 6px 4px 4px!important;background:linear-gradient(90deg,var(--dark),var(--armor1) 46%,var(--metal) 54%,var(--armor2))!important;box-shadow:inset -2px 0 3px rgba(0,0,0,.55)!important}
    #battleView .unit-miniature.kind-soldier .u-leg.l{left:24px;transform:rotate(4deg)}
    #battleView .unit-miniature.kind-soldier .u-leg.r{left:36px;transform:rotate(-4deg)}
    #battleView .unit-miniature.kind-soldier .u-foot{bottom:5px;width:16px;height:7px;border-radius:8px 3px 3px 3px!important;background:linear-gradient(#4d5b62,var(--dark))!important}
    #battleView .unit-miniature.kind-soldier .u-foot.l{left:19px;transform:skewX(-12deg)}
    #battleView .unit-miniature.kind-soldier .u-foot.r{left:36px;transform:skewX(12deg)}
    #battleView .unit-miniature.kind-soldier .u-body{left:19px;bottom:31px;width:31px;height:29px;clip-path:polygon(12% 8%,32% 0,68% 0,88% 8%,100% 82%,78% 100%,22% 100%,0 82%)!important;background:linear-gradient(100deg,var(--dark) 0 12%,var(--armor1) 30%,var(--metal) 50%,var(--armor1) 61%,var(--armor2) 86%)!important;box-shadow:inset 0 -6px 6px rgba(0,0,0,.45)!important}
    #battleView .unit-miniature.kind-soldier .u-core{left:27px;bottom:40px;width:15px;height:13px;clip-path:polygon(50% 0,100% 32%,82% 100%,18% 100%,0 32%)!important;background:linear-gradient(135deg,var(--accent),rgba(255,255,255,.6) 46%,var(--armor2) 50%)!important;box-shadow:0 0 5px color-mix(in srgb,var(--accent) 75%,transparent)!important}
    #battleView .unit-miniature.kind-soldier .u-arm{bottom:30px;width:10px;height:29px;border-radius:7px!important;background:linear-gradient(90deg,var(--dark),var(--armor1) 52%,var(--metal) 58%,var(--armor2))!important}
    #battleView .unit-miniature.kind-soldier .u-arm.l{left:12px;transform:rotate(12deg)}
    #battleView .unit-miniature.kind-soldier .u-arm.r{left:48px;transform:rotate(-14deg)}
    #battleView .unit-miniature.kind-soldier .u-head{left:25px;bottom:57px;width:20px;height:16px;border-radius:48% 48% 38% 38%!important;background:linear-gradient(105deg,var(--dark),var(--armor1) 35%,var(--metal) 53%,var(--armor2) 78%)!important;box-shadow:inset 0 -3px 4px rgba(0,0,0,.45)!important}
    #battleView .unit-miniature.kind-soldier .u-visor{left:27px;bottom:62px;width:16px;height:5px;border-radius:5px!important;background:linear-gradient(90deg,var(--accent),#fff 48%,var(--accent))!important;box-shadow:0 0 6px var(--accent)!important}
    #battleView .unit-miniature.kind-soldier .u-weapon{right:7px;bottom:22px;width:7px;height:39px;border-radius:3px!important;background:linear-gradient(90deg,#020304,var(--metal) 45%,var(--dark) 55%)!important;transform:rotate(10deg);box-shadow:0 0 2px rgba(0,0,0,.8)!important}
    #battleView .unit-miniature.kind-soldier .u-weapon::after{content:"";position:absolute;left:-2px;top:3px;width:11px;height:7px;border-radius:2px;background:var(--armor1);box-shadow:0 0 4px var(--accent)}
    #battleView .unit-miniature.side-alien.kind-soldier .u-head{clip-path:polygon(12% 28%,28% 0,42% 22%,58% 22%,72% 0,88% 28%,100% 62%,72% 100%,28% 100%,0 62%)!important;border-radius:0!important}
    #battleView .unit-miniature.side-alien.kind-soldier .u-body{clip-path:polygon(0 18%,28% 0,50% 10%,72% 0,100% 18%,83% 100%,17% 100%)!important}
    #battleView .unit-miniature.side-neutral.kind-soldier .u-visor{box-shadow:0 0 3px var(--accent)!important}

    /* APC / hover / carrier */
    #battleView .unit-miniature.kind-transport .u-shadow{left:5px;bottom:5px;width:60px;height:11px;border-radius:50%!important;background:rgba(0,0,0,.5)!important;filter:blur(2px)!important}
    #battleView .unit-miniature.kind-transport .u-wheel{bottom:8px;width:13px;height:16px;border-radius:50%!important;background:radial-gradient(circle at 45% 45%,#58656a 0 18%,#111 20% 58%,#030303 60%)!important;box-shadow:0 0 0 1px #000!important}
    #battleView .unit-miniature.kind-transport .u-wheel.w1{left:10px}.unit-miniature.kind-transport .u-wheel.w2{left:25px}.unit-miniature.kind-transport .u-wheel.w3{left:43px}.unit-miniature.kind-transport .u-wheel.w4{left:56px}
    #battleView .unit-miniature.kind-transport .u-hull{left:5px;bottom:15px;width:61px;height:28px;clip-path:polygon(8% 22%,20% 0,80% 0,100% 28%,92% 100%,8% 100%,0 56%)!important;background:linear-gradient(105deg,var(--dark),var(--armor1) 31%,var(--metal) 49%,var(--armor1) 60%,var(--armor2) 88%)!important;box-shadow:inset 0 -7px 7px rgba(0,0,0,.5)!important}
    #battleView .unit-miniature.kind-transport .u-cabin{left:22px;bottom:40px;width:33px;height:20px;clip-path:polygon(12% 100%,22% 22%,38% 0,86% 12%,100% 100%)!important;background:linear-gradient(115deg,var(--armor2),var(--metal) 38%,var(--armor1) 48%,var(--dark) 84%)!important}
    #battleView .unit-miniature.kind-transport .u-window{left:29px;bottom:47px;width:20px;height:7px;clip-path:polygon(9% 100%,15% 0,88% 8%,100% 100%)!important;background:linear-gradient(90deg,var(--accent),#dffbff 48%,var(--armor2))!important;box-shadow:0 0 5px var(--accent)!important}
    #battleView .unit-miniature.kind-transport .u-gun{left:49px;bottom:48px;width:18px;height:5px;border-radius:4px!important;background:linear-gradient(var(--metal),var(--dark))!important;transform:rotate(-5deg)}
    #battleView .unit-miniature.kind-transport .u-thruster{display:none!important;left:12px;bottom:8px;width:49px;height:8px;border-radius:50%!important;background:radial-gradient(ellipse,var(--accent),transparent 68%)!important;filter:blur(1px)!important}
    #battleView .unit-miniature.type-hover .u-wheel,#battleView .unit-miniature.type-mercenaryCarrier .u-wheel{display:none!important}
    #battleView .unit-miniature.type-hover .u-thruster{display:block!important}
    #battleView .unit-miniature.type-mercenaryCarrier .u-hull{height:22px!important;width:57px!important;left:8px!important}

    /* tanks */
    #battleView .unit-miniature.kind-tank .u-shadow{left:4px;bottom:4px;width:62px;height:11px;border-radius:50%!important;background:rgba(0,0,0,.52)!important;filter:blur(2px)!important}
    #battleView .unit-miniature.kind-tank .u-track{bottom:8px;width:61px;height:19px;left:5px;border-radius:8px!important;background:repeating-linear-gradient(90deg,#050606 0 6px,#343a3d 7px 10px)!important;box-shadow:inset 0 0 0 3px #090b0c,inset 0 0 0 5px #424a4e!important}
    #battleView .unit-miniature.kind-tank .u-hull{left:7px;bottom:20px;width:58px;height:26px;clip-path:polygon(8% 28%,24% 0,80% 0,100% 38%,90% 100%,10% 100%,0 55%)!important;background:linear-gradient(105deg,var(--dark),var(--armor1) 33%,var(--metal) 50%,var(--armor1) 62%,var(--armor2) 88%)!important;box-shadow:inset 0 -7px 7px rgba(0,0,0,.5)!important}
    #battleView .unit-miniature.kind-tank .u-turret{left:21px;bottom:42px;width:34px;height:19px;clip-path:polygon(10% 32%,30% 0,78% 8%,100% 50%,78% 100%,16% 88%,0 55%)!important;background:linear-gradient(100deg,var(--dark),var(--armor1) 38%,var(--metal) 54%,var(--armor2))!important}
    #battleView .unit-miniature.kind-tank .u-barrel{left:48px;bottom:51px;width:27px;height:6px;border-radius:4px!important;background:linear-gradient(#8b969b,var(--dark))!important;transform:rotate(-7deg);transform-origin:left center!important}
    #battleView .unit-miniature.kind-tank .u-core{left:30px;bottom:49px;width:10px;height:7px;border-radius:50%!important;background:var(--accent)!important;box-shadow:0 0 7px var(--accent)!important}
    #battleView .unit-miniature.side-alien.kind-tank .u-hull,#battleView .unit-miniature.side-alien.kind-tank .u-turret{clip-path:polygon(0 50%,18% 4%,50% 18%,76% 0,100% 42%,85% 100%,15% 100%)!important}

    /* helicopter / VTOL */
    #battleView .unit-miniature.kind-rotor .u-shadow{left:12px;bottom:3px;width:48px;height:9px;border-radius:50%!important;background:rgba(0,0,0,.42)!important;filter:blur(3px)!important}
    #battleView .unit-miniature.kind-rotor .u-body{left:18px;bottom:22px;width:39px;height:25px;border-radius:55% 45% 42% 50%!important;background:linear-gradient(110deg,var(--dark),var(--armor1) 34%,var(--metal) 50%,var(--armor2) 80%)!important;clip-path:polygon(0 45%,18% 10%,73% 0,100% 43%,72% 100%,20% 88%)!important}
    #battleView .unit-miniature.kind-rotor .u-glass{left:38px;bottom:34px;width:16px;height:10px;border-radius:50%!important;background:linear-gradient(100deg,var(--accent),#e7ffff 48%,var(--armor2))!important;box-shadow:0 0 5px var(--accent)!important}
    #battleView .unit-miniature.kind-rotor .u-tail{left:4px;bottom:34px;width:30px;height:7px;clip-path:polygon(0 35%,100% 0,100% 100%,0 65%)!important;background:linear-gradient(90deg,var(--armor2),var(--metal),var(--armor1))!important}
    #battleView .unit-miniature.kind-rotor .u-fin{left:6px;bottom:37px;width:10px;height:19px;clip-path:polygon(0 100%,65% 0,100% 100%)!important;background:var(--armor1)!important}
    #battleView .unit-miniature.kind-rotor .u-rotor{left:7px;bottom:52px;width:59px;height:4px;border-radius:50%!important;background:linear-gradient(90deg,transparent,#b9c7cc 13%,var(--dark) 48%,#b9c7cc 86%,transparent)!important;box-shadow:0 0 2px rgba(255,255,255,.5)!important}
    #battleView .unit-miniature.kind-rotor .u-mast{left:34px;bottom:44px;width:4px;height:12px;background:linear-gradient(#bbb,var(--dark))!important}
    #battleView .unit-miniature.kind-rotor .u-engine{left:25px;bottom:17px;width:26px;height:7px;border-radius:50%!important;background:radial-gradient(ellipse,var(--accent),transparent 70%)!important;filter:blur(1px)!important}
    #battleView .unit-miniature.type-alienAir .u-rotor{display:none!important}
    #battleView .unit-miniature.type-alienAir .u-body{clip-path:polygon(0 50%,18% 9%,50% 20%,82% 0,100% 50%,78% 100%,50% 82%,18% 100%)!important;border-radius:0!important}

    /* strike craft */
    #battleView .unit-miniature.kind-jet .u-shadow{left:13px;bottom:3px;width:45px;height:8px;border-radius:50%!important;background:rgba(0,0,0,.38)!important;filter:blur(3px)!important}
    #battleView .unit-miniature.kind-jet .u-fuselage{left:28px;bottom:12px;width:15px;height:54px;clip-path:polygon(50% 0,83% 20%,72% 80%,100% 100%,50% 88%,0 100%,28% 80%,17% 20%)!important;background:linear-gradient(90deg,var(--dark),var(--armor1) 33%,var(--metal) 49%,var(--armor1) 61%,var(--armor2))!important}
    #battleView .unit-miniature.kind-jet .u-wing{bottom:27px;width:31px;height:23px;background:linear-gradient(120deg,var(--dark),var(--armor1) 38%,var(--metal) 52%,var(--armor2))!important}
    #battleView .unit-miniature.kind-jet .u-wing.l{left:5px;clip-path:polygon(100% 0,100% 100%,0 82%,35% 40%)!important}
    #battleView .unit-miniature.kind-jet .u-wing.r{right:5px;clip-path:polygon(0 0,100% 82%,65% 40%,0 100%)!important}
    #battleView .unit-miniature.kind-jet .u-cockpit{left:31px;bottom:47px;width:9px;height:12px;border-radius:60% 60% 45% 45%!important;background:linear-gradient(var(--accent),#eaffff,var(--armor2))!important;box-shadow:0 0 5px var(--accent)!important}
    #battleView .unit-miniature.kind-jet .u-engine{left:29px;bottom:8px;width:13px;height:11px;border-radius:50%!important;background:radial-gradient(circle,#fff 0 15%,var(--accent) 24% 52%,transparent 70%)!important;box-shadow:0 0 8px var(--accent)!important}
    #battleView .unit-miniature.side-alien.kind-jet .u-wing{clip-path:polygon(50% 0,100% 55%,70% 100%,0 72%)!important}

    #battleView .map-unit-marker>b{
      font-family:Inter,ui-sans-serif,system-ui,sans-serif!important;font-weight:900!important;letter-spacing:.2px!important;
      white-space:nowrap!important;box-shadow:0 2px 5px rgba(0,0,0,.78)!important;
    }
  `;
  document.head.appendChild(style);

  function kindFor(type){
    if(['tank','alienTank'].includes(type))return 'tank';
    if(['apc','hover','mercenaryCarrier'].includes(type))return 'transport';
    if(['heli','alienAir'].includes(type))return 'rotor';
    if(['strike','alienStrike'].includes(type))return 'jet';
    return 'soldier';
  }
  function modelMarkup(kind,side){
    if(kind==='tank')return '<i class="u-shadow"></i><i class="u-track"></i><i class="u-hull"></i><i class="u-turret"></i><i class="u-barrel"></i><i class="u-core"></i>';
    if(kind==='transport')return '<i class="u-shadow"></i><i class="u-thruster"></i><i class="u-wheel w1"></i><i class="u-wheel w2"></i><i class="u-wheel w3"></i><i class="u-wheel w4"></i><i class="u-hull"></i><i class="u-cabin"></i><i class="u-window"></i><i class="u-gun"></i>';
    if(kind==='rotor')return '<i class="u-shadow"></i><i class="u-tail"></i><i class="u-fin"></i><i class="u-body"></i><i class="u-glass"></i><i class="u-engine"></i><i class="u-mast"></i><i class="u-rotor"></i>';
    if(kind==='jet')return '<i class="u-shadow"></i><i class="u-wing l"></i><i class="u-wing r"></i><i class="u-fuselage"></i><i class="u-cockpit"></i><i class="u-engine"></i>';
    return '<i class="u-shadow"></i><i class="u-foot l"></i><i class="u-foot r"></i><i class="u-leg l"></i><i class="u-leg r"></i><i class="u-arm l"></i><i class="u-arm r"></i><i class="u-body"></i><i class="u-core"></i><i class="u-head"></i><i class="u-visor"></i><i class="u-weapon"></i>';
  }

  function normalizeUnitMarkers(){
    const map=document.querySelector('#sectorMap');
    if(!map||typeof state==='undefined')return;
    map.querySelectorAll('.territory-token[data-sector]').forEach(token=>{
      const sector=state.grid.find(s=>String(s.id)===String(token.dataset.sector));
      const marker=token.querySelector('.map-unit-marker');
      if(!marker||!sector?.unit)return;
      const unit=sector.unit;
      const side=['human','alien','neutral'].includes(unit.side)?unit.side:'neutral';
      const type=unit.type||(side==='alien'?'alien':side==='neutral'?'mercenary':'infantry');
      const kind=kindFor(type);
      const visible=side!=='neutral'||String(state.selected)===String(sector.id);

      marker.style.setProperty('display',visible?'block':'none','important');
      marker.style.setProperty('position','absolute','important');
      marker.style.setProperty('left','50%','important');
      marker.style.setProperty('top','-70px','important');
      marker.style.setProperty('width',BOX_W+'px','important');
      marker.style.setProperty('height',BOX_H+'px','important');
      marker.style.setProperty('min-width',BOX_W+'px','important');
      marker.style.setProperty('min-height',BOX_H+'px','important');
      marker.style.setProperty('max-width',BOX_W+'px','important');
      marker.style.setProperty('max-height',BOX_H+'px','important');
      marker.style.setProperty('transform','translateX(-50%)','important');
      marker.style.setProperty('overflow','visible','important');
      marker.style.setProperty('background','transparent','important');
      marker.style.setProperty('border','0','important');
      marker.style.setProperty('border-radius','0','important');
      marker.style.setProperty('box-shadow','none','important');
      marker.style.setProperty('z-index','250','important');

      const art=marker.querySelector('span');
      if(art){
        const key=side+':'+type+':'+kind;
        art.className='unit-miniature side-'+side+' kind-'+kind+' type-'+type;
        if(art.dataset.modelKey!==key){art.innerHTML=modelMarkup(kind,side);art.dataset.modelKey=key;}
        art.style.setProperty('display','block','important');
        art.style.setProperty('position','absolute','important');
        art.style.setProperty('left','50%','important');
        art.style.setProperty('top','0','important');
        art.style.setProperty('width',MODEL_W+'px','important');
        art.style.setProperty('height',MODEL_H+'px','important');
        art.style.setProperty('min-width',MODEL_W+'px','important');
        art.style.setProperty('min-height',MODEL_H+'px','important');
        art.style.setProperty('max-width',MODEL_W+'px','important');
        art.style.setProperty('max-height',MODEL_H+'px','important');
        art.style.setProperty('transform','translateX(-50%) perspective(140px) rotateX(5deg)','important');
        art.style.setProperty('background','none','important');
        art.style.setProperty('background-image','none','important');
        art.style.setProperty('background-color','transparent','important');
        art.style.setProperty('border','0','important');
        art.style.setProperty('border-radius','0','important');
        art.style.setProperty('box-shadow','none','important');
        art.style.setProperty('opacity','1','important');
        art.style.setProperty('visibility','visible','important');
        art.style.setProperty('overflow','visible','important');
        art.style.setProperty('z-index','251','important');
      }

      const count=marker.querySelector('b');
      if(count){
        count.style.setProperty('display','block','important');
        count.style.setProperty('position','absolute','important');
        count.style.setProperty('left','50%','important');
        count.style.setProperty('top',COUNT_Y+'px','important');
        count.style.setProperty('transform','translateX(-50%)','important');
        count.style.setProperty('min-width','0','important');
        count.style.setProperty('padding','2px 6px','important');
        count.style.setProperty('border-radius','999px','important');
        count.style.setProperty('border','1px solid rgba(218,238,246,.5)','important');
        count.style.setProperty('background','rgba(3,10,15,.95)','important');
        count.style.setProperty('color','#fff','important');
        count.style.setProperty('font-size','8px','important');
        count.style.setProperty('line-height','1','important');
        count.style.setProperty('z-index','252','important');
      }
    });
  }

  const previousRenderBattle=renderBattle;
  renderBattle=function(){previousRenderBattle();normalizeUnitMarkers();};
  normalizeUnitMarkers();
})();


/* V79 — reference-matched field miniatures: use the actual EMBER/XENON unit renders,
   scaled as small stand-up battlefield pieces instead of synthetic CSS figures. */
(function(){
  const css=document.createElement('style');
  css.textContent=\`
    #battleView .map-unit-marker{
      width:52px!important;height:52px!important;min-width:52px!important;min-height:52px!important;
      max-width:52px!important;max-height:52px!important;background:transparent!important;border:0!important;
      box-shadow:none!important;overflow:visible!important;pointer-events:none!important;
    }
    #battleView .map-unit-marker .v79-field-unit{
      display:block!important;position:absolute!important;left:50%!important;bottom:12px!important;
      width:48px!important;height:44px!important;min-width:48px!important;min-height:44px!important;
      max-width:48px!important;max-height:44px!important;transform:translateX(-50%) perspective(180px) rotateX(4deg)!important;
      transform-origin:50% 100%!important;background-position:center bottom!important;background-repeat:no-repeat!important;
      background-size:contain!important;background-color:transparent!important;border:0!important;border-radius:0!important;
      box-shadow:none!important;filter:drop-shadow(0 5px 3px rgba(0,0,0,.72))!important;overflow:visible!important;
    }
    #battleView .map-unit-marker .v79-field-unit::after{
      content:""!important;position:absolute!important;left:50%!important;bottom:-4px!important;width:34px!important;height:7px!important;
      transform:translateX(-50%)!important;border-radius:50%!important;background:rgba(0,0,0,.42)!important;
      filter:blur(2px)!important;z-index:-1!important;
    }
    #battleView .map-unit-marker>b{
      top:45px!important;font-size:7px!important;padding:2px 5px!important;z-index:500!important;
    }
    @media(max-width:700px){
      #battleView .map-unit-marker{width:44px!important;height:46px!important;min-width:44px!important;min-height:46px!important;max-width:44px!important;max-height:46px!important}
      #battleView .map-unit-marker .v79-field-unit{width:40px!important;height:37px!important;min-width:40px!important;min-height:37px!important;max-width:40px!important;max-height:37px!important;bottom:10px!important}
      #battleView .map-unit-marker>b{top:38px!important;font-size:6px!important}
    }
  \`;
  document.head.appendChild(css);

  function v79Refresh(){
    const map=document.querySelector('#sectorMap');
    if(!map||typeof state==='undefined')return;
    map.querySelectorAll('.territory-token[data-sector]').forEach(token=>{
      const sector=state.grid.find(s=>String(s.id)===String(token.dataset.sector));
      const marker=token.querySelector('.map-unit-marker');
      if(!marker||!sector?.unit)return;
      const unit=sector.unit;
      const neutral=unit.side==='neutral';
      const visible=!neutral||String(state.selected)===String(sector.id);
      marker.style.setProperty('display',visible?'block':'none','important');
      marker.style.setProperty('left','50%','important');
      marker.style.setProperty('top','-42px','important');
      marker.style.setProperty('transform','translateX(-50%)','important');
      marker.style.setProperty('background','transparent','important');
      marker.style.setProperty('border','0','important');
      marker.style.setProperty('box-shadow','none','important');

      const art=marker.querySelector('span');
      if(art){
        art.className='v79-field-unit';
        art.innerHTML='';
        art.style.cssText='';
        art.style.setProperty('background-image',"url('"+artFor(unit)+"')",'important');
      }
      const count=marker.querySelector('b');
      if(count){
        count.style.setProperty('display','block','important');
        count.style.setProperty('position','absolute','important');
        count.style.setProperty('left','50%','important');
        count.style.setProperty('transform','translateX(-50%)','important');
        count.style.setProperty('background','rgba(3,10,15,.94)','important');
        count.style.setProperty('color','#fff','important');
        count.style.setProperty('border','1px solid rgba(220,238,246,.45)','important');
        count.style.setProperty('border-radius','999px','important');
        count.style.setProperty('line-height','1','important');
        count.style.setProperty('white-space','nowrap','important');
      }
    });
  }
  const v78RenderBattle=renderBattle;
  renderBattle=function(){v78RenderBattle();v79Refresh();};
  v79Refresh();
})();


/* V80 — slightly larger field miniatures. */
(function(){
  const style=document.createElement('style');
  style.textContent=\`
    #battleView .map-unit-marker .v79-field-unit{
      width:58px!important;height:53px!important;min-width:58px!important;min-height:53px!important;
      max-width:58px!important;max-height:53px!important;bottom:12px!important;
    }
    #battleView .map-unit-marker>b{top:53px!important}
    @media(max-width:700px){
      #battleView .map-unit-marker .v79-field-unit{
        width:49px!important;height:45px!important;min-width:49px!important;min-height:45px!important;
        max-width:49px!important;max-height:45px!important;bottom:10px!important;
      }
      #battleView .map-unit-marker>b{top:46px!important}
    }
  \`;
  document.head.appendChild(style);
})();
