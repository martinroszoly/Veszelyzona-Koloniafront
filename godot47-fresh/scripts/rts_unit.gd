class_name RTSUnit
extends CharacterBody3D

@export var team_id: int = 0
@export var squad_id: String = ""
@export var move_speed: float = 7.0
@export var acceleration: float = 22.0
@export var arrival_distance: float = 0.35

var _destination := Vector3.ZERO
var _has_destination := false
var _selected := false
var _selection_ring: MeshInstance3D
var _final_facing := Vector3.ZERO


func _ready() -> void:
	add_to_group("rts_units")
	if squad_id.is_empty():
		squad_id = name
	_build_visuals()
	_destination = global_position


func _physics_process(delta: float) -> void:
	if not _has_destination:
		velocity.x = move_toward(velocity.x, 0.0, acceleration * delta)
		velocity.z = move_toward(velocity.z, 0.0, acceleration * delta)
		move_and_slide()
		return

	var offset := _destination - global_position
	offset.y = 0.0
	if offset.length() <= arrival_distance:
		_has_destination = false
		velocity = Vector3.ZERO
		if _final_facing.length_squared() > 0.01:
			look_at(global_position + _final_facing, Vector3.UP)
			_final_facing = Vector3.ZERO
		return

	var direction := offset.normalized()
	velocity.x = move_toward(velocity.x, direction.x * move_speed, acceleration * delta)
	velocity.z = move_toward(velocity.z, direction.z * move_speed, acceleration * delta)
	look_at(global_position + direction, Vector3.UP)
	move_and_slide()


func move_to(world_position: Vector3, final_facing: Vector3 = Vector3.ZERO) -> void:
	_destination = world_position
	_destination.y = global_position.y
	_final_facing = final_facing
	_final_facing.y = 0.0
	if _final_facing.length_squared() > 0.01:
		_final_facing = _final_facing.normalized()
	_has_destination = true


func set_selected(value: bool) -> void:
	_selected = value
	if is_instance_valid(_selection_ring):
		_selection_ring.visible = _selected


func is_selected() -> bool:
	return _selected


func _build_visuals() -> void:
	var collision := CollisionShape3D.new()
	var capsule_shape := CapsuleShape3D.new()
	capsule_shape.radius = 0.55
	capsule_shape.height = 2.2
	collision.shape = capsule_shape
	collision.position.y = 1.1
	add_child(collision)

	var body := MeshInstance3D.new()
	var capsule_mesh := CapsuleMesh.new()
	capsule_mesh.radius = 0.55
	capsule_mesh.height = 2.2
	body.mesh = capsule_mesh
	body.position.y = 1.1
	var body_material := StandardMaterial3D.new()
	body_material.albedo_color = Color(0.16, 0.42, 0.62) if team_id == 0 else Color(0.70, 0.18, 0.14)
	body_material.roughness = 0.8
	body.material_override = body_material
	add_child(body)

	var facing := MeshInstance3D.new()
	var facing_mesh := BoxMesh.new()
	facing_mesh.size = Vector3(0.18, 0.18, 0.75)
	facing.mesh = facing_mesh
	facing.position = Vector3(0.0, 1.25, -0.72)
	var facing_material := StandardMaterial3D.new()
	facing_material.albedo_color = Color(0.08, 0.10, 0.11)
	facing.material_override = facing_material
	add_child(facing)

	_selection_ring = MeshInstance3D.new()
	var ring_mesh := TorusMesh.new()
	ring_mesh.inner_radius = 0.72
	ring_mesh.outer_radius = 0.88
	ring_mesh.rings = 12
	ring_mesh.ring_segments = 24
	_selection_ring.mesh = ring_mesh
	_selection_ring.position.y = 0.08
	var ring_material := StandardMaterial3D.new()
	ring_material.albedo_color = Color(0.20, 1.0, 0.35)
	ring_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_selection_ring.material_override = ring_material
	_selection_ring.visible = false
	add_child(_selection_ring)
