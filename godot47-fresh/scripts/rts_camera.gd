extends Node3D

## Korai RTS-kamera: szabad pásztázás, teljes yaw forgatás, állandó dőlésszög.
@export var pan_speed: float = 34.0
@export var fast_pan_multiplier: float = 2.0
@export var rotate_sensitivity: float = 0.006
@export var zoom_step: float = 4.0
@export var min_zoom: float = 0.65
@export var max_zoom: float = 1.65

@onready var camera: Camera3D = $Camera3D

var _dragging_to_rotate := false
var _zoom := 1.0

func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	_apply_zoom()

func _process(delta: float) -> void:
	var move := Vector2.ZERO
	if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
		move.y -= 1.0
	if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
		move.y += 1.0
	if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
		move.x -= 1.0
	if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
		move.x += 1.0
	if move.length_squared() > 0.0:
		move = move.normalized()
		var forward := -global_basis.z
		forward.y = 0.0
		forward = forward.normalized()
		var right := global_basis.x
		right.y = 0.0
		right = right.normalized()
		var speed := pan_speed
		if Input.is_key_pressed(KEY_SHIFT):
			speed *= fast_pan_multiplier
		global_position += (right * move.x + forward * -move.y) * speed * delta

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_MIDDLE:
			_dragging_to_rotate = event.pressed
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_UP:
			_zoom = maxf(min_zoom, _zoom - 0.08)
			_apply_zoom()
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			_zoom = minf(max_zoom, _zoom + 0.08)
			_apply_zoom()
	elif event is InputEventMouseMotion and _dragging_to_rotate:
		rotation.y -= event.relative.x * rotate_sensitivity

func _apply_zoom() -> void:
	if is_instance_valid(camera):
		camera.position = Vector3(0.0, 38.0, 45.0) * _zoom
