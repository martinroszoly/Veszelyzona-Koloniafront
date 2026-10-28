extends Node3D

const RTSUnit := preload("res://scripts/strategy_unit.gd")
const CapturePoint := preload("res://scripts/capture_point.gd")
const CameraRig := preload("res://scripts/camera_rig.gd")
const AIController := preload("res://scripts/ai_controller.gd")

const MAP_WIDTH := 260.0
const MAP_DEPTH := 180.0
const NAV_CELL_SIZE := 4.0
const CAPTURE_DATA := [
	{"id": "west_mine", "name": "Érclelőhely", "position": Vector3(-72.0, 0.0, -28.0), "kind": "resource", "resource": "metal", "production": 18.0},
	{"id": "west_depot", "name": "Nyugati utánpótlás", "position": Vector3(-40.0, 0.0, 34.0), "kind": "supply", "resource": "fuel", "production": 8.0},
	{"id": "central_vp", "name": "Központi parancsnoki pont", "position": Vector3(0.0, 0.0, 0.0), "kind": "victory", "resource": "victory", "production": 0.0, "victory": 2.5},
	{"id": "east_fuel", "name": "Keleti üzemanyagtelep", "position": Vector3(40.0, 0.0, -34.0), "kind": "resource", "resource": "fuel", "production": 18.0},
	{"id": "east_depot", "name": "Xenon utánpótlás", "position": Vector3(72.0, 0.0, 28.0), "kind": "supply", "resource": "metal", "production": 8.0}
]
const BUILD_COSTS := {"barracks": {"metal": 210.0, "fuel": 90.0}, "vehicle_yard": {"metal": 300.0, "fuel": 210.0}}
const TRAIN_COSTS := {"infantry": {"metal": 125.0, "fuel": 35.0}, "tank": {"metal": 270.0, "fuel": 165.0}}
const TRAIN_TIMES := {"infantry": 12.0, "tank": 22.0}
const AI_LABELS := {"easy": "Könnyű", "normal": "Normál", "hard": "Nehéz", "very_hard": "Nagyon nehéz"}

@onready var map_root: Node3D = $World/Map
@onready var units_root: Node3D = $World/Units
@onready var camera_rig: Node3D = $World/CameraRig

var noise := FastNoiseLite.new()
var path_grid := AStarGrid2D.new()
var capture_points: Array[StrategicCapturePoint] = []
var units: Array[RTSStrategyUnit] = []
var bases: Dictionary = {}
var resources := {"ember": {"metal": 420.0, "fuel": 300.0}, "xenon": {"metal": 420.0, "fuel": 300.0}}
var victory_score := {"ember": 0.0, "xenon": 0.0}
var buildings := {"ember": {"barracks": false, "vehicle_yard": false}, "xenon": {"barracks": false, "vehicle_yard": false}}
var construction := {"ember": "", "xenon": ""}
var construction_clock := {"ember": 0.0, "xenon": 0.0}
var training_queue := {"ember": "", "xenon": ""}
var training_clock := {"ember": 0.0, "xenon": 0.0}
var selected_units: Array[RTSStrategyUnit] = []
var ai_controller: RTSLocalAI
var selected_difficulty := "normal"
var point_tick_clock := 0.0
var hud_clock := 0.0
var supply_clock := 0.0
var match_finished := false
var front_mesh: MeshInstance3D
var front_material: StandardMaterial3D
var header_label: Label
var resource_label: Label
var point_label: Label
var status_label: Label
var selected_label: Label
var ai_selector: OptionButton
var build_barracks_button: Button
var train_infantry_button: Button
var build_yard_button: Button
var train_tank_button: Button


func _ready() -> void:
	_setup_input_map()
	_setup_noise()
	_create_environment()
	_create_terrain()
	_create_river_roads_and_cover()
	_create_bases()
	_create_capture_points()
	_setup_navigation_grid()
	_create_initial_armies()
	_create_frontline()
	_create_hud()
	_create_ai()
	_update_supply_states()
	_update_frontline()
	_update_hud()


func _process(delta: float) -> void:
	if match_finished:
		return
	point_tick_clock += delta
	for point in capture_points:
		var player_count := 0
		var enemy_count := 0
		for unit in units:
			if not is_instance_valid(unit) or not unit.alive or not unit.capture_capable:
				continue
			if _flat_distance(unit.global_position, point.global_position) <= CapturePoint.CAPTURE_RADIUS:
				if unit.side == "ember":
					player_count += 1
				else:
					enemy_count += 1
		point.tick_capture(delta, player_count, enemy_count)
		if point.owner_side == "ember" and point.supplied_player:
			resources.ember[point.resource_kind] = float(resources.ember.get(point.resource_kind, 0.0)) + point.production_per_second * delta
			victory_score.ember = float(victory_score.ember) + point.victory_per_second * delta
		elif point.owner_side == "ember":
			victory_score.ember = float(victory_score.ember) + point.victory_per_second * delta
		if point.owner_side == "xenon" and point.supplied_enemy:
			resources.xenon[point.resource_kind] = float(resources.xenon.get(point.resource_kind, 0.0)) + point.production_per_second * delta
			victory_score.xenon = float(victory_score.xenon) + point.victory_per_second * delta
		elif point.owner_side == "xenon":
			victory_score.xenon = float(victory_score.xenon) + point.victory_per_second * delta
	_update_economy_jobs(delta)
	supply_clock += delta
	if supply_clock >= 1.0:
		supply_clock = 0.0
		_update_supply_states()
		_update_frontline()
	hud_clock += delta
	if hud_clock >= 0.25:
		hud_clock = 0.0
		_update_hud()
	_check_victory()


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_LEFT:
			_select_at(event.position, Input.is_key_pressed(KEY_CTRL))
		elif event.button_index == MOUSE_BUTTON_RIGHT:
			_issue_order_at(event.position)
	elif event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_B:
			request_build("ember", "barracks")
		elif event.keycode == KEY_T:
			request_train("ember", "infantry")
		elif event.keycode == KEY_V:
			request_build("ember", "vehicle_yard")
		elif event.keycode == KEY_Y:
			request_train("ember", "tank")


func _setup_input_map() -> void:
	_add_key_action("camera_up", KEY_W)
	_add_key_action("camera_down", KEY_S)
	_add_key_action("camera_left", KEY_A)
	_add_key_action("camera_right", KEY_D)
	_add_key_action("camera_rotate_left", KEY_Q)
	_add_key_action("camera_rotate_right", KEY_E)
	_add_key_action("camera_tilt_up", KEY_R)
	_add_key_action("camera_tilt_down", KEY_F)


