extends Node

@export var player_team_id: int = 0
@export var formation_spacing: float = 2.2
@export var ray_length: float = 1000.0
@export var drag_threshold: float = 8.0

@onready var camera: Camera3D = get_viewport().get_camera_3d()
@onready var status_label: Label = get_node_or_null("../HUD/StatusPanel/Margin/Status")

var _selected_units: Array[RTSUnit] = []
var _drag_start := Vector2.ZERO
var _drag_current := Vector2.ZERO
var _dragging_selection := false
var _selection_box: Panel


func _ready() -> void:
	_build_selection_box()
	_update_status("Bal klikk: kijelölés. Bal gomb húzása: keretes kijelölés.")


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed:
				_begin_selection_drag(event.position)
			else:
				_finish_selection_drag(event.position, Input.is_key_pressed(KEY_SHIFT))
		elif event.pressed and event.button_index == MOUSE_BUTTON_RIGHT:
			_issue_move_command(event.position)
	elif event is InputEventMouseMotion and _dragging_selection:
		_drag_current = event.position
		_update_selection_box()


func _begin_selection_drag(screen_position: Vector2) -> void:
	_drag_start = screen_position
	_drag_current = screen_position
	_dragging_selection = true
	_update_selection_box()


func _finish_selection_drag(screen_position: Vector2, additive: bool) -> void:
	if not _dragging_selection:
		return
	_drag_current = screen_position
	_dragging_selection = false
	_selection_box.visible = false
	if _drag_start.distance_to(_drag_current) < drag_threshold:
		_select_at(screen_position, additive)
	else:
		_select_in_screen_rect(_normalized_drag_rect(), additive)


func _select_in_screen_rect(selection_rect: Rect2, additive: bool) -> void:
	if not additive:
		_clear_selection()
	for node in get_tree().get_nodes_in_group("rts_units"):
		var unit := node as RTSUnit
		if unit == null or unit.team_id != player_team_id:
			continue
		if camera.is_position_behind(unit.global_position):
			continue
		var screen_position := camera.unproject_position(unit.global_position + Vector3.UP)
		if selection_rect.has_point(screen_position) and not unit.is_selected():
			unit.set_selected(true)
			_selected_units.append(unit)
	_update_status("Kerettel kijelölve: %d egység" % _selected_units.size())


func _normalized_drag_rect() -> Rect2:
	var top_left := Vector2(
		minf(_drag_start.x, _drag_current.x),
		minf(_drag_start.y, _drag_current.y)
	)
	var size := Vector2(
		absf(_drag_current.x - _drag_start.x),
		absf(_drag_current.y - _drag_start.y)
	)
	return Rect2(top_left, size)


func _update_selection_box() -> void:
	if not is_instance_valid(_selection_box):
		return
	var rect := _normalized_drag_rect()
	_selection_box.position = rect.position
	_selection_box.size = rect.size
	_selection_box.visible = rect.size.length() >= drag_threshold


func _build_selection_box() -> void:
	_selection_box = Panel.new()
	_selection_box.name = "DragSelectionBox"
	_selection_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_selection_box.z_index = 100
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.18, 0.75, 1.0, 0.12)
	style.border_color = Color(0.25, 0.88, 1.0, 0.95)
	style.set_border_width_all(2)
	_selection_box.add_theme_stylebox_override("panel", style)
	_selection_box.visible = false
	get_node("../HUD").add_child(_selection_box)


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
