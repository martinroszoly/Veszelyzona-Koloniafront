class_name UnitProjectile
extends Node3D

@export var speed: float = 38.0
@export var hit_distance: float = 0.45
@export var maximum_lifetime: float = 3.0

var target = null
var damage: float = 0.0
var attacker_position := Vector3.ZERO
var team_id: int = 0
var _age := 0.0


func initialize(projectile_target, projectile_damage: float, source_position: Vector3, source_team_id: int) -> void:
	target = projectile_target
	damage = projectile_damage
	attacker_position = source_position
	team_id = source_team_id


func _ready() -> void:
	var tracer := MeshInstance3D.new()
	var mesh := SphereMesh.new()
	mesh.radius = 0.11
	mesh.height = 0.42
	tracer.mesh = mesh
	var material := StandardMaterial3D.new()
	var projectile_color := Color(0.30, 0.78, 1.0) if team_id == 0 else Color(1.0, 0.26, 0.14)
	material.albedo_color = projectile_color
	material.emission_enabled = true
	material.emission = projectile_color * 2.2
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	tracer.material_override = material
	add_child(tracer)

	var light := OmniLight3D.new()
	light.light_color = projectile_color
	light.light_energy = 1.4
	light.omni_range = 2.0
	light.shadow_enabled = false
	add_child(light)


func _process(delta: float) -> void:
	_age += delta
	if _age >= maximum_lifetime or not is_instance_valid(target):
		queue_free()
		return
	var target_position: Vector3 = target.global_position + Vector3.UP * 1.15
	var offset := target_position - global_position
	if offset.length() <= hit_distance:
		target.take_damage(damage, attacker_position)
		queue_free()
		return
	var direction := offset.normalized()
	global_position += direction * minf(speed * delta, offset.length())
	look_at(global_position + direction, Vector3.UP)
