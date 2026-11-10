extends Node

const RTS_UNIT := preload("res://scripts/rts_unit.gd")
const REINFORCEMENT_COST := 120.0
const REINFORCEMENT_SIZE := 5
const REINFORCEMENT_TIME := 8.0
const POPULATION_CAP := 50

@export var team_id: int = 1
@export var decision_interval: float = 3.0
@export var formation_spacing: float = 2.0

var _decision_timer := 0.7
var _reinforcement_wave := 0
var _production_remaining := 0.0
var _production_queued := false
var _queued_type := "infantry"
var _squad_phase: Dictionary = {}
@onready var economy_manager: Node = get_node_or_null("../EconomyManager")


func _physics_process(delta: float) -> void:
	if _production_queued:
		_production_remaining -= delta
		if _production_remaining <= 0.0:
			_production_queued = false
			_spawn_reinforcements(_queued_type)
	_decision_timer -= delta
	if _decision_timer > 0.0:
		return
	_decision_timer = decision_interval
	_try_call_in_reinforcements()
	_issue_squad_orders()


func _issue_squad_orders() -> void:
	var squads: Dictionary = {}
	for node in get_tree().get_nodes_in_group("rts_units"):
		if node.team_id != team_id:
			continue
		if not squads.has(node.squad_id):
			squads[node.squad_id] = []
		squads[node.squad_id].append(node)
	for squad_id in squads.keys():
		var members: Array = squads[squad_id]
		_prune_invalid_members(members)
		if members.is_empty():
			continue
		var average_health := 0.0
		for member in members:
			average_health += member.get_health_ratio()
		average_health /= float(members.size())
		if average_health < 0.35:
			for member in members:
				member.retreat_to_home()
			continue
		if members[0].is_retreating():
			continue
		var squad_center: Vector3 = _get_squad_center(members)
		var enemy = _find_nearest_enemy(squad_center, 72.0)
		if enemy != null:
			for member in members:
				member.attack_target(enemy)
			continue
		var objective = _find_nearest_uncaptured_point(squad_center)
		if objective == null:
			continue
		var phase := int(_squad_phase.get(squad_id, 0))
		_squad_phase[squad_id] = (phase + 1) % 3
		if phase == 0:
			var staging_cover = _find_staging_cover(squad_center, objective.global_position)
			if staging_cover != null:
				var slots: Array = staging_cover.get_cover_slots(members.size(), objective.global_position)
				for index in range(mini(members.size(), slots.size())):
					members[index].move_to(slots[index], staging_cover.get_cover_facing(objective.global_position), int(staging_cover.strength))
				continue
		if phase == 1:
			# Stop short and scout before committing to the capture circle.
			var staging_direction: Vector3 = (squad_center - objective.global_position).normalized()
			var staging_position: Vector3 = objective.global_position + staging_direction * 8.0
			for member in members:
				member.move_to(staging_position)
			continue
		var columns := ceili(sqrt(float(members.size())))
		for index in range(members.size()):
			var row := index / columns
			var column := index % columns
			var offset_x := (float(column) - float(columns - 1) * 0.5) * formation_spacing
			var offset_z := float(row) * formation_spacing
			members[index].move_to(objective.global_position + Vector3(offset_x, 0.0, offset_z))


func _find_nearest_enemy(from_position: Vector3, maximum_distance: float):
	var closest = null
	var closest_distance := maximum_distance
	for node in get_tree().get_nodes_in_group("rts_units"):
		if node.team_id == team_id:
			continue
		var distance := from_position.distance_to(node.global_position)
		if distance < closest_distance:
			closest_distance = distance
			closest = node
	return closest


func _find_staging_cover(from_position: Vector3, objective_position: Vector3):
	var selected = null
	var selected_score := INF
	for cover in get_tree().get_nodes_in_group("cover_objects"):
		var route_distance: float = from_position.distance_to(cover.global_position) + cover.global_position.distance_to(objective_position) * 0.28
		if route_distance < selected_score and from_position.distance_to(cover.global_position) < 48.0:
			selected_score = route_distance
			selected = cover
	return selected


func _find_nearest_uncaptured_point(from_position: Vector3):
	var closest = null
	var closest_score := INF
	for point in get_tree().get_nodes_in_group("capture_points"):
		if point.owner_team_id == team_id:
			continue
		var distance: float = from_position.distance_to(point.global_position)
		var priority_bonus := 28.0 if point.is_victory_point else 0.0
		var score := distance - priority_bonus
		if score < closest_score:
			closest_score = score
			closest = point
	return closest


func _get_squad_center(members: Array) -> Vector3:
	var center := Vector3.ZERO
	for member in members:
		center += member.global_position
	return center / float(members.size())


func _prune_invalid_members(members: Array) -> void:
	for index in range(members.size() - 1, -1, -1):
		if not is_instance_valid(members[index]):
			members.remove_at(index)


func _try_call_in_reinforcements() -> void:
	if not is_instance_valid(economy_manager) or _production_queued:
		return
	var population := 0
	for node in get_tree().get_nodes_in_group("rts_units"):
		if node.team_id == team_id:
			population += _unit_population(node.unit_type)
	var options := [
		{"type": "fighter", "cost": 650.0, "time": 28.0, "population": 8},
		{"type": "helicopter", "cost": 500.0, "time": 24.0, "population": 7},
		{"type": "tank", "cost": 420.0, "time": 20.0, "population": 6},
		{"type": "vehicle", "cost": 260.0, "time": 14.0, "population": 4},
		{"type": "infantry", "cost": REINFORCEMENT_COST, "time": REINFORCEMENT_TIME, "population": REINFORCEMENT_SIZE},
	]
	var choice = null
	for option in options:
		if population + int(option.population) <= POPULATION_CAP and economy_manager.can_afford(team_id, float(option.cost)):
			choice = option
			break
	if choice == null:
		return
	if not economy_manager.spend_gas(team_id, float(choice.cost)):
		return
	_production_queued = true
	_queued_type = choice.type
	_production_remaining = choice.time

func _spawn_reinforcements(unit_type: String) -> void:
	_reinforcement_wave += 1
	var unit_count := REINFORCEMENT_SIZE if unit_type == "infantry" else 1
	for index in range(unit_count):
		var unit = RTS_UNIT.new()
		unit.name = "Xenon_%s_%02d_%02d" % [unit_type, _reinforcement_wave, index + 1]
		unit.team_id = team_id
		unit.squad_id = "xenon_%s_%02d" % [unit_type, _reinforcement_wave]
		unit.unit_type = unit_type
		unit.is_vehicle = unit_type != "infantry"
		unit.collision_layer = 2
		unit.collision_mask = 1 | 2
		unit.position = Vector3(-2.4 + float(index) * 2.4, 0.0, -96.0)
		get_tree().current_scene.add_child(unit)

func _unit_population(unit_type: String) -> int:
	if unit_type == "fighter":
		return 8
	if unit_type == "helicopter":
		return 7
	if unit_type == "tank":
		return 6
	return 4 if unit_type == "vehicle" else 1
