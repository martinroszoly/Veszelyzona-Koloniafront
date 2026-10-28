extends Node3D
class_name RTSStrategyUnit

var game: Node
var side := "ember"
var unit_kind := "infantry"
var display_name := "Infantry squad"
var max_health := 100.0
var health := 100.0
var speed := 9.0
var weapon_range := 20.0
var damage := 9.0
var attack_interval := 1.0
var capture_capable := true
var order_target: Node3D
var attack_target: Node3D
var move_path := PackedVector3Array()
var attack_clock := 0.0
var selected := false
var selection_ring: MeshInstance3D
var unit_material: StandardMaterial3D
var alive := true


func configure(owner_game: Node, owner_side: String, kind: String) -> void:
	game = owner_game
	side = owner_side
	unit_kind = kind
	match unit_kind:
		"infantry":
			display_name = "Infantry squad"
			max_health = 150.0
			speed = 8.5
			weapon_range = 19.0
			damage = 10.0
			attack_interval = 0.85
			capture_capable = true
		"scout":
			display_name = "Recon squad"
			max_health = 110.0
			speed = 12.5
			weapon_range = 22.0
			damage = 7.0
			attack_interval = 0.72
			capture_capable = true
		"tank":
			display_name = "Light battle tank"
			max_health = 360.0
			speed = 7.5
			weapon_range = 31.0
			damage = 34.0
			attack_interval = 1.55
			capture_capable = false
	health = max_health


func _ready() -> void:
	add_to_group("strategy_units")
	unit_material = _make_material(_team_color())
	_build_model()
	_build_selection_ring()
	_build_hit_area()


func _process(delta: float) -> void:
	if not alive or not is_instance_valid(game) or game.match_finished:
		return
	_update_movement(delta)
	if is_instance_valid(attack_target) and _target_is_alive(attack_target):
		var distance_to_target := global_position.distance_to(attack_target.global_position)
		if distance_to_target <= weapon_range:
			move_path = PackedVector3Array()
			attack_clock -= delta
			if attack_clock <= 0.0:
				game.apply_unit_damage(attack_target, damage, self)
				attack_clock = attack_interval
		else:
			if move_path.is_empty():
				move_path = game.find_path(global_position, attack_target.global_position)
	else:
		attack_target = null
		var nearby_enemy: Node3D = game.find_nearby_enemy(self, weapon_range)
		if is_instance_valid(nearby_enemy):
			attack_target = nearby_enemy
			attack_clock = 0.0


func _update_movement(delta: float) -> void:
	if move_path.is_empty():
		return
	var destination := move_path[0]
	var difference := Vector3(destination.x - global_position.x, 0.0, destination.z - global_position.z)
	if difference.length() < 1.35:
		move_path.remove_at(0)
		if move_path.is_empty():
			if is_instance_valid(order_target) and order_target.is_in_group("capture_points"):
				game.notify_unit_arrived(self, order_target)
			return
		destination = move_path[0]
		difference = Vector3(destination.x - global_position.x, 0.0, destination.z - global_position.z)
	if difference.length_squared() < 0.001:
		return
	var direction := difference.normalized()
	global_position.x += direction.x * speed * delta
	global_position.z += direction.z * speed * delta
	global_position.y = game.terrain_height(global_position.x, global_position.z)
	var desired_yaw := atan2(direction.x, direction.z)
	rotation.y = lerp_angle(rotation.y, desired_yaw, minf(1.0, delta * 5.5))


func move_along(path_points: PackedVector3Array, objective: Node3D = null) -> void:
	move_path = path_points
	order_target = objective
	attack_target = null


func attack_unit(target: Node3D) -> void:
	attack_target = target
	order_target = null
	move_path = PackedVector3Array()
	attack_clock = 0.0


func _target_is_alive(target: Node3D) -> bool:
	if target.is_in_group("bases"):
		return bool(target.get_meta("alive", true))
	return target.get("alive") == true


func set_selected(value: bool) -> void:
	selected = value
	if is_instance_valid(selection_ring):
		selection_ring.visible = selected


func take_damage(amount: float) -> void:
	if not alive:
		return
	health = maxf(0.0, health - amount)
	if health <= 0.0:
		alive = false
		if is_instance_valid(game):
			game.on_unit_destroyed(self)
		queue_free()


func _build_model() -> void:
	if unit_kind == "tank":
		_build_tank()
	elif unit_kind == "scout":
		_build_scout()
	else:
		_build_infantry_squad()


