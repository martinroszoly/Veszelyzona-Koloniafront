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
@export var attack_cooldown: float = 0.78
@export var is_vehicle: bool = false
@export var sight_range: float = 48.0
@export var unit_type: String = "infantry"
@export var faction_id: String = ""
@export var retreat_speed_multiplier: float = 1.65
@export var base_healing_per_second: float = 14.0

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
var _waypoints: Array[Vector3] = []
var _retreating := false
var _hover_time := 0.0
var _animation_time := 0.0
var _fire_pose_time := 0.0
var _crouch_time := 0.0
var _crouch_cooldown := 0.0
var _faction_model: Node3D
var _left_leg_pivot: Node3D
var _right_leg_pivot: Node3D
var _left_arm_pivot: Node3D
var _right_arm_pivot: Node3D
var _weapon_pivot: Node3D
var _model_animation_player: AnimationPlayer
var _active_model_animation := ""
var _squad_marker: Node3D
var _vehicle_wheels: Array[Node3D] = []
var _vehicle_steering_nodes: Array[Node3D] = []
var _turret_pivot: Node3D
var _wheel_roll := 0.0
var _model_base_scale_y := 1.0
var _burst_shots_remaining := 0
var _burst_shot_timer := 0.0
var _burst_target = null
var _mordra_attack_side := false
var _mordra_attack_phase := 0.0


func _ready() -> void:
	add_to_group("rts_units")
	if squad_id.is_empty():
		squad_id = name
	if faction_id.is_empty():
		faction_id = "ember" if team_id == 0 else "mordra"
	if unit_type == "vehicle":
		is_vehicle = true
	if unit_type == "vehicle":
		max_health = 320.0
		move_speed = 8.5
		acceleration = 12.0
		attack_range = 13.0
		attack_damage = 32.0
		attack_cooldown = 1.55
		sight_range = 63.0
	elif unit_type == "brute":
		is_vehicle = false
		max_health = 850.0
		move_speed = 3.2
		acceleration = 7.0
		attack_range = 3.4
		attack_damage = 72.0
		attack_cooldown = 2.4
		sight_range = 42.0
	elif unit_type == "infantry" and faction_id == "mordra":
		max_health = 72.0
		move_speed = 7.4
		attack_range = 2.35
		attack_damage = 17.0
		attack_cooldown = 0.82
		sight_range = 42.0
	elif unit_type == "infantry" and faction_id == "ember":
		attack_range = 21.0
		attack_damage = 3.1
		attack_cooldown = 1.18
	elif unit_type == "tank":
		max_health = 560.0
		move_speed = 5.8
		attack_range = 16.0
		attack_damage = 58.0
		attack_cooldown = 2.1
		sight_range = 57.0
	elif unit_type == "helicopter":
		max_health = 260.0
		move_speed = 11.5
		attack_range = 30.0
		attack_damage = 25.0
		attack_cooldown = 1.45
		sight_range = 72.0
	elif unit_type == "fighter":
		max_health = 220.0
		move_speed = 15.0
		attack_range = 35.0
		attack_damage = 42.0
		attack_cooldown = 2.0
		sight_range = 84.0
	_build_visuals()
	var has_external_model := _apply_external_faction_model()
	if unit_type == "vehicle":
		if not has_external_model:
			_convert_visuals_to_vehicle()
	elif unit_type == "brute" and not has_external_model:
		_convert_visuals_to_brute_placeholder()
	elif unit_type != "infantry":
		_convert_visuals_to_graybox_unit()
	elif not has_external_model:
		_decorate_infantry()
	_build_unit_role_marker()
	_health = max_health
	_update_health_bar()
	_destination = global_position


func _apply_external_faction_model() -> bool:
	if unit_type not in ["infantry", "vehicle", "brute"]:
		return false
	# Detailed billboard art is kept only as concept reference. Runtime units use
	# actual 3D meshes so their facing follows their movement, never the camera.
	var role := unit_type
	var model_path := "res://assets/models/%s_%s.glb" % [faction_id, role]
	if faction_id == "ember" and unit_type == "vehicle" and ResourceLoader.exists("res://assets/models/ember_vehicle_rigged.glb"):
		model_path = "res://assets/models/ember_vehicle_rigged.glb"
	var packed_model = load(model_path)
	if packed_model == null:
		return false
	var model = packed_model.instantiate()
	model.name = "FactionModel"
	add_child(model)
	_faction_model = model as Node3D
	_apply_faction_material_style(_faction_model)
	if unit_type == "infantry":
		# The imported character is authored at a human scale. Keep it comparable
		# to vehicles while preserving the original rig and skinning.
		_faction_model.scale = Vector3.ONE * 0.8075
		# Uploaded soldier and alien assets face +Z; RTSUnit uses -Z as forward.
		_faction_model.rotation.y = PI if faction_id == "ember" else 0.0
		_cache_animation_nodes()
	elif unit_type == "vehicle":
		# Slightly reduced so a 1.8 m soldier reads naturally beside the APC.
		_faction_model.scale = Vector3.ONE * 1.258
		_cache_vehicle_nodes(_faction_model)
	elif unit_type == "brute":
		_faction_model.scale = Vector3.ONE * 0.85
		_cache_animation_nodes()
	_model_base_scale_y = _faction_model.scale.y
	# The Ember officer asset already contains its rifle. Do not add the old
	# procedural placeholder on top of it; Xenon keeps the fallback until its
	# weapon-ready asset is replaced.
	if unit_type == "infantry" and faction_id != "ember":
		_attach_faction_rifle()
	_body_visual.visible = false
	_facing_visual.visible = false
	if unit_type == "vehicle":
		var box_shape := BoxShape3D.new()
		box_shape.size = Vector3(2.25, 1.45, 3.65)
		_collision_shape.shape = box_shape
		_collision_shape.position.y = 0.72
		_selection_ring.scale = Vector3.ONE * 1.8
		_health_background.position.y = 2.35
		_health_fill.position.y = 2.35
	return true


func _cache_vehicle_nodes(root: Node) -> void:
	_vehicle_wheels.clear()
	_vehicle_steering_nodes.clear()
	_collect_vehicle_nodes(root)


