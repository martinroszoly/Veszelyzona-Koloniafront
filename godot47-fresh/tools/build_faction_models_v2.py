import bpy, math, os

OUT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','assets','models'))
os.makedirs(OUT,exist_ok=True)

def clear():
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def material(name,c,metal=.15,rough=.55,emit=None):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.diffuse_color=(*c,1); m.metallic=metal; m.roughness=rough
    if emit:
        m.use_nodes=True; p=m.node_tree.nodes['Principled BSDF']; p.inputs['Emission Color'].default_value=(*emit,1); p.inputs['Emission Strength'].default_value=4
    return m
def done(o,m,b=.025):
    o.data.materials.append(m)
    if b:
        q=o.modifiers.new('bevel','BEVEL'); q.width=b; q.segments=2
    return o
def box(n,p,s,m,r=(0,0,0),b=.025):
    bpy.ops.mesh.primitive_cube_add(location=p,rotation=r); o=bpy.context.object; o.name=n; o.scale=s; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); return done(o,m,b)
def sphere(n,p,s,m,seg=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=10,location=p); o=bpy.context.object; o.name=n; o.scale=s; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); return done(o,m,.02)
def cyl(n,p,rad,dep,m,r=(0,0,0),v=16):
    bpy.ops.mesh.primitive_cylinder_add(vertices=v,radius=rad,depth=dep,location=p,rotation=r); o=bpy.context.object; o.name=n; return done(o,m,.018)
def cone(n,p,rad,dep,m,r=(0,0,0)):
    bpy.ops.mesh.primitive_cone_add(vertices=10,radius1=rad,radius2=.02,depth=dep,location=p,rotation=r); o=bpy.context.object; o.name=n; return done(o,m,.015)
def export(n):
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,n+'.glb'),export_format='GLB',use_selection=True,export_apply=True)

navy=material('EMBER dark blue',(.018,.075,.14),.55,.36)
blue=material('EMBER blue armor',(.055,.25,.47),.6,.32)
steel=material('EMBER pale armor',(.52,.62,.67),.55,.38)
rubber=material('Rubber',(0.012,.016,.018),.05,.82)
gun=material('Weapon metal',(.025,.03,.035),.78,.24)
optic=material('EMBER optic',(.02,.42,.85),.2,.2,(.02,.38,1))
xred=material('XENON shell',(.28,.004,.012),.38,.32)
xedge=material('XENON red edge',(.68,.012,.022),.45,.25)
xflesh=material('XENON dark tissue',(.035,.003,.006),.05,.66)
xglow=material('XENON energy',(.72,.005,.012),.1,.18,(1,0,.01))

def ember_infantry():
    clear()
    # Heavy realistic proportions: boots, plated shins, thighs.
    for x in (-.17,.17):
        box('boot',(x,-.06,.13),(.15,.25,.11),rubber,b=.04)
        cyl('lower leg',(x,.015,.43),.10,.46,navy,v=12)
        box('shin plate',(x,-.11,.45),(.13,.08,.23),steel,r=(math.radians(-7),0,0),b=.04)
        sphere('knee',(x,-.05,.70),(.14,.13,.12),blue)
        cyl('upper leg',(x,.03,.86),.12,.32,navy,r=(math.radians(-5),0,0),v=12)
    box('armored pelvis',(0,.02,.96),(.34,.23,.20),navy,b=.07)
    box('abdomen',(0,.02,1.18),(.31,.22,.24),rubber,b=.08)
    box('massive chest',(0,.015,1.42),(.48,.27,.32),blue,b=.10)
    box('front chest plate',(0,-.275,1.44),(.37,.045,.24),steel,r=(math.radians(6),0,0),b=.035)
    box('chest insignia',(0,-.325,1.52),(.09,.018,.07),blue,b=.008)
    box('power pack',(0,.31,1.39),(.38,.18,.35),navy,b=.07)
    for x in (-.50,.50):
        sphere('large pauldron',(x,0,1.49),(.25,.29,.22),blue)
        box('pauldron plate',(x,-.13,1.51),(.22,.10,.18),steel,r=(0,0,math.radians(-8 if x<0 else 8)),b=.045)
        cyl('upper arm',(x,.01,1.23),.10,.34,navy,r=(0,0,math.radians(-7 if x<0 else 7)),v=12)
        sphere('elbow',(x,-.03,1.04),(.115,.12,.11),steel)
        cyl('forearm',(x,-.08,.90),.11,.32,blue,r=(math.radians(8),0,0),v=12)
    cyl('neck',(0,0,1.70),.13,.13,rubber,v=12)
    sphere('helmet',(0,0,1.84),(.29,.28,.25),blue)
    box('helmet brow',(0,-.27,1.88),(.28,.055,.085),steel,b=.025)
    box('dark visor',(0,-.325,1.82),(.23,.025,.065),optic,b=.012)
    for x in (-.24,.24): box('helmet side armor',(x,.0,1.84),(.075,.19,.15),steel,r=(0,0,math.radians(x*18)),b=.025)
    # Compact rifle held in front.
    box('rifle body',(0,-.46,1.08),(.12,.11,.39),gun,r=(math.radians(12),0,0),b=.025)
    box('rifle blue casing',(0,-.49,1.20),(.16,.12,.14),blue,b=.025)
    cyl('rifle barrel',(0,-.63,.72),.045,.52,gun,r=(math.radians(12),0,0),v=12)
    make_infantry_animation_rig()
    export('ember_infantry')