func _add_key_action(action_name: String, key: Key) -> void:
	if InputMap.has_action(action_name):
		return
	InputMap.add_action(action_name)
	var event := InputEventKey.new()
	event.keycode = key
	InputMap.action_add_event(action_name, event)


func _setup_noise() -> void:
	noise.seed = 84217
	noise.noise_type = FastNoiseLite.TYPE_SIMPLEX
	noise.frequency = 0.026
	noise.fractal_octaves = 3
	noise.fractal_gain = 0.46
	noise.fractal_lacunarity = 2.0


func terrain_height(world_x: float, world_z: float) -> float:
	var broad := noise.get_noise_2d(world_x, world_z) * 2.4
	var ridge := maxf(0.0, noise.get_noise_2d(world_x * 0.43 + 80.0, world_z * 0.43 - 120.0)) * 3.2
	var base_slope := maxf(0.0, (absf(world_z) - 66.0) * 0.065)
	return broad + ridge + base_slope


func _create_environment() -> void:
	var world_environment := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_SKY
	var sky := Sky.new()
	var sky_material := ProceduralSkyMaterial.new()
	sky_material.sky_top_color = Color(0.14, 0.22, 0.28)
	sky_material.sky_horizon_color = Color(0.48, 0.55, 0.53)
	sky_material.ground_bottom_color = Color(0.12, 0.15, 0.12)
	sky_material.ground_horizon_color = Color(0.38, 0.43, 0.38)
	sky.sky_material = sky_material
	environment.sky = sky
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color(0.72, 0.78, 0.72)
	environment.ambient_light_energy = 0.72
	environment.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	world_environment.environment = environment
	add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-53.0, -34.0, 0.0)
	sun.light_color = Color(1.0, 0.9, 0.76)
	sun.light_energy = 1.4
	sun.shadow_enabled = true
	sun.directional_shadow_max_distance = 190.0
	add_child(sun)

	var fill := DirectionalLight3D.new()
	fill.rotation_degrees = Vector3(-28.0, 138.0, 0.0)
	fill.light_color = Color(0.56, 0.68, 0.8)
	fill.light_energy = 0.38
	fill.shadow_enabled = false
	add_child(fill)


func _create_terrain() -> void:
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	var columns := 100
	var rows := 72
	for z_index in range(rows):
		for x_index in range(columns):
			var x0 := -MAP_WIDTH * 0.5 + MAP_WIDTH * float(x_index) / float(columns)
			var x1 := -MAP_WIDTH * 0.5 + MAP_WIDTH * float(x_index + 1) / float(columns)
			var z0 := -MAP_DEPTH * 0.5 + MAP_DEPTH * float(z_index) / float(rows)
			var z1 := -MAP_DEPTH * 0.5 + MAP_DEPTH * float(z_index + 1) / float(rows)
			var p00 := Vector3(x0, terrain_height(x0, z0), z0)
			var p10 := Vector3(x1, terrain_height(x1, z0), z0)
			var p01 := Vector3(x0, terrain_height(x0, z1), z1)
			var p11 := Vector3(x1, terrain_height(x1, z1), z1)
			surface.set_uv(Vector2(float(x_index) / columns, float(z_index) / rows))
			surface.add_vertex(p00)
			surface.set_uv(Vector2(float(x_index) / columns, float(z_index + 1) / rows))
			surface.add_vertex(p01)
			surface.set_uv(Vector2(float(x_index + 1) / columns, float(z_index) / rows))
			surface.add_vertex(p10)
			surface.set_uv(Vector2(float(x_index + 1) / columns, float(z_index) / rows))
			surface.add_vertex(p10)
			surface.set_uv(Vector2(float(x_index) / columns, float(z_index + 1) / rows))
			surface.add_vertex(p01)
			surface.set_uv(Vector2(float(x_index + 1) / columns, float(z_index + 1) / rows))
			surface.add_vertex(p11)
	surface.generate_normals()
	var terrain := MeshInstance3D.new()
	terrain.name = "Rolling3DGround"
	terrain.mesh = surface.commit()
	terain.material_override = _make_material(Color(0.26, 0.34, 0.23), 0.98)
	terrain.create_trimesh_collision()
	map_root.add_child(terrain)
	var collision_body := terrain.get_child(0) if terrain.get_child_count() > 0 else null
	if collision_body is StaticBody3D:
		collision_body.collision_layer = 4
		collision_body.collision_mask = 0

	var boundary := MeshInstance3D.new()
	var underlay := BoxMesh.new()
	underlay.size = Vector3(MAP_WIDTH + 16.0, 6.0, MAP_DEPTH + 16.0)
	boundary.mesh = underlay
	boundary.position.y = -4.2
	boundary.material_override = _make_material(Color(0.13, 0.17, 0.14), 1.0)
	map_root.add_child(boundary)


func _create_river_roads_and_cover() -> void:
	var water := MeshInstance3D.new()
	var water_mesh := BoxMesh.new()
	water_mesh.size = Vector3(13.5, 0.35, MAP_DEPTH)
	water.mesh = water_mesh
	water.position = Vector3(0.0, 0.35, 0.0)
	water.material_override = _make_material(Color(0.16, 0.29, 0.33, 0.9), 0.26, true)
	map_root.add_child(water)

	for bridge_z in [-0.8, 0.8]:
		var bridge := MeshInstance3D.new()
		var deck := BoxMesh.new()
		deck.size = Vector3(23.0, 0.8, 10.0)
		bridge.mesh = deck
		bridge.position = Vector3(0.0, terrain_height(0.0, bridge_z) + 0.55, bridge_z)
		bridge.material_override = _make_material(Color(0.31, 0.29, 0.24), 0.9)
		map_root.add_child(bridge)
		_add_bridge_beams(bridge_z)

	var road_points := [
		[Vector3(-119.0, 0.0, 0.0), Vector3(-72.0, 0.0, -28.0)],
		[Vector3(-72.0, 0.0, -28.0), Vector3(-40.0, 0.0, 34.0)],
		[Vector3(-40.0, 0.0, 34.0), Vector3(0.0, 0.0, 0.0)],
		[Vector3(0.0, 0.0, 0.0), Vector3(40.0, 0.0, -34.0)],
		[Vector3(40.0, 0.0, -34.0), Vector3(72.0, 0.0, 28.0)],
		[Vector3(72.0, 0.0, 28.0), Vector3(119.0, 0.0, 0.0)],
		[Vector3(-96.0, 0.0, -46.0), Vector3(96.0, 0.0, -46.0)],
		[Vector3(-96.0, 0.0, 46.0), Vector3(96.0, 0.0, 46.0)]
	]
	for segment in road_points:
		_add_road_segment(segment[0], segment[1], 5.0)
	_add_forest(Vector3(-48.0, 0.0, -56.0), 9, 16.0)
	_add_forest(Vector3(-48.0, 0.0, 58.0), 11, 18.0)
	_add_forest(Vector3(48.0, 0.0, -58.0), 11, 18.0)
	_add_forest(Vector3(48.0, 0.0, 56.0), 9, 16.0)
	_add_rock_cluster(Vector3(-10.0, 0.0, -59.0), 7)
	_add_rock_cluster(Vector3(12.0, 0.0, 61.0), 6)
	_add_ruin(Vector3(-20.0, 0.0, 18.0))
	_add_ruin(Vector3(24.0, 0.0, -18.0))


