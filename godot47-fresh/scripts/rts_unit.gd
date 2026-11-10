class_name RTSUnit
extends CharacterBody3D

const UNIT_PROJECTILE := preload("res://scripts/projectile.gd")

@export var team_id: int = 0
@export var squad_id: String = ""
@export var move_speed: float = 7.0
@export var acceleration: float = 22.0
@export var arrival_distance: float = 0.35
@export var max_health: float = 100.0
@export var attack_range: float = 22.0
@export var attack_damage: float = 9.0
@export var attack_cooldown: float = 1.15
@export var is_vehicle: bool = false

var _destination := Vector3.ZERO
var _has_destination := false
var _selected := false
var _selection_ring: MeshInstance3D
var _final_facing := Vector3.ZERO
var _cover_strength := -1
var _pending_cover_strength := -1
var _health := 100.0
var _attack_timer := 0.0
var _target = null
var _health_fill: MeshInstance3D
var _health_background: MeshInstance3D
var _body_visual: MeshInstance3D
var _facing_visual: MeshInstance3D
var _collision_shape: CollisionShape3D
var _avoidance_direction := Vector3.ZERO
var _avoidance_time := 0.0
var _stuck_time := 0.0


func _ready() -> void:
	add_to_group("rts_units")
	if squad_id.is_empty():
		squad_id = name
	if is_vehicle:
		max_health = 320.0
		move_speed = 8.5
		acceleration = 12.0
		attack_range = 26.0
		attack_damage = 32.0
		attack_cooldown = 2.3
	_build_visuals()
	if is_vehicle:
		_convert_visuals_to_vehicle()
	_health = max_health
	_update_health_bar()
	_destination = global_position


func _physics_process(delta: float) -> void:
	_attack_timer = maxf(0.0, _attack_timer - delta)
	_avoidance_time = maxf(0.0, _avoidance_time - delta)
	if _update_combat():
		velocity.x = move_toward(velocity.x, 0.0, acceleration * delta)
		velocity.z = move_toward(velocity.z, 0.0, acceleration * delta)
		move_and_slide()
		return
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
		_cover_strength = _pending_cover_strength
		_pending_cover_strength = -1
		return

	var direction := _apply_obstacle_avoidance(offset.normalized())
	velocity.x = move_toward(velocity.x, direction.x * move_speed, acceleration * delta)
	velocity.z = move_toward(velocity.z, direction.z * move_speed, acceleration * delta)
	look_at(global_position + direction, Vector3.UP)
	var position_before_move := global_position
	move_and_slide()
	_update_stuck_recovery(delta, position_before_move, offset.normalized())


func move_to(world_position: Vector3, final_facing: Vector3 = Vector3.ZERO, cover_strength: int = -1) -> void:
	_destination = world_position
	_destination.y = global_position.y
	_final_facing = final_facing
	_final_facing.y = 0.0
	if _final_facing.length_squared() > 0.01:
		_final_facing = _final_facing.normalized()
	_cover_strength = -1
	_pending_cover_strength = cover_strength
	_has_destination = true


func take_damage(amount: float, attacker_position: Vector3) -> void:
	var final_damage := amount
	if _cover_strength >= 0:
		var incoming_direction := attacker_position - global_position
		incoming_direction.y = 0.0
		var forward := -global_basis.z
		forward.y = 0.0
		if incoming_direction.length_squared() > 0.01 and forward.normalized().dot(incoming_direction.normalized()) > 0.15:
			final_damage *= 0.5 if _cover_strength == 1 else 0.75
	_health = maxf(0.0, _health - final_damage)
	_update_health_bar()
	if _health <= 0.0:
		queue_free()


func get_health_ratio() -> float:
	return clampf(_health / max_health, 0.0, 1.0)


