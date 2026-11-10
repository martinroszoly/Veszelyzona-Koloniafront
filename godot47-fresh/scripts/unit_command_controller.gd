extends Node

@export var player_team_id: int = 0
@export var formation_spacing: float = 2.2
@export var ray_length: float = 1000.0

@onready var camera: Camera3D = get_viewport().get_camera_3d()
@onready var status_label: Label = get_node_or_null("../HUD/StatusPanel/Margin/Status")

var _selected_units: Array[RTSUnit] = []


func _ready() -> void:
	_update_status("Jelölj ki egy kék egységet bal egérgombbal.")


func _unhandled_input(event: InputEvent) -> void:
	if not event is InputEventMouseButton or not event.pressed:
		return
	if event.button_index == MOUSE_BUTTON_LEFT:
		_select_at(event.position, Input.is_key_pressed(KEY_SHIFT))
	elif event.button_index == MOUSE_BUTTON_RIGHT:
		_issue_move_command(event.position)


func _select_at(screen_position: Vector2, additive: bool) -> void:
	var hit := _raycast(screen_position, 1 | 2)
	var clicked_unit := hit.get("collider") as RTSUnit
	if not additive:
		_clear_selection()
	if clicked_unit != null and clicked_unit.team_id == player_team_id:
		if additive and clicked_unit.is_selected():
			clicked_unit.set_selected(false)
			_selected_units.erase(clicked_unit)
		else:
			clicked_unit.set_selected(true)
			_selected_units.append(clicked_unit)
	_update_status("Kijelölve: %d egység" % _selected_units.size())


func _issue_move_command(screen_position: Vector2) -> void:
	if _selected_units.is_empty():
		_update_status("Nincs kijelölt egység.")
		return
	var hit := _raycast(screen_position, 1)
	if hit.is_empty():
		return
	var center: Vector3 = hit.position
	var columns := ceili(sqrt(float(_selected_units.size())))
	for index in range(_selected_units.size()):
		var row := index / columns
		var column := index % columns
		var offset_x := (float(column) - float(columns - 1) * 0.5) * formation_spacing
		var offset_z := float(row) * formation_spacing
		_selected_units[index].move_to(center + Vector3(offset_x, 0.0, offset_z))
	_update_status("Mozgási parancs kiadva %d egységnek." % _selected_units.size())


func _raycast(screen_position: Vector2, collision_mask: int) -> Dictionary:
	if not is_instance_valid(camera):
		camera = get_viewport().get_camera_3d()
	if not is_instance_valid(camera):
		return {}
	var origin := camera.project_ray_origin(screen_position)
	var target := origin + camera.project_ray_normal(screen_position) * ray_length
	var query := PhysicsRayQueryParameters3D.create(origin, target, collision_mask)
	query.collide_with_areas = false
	return camera.get_world_3d().direct_space_state.intersect_ray(query)


func _clear_selection() -> void:
	for unit in _selected_units:
		if is_instance_valid(unit):
			unit.set_selected(false)
	_selected_units.clear()


func _update_status(message: String) -> void:
	if is_instance_valid(status_label):
		status_label.text = message