func _add_bridge_beams(bridge_z: float) -> void:
	for x in [-9.0, 9.0]:
		var beam := MeshInstance3D.new()
		var beam_mesh := BoxMesh.new()
		beam_mesh.size = Vector3(1.0, 1.6, 10.0)
		beam.mesh = beam_mesh
		beam.position = Vector3(x, terrain_height(x, bridge_z) + 1.5, bridge_z)
		beam.material_override = _make_material(Color(0.22, 0.23, 0.21), 0.88)
		map_root.add_child(beam)


func _add_road_segment(start: Vector3, finish: Vector3, width: float) -> void:
	var direction := Vector2(finish.x - start.x, finish.z - start.z).normalized()
	var side := Vector2(-direction.y, direction.x) * width * 0.5
	var a := Vector3(start.x + side.x, terrain_height(start.x + side.x, start.z + side.y) + 0.12, start.z + side.y)
	var b := Vector3(start.x - side.x, terrain_height(start.x - side.x, start.z - side.y) + 0.12, start.z - side.y)
	var c := Vector3(finish.x + side.x, terrain_height(finish.x + side.x, finish.z + side.y) + 0.12, finish.z + side.y)
	var d := Vector3(finish.x - side.x, terrain_height(finish.x - side.x, finish.z - side.y) + 0.12, finish.z - side.y)
	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)
	for vertex in [a, c, b, b, c, d]:
		surface.add_vertex(vertex)
	surface.generate_normals()
	var road := MeshInstance3D.new()
	road.mesh = surface.commit()
	road.material_override = _make_material(Color(0.34, 0.32, 0.26), 0.94)
	map_root.add_child(road)


func _add_forest(center: Vector3, count: int, radius: float) -> void:
	var trunk_material := _make_material(Color(0.21, 0.17, 0.12), 0.96)
	var leaf_material := _make_material(Color(0.15, 0.23, 0.15), 0.95)
	var leaf_light := _make_material(Color(0.21, 0.29, 0.18), 0.95)
	for index in range(count):
		var angle := float(index) * 2.39996
		var spread := radius * sqrt(float(index + 1) / float(count))
		var x := center.x + cos(angle) * spread
		var z := center.z + sin(angle) * spread
		var y := terrain_height(x, z)
		var trunk := MeshInstance3D.new()
		var trunk_mesh := CylinderMesh.new()
		trunk_mesh.top_radius = 0.34
		trunk_mesh.bottom_radius = 0.62
		trunk_mesh.height = 5.0
		trunk.mesh = trunk_mesh
		trunk.position = Vector3(x, y + 2.5, z)
		trunk.material_override = trunk_material
		map_root.add_child(trunk)
		var crown := MeshInstance3D.new()
		var crown_mesh := SphereMesh.new()
		crown_mesh.radius = 3.2 + float(index % 3) * 0.35
		crown_mesh.height = 7.5 + float(index % 3) * 0.6
		crown.mesh = crown_mesh
		crown.position = Vector3(x, y + 7.0, z)
		crown.material_override = leaf_light if index % 4 == 0 else leaf_material
		map_root.add_child(crown)


func _add_rock_cluster(center: Vector3, count: int) -> void:
	var rock_material := _make_material(Color(0.36, 0.38, 0.34), 0.92)
	for index in range(count):
		var offset := Vector3(float(index % 3) * 3.5 - 3.5, 0.0, float(index / 3) * 3.0 - 3.0)
		var rock := MeshInstance3D.new()
		var mesh := SphereMesh.new()
		mesh.radius = 1.7 + float(index % 2) * 0.55
		mesh.height = 2.5 + float(index % 3) * 0.4
		rock.mesh = mesh
		rock.position = center + offset + Vector3(0.0, terrain_height(center.x + offset.x, center.z + offset.z) + 1.1, 0.0)
		rock.scale = Vector3(1.2, 0.75, 1.0)
		rock.material_override = rock_material
		map_root.add_child(rock)


func _add_ruin(center: Vector3) -> void:
	var concrete := _make_material(Color(0.37, 0.39, 0.35), 0.93)
	for index in range(3):
		var wall := MeshInstance3D.new()
		var block := BoxMesh.new()
		block.size = Vector3(7.0 if index != 1 else 4.0, 4.2, 1.1)
		wall.mesh = block
		wall.position = Vector3(center.x + float(index - 1) * 3.0, terrain_height(center.x, center.z) + 2.1, center.z + (6.0 if index == 1 else 0.0))
		wall.rotation.y = 0.18 * float(index)
		wall.material_override = concrete
		map_root.add_child(wall)


func _create_bases() -> void:
	_create_base("ember", Vector3(-112.0, 0.0, 0.0), "EMBER FŐBÁZIS")
	_create_base("xenon", Vector3(112.0, 0.0, 0.0), "XENON FŐBÁZIS")


