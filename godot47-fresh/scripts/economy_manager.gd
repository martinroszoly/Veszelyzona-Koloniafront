class_name EconomyManager
extends Node

signal resources_changed(team_id: int, gas: float, income_per_second: float)

@export var starting_gas: float = 100.0

var _gas_by_team: Dictionary = {}
var _income_by_team: Dictionary = {}
var _registered_points: Array = []


func _ready() -> void:
	_ensure_team(0)
	resources_changed.emit(0, get_gas(0), get_income_per_second(0))


func _process(delta: float) -> void:
	for team_id in _income_by_team.keys():
		var income: float = _income_by_team[team_id]
		if income <= 0.0:
			continue
		_gas_by_team[team_id] = get_gas(team_id) + income * delta
		resources_changed.emit(team_id, get_gas(team_id), income)


func register_capture_point(point) -> void:
	if point == null or _registered_points.has(point):
		return
	_registered_points.append(point)
	point.ownership_changed.connect(_on_point_ownership_changed)
	point.supply_changed.connect(_on_point_supply_changed)
	_recalculate_income()


func get_gas(team_id: int) -> float:
	_ensure_team(team_id)
	return float(_gas_by_team[team_id])


func get_income_per_second(team_id: int) -> float:
	_ensure_team(team_id)
	return float(_income_by_team[team_id])


func can_afford(team_id: int, gas_cost: float) -> bool:
	return get_gas(team_id) >= gas_cost


func spend_gas(team_id: int, gas_cost: float) -> bool:
	if gas_cost < 0.0 or not can_afford(team_id, gas_cost):
		return false
	_gas_by_team[team_id] = get_gas(team_id) - gas_cost
	resources_changed.emit(team_id, get_gas(team_id), get_income_per_second(team_id))
	return true


func add_gas(team_id: int, amount: float) -> void:
	_ensure_team(team_id)
	_gas_by_team[team_id] = maxf(0.0, get_gas(team_id) + amount)
	resources_changed.emit(team_id, get_gas(team_id), get_income_per_second(team_id))


func _ensure_team(team_id: int) -> void:
	if not _gas_by_team.has(team_id):
		_gas_by_team[team_id] = starting_gas
	if not _income_by_team.has(team_id):
		_income_by_team[team_id] = 0.0


func _on_point_ownership_changed(_point, old_owner: int, new_owner: int) -> void:
	if old_owner >= 0:
		_ensure_team(old_owner)
	if new_owner >= 0:
		_ensure_team(new_owner)
	_recalculate_income()


func _on_point_supply_changed(_point, _supplied: bool) -> void:
	_recalculate_income()


func _recalculate_income() -> void:
	for team_id in _income_by_team.keys():
		_income_by_team[team_id] = 0.0
	for point in _registered_points:
		if not is_instance_valid(point) or point.owner_team_id < 0:
			continue
		_ensure_team(point.owner_team_id)
		var supply_multiplier := 1.0 if point.is_supplied() else 0.25
		_income_by_team[point.owner_team_id] = get_income_per_second(point.owner_team_id) + point.gas_income_per_second * supply_multiplier
	for team_id in _income_by_team.keys():
		resources_changed.emit(team_id, get_gas(team_id), get_income_per_second(team_id))
