extends Node3D

## Ideiglenes, saját készítésű terep a projekt első indíthatósági mérföldkövéhez.
## Nem tartalmaz még játékmechanikát; a következő teszt után bővíthető a PDF alapján.

const MAP_SIZE := Vector2(270.0, 210.0)
const TREE_GROUPS := [
	{"center": Vector2(-96, -54), "size": Vector2(48, 52), "count": 52},
	{"center": Vector2(92, 55), "size": Vector2(52, 48), "count": 56},
	{"center": Vector2(-92, 68), "size": Vector2(38, 31), "count": 30},
	{"center": Vector2(95, -66), "size": Vector2(40, 34), "count": 32},
	{"center": Vector2(-12, -76), "size": Vector2(50, 22), "count": 26},
	{"center": Vector2(18, 78), "size": Vector2(52, 22), "count": 28},
]

var _rng := RandomNumberGenerator.new()

const RTS_UNIT := preload("res://scripts/rts_unit.gd")
const CAPTURE_POINT := preload("res://scripts/capture_point.gd")
const COVER_OBJECT := preload("res://scripts/cover_object.gd")
const INFANTRY_SQUAD_COST := 120.0
const INFANTRY_SQUAD_SIZE := 3
const LIGHT_VEHICLE_COST := 260.0
const SUPPLY_LINK_DISTANCE := 145.0
const INFANTRY_BUILD_TIME := 8.0
const VEHICLE_BUILD_TIME := 14.0
const POPULATION_CAP := 30
const VEHICLE_POPULATION := 4
const TANK_COST := 420.0
const HELICOPTER_COST := 500.0
const FIGHTER_COST := 650.0
const TANK_BUILD_TIME := 20.0
const HELICOPTER_BUILD_TIME := 24.0
const FIGHTER_BUILD_TIME := 28.0

var _capture_points: Array = []
var _victory_points: Array = []
var _resource_points: Array = []
var _owned_point_count := 0
var _supplied_point_count := 0
var _supply_links: Array = []
@onready var objective_status: Label = get_node_or_null("HUD/ObjectivePanel/Margin/ObjectiveStatus")
@onready var economy_manager: Node = get_node_or_null("EconomyManager")
@onready var resource_status: Label = get_node_or_null("HUD/ResourcePanel/Margin/ResourceStatus")
@onready var infantry_call_in_button: Button = get_node_or_null("HUD/BacklinePanel/Margin/BacklineContent/InfantryCallIn")
@onready var backline_status: Label = get_node_or_null("HUD/BacklinePanel/Margin/BacklineContent/BacklineStatus")
@onready var vehicle_call_in_button: Button = get_node_or_null("HUD/BacklinePanel/Margin/BacklineContent/VehicleCallIn")
@onready var tank_call_in_button: Button = get_node_or_null("HUD/BacklinePanel/Margin/BacklineContent/TankCallIn")
@onready var helicopter_call_in_button: Button = get_node_or_null("HUD/BacklinePanel/Margin/BacklineContent/HelicopterCallIn")
@onready var fighter_call_in_button: Button = get_node_or_null("HUD/BacklinePanel/Margin/BacklineContent/FighterCallIn")

var _reinforcement_wave := 0
var _production_type := ""
var _production_remaining := 0.0
var _production_duration := 0.0
var _ui_refresh_timer := 0.0