func _collect_vehicle_nodes(node: Node) -> void:
	if node is Node3D:
		var spatial := node as Node3D
		var lower := String(node.name).to_lower()
		# Rotate only leaf wheel meshes. Importers often expose both a wheel
		# transform and its child mesh; rotating both makes wheels visibly spin in
		# pairs/double-speed.
		if (lower.contains("wheel") or lower.contains("tire") or lower.contains("tyre")) and node.get_child_count() == 0:
			_vehicle_wheels.append(spatial)
			if lower.contains("front") or lower.contains("fl") or lower.contains("fr"):
				_vehicle_steering_nodes.append(spatial)
		if _turret_pivot == null and (lower.contains("turret") or lower.contains("tower")):
			_turret_pivot = spatial
	for child in node.get_children():
		_collect_vehicle_nodes(child)


func _apply_faction_material_style(root: Node) -> void:
	# Tint imported textures without replacing their detail, then add restrained
	# faction emissive accents so both uploaded models read clearly in the RTS.
	var tint := Color(0.58, 0.72, 0.96) if faction_id == "ember" else Color(0.34, 0.20, 0.22)
	var glow := Color(0.08, 0.35, 1.0) if faction_id == "ember" else Color(1.0, 0.035, 0.02)
	for child in root.get_children():
		if child is MeshInstance3D:
			var mesh_node := child as MeshInstance3D
			if mesh_node.mesh != null:
				for surface in range(mesh_node.mesh.get_surface_count()):
					var source := mesh_node.get_active_material(surface)
					if source is BaseMaterial3D:
						var styled := source.duplicate() as BaseMaterial3D
						styled.albedo_color = styled.albedo_color * tint
						styled.metallic = maxf(styled.metallic, 0.35)
						styled.roughness = clampf(styled.roughness, 0.28, 0.78)
						styled.emission_enabled = true
						styled.emission = glow * 0.16
						styled.emission_energy_multiplier = 0.7
						mesh_node.set_surface_override_material(surface, styled)
		_apply_faction_material_style(child)


func _cache_animation_nodes() -> void:
	if not is_instance_valid(_faction_model):
		return
	_left_leg_pivot = _find_model_node("LeftLegPivot")
	_right_leg_pivot = _find_model_node("RightLegPivot")
	_left_arm_pivot = _find_model_node("LeftArmPivot")
	_right_arm_pivot = _find_model_node("RightArmPivot")
	_weapon_pivot = _find_model_node("WeaponPivot")
	_model_animation_player = _find_animation_player(_faction_model)
	if is_instance_valid(_model_animation_player):
		_set_model_animation("idle")


func _find_model_node(node_name: String) -> Node3D:
	var found: Node = _find_node_recursive(_faction_model, node_name)
	return found as Node3D


func _find_node_recursive(parent: Node, node_name: String) -> Node:
	if parent.name == node_name:
		return parent
	for child in parent.get_children():
		var found: Node = _find_node_recursive(child, node_name)
		if found != null:
			return found
	return null


func _find_animation_player(parent: Node) -> AnimationPlayer:
	if parent is AnimationPlayer:
		return parent as AnimationPlayer
	for child in parent.get_children():
		var found := _find_animation_player(child)
		if found != null:
			return found
	return null


func _find_skeleton(parent: Node) -> Skeleton3D:
	if parent is Skeleton3D:
		return parent as Skeleton3D
	for child in parent.get_children():
		var found := _find_skeleton(child)
		if found != null:
			return found
	return null


func _attach_faction_rifle() -> void:
	# Downloaded rigs expose inconsistent bone names. Use a fixed torso mount so
	# the weapon is always visible instead of silently failing to attach.
	var rifle_parent: Node3D = _faction_model
	var rifle := Node3D.new()
	rifle.name = "FactionRifle"
	rifle.position = Vector3(0.0, 1.10, 0.38)
	rifle.rotation = Vector3(-0.16, PI, 0.0)
	rifle_parent.add_child(rifle)
	var armor_color := Color("1c2935") if faction_id == "ember" else Color("15171e")
	var panel_color := Color("315f95") if faction_id == "ember" else Color("4a080e")
	var glow_color := Color("55bbff") if faction_id == "ember" else Color("ff1a25")
	_add_rifle_part(rifle, Vector3(0.08, 0.08, 0.52), Vector3(0.0, 0.0, -0.03), armor_color)
	_add_rifle_part(rifle, Vector3(0.045, 0.045, 0.34), Vector3(0.0, 0.0, -0.42), Color("111820"), true)
	_add_rifle_part(rifle, Vector3(0.10, 0.12, 0.16), Vector3(0.0, -0.055, 0.17), panel_color)
	_add_rifle_part(rifle, Vector3(0.06, 0.065, 0.19), Vector3(0.0, 0.10, -0.07), panel_color)
	_add_rifle_part(rifle, Vector3(0.035, 0.035, 0.09), Vector3(0.0, 0.15, 0.08), glow_color, false, true)


func _add_rifle_part(parent: Node3D, size: Vector3, local_position: Vector3, color: Color, barrel: bool = false, emissive: bool = false) -> void:
	var mesh_instance := MeshInstance3D.new()
	if barrel:
		var cylinder := CylinderMesh.new()
		cylinder.top_radius = size.x
		cylinder.bottom_radius = size.x
		cylinder.height = size.z
		mesh_instance.mesh = cylinder
		mesh_instance.rotation.x = PI * 0.5
	else:
		var box := BoxMesh.new()
		box.size = size
		mesh_instance.mesh = box
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.metallic = 0.72
	material.roughness = 0.3
	if emissive:
		material.emission_enabled = true
		material.emission = color
		material.emission_energy_multiplier = 2.8
	mesh_instance.material_override = material
	mesh_instance.position = local_position
	parent.add_child(mesh_instance)


