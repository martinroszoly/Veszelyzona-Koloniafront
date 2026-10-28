extends Node3D
class_name StrategicCapturePoint

const CAPTURE_DURATION := 17.0
const CAPTURE_RADIUS := 13.0

var game: Node
var point_id := ""
var display_name := "STRATEGIC POINT"
var point_kind := "resource"
var resource_kind := "metal"
var production_per_second := 0.0
var victory_per_second := 0.0
var owner_side := "neutral"
var progress_side := ""
var progress := 0.0
var contested := false
var supplied_player := false
var supplied_enemy := false

var owner_material: StandardMaterial3D
var fill_mesh: MeshInstance3D
var fill_material: StandardMaterial3D
var fill_fraction := 0.0


func configure(owner_game: Node, data: Dictionary) -> void:
	game = owner_game
	point_id = str(data.get("id", "point"))
	display_name = str(data.get("name", "STRATEGIC POINT"))
	point_kind = str(data.get("kind", "resource"))
	resource_kind = str(data.get("resource", "metal"))
	production_per_second = float(data.get("production", 0.0))
	victory_per_second = float(data.get("victory", 0.0))


func _ready() -> void:
	add_to_group("capture_points")
	_build_visuals()
	_update_marker_color()


func tick_capture(delta: float, player_count: int, enemy_count: int) -> void:
	contested = player_count > 0 and enemy_count > 0
	if contested:
		return
	var capturing_side := ""
	if player_count > 0:
		capturing_side = "ember"
	elif enemy_count > 0:
		capturing_side = "xenon"
	if capturing_side.is_empty():
		if owner_side == "neutral" and progress > 0.0:
			progress = maxf(0.0, progress - delta / 30.0)
			fill_fraction = progress
			_update_fill()
			if progress == 0.0:
				progress_side = ""
		return
	if capturing_side == owner_side:
		return
	if progress_side != capturing_side:
		progress_side = capturing_side
		progress = 0.0
	progress = minf(1.0, progress + delta / CAPTURE_DURATION)
	fill_fraction = progress
	_update_fill()
	if progress >= 1.0:
		var previous_owner := owner_side
		owner_side = capturing_side
		progress = 0.0
		progress_side = ""
		fill_fraction = 0.0
		_update_fill()
		_update_marker_color()
		if is_instance_valid(game):
			game.on_point_captured(self, previous_owner)


func _build_visuals() -> void:
	var stem := MeshInstance3D.new()
	var pole := CylinderMesh.new()
	pole.top_radius = 0.12
	pole.bottom_radius = 0.2
	pole.height = 7.0
	stem.mesh = pole
	stem.position.y = 3.5
	stem.material_override = _material(Color(0.63, 0.67, 0.61), 0.72)
	add_child(stem)

	var flag := MeshInstance3D.new()
	var cloth := BoxMesh.new()
	cloth.size = Vector3(3.2, 1.8, 0.15)
	flag.mesh = cloth
	flag.position = Vector3(1.55, 5.8, 0.0)
	owner_material = _material(Color(0.66, 0.68, 0.61), 0.85)
	flag.material_override = owner_material
	add_child(flag)

	var base_ring := MeshInstance3D.new()
	var ring := TorusMesh.new()
	ring.inner_radius = 4.0
	ring.outer_radius = 4.28
	base_ring.mesh = ring
	base_ring.position.y = 0.12
	base_ring.material_override = _material(Color(0.58, 0.64, 0.52), 0.88)
	add_child(base_ring)

	fill_mesh = MeshInstance3D.new()
	var fill := CylinderMesh.new()
	fill.top_radius = 3.75
	fill.bottom_radius = 3.75
	fill.height = 0.14
	fill_mesh.mesh = fill
	fill_mesh.position.y = 0.2
	fill_material = _material(Color(0.9, 0.74, 0.2, 0.8), 0.75)
	fill_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	fill_mesh.material_override = fill_material
	fill_mesh.scale = Vector3(0.02, 1.0, 0.02)
	add_child(fill_mesh)

	var beacon := MeshInstance3D.new()
	var beacon_mesh := SphereMesh.new()
	beacon_mesh.radius = 0.7
	beacon_mesh.height = 1.4
	beacon.mesh = beacon_mesh
	beacon.position.y = 8.0
	beacon.material_override = _material(Color(0.95, 0.82, 0.37), 0.35, true)
	add_child(beacon)

	var area := Area3D.new()
	area.name = "CaptureHitArea"
	area.collision_layer = 2
	area.collision_mask = 0
	area.input_ray_pickable = true
	var hit_shape := CollisionShape3D.new()
	var sphere := SphereShape3D.new()
	sphere.radius = 6.0
	hit_shape.shape = sphere
	hit_shape.position.y = 4.0
	area.add_child(hit_shape)
	add_child(area)


func _update_marker_color() -> void:
	if not is_instance_valid(owner_material):
		return
	match owner_side:
		"ember":
			owner_material.albedo_color = Color(0.15, 0.65, 1.0)
		"xenon":
			owner_material.albedo_color = Color(0.9, 0.25, 0.28)
		_:
			owner_material.albedo_color = Color(0.76, 0.76, 0.68)


func _update_fill() -> void:
	if not is_instance_valid(fill_mesh):
		return
	fill_mesh.scale.x = maxf(0.02, fill_fraction)
	fill_mesh.scale.z = maxf(0.02, fill_fraction)
	if progress_side == "ember":
		fill_material.albedo_color = Color(0.12, 0.62, 1.0, 0.82)
	elif progress_side == "xenon":
		fill_material.albedo_color = Color(1.0, 0.22, 0.23, 0.82)
	else:
		fill_material.albedo_color = Color(0.92, 0.72, 0.18, 0.72)


func _material(color: Color, roughness_value := 0.8, unshaded := false) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = roughness_value
	if color.a < 0.99:
		material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	if unshaded:
		material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	return material
