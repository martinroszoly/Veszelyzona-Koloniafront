class_name FacingCommandPreview
extends Node3D

var _arrow_root: Node3D


func _ready() -> void:
	_build_ring()
	_build_arrow()


func set_facing_direction(direction: Vector3) -> void:
	direction.y = 0.0
	if direction.length_squared() < 0.01:
		_arrow_root.visible = false
		return
	_arrow_root.visible = true
	look_at(global_position + direction.normalized(), Vector3.UP)


func _build_ring() -> void:
	var ring := MeshInstance3D.new()
	var mesh := TorusMesh.new()
	mesh.inner_radius = 0.72
	mesh.outer_radius = 0.98
	mesh.rings = 12
	mesh.ring_segments = 32
	ring.mesh = mesh
	ring.material_override = _make_material(Color(0.18, 0.85, 1.0, 0.72))
	add_child(ring)


func _build_arrow() -> void:
	_arrow_root = Node3D.new()
	add_child(_arrow_root)

	var shaft := MeshInstance3D.new()
	var shaft_mesh := BoxMesh.new()
	shaft_mesh.size = Vector3(0.22, 0.10, 2.2)
	shaft.mesh = shaft_mesh
	shaft.position = Vector3(0.0, 0.06, -1.25)
	shaft.material_override = _make_material(Color(0.25, 0.92, 1.0, 0.92))
	_arrow_root.add_child(shaft)

	var head := MeshInstance3D.new()
	var head_mesh := CylinderMesh.new()
	head_mesh.top_radius = 0.0
	head_mesh.bottom_radius = 0.52
	head_mesh.height = 0.95
	head.mesh = head_mesh
	head.position = Vector3(0.0, 0.08, -2.65)
	head.rotation.x = PI * 0.5
	head.material_override = _make_material(Color(0.25, 0.92, 1.0, 0.95))
	_arrow_root.add_child(head)
	_arrow_root.visible = false


func _make_material(color: Color) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.emission_enabled = true
	material.emission = Color(color.r, color.g, color.b) * 0.65
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	return material