func _build_infantry_squad() -> void:
	var offsets := [Vector3(-1.6, 0.0, -0.8), Vector3(0.0, 0.0, -1.2), Vector3(1.6, 0.0, -0.8), Vector3(-0.8, 0.0, 1.0), Vector3(0.8, 0.0, 1.0)]
	var helmet_material := _make_material(Color(0.18, 0.21, 0.17))
	for index in range(offsets.size()):
		var soldier := MeshInstance3D.new()
		var capsule := CapsuleMesh.new()
		capsule.radius = 0.42
		capsule.height = 1.8
		soldier.mesh = capsule
		soldier.position = offsets[index] + Vector3(0.0, 0.9, 0.0)
		soldier.material_override = unit_material
		add_child(soldier)
		var helmet := MeshInstance3D.new()
		var head := SphereMesh.new()
		head.radius = 0.28
		head.height = 0.56
		helmet.mesh = head
		helmet.position = offsets[index] + Vector3(0.0, 1.78, 0.0)
		helmet.material_override = helmet_material
		add_child(helmet)


func _build_scout() -> void:
	var chassis := MeshInstance3D.new()
	var body := BoxMesh.new()
	body.size = Vector3(4.3, 1.3, 2.5)
	chassis.mesh = body
	chassis.position.y = 1.0
	chassis.material_override = unit_material
	add_child(chassis)
	var cabin := MeshInstance3D.new()
	var cabin_mesh := BoxMesh.new()
	cabin_mesh.size = Vector3(2.0, 1.2, 2.0)
	cabin.mesh = cabin_mesh
	cabin.position = Vector3(-0.25, 2.15, 0.0)
	cabin.material_override = _make_material(Color(0.14, 0.19, 0.17))
	add_child(cabin)
	_add_wheels(4.1, 2.35)


func _build_tank() -> void:
	var tracks := MeshInstance3D.new()
	var track_mesh := BoxMesh.new()
	track_mesh.size = Vector3(6.0, 1.1, 3.4)
	tracks.mesh = track_mesh
	tracks.position.y = 0.8
	tracks.material_override = _make_material(Color(0.13, 0.17, 0.14))
	add_child(tracks)
	var hull := MeshInstance3D.new()
	var hull_mesh := BoxMesh.new()
	hull_mesh.size = Vector3(5.6, 1.35, 2.8)
	hull.mesh = hull_mesh
	hull.position.y = 1.65
	hull.material_override = unit_material
	add_child(hull)
	var turret := MeshInstance3D.new()
	var turret_mesh := CylinderMesh.new()
	turret_mesh.top_radius = 1.05
	turret_mesh.bottom_radius = 1.25
	turret_mesh.height = 0.95
	turret.mesh = turret_mesh
	turret.position = Vector3(-0.35, 2.75, 0.0)
	turret.material_override = _make_material(_team_color().darkened(0.16))
	add_child(turret)
	var barrel := MeshInstance3D.new()
	var barrel_mesh := CylinderMesh.new()
	barrel_mesh.top_radius = 0.14
	barrel_mesh.bottom_radius = 0.2
	barrel_mesh.height = 3.2
	barrel.mesh = barrel_mesh
	barrel.position = Vector3(1.45, 2.9, 0.0)
	barrel.rotation.z = -PI / 2.0
	barrel.material_override = _make_material(Color(0.11, 0.13, 0.12))
	add_child(barrel)


func _add_wheels(length: float, width: float) -> void:
	for x in [-length * 0.37, length * 0.37]:
		for z in [-width * 0.38, width * 0.38]:
			var wheel := MeshInstance3D.new()
			var wheel_mesh := CylinderMesh.new()
			wheel_mesh.top_radius = 0.55
			wheel_mesh.bottom_radius = 0.55
			wheel_mesh.height = 0.38
			wheel.mesh = wheel_mesh
			wheel.position = Vector3(x, 0.62, z)
			wheel.rotation.x = PI / 2.0
			wheel.material_override = _make_material(Color(0.07, 0.08, 0.07))
			add_child(wheel)


func _build_selection_ring() -> void:
	selection_ring = MeshInstance3D.new()
	var ring := TorusMesh.new()
	ring.inner_radius = 2.5 if unit_kind == "tank" else 2.0
	ring.outer_radius = ring.inner_radius + 0.18
	selection_ring.mesh = ring
	selection_ring.position.y = 0.18
	var material := StandardMaterial3D.new()
	material.albedo_color = _team_color().lightened(0.2)
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	selection_ring.material_override = material
	selection_ring.visible = false
	add_child(selection_ring)


func _build_hit_area() -> void:
	var area := Area3D.new()
	area.name = "UnitHitArea"
	area.collision_layer = 1
	area.collision_mask = 0
	area.input_ray_pickable = true
	var collision := CollisionShape3D.new()
	var sphere := SphereShape3D.new()
	sphere.radius = 2.8 if unit_kind == "tank" else 2.0
	collision.shape = sphere
	collision.position.y = 1.2
	area.add_child(collision)
	add_child(area)


func _team_color() -> Color:
	return Color(0.12, 0.43, 0.67) if side == "ember" else Color(0.63, 0.2, 0.17)


func _make_material(color: Color) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.82
	material.metallic = 0.12
	if color.a < 0.99:
		material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	return material
