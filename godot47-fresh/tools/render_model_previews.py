import bpy, os, math
from mathutils import Vector

ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MODELS=os.path.join(ROOT,'assets','models')
OUT=os.path.join(ROOT,'assets','model_previews')
os.makedirs(OUT,exist_ok=True)

def look(obj, point):
    obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()

for name in ('ember_infantry','xenon_infantry','ember_vehicle','xenon_vehicle'):
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS,name+'.glb'))
    bpy.ops.object.camera_add(location=(5.8,-8.2,4.4 if 'vehicle' in name else 3.0))
    cam=bpy.context.object; look(cam,(0,0,0.9)); bpy.context.scene.camera=cam
    bpy.ops.object.light_add(type='AREA', location=(-4,-4,7)); bpy.context.object.data.energy=1100; bpy.context.object.data.shape='DISK'; bpy.context.object.data.size=5
    bpy.ops.object.light_add(type='AREA', location=(5,2,4)); bpy.context.object.data.energy=700; bpy.context.object.data.size=4
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0,0,-0.02))
    ground=bpy.context.object
    mat=bpy.data.materials.new('PreviewGround'); mat.diffuse_color=(0.035,0.045,0.05,1); mat.roughness=0.9; ground.data.materials.append(mat)
    scene=bpy.context.scene
    scene.render.engine='BLENDER_EEVEE_NEXT'
    scene.render.resolution_x=640; scene.render.resolution_y=640; scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'
    scene.render.filepath=os.path.join(OUT,name+'.png')
    scene.world.color=(0.015,0.02,0.025)
    bpy.ops.render.render(write_still=True)
