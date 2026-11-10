import bpy, math, os

OUT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','assets','models'))
os.makedirs(OUT,exist_ok=True)

def clear():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def mat(name,color,metal=0.0,rough=.5,emission=None):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.diffuse_color=(*color,1)
    m.metallic=metal; m.roughness=rough
    if emission:
        m.use_nodes=True
        p=m.node_tree.nodes.get('Principled BSDF')
        p.inputs['Emission Color'].default_value=(*emission,1)
        p.inputs['Emission Strength'].default_value=3.0
    return m

def pivot(name,parent,loc):
    o=bpy.data.objects.new(name,None)
    bpy.context.collection.objects.link(o)
    o.parent=parent; o.location=loc
    return o

def cube(name,parent,loc,scale,material,rot=(0,0,0),bevel=.02):
    bpy.ops.mesh.primitive_cube_add(location=(0,0,0),rotation=(0,0,0))
    o=bpy.context.object; o.name=name; o.parent=parent; o.location=loc; o.rotation_euler=rot; o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    if bevel:
        b=o.modifiers.new('edge bevel','BEVEL'); b.width=bevel; b.segments=2
    return o

def sphere(name,parent,loc,scale,material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=(0,0,0))
    o=bpy.context.object; o.name=name; o.parent=parent; o.location=loc; o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material); return o

def cyl(name,parent,loc,radius,depth,material,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=radius,depth=depth,location=(0,0,0))
    o=bpy.context.object; o.name=name; o.parent=parent; o.location=loc; o.rotation_euler=rot
    o.data.materials.append(material)
    b=o.modifiers.new('edge bevel','BEVEL'); b.width=.012; b.segments=2
    return o

def build_infantry(faction):
    clear()
    ember=faction=='ember'
    dark=mat('black composite',(.018,.024,.030),.55,.34)
    cloth=mat('combat cloth',(.12,.15,.16) if ember else (.025,.020,.028),.05,.78)
    primary=mat('blue armor',(.04,.22,.43),.6,.30) if ember else mat('graphite shell',(.07,.075,.085),.76,.27)
    trim=mat('sand armor',(.47,.36,.23),.38,.45) if ember else mat('red alloy',(.22,.004,.008),.65,.26)
    glow=mat('visor glow',(.02,.48,1.0),.18,.18,(.02,.35,1.0)) if ember else mat('red energy',(.8,.01,.02),.2,.18,(1,.0,.01))
    root=pivot('AnimRoot',None,(0,0,0))
    # torso and load-bearing equipment
    cube('pelvis',root,(0,.02,1.03),(.31,.20,.17),dark,bevel=.05)
    cube('torso undersuit',root,(0,.03,1.35),(.34,.22,.30),cloth,bevel=.07)
    cube('front armor',root,(0,-.205,1.42),(.37,.045,.27),primary,bevel=.045)
    cube('chest plate',root,(0,-.258,1.46),(.25,.018,.14),trim,bevel=.015)
    cube('backpack',root,(0,.255,1.42),(.25,.09,.31),dark,bevel=.04)
    # actual legs: hip -> knee -> lower leg -> foot
    for side,label in [(-1,'Left'),(1,'Right')]:
        hip=pivot(label+'LegPivot',root,(side*.19,.0,1.08))
        cyl(label+' thigh',hip,(0,.015,-.22),.105,.42,cloth)
        cube(label+' thigh armor',hip,(0,-.095,-.20),(.13,.055,.18),trim,bevel=.025)
        knee=pivot(label+'KneePivot',hip,(0,.0,-.46))
        sphere(label+' knee',knee,(0,-.05,0),(.13,.10,.11),primary)
        cyl(label+' shin',knee,(0,.015,-.23),.09,.40,cloth)
        cube(label+' shin armor',knee,(0,-.09,-.23),(.12,.06,.18),primary,bevel=.022)
        cube(label+' boot',knee,(0,-.11,-.47),(.14,.23,.08),dark,bevel=.03)
    # shoulders / arms are pivoted independently for the running motion.
    for side,label in [(-1,'Left'),(1,'Right')]:
        shoulder=pivot(label+'ArmPivot',root,(side*.39,.0,1.56))
        sphere(label+' pauldron',shoulder,(0,0,0),(.20,.19,.16),primary)
        cyl(label+' upper arm',shoulder,(0,.0,-.20),.082,.34,cloth)
        sphere(label+' elbow',shoulder,(0,-.01,-.39),(.09,.09,.09),trim)
        cyl(label+' forearm',shoulder,(0,-.07,-.55),.078,.27,primary,rot=(math.radians(14),0,0))
    # head is independent but remains a physical, shaded mesh.
    sphere('helmet',root,(0,0,1.88),(.25,.23,.23),primary)
    cube('visor',root,(0,-.225,1.87),(.18,.018,.055),glow,bevel=.008)
    cube('jaw seal',root,(0,-.205,1.75),(.16,.04,.06),trim,bevel=.012)
    cyl('antenna',root,(.18,.03,2.12),.012,.28,dark,rot=(math.radians(-8),0,0))
    # A dedicated weapon pivot receives the firing pose from Godot.
    weapon=pivot('WeaponPivot',root,(0,-.37,1.18))
    cube('rifle receiver',weapon,(0,0,0),(.12,.11,.25),dark,rot=(math.radians(12),0,0),bevel=.018)
    cube('rifle casing',weapon,(0,-.08,.10),(.15,.07,.12),primary,bevel=.014)
    cyl('rifle barrel',weapon,(0,-.34,-.25),.033,.43,dark,rot=(math.radians(12),0,0))
    cube('rifle optic',weapon,(0,-.02,.16),(.065,.07,.06),glow,bevel=.008)
    cube('rifle magazine',weapon,(0,.02,-.15),(.065,.055,.13),trim,bevel=.008)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,faction+'_infantry.glb'),export_format='GLB',use_selection=True,export_apply=True)

build_infantry('ember')
build_infantry('xenon')
print('rigged infantry exported')
