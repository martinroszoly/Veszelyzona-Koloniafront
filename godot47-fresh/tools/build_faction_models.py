import bpy
import math
import os

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "models"))
os.makedirs(OUT, exist_ok=True)

def clear():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def mat(name, color, metallic=0.0, rough=0.55, emission=None):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.metallic = metallic
    m.roughness = rough
    if emission:
        m.use_nodes = True
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        bsdf.inputs['Emission Color'].default_value = (*emission, 1)
        bsdf.inputs['Emission Strength'].default_value = 3.0
    return m

def finish(obj, material, bevel=0.04):
    obj.data.materials.append(material)
    if bevel > 0:
        mod = obj.modifiers.new('Edge bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
    return obj

def cube(name, loc, scale, material, rot=(0,0,0), bevel=0.04):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o=bpy.context.object; o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o, material, bevel)

def uv(name, loc, scale, material, seg=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=8, location=loc)
    o=bpy.context.object; o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o, material, 0.025)

def cyl(name, loc, radius, depth, material, rot=(0,0,0), vertices=16):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rot)
    o=bpy.context.object; o.name=name
    return finish(o, material, 0.025)

def cone(name, loc, radius, depth, material, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=radius, radius2=0.015, depth=depth, location=loc, rotation=rot)
    o=bpy.context.object; o.name=name
    return finish(o, material, 0.02)

def export(name):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name+'.glb'), export_format='GLB', use_selection=True, export_apply=True)

blue=mat('Ember navy',(0.035,0.14,0.27),0.45,0.42)
blue2=mat('Ember armor',(0.10,0.37,0.63),0.52,0.35)
white=mat('Ember markings',(0.68,0.76,0.78),0.25,0.48)
dark=mat('Dark mechanics',(0.025,0.035,0.045),0.7,0.3)
amber=mat('Amber optics',(0.12,0.55,0.95),0.2,0.25,(0.05,0.45,1.0))
red=mat('Xenon carapace',(0.34,0.012,0.025),0.42,0.33)
red2=mat('Xenon edge',(0.72,0.025,0.045),0.35,0.28)
blackred=mat('Xenon underbody',(0.055,0.008,0.012),0.25,0.48)
glowred=mat('Xenon glow',(0.5,0.0,0.015),0.1,0.2,(1.0,0.0,0.03))

def ember_soldier():
    clear()
    # armored legs and boots
    for x in (-0.16,0.16):
        cyl('Leg', (x,0,0.52), .105,.62, blue, vertices=10)
        cube('Knee armor',(x,-.045,.62),(.14,.12,.11),blue2,rot=(math.radians(8),0,0))
        cube('Boot',(x,-.08,.19),(.145,.22,.12),dark)
    cube('Pelvis',(0,0,.82),(.34,.22,.18),blue)
    cube('Torso',(0,0,1.18),(.43,.25,.40),blue2,bevel=.09)
    cube('Chest white mark',(0,-.265,1.27),(.19,.025,.12),white,bevel=.015)
    cube('Backpack',(0,.30,1.18),(.34,.18,.36),blue)
    for x in (-.48,.48):
        uv('Shoulder',(x,0,1.35),(.22,.25,.20),blue2)
        cyl('Arm',(x,0,1.05),.095,.55,blue,rot=(0,0,math.radians(-8 if x<0 else 8)),vertices=10)
    cyl('Neck',(0,0,1.60),.12,.15,dark)
    uv('Helmet',(0,0,1.79),(.31,.28,.30),blue2)
    cube('Visor',(0,-.265,1.80),(.22,.035,.075),amber,bevel=.015)
    for x in (-.23,.23): cube('Helmet wing',(x,.01,1.83),(.10,.18,.055),white,rot=(0,math.radians(x*35),math.radians(x*35)))
    # rifle across chest
    cube('Rifle',(0,-.47,1.02),(.10,.08,.58),dark,rot=(math.radians(18),0,0),bevel=.025)
    cube('Rifle casing',(0,-.48,1.18),(.15,.10,.20),blue)
    export('ember_infantry')

