extends Node3D

## Ideiglenes, saját készítésű terep a projekt első indíthatósági mérföldkövéhez.
## Nem tartalmaz még játékmechanikát; a következő teszt után bővíthető a PDF alapján.

const MAP_SIZE := Vector2(190.0, 150.0)
const TREE_GROUPS := [
	{"center": Vector2(-62, -35), "size": Vector2(42, 48), "count": 44},
	{"center": Vector2(57, 35), "size": Vector2(48, 44), "count": 52},
	{"center": Vector2(-64, 48), "size": Vector2(28, 24), "count": 22},
	{"center": Vector2(63, -48), "size": Vector2(31, 25), "count": 25},
]

var _rng := RandomNumberGenerator.new()

func _ready() -> void:
	_rng.seed = 4702
	_build_ground()
	_build_road_network()
	_build_forests()
	_build_rocks()
	_build_grass_patches()

func _build_ground() -> void:
	var ground := MeshInstance3D.new()
	ground.name = "NaturalGround"
	var plane := PlaneMesh.new()
	plane.size = MAP_SIZE
	plane.subdivide_width = 100
	plane.subdivide_depth = 80
	ground.mesh = plane
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.26, 0.34, 0.23)
	material.roughness = 1.0
	ground.material_override = material
	add_child(ground)

	var edge := BoxMesh.new()
	edge.size = Vector3(MAP_SIZE.x, 0.6, MAP_SIZE.y)
	var edge_mesh := MeshInstance3D.new()
	edge_mesh.name = "TerrainEdge"
	edge_mesh.mesh = edge
	edge_mesh.position.y = -0.55
	var earth := StandardMaterial3D.new()
	earth.albedo_color = Color(0.19, 0.18, 0.14)
	earth.roughness = 1.0
	edge_mesh.material_override = earth
	add_child(edge_mesh)

func _build_road_network() -> void:
	_add_road(Vector3(0, 0.035, 0), Vector2(7.0, MAP_SIZE.y * 0.78), 0.0)
	_add_road(Vector3(0, 0.04, 4), Vector2(MAP_SIZE.x * 0.72, 5.0), 0.08)
	_add_road(Vector3(-37, 0.045, -31), Vector2(42.0, 4.0), -0.52)
	_add_road(Vector3(38, 0.045, 31), Vector2(40.0, 4.0), -0.50)

func _add_road(center: Vector3, size: Vector2, yaw: float) -> void:
	var road := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = Vector3(size.x, 0.12, size.y)
	road.mesh = mesh
	road.position = center
	road.rotation.y = yaw
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.37, 0.34, 0.27)
	material.roughness = 1.0
	road.material_override = material
	add_child(road)
	for side in [-1.0, 1.0]:
		var shoulder := MeshInstance3D.new()
		var shoulder_mesh := BoxMesh.new()
		shoulder_mesh.size = Vector3(size.x, 0.08, 0.65)
		shoulder.mesh = shoulder_mesh
		shoulder.position = center + Vector3(0, 0.01, side * (size.y * 0.5 + 0.4)).rotated(Vector3.UP, yaw)
		shoulder.rotation.y = yaw
		var shoulder_material := StandardMaterial3D.new()
		shoulder_material.albedo_color = Color(0.48, 0.43, 0.33)
		shoulder_material.roughness = 1.0
		shoulder.material_override = shoulder_material
		add_child(shoulder)

func _build_forests() -> void:
	for group in TREE_GROUPS:
		for index in range(group.count):
			var x: float = group.center.x + _rng.randf_range(-group.size.x * 0.5, group.size.x * 0.5)
			var z: float = group.center.y + _rng.randf_range(-group.size.y * 0.5, group.size.y * 0.5)
			if _is_near_road(Vector2(x, z)):
				continue
			_add_tree(Vector3(x, 0.0, z), _rng.randf_range(0.82, 1.28))

func _add_tree(at: Vector3, scale_factor: float) -> void:
	var tree := Node3D.new()
	tree.position = at
	tree.scale = Vector3.ONE * scale_factor
	add_child(tree)

	var trunk := MeshInstance3D.new()
	var trunk_mesh := CylinderMesh.new()
	trunk_mesh.top_radius = 0.22
	trunk_mesh.bottom_radius = 0.38
	trunk_mesh.height = 4.2
	trunk.mesh = trunk_mesh
	trunk.position.y = 2.1
	var bark := StandardMaterial3D.new()
	bark.albedo_color = Color(0.25, 0.19, 0.13)
	bark.roughness = 1.0
	trunk.material_override = bark
	tree.add_child(trunk)

	var crown := MeshInstance3D.new()
	var crown_mesh := SphereMesh.new()
	crown_mesh.radius = 2.0
	crown_mesh.height = 4.6
	crown.mesh = crown_mesh
	crown.position.y = 4.8
	var leaves := StandardMaterial3D.new()
	leaves.albedo_color = Color(_rng.randf_range(0.12, 0.22), _rng.randf_range(0.25, 0.36), _rng.randf_range(0.14, 0.22))
	leaves.roughness = 1.0
	crown.material_override = leaves
	tree.add_child(crown)

func _build_rocks() -> void:
	for index in range(48):
		var x := _rng.randf_range(-MAP_SIZE.x * 0.46, MAP_SIZE.x * 0.46)
		var z := _rng.randf_range(-MAP_SIZE.y * 0.46, MAP_SIZE.y * 0.46)
		if _is_near_road(Vector2(x, z)) or _is_in_forest(Vector2(x, z)):
			continue
		var rock := MeshInstance3D.new()
		var mesh := SphereMesh.new()
		mesh.radius = _rng.randf_range(0.6, 1.6)
		mesh.height = mesh.radius * _rng.randf_range(0.65, 1.0)
		rock.mesh = mesh
		rock.position = Vector3(x, mesh.height * 0.35, z)
		rock.rotation = Vector3(_rng.randf_range(-0.2, 0.2), _rng.randf_range(0, TAU), _rng.randf_range(-0.2, 0.2))
		var material := StandardMaterial3D.new()
		material.albedo_color = Color(0.34, 0.36, 0.32)
		material.roughness = 1.0
		rock.material_override = material
		add_child(rock)

func _build_grass_patches() -> void:
	for index in range(65):
		var x := _rng.randf_range(-MAP_SIZE.x * 0.46, MAP_SIZE.x * 0.46)
		var z := _rng.randf_range(-MAP_SIZE.y * 0.46, MAP_SIZE.y * 0.46)
		if _is_near_road(Vector2(x, z)) or _is_in_forest(Vector2(x, z)):
			continue
		var patch := MeshInstance3D.new()
		var mesh := CylinderMesh.new()
		mesh.top_radius = _rng.randf_range(1.4, 3.2)
		mesh.bottom_radius = mesh.top_radius
		mesh.height = 0.025
		patch.mesh = mesh
		patch.position = Vector3(x, 0.015, z)
		var material := StandardMaterial3D.new()
		material.albedo_color = Color(0.31, 0.38, 0.25, 0.65)
		material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		material.roughness = 1.0
		patch.material_override = material
		add_child(patch)

func _is_near_road(point: Vector2) -> bool:
	if absf(point.x) < 5.5 or absf(point.y - 4.0) < 4.0:
		return true
	if point.distance_to(Vector2(-37, -31)) < 5.0 or point.distance_to(Vector2(38, 31)) < 5.0:
		return true
	return false

func _is_in_forest(point: Vector2) -> bool:
	for group in TREE_GROUPS:
		if absf(point.x - group.center.x) < group.size.x * 0.5 and absf(point.y - group.center.y) < group.size.y * 0.5:
			return true
	return false