func _create_base(side: String, base_position: Vector3, title: String) -> void:
	var base := Node3D.new()
	base.name = side.capitalize() + "Base"
	base.add_to_group("bases")
	base.set_meta("side", side)
	base.set_meta("health", 2000.0)
	base.set_meta("alive", true)
	base.position = Vector3(base_position.x, terrain_height(base_position.x, base_position.z), base_position.z)
	var team_color := Color(0.12, 0.43, 0.67) if side == "ember" else Color(0.63, 0.2, 0.17)
	var ground_pad := MeshInstance3D.new()
	var pad_mesh := CylinderMesh.new()
	pad_mesh.top_radius = 16.0
	pad_mesh.bottom_radius = 17.0
	pad_mesh.height = 0.6
	ground_pad.mesh = pad_mesh
	ground_pad.position.y = 0.24
	ground_pad.material_override = _make_material(Color(0.23, 0.25, 0.22), 0.95)
	base.add_child(ground_pad)
	var command := MeshInstance3D.new()
	var command_mesh := BoxMesh.new()
	command_mesh.size = Vector3(12.0, 7.0, 10.0)
	command.mesh = command_mesh
	command.position = Vector3(0.0, 4.0, 0.0)
	command.material_override = _make_material(Color(0.35, 0.38, 0.35), 0.76)
	base.add_child(command)
	for x in [-5.0, 5.0]:
		var silo := MeshInstance3D.new()
		var silo_mesh := CylinderMesh.new()
		silo_mesh.top_radius = 1.6
		silo_mesh.bottom_radius = 1.9
		silo_mesh.height = 8.0
		silo.mesh = silo_mesh
		silo.position = Vector3(x, 4.5, -8.0)
		silo.material_override = _make_material(Color(0.45, 0.48, 0.43), 0.65)
		base.add_child(silo)
	var sign := MeshInstance3D.new()
	var sign_mesh := BoxMesh.new()
	sign_mesh.size = Vector3(1.1, 7.0, 1.1)
	sign.mesh = sign_mesh
	sign.position = Vector3(0.0, 4.0, 11.0)
	sign.material_override = _make_material(team_color, 0.48, true)
	base.add_child(sign)
	var hit_area := Area3D.new()
	hit_area.collision_layer = 1
	hit_area.collision_mask = 0
	hit_area.input_ray_pickable = true
	var hit_shape := CollisionShape3D.new()
	var sphere := SphereShape3D.new()
	sphere.radius = 13.0
	hit_shape.shape = sphere
	hit_shape.position.y = 3.0
	hit_area.add_child(hit_shape)
	base.add_child(hit_area)
	map_root.add_child(base)
	bases[side] = base
	if side == "ember":
		_add_base_label(base, title, Color(0.22, 0.7, 1.0))
	else:
		_add_base_label(base, title, Color(1.0, 0.35, 0.28))


func _add_base_label(base: Node3D, title: String, color: Color) -> void:
	var label := Label3D.new()
	label.text = title
	label.font_size = 36
	label.outline_size = 8
	label.modulate = color
	label.position = Vector3(0.0, 13.0, 0.0)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	base.add_child(label)


func _create_capture_points() -> void:
	for data in CAPTURE_DATA:
		var point := CapturePoint.new()
		point.configure(self, data)
		var position_value: Vector3 = data.position
		point.position = Vector3(position_value.x, terrain_height(position_value.x, position_value.z) + 0.15, position_value.z)
		map_root.add_child(point)
		capture_points.append(point)
		var label := Label3D.new()
		label.text = str(data.name)
		label.font_size = 30
		label.outline_size = 8
		label.modulate = Color(0.94, 0.93, 0.84)
		label.position = Vector3(0.0, 10.0, 0.0)
		label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		point.add_child(label)


func _setup_navigation_grid() -> void:
	path_grid.region = Rect2i(-32, -22, 65, 45)
	path_grid.cell_size = Vector2(NAV_CELL_SIZE, NAV_CELL_SIZE)
	path_grid.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	path_grid.update()
	for x in range(-1, 2):
		for z in range(-22, 23):
			if abs(z) > 1:
				path_grid.set_point_solid(Vector2i(x, z), true)
	for center in [Vector2i(-12, -14), Vector2i(-12, 14), Vector2i(12, -14), Vector2i(12, 14)]:
		for x in range(center.x - 2, center.x + 3):
			for z in range(center.y - 2, center.y + 3):
				if path_grid.is_in_boundsv(Vector2i(x, z)) and path_grid.get_point_solid(Vector2i(x, z)) == false:
					if randf() < 0.72:
						path_grid.set_point_solid(Vector2i(x, z), true)


func find_path(start: Vector3, finish: Vector3) -> PackedVector3Array:
	var start_cell := _world_to_grid(start)
	var finish_cell := _world_to_grid(finish)
	start_cell = _nearest_open_cell(start_cell)
	finish_cell = _nearest_open_cell(finish_cell)
	var points := path_grid.get_point_path(start_cell, finish_cell)
	var result := PackedVector3Array()
	for point in points:
		result.append(Vector3(point.x * NAV_CELL_SIZE, terrain_height(point.x * NAV_CELL_SIZE, point.y * NAV_CELL_SIZE), point.y * NAV_CELL_SIZE))
	var exact_finish := Vector3(finish.x, terrain_height(finish.x, finish.z), finish.z)
	if result.is_empty() or result[result.size() - 1].distance_to(exact_finish) > 2.0:
		result.append(exact_finish)
	return result


func _world_to_grid(world_position: Vector3) -> Vector2i:
	return Vector2i(roundi(world_position.x / NAV_CELL_SIZE), roundi(world_position.z / NAV_CELL_SIZE))


func _nearest_open_cell(cell: Vector2i) -> Vector2i:
	var clamped := Vector2i(clampi(cell.x, -32, 32), clampi(cell.y, -22, 22))
	if not path_grid.is_point_solid(clamped):
		return clamped
	for radius in range(1, 8):
		for x in range(clamped.x - radius, clamped.x + radius + 1):
			for y in range(clamped.y - radius, clamped.y + radius + 1):
				var candidate := Vector2i(x, y)
				if path_grid.is_in_boundsv(candidate) and not path_grid.is_point_solid(candidate):
					return candidate
	return clamped


func _create_initial_armies() -> void:
	_spawn_unit("ember", "infantry", Vector3(-103.0, 0.0, -8.0))
	_spawn_unit("ember", "infantry", Vector3(-100.0, 0.0, 8.0))
	_spawn_unit("ember", "scout", Vector3(-98.0, 0.0, 0.0))
	_spawn_unit("ember", "tank", Vector3(-112.0, 0.0, 15.0))
	_spawn_unit("xenon", "infantry", Vector3(103.0, 0.0, -8.0))
	_spawn_unit("xenon", "infantry", Vector3(100.0, 0.0, 8.0))
	_spawn_unit("xenon", "scout", Vector3(98.0, 0.0, 0.0))
	_spawn_unit("xenon", "tank", Vector3(112.0, 0.0, 15.0))


