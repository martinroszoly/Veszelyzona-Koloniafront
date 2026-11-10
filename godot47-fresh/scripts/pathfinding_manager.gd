class_name PathfindingManager
extends Node

@export var map_min := Vector2(-95.0, -75.0)
@export var grid_size := Vector2i(96, 76)
@export var cell_size := 2.0
@export var obstacle_padding := 1.45

var _grid: AStarGrid2D
var _initialized := false


func _ready() -> void:
	add_to_group("pathfinding_manager")


func get_world_path(start_world: Vector3, end_world: Vector3) -> Array[Vector3]:
	_ensure_initialized()
	var start_cell := _nearest_open_cell(_world_to_cell(start_world))
	var end_cell := _nearest_open_cell(_world_to_cell(end_world))
	var result: Array[Vector3] = []
	if _grid.is_point_solid(start_cell) or _grid.is_point_solid(end_cell):
		result.append(end_world)
		return result
	var id_path := _grid.get_id_path(start_cell, end_cell)
	for index in range(1, id_path.size()):
		var point: Vector2 = _grid.get_point_position(id_path[index])
		result.append(Vector3(point.x, 0.0, point.y))
	if result.is_empty() or result.back().distance_to(end_world) > 0.5:
		result.append(end_world)
	return result


func _ensure_initialized() -> void:
	if _initialized:
		return
	_grid = AStarGrid2D.new()
	_grid.region = Rect2i(Vector2i.ZERO, grid_size)
	_grid.cell_size = Vector2(cell_size, cell_size)
	_grid.offset = map_min + Vector2.ONE * cell_size * 0.5
	_grid.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	_grid.update()
	for y in range(grid_size.y):
		for x in range(grid_size.x):
			var cell := Vector2i(x, y)
			var point_2d: Vector2 = _grid.get_point_position(cell)
			var world_point := Vector3(point_2d.x, 0.0, point_2d.y)
			for cover in get_tree().get_nodes_in_group("cover_objects"):
				if cover.distance_to_cover(world_point) <= obstacle_padding:
					_grid.set_point_solid(cell, true)
					break
	_initialized = true


func _world_to_cell(world_position: Vector3) -> Vector2i:
	var x := clampi(floori((world_position.x - map_min.x) / cell_size), 0, grid_size.x - 1)
	var y := clampi(floori((world_position.z - map_min.y) / cell_size), 0, grid_size.y - 1)
	return Vector2i(x, y)


func _nearest_open_cell(origin: Vector2i) -> Vector2i:
	if not _grid.is_point_solid(origin):
		return origin
	for radius in range(1, 6):
		for y in range(-radius, radius + 1):
			for x in range(-radius, radius + 1):
				var candidate := origin + Vector2i(x, y)
				if candidate.x < 0 or candidate.y < 0 or candidate.x >= grid_size.x or candidate.y >= grid_size.y:
					continue
				if not _grid.is_point_solid(candidate):
					return candidate
	return origin