func _ready() -> void:
	_rng.seed = 4702
	_build_ground()
	_build_road_network()
	_build_forests()
	_build_rocks()
	_build_grass_patches()
	_build_test_cover()
	_build_capture_points()
	_build_supply_links()
	_build_player_squad()
	_build_enemy_test_squad()
	_update_objective_status()
	_update_supply_network()
	if is_instance_valid(economy_manager):
		economy_manager.resources_changed.connect(_on_resources_changed)
		_on_resources_changed(0, economy_manager.get_gas(0), economy_manager.get_income_per_second(0))
	if is_instance_valid(infantry_call_in_button):
		infantry_call_in_button.pressed.connect(_on_infantry_call_in_pressed)
	if is_instance_valid(vehicle_call_in_button):
		vehicle_call_in_button.pressed.connect(_on_vehicle_call_in_pressed)
	if is_instance_valid(tank_call_in_button):
		tank_call_in_button.pressed.connect(_queue_single_unit.bind("tank", TANK_COST, TANK_BUILD_TIME, 6))
	if is_instance_valid(helicopter_call_in_button):
		helicopter_call_in_button.pressed.connect(_queue_single_unit.bind("helicopter", HELICOPTER_COST, HELICOPTER_BUILD_TIME, 7))
	if is_instance_valid(fighter_call_in_button):
		fighter_call_in_button.pressed.connect(_queue_single_unit.bind("fighter", FIGHTER_COST, FIGHTER_BUILD_TIME, 8))

func _process(delta: float) -> void:
	_ui_refresh_timer -= delta
	if not _production_type.is_empty():
		_production_remaining = maxf(0.0, _production_remaining - delta)
		if _production_remaining <= 0.0:
			_finish_production()
	if _ui_refresh_timer <= 0.0:
		_ui_refresh_timer = 0.2
		_refresh_backline_ui()

func _build_ground() -> void:
	var ground := MeshInstance3D.new()
	ground.name = "NaturalGround"
	var plane := PlaneMesh.new()
	plane.size = MAP_SIZE
	plane.subdivide_width = 100
	plane.subdivide_depth = 80
	ground.mesh = plane
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.26, 0.34, 0.23)
	material.roughness = 1.0
	ground.material_override = material
	add_child(ground)

	var edge := BoxMesh.new()
	edge.size = Vector3(MAP_SIZE.x, 0.6, MAP_SIZE.y)
	var edge_mesh := MeshInstance3D.new()
	edge_mesh.name = "TerrainEdge"
	edge_mesh.mesh = edge
	edge_mesh.position.y = -0.55
	var earth := StandardMaterial3D.new()
	earth.albedo_color = Color(0.19, 0.18, 0.14)
	earth.roughness = 1.0
	edge_mesh.material_override = earth
	add_child(edge_mesh)

	var ground_body := StaticBody3D.new()
	ground_body.name = "GroundCollision"
	ground_body.collision_layer = 1
	ground_body.collision_mask = 0
	var collision := CollisionShape3D.new()
	var ground_shape := BoxShape3D.new()
	ground_shape.size = Vector3(MAP_SIZE.x, 0.4, MAP_SIZE.y)
	collision.shape = ground_shape
	collision.position.y = -0.2
	ground_body.add_child(collision)
	add_child(ground_body)

func _build_player_squad() -> void:
	var squad_positions := [
		Vector3(0.0, 0.0, 88.0),
		Vector3(-1.6, 0.0, 90.0),
		Vector3(1.6, 0.0, 90.0),
	]
	for index in range(squad_positions.size()):
		var unit = RTS_UNIT.new()
		unit.name = "EmberInfantry_%02d" % (index + 1)
		unit.team_id = 0
		unit.squad_id = "ember_kezdoraj"
		unit.collision_layer = 2
		unit.collision_mask = 1 | 2
		unit.position = squad_positions[index]
		add_child(unit)

func _build_enemy_test_squad() -> void:
	var squad_positions := [
		Vector3(0.0, 0.0, -88.0),
		Vector3(-1.6, 0.0, -90.0),
		Vector3(1.6, 0.0, -90.0),
	]
	for index in range(squad_positions.size()):
		var unit = RTS_UNIT.new()
		unit.name = "XenonTestInfantry_%02d" % (index + 1)
		unit.team_id = 1
		unit.squad_id = "xenon_tesztraj"
		unit.collision_layer = 2
		unit.collision_mask = 1 | 2
		unit.position = squad_positions[index]
		add_child(unit)

