class_name CoverObject
extends Node3D

enum CoverStrength { LIGHT, HEAVY }

@export var cover_length: float = 12.0
@export var slot_spacing: float = 1.20
@export var unit_offset: float = 0.82
@export var snap_distance: float = 4.5
@export var strength: CoverStrength = CoverStrength.HEAVY

var _preview_markers: Array[MeshInstance3D] = []
var _preview_time := 0.0


func _ready() -> void:
	add_to_group("cover_objects")
	_build_cover_visual()
	_build_collision()
	_build_preview_markers()


func _process(delta: float) -> void:
	if _preview_time <= 0.0:
		return
	_preview_time -= delta
	if _preview_time <= 0.0:
		_hide_preview()


func distance_to_cover(world_point: Vector3) -> float:
	var local_point := to_local(world_point)
	var closest_x := clampf(local_point.x, -cover_length * 0.5, cover_length * 0.5)
	return Vector2(local_point.x - closest_x, local_point.z).length()


func get_cover_slots(unit_count: int, requested_world_point: Vector3) -> Array[Vector3]:
	var result: Array[Vector3] = []
	if unit_count <= 0:
		return result
	var local_request := to_local(requested_world_point)
	var side := 1.0 if local_request.z >= 0.0 else -1.0
	var usable_half_length := maxf(0.0, cover_length * 0.5 - 0.65)
	var total_width := minf(float(unit_count - 1) * slot_spacing, usable_half_length * 2.0)
	var actual_spacing := slot_spacing
	if unit_count > 1 and total_width < float(unit_count - 1) * slot_spacing:
		actual_spacing = total_width / float(unit_count - 1)
	for index in range(unit_count):
		var x := -total_width * 0.5 + float(index) * actual_spacing
		result.append(to_global(Vector3(x, 0.0, side * unit_offset)))
	return result


func get_cover_facing(requested_world_point: Vector3) -> Vector3:
	var local_request := to_local(requested_world_point)
	var side := 1.0 if local_request.z >= 0.0 else -1.0
	return (global_basis * Vector3(0.0, 0.0, -side)).normalized()


func show_slot_preview(unit_count: int, requested_world_point: Vector3) -> void:
	var slots := get_cover_slots(unit_count, requested_world_point)
	for index in range(_preview_markers.size()):
		var marker := _preview_markers[index]
		if index < slots.size():
			marker.global_position = slots[index] + Vector3.UP * 0.08
			marker.visible = true
		else:
			marker.visible = false
	_preview_time = 1.4


func _build_cover_visual() -> void:
	var base_material := StandardMaterial3D.new()
	base_material.albedo_color = Color(0.34, 0.29, 0.20)
	base_material.roughness = 1.0
	var bag_material := StandardMaterial3D.new()
	bag_material.albedo_color = Color(0.46, 0.39, 0.26)
	bag_material.roughness = 1.0

	var bag_count := maxi(2, floori(cover_length / 0.90))
	var spacing := cover_length / float(bag_count)
	for row in range(2):
		for index in range(bag_count):
			var bag := MeshInstance3D.new()
			var mesh := CapsuleMesh.new()
			mesh.radius = 0.24
			mesh.height = 0.82
			bag.mesh = mesh
			bag.rotation.z = PI * 0.5
			bag.position = Vector3(
				-cover_length * 0.5 + spacing * (float(index) + 0.5) + (spacing * 0.25 if row == 1 else 0.0),
				0.23 + float(row) * 0.30,
				0.0
			)
			bag.scale = Vector3(1.0, 0.72, 0.72)
			bag.material_override = bag_material if row == 1 else base_material
			add_child(bag)


func _build_collision() -> void:
	var body := StaticBody3D.new()
	body.collision_layer = 1
	body.collision_mask = 2
	var collision := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(cover_length, 0.90, 0.52)
	collision.shape = shape
	collision.position.y = 0.45
	body.add_child(collision)
	add_child(body)


func _build_preview_markers() -> void:
	for _index in range(12):
		var marker := MeshInstance3D.new()
		var mesh := CylinderMesh.new()
		mesh.top_radius = 0.20
		mesh.bottom_radius = 0.20
		mesh.height = 0.025
		marker.mesh = mesh
		var material := StandardMaterial3D.new()
		material.albedo_color = Color(0.18, 1.0, 0.32, 0.82) if strength == CoverStrength.HEAVY else Color(1.0, 0.82, 0.18, 0.82)
		material.emission_enabled = true
		material.emission = Color(material.albedo_color.r, material.albedo_color.g, material.albedo_color.b) * 0.45
		material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		marker.material_override = material
		marker.visible = false
		_preview_markers.append(marker)
		add_child(marker)


func _hide_preview() -> void:
	for marker in _preview_markers:
		marker.visible = false


func hide_slot_preview() -> void:
	_preview_time = 0.0
	_hide_preview()