func _set_model_animation(animation_name: String) -> void:
	if not is_instance_valid(_model_animation_player):
		return
	var resolved := animation_name
	if not _model_animation_player.has_animation(resolved):
		resolved = _resolve_external_animation(animation_name)
	if resolved.is_empty():
		return
	if _active_model_animation == resolved and _model_animation_player.is_playing():
		return
	_model_animation_player.play(resolved, 0.14)
	_active_model_animation = resolved


func _resolve_external_animation(requested: String) -> String:
	if not is_instance_valid(_model_animation_player):
		return ""
	var names := _model_animation_player.get_animation_list()
	if requested == "idle":
		for candidate in names:
			var idle_name := candidate.to_lower()
			if idle_name.contains("t-pose") or idle_name.contains("idle"):
				return candidate
	for candidate in names:
		var lower := candidate.to_lower()
		if requested in ["run", "walk"] and (lower.contains("run") or lower.contains("walk") or lower.contains("motion")):
			return candidate
		if requested.begins_with("attack") and (lower.contains("attack") or lower.contains("bite") or lower.contains("stomp")):
			return candidate
	return names[0] if names.size() > 0 else ""


func _process(delta: float) -> void:
	_animation_time += delta
	_fire_pose_time = maxf(0.0, _fire_pose_time - delta)
	_update_machine_gun_burst(delta)
	_update_infantry_animation(delta)
	_update_squad_marker()


func _update_infantry_animation(delta: float) -> void:
	if unit_type not in ["infantry", "brute"] or not is_instance_valid(_faction_model):
		return
	var running := _has_destination and velocity.length() > 0.25
	_crouch_time = maxf(0.0, _crouch_time - delta)
	_crouch_cooldown = maxf(0.0, _crouch_cooldown - delta)
	var crouching := _crouch_time > 0.0 and not running
	var target_scale_y := _model_base_scale_y * (0.72 if crouching else 1.0)
	_faction_model.scale.y = move_toward(_faction_model.scale.y, target_scale_y, delta * 2.8)
	_faction_model.position.y = move_toward(_faction_model.position.y, 0.0, delta * 3.5)
	if faction_id == "mordra" and _fire_pose_time > 0.0:
		_animate_mordra_attack(delta)
		return
	if is_instance_valid(_model_animation_player):
		var aiming := is_instance_valid(_target)
		if unit_type == "brute" and running:
			_set_model_animation("walk")
		elif aiming and running:
			_set_model_animation("aim_run")
		elif aiming:
			_set_model_animation("aim_idle")
		elif running:
			_set_model_animation("run")
		else:
			_set_model_animation("idle")
		return
	# Legacy hand-built units only: do not apply this motion to a skinned rig.
	if not is_instance_valid(_left_leg_pivot) and not is_instance_valid(_right_leg_pivot):
		return
	var bob := 0.0
	var roll := 0.0
	if running:
		var stride := _animation_time * 11.0
		bob = absf(sin(stride)) * 0.075
		roll = sin(stride * 0.5) * 0.045
		var leg_swing := sin(stride) * 0.55
		var arm_swing := sin(stride) * 0.32
		if is_instance_valid(_left_leg_pivot): _left_leg_pivot.rotation.x = leg_swing
		if is_instance_valid(_right_leg_pivot): _right_leg_pivot.rotation.x = -leg_swing
		if is_instance_valid(_left_arm_pivot): _left_arm_pivot.rotation.x = -arm_swing
		if is_instance_valid(_right_arm_pivot): _right_arm_pivot.rotation.x = arm_swing
	else:
		if is_instance_valid(_left_leg_pivot): _left_leg_pivot.rotation.x = move_toward(_left_leg_pivot.rotation.x, 0.0, delta * 5.0)
		if is_instance_valid(_right_leg_pivot): _right_leg_pivot.rotation.x = move_toward(_right_leg_pivot.rotation.x, 0.0, delta * 5.0)
		if is_instance_valid(_left_arm_pivot): _left_arm_pivot.rotation.x = move_toward(_left_arm_pivot.rotation.x, 0.0, delta * 5.0)
		if is_instance_valid(_right_arm_pivot): _right_arm_pivot.rotation.x = move_toward(_right_arm_pivot.rotation.x, 0.0, delta * 5.0)
	_faction_model.position.y = move_toward(_faction_model.position.y, bob, delta * 3.5)
	var firing_pitch := -0.16 if _fire_pose_time > 0.0 else 0.0
	_faction_model.rotation.x = move_toward(_faction_model.rotation.x, firing_pitch, delta * 4.8)
	_faction_model.rotation.z = move_toward(_faction_model.rotation.z, roll, delta * 5.5)
	if is_instance_valid(_weapon_pivot):
		var aim_pitch := -0.42 if _fire_pose_time > 0.0 else 0.0
		_weapon_pivot.rotation.x = move_toward(_weapon_pivot.rotation.x, aim_pitch, delta * 8.0)


func _animate_mordra_attack(delta: float) -> void:
	# Make the two front tentacles read clearly even when the source clip is
	# authored with a very small amplitude: rear body rises, then both weapons
	# sweep forward together before returning to neutral.
	_mordra_attack_phase += delta * 8.5
	var pulse := sin(_mordra_attack_phase)
	var lift := maxf(0.0, pulse) * 0.38
	_faction_model.position.y = move_toward(_faction_model.position.y, lift, delta * 4.0)
	_faction_model.rotation.x = move_toward(_faction_model.rotation.x, -0.18 * maxf(0.0, pulse), delta * 5.0)
	_animate_mordra_nodes(_faction_model, pulse)


func _animate_mordra_nodes(node: Node, pulse: float) -> void:
	for child in node.get_children():
		if child is Node3D:
			var spatial := child as Node3D
			var lower := String(child.name).to_lower()
			if lower.contains("tentacle") or lower.contains("arm") or lower.contains("claw"):
				spatial.rotation.x = lerp(spatial.rotation.x, -0.55 * maxf(0.0, pulse), 0.22)
				spatial.rotation.z = lerp(spatial.rotation.z, 0.16 * sin(_mordra_attack_phase + (0.7 if lower.contains("right") else 0.0)), 0.22)
			_animate_mordra_nodes(spatial, pulse)


