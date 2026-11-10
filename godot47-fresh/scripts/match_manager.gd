class_name MatchManager
extends Node

@export var target_victory_points: int = 500
@export var tick_interval: float = 1.0

var player_victory_points: int
var enemy_victory_points: int
var _tick_timer := 1.0
var _match_over := false
var _result_backdrop: ColorRect
var _restart_button: Button

@onready var victory_status: Label = get_node_or_null("../HUD/MatchPanel/Margin/VictoryStatus")
@onready var result_panel: PanelContainer = get_node_or_null("../HUD/ResultPanel")
@onready var result_label: Label = get_node_or_null("../HUD/ResultPanel/Margin/ResultLabel")


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	player_victory_points = 0
	enemy_victory_points = 0
	_build_result_overlay()
	if is_instance_valid(result_panel):
		result_panel.visible = false
	_update_hud()


func _process(delta: float) -> void:
	if _match_over:
		return
	_tick_timer -= delta
	if _tick_timer > 0.0:
		return
	_tick_timer = tick_interval
	_apply_victory_point_tick()


func _apply_victory_point_tick() -> void:
	var player_points := 0
	var enemy_points := 0
	for point in get_tree().get_nodes_in_group("victory_points"):
		if point.owner_team_id == 0:
			player_points += 1
		elif point.owner_team_id == 1:
			enemy_points += 1
	player_victory_points = mini(target_victory_points, player_victory_points + player_points)
	enemy_victory_points = mini(target_victory_points, enemy_victory_points + enemy_points)
	_update_hud()
	if player_victory_points >= target_victory_points:
		_finish_match(true)
	elif enemy_victory_points >= target_victory_points:
		_finish_match(false)


func _update_hud() -> void:
	if is_instance_valid(victory_status):
		victory_status.text = "EMBER  %03d / %03d     ★     %03d / %03d  ELLENSÉG" % [player_victory_points, target_victory_points, enemy_victory_points, target_victory_points]


func _finish_match(player_won: bool) -> void:
	_match_over = true
	if is_instance_valid(_result_backdrop):
		_result_backdrop.visible = true
	if is_instance_valid(result_panel):
		result_panel.visible = true
		result_panel.move_to_front()
	if is_instance_valid(_restart_button):
		_restart_button.visible = true
		_restart_button.grab_focus()
	if is_instance_valid(result_label):
		result_label.text = "GYŐZELEM" if player_won else "VERESÉG"
		result_label.modulate = Color(0.35, 0.85, 1.0) if player_won else Color(1.0, 0.28, 0.20)
	get_tree().paused = true


func _build_result_overlay() -> void:
	var hud := get_node_or_null("../HUD")
	if not is_instance_valid(hud):
		return
	_result_backdrop = ColorRect.new()
	_result_backdrop.name = "ResultBackdrop"
	_result_backdrop.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_result_backdrop.color = Color(0.015, 0.025, 0.02, 0.78)
	_result_backdrop.mouse_filter = Control.MOUSE_FILTER_STOP
	_result_backdrop.process_mode = Node.PROCESS_MODE_ALWAYS
	_result_backdrop.z_index = 99
	_result_backdrop.visible = false
	hud.add_child(_result_backdrop)
	hud.move_child(_result_backdrop, maxi(0, hud.get_child_count() - 2))

	_restart_button = Button.new()
	_restart_button.name = "RestartMatch"
	_restart_button.text = "ÚJ MÉRKŐZÉS"
	_restart_button.custom_minimum_size = Vector2(240.0, 52.0)
	_restart_button.set_anchors_preset(Control.PRESET_CENTER)
	_restart_button.position = Vector2(-120.0, 72.0)
	_restart_button.process_mode = Node.PROCESS_MODE_ALWAYS
	_restart_button.visible = false
	_restart_button.pressed.connect(_restart_match)
	hud.add_child(_restart_button)
	if is_instance_valid(result_panel):
		result_panel.process_mode = Node.PROCESS_MODE_ALWAYS
		result_panel.z_index = 100
	_restart_button.z_index = 101


func _restart_match() -> void:
	get_tree().paused = false
	get_tree().reload_current_scene()