def xenon_soldier():
    clear()
    for x in (-.18,.18):
        cyl('Digitigrade leg',(x,0,.48),.115,.72,blackred,rot=(math.radians(8),0,0),vertices=8)
        cone('Shin blade',(x,-.10,.48),.15,.42,red2,rot=(math.radians(70),0,0))
        cube('Claw foot',(x,-.16,.13),(.16,.28,.10),red)
    uv('Pelvis',(0,0,.82),(.38,.24,.22),red)
    uv('Carapace torso',(0,0,1.22),(.48,.28,.48),red)
    cube('Core',(0,-.27,1.25),(.16,.035,.20),glowred,bevel=.03)
    for x in (-.46,.46):
        cone('Shoulder spike',(x,0,1.46),.20,.55,red2,rot=(0,0,math.radians(-72 if x<0 else 72)))
        cyl('Arm',(x,0,1.08),.10,.58,blackred,vertices=8)
        cone('Forearm blade',(x,-.10,.96),.12,.46,red2,rot=(math.radians(65),0,0))
    uv('Head',(0,-.02,1.73),(.25,.23,.27),red)
    for x in (-.12,.12): uv('Eye',(x,-.225,1.76),(.055,.025,.045),glowred,seg=12)
    for x in (-.20,.20): cone('Crown horn',(x,.01,1.96),.09,.42,red2,rot=(0,0,math.radians(-18 if x<0 else 18)))
    cube('Bio rifle',(0,-.43,1.04),(.12,.10,.58),blackred,rot=(math.radians(15),0,0),bevel=.08)
    cone('Rifle fang',(0,-.45,.67),.12,.32,red2,rot=(math.radians(180),0,0))
    export('xenon_infantry')

def ember_apc():
    clear()
    cube('Lower hull',(0,0,.50),(1.02,1.72,.34),blue)
    cube('Sloped upper hull',(0,-.05,.94),(.86,1.32,.38),blue2,rot=(math.radians(-4),0,0),bevel=.12)
    for x in (-1.08,1.08):
        cube('Track housing',(x,0,.45),(.27,1.68,.34),dark,bevel=.12)
        for y in (-1.25,-.63,0,.63,1.25): cyl('Road wheel',(x,-y,.42),.22,.10,white,rot=(0,math.radians(90),0),vertices=16)
    cube('Front glacis',(0,-1.46,.78),(.82,.20,.38),white,rot=(math.radians(18),0,0))
    cyl('Turret',(0,-.12,1.42),.48,.28,blue2,vertices=12)
    cube('Cannon',(0,-1.0,1.45),(.10,.92,.09),dark)
    for x in (-.47,.47): cube('Blue sensor',(x,-1.37,.94),(.13,.035,.10),amber)
    cube('Rear troop hatch',(0,1.34,.86),(.55,.05,.42),white)
    export('ember_vehicle')

def xenon_apc():
    clear()
    uv('Main organism',(0,0,.82),(1.12,1.72,.63),red)
    uv('Armored crown',(0,-.10,1.18),(.78,1.28,.42),red2)
    for x in (-.88,.88):
        for y in (-1.10,-.38,.38,1.10):
            cyl('Joint',(x,y,.45),.16,.18,glowred,rot=(0,math.radians(90),0),vertices=10)
            cone('Crawler claw',(x*1.18,y,.30),.18,.65,blackred,rot=(0,math.radians(90 if x<0 else -90),0))
    for x in (-.64,.64): cone('Hull spine',(x,.18,1.58),.16,.72,red2,rot=(0,0,math.radians(-22 if x<0 else 22)))
    uv('Weapon node',(0,-.65,1.46),(.42,.52,.30),blackred)
    cyl('Bio cannon',(0,-1.48,1.47),.12,1.30,red2,rot=(math.radians(90),0,0),vertices=10)
    uv('Muzzle glow',(0,-2.13,1.47),(.17,.08,.17),glowred)
    for x in (-.36,.36): uv('Eye sensor',(x,-1.50,1.05),(.10,.05,.08),glowred)
    export('xenon_vehicle')

ember_soldier(); xenon_soldier(); ember_apc(); xenon_apc()
print('Exported faction models to', OUT)