func _update_combat() -> bool:
	if not is_instance_valid(_target) or _target.team_id == team_id or global_position.distance_to(_target.global_position) > attack_range:
		_target = _find_nearest_enemy()
	if not is_instance_valid(_target):
		return false
	var direction: Vector3 = _target.global_position - global_position
	direction.y = 0.0
	if direction.length_squared() > 0.01:
		look_at(global_position + direction, Vector3.UP)
	if _attack_timer <= 0.0:
		_fire_projectile(_target)
		_attack_timer = attack_cooldown
	return true


func _fire_projectile(projectile_target) -> void:
	if not is_instance_valid(projectile_target):
		return
	var projectile = UNIT_PROJECTILE.new()
	projectile.initialize(projectile_target, attack_damage, global_position, team_id)
	projectile.position = global_position + Vector3.UP * 1.35 - global_basis.z * 0.55
	get_tree().current_scene.add_child(projectile)


func _find_nearest_enemy():
	var closest = null
	var closest_distance := attack_range
	for node in get_tree().get_nodes_in_group("rts_units"):
		var candidate = node
		if candidate == null or candidate == self or candidate.team_id == team_id:
			continue
		var distance: float = global_position.distance_to(candidate.global_position)
		if distance <= closest_distance and _has_line_of_sight(candidate):
			closest_distance = distance
			closest = candidate
	return closest


func _has_line_of_sight(candidate) -> bool:
	var origin := global_position + Vector3.UP * 1.75
	var destination: Vector3 = candidate.global_position + Vector3.UP * 1.75
	var query := PhysicsRayQueryParameters3D.create(origin, destination, 1)
	query.collide_with_areas = false
	return get_world_3d().direct_space_state.intersect_ray(query).is_empty()


func _apply_obstacle_avoidance(desired_direction: Vector3) -> Vector3:
	if _avoidance_time > 0.0 and _avoidance_direction.length_squared() > 0.01:
		return (_avoidance_direction * 0.88 + desired_direction * 0.12).normalized()
	var origin := global_position + Vector3.UP * 0.65
	var target := origin + desired_direction * 2.4
	var query := PhysicsRayQueryParameters3D.create(origin, target, 1)
	query.collide_with_areas = false
	var hit := get_world_3d().direct_space_state.intersect_ray(query)
	if hit.is_empty():
		return desired_direction
	var normal: Vector3 = hit.normal
	normal.y = 0.0
	if normal.length_squared() < 0.01:
		return desired_direction
	var tangent := Vector3.UP.cross(normal.normalized()).normalized()
	var destination_offset := _destination - global_position
	destination_offset.y = 0.0
	if tangent.dot(destination_offset) < 0.0:
		tangent = -tangent
	elif absf(tangent.dot(destination_offset)) < 0.05 and get_instance_id() % 2 == 0:
		tangent = -tangent
	_avoidance_direction = tangent
	_avoidance_time = 1.1
	return (tangent * 0.92 + desired_direction * 0.08).normalized()


func _update_stuck_recovery(delta: float, position_before_move: Vector3, desired_direction: Vector3) -> void:
	var moved_distance := global_position.distance_to(position_before_move)
	if moved_distance > 0.015:
		_stuck_time = 0.0
		return
	_stuck_time += delta
	if _stuck_time < 0.45:
		return
	var side := 1.0 if get_instance_id() % 2 == 0 else -1.0
	_avoidance_direction = desired_direction.rotated(Vector3.UP, side * PI * 0.5).normalized()
	_avoidance_time = 1.6
	_stuck_time = 0.0


func set_selected(value: bool) -> void:
	_selected = value
	if is_instance_valid(_selection_ring):
		_selection_ring.visible = _selected


func is_selected() -> bool:
	return _selected


