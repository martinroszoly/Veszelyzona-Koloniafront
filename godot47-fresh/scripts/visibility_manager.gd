class_name VisibilityManager
extends Node

@export var observer_team_id: int = 0
@export var refresh_interval: float = 0.12

var _refresh_timer := 0.0


func _process(delta: float) -> void:
	_refresh_timer -= delta
	if _refresh_timer > 0.0:
		return
	_refresh_timer = refresh_interval
	_update_enemy_visibility()


func _update_enemy_visibility() -> void:
	var friendly_units: Array = []
	var enemy_units: Array = []
	for node in get_tree().get_nodes_in_group("rts_units"):
		if not is_instance_valid(node):
			continue
		if node.team_id == observer_team_id:
			friendly_units.append(node)
		else:
			enemy_units.append(node)
	for enemy in enemy_units:
		enemy.visible = _is_revealed(enemy, friendly_units)


func _is_revealed(enemy, friendly_units: Array) -> bool:
	for observer in friendly_units:
		if not is_instance_valid(observer):
			continue
		if observer.global_position.distance_to(enemy.global_position) > observer.sight_range:
			continue
		if _has_clear_sight(observer.global_position, enemy.global_position):
			return true
	return false


func _has_clear_sight(from_position: Vector3, to_position: Vector3) -> bool:
	var origin := from_position + Vector3.UP * 1.8
	var destination := to_position + Vector3.UP * 1.8
	var query := PhysicsRayQueryParameters3D.create(origin, destination, 1)
	query.collide_with_areas = false
	return get_tree().current_scene.get_world_3d().direct_space_state.intersect_ray(query).is_empty()
