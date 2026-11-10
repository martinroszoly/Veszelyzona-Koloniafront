extends Node3D

## Földhöz kötött RTS-kamera: pályahatár, képernyőszéli görgetés és állandó dőlés.
@export var pan_speed: float = 30.0
@export var fast_pan_multiplier: float = 2.0
@export var pan_smoothing: float = 10.0
@export var rotate_sensitivity: float = 0.006
@export var zoom_smoothing: float = 10.0
@export var min_zoom: float = 0.72
@export var max_zoom: float = 1.42
@export var edge_scroll_enabled: bool = true
@export var edge_scroll_margin: float = 18.0
@export var map_limit_x: float = 86.0
@export var map_limit_z: float = 66.0

@onready var camera: Camera3D = $Camera3D

var _dragging_to_rotate := false
var _zoom := 1.0
var _zoom_target := 1.0
var _pan_velocity := Vector3.ZERO

const CAMERA_BASE_OFFSET := Vector3(0.0, 34.0, 42.0)

func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	global_position.y = 0.0
	_apply_zoom()

func _process(delta: float) -> void:
	var move := _keyboard_pan_input() + _edge_pan_input()
	if move.length_squared() > 1.0:
		move = move.normalized()

	var target_velocity := Vector3.ZERO
	if move.length_squared() > 0.0:
		var forward := -global_basis.z
		forward.y = 0.0
		forward = forward.normalized()
		var right := global_basis.x
		right.y = 0.0
		right = right.normalized()
		var speed := pan_speed
		if Input.is_key_pressed(KEY_SHIFT):
			speed *= fast_pan_multiplier
		target_velocity = (right * move.x + forward * -move.y) * speed

	_pan_velocity = _pan_velocity.lerp(target_velocity, 1.0 - exp(-pan_smoothing * delta))
	global_position += _pan_velocity * delta
	global_position.x = clampf(global_position.x, -map_limit_x, map_limit_x)
	global_position.y = 0.0
	global_position.z = clampf(global_position.z, -map_limit_z, map_limit_z)

	_zoom = lerpf(_zoom, _zoom_target, 1.0 - exp(-zoom_smoothing * delta))
	_apply_zoom()


func _keyboard_pan_input() -> Vector2:
	var move := Vector2.ZERO
	if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
		move.y -= 1.0
	if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
		move.y += 1.0
	if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
		move.x -= 1.0
	if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
		move.x += 1.0
	return move


func _edge_pan_input() -> Vector2:
	if not edge_scroll_enabled or _dragging_to_rotate:
		return Vector2.ZERO
	var viewport_size := get_viewport().get_visible_rect().size
	var mouse_position := get_viewport().get_mouse_position()
	if mouse_position.x < 0.0 or mouse_position.y < 0.0 or mouse_position.x > viewport_size.x or mouse_position.y > viewport_size.y:
		return Vector2.ZERO
	var move := Vector2.ZERO
	if mouse_position.x <= edge_scroll_margin:
		move.x -= 1.0
	elif mouse_position.x >= viewport_size.x - edge_scroll_margin:
		move.x += 1.0
	if mouse_position.y <= edge_scroll_margin:
		move.y -= 1.0
	elif mouse_position.y >= viewport_size.y - edge_scroll_margin:
		move.y += 1.0
	return move

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_MIDDLE:
			_dragging_to_rotate = event.pressed
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_UP:
			_zoom_target = maxf(min_zoom, _zoom_target - 0.08)
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			_zoom_target = minf(max_zoom, _zoom_target + 0.08)
	elif event is InputEventMouseMotion and _dragging_to_rotate:
		rotation.y -= event.relative.x * rotate_sensitivity

func _apply_zoom() -> void:
	if is_instance_valid(camera):
		camera.position = CAMERA_BASE_OFFSET * _zoom