func _build_capture_points() -> void:
	var point_data := [
		{"id": "V1", "position": Vector3(-78.0, 0.0, -18.0), "victory": true, "gas": 0.0},
		{"id": "V2", "position": Vector3(0.0, 0.0, 0.0), "victory": true, "gas": 0.0},
		{"id": "V3", "position": Vector3(78.0, 0.0, 18.0), "victory": true, "gas": 0.0},
		{"id": "G1", "position": Vector3(-105.0, 0.0, -72.0), "victory": false, "gas": 2.0},
		{"id": "G2", "position": Vector3(-94.0, 0.0, 58.0), "victory": false, "gas": 2.0},
		{"id": "G3", "position": Vector3(-32.0, 0.0, 70.0), "victory": false, "gas": 2.0},
		{"id": "G4", "position": Vector3(32.0, 0.0, -70.0), "victory": false, "gas": 2.0},
		{"id": "G5", "position": Vector3(94.0, 0.0, -58.0), "victory": false, "gas": 2.0},
		{"id": "G6", "position": Vector3(105.0, 0.0, 72.0), "victory": false, "gas": 2.0},
	]
	for data in point_data:
		var point = CAPTURE_POINT.new()
		point.name = "CapturePoint_%s" % data.id
		point.point_id = data.id
		point.position = data.position
		point.is_victory_point = data.victory
		point.gas_income_per_second = data.gas
		point.ownership_changed.connect(_on_capture_point_ownership_changed)
		_capture_points.append(point)
		if point.is_victory_point:
			_victory_points.append(point)
		else:
			_resource_points.append(point)
		add_child(point)
		if is_instance_valid(economy_manager):
			economy_manager.register_capture_point(point)

func _build_test_cover() -> void:
	var cover_data := [
		{"name": "SandbagWall_Center", "position": Vector3(0.0, 0.0, -15.0), "rotation": 0.0, "length": 13.0},
		{"name": "SandbagWall_West", "position": Vector3(-42.0, 0.0, 20.0), "rotation": 0.45, "length": 10.0},
		{"name": "SandbagWall_East", "position": Vector3(43.0, 0.0, -22.0), "rotation": -0.52, "length": 11.0},
		{"name": "SandbagWall_NorthWest", "position": Vector3(-82.0, 0.0, -46.0), "rotation": -0.28, "length": 12.0},
		{"name": "SandbagWall_SouthEast", "position": Vector3(84.0, 0.0, 48.0), "rotation": 0.32, "length": 12.0},
	]
	for data in cover_data:
		var cover = COVER_OBJECT.new()
		cover.name = data.name
		cover.position = data.position
		cover.rotation.y = data.rotation
		cover.cover_length = data.length * 0.72
		add_child(cover)

func _on_capture_point_ownership_changed(_point, old_owner: int, new_owner: int) -> void:
	if old_owner == 0:
		_owned_point_count -= 1
	if new_owner == 0:
		_owned_point_count += 1
	_update_supply_network()
	_update_objective_status()

func _update_objective_status() -> void:
	if is_instance_valid(objective_status):
		var owned_victory := 0
		var owned_resources := 0
		for point in _victory_points:
			if point.owner_team_id == 0:
				owned_victory += 1
		for point in _resource_points:
			if point.owner_team_id == 0:
				owned_resources += 1
		objective_status.text = "★ GYŐZELMI PONT: %d / 3   ·   NYERSANYAG: %d / %d\nCél: elsőként 50 győzelmi pont." % [owned_victory, owned_resources, _resource_points.size()]

