extends SceneTree

func _init() -> void:
	for path in ["res://assets/models/xenon_vehicle_source.glb"]:
		print("MODEL: ", path)
		var packed = load(path) as PackedScene
		if packed == null:
			print("  LOAD FAILED")
			continue
		var root = packed.instantiate()
		_inspect(root)
		root.queue_free()
	quit()


func _inspect(node: Node) -> void:
	if node is AnimationPlayer:
		var player := node as AnimationPlayer
		print("  ANIMS: ", player.get_animation_list())
	if node is Skeleton3D:
		var skeleton := node as Skeleton3D
		var bones: Array[String] = []
		for index in range(skeleton.get_bone_count()):
			bones.append(skeleton.get_bone_name(index))
		print("  BONES: ", bones)
	if node is MeshInstance3D:
		var mesh_node := node as MeshInstance3D
		print("  MESH: ", node.name, " surfaces=", mesh_node.mesh.get_surface_count() if mesh_node.mesh else 0)
	for child in node.get_children():
		_inspect(child)