def xenon_infantry():
    clear()
    # Broad, forward-leaning beast-like alien rather than a humanoid.
    sphere('horizontal torso',(0,.03,1.05),(.56,.72,.38),xred)
    sphere('armored back',(0,.25,1.29),(.46,.55,.24),xedge)
    box('rib armor',(0,-.26,1.05),(.43,.20,.25),xred,r=(math.radians(15),0,0),b=.10)
    sphere('low head',(0,-.62,1.19),(.34,.37,.28),xflesh)
    box('face plate',(0,-.91,1.18),(.29,.10,.20),xred,r=(math.radians(-7),0,0),b=.07)
    for x in (-.16,.16): sphere('red eye',(x,-1.02,1.22),(.055,.035,.045),xglow)
    for x in (-.38,.38): cone('head horn',(x*.65,-.67,1.48),.12,.48,xedge,r=(math.radians(-12),0,math.radians(-18 if x<0 else 18)))
    # Huge front limbs carry most of the silhouette.
    for x in (-.48,.48):
        sphere('shoulder mass',(x,-.20,1.16),(.28,.34,.30),xedge)
        cyl('front upper limb',(x,-.43,.83),.16,.56,xred,r=(math.radians(-18),0,math.radians(-8 if x<0 else 8)),v=12)
        sphere('front knuckle',(x,-.59,.51),(.20,.23,.17),xflesh)
        cone('front claw',(x,-.82,.36),.13,.48,xedge,r=(math.radians(65),0,0))
    # Short digitigrade rear legs.
    for x in (-.34,.34):
        sphere('rear hip',(x,.39,.90),(.22,.27,.22),xred)
        cyl('rear leg',(x,.48,.58),.14,.48,xflesh,r=(math.radians(12),0,0),v=12)
        box('rear foot',(x,.26,.28),(.18,.31,.12),xred,r=(math.radians(-8),0,0),b=.05)
    for x in (-.36,.36): cone('back spine',(x,.35,1.57),.14,.58,xedge,r=(math.radians(-8),0,math.radians(-18 if x<0 else 18)))
    box('organic weapon',(0,-.72,.80),(.16,.35,.14),xflesh,r=(math.radians(18),0,0),b=.08)
    sphere('weapon core',(0,-.93,.71),(.13,.16,.12),xglow)
    make_infantry_animation_rig()
    export('xenon_infantry')

