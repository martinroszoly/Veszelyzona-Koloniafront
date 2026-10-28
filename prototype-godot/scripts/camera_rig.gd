extends Node3D
class_name RTSFreeCamera

@export var move_speed := 48.0
@export var fast_move_multiplier := 2.0
@export var zoom_step := 7.0
@export var min_distance := 24.0
@export var max_distance := 105.0
@export var min_pitch := 28.0
@export var max_pitch := 72.0

@onready var camera: Camera3D = $Camera3D

var distance := 72.0
var pitch_degrees := 53.0
var dragging_orbit := false


func _ready() -> void:
	position = Vector3(0.0, 0.0, 0.0)
	_update_camera()


func _process(delta: float) -> void:
	var input_vector := Vector2.ZERO
	input_vector.x = Input.get_action_strength("camera_right") - Input.get_action_strength("camera_left")
	input_vector.y = Input.get_action_strength("camera_down") - Input.get_action_strength("camera_up")
	if input_vector.length_squared() > 0.0:
		var speed := move_speed
		if Input.is_key_pressed(KEY_SHIFT):
			speed *= fast_move_multiplier
		var local_move := Vector3(input_vector.x, 0.0, input_vector.y).normalized() * speed * delta
		position += local_move.rotated(Vector3.UP, rotation.y)
		position.x = clampf(position.x, -126.0, 126.0)
		position.z = clampf(position.z, -88.0, 88.0)
	if Input.is_action_pressed("camera_rotate_left"):
		rotation.y += delta * 1.15
	if Input.is_action_pressed("camera_rotate_right"):
		rotation.y -= delta * 1.15
	if Input.is_action_pressed("camera_tilt_up"):
		pitch_degrees = clampf(pitch_degrees - delta * 30.0, min_pitch, max_pitch)
		_update_camera()
	if Input.is_action_pressed("camera_tilt_down"):
		pitch_degrees = clampf(pitch_degrees + delta * 30.0, min_pitch, max_pitch)
		_update_camera()


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_MIDDLE:
			dragging_orbit = event.pressed
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_UP:
			distance = maxf(min_distance, distance - zoom_step)
			_update_camera()
		elif event.pressed and event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			distance = minf(max_distance, distance + zoom_step)
			_update_camera()
	elif event is InputEventMouseMotion and dragging_orbit:
		rotation.y -= event.relative.x * 0.006
		pitch_degrees = clampf(pitch_degrees + event.relative.y * 0.22, min_pitch, max_pitch)
		_update_camera()


func _update_camera() -> void:
	if not is_instance_valid(camera):
		return
	var pitch := deg_to_rad(pitch_degrees)
	camera.position = Vector3(0.0, sin(pitch) * distance, cos(pitch) * distance)
	camera.look_at(global_position, Vector3.UP)


func focus_on(world_position: Vector3) -> void:
	position.x = clampf(world_position.x, -126.0, 126.0)
	position.z = clampf(world_position.z, -88.0, 88.0)