func _update_supply_network() -> void:
	for point in _capture_points:
		point.set_supplied(false)
	for point in _victory_points:
		if point.owner_team_id >= 0:
			point.set_supplied(true)
	for point in _resource_points:
		if point.owner_team_id == 0 and point.point_id == "G3":
			point.set_supplied(true)
		elif point.owner_team_id == 1 and point.point_id == "G4":
			point.set_supplied(true)
	for _pass in range(_resource_points.size()):
		var changed := false
		for point in _resource_points:
			if point.owner_team_id < 0 or point.is_supplied():
				continue
			for neighbour in _resource_points:
				if neighbour.owner_team_id == point.owner_team_id and neighbour.is_supplied() and point.global_position.distance_to(neighbour.global_position) <= SUPPLY_LINK_DISTANCE:
					point.set_supplied(true)
					changed = true
					break
		if not changed:
			break
	_supplied_point_count = 0
	for point in _resource_points:
		if point.owner_team_id == 0 and point.is_supplied():
			_supplied_point_count += 1
	_update_supply_link_visuals()
	_update_objective_status()

func _build_supply_links() -> void:
	for left_index in range(_resource_points.size()):
		for right_index in range(left_index + 1, _resource_points.size()):
			var left_point = _resource_points[left_index]
			var right_point = _resource_points[right_index]
			if left_point.global_position.distance_to(right_point.global_position) > SUPPLY_LINK_DISTANCE:
				continue
			_create_supply_link(left_point, right_point)
	_update_supply_link_visuals()

func _create_supply_link(left_point, right_point) -> void:
	var link := MeshInstance3D.new()
	link.name = "SupplyLink_%s_%s" % [left_point.point_id, right_point.point_id]
	var mesh := BoxMesh.new()
	var distance: float = left_point.global_position.distance_to(right_point.global_position)
	mesh.size = Vector3(0.32, 0.04, distance)
	link.mesh = mesh
	add_child(link)
	link.position = (left_point.position + right_point.position) * 0.5 + Vector3.UP * 0.07
	link.look_at(right_point.global_position + Vector3.UP * 0.07, Vector3.UP)
	_supply_links.append({"mesh": link, "left": left_point, "right": right_point})

func _update_supply_link_visuals() -> void:
	for data in _supply_links:
		var left = data.left
		var right = data.right
		var color := Color(0.24, 0.25, 0.22, 0.38)
		if left.owner_team_id == 0 and right.owner_team_id == 0 and left.is_supplied() and right.is_supplied():
			color = Color(0.16, 0.62, 1.0, 0.85)
		elif left.owner_team_id == 1 and right.owner_team_id == 1 and left.is_supplied() and right.is_supplied():
			color = Color(1.0, 0.20, 0.12, 0.85)
		var material := StandardMaterial3D.new()
		material.albedo_color = color
		material.emission_enabled = color.a > 0.5
		material.emission = Color(color.r, color.g, color.b) * 0.45
		material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		data.mesh.material_override = material

func _on_resources_changed(team_id: int, gas: float, income_per_second: float) -> void:
	if team_id != 0 or not is_instance_valid(resource_status):
		return
	resource_status.text = "GÁZ: %d\nBEVÉTEL: +%.1f / mp\nLÉTSZÁM: %d / %d" % [floori(gas), income_per_second, _get_team_population(0), POPULATION_CAP]
	_refresh_backline_ui()

func _on_infantry_call_in_pressed() -> void:
	if not is_instance_valid(economy_manager):
		return
	if not _production_type.is_empty() or _get_team_population(0) + INFANTRY_SQUAD_SIZE > POPULATION_CAP:
		return
	if not economy_manager.spend_gas(0, INFANTRY_SQUAD_COST):
		_set_backline_status("Nincs elegendő gáz a behíváshoz.")
		return
	_start_production("infantry", INFANTRY_BUILD_TIME)