def ember_vehicle():
    clear()
    # Long eight-wheeled APC from the reference.
    box('lower chassis',(0,0,.58),(1.02,1.80,.30),navy,b=.10)
    box('main troop hull',(0,.12,1.00),(.93,1.52,.43),blue,b=.12)
    box('sloped driver glacis',(0,-1.48,1.02),(.86,.35,.40),steel,r=(math.radians(22),0,0),b=.08)
    box('roof armor',(0,.20,1.42),(.80,1.18,.14),steel,b=.05)
    box('rear module',(0,1.39,1.13),(.82,.24,.50),navy,b=.06)
    for side in (-1,1):
        box('side segmented armor',(side*1.01,.05,.98),(.10,1.50,.34),steel,b=.035)
        for y in (-1.28,-.44,.44,1.28):
            cyl('wheel',(side*1.08,y,.45),.32,.23,rubber,r=(0,math.radians(90),0),v=20)
            cyl('wheel hub',(side*1.21,y,.45),.13,.05,blue,r=(0,math.radians(90),0),v=16)
    cyl('remote turret',(0,-.28,1.66),.34,.20,blue,v=12)
    box('turret gun',(0,-.88,1.69),(.07,.65,.065),gun,b=.018)
    for x in (-.48,.48): box('front lamp',(x,-1.82,.91),(.12,.035,.085),optic,b=.015)
    export('ember_vehicle')

def xenon_vehicle():
    clear()
    # Floating, elongated alien carrier: no legs, no wheels. Dense layered carapace.
    sphere('levitating underbody',(0,.10,1.10),(1.03,1.90,.38),xflesh)
    sphere('main red carrier hull',(0,.06,1.48),(1.12,1.82,.56),xred)
    sphere('upper armored shell',(0,.24,1.78),(.91,1.40,.34),xedge)
    box('front wedge carapace',(0,-1.55,1.50),(.82,.39,.34),xred,r=(math.radians(16),0,0),b=.16)
    box('rear cargo carapace',(0,1.40,1.62),(.82,.38,.43),xred,r=(math.radians(-10),0,0),b=.14)
    # Layered side armor ribs make the body feel grown rather than box-built.
    for side in (-1,1):
        for y in (-1.15,-.58,0,.58,1.15):
            sphere('side armor node',(side*.98,y,1.52),(.18,.30,.25),xedge)
            cone('side spike',(side*1.17,y,1.58),.105,.42,xedge,r=(0,math.radians(90*side),0))
    for y in (-.82,-.30,.30,.82):
        box('spinal plate',(0,y,2.10),(.36,.19,.10),xedge,r=(0,0,math.radians(6 if y<0 else -6)),b=.04)
    # Four distinct anti-gravity engines sit below the belly, with red energy cores.
    for x in (-.64,.64):
        for y in (-.82,.82):
            cyl('hover engine housing',(x,y,.90),.22,.20,xflesh,v=16)
            cone('hover plume',(x,y,.67),.18,.42,xedge,r=(math.pi,0,0))
            sphere('hover core',(x,y,.78),(.105,.105,.08),xglow)
    # Forward organic turret and hard-surface cannon assembly.
    sphere('weapon cradle',(0,-.72,1.98),(.43,.48,.25),xflesh)
    box('cannon mantle',(0,-1.05,1.99),(.18,.28,.16),xedge,b=.07)
    cyl('long bio cannon',(0,-1.72,2.00),.105,1.20,xedge,r=(math.radians(90),0,0),v=16)
    cyl('cannon inner bore',(0,-2.34,2.00),.065,.08,xflesh,r=(math.radians(90),0,0),v=16)
    sphere('muzzle energy',(0,-2.40,2.00),(.12,.06,.12),xglow)
    for x in (-.31,.31): sphere('front sensor',(x,-1.87,1.50),(.085,.045,.07),xglow)
    for x in (-.48,.48): cone('crest',(x,.56,2.20),.13,.48,xedge,r=(0,0,math.radians(-16 if x<0 else 16)))
    export('xenon_vehicle')

## Final runtime meshes: true geometry only (no camera-facing cards).
## The detailed subassemblies deliberately stay readable from the RTS camera.
tan=material('EMBER sand ceramic',(.46,.33,.20),.38,.42)
black=material('EMBER black fabric',(.012,.016,.019),.08,.7)
redsteel=material('XENON graphite',(.055,.058,.065),.75,.28)
redtrim=material('XENON scarlet alloy',(.24,.005,.008),.72,.25)

