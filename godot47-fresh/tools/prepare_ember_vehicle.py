import bpy
from mathutils import Vector


SOURCE = r"C:\Users\Gamer\Documents\Codex\2026-11-10\mel\work\Veszelyzona-Koloniafront\godot47-fresh\assets\models\ember_vehicle.glb"
OUTPUT = r"C:\Users\Gamer\Documents\Codex\2026-11-10\mel\work\Veszelyzona-Koloniafront\godot47-fresh\assets\models\ember_vehicle_rigged.glb"


def world_center(obj):
    return sum((obj.matrix_world @ Vector(corner) for corner in obj.bound_box), Vector()) / 8.0


bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=SOURCE)

meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]

# The source contains anonymous, separate wheel meshes.  Identify them from their
# circular proportions, then place each origin at its own geometry so Godot can
# rotate the wheel instead of orbiting it around the vehicle origin.
wheel_candidates = []
for obj in meshes:
    dx, dy, dz = obj.dimensions
    center = world_center(obj)
    if dx < 0.48 and 1.05 < dy < 1.45 and 2.45 < dz < 2.90 and center.y < 2.2:
        wheel_candidates.append((obj, center))

for index, (wheel, center) in enumerate(sorted(wheel_candidates, key=lambda item: (item[1].z, item[1].x))):
    axle = "Front" if center.z > 0.5 else "Rear"
    side = "L" if center.x < 0.0 else "R"
    wheel.name = "Wheel_%s_%s_%02d" % (axle, side, index)
    bpy.context.view_layer.objects.active = wheel
    wheel.select_set(True)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    wheel.select_set(False)

# The high, compact weapon assembly is the turret.  Its origin is moved to the
# horizontal centre of its turntable while retaining its original geometry.
turret_candidates = []
for obj in meshes:
    center = world_center(obj)
    dx, dy, dz = obj.dimensions
    if center.y > 0.70 and center.z > 3.1 and dx < 2.2 and dz < 3.0:
        turret_candidates.append((obj, center, dx * dy * dz))

if turret_candidates:
    turret, center, _volume = max(turret_candidates, key=lambda item: item[2])
    turret.name = "TurretPivot"
    cursor_before = bpy.context.scene.cursor.location.copy()
    bpy.context.scene.cursor.location = Vector((center.x, center.y - 0.35, center.z))
    bpy.context.view_layer.objects.active = turret
    turret.select_set(True)
    bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
    turret.select_set(False)
    bpy.context.scene.cursor.location = cursor_before

bpy.ops.export_scene.gltf(
    filepath=OUTPUT,
    export_format="GLB",
    export_apply=True,
    export_animations=True,
)
print("Prepared", OUTPUT, "wheels:", len(wheel_candidates), "turret:", bool(turret_candidates))