func _spawn_infantry_squad() -> void:
	_reinforcement_wave += 1
	var wave_z := 94.0 + float((_reinforcement_wave - 1) % 3) * 2.4
	for index in range(INFANTRY_SQUAD_SIZE):
		var unit = RTS_UNIT.new()
		unit.name = "EmberReinforcement_%02d_%02d" % [_reinforcement_wave, index + 1]
		unit.team_id = 0
		unit.squad_id = "ember_erosites_%02d" % _reinforcement_wave
		unit.collision_layer = 2
		unit.collision_mask = 1 | 2
		unit.position = Vector3(-2.4 + float(index) * 2.4, 0.0, wave_z)
		add_child(unit)
	_set_backline_status("Gyalogsági raj megérkezett: +%d katona." % INFANTRY_SQUAD_SIZE)

func _set_backline_status(message: String) -> void:
	if is_instance_valid(backline_status):
		backline_status.text = message

func _on_vehicle_call_in_pressed() -> void:
	if not is_instance_valid(economy_manager):
		return
	if not _production_type.is_empty() or _get_team_population(0) + VEHICLE_POPULATION > POPULATION_CAP:
		return
	if not economy_manager.spend_gas(0, LIGHT_VEHICLE_COST):
		_set_backline_status("Nincs elegendő gáz a jármű behívásához.")
		return
	_start_production("vehicle", VEHICLE_BUILD_TIME)

func _spawn_light_vehicle() -> void:
	_spawn_single_unit("vehicle")

func _queue_single_unit(unit_type: String, cost: float, duration: float, population_cost: int) -> void:
	if not is_instance_valid(economy_manager) or not _production_type.is_empty():
		return
	if _get_team_population(0) + population_cost > POPULATION_CAP or not economy_manager.spend_gas(0, cost):
		return
	_start_production(unit_type, duration)

func _spawn_single_unit(unit_type: String) -> void:
	_reinforcement_wave += 1
	var vehicle = RTS_UNIT.new()
	vehicle.name = "Ember_%s_%02d" % [unit_type, _reinforcement_wave]
	vehicle.team_id = 0
	vehicle.squad_id = "ember_%s_%02d" % [unit_type, _reinforcement_wave]
	vehicle.unit_type = unit_type
	vehicle.is_vehicle = true
	vehicle.collision_layer = 2
	vehicle.collision_mask = 1 | 2
	vehicle.position = Vector3(8.0, 0.0, 96.0)
	add_child(vehicle)
	_set_backline_status("%s megérkezett." % _unit_title(unit_type))

func _start_production(unit_type: String, duration: float) -> void:
	_production_type = unit_type
	_production_duration = duration
	_production_remaining = duration
	_refresh_backline_ui()

func _finish_production() -> void:
	var completed_type := _production_type
	_production_type = ""
	_production_remaining = 0.0
	if completed_type == "infantry":
		_spawn_infantry_squad()
	elif completed_type == "vehicle":
		_spawn_light_vehicle()
	elif completed_type in ["tank", "helicopter", "fighter"]:
		_spawn_single_unit(completed_type)
	_refresh_backline_ui()

func _get_team_population(team_id: int) -> int:
	var population := 0
	for node in get_tree().get_nodes_in_group("rts_units"):
		if node.team_id == team_id:
			population += _unit_population(node.unit_type)
	return population

