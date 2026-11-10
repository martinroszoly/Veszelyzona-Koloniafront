class_name MoveCommandMarker
extends Node3D

@export var lifetime: float = 0.75

var _age := 0.0
var _ring_material: StandardMaterial3D


func _ready() -> void:
	var ring := MeshInstance3D.new()
	var mesh := TorusMesh.new()
	mesh.inner_radius = 0.75
	mesh.outer_radius = 1.02
	mesh.rings = 12
	mesh.ring_segments = 32
	ring.mesh = mesh
	_ring_material = StandardMaterial3D.new()
	_ring_material.albedo_color = Color(0.18, 0.85, 1.0, 0.95)
	_ring_material.emission_enabled = true
	_ring_material.emission = Color(0.12, 0.65, 1.0)
	_ring_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_ring_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	ring.material_override = _ring_material
	add_child(ring)
	scale = Vector3.ONE * 0.45


func _process(delta: float) -> void:
	_age += delta
	var ratio := clampf(_age / lifetime, 0.0, 1.0)
	scale = Vector3.ONE * lerpf(0.45, 1.35, ratio)
	_ring_material.albedo_color.a = 1.0 - ratio
	if _age >= lifetime:
		queue_free()
