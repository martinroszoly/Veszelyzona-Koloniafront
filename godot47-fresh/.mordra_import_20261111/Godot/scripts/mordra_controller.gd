class_name MordraController
extends Node3D
## Actor motion belongs here; the GLB Root bone never translates or spins.
## Stepped turn clips rotate BodyYaw and individual feet, then commit heading once.
signal impact(animation)
var unit = "infantry"
var meta = {}
var model
var skeleton
var player
var plant
var clip = ""
var state = "idle"
var turn_scale = 1.0
var target_direction = Vector3.FORWARD
var desired_speed = 0.0
var speed = 0.0
var pending_attack = ""
var remaining_turn = 0.0
var active_angle = 0.0
var finished = false
var impact_sent = false
var settle_time = 0.0
var settle_from = {}
var rest_targets = {}
var preview = false
func setup(kind):
 unit = kind
 meta = JSON.parse_string(FileAccess.get_file_as_string("res://assets/"+unit+"_meta.json"))
 model = load("res://assets/mordra_"+unit+".glb").instantiate()
 add_child(model)
 skeleton = find_kind(model,"Skeleton3D")
 player = find_kind(model,"AnimationPlayer")
 player.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
 player.animation_finished.connect(func(_name): finished=true)
 plant = load("res://scripts/foot_plant.gd").new()
 plant.controller = self
 skeleton.add_child(plant)
 for leg in meta.legs:
  rest_targets[leg.id] = skeleton.get_bone_global_rest(skeleton.find_bone(leg.target))
 play("idle")
func find_kind(node,kind):
 if node.is_class(kind): return node
 for child in node.get_children():
  var found = find_kind(child,kind)
  if found: return found
 return null
func play(name):
 clip=name
 finished=false
 impact_sent=false
 player.play(name,0.0)
 player.advance(0.0)
func face_direction(direction):
 if direction.length_squared()>0.0001:
  target_direction=Vector3(direction.x,0,direction.z).normalized()
func move_toward_direction(direction, meters_per_second):
 preview=false
 face_direction(direction)
 desired_speed=meters_per_second
func attack(name, direction):
 preview=false
 desired_speed=0
 pending_attack=name
 face_direction(direction)
 if state not in ["attack","turn","settle"]: begin_settle()
func request_turn(angle_radians):
 preview=false
 desired_speed=0
 target_direction=Basis(Vector3.UP,angle_radians)*(-global_basis.z)
 if state not in ["turn","settle","attack"]: begin_settle()
func begin_settle():
 state="settle"
 settle_time=0
 settle_from={}
 for leg in meta.legs:
  var tf=plant.measured.get(leg.id,skeleton.global_transform*skeleton.get_bone_global_pose(skeleton.find_bone(leg.foot)))
  settle_from[leg.id]=tf
  plant.locks[leg.id]=tf
 play("idle")
func begin_turn(angle):
 var sign_angle=sign(angle)
 var degrees=45 if unit=="infantry" or abs(angle)<deg_to_rad(45.01) else 90
 active_angle=sign_angle*min(abs(angle),deg_to_rad(degrees))
 turn_scale=abs(active_angle)/deg_to_rad(degrees)
 var name="turn_left" if sign_angle>0 else "turn_right"
 if unit=="brute":name+="_"+str(degrees)
 state="turn"
 plant.locks.clear()
 play(name)
 player.speed_scale=clamp(1.0/max(turn_scale,0.4),1.0,2.5)
func heading_error():
 return (-global_basis.z).signed_angle_to(target_direction,Vector3.UP)
func _physics_process(dt):
 if not player:return
 if preview:
  player.advance(dt)
  return
 if state=="settle":
  settle_time+=dt
  var step_duration=0.18 if unit=="infantry" else 0.32
  var leg_index=int(settle_time/step_duration)
  plant.forced.clear()
  for i in range(meta.legs.size()):
   var leg=meta.legs[i]
   var a=settle_from[leg.id]
   var b=skeleton.global_transform*rest_targets[leg.id]
   var tf=a
   if i<leg_index:tf=b
   elif i==leg_index:
    var u=fmod(settle_time,step_duration)/step_duration
    tf=a.interpolate_with(b,smoothstep(0.0,1.0,u))
    tf.origin.y+=(0.035 if unit=="infantry" else 0.08)*sin(PI*u)
   plant.forced[leg.id]=tf
  player.advance(dt)
  if leg_index>=meta.legs.size():
   plant.forced.clear()
   plant.locks.clear()
   var angle=heading_error()
   if abs(angle)>deg_to_rad(0.5):begin_turn(angle)
   elif pending_attack!="":
    state="attack"
    play(pending_attack)
    pending_attack=""
   else:
    state="idle"
    play("idle")
  return
 if state=="turn":
  player.advance(dt)
  if finished:
   rotate_y(active_angle)
   turn_scale=1
   plant.locks.clear()
   player.speed_scale=1
   var remaining=heading_error()
   if abs(remaining)>deg_to_rad(0.5):begin_turn(remaining)
   elif pending_attack!="":
    state="attack"
    play(pending_attack)
    pending_attack=""
   else:
    state="idle"
    play("idle")
  return
 if state=="attack":
  player.advance(dt)
  if not impact_sent and meta.impact_times.has(clip) and player.current_animation_position>=meta.impact_times[clip]:
   impact_sent=true
   impact.emit(clip)
  if finished:
   state="idle"
   play("idle")
  return
 var angle=heading_error()
 if abs(angle)>deg_to_rad(35):
  speed=move_toward(speed,0,dt*(0.9 if unit=="brute" else 4.0))
  if speed<0.005:
   begin_settle()
   return
 else:
  # Small corrections retain walking; the world-space contacts stay planted.
  rotate_y(clamp(angle,-dt*0.65,dt*0.65))
  speed=move_toward(speed,desired_speed,dt*(0.5 if unit=="brute" else 3.0))
 if speed>0.005:
  var gait="run" if unit=="infantry" and desired_speed>0.9 else "walk"
  if clip!=gait:play(gait)
  state="move"
  player.speed_scale=speed/meta.gaits[gait].speed
  global_position+=-global_basis.z*speed*dt
 else:
  if clip!="idle":
   begin_settle()
   return
  player.speed_scale=1
  state="idle"
 player.advance(dt)
func show_clip(name):
 preview=true
 state="preview"
 turn_scale=1
 player.speed_scale=1
 plant.locks.clear()
 play(name)