func _refresh_backline_ui() -> void:
	if not is_instance_valid(economy_manager):
		return
	var population := _get_team_population(0)
	var queue_busy := not _production_type.is_empty()
	if is_instance_valid(infantry_call_in_button):
		infantry_call_in_button.disabled = queue_busy or economy_manager.get_gas(0) < INFANTRY_SQUAD_COST or population + INFANTRY_SQUAD_SIZE > POPULATION_CAP
	if is_instance_valid(vehicle_call_in_button):
		vehicle_call_in_button.disabled = queue_busy or economy_manager.get_gas(0) < LIGHT_VEHICLE_COST or population + VEHICLE_POPULATION > POPULATION_CAP
	if is_instance_valid(tank_call_in_button):
		tank_call_in_button.disabled = queue_busy or economy_manager.get_gas(0) < TANK_COST or population + 6 > POPULATION_CAP
	if is_instance_valid(helicopter_call_in_button):
		helicopter_call_in_button.disabled = queue_busy or economy_manager.get_gas(0) < HELICOPTER_COST or population + 7 > POPULATION_CAP
	if is_instance_valid(fighter_call_in_button):
		fighter_call_in_button.disabled = queue_busy or economy_manager.get_gas(0) < FIGHTER_COST or population + 8 > POPULATION_CAP
	if is_instance_valid(resource_status):
		resource_status.text = "GÁZ: %d\nBEVÉTEL: +%.1f / mp\nLÉTSZÁM: %d / %d" % [floori(economy_manager.get_gas(0)), economy_manager.get_income_per_second(0), population, POPULATION_CAP]
	if queue_busy:
		var title := _unit_title(_production_type)
		var progress := 1.0 - _production_remaining / maxf(0.01, _production_duration)
		_set_backline_status("GYÁRTÁS: %s  %d%%  (%.1f mp)" % [title, roundi(progress * 100.0), _production_remaining])
	elif population >= POPULATION_CAP:
		_set_backline_status("Elérted a %d fős létszámkorlátot." % POPULATION_CAP)

func _unit_population(unit_type: String) -> int:
	if unit_type == "tank":
		return 6
	if unit_type == "helicopter":
		return 7
	if unit_type == "fighter":
		return 8
	return VEHICLE_POPULATION if unit_type == "vehicle" else 1

func _unit_title(unit_type: String) -> String:
	if unit_type == "infantry":
		return "GYALOGSÁGI RAJ"
	if unit_type == "vehicle":
		return "KÖNNYŰ PÁNCÉLOZOTT JÁRMŰ"
	if unit_type == "tank":
		return "TANK"
	if unit_type == "helicopter":
		return "LÉGI TÁMOGATÓ EGYSÉG"
	return "CSAPÁSMÉRŐ VADÁSZGÉP"

func _build_road_network() -> void:
	_add_road(Vector3(0, 0.035, 0), Vector2(7.0, MAP_SIZE.y * 0.78), 0.0)
	_add_road(Vector3(0, 0.04, 4), Vector2(MAP_SIZE.x * 0.72, 5.0), 0.08)
	_add_road(Vector3(-37, 0.045, -31), Vector2(42.0, 4.0), -0.52)
	_add_road(Vector3(38, 0.045, 31), Vector2(40.0, 4.0), -0.50)

func _add_road(center: Vector3, size: Vector2, yaw: float) -> void:
	var road := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = Vector3(size.x, 0.12, size.y)
	road.mesh = mesh
	road.position = center
	road.rotation.y = yaw
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.37, 0.34, 0.27)
	material.roughness = 1.0
	road.material_override = material
	add_child(road)
	for side in [-1.0, 1.0]:
		var shoulder := MeshInstance3D.new()
		var shoulder_mesh := BoxMesh.new()
		shoulder_mesh.size = Vector3(size.x, 0.08, 0.65)
		shoulder.mesh = shoulder_mesh
		shoulder.position = center + Vector3(0, 0.01, side * (size.y * 0.5 + 0.4)).rotated(Vector3.UP, yaw)
		shoulder.rotation.y = yaw
		var shoulder_material := StandardMaterial3D.new()
		shoulder_material.albedo_color = Color(0.48, 0.43, 0.33)
		shoulder_material.roughness = 1.0
		shoulder.material_override = shoulder_material
		add_child(shoulder)

func _build_forests() -> void:
	for group in TREE_GROUPS:
		for index in range(group.count):
			var x: float = group.center.x + _rng.randf_range(-group.size.x * 0.5, group.size.x * 0.5)
			var z: float = group.center.y + _rng.randf_range(-group.size.y * 0.5, group.size.y * 0.5)
			if _is_near_road(Vector2(x, z)):
				continue
			# Strategic-scale vegetation: trees stay clearly smaller than units.
			_add_tree(Vector3(x, 0.0, z), _rng.randf_range(0.34, 0.52))