func _apply_detail_sprite() -> bool:
	var sprite_role := "infantry" if unit_type == "infantry" else "carrier"
	var image := Image.load_from_file("res://assets/sprites/%s_%s_detail.png" % [faction_id, sprite_role])
	if image == null or image.is_empty():
		return false
	var texture := ImageTexture.create_from_image(image)

	var visual := Sprite3D.new()
	visual.name = "DetailSprite"
	visual.texture = texture
	visual.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	visual.no_depth_test = false
	visual.shaded = false
	visual.pixel_size = 0.00125 if unit_type == "infantry" else 0.00215
	visual.position.y = 0.96 if unit_type == "infantry" else 1.12
	add_child(visual)

	_body_visual.visible = false
	_facing_visual.visible = false
	if unit_type == "vehicle":
		var box_shape := BoxShape3D.new()
		box_shape.size = Vector3(2.25, 1.45, 3.65)
		_collision_shape.shape = box_shape
		_collision_shape.position.y = 0.72
		_selection_ring.scale = Vector3.ONE * 1.8
		_health_background.position.y = 2.35
		_health_fill.position.y = 2.35
	return true


func _update_hover_animation(delta: float) -> void:
	if unit_type != "vehicle" or team_id != 1:
		return
	var model = get_node_or_null("DetailSprite")
	if not is_instance_valid(model):
		model = get_node_or_null("FactionModel")
	if not is_instance_valid(model):
		return
	_hover_time += delta
	var hover_height := 1.12 if model.name == "DetailSprite" else 0.52
	model.position.y = hover_height + sin(_hover_time * 2.4) * 0.07
	model.rotation.z = sin(_hover_time * 1.3) * 0.018


func _physics_process(delta: float) -> void:
	_update_hover_animation(delta)
	_update_base_healing(delta)
	_attack_timer = maxf(0.0, _attack_timer - delta)
	_avoidance_time = maxf(0.0, _avoidance_time - delta)
	if _update_combat():
		var combat_spacing := _get_combat_spacing_vector()
		var combat_speed := move_speed * 0.28
		velocity.x = move_toward(velocity.x, combat_spacing.x * combat_speed, acceleration * delta)
		velocity.z = move_toward(velocity.z, combat_spacing.z * combat_speed, acceleration * delta)
		move_and_slide()
		return
	if not _has_destination:
		if _final_facing.length_squared() > 0.01 and _update_ordered_turn(delta):
			move_and_slide()
			_update_vehicle_running_gear(delta, signf(velocity.dot(-global_basis.z)))
			return
		velocity.x = move_toward(velocity.x, 0.0, acceleration * delta)
		velocity.z = move_toward(velocity.z, 0.0, acceleration * delta)
		move_and_slide()
		return

	var offset := _destination - global_position
	offset.y = 0.0
	if offset.length() <= arrival_distance:
		if not _waypoints.is_empty():
			_destination = _waypoints.pop_front()
			return
		_has_destination = false
		velocity = Vector3.ZERO
		# Facing is completed with visible footwork/steering on following frames.
		_cover_strength = _pending_cover_strength
		_pending_cover_strength = -1
		return

	var direction := _apply_obstacle_avoidance(offset.normalized())
	var squad_center := _get_live_squad_center()
	var distance_from_squad := global_position.distance_to(squad_center)
	if distance_from_squad > 2.4:
		var regroup_direction := squad_center - global_position
		regroup_direction.y = 0.0
		if regroup_direction.length_squared() > 0.01:
			var regroup_weight := clampf((distance_from_squad - 2.4) / 2.8, 0.35, 0.88)
			direction = direction.lerp(regroup_direction.normalized(), regroup_weight).normalized()
	var active_speed := move_speed * retreat_speed_multiplier if _retreating else move_speed
	if distance_from_squad > 3.8:
		active_speed *= 1.08
	velocity.x = move_toward(velocity.x, direction.x * active_speed, acceleration * delta)
	velocity.z = move_toward(velocity.z, direction.z * active_speed, acceleration * delta)
	var desired_yaw := atan2(-direction.x, -direction.z)
	var yaw_error := wrapf(desired_yaw - rotation.y, -PI, PI)
	var turn_rate := 1.65 if is_vehicle else (2.1 if unit_type == "brute" else 6.2)
	rotation.y = rotate_toward(rotation.y, desired_yaw, turn_rate * delta)
	if is_vehicle:
		_set_vehicle_steering(clampf(yaw_error * 0.75, -0.48, 0.48))
	rotation.x = 0.0
	rotation.z = 0.0
	var position_before_move := global_position
	move_and_slide()
	_update_vehicle_running_gear(delta, 1.0)
	_update_stuck_recovery(delta, position_before_move, offset.normalized())


func _update_ordered_turn(delta: float) -> bool:
	var desired_yaw := atan2(-_final_facing.x, -_final_facing.z)
	var angle_error := wrapf(desired_yaw - rotation.y, -PI, PI)
	if absf(angle_error) < 0.035:
		rotation.y = desired_yaw
		_final_facing = Vector3.ZERO
		velocity = Vector3.ZERO
		_set_model_animation("idle")
		return false
	var turn_sign := signf(angle_error)
	if is_vehicle:
		# A wheeled APC creeps through a real steering arc instead of spinning on a pad.
		var forward := -global_basis.z
		velocity.x = move_toward(velocity.x, forward.x * 0.75, acceleration * delta)
		velocity.z = move_toward(velocity.z, forward.z * 0.75, acceleration * delta)
		rotation.y = rotate_toward(rotation.y, desired_yaw, delta * 0.78)
		_set_vehicle_steering(turn_sign * 0.48)
	else:
		velocity.x = move_toward(velocity.x, 0.0, acceleration * delta)
		velocity.z = move_toward(velocity.z, 0.0, acceleration * delta)
		rotation.y = rotate_toward(rotation.y, desired_yaw, delta * (1.15 if unit_type == "brute" else 2.6))
		_set_model_animation("turn_right" if turn_sign > 0.0 else "turn_left")
	return true


