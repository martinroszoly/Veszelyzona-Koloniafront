extends SceneTree
func _initialize():call_deferred("run")
func find_kind(node,kind):
 if node.is_class(kind):return node
 for child in node.get_children():
  var found=find_kind(child,kind)
  if found:return found
 return null
func write_bytes(path,data):
 var f=FileAccess.open(path,FileAccess.WRITE);f.store_buffer(data);f.close()
func run():
 var directory="res://../Reports/floor_samples/"
 DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(directory))
 var manifest={}
 for unit in ["infantry","brute"]:
  var model=load("res://assets/mordra_"+unit+".glb").instantiate();root.add_child(model)
  var sk=find_kind(model,"Skeleton3D");var mesh=find_kind(model,"MeshInstance3D");var player=find_kind(model,"AnimationPlayer");player.callback_mode_process=AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
  var meta=JSON.parse_string(FileAccess.get_file_as_string("res://assets/"+unit+"_meta.json"));manifest[unit]={"clips":{},"binds":mesh.skin.get_bind_count()}
  var arrays=mesh.mesh.surface_get_arrays(0)
  write_bytes(directory+unit+"_vertices.bin",arrays[Mesh.ARRAY_VERTEX].to_byte_array())
  write_bytes(directory+unit+"_bones.bin",arrays[Mesh.ARRAY_BONES].to_byte_array())
  write_bytes(directory+unit+"_weights.bin",arrays[Mesh.ARRAY_WEIGHTS].to_byte_array())
  var ids=[]
  for b in range(mesh.skin.get_bind_count()):
   var name=mesh.skin.get_bind_name(b);ids.append(sk.find_bone(name) if name!="" else mesh.skin.get_bind_bone(b))
  for name in meta.animations:
   player.play(name,0.0);player.advance(0.0)
   var samples=PackedFloat32Array();var frames=int(round(meta.animations[name].seconds*60.0))+1
   for frame in range(frames):
    player.seek(min(frame/60.0,meta.animations[name].seconds-0.000001),true);player.advance(0.0)
    for b in range(mesh.skin.get_bind_count()):
     var tf=sk.global_transform*sk.get_bone_global_pose(ids[b])*mesh.skin.get_bind_pose(b)
     for row in range(3):
      samples.append(tf.basis.x[row]);samples.append(tf.basis.y[row]);samples.append(tf.basis.z[row]);samples.append(tf.origin[row])
   write_bytes(directory+unit+"_"+name+".bin",samples.to_byte_array());manifest[unit].clips[name]=frames
   print("FLOOR POSES ",unit," ",name," ",frames)
  root.remove_child(model);model.queue_free()
 var file=FileAccess.open(directory+"manifest.json",FileAccess.WRITE);file.store_string(JSON.stringify(manifest,"  "));file.close();quit()
