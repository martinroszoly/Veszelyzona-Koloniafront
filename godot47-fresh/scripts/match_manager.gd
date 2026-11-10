class_name MatchManager
extends Node

@export var starting_victory_points: int = 250
@export var tick_interval: float = 1.0

var player_victory_points: int
var enemy_victory_points: int
var _tick_timer := 1.0
var _match_over := false

@onready var victory_status: Label = get_node_or_null("../HUD/MatchPanel/Margin/VictoryStatus")
@onready var result_panel: PanelContainer = get_node_or_null("../HUD/ResultPanel")
@onready var result_label: Label = get_node_or_null("../HUD/ResultPanel/Margin/ResultLabel")


func _ready() -> void:
	player_victory_points = starting_victory_points
	enemy_victory_points = starting_victory_points
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
	for point in get_tree().get_nodes_in_group("capture_points"):
		if point.owner_team_id == 0:
			player_points += 1
		elif point.owner_team_id == 1:
			enemy_points += 1
	if player_points > enemy_points:
		enemy_victory_points = maxi(0, enemy_victory_points - (player_points - enemy_points))
	elif enemy_points > player_points:
		player_victory_points = maxi(0, player_victory_points - (enemy_points - player_points))
	_update_hud()
	if player_victory_points <= 0:
		_finish_match(false)
	elif enemy_victory_points <= 0:
		_finish_match(true)


func _update_hud() -> void:
	if is_instance_valid(victory_status):
		victory_status.text = "EMBER  %03d     GYŐZELMI PONT     %03d  ELLENSÉG" % [player_victory_points, enemy_victory_points]


func _finish_match(player_won: bool) -> void:
	_match_over = true
	if is_instance_valid(result_panel):
		result_panel.visible = true
	if is_instance_valid(result_label):
		result_label.text = "GYŐZELEM" if player_won else "VERESÉG"
		result_label.modulate = Color(0.35, 0.85, 1.0) if player_won else Color(1.0, 0.28, 0.20)
