extends Node

const RTS_UNIT := preload("res://scripts/rts_unit.gd")
const REINFORCEMENT_COST := 120.0
const REINFORCEMENT_SIZE := 3

@export var team_id: int = 1
@export var decision_interval: float = 3.0
@export var formation_spacing: float = 2.0

var _decision_timer := 0.7
var _reinforcement_wave := 0
@onready var economy_manager: Node = get_node_or_null("../EconomyManager")


func _physics_process(delta: float) -> void:
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
		var squad_center: Vector3 = _get_squad_center(members)
		var objective = _find_nearest_uncaptured_point(squad_center)
		if objective == null:
			continue
		var columns := ceili(sqrt(float(members.size())))
		for index in range(members.size()):
			var row := index / columns
			var column := index % columns
			var offset_x := (float(column) - float(columns - 1) * 0.5) * formation_spacing
			var offset_z := float(row) * formation_spacing
			members[index].move_to(objective.global_position + Vector3(offset_x, 0.0, offset_z))


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
	if not is_instance_valid(economy_manager):
		return
	if not economy_manager.spend_gas(team_id, REINFORCEMENT_COST):
		return
	_reinforcement_wave += 1
	for index in range(REINFORCEMENT_SIZE):
		var unit = RTS_UNIT.new()
		unit.name = "XenonAIReinforcement_%02d_%02d" % [_reinforcement_wave, index + 1]
		unit.team_id = team_id
		unit.squad_id = "xenon_ai_erosites_%02d" % _reinforcement_wave
		unit.collision_layer = 2
		unit.collision_mask = 1 | 2
		unit.position = Vector3(-2.4 + float(index) * 2.4, 0.0, -96.0)
		get_tree().current_scene.add_child(unit)