func _spawn_unit(side: String, kind: String, spawn_position: Vector3) -> RTSStrategyUnit:
	var unit := RTSUnit.new()
	unit.configure(self, side, kind)
	unit.position = Vector3(spawn_position.x, terrain_height(spawn_position.x, spawn_position.z), spawn_position.z)
	units_root.add_child(unit)
	units.append(unit)
	return unit


func _create_frontline() -> void:
	front_mesh = MeshInstance3D.new()
	front_mesh.name = "DynamicFrontline"
	front_material = StandardMaterial3D.new()
	front_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	front_material.albedo_color = Color(0.35, 0.82, 1.0, 0.9)
	front_material.emission_enabled = true
	front_material.emission = Color(0.16, 0.58, 0.9)
	front_material.emission_energy_multiplier = 2.0
	map_root.add_child(front_mesh)


func _update_frontline() -> void:
	if not is_instance_valid(front_mesh):
		return
	var ember_front := -112.0
	var xenon_front := 112.0
	for point in capture_points:
		if point.owner_side == "ember":
			ember_front = maxf(ember_front, point.global_position.x)
		elif point.owner_side == "xenon":
			xenon_front = minf(xenon_front, point.global_position.x)
	var front_x := (ember_front + xenon_front) * 0.5
	var mesh := ImmediateMesh.new()
	mesh.surface_begin(Mesh.PRIMITIVE_LINES, front_material)
	for z in range(-78, 79, 4):
		mesh.surface_add_vertex(Vector3(front_x, terrain_height(front_x, float(z)) + 0.55, float(z)))
		mesh.surface_add_vertex(Vector3(front_x, terrain_height(front_x, float(z + 4)) + 0.55, float(z + 4)))
	mesh.surface_end()
	front_mesh.mesh = mesh
	front_mesh.set_meta("front_x", front_x)


func _update_supply_states() -> void:
	for side in ["ember", "xenon"]:
		var reached: Dictionary = {}
		var pending: Array[Node3D] = []
		var base: Node3D = bases[side]
		for point in capture_points:
			point.set("supplied_" + ("player" if side == "ember" else "enemy"), false)
			if point.owner_side == side and _flat_distance(base.global_position, point.global_position) <= 55.0:
				pending.append(point)
				reached[point.point_id] = true
		while not pending.is_empty():
			var current: Node3D = pending.pop_front()
			for point in capture_points:
				if point.owner_side != side or reached.has(point.point_id):
					continue
				if _flat_distance(current.global_position, point.global_position) <= 74.0:
					reached[point.point_id] = true
					pending.append(point)
		for point in capture_points:
			var connected := reached.has(point.point_id)
			if side == "ember":
				point.supplied_player = connected
			else:
				point.supplied_enemy = connected


func is_point_supplied(point: StrategicCapturePoint, side: String) -> bool:
	return point.supplied_player if side == "ember" else point.supplied_enemy


func find_enemy_supply_blocker(point: StrategicCapturePoint, side: String) -> StrategicCapturePoint:
	var best: StrategicCapturePoint
	var best_distance := INF
	for candidate in capture_points:
		if candidate.owner_side == side or candidate.owner_side == "neutral":
			continue
		if _flat_distance(candidate.global_position, point.global_position) <= 72.0:
			var distance := point.global_position.distance_squared_to(candidate.global_position)
			if distance < best_distance:
				best_distance = distance
				best = candidate
	return best


func _create_hud() -> void:
	var canvas := CanvasLayer.new()
	canvas.layer = 10
	add_child(canvas)
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	canvas.add_child(root)

	var panel := PanelContainer.new()
	panel.position = Vector2(20.0, 18.0)
	panel.size = Vector2(590.0, 196.0)
	panel.add_theme_stylebox_override("panel", _panel_style(Color(0.035, 0.065, 0.075, 0.91)))
	root.add_child(panel)
	var top_box := VBoxContainer.new()
	top_box.add_theme_constant_override("separation", 5)
	panel.add_child(top_box)
	header_label = _new_label("VESZÉLYZÓNA // KOLÓNIAFRONT  —  WINDOWS 3D TESZTPÁLYA", 19, Color(0.72, 0.9, 0.93))
	top_box.add_child(header_label)
	resource_label = _new_label("EMBER: 420 FÉM · 300 ÜZEMANYAG     XENON: 420 FÉM · 300 ÜZEMANYAG", 17, Color(0.94, 0.84, 0.55))
	top_box.add_child(resource_label)
	point_label = _new_label("STRATÉGIAI PONTOK", 15, Color(0.83, 0.86, 0.8))
	point_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	top_box.add_child(point_label)
	status_label = _new_label("Offline PvE · internetkapcsolat nem szükséges", 15, Color(0.63, 0.81, 0.67))
	top_box.add_child(status_label)

	var difficulty_panel := PanelContainer.new()
	difficulty_panel.position = Vector2(20.0, 226.0)
	difficulty_panel.size = Vector2(350.0, 62.0)
	difficulty_panel.add_theme_stylebox_override("panel", _panel_style(Color(0.035, 0.065, 0.075, 0.9)))
	root.add_child(difficulty_panel)
	var difficulty_row := HBoxContainer.new()
	difficulty_row.add_theme_constant_override("separation", 10)
	difficulty_panel.add_child(difficulty_row)
	var difficulty_title := _new_label("AI NEHÉZSÉG", 15, Color(0.76, 0.84, 0.84))
	difficulty_row.add_child(difficulty_title)
	ai_selector = OptionButton.new()
	ai_selector.custom_minimum_size = Vector2(170.0, 36.0)
	ai_selector.add_item("Könnyű")
	ai_selector.add_item("Normál")
	ai_selector.add_item("Nehéz")
	ai_selector.add_item("Nagyon nehéz")
	ai_selector.select(1)
	ai_selector.item_selected.connect(_on_difficulty_selected)
	difficulty_row.add_child(ai_selector)

	var command_panel := PanelContainer.new()
	command_panel.position = Vector2(20.0, 308.0)
	command_panel.size = Vector2(346.0, 230.0)
	command_panel.add_theme_stylebox_override("panel", _panel_style(Color(0.035, 0.065, 0.075, 0.9)))
	root.add_child(command_panel)
	var commands := VBoxContainer.new()
	commands.add_theme_constant_override("separation", 7)
	command_panel.add_child(commands)
	commands.add_child(_new_label("BÁZISPARANCSOK", 15, Color(0.72, 0.9, 0.93)))
	build_barracks_button = _new_button("B  ·  Laktanya építése")
	build_barracks_button.pressed.connect(func() -> void: request_build("ember", "barracks"))
	commands.add_child(build_barracks_button)
	train_infantry_button = _new_button("T  ·  Gyalogosraj képzése")
	train_infantry_button.pressed.connect(func() -> void: request_train("ember", "infantry"))
	commands.add_child(train_infantry_button)
	build_yard_button = _new_button("V  ·  Járműtelep építése")
	build_yard_button.pressed.connect(func() -> void: request_build("ember", "vehicle_yard"))
	commands.add_child(build_yard_button)
	train_tank_button = _new_button("Y  ·  Harckocsi képzése")
	train_tank_button.pressed.connect(func() -> void: request_train("ember", "tank"))
	commands.add_child(train_tank_button)

	var right_panel := PanelContainer.new()
	right_panel.anchor_left = 1.0
	right_panel.anchor_right = 1.0
	right_panel.offset_left = -435.0
	right_panel.offset_right = -20.0
	right_panel.offset_top = 18.0
	right_panel.offset_bottom = 160.0
	right_panel.add_theme_stylebox_override("panel", _panel_style(Color(0.035, 0.065, 0.075, 0.9)))
	root.add_child(right_panel)
	var objective_box := VBoxContainer.new()
	objective_box.add_theme_constant_override("separation", 5)
	right_panel.add_child(objective_box)
	objective_box.add_child(_new_label("HADJÁRAT // KÖZPONTI FRONT", 18, Color(0.76, 0.9, 0.92)))
	objective_box.add_child(_new_label("Foglalj pontokat, szakítsd meg az ellenfél utánpótlását, és tartsd a parancsnoki zónát!", 16, Color(0.84, 0.85, 0.8)))
	selected_label = _new_label("NINCS KIJELÖLT ALAKULAT", 15, Color(0.85, 0.85, 0.82))
	objective_box.add_child(selected_label)

	var footer := _new_label("BAL KATT: KIJELÖLÉS  ·  JOBB KATT: PARANCS  ·  WASD: KAMERA  ·  KÖZÉPSŐ GOMB: FORGATÁS  ·  R/F: DÖNTÉS  ·  GÖRGŐ: ZOOM  ·  SHIFT: GYORSABB MOZGÁS", 15, Color(0.84, 0.86, 0.82))
	footer.anchor_left = 0.0
	footer.anchor_right = 1.0
	footer.anchor_top = 1.0
	footer.anchor_bottom = 1.0
	footer.offset_left = 20.0
	footer.offset_right = -20.0
	footer.offset_top = -38.0
	footer.offset_bottom = -12.0
	footer.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(footer)


