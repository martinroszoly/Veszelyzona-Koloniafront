class_name CapturePoint
extends Area3D

signal ownership_changed(point: CapturePoint, old_owner: int, new_owner: int)

@export var point_id: String = "A"
@export var capture_seconds: float = 6.0
@export var capture_radius: float = 5.5
@export var gas_income_per_second: float = 2.0

var owner_team_id: int = -1
var _capturing_team_id: int = -1
var _capture_progress: float = 0.0
var _ring: MeshInstance3D
var _center_disc: MeshInstance3D
var _label: Label3D

const NEUTRAL_COLOR := Color(0.72, 0.72, 0.62)
const PLAYER_COLOR := Color(0.15, 0.55, 1.0)
const ENEMY_COLOR := Color(0.90, 0.18, 0.12)


func _ready() -> void:
	collision_layer = 4
	collision_mask = 2
	monitoring = true
	monitorable = true
	_build_visuals()
	_update_visuals()


func _physics_process(delta: float) -> void:
	var present_teams := _get_present_teams()
	if present_teams.size() != 1:
		if present_teams.is_empty() and owner_team_id == -1:
			_capture_progress = maxf(0.0, _capture_progress - delta * 0.35)
		_update_visuals()
		return

	var active_team: int = present_teams[0]
	if active_team == owner_team_id:
		_capturing_team_id = -1
		_capture_progress = 0.0
		_update_visuals()
		return

	if active_team != _capturing_team_id:
		_capturing_team_id = active_team
		_capture_progress = 0.0

	_capture_progress += delta
	if _capture_progress >= capture_seconds:
		var old_owner := owner_team_id
		owner_team_id = _capturing_team_id
		_capturing_team_id = -1
		_capture_progress = 0.0
		ownership_changed.emit(self, old_owner, owner_team_id)
	_update_visuals()


func get_capture_ratio() -> float:
	return clampf(_capture_progress / capture_seconds, 0.0, 1.0)


func _get_present_teams() -> Array[int]:
	var teams: Array[int] = []
	for body in get_overlapping_bodies():
		var unit := body as RTSUnit
		if unit != null and not teams.has(unit.team_id):
			teams.append(unit.team_id)
	return teams


func _build_visuals() -> void:
	var collision := CollisionShape3D.new()
	var shape := CylinderShape3D.new()
	shape.radius = capture_radius
	shape.height = 3.0
	collision.shape = shape
	collision.position.y = 1.0
	add_child(collision)

	_ring = MeshInstance3D.new()
	var ring_mesh := TorusMesh.new()
	ring_mesh.inner_radius = capture_radius - 0.22
	ring_mesh.outer_radius = capture_radius
	ring_mesh.rings = 16
	ring_mesh.ring_segments = 48
	_ring.mesh = ring_mesh
	_ring.position.y = 0.10
	add_child(_ring)

	_center_disc = MeshInstance3D.new()
	var disc_mesh := CylinderMesh.new()
	disc_mesh.top_radius = 0.95
	disc_mesh.bottom_radius = 0.95
	disc_mesh.height = 0.10
	_center_disc.mesh = disc_mesh
	_center_disc.position.y = 0.08
	add_child(_center_disc)

	var mast := MeshInstance3D.new()
	var mast_mesh := CylinderMesh.new()
	mast_mesh.top_radius = 0.08
	mast_mesh.bottom_radius = 0.10
	mast_mesh.height = 3.2
	mast.mesh = mast_mesh
	mast.position.y = 1.65
	var mast_material := StandardMaterial3D.new()
	mast_material.albedo_color = Color(0.24, 0.25, 0.23)
	mast_material.roughness = 0.8
	mast.material_override = mast_material
	add_child(mast)

	_label = Label3D.new()
	_label.position = Vector3(0.0, 4.0, 0.0)
	_label.font_size = 42
	_label.outline_size = 8
	_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_label.no_depth_test = true
	add_child(_label)


func _update_visuals() -> void:
	if not is_instance_valid(_ring):
		return
	var owner_color := _team_color(owner_team_id)
	var active_color := _team_color(_capturing_team_id) if _capturing_team_id >= 0 else owner_color
	var ratio := get_capture_ratio()
	var display_color := owner_color.lerp(active_color, ratio)

	var ring_material := StandardMaterial3D.new()
	ring_material.albedo_color = display_color
	ring_material.emission_enabled = true
	ring_material.emission = display_color * 0.55
	ring_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_ring.material_override = ring_material

	var disc_material := StandardMaterial3D.new()
	disc_material.albedo_color = display_color.darkened(0.25)
	disc_material.roughness = 0.85
	_center_disc.material_override = disc_material

	var state_text := "SEMLEGES"
	if owner_team_id == 0:
		state_text = "EMBER"
	elif owner_team_id > 0:
		state_text = "ELLENSÉG"
	if _capturing_team_id >= 0:
		state_text = "FOGLALÁS %d%%" % roundi(ratio * 100.0)
	_label.text = "%s PONT  +%.0f GÁZ/mp\n%s" % [point_id, gas_income_per_second, state_text]
	_label.modulate = display_color.lightened(0.25)


func _team_color(team_id: int) -> Color:
	if team_id == 0:
		return PLAYER_COLOR
	if team_id > 0:
		return ENEMY_COLOR
	return NEUTRAL_COLOR
