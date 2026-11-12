extends SceneTree
var report={}
func _initialize():call_deferred("run")
func find_kind(node,kind):
 if node.is_class(kind):return node
 for child in node.get_children():
  var result=find_kind(child,kind)
  if result:return result
 return null
func run():
 for unit in ["infantry","brute"]:
  var instance=load("res://assets/mordra_"+unit+".glb").instantiate()
  root.add_child(instance)
  var sk=find_kind(instance,"Skeleton3D")
  var player=find_kind(instance,"AnimationPlayer")
  player.callback_mode_process=AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
  print("PLAYER_PATH ",instance.get_path_to(player)," META ",player.get_meta("import_id","none"))
  var meta=JSON.parse_string(FileAccess.get_file_as_string("res://assets/"+unit+"_meta.json"))
  var unit_report={"bones":sk.get_bone_count(),"clips":{},"materials":[]}
  for mesh in instance.find_children("*","MeshInstance3D",true,false):
   for surface in range(mesh.mesh.get_surface_count()):
    var mat=mesh.get_active_material(surface)
    unit_report.materials.append({"name":mat.resource_name,"base":mat.albedo_texture!=null,"normal":mat.normal_texture!=null,"roughness":mat.roughness_texture!=null,"metallic":mat.metallic_texture!=null})
  for name in meta.animations:
   if not player.has_animation(name):
    push_error("MISSING "+unit+" "+name)
    continue
   player.play(name,0.0);player.advance(0.0)
   var anim=player.get_animation(name)
   var previous={};var drift=0.0;var target_error=0.0;var root_drift=0.0;var loop_error=0.0
   var root_id=sk.find_bone("Root");var initial_root=sk.get_bone_global_pose(root_id)
   var first=[]
   for b in range(sk.get_bone_count()):first.append(sk.get_bone_pose(b))
   for frame in range(round(anim.length*60)+1):
    var seconds=min(frame/60.0,anim.length-0.000001)
    player.seek(seconds,true);player.advance(0.0)
    root_drift=max(root_drift,sk.get_bone_global_pose(root_id).origin.distance_to(initial_root.origin))
    for leg in meta.legs:
     var foot=sk.get_bone_global_pose(sk.find_bone(leg.foot)).origin
     var goal=sk.get_bone_global_pose(sk.find_bone(leg.target)).origin
     target_error=max(target_error,foot.distance_to(goal))
     var flags=meta.contacts_60fps[name][leg.id]
     var contact=flags[mini(frame,flags.size()-1)]
     if contact and previous.has(leg.id):
      var delta=foot-previous[leg.id]
      if meta.gaits.has(name):delta.z-=meta.gaits[name].speed/60.0
      drift=max(drift,delta.length())
     if contact:previous[leg.id]=foot
     else:previous.erase(leg.id)
   if meta.animations[name].loop:
    for b in range(sk.get_bone_count()):loop_error=max(loop_error,sk.get_bone_pose(b).origin.distance_to(first[b].origin))
   unit_report.clips[name]={"length":anim.length,"loop":anim.loop_mode!=0,"contact_frame_drift_m":drift,"target_error_m":target_error,"root_translation_m":root_drift,"loop_endpoint_position_error_m":loop_error}
   print(unit," / ",name," drift=",drift," target=",target_error)
  report[unit]=unit_report
  instance.queue_free()
 var f=FileAccess.open("res://../Reports/Godot_4.7.json",FileAccess.WRITE);f.store_string(JSON.stringify(report,"  "));f.close()
 quit()
