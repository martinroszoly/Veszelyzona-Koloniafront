extends Node

const MOVE_COMMAND_MARKER := preload("res://scripts/move_command_marker.gd")
const FACING_COMMAND_PREVIEW := preload("res://scripts/facing_command_preview.gd")

@export var player_team_id: int = 0
@export var formation_spacing: float = 2.8
@export var ray_length: float = 1000.0
@export var drag_threshold: float = 8.0
@export var cover_search_distance: float = 6.0

@onready var camera: Camera3D = get_viewport().get_camera_3d()
@onready var status_label: Label = get_node_or_null("../HUD/StatusPanel/Margin/Status")

var _selected_units: Array = []
var _drag_start := Vector2.ZERO
var _drag_current := Vector2.ZERO
var _dragging_selection := false
var _selection_box: Panel
var _right_dragging := false
var _right_drag_start_screen := Vector2.ZERO
var _right_command_position := Vector3.ZERO
var _right_facing_direction := Vector3.ZERO
var _facing_preview = null
var _hovered_cover = null


func _ready() -> void:
	_build_selection_box()
	_update_status("Bal klikk: kijelölés. Bal gomb húzása: keretes kijelölés.")


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_R:
		_retreat_selected_squads()
	elif event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed:
				_begin_selection_drag(event.position)
			else:
				_finish_selection_drag(event.position, Input.is_key_pressed(KEY_SHIFT))
		elif event.button_index == MOUSE_BUTTON_RIGHT:
			if event.pressed:
				_begin_facing_command(event.position)
			else:
				_finish_facing_command(event.position)
	elif event is InputEventMouseMotion:
		if _dragging_selection:
			_drag_current = event.position
			_update_selection_box()
		elif _right_dragging:
			_update_facing_command(event.position)
		else:
			_update_cover_hover(event.position)


func _retreat_selected_squads() -> void:
	_prune_selected_units()
	if _selected_units.is_empty():
		_update_status("Nincs kijelölt raj a visszavonuláshoz.")
		return
	var squad_count := _selected_squad_count()
	for unit in _selected_units:
		unit.retreat_to_home()
	_update_status("VISSZAVONULÁS: %d raj a hátországba tart és ott gyógyul." % squad_count)


func _update_cover_hover(screen_position: Vector2) -> void:
	_prune_selected_units()
	var next_cover = null
	var hit := _raycast(screen_position, 1)
	if not _selected_units.is_empty() and not hit.is_empty():
		next_cover = _find_nearby_cover(hit.position)
	if is_instance_valid(_hovered_cover) and _hovered_cover != next_cover:
		_hovered_cover.hide_slot_preview()
	_hovered_cover = next_cover
	if is_instance_valid(_hovered_cover):
		_hovered_cover.show_slot_preview(_selected_units.size(), hit.position)


func _begin_facing_command(screen_position: Vector2) -> void:
	if _selected_units.is_empty():
		_update_status("Nincs kijelölt raj.")
		return
	var hit := _raycast(screen_position, 1)
	if hit.is_empty():
		return
	_right_dragging = true
	_right_drag_start_screen = screen_position
	_right_command_position = hit.position
	_right_facing_direction = Vector3.ZERO
	_facing_preview = FACING_COMMAND_PREVIEW.new()
	_facing_preview.position = _right_command_position + Vector3.UP * 0.13
	get_tree().current_scene.add_child(_facing_preview)


func _update_facing_command(screen_position: Vector2) -> void:
	if not _right_dragging or not is_instance_valid(_facing_preview):
		return
	var hit := _raycast(screen_position, 1)
	if hit.is_empty():
		return
	_right_facing_direction = hit.position - _right_command_position
	_right_facing_direction.y = 0.0
	if _right_drag_start_screen.distance_to(screen_position) < drag_threshold:
		_right_facing_direction = Vector3.ZERO
	_facing_preview.set_facing_direction(_right_facing_direction)


func _finish_facing_command(screen_position: Vector2) -> void:
	if not _right_dragging:
		return
	_update_facing_command(screen_position)
	_right_dragging = false
	if is_instance_valid(_facing_preview):
		_facing_preview.queue_free()
	var enemy_hit := _raycast(screen_position, 2)
	var enemy = enemy_hit.get("collider")
	if enemy != null and enemy.is_in_group("rts_units") and enemy.team_id != player_team_id:
		for unit in _selected_units:
			if is_instance_valid(unit):
				unit.attack_target(enemy)
		_update_status("TÁMADÁS: %d katona a kijelölt ellenségre tüzel." % _selected_units.size())
		return
	_issue_move_command_at(_right_command_position, _right_facing_direction)


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
	var squads_to_select: Array[String] = []
	for node in get_tree().get_nodes_in_group("rts_units"):
		var unit = node
		if unit == null or unit.team_id != player_team_id:
			continue
		if camera.is_position_behind(unit.global_position):
			continue
		var screen_position := camera.unproject_position(unit.global_position + Vector3.UP)
		if selection_rect.has_point(screen_position) and not squads_to_select.has(unit.squad_id):
			squads_to_select.append(unit.squad_id)
	for squad_id in squads_to_select:
		_select_squad(squad_id)
	_update_selection_status("Kerettel kijelölve")


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
	var clicked_unit = hit.get("collider")
	if clicked_unit != null and not clicked_unit.is_in_group("rts_units"):
		clicked_unit = null
	if not additive:
		_clear_selection()
	if clicked_unit != null and clicked_unit.team_id == player_team_id:
		if additive and clicked_unit.is_selected():
			_deselect_squad(clicked_unit.squad_id)
		else:
			_select_squad(clicked_unit.squad_id)
	_update_selection_status("Kijelölve")