def make_infantry_animation_rig():
    # GLTF node pivots exported with the mesh. Godot rotates these nodes at run time,
    # giving the infantry real articulated motion rather than camera-facing sprites.
    root=bpy.data.objects.new('AnimRoot',None); bpy.context.collection.objects.link(root)
    pivots={
        'LeftLegPivot':(-.19,0,1.16), 'RightLegPivot':(.19,0,1.16),
        'LeftArmPivot':(-.34,0,1.54), 'RightArmPivot':(.34,0,1.54),
        'WeaponPivot':(0,-.42,1.21),
    }
    nodes={}
    for name,pos in pivots.items():
        node=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(node); node.location=pos; node.parent=root; nodes[name]=node
    leg_words=('boot','ankle','shin','thigh','knee','digitigrade','reverse','toe','claw')
    arm_words=('shoulder','upper arm','forearm','elbow')
    gun_words=('rifle','plasma','weapon core','magazine')
    for obj in list(bpy.context.scene.objects):
        if obj.type!='MESH': continue
        lower=obj.name.lower()
        parent=None
        if any(word in lower for word in leg_words):
            parent=nodes['LeftLegPivot'] if obj.location.x < 0 else nodes['RightLegPivot']
        elif any(word in lower for word in arm_words):
            parent=nodes['LeftArmPivot'] if obj.location.x < 0 else nodes['RightArmPivot']
        elif any(word in lower for word in gun_words):
            parent=nodes['WeaponPivot']
        if parent:
            matrix=obj.matrix_world.copy(); obj.parent=parent; obj.matrix_world=matrix
    # The weapon follows the right hand, but still has its own recoil/aim pivot.
    matrix=nodes['WeaponPivot'].matrix_world.copy(); nodes['WeaponPivot'].parent=nodes['RightArmPivot']; nodes['WeaponPivot'].matrix_world=matrix

def torus(n,p,major,minor,m,r=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=20,minor_segments=8,location=p,rotation=r)
    o=bpy.context.object; o.name=n; return done(o,m,0)

def ember_infantry_final():
    clear()
    # boots / articulated legs
    for x in (-.19,.19):
        box('armored boot',(x,-.10,.10),(.15,.25,.095),rubber,b=.035)
        cyl('ankle piston',(x,.02,.27),.075,.22,gun,v=12)
        box('shin shell',(x,-.065,.48),(.14,.13,.25),tan,r=(math.radians(-5),0,0),b=.035)
        cyl('shin core',(x,.045,.48),.105,.48,black,v=12)
        sphere('knee armor',(x,-.10,.76),(.15,.10,.13),blue)
        cyl('thigh core',(x,.025,1.00),.13,.37,black,v=12)
        box('thigh plate',(x,-.09,1.00),(.15,.08,.19),tan,b=.03)
        for z in (.35,.50,.65): box('shin seam',(x,-.205,z),(.105,.012,.012),steel,b=.003)
    box('combat belt',(0,.0,1.20),(.36,.22,.10),black,b=.045)
    for x in (-.26,.26): box('utility pouch',(x,-.20,1.22),(.10,.07,.11),tan,b=.02)
    box('under vest',(0,.04,1.43),(.37,.23,.28),black,b=.06)
    box('front plate carrier',(0,-.19,1.46),(.41,.055,.29),tan,b=.05)
    box('chest armor',(0,-.245,1.54),(.29,.026,.16),blue,b=.018)
    for x in (-.34,.34):
        sphere('shoulder pauldron',(x,-.01,1.58),(.22,.20,.17),blue)
        box('pauldron trim',(x,-.17,1.61),(.16,.035,.10),tan,b=.015)
        cyl('upper arm',(x,.0,1.30),.10,.36,black,r=(0,0,math.radians(-8 if x<0 else 8)),v=12)
        sphere('elbow',(x,-.02,1.10),(.10,.10,.10),tan)
        cyl('forearm',(x,-.13,.99),.09,.28,blue,r=(math.radians(16),0,0),v=12)
    # helmet has visor, jaw seal, antenna and rear pack.
    cyl('neck seal',(0,0,1.72),.13,.13,black,v=12)
    sphere('helmet shell',(0,.0,1.86),(.275,.25,.24),blue)
    sphere('visor recess',(0,-.235,1.84),(.205,.035,.08),black)
    box('blue visor',(0,-.274,1.85),(.17,.012,.045),optic,b=.008)
    box('helmet crown',(0,.0,2.05),(.18,.17,.045),tan,b=.015)
    box('jaw respirator',(0,-.235,1.73),(.18,.05,.065),tan,b=.015)
    cyl('antenna',(.20,.07,2.16),.016,.35,gun,r=(math.radians(-8),0,0),v=8)
    box('radio pack',(0,.27,1.47),(.26,.10,.34),navy,b=.04)
    # layered rifle: receiver, stock, handguard, scope and muzzle.
    box('rifle receiver',(0,-.45,1.18),(.13,.12,.28),gun,r=(math.radians(13),0,0),b=.018)
    box('rifle handguard',(0,-.64,.91),(.085,.09,.33),gun,r=(math.radians(13),0,0),b=.012)
    cyl('rifle barrel',(0,-.84,.67),.033,.35,gun,r=(math.radians(13),0,0),v=10)
    box('rifle optic',(0,-.49,1.33),(.07,.12,.09),black,b=.01)
    box('magazine',(0,-.43,1.02),(.07,.06,.15),tan,r=(math.radians(-7),0,0),b=.01)
    make_infantry_animation_rig()
    export('ember_infantry')