func _build_visuals() -> void:
	_collision_shape = CollisionShape3D.new()
	var capsule_shape := CapsuleShape3D.new()
	capsule_shape.radius = 0.55
	capsule_shape.height = 2.2
	_collision_shape.shape = capsule_shape
	_collision_shape.position.y = 1.1
	add_child(_collision_shape)

	_body_visual = MeshInstance3D.new()
	var capsule_mesh := CapsuleMesh.new()
	capsule_mesh.radius = 0.55
	capsule_mesh.height = 2.2
	_body_visual.mesh = capsule_mesh
	_body_visual.position.y = 1.1
	var body_material := StandardMaterial3D.new()
	body_material.albedo_color = Color(0.16, 0.42, 0.62) if team_id == 0 else Color(0.70, 0.18, 0.14)
	body_material.roughness = 0.8
	_body_visual.material_override = body_material
	add_child(_body_visual)

	_facing_visual = MeshInstance3D.new()
	var facing_mesh := BoxMesh.new()
	facing_mesh.size = Vector3(0.18, 0.18, 0.75)
	_facing_visual.mesh = facing_mesh
	_facing_visual.position = Vector3(0.0, 1.25, -0.72)
	var facing_material := StandardMaterial3D.new()
	facing_material.albedo_color = Color(0.08, 0.10, 0.11)
	_facing_visual.material_override = facing_material
	add_child(_facing_visual)

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

	_health_background = MeshInstance3D.new()
	var health_background_mesh := BoxMesh.new()
	health_background_mesh.size = Vector3(1.5, 0.10, 0.08)
	_health_background.mesh = health_background_mesh
	_health_background.position = Vector3(0.0, 2.65, 0.0)
	var health_background_material := StandardMaterial3D.new()
	health_background_material.albedo_color = Color(0.08, 0.08, 0.08)
	health_background_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_health_background.material_override = health_background_material
	add_child(_health_background)

	_health_fill = MeshInstance3D.new()
	var health_fill_mesh := BoxMesh.new()
	health_fill_mesh.size = Vector3(1.4, 0.12, 0.10)
	_health_fill.mesh = health_fill_mesh
	_health_fill.position = Vector3(0.0, 2.65, -0.01)
	var health_fill_material := StandardMaterial3D.new()
	health_fill_material.albedo_color = Color(0.18, 0.92, 0.25)
	health_fill_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_health_fill.material_override = health_fill_material
	add_child(_health_fill)


func _update_health_bar() -> void:
	if is_instance_valid(_health_fill):
		_health_fill.scale.x = maxf(0.001, get_health_ratio())


func _convert_visuals_to_vehicle() -> void:
	_body_visual.visible = false
	_facing_visual.visible = false
	var box_shape := BoxShape3D.new()
	box_shape.size = Vector3(2.3, 1.25, 3.8)
	_collision_shape.shape = box_shape
	_collision_shape.position.y = 0.72

	var vehicle_material := StandardMaterial3D.new()
	vehicle_material.albedo_color = Color(0.13, 0.38, 0.58) if team_id == 0 else Color(0.58, 0.12, 0.10)
	vehicle_material.metallic = 0.55
	vehicle_material.roughness = 0.62

	var hull := MeshInstance3D.new()
	var hull_mesh := BoxMesh.new()
	hull_mesh.size = Vector3(2.3, 1.0, 3.8)
	hull.mesh = hull_mesh
	hull.position.y = 0.75
	hull.material_override = vehicle_material
	add_child(hull)

	var turret := MeshInstance3D.new()
	var turret_mesh := CylinderMesh.new()
	turret_mesh.top_radius = 0.72
	turret_mesh.bottom_radius = 0.88
	turret_mesh.height = 0.55
	turret.mesh = turret_mesh
	turret.position = Vector3(0.0, 1.5, -0.2)
	turret.material_override = vehicle_material
	add_child(turret)

	var cannon := MeshInstance3D.new()
	var cannon_mesh := BoxMesh.new()
	cannon_mesh.size = Vector3(0.18, 0.18, 2.25)
	cannon.mesh = cannon_mesh
	cannon.position = Vector3(0.0, 1.55, -1.75)
	var cannon_material := StandardMaterial3D.new()
	cannon_material.albedo_color = Color(0.10, 0.12, 0.13)
	cannon_material.metallic = 0.7
	cannon.material_override = cannon_material
	add_child(cannon)

	_selection_ring.scale = Vector3.ONE * 2.0
	_health_background.position.y = 2.25
	_health_fill.position.y = 2.25
