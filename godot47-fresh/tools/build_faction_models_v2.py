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
    # Long rectangular living carrier suspended between arched crab legs.
    box('dark belly',(0,.05,.74),(.88,1.78,.25),xflesh,b=.16)
    sphere('long organic hull',(0,.05,1.14),(1.02,1.72,.52),xred)
    box('armored cargo back',(0,.32,1.39),(.72,1.10,.26),xedge,r=(math.radians(-4),0,0),b=.13)
    box('front armored snout',(0,-1.46,1.13),(.75,.36,.35),xred,r=(math.radians(12),0,0),b=.12)
    # Three large arched legs per side form the recognizable spider carrier silhouette.
    for side in (-1,1):
        for y in (-1.10,0,1.10):
            sphere('leg shoulder',(side*.91,y,1.04),(.22,.28,.24),xedge)
            cyl('upper arched leg',(side*1.20,y,.77),.13,.72,xred,r=(0,math.radians(90),math.radians(-28*side)),v=12)
            sphere('leg joint',(side*1.46,y,.52),(.17,.20,.16),xglow)
            cyl('lower leg',(side*1.58,y,.29),.11,.55,xflesh,r=(0,math.radians(90),math.radians(28*side)),v=10)
            cone('ground claw',(side*1.78,y,.14),.14,.44,xedge,r=(0,math.radians(90*side),0))
    sphere('weapon carapace',(0,-.68,1.63),(.43,.52,.26),xflesh)
    cyl('long bio cannon',(0,-1.50,1.62),.11,1.35,xedge,r=(math.radians(90),0,0),v=12)
    sphere('muzzle energy',(0,-2.17,1.62),(.15,.08,.15),xglow)
    for x in (-.30,.30): sphere('sensor eye',(x,-1.80,1.18),(.09,.05,.07),xglow)
    for x in (-.48,.48): cone('hull spike',(x,.72,1.82),.13,.55,xedge,r=(0,0,math.radians(-18 if x<0 else 18)))
    export('xenon_vehicle')

ember_infantry(); xenon_infantry(); ember_vehicle(); xenon_vehicle()
print('V2 reference-matched models exported')