func _set_vehicle_steering(steer_angle: float) -> void:
	for steering_node in _vehicle_steering_nodes:
		if is_instance_valid(steering_node):
			steering_node.rotation.y = move_toward(steering_node.rotation.y, steer_angle, 0.08)


func _update_vehicle_running_gear(delta: float, travel_sign: float) -> void:
	if not is_vehicle:
		return
	var planar_speed := Vector2(velocity.x, velocity.z).length()
	_wheel_roll += planar_speed * delta * (1.0 if travel_sign >= 0.0 else -1.0) * 2.2
	for wheel in _vehicle_wheels:
		if is_instance_valid(wheel):
			wheel.rotation.x = _wheel_roll
	if _final_facing.length_squared() <= 0.01:
		_set_vehicle_steering(0.0)


func _get_combat_spacing_vector() -> Vector3:
	# Squads close ranks while travelling via formation destinations, then open
	# a small firing gap once combat begins so members do not stack together.
	var separation := Vector3.ZERO
	var squad_center := _get_live_squad_center()
	var cohesion := squad_center - global_position
	cohesion.y = 0.0
	if cohesion.length_squared() > 0.01:
		separation += cohesion.normalized() * clampf(cohesion.length() / 5.0, 0.0, 1.0) * 1.35
	for node in get_tree().get_nodes_in_group("rts_units"):
		var ally = node as RTSUnit
		if ally == null or ally == self or ally.team_id != team_id or ally.squad_id != squad_id:
			continue
		var delta: Vector3 = global_position - ally.global_position
		delta.y = 0.0
		var distance: float = delta.length()
		if distance > 0.02 and distance < 1.95:
			separation += delta.normalized() * (1.0 - distance / 1.95)
	return separation.limit_length(1.0)


func _get_live_squad_center() -> Vector3:
	var center := Vector3.ZERO
	var count := 0
	for node in get_tree().get_nodes_in_group("rts_units"):
		var ally = node as RTSUnit
		if ally == null or ally.team_id != team_id or ally.squad_id != squad_id:
			continue
		center += ally.global_position
		count += 1
	return center / float(count) if count > 0 else global_position


func move_to(world_position: Vector3, final_facing: Vector3 = Vector3.ZERO, cover_strength: int = -1) -> void:
	if _retreating:
		return
	_set_move_destination(world_position, final_facing, cover_strength)


func _set_move_destination(world_position: Vector3, final_facing: Vector3 = Vector3.ZERO, cover_strength: int = -1) -> void:
	_waypoints.clear()
	var pathfinders := get_tree().get_nodes_in_group("pathfinding_manager")
	if not pathfinders.is_empty():
		var path: Array[Vector3] = pathfinders[0].get_world_path(global_position, world_position)
		for point in path:
			point.y = global_position.y
			_waypoints.append(point)
	if not _waypoints.is_empty():
		_destination = _waypoints.pop_front()
	else:
		_destination = world_position
		_destination.y = global_position.y
	_final_facing = final_facing
	_final_facing.y = 0.0
	if _final_facing.length_squared() > 0.01:
		_final_facing = _final_facing.normalized()
	_cover_strength = -1
	_pending_cover_strength = cover_strength
	_has_destination = true


func retreat_to_home() -> void:
	_target = null
	_cover_strength = -1
	_pending_cover_strength = -1
	_retreating = true
	var home_position := Vector3(0.0, global_position.y, 96.0 if team_id == 0 else -96.0)
	_set_move_destination(home_position)


func attack_target(target_unit: Node) -> void:
	if target_unit == null or not target_unit.is_in_group("rts_units") or target_unit.team_id == team_id:
		return
	_target = target_unit
	_has_destination = false
	_final_facing = target_unit.global_position - global_position
	_final_facing.y = 0.0


func is_retreating() -> bool:
	return _retreating


func _update_base_healing(delta: float) -> void:
	var home_z := 96.0 if team_id == 0 else -96.0
	var distance_to_home := Vector2(global_position.x, global_position.z).distance_to(Vector2(0.0, home_z))
	if distance_to_home > 14.0:
		return
	if _health < max_health:
		_health = minf(max_health, _health + base_healing_per_second * delta)
		_update_health_bar()
	if _retreating and _health >= max_health * 0.85:
		_retreating = false


func take_damage(amount: float, attacker_position: Vector3) -> void:
	var final_damage := amount
	# Incoming fire can make infantry duck briefly, especially while occupying cover.
	if _crouch_cooldown <= 0.0 and randf() < (0.65 if _cover_strength >= 0 else 0.35):
		_crouch_time = randf_range(0.8, 5.0)
		_crouch_cooldown = randf_range(1.4, 2.8)
	if _cover_strength >= 0:
		var incoming_direction := attacker_position - global_position
		incoming_direction.y = 0.0
		var forward := -global_basis.z
		forward.y = 0.0
		if incoming_direction.length_squared() > 0.01 and forward.normalized().dot(incoming_direction.normalized()) > 0.15:
			final_damage *= 0.5 if _cover_strength == 1 else 0.75
	if _crouch_time > 0.0:
		final_damage *= 0.82
	_health = maxf(0.0, _health - final_damage)
	_update_health_bar()
	if _health <= 0.0:
		queue_free()


func get_health_ratio() -> float:
	return clampf(_health / max_health, 0.0, 1.0)


func _update_combat() -> bool:
	if _retreating:
		_target = null
		return false
	if not is_instance_valid(_target) or _target.team_id == team_id or global_position.distance_to(_target.global_position) > attack_range:
		_target = _find_nearest_enemy()
	if not is_instance_valid(_target):
		return false
	# Keep the soldier's head down while crouching in cover; resume fire only
	# after the crouch timer expires and the model stands up again.
	if _cover_strength >= 0 and _crouch_time > 0.0:
		return true
	var direction: Vector3 = _target.global_position - global_position
	direction.y = 0.0
	if direction.length_squared() > 0.01:
		var desired_yaw := atan2(-direction.x, -direction.z)
		if is_vehicle and is_instance_valid(_turret_pivot):
			var local_target_yaw := wrapf(desired_yaw - rotation.y, -PI, PI)
			_turret_pivot.rotation.y = lerp_angle(_turret_pivot.rotation.y, local_target_yaw, 0.16)
		elif not is_vehicle:
			var error := wrapf(desired_yaw - rotation.y, -PI, PI)
			if absf(error) > 0.08:
				_set_model_animation("turn_right" if error > 0.0 else "turn_left")
			rotation.y = rotate_toward(rotation.y, desired_yaw, get_physics_process_delta_time() * (1.1 if unit_type == "brute" else 2.8))
	if _attack_timer <= 0.0:
		_perform_attack(_target)
		_attack_timer = attack_cooldown
	return true