func _issue_move_command(screen_position: Vector2) -> void:
	if _selected_units.is_empty():
		_update_status("Nincs kijelölt egység.")
		return
	var hit := _raycast(screen_position, 1)
	if hit.is_empty():
		return
	_issue_move_command_at(hit.position, Vector3.ZERO)


func _issue_move_command_at(center: Vector3, facing_direction: Vector3) -> void:
	_prune_selected_units()
	if _selected_units.is_empty():
		_update_status("A kijelölt rajnak nem maradt bevethető katonája.")
		return
	_show_move_command_marker(center)
	var cover = _find_nearby_cover(center)
	if cover != null:
		var slots: Array = cover.get_cover_slots(_selected_units.size(), center)
		var cover_facing := facing_direction
		if cover_facing.length_squared() < 0.01:
			cover_facing = cover.get_cover_facing(center)
		for index in range(mini(_selected_units.size(), slots.size())):
			_selected_units[index].move_to(slots[index], cover_facing, int(cover.strength))
		cover.show_slot_preview(_selected_units.size(), center)
		_update_status("%d raj erős fedezékbe rendeződik." % _selected_squad_count())
		return
	var columns := ceili(sqrt(float(_selected_units.size())))
	if _selected_units.size() == 3:
		var forward := facing_direction
		if forward.length_squared() < 0.01:
			forward = Vector3.FORWARD
		forward = forward.normalized()
		var side := Vector3(forward.z, 0.0, -forward.x)
		var triangle_offsets := [
			-forward * formation_spacing * 0.45,
			forward * formation_spacing * 0.35 - side * formation_spacing * 0.55,
			forward * formation_spacing * 0.35 + side * formation_spacing * 0.55,
		]
		for index in range(_selected_units.size()):
			_selected_units[index].move_to(center + triangle_offsets[index], facing_direction, -1)
		_update_status("A háromfős raj háromszög alakzatban mozog.")
		return
	for index in range(_selected_units.size()):
		var row := index / columns
		var column := index % columns
		var offset_x := (float(column) - float(columns - 1) * 0.5) * formation_spacing
		var offset_z := float(row) * formation_spacing
		_selected_units[index].move_to(center + Vector3(offset_x, 0.0, offset_z), facing_direction, -1)
	_update_status("Mozgási parancs kiadva %d rajnak." % _selected_squad_count())


func _find_nearby_cover(world_position: Vector3):
	var closest_cover = null
	var closest_distance := cover_search_distance
	for node in get_tree().get_nodes_in_group("cover_objects"):
		var cover = node
		if cover == null:
			continue
		var distance: float = cover.distance_to_cover(world_position)
		if distance <= closest_distance and distance <= cover.snap_distance:
			closest_distance = distance
			closest_cover = cover
	return closest_cover


func _select_squad(squad_id: String) -> void:
	for node in get_tree().get_nodes_in_group("rts_units"):
		var unit = node
		if unit == null or unit.team_id != player_team_id or unit.squad_id != squad_id:
			continue
		unit.set_selected(true)
		if not _selected_units.has(unit):
			_selected_units.append(unit)


func _deselect_squad(squad_id: String) -> void:
	for index in range(_selected_units.size() - 1, -1, -1):
		var unit = _selected_units[index]
		if is_instance_valid(unit) and unit.squad_id == squad_id:
			unit.set_selected(false)
			_selected_units.remove_at(index)


func _selected_squad_count() -> int:
	var squad_ids: Array[String] = []
	for unit in _selected_units:
		if is_instance_valid(unit) and not squad_ids.has(unit.squad_id):
			squad_ids.append(unit.squad_id)
	return squad_ids.size()


func _prune_selected_units() -> void:
	for index in range(_selected_units.size() - 1, -1, -1):
		if not is_instance_valid(_selected_units[index]):
			_selected_units.remove_at(index)


func _update_selection_status(prefix: String) -> void:
	_update_status("%s: %d raj / %d katona" % [prefix, _selected_squad_count(), _selected_units.size()])


func _show_move_command_marker(world_position: Vector3) -> void:
	var marker = MOVE_COMMAND_MARKER.new()
	marker.position = world_position + Vector3.UP * 0.12
	get_tree().current_scene.add_child(marker)


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
	if is_instance_valid(_hovered_cover):
		_hovered_cover.hide_slot_preview()
	_hovered_cover = null
	for unit in _selected_units:
		if is_instance_valid(unit):
			unit.set_selected(false)
	_selected_units.clear()


func _update_status(message: String) -> void:
	if is_instance_valid(status_label):
		status_label.text = message