def xenon_infantry_final():
    clear()
    # digitigrade legs and articulated, sharp graphite armor.
    for x in (-.18,.18):
        sphere('hip joint',(x,.08,.95),(.13,.13,.15),redsteel)
        cyl('upper digitigrade',(x,.08,.73),.09,.40,xflesh,r=(math.radians(-17),0,0),v=12)
        box('upper carapace',(x,-.03,.76),(.12,.08,.21),redsteel,r=(math.radians(-17),0,0),b=.025)
        sphere('knee actuator',(x,-.02,.52),(.11,.10,.11),redtrim)
        cyl('reverse shin',(x,.13,.31),.08,.39,xflesh,r=(math.radians(28),0,0),v=12)
        box('clawed foot',(x,-.13,.10),(.13,.25,.06),redsteel,b=.025)
        for toe in (-.06,.06): cone('toe claw',(x+toe,-.36,.09),.035,.18,redtrim,r=(math.radians(90),0,0))
    sphere('ribbed torso',(0,.02,1.25),(.37,.25,.39),xflesh)
    for z in (1.10,1.24,1.38): torus('energy rib',(0,-.02,z),.28,.024,xglow,r=(math.radians(90),0,0))
    box('chest carapace',(0,-.25,1.31),(.36,.07,.32),redsteel,b=.06)
    for x in (-.38,.38):
        sphere('shoulder node',(x,0,1.49),(.20,.18,.19),redsteel)
        cone('shoulder blade',(x*1.12,.02,1.55),.14,.35,redtrim,r=(0,math.radians(-90*x),0))
        cyl('upper arm',(x,-.03,1.25),.085,.34,xflesh,r=(0,0,math.radians(-12 if x<0 else 12)),v=12)
        sphere('elbow actuator',(x,-.10,1.07),(.10,.09,.10),redtrim)
        cyl('forearm',(x,-.23,.99),.085,.28,redsteel,r=(math.radians(15),0,0),v=12)
    sphere('elongated skull',(0,.02,1.78),(.28,.31,.25),redsteel)
    cone('swept crest',(0,.22,2.00),.19,.47,redtrim,r=(math.radians(-34),0,0))
    for x in (-.13,.13): sphere('eye glow',(x,-.275,1.79),(.052,.025,.04),xglow)
    box('mandible',(0,-.28,1.66),(.17,.05,.07),xflesh,b=.015)
    # asymmetric plasma rifle with energy core.
    box('plasma receiver',(0,-.50,1.11),(.14,.11,.27),redsteel,r=(math.radians(12),0,0),b=.025)
    cyl('plasma barrel',(0,-.78,.82),.055,.48,redtrim,r=(math.radians(12),0,0),v=12)
    torus('plasma coil',(0,-.64,.96),.085,.018,xglow,r=(math.radians(90),0,0))
    sphere('weapon core',(0,-.54,1.13),(.075,.055,.075),xglow)
    make_infantry_animation_rig()
    export('xenon_infantry')