func _perform_attack(attack_target) -> void:
	if not is_instance_valid(attack_target):
		return
	if faction_id == "mordra":
		_fire_pose_time = 1.0 if unit_type == "infantry" else 2.4
		if unit_type == "brute":
			_set_model_animation("attack_stomp" if _mordra_attack_side else "attack_bite")
		else:
			_set_model_animation("attack_tentacle_right" if _mordra_attack_side else "attack_tentacle_left")
		_mordra_attack_side = not _mordra_attack_side
		attack_target.take_damage(attack_damage, global_position)
		return
	if unit_type == "infantry":
		_start_machine_gun_burst(attack_target)
	else:
		_fire_projectile(attack_target, attack_damage, 0.12)


func _start_machine_gun_burst(attack_target) -> void:
	_burst_target = attack_target
	_burst_shots_remaining = 5
	_burst_shot_timer = 0.0
	_fire_pose_time = 0.62


func _update_machine_gun_burst(delta: float) -> void:
	if _burst_shots_remaining <= 0:
		return
	if not is_instance_valid(_burst_target):
		_burst_shots_remaining = 0
		return
	_burst_shot_timer -= delta
	if _burst_shot_timer > 0.0:
		return
	_fire_projectile(_burst_target, attack_damage, 1.05)
	_burst_shots_remaining -= 1
	_burst_shot_timer = 0.085 + randf_range(-0.012, 0.018)


func _fire_projectile(projectile_target, projectile_damage: float = -1.0, spread: float = 0.0) -> void:
	if not is_instance_valid(projectile_target):
		return
	_fire_pose_time = 0.22
	var distance := global_position.distance_to(projectile_target.global_position)
	var spread_radius := spread * lerpf(0.45, 1.0, clampf(distance / maxf(attack_range, 0.1), 0.0, 1.0))
	var aim_position: Vector3 = projectile_target.global_position + Vector3.UP * 1.15
	if spread_radius > 0.0:
		var angle := randf() * TAU
		var radius := sqrt(randf()) * spread_radius
		aim_position += Vector3(cos(angle) * radius, randf_range(-0.22, 0.22) * spread_radius, sin(angle) * radius)
	var projectile = UNIT_PROJECTILE.new()
	var final_damage := attack_damage if projectile_damage < 0.0 else projectile_damage
	projectile.initialize(projectile_target, final_damage, global_position, team_id, aim_position)
	projectile.position = global_position + Vector3.UP * 0.92 - global_basis.z * 0.38
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
	var origin := global_position + Vector3.UP * 1.18
	var destination: Vector3 = candidate.global_position + Vector3.UP * 1.18
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
	capsule_shape.radius = 0.38
	capsule_shape.height = 1.55
	_collision_shape.shape = capsule_shape
	_collision_shape.position.y = 0.78
	add_child(_collision_shape)

	_body_visual = MeshInstance3D.new()
	var capsule_mesh := CapsuleMesh.new()
	capsule_mesh.radius = 0.38
	capsule_mesh.height = 1.55
	_body_visual.mesh = capsule_mesh
	_body_visual.position.y = 0.78
	var body_material := StandardMaterial3D.new()
	body_material.albedo_color = Color(0.16, 0.42, 0.62) if team_id == 0 else Color(0.70, 0.18, 0.14)
	body_material.roughness = 0.8
	_body_visual.material_override = body_material
	add_child(_body_visual)

	_facing_visual = MeshInstance3D.new()
	var facing_mesh := BoxMesh.new()
	facing_mesh.size = Vector3(0.18, 0.18, 0.75)
	_facing_visual.mesh = facing_mesh
	_facing_visual.position = Vector3(0.0, 0.88, -0.50)
	_facing_visual.scale = Vector3.ONE * 0.70
	var facing_material := StandardMaterial3D.new()
	facing_material.albedo_color = Color(0.08, 0.10, 0.11)
	_facing_visual.material_override = facing_material
	add_child(_facing_visual)

	_selection_ring = MeshInstance3D.new()
	var ring_mesh := TorusMesh.new()
	ring_mesh.inner_radius = 0.50
	ring_mesh.outer_radius = 0.62
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
	health_background_mesh.size = Vector3(1.05, 0.08, 0.06)
	_health_background.mesh = health_background_mesh
	_health_background.position = Vector3(0.0, 1.82, 0.0)
	var health_background_material := StandardMaterial3D.new()
	health_background_material.albedo_color = Color(0.08, 0.08, 0.08)
	health_background_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_health_background.material_override = health_background_material
	add_child(_health_background)

	_health_fill = MeshInstance3D.new()
	var health_fill_mesh := BoxMesh.new()
	health_fill_mesh.size = Vector3(0.98, 0.09, 0.07)
	_health_fill.mesh = health_fill_mesh
	_health_fill.position = Vector3(0.0, 1.82, -0.01)
	var health_fill_material := StandardMaterial3D.new()
	health_fill_material.albedo_color = Color(0.18, 0.92, 0.25)
	health_fill_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_health_fill.material_override = health_fill_material
	add_child(_health_fill)