func _new_label(text_value: String, font_size: int, color: Color) -> Label:
	var label := Label.new()
	label.text = text_value
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", color)
	label.add_theme_color_override("font_shadow_color", Color(0.0, 0.0, 0.0, 0.9))
	label.add_theme_constant_override("shadow_offset_x", 1)
	label.add_theme_constant_override("shadow_offset_y", 2)
	return label


func _new_button(text_value: String) -> Button:
	var button := Button.new()
	button.text = text_value
	button.custom_minimum_size = Vector2(310.0, 35.0)
	button.add_theme_font_size_override("font_size", 15)
	return button


func _panel_style(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.border_color = Color(0.23, 0.49, 0.56, 0.82)
	style.set_border_width_all(1)
	style.set_corner_radius_all(6)
	style.content_margin_left = 12.0
	style.content_margin_right = 12.0
	style.content_margin_top = 8.0
	style.content_margin_bottom = 8.0
	return style


func _create_ai() -> void:
	ai_controller = AIController.new()
	ai_controller.configure(self, "xenon", selected_difficulty)
	add_child(ai_controller)


func _on_difficulty_selected(index: int) -> void:
	var levels := ["easy", "normal", "hard", "very_hard"]
	selected_difficulty = levels[clampi(index, 0, levels.size() - 1)]
	if is_instance_valid(ai_controller):
		ai_controller.configure(self, "xenon", selected_difficulty)
	_update_hud()


func _select_at(screen_position: Vector2, add_to_selection: bool) -> void:
	var hit := _raycast(screen_position)
	if hit.is_empty():
		if not add_to_selection:
			_clear_selection()
		return
	var object: Object = hit.collider
	var unit := _find_group_ancestor(object, "strategy_units") as RTSStrategyUnit
	if unit != null:
		if unit.side != "ember":
			status_label.text = "ELLENSÉGES ALAKULAT // JOBB KATTINTÁSSAL TÁMADHATÓ"
			return
		if not add_to_selection:
			_clear_selection()
		if not selected_units.has(unit):
			selected_units.append(unit)
			unit.set_selected(true)
		_update_hud()
		return
	if not add_to_selection:
		_clear_selection()
		_update_hud()


func _issue_order_at(screen_position: Vector2) -> void:
	if selected_units.is_empty():
		return
	var hit := _raycast(screen_position)
	if hit.is_empty():
		return
	var object: Object = hit.collider
	var enemy := _find_group_ancestor(object, "strategy_units") as RTSStrategyUnit
	if enemy != null and enemy.side == "xenon":
		for unit in selected_units:
			issue_attack(unit, enemy)
		status_label.text = "TÁMADÁSI PARANCS KIADVA"
		return
	var base := _find_group_ancestor(object, "bases")
	if base != null and str(base.get_meta("side", "")) == "xenon":
		for unit in selected_units:
			issue_attack(unit, base)
		status_label.text = "ELLENSÉGES BÁZIS TÁMADÁSA"
		return
	var point := _find_group_ancestor(object, "capture_points") as StrategicCapturePoint
	if point != null:
		for unit in selected_units:
			issue_move_to_point(unit, point)
		status_label.text = "FOGLALÁSI PARANCS: " + point.display_name
		return
	var destination: Vector3 = hit.position
	for unit in selected_units:
		issue_move(unit, destination)
	status_label.text = "MOZGÁSI PARANCS KIADVA"


func _raycast(screen_position: Vector2) -> Dictionary:
	var camera: Camera3D = camera_rig.get_node("Camera3D")
	var origin := camera.project_ray_origin(screen_position)
	var direction := camera.project_ray_normal(screen_position)
	var query := PhysicsRayQueryParameters3D.create(origin, origin + direction * 900.0)
	query.collision_mask = 7
	query.collide_with_areas = true
	query.collide_with_bodies = true
	return get_world_3d().direct_space_state.intersect_ray(query)


func _find_group_ancestor(object: Object, group_name: String) -> Node3D:
	var node := object as Node
	while node != null:
		if node is Node3D and node.is_in_group(group_name):
			return node as Node3D
		node = node.get_parent()
	return null


func issue_move(unit: RTSStrategyUnit, destination: Vector3) -> void:
	if not is_instance_valid(unit) or unit.side != "ember" and unit.side != "xenon":
		return
	var path := find_path(unit.global_position, destination)
	unit.move_along(path)


func issue_move_to_point(unit: RTSStrategyUnit, point: StrategicCapturePoint) -> void:
	if not is_instance_valid(unit) or not is_instance_valid(point):
		return
	if not unit.capture_capable:
		status_label.text = "JÁRMŰ NEM FOGLALHAT STRATÉGIAI PONTOT"
		return
	var approach := point.global_position
	if unit.side == "ember":
		approach.x -= 2.2
	else:
		approach.x += 2.2
	unit.move_along(find_path(unit.global_position, approach), point)


func issue_attack(unit: RTSStrategyUnit, target: Node3D) -> void:
	if not is_instance_valid(unit) or not is_instance_valid(target):
		return
	unit.attack_unit(target)


func notify_unit_arrived(unit: RTSStrategyUnit, point: StrategicCapturePoint) -> void:
	if not is_instance_valid(unit) or not is_instance_valid(point):
		return
	if point.owner_side != unit.side and unit.capture_capable:
		status_label.text = unit.display_name + " foglalja: " + point.display_name


func point_has_friendly_capturer(point: StrategicCapturePoint, side: String) -> bool:
	for unit in units:
		if is_instance_valid(unit) and unit.alive and unit.side == side and unit.capture_capable and (unit.order_target == point or _flat_distance(unit.global_position, point.global_position) <= CapturePoint.CAPTURE_RADIUS):
			return true
	return false


func get_units_for_side(side: String) -> Array[RTSStrategyUnit]:
	var result: Array[RTSStrategyUnit] = []
	for unit in units:
		if is_instance_valid(unit) and unit.alive and unit.side == side:
			result.append(unit)
	return result


func count_units_of_kind(side: String, kind: String) -> int:
	var count := 0
	for unit in units:
		if is_instance_valid(unit) and unit.alive and unit.side == side and unit.unit_kind == kind:
			count += 1
	return count


func get_building_state(side: String) -> Dictionary:
	return buildings[side]


func get_training_queue(side: String) -> String:
	return str(training_queue[side])


func request_build(side: String, building_kind: String) -> bool:
	if not buildings.has(side) or not BUILD_COSTS.has(building_kind):
		return false
	if bool(buildings[side].get(building_kind, false)) or not str(construction[side]).is_empty():
		return false
	if building_kind == "vehicle_yard" and not buildings[side].barracks:
		return false
	var cost: Dictionary = BUILD_COSTS[building_kind]
	if not _can_afford(side, cost):
		return false
	_pay_cost(side, cost)
	construction[side] = building_kind
	construction_clock[side] = 10.0 if building_kind == "barracks" else 13.0
	if side == "ember":
		status_label.text = "ÉPÍTÉS INDULT: " + ("LAKTANYA" if building_kind == "barracks" else "JÁRMŰTELEP")
	return true


func request_train(side: String, unit_kind: String) -> bool:
	if not buildings.has(side) or not TRAIN_COSTS.has(unit_kind) or not str(training_queue[side]).is_empty():
		return false
	if unit_kind == "infantry" and not buildings[side].barracks:
		return false
	if unit_kind == "tank" and not buildings[side].vehicle_yard:
		return false
	var cost: Dictionary = TRAIN_COSTS[unit_kind]
	if not _can_afford(side, cost):
		return false
	_pay_cost(side, cost)
	training_queue[side] = unit_kind
	training_clock[side] = TRAIN_TIMES[unit_kind]
	if side == "ember":
		status_label.text = "GYÁRTÁSI SOR: " + ("GYALOGOSRAJ" if unit_kind == "infantry" else "HARCKOCSI")
	return true


func _can_afford(side: String, cost: Dictionary) -> bool:
	return float(resources[side].metal) >= float(cost.get("metal", 0.0)) and float(resources[side].fuel) >= float(cost.get("fuel", 0.0))


func _pay_cost(side: String, cost: Dictionary) -> void:
	resources[side].metal = float(resources[side].metal) - float(cost.get("metal", 0.0))
	resources[side].fuel = float(resources[side].fuel) - float(cost.get("fuel", 0.0))


func _update_economy_jobs(delta: float) -> void:
	for side in ["ember", "xenon"]:
		if not str(construction[side]).is_empty():
			construction_clock[side] = float(construction_clock[side]) - delta
			if float(construction_clock[side]) <= 0.0:
				var completed := str(construction[side])
				buildings[side][completed] = true
				construction[side] = ""
				construction_clock[side] = 0.0
				if side == "ember":
					status_label.text = "ELKÉSZÜLT: " + ("LAKTANYA" if completed == "barracks" else "JÁRMŰTELEP")
		if not str(training_queue[side]).is_empty():
			training_clock[side] = float(training_clock[side]) - delta
			if float(training_clock[side]) <= 0.0:
				var completed_unit := str(training_queue[side])
				training_queue[side] = ""
				training_clock[side] = 0.0
				var spawn_x := -106.0 if side == "ember" else 106.0
				var spawn_z := randf_range(-13.0, 13.0)
				_spawn_unit(side, completed_unit, Vector3(spawn_x, 0.0, spawn_z))
				if side == "ember":
					status_label.text = "ÚJ ALAKULAT KÉSZ: " + ("GYALOGOSRAJ" if completed_unit == "infantry" else "HARCKOCSI")


func apply_unit_damage(target: Node3D, amount: float, source: RTSStrategyUnit) -> void:
	if not is_instance_valid(target):
		return
	if target.is_in_group("strategy_units"):
		var target_unit := target as RTSStrategyUnit
		if target_unit.side == source.side:
			return
		target_unit.take_damage(amount)
	elif target.is_in_group("bases"):
		var target_side: String = str(target.get_meta("side", ""))
		if target_side == source.side:
			return
		var base_health := float(target.get_meta("health", 0.0)) - amount
		target.set_meta("health", base_health)
		if base_health <= 0.0:
			target.set_meta("alive", false)
			_finish_match(source.side, "FŐBÁZIS MEGSEMMISÜLT")


func find_nearby_enemy(unit: RTSStrategyUnit, search_range: float) -> RTSStrategyUnit:
	return find_nearby_enemy_at(unit.global_position, search_range, unit.side)


func find_nearby_enemy_at(world_position: Vector3, search_range: float, friendly_side: String) -> RTSStrategyUnit:
	var best: RTSStrategyUnit
	var best_distance := search_range * search_range
	for unit in units:
		if not is_instance_valid(unit) or not unit.alive or unit.side == friendly_side:
			continue
		var distance := world_position.distance_squared_to(unit.global_position)
		if distance <= best_distance:
			best_distance = distance
			best = unit
	return best


func on_unit_destroyed(unit: RTSStrategyUnit) -> void:
	selected_units.erase(unit)
	status_label.text = "ALAKULAT MEGSEMMISÜLT: " + unit.display_name if unit.side == "ember" else "ELLENSÉGES ALAKULAT MEGSEMMISÜLT"


func on_point_captured(point: StrategicCapturePoint, previous_owner: String) -> void:
	var side_label := "EMBER" if point.owner_side == "ember" else "XENON"
	status_label.text = side_label + " FOGLALTA EL: " + point.display_name
	if point.point_kind == "supply":
		status_label.text += " // UTÁNPÓTLÁSI HÁLÓZAT FRISSÜL"
	_update_supply_states()
	_update_frontline()
	if previous_owner != point.owner_side:
		var beacon := OmniLight3D.new()
		beacon.light_color = Color(0.25, 0.65, 1.0) if point.owner_side == "ember" else Color(1.0, 0.28, 0.22)
		beacon.light_energy = 1.5
		beacon.omni_range = 14.0
		beacon.position = Vector3(0.0, 9.0, 0.0)
		point.add_child(beacon)
		get_tree().create_timer(1.4).timeout.connect(func() -> void:
			if is_instance_valid(beacon):
				beacon.queue_free()
		)


func _check_victory() -> void:
	if float(victory_score.ember) >= 180.0:
		_finish_match("ember", "A PARANCSNOKI PONTOT TARTOTTAD")
	elif float(victory_score.xenon) >= 180.0:
		_finish_match("xenon", "A PARANCSNOKI PONTOT ELVESZTETTED")


func _finish_match(winner: String, reason: String) -> void:
	if match_finished:
		return
	match_finished = true
	status_label.text = ("GYŐZELEM" if winner == "ember" else "VERESÉG") + " // " + reason
	status_label.add_theme_color_override("font_color", Color(0.8, 0.92, 0.59) if winner == "ember" else Color(1.0, 0.52, 0.44))


func _update_hud() -> void:
	if not is_instance_valid(resource_label):
		return
	var ember := resources.ember
	var xenon := resources.xenon
	resource_label.text = "EMBER  %d FÉM · %d ÜZEMANYAG   |   XENON  %d FÉM · %d ÜZEMANYAG" % [roundi(ember.metal), roundi(ember.fuel), roundi(xenon.metal), roundi(xenon.fuel)]
	var summaries := PackedStringArray()
	for point in capture_points:
		var owner_name := "EMBER" if point.owner_side == "ember" else ("XENON" if point.owner_side == "xenon" else "SEMLEGES")
		var supply := "ELLÁTVA" if point.supplied_player or point.supplied_enemy else "NINCS ELLÁTVA"
		var detail := "%s: %s · %s" % [point.display_name, owner_name, supply]
		if point.contested:
			detail += " · VITATOTT"
		elif point.progress > 0.0:
			detail += " · FOGLALÁS %d%%" % roundi(point.progress * 100.0)
		summaries.append(detail)
	point_label.text = "\n".join(summaries)
	status_label.text = "OFFLINE PvE · AI: %s · GYŐZELMI PONT %d / 180 — %d / 180" % [AI_LABELS[selected_difficulty], roundi(victory_score.ember), roundi(victory_score.xenon)] if not match_finished and not status_label.text.begins_with("FOGLAL") and not status_label.text.begins_with("ÉPÍT") and not status_label.text.begins_with("GYÁRT") and not status_label.text.begins_with("ÚJ ALAKULAT") else status_label.text
	if not selected_units.is_empty():
		var first: RTSStrategyUnit = selected_units[0]
		if is_instance_valid(first):
			selected_label.text = "KIJELÖLVE: %s · ÉLETERŐ %d%% · %d RAJ" % [first.display_name, roundi(first.health / first.max_health * 100.0), selected_units.size()]
	else:
		selected_label.text = "NINCS KIJELÖLT ALAKULAT"
	build_barracks_button.disabled = bool(buildings.ember.barracks) or not _can_afford("ember", BUILD_COSTS.barracks) or not str(construction.ember).is_empty()
	train_infantry_button.disabled = not bool(buildings.ember.barracks) or not str(training_queue.ember).is_empty() or not _can_afford("ember", TRAIN_COSTS.infantry)
	build_yard_button.disabled = not bool(buildings.ember.barracks) or bool(buildings.ember.vehicle_yard) or not _can_afford("ember", BUILD_COSTS.vehicle_yard) or not str(construction.ember).is_empty()
	train_tank_button.disabled = not bool(buildings.ember.vehicle_yard) or not str(training_queue.ember).is_empty() or not _can_afford("ember", TRAIN_COSTS.tank)
	if not str(construction.ember).is_empty():
		status_label.text = "ÉPÍTÉS: %s · %d MP" % ["LAKTANYA" if construction.ember == "barracks" else "JÁRMŰTELEP", ceili(construction_clock.ember)]
	elif not str(training_queue.ember).is_empty():
		status_label.text = "GYÁRTÁS: %s · %d MP" % ["GYALOGOSRAJ" if training_queue.ember == "infantry" else "HARCKOCSI", ceili(training_clock.ember)]


func _clear_selection() -> void:
	for unit in selected_units:
		if is_instance_valid(unit):
			unit.set_selected(false)
	selected_units.clear()


func _flat_distance(a: Vector3, b: Vector3) -> float:
	return Vector2(a.x, a.z).distance_to(Vector2(b.x, b.z))


func _make_material(color: Color, roughness_value := 0.82, unshaded := false) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = roughness_value
	material.metallic = 0.04
	if color.a < 0.99:
		material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	if unshaded:
		material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	return material