func _add_tree(at: Vector3, scale_factor: float) -> void:
	var tree := Node3D.new()
	tree.position = at
	tree.scale = Vector3.ONE * scale_factor
	add_child(tree)

	var trunk := MeshInstance3D.new()
	var trunk_mesh := CylinderMesh.new()
	trunk_mesh.top_radius = 0.22
	trunk_mesh.bottom_radius = 0.38
	trunk_mesh.height = 4.2
	trunk.mesh = trunk_mesh
	trunk.position.y = 2.1
	var bark := StandardMaterial3D.new()
	bark.albedo_color = Color(0.25, 0.19, 0.13)
	bark.roughness = 1.0
	trunk.material_override = bark
	tree.add_child(trunk)

	var crown := MeshInstance3D.new()
	var crown_mesh := SphereMesh.new()
	crown_mesh.radius = 2.0
	crown_mesh.height = 4.6
	crown.mesh = crown_mesh
	crown.position.y = 4.8
	var leaves := StandardMaterial3D.new()
	leaves.albedo_color = Color(_rng.randf_range(0.12, 0.22), _rng.randf_range(0.25, 0.36), _rng.randf_range(0.14, 0.22))
	leaves.roughness = 1.0
	crown.material_override = leaves
	tree.add_child(crown)

func _build_rocks() -> void:
	for index in range(48):
		var x := _rng.randf_range(-MAP_SIZE.x * 0.46, MAP_SIZE.x * 0.46)
		var z := _rng.randf_range(-MAP_SIZE.y * 0.46, MAP_SIZE.y * 0.46)
		if _is_near_road(Vector2(x, z)) or _is_in_forest(Vector2(x, z)):
			continue
		var rock := MeshInstance3D.new()
		var mesh := SphereMesh.new()
		mesh.radius = _rng.randf_range(0.42, 1.10)
		mesh.height = mesh.radius * _rng.randf_range(0.65, 1.0)
		rock.mesh = mesh
		rock.position = Vector3(x, mesh.height * 0.35, z)
		rock.rotation = Vector3(_rng.randf_range(-0.2, 0.2), _rng.randf_range(0, TAU), _rng.randf_range(-0.2, 0.2))
		var material := StandardMaterial3D.new()
		material.albedo_color = Color(0.34, 0.36, 0.32)
		material.roughness = 1.0
		rock.material_override = material
		add_child(rock)

func _build_grass_patches() -> void:
	for index in range(65):
		var x := _rng.randf_range(-MAP_SIZE.x * 0.46, MAP_SIZE.x * 0.46)
		var z := _rng.randf_range(-MAP_SIZE.y * 0.46, MAP_SIZE.y * 0.46)
		if _is_near_road(Vector2(x, z)) or _is_in_forest(Vector2(x, z)):
			continue
		var patch := MeshInstance3D.new()
		var mesh := CylinderMesh.new()
		mesh.top_radius = _rng.randf_range(0.9, 2.2)
		mesh.bottom_radius = mesh.top_radius
		mesh.height = 0.025
		patch.mesh = mesh
		patch.position = Vector3(x, 0.015, z)
		var material := StandardMaterial3D.new()
		material.albedo_color = Color(0.31, 0.38, 0.25, 0.65)
		material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		material.roughness = 1.0
		patch.material_override = material
		add_child(patch)

func _is_near_road(point: Vector2) -> bool:
	if absf(point.x) < 5.5 or absf(point.y - 4.0) < 4.0:
		return true
	if point.distance_to(Vector2(-37, -31)) < 5.0 or point.distance_to(Vector2(38, 31)) < 5.0:
		return true
	return false

func _is_in_forest(point: Vector2) -> bool:
	for group in TREE_GROUPS:
		if absf(point.x - group.center.x) < group.size.x * 0.5 and absf(point.y - group.center.y) < group.size.y * 0.5:
			return true
	return false
