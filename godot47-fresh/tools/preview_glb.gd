extends SceneTree

func _init() -> void:
	var root := Node3D.new()
	root.name = "Preview"
	get_root().add_child(root)
	var packed := load("res://assets/models/xenon_vehicle_source.glb") as PackedScene
	if packed == null:
		push_error("GLB load failed")
		quit()
		return
	var model := packed.instantiate()
	root.add_child(model)
	var camera := Camera3D.new()
	camera.position = Vector3(0, 2.5, 8)
	camera.look_at_from_position(camera.position, Vector3.ZERO)
	root.add_child(camera)
	var light := DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-35, -25, 0)
	light.light_energy = 2.0
	root.add_child(light)
	var env := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color(0.04, 0.04, 0.06)
	env.environment = environment
	root.add_child(env)
	var viewport := SubViewport.new()
	viewport.size = Vector2i(1280, 720)
	viewport.transparent_bg = false
	viewport.render_target_update_mode = SubViewport.UPDATE_ONCE
	viewport.add_child(camera)
	root.remove_child(camera)
	get_root().add_child(viewport)
	await process_frame
	await process_frame
	var image := viewport.get_texture().get_image()
	image.save_png("user://xenon_vehicle_preview.png")
	print("PREVIEW: ", ProjectSettings.globalize_path("user://xenon_vehicle_preview.png"))
	quit()
