extends SceneTree
func _initialize():call_deferred("run")
func run():
 var report={}
 for unit in ["infantry","brute"]:
  var actor=load("res://scripts/mordra_controller.gd").new();root.add_child(actor);actor.setup(unit);actor.set_physics_process(false)
  await process_frame
  report[unit]=[]
  for angle in [20.0,-45.0,90.0,180.0]:
   actor.plant.max_reach_violation=0.0
   actor.request_turn(deg_to_rad(angle))
   var count=0
   while count<2000:
    actor._physics_process(1.0/60.0);await process_frame;count+=1
    if actor.state=="idle":break
   report[unit].append({"turn_degrees":angle,"max_reach_violation_m":actor.plant.max_reach_violation,"completed":count<2000})
   print("REACH ",unit," ",angle," ",actor.plant.max_reach_violation)
  root.remove_child(actor);actor.queue_free()
 var f=FileAccess.open("res://../Reports/Godot_4.7_turn_reach.json",FileAccess.WRITE);f.store_string(JSON.stringify(report,"  "));f.close();quit()