func _build_unit_role_marker() -> void:
	if not _is_squad_marker_owner():
		_health_background.visible = false
		_health_fill.visible = false
		return
	# A small Company-of-Heroes-style squad badge; ownership is refreshed every frame.
	var marker := Node3D.new()
	marker.name = "UnitRoleMarker"
	marker.position.y = 2.34 if unit_type == "infantry" else 2.92
	add_child(marker)
	_squad_marker = marker
	var icon_color := Color(0.25, 0.78, 1.0) if team_id == 0 else Color(1.0, 0.20, 0.16)
	var icon_material := StandardMaterial3D.new()
	icon_material.albedo_color = icon_color
	icon_material.emission_enabled = true
	icon_material.emission = icon_color * 0.55
	icon_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	var dark_material := StandardMaterial3D.new()
	dark_material.albedo_color = Color(0.035, 0.045, 0.055)
	dark_material.metallic = 0.6
	var base := MeshInstance3D.new()
	var base_mesh := BoxMesh.new()
	base_mesh.size = Vector3(0.26, 0.035, 0.26)
	base.mesh = base_mesh
	base.rotation.y = PI * 0.25
	base.material_override = dark_material
	marker.add_child(base)
	var badge := Label3D.new()
	badge.name = "FactionBadge"
	badge.text = "◆"
	badge.font_size = 28
	badge.outline_size = 7
	badge.modulate = icon_color
	badge.outline_modulate = Color(0.015, 0.02, 0.025, 0.95)
	badge.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	badge.no_depth_test = false
	badge.position.y = 0.045
	marker.add_child(badge)
	var badge_area := Area3D.new()
	badge_area.name = "SquadBadgeHitArea"
	badge_area.collision_layer = 0
	badge_area.collision_mask = 0
	badge_area.input_ray_pickable = true
	var badge_shape := CollisionShape3D.new()
	var badge_box := BoxShape3D.new()
	badge_box.size = Vector3(0.72, 0.22, 0.72)
	badge_shape.shape = badge_box
	badge_shape.position.y = 0.05
	badge_area.add_child(badge_shape)
	badge_area.input_event.connect(_on_squad_badge_input)
	marker.add_child(badge_area)
	for rank in range(2):
		for side in [-1.0, 1.0]:
			var chevron := MeshInstance3D.new()
			var chevron_mesh := BoxMesh.new()
			chevron_mesh.size = Vector3(0.12, 0.022, 0.040)
			chevron.mesh = chevron_mesh
			chevron.position = Vector3(side * 0.052, 0.040, -0.065 + rank * 0.12)
			chevron.rotation.y = side * 0.72
			chevron.material_override = icon_material
			marker.add_child(chevron)


func _on_squad_badge_input(_camera: Node, event: InputEvent, _event_position: Vector3, _normal: Vector3, _shape_idx: int) -> void:
	if team_id != 0 or not (event is InputEventMouseButton):
		return
	var mouse_event := event as InputEventMouseButton
	if mouse_event.button_index == MOUSE_BUTTON_LEFT and mouse_event.pressed:
		for controller in get_tree().get_nodes_in_group("unit_command_controller"):
			if controller.has_method("select_squad_from_badge"):
				controller.select_squad_from_badge(squad_id)
				break


func _is_squad_marker_owner() -> bool:
	for unit in get_tree().get_nodes_in_group("rts_units"):
		if unit != self and unit.team_id == team_id and unit.squad_id == squad_id and unit.get_instance_id() < get_instance_id():
			return false
	return true


func _update_squad_marker() -> void:
	var owner = _get_squad_marker_owner()
	var is_owner: bool = owner == self
	if is_instance_valid(_squad_marker):
		_squad_marker.visible = is_owner
	_health_background.visible = is_owner
	_health_fill.visible = is_owner
	if not is_owner or not is_instance_valid(_squad_marker):
		return
	var center := Vector3.ZERO
	var member_count := 0
	var squad_health := 0.0
	var squad_max_health := 0.0
	for unit in get_tree().get_nodes_in_group("rts_units"):
		if unit.team_id == team_id and unit.squad_id == squad_id:
			center += unit.global_position
			member_count += 1
			squad_health += maxf(0.0, unit._health)
			squad_max_health += maxf(0.001, unit.max_health)
	if member_count > 0:
		_squad_marker.global_position = center / float(member_count) + Vector3.UP * 3.0
		if is_instance_valid(_health_fill):
			_health_fill.scale.x = clampf(squad_health / maxf(0.001, squad_max_health), 0.001, 1.0)


func _get_squad_marker_owner():
	var owner = null
	for unit in get_tree().get_nodes_in_group("rts_units"):
		if unit.team_id != team_id or unit.squad_id != squad_id:
			continue
		if owner == null or unit.get_instance_id() < owner.get_instance_id():
			owner = unit
	return owner


func _update_health_bar() -> void:
	if is_instance_valid(_health_fill):
		var owner = _get_squad_marker_owner()
		if owner == self:
			var squad_health := 0.0
			var squad_max_health := 0.0
			for unit in get_tree().get_nodes_in_group("rts_units"):
				if unit.team_id == team_id and unit.squad_id == squad_id:
					squad_health += maxf(0.0, unit._health)
					squad_max_health += maxf(0.001, unit.max_health)
			_health_fill.scale.x = clampf(squad_health / maxf(0.001, squad_max_health), 0.001, 1.0) if owner == self else maxf(0.001, get_health_ratio())


