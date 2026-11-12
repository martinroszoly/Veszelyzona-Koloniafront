extends SceneTree
var report={}
var previous_contacts={}
var max_contact_drift=0.0
func measure_contacts(actor):
 var frame=int(round(actor.player.current_animation_position*60.0))
 for leg in actor.meta.legs:
  var flags=actor.meta.contacts_60fps[actor.clip][leg.id]
  var contact=flags[clampi(frame,0,flags.size()-1)] and actor.state!="settle"
  var current=actor.plant.measured.get(leg.id,Transform3D.IDENTITY).origin
  if contact and previous_contacts.has(leg.id):max_contact_drift=max(max_contact_drift,current.distance_to(previous_contacts[leg.id]))
  if contact:previous_contacts[leg.id]=current
  else:previous_contacts.erase(leg.id)
func _initialize():call_deferred("run")
func run():
 for unit in ["infantry","brute"]:
  var actor=load("res://scripts/mordra_controller.gd").new();root.add_child(actor);actor.setup(unit);actor.set_physics_process(false)
  var results=[]
  for angle in [20.0,-45.0,90.0,180.0]:
   actor.rotation=Vector3.ZERO;actor.position=Vector3.ZERO;actor.state="idle";actor.preview=false;actor.plant.locks.clear();actor.play("idle");actor.request_turn(deg_to_rad(angle))
   var steps=0
   while steps<2000:
    actor._physics_process(1.0/60.0)
    await process_frame
    steps+=1
    if actor.state=="idle":break
   var error=abs(wrapf(actor.rotation.y-deg_to_rad(angle),-PI,PI))
   results.append({"requested_degrees":angle,"result_degrees":rad_to_deg(actor.rotation.y),"error_degrees":rad_to_deg(error),"completed":steps<2000,"root_position":str(actor.position)})
   print("CONTROLLER ",unit," turn ",angle," error ",rad_to_deg(error)," state ",actor.state)
  actor.rotation=Vector3.ZERO;actor.state="idle";actor.plant.locks.clear();actor.play("idle");actor.move_toward_direction(Vector3.FORWARD,actor.meta.gaits.walk.speed)
  previous_contacts.clear();max_contact_drift=0.0;actor.plant.max_reach_violation=0.0
  actor.plant.modification_processed.connect(func():measure_contacts(actor))
  for i in range(180):
   if i==60:actor.face_direction(Basis(Vector3.UP,deg_to_rad(20))*Vector3.FORWARD)
   actor._physics_process(1.0/60.0);await process_frame
  results.append({"small_steering_state":actor.state,"heading_degrees":rad_to_deg(actor.rotation.y),"distance_m":actor.position.length(),"planted_frame_drift_m":max_contact_drift,"reach_violation_m":actor.plant.max_reach_violation})
  actor.attack("attack_bite" if unit=="brute" else "attack_tentacle_double",Basis(Vector3.UP,deg_to_rad(-65))*(-actor.global_basis.z))
  var steps=0;var attack_heading=999.0;var heading_drift=0.0
  while steps<2500:
   actor._physics_process(1.0/60.0);await process_frame;steps+=1
   if actor.state=="attack":
    if attack_heading==999.0:attack_heading=actor.rotation.y
    heading_drift=max(heading_drift,abs(actor.rotation.y-attack_heading))
   if actor.state=="idle":break
  results.append({"attack_completed":steps<2500,"attack_heading_drift_degrees":rad_to_deg(heading_drift)})
  report[unit]=results
  root.remove_child(actor);actor.queue_free()
 var f=FileAccess.open("res://../Reports/Godot_4.7_controller.json",FileAccess.WRITE);f.store_string(JSON.stringify(report,"  "));f.close();quit()