def ember_vehicle_final():
    clear()
    # actual 8x8 APC with layered hull, wheels, stowage and a small remote weapon station.
    box('lower hull',(0,0,.46),(1.00,1.85,.28),navy,b=.11)
    box('troop compartment',(0,.08,.92),(.93,1.42,.42),steel,b=.10)
    box('sloped glacis',(0,-1.52,.91),(.86,.33,.35),tan,r=(math.radians(24),0,0),b=.07)
    box('roof armor',(0,.10,1.38),(.79,1.18,.10),tan,b=.035)
    for side in (-1,1):
        for y in (-1.28,-.43,.43,1.28):
            cyl('tire',(side*1.08,y,.37),.31,.22,rubber,r=(0,math.radians(90),0),v=20)
            torus('wheel rim',(side*1.25,y,.37),.15,.035,blue,r=(0,math.radians(90),0))
            box('fender',(side*1.02,y,.77),(.10,.31,.10),tan,b=.02)
        for y in (-.86,0,.86): box('side armor slab',(side*1.01,y,.98),(.075,.30,.21),blue,b=.025)
    for x in (-.52,.52): box('front light',(x,-1.86,.78),(.11,.025,.065),optic,b=.008)
    for y in (-.70,.02,.72): box('roof stowage',(-.57,y,1.54),(.19,.18,.10),tan,b=.02)
    cyl('remote weapon base',(0,-.28,1.55),.30,.14,gun,v=16)
    box('remote weapon housing',(0,-.35,1.73),(.22,.19,.13),blue,b=.035)
    cyl('remote autocannon',(0,-.76,1.73),.052,.63,gun,r=(math.radians(90),0,0),v=12)
    box('sensor block',(0,-.43,1.86),(.09,.07,.06),optic,b=.01)
    export('ember_vehicle')

def xenon_vehicle_final():
    clear()
    # Low hovering APC, same footprint as the Ember carrier; no legs and no tank cannon.
    sphere('hover underbody',(0,.03,.85),(1.02,1.82,.28),xflesh)
    box('alien troop cabin',(0,.08,1.23),(1.00,1.48,.37),redsteel,b=.15)
    box('wedge prow',(0,-1.50,1.20),(.83,.38,.31),redsteel,r=(math.radians(18),0,0),b=.12)
    for side in (-1,1):
        for y in (-.88,0,.88):
            box('segmented carapace',(side*1.01,y,1.29),(.08,.31,.20),redtrim,b=.035)
            box('red seam',(side*1.10,y,1.30),(.008,.19,.025),xglow,b=0)
        for y in (-1.05,1.05):
            cyl('levitation ring',(side*.77,y,.77),.25,.14,redsteel,v=20)
            torus('hover emitter',(side*.77,y,.69),.15,.026,xglow,r=(0,0,0))
    for y in (-.85,-.25,.35,.95): box('spine plate',(0,y,1.64),(.45,.16,.06),redtrim,b=.02)
    # compact defensive turret, deliberately much smaller than a tank turret.
    cyl('small turret ring',(0,-.33,1.61),.24,.10,redsteel,v=16)
    sphere('turret pod',(0,-.38,1.76),(.20,.18,.14),redtrim)
    for x in (-.07,.07): cyl('short plasma barrel',(x,-.67,1.77),.030,.32,xglow,r=(math.radians(90),0,0),v=10)
    for x in (-.52,.52): sphere('prow sensor',(x,-1.67,1.22),(.055,.025,.05),xglow)
    export('xenon_vehicle')

ember_infantry_final(); xenon_infantry_final(); ember_vehicle_final(); xenon_vehicle_final()
print('Final true 3D faction meshes exported')