func _convert_visuals_to_vehicle() -> void:
	_body_visual.visible = false
	_facing_visual.visible = false
	var box_shape := BoxShape3D.new()
	box_shape.size = Vector3(1.72, 0.94, 2.85)
	_collision_shape.shape = box_shape
	_collision_shape.position.y = 0.54

	var vehicle_material := StandardMaterial3D.new()
	vehicle_material.albedo_color = Color(0.13, 0.38, 0.58) if team_id == 0 else Color(0.58, 0.12, 0.10)
	vehicle_material.metallic = 0.55
	vehicle_material.roughness = 0.62

	var hull := MeshInstance3D.new()
	var hull_mesh: PrimitiveMesh
	if team_id == 0:
		var ember_hull := BoxMesh.new()
		ember_hull.size = Vector3(1.72, 0.75, 2.85)
		hull_mesh = ember_hull
	else:
		var organic_hull := CapsuleMesh.new()
		organic_hull.radius = 0.72
		organic_hull.height = 2.85
		hull_mesh = organic_hull
	hull.mesh = hull_mesh
	hull.position.y = 0.56
	if team_id == 1:
		hull.rotation.x = PI * 0.5
	hull.material_override = vehicle_material
	add_child(hull)

	var turret := MeshInstance3D.new()
	var turret_mesh := CylinderMesh.new()
	turret_mesh.top_radius = 0.54
	turret_mesh.bottom_radius = 0.66
	turret_mesh.height = 0.41
	turret.mesh = turret_mesh
	turret.position = Vector3(0.0, 1.12, -0.15)
	turret.material_override = vehicle_material
	add_child(turret)

	var cannon := MeshInstance3D.new()
	var cannon_mesh := BoxMesh.new()
	cannon_mesh.size = Vector3(0.14, 0.14, 1.69)
	cannon.mesh = cannon_mesh
	cannon.position = Vector3(0.0, 1.16, -1.31)
	var cannon_material := StandardMaterial3D.new()
	cannon_material.albedo_color = Color(0.10, 0.12, 0.13)
	cannon_material.metallic = 0.7
	cannon.material_override = cannon_material
	add_child(cannon)
	if team_id == 0:
		for side in [-1.0, 1.0]:
			var track := MeshInstance3D.new()
			var track_mesh := BoxMesh.new()
			track_mesh.size = Vector3(0.34, 0.42, 2.75)
			track.mesh = track_mesh
			track.position = Vector3(side * 0.92, 0.40, 0.0)
			track.material_override = cannon_material
			add_child(track)
	else:
		for side in [-1.0, 1.0]:
			var pod := MeshInstance3D.new()
			var pod_mesh := CapsuleMesh.new()
			pod_mesh.radius = 0.26
			pod_mesh.height = 2.35
			pod.mesh = pod_mesh
			pod.rotation.x = PI * 0.5
			pod.position = Vector3(side * 0.82, 0.38, 0.12)
			pod.material_override = vehicle_material
			add_child(pod)

	_selection_ring.scale = Vector3.ONE * 1.5


func _decorate_infantry() -> void:
	var armor := StandardMaterial3D.new()
	armor.albedo_color = Color(0.12, 0.34, 0.58) if team_id == 0 else Color(0.62, 0.06, 0.09)
	armor.metallic = 0.45
	armor.roughness = 0.55
	var helmet := MeshInstance3D.new()
	var helmet_mesh := SphereMesh.new()
	helmet_mesh.radius = 0.30 if team_id == 0 else 0.26
	helmet_mesh.height = 0.42
	helmet.mesh = helmet_mesh
	helmet.position = Vector3(0.0, 1.45, 0.0)
	helmet.material_override = armor
	add_child(helmet)
	for side in [-1.0, 1.0]:
		var shoulder := MeshInstance3D.new()
		var shoulder_mesh := BoxMesh.new()
		shoulder_mesh.size = Vector3(0.22, 0.22, 0.34) if team_id == 0 else Vector3(0.16, 0.34, 0.20)
		shoulder.mesh = shoulder_mesh
		shoulder.position = Vector3(side * 0.39, 1.10, 0.0)
		shoulder.rotation.z = side * (0.18 if team_id == 0 else 0.52)
		shoulder.material_override = armor
		add_child(shoulder)
	if team_id == 0:
		var backpack := MeshInstance3D.new()
		var backpack_mesh := BoxMesh.new()
		backpack_mesh.size = Vector3(0.48, 0.58, 0.24)
		backpack.mesh = backpack_mesh
		backpack.position = Vector3(0.0, 0.96, 0.32)
		backpack.material_override = armor
		add_child(backpack)
	else:
		for side in [-1.0, 1.0]:
			var blade := MeshInstance3D.new()
			var blade_mesh := PrismMesh.new()
			blade_mesh.size = Vector3(0.12, 0.62, 0.30)
			blade.mesh = blade_mesh
			blade.position = Vector3(side * 0.22, 1.22, 0.30)
			blade.rotation.z = side * 0.35
			blade.material_override = armor
			add_child(blade)


func _convert_visuals_to_graybox_unit() -> void:
	_body_visual.visible = false
	_facing_visual.visible = false
	var color := Color(0.18, 0.46, 0.72) if team_id == 0 else Color(0.72, 0.10, 0.12)
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.metallic = 0.35
	var body := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	if unit_type == "tank":
		mesh.size = Vector3(2.3, 0.85, 3.4)
		body.position.y = 0.58
	elif unit_type == "helicopter":
		mesh.size = Vector3(1.35, 0.75, 3.0)
		body.position.y = 2.2
	else:
		mesh.size = Vector3(3.2, 0.42, 2.4)
		body.position.y = 2.8
	body.mesh = mesh
	body.material_override = material
	add_child(body)
	var marker := Label3D.new()
	marker.text = "TANK" if unit_type == "tank" else ("HELIKOPTER" if unit_type == "helicopter" else "VADÁSZGÉP")
	marker.position = body.position + Vector3.UP * 1.0
	marker.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	marker.font_size = 28
	add_child(marker)
	_selection_ring.scale = Vector3.ONE * 1.8
	_health_background.position.y = 1.70
	_health_fill.position.y = 1.70


func _convert_visuals_to_brute_placeholder() -> void:
	# Temporary silhouette only; replaced automatically by mordra_brute.glb.
	_body_visual.visible = false
	_facing_visual.visible = false
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.34, 0.09, 0.07)
	material.roughness = 0.82
	var body := MeshInstance3D.new()
	var body_mesh := CapsuleMesh.new()
	body_mesh.radius = 0.78
	body_mesh.height = 2.8
	body.mesh = body_mesh
	body.rotation.x = PI * 0.5
	body.position = Vector3(0.0, 0.82, 0.0)
	body.material_override = material
	add_child(body)
	var shape := CapsuleShape3D.new()
	shape.radius = 0.8
	shape.height = 2.8
	_collision_shape.shape = shape
	_collision_shape.rotation.x = PI * 0.5
	_collision_shape.position.y = 0.8
	_selection_ring.scale = Vector3.ONE * 1.65
	_health_background.position.y = 2.35
	_health_fill.position.y = 2.35
