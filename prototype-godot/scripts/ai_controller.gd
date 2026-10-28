extends Node
class_name RTSLocalAI

var game: Node
var side := "xenon"
var difficulty := "normal"
var think_interval := 2.4
var think_clock := 0.0
var capture_assignments: Dictionary = {}


func configure(owner_game: Node, owner_side: String, level: String) -> void:
	game = owner_game
	side = owner_side
	difficulty = level
	match difficulty:
		"easy":
			think_interval = 4.0
		"normal":
			think_interval = 2.4
		"hard":
			think_interval = 1.55
		"very_hard":
			think_interval = 1.0


func _process(delta: float) -> void:
	think_clock -= delta
	if think_clock <= 0.0 and is_instance_valid(game):
		think_clock = think_interval
		_think()


func _think() -> void:
	if game.match_finished:
		return
	var own_units: Array = game.get_units_for_side(side)
	var points: Array = game.capture_points
	if own_units.is_empty():
		game.request_train(side, "infantry")
		return

	_manage_economy(own_units)
	_defend_supply_routes(own_units, points)
	_defend_owned_points(own_units, points)
	_capture_and_attack(own_units, points)


func _manage_economy(own_units: Array) -> void:
	var buildings: Dictionary = game.get_building_state(side)
	if not bool(buildings.get("barracks", false)):
		game.request_build(side, "barracks")
		return
	if own_units.size() >= 4 and not bool(buildings.get("vehicle_yard", false)):
		game.request_build(side, "vehicle_yard")
	var tank_count := game.count_units_of_kind(side, "tank")
	var infantry_count := game.count_units_of_kind(side, "infantry")
	var queue: String = game.get_training_queue(side)
	if not queue.is_empty():
		return
	if tank_count == 0 and bool(buildings.get("vehicle_yard", false)) and own_units.size() >= 4:
		game.request_train(side, "tank")
	elif infantry_count < 5:
		game.request_train(side, "infantry")
	elif difficulty in ["hard", "very_hard"] and tank_count < 2 and bool(buildings.get("vehicle_yard", false)):
		game.request_train(side, "tank")


func _defend_supply_routes(own_units: Array, points: Array) -> void:
	for point in points:
		if point.owner_side != side or game.is_point_supplied(point, side):
			continue
		var blocker: StrategicCapturePoint = game.find_enemy_supply_blocker(point, side)
		if not is_instance_valid(blocker):
			continue
		var defender: RTSStrategyUnit = _nearest_available(own_units, blocker.global_position, false)
		if is_instance_valid(defender):
			game.issue_move_to_point(defender, blocker)
			return


func _defend_owned_points(own_units: Array, points: Array) -> void:
	for point in points:
		if point.owner_side != side:
			continue
		var enemy: Node3D = game.find_nearby_enemy_at(point.global_position, 24.0, side)
		if not is_instance_valid(enemy):
			continue
		var defender: RTSStrategyUnit = _nearest_available(own_units, point.global_position, false)
		if is_instance_valid(defender):
			game.issue_attack(defender, enemy)
			return


func _capture_and_attack(own_units: Array, points: Array) -> void:
	var candidates: Array[Dictionary] = []
	for point in points:
		if point.owner_side == side:
			continue
		if game.point_has_friendly_capturer(point, side):
			continue
		var value := 1.0
		if point.point_kind == "victory":
			value = 2.4
		elif point.point_kind == "supply":
			value = 2.0
		elif point.resource_kind == "fuel":
			value = 1.7
		elif point.resource_kind == "metal":
			value = 1.4
		if difficulty == "easy":
			value = 1.0
		var nearest_distance := 99999.0
		for unit in own_units:
			if unit.capture_capable:
				nearest_distance = minf(nearest_distance, unit.global_position.distance_to(point.global_position))
		candidates.append({"point": point, "value": value, "distance": nearest_distance})
	if not candidates.is_empty():
		candidates.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
			var score_a := float(a.value) * 32.0 - float(a.distance) * (0.5 if difficulty == "easy" else 0.28)
			var score_b := float(b.value) * 32.0 - float(b.distance) * (0.5 if difficulty == "easy" else 0.28)
			return score_a > score_b
		)
		var target: StrategicCapturePoint = candidates[0].point
		var capturer: RTSStrategyUnit = _nearest_available(own_units, target.global_position, true)
		if is_instance_valid(capturer):
			game.issue_move_to_point(capturer, target)
			capture_assignments[capturer.get_instance_id()] = target.point_id
			return
	var enemy_units: Array = game.get_units_for_side("ember")
	if enemy_units.is_empty():
		var enemy_base: Node3D = game.bases["ember"]
		var base_attacker: RTSStrategyUnit = _nearest_available(own_units, enemy_base.global_position, false)
		if is_instance_valid(base_attacker):
			game.issue_attack(base_attacker, enemy_base)
		return
	var attack_unit: RTSStrategyUnit = _nearest_available(own_units, enemy_units[0].global_position, false)
	if is_instance_valid(attack_unit):
		var target_enemy: Node3D = enemy_units[0]
		for enemy in enemy_units:
			if attack_unit.global_position.distance_squared_to(enemy.global_position) < attack_unit.global_position.distance_squared_to(target_enemy.global_position):
				target_enemy = enemy
		game.issue_attack(attack_unit, target_enemy)


func _nearest_available(units: Array, target_position: Vector3, require_capture: bool) -> RTSStrategyUnit:
	var best: RTSStrategyUnit
	var best_score := INF
	for unit in units:
		if not is_instance_valid(unit) or not unit.alive:
			continue
		if require_capture and not unit.capture_capable:
			continue
		if not unit.move_path.is_empty():
			continue
		if is_instance_valid(unit.attack_target):
			continue
		var score := unit.global_position.distance_squared_to(target_position)
		if score < best_score:
			best_score = score
			best = unit
	return best
