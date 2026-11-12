extends SkeletonModifier3D
## Maintains the four support contacts in world space. Swing feet follow the animated
## IK control bones. Exported FK bones remain valid without this optional modifier.
var controller
var locks = {}
var forced = {}
var last_clip = ""
var measured = {}
var max_reach_violation = 0.0
func _process_modification():
 var sk = get_skeleton()
 if not is_instance_valid(controller) or controller.clip == "": return
 var meta = controller.meta
 var clip = controller.clip
 var turn = meta.animations[clip].get("mode", "") == "turn"
 var death = clip == "death"
 if last_clip != clip:
  if death: locks.clear()
  last_clip = clip
 var factor = controller.turn_scale if turn else 1.0
 # Scale the authored heading and anticipation for arbitrary turn angles.
 if turn and abs(factor-1.0) > 0.0001:
  var yaw_id = sk.find_bone("BodyYaw")
  var tf = sk.get_bone_global_pose(yaw_id)
  var rest = sk.get_bone_global_rest(yaw_id)
  var relative = tf.basis * rest.basis.inverse()
  var heading = signed_yaw(relative)
  tf.basis = Basis(Vector3.UP, heading * (factor-1.0)) * tf.basis
  sk.set_bone_global_pose(yaw_id, tf)
  for name in meta.yaw_scale_bones:
   var id = sk.find_bone(name)
   var local = sk.get_bone_pose(id)
   var br = sk.get_bone_rest(id)
   var q = (br.basis.inverse() * local.basis).get_rotation_quaternion()
   local.basis = br.basis * Basis(Quaternion.IDENTITY.slerp(q, factor))
   local.origin = br.origin.lerp(local.origin, factor)
   sk.set_bone_pose(id, local)
 var index = int(round(controller.player.current_animation_position * 60.0))
 measured = {}
 for leg in meta.legs:
  var id = leg.id
  var target_id = sk.find_bone(leg.target)
  var target = sk.get_bone_global_pose(target_id)
  if turn and abs(factor-1.0) > 0.0001:
   var rest = sk.get_bone_global_rest(target_id)
   var heading = signed_yaw(target.basis * rest.basis.inverse())
   var delta = Basis(Vector3.UP, heading * (factor-1.0))
   target.origin = delta * target.origin
   target.origin.y = rest.origin.y + (target.origin.y-rest.origin.y) * clamp(sqrt(factor),0.35,1.0)
   target.basis = delta * target.basis
  var flags = meta.contacts_60fps[clip][id]
  var planted = flags[clampi(index, 0, flags.size()-1)]
  if forced.has(id):
   target = sk.global_transform.affine_inverse() * forced[id]
  elif controller.state == "settle" and locks.has(id):
   target = sk.global_transform.affine_inverse() * locks[id]
  elif planted and not death:
   if not locks.has(id): locks[id] = sk.global_transform * target
   target = sk.global_transform.affine_inverse() * locks[id]
  else:
   locks.erase(id)
  solve_leg(sk,leg,target)
  measured[id] = sk.global_transform * sk.get_bone_global_pose(sk.find_bone(leg.foot))
func signed_yaw(basis):
 var f = basis * Vector3.FORWARD
 return atan2(-f.x,-f.z)
func solve_leg(sk, leg, target):
 var ui = sk.find_bone(leg.upper)
 var li = sk.find_bone(leg.lower)
 var fi = sk.find_bone(leg.foot)
 var upper = sk.get_bone_global_pose(ui)
 var lower = sk.get_bone_global_pose(li)
 var foot = sk.get_bone_global_pose(fi)
 var a = upper.origin
 var b = lower.origin
 var c = foot.origin
 var l1 = a.distance_to(b)
 var l2 = b.distance_to(c)
 var vector = target.origin-a
 max_reach_violation = max(max_reach_violation,vector.length()-l1-l2)
 var distance = clamp(vector.length(),abs(l1-l2)+0.00001,l1+l2-0.00001)
 var axis = vector.normalized()
 var plane = b-a-axis*(b-a).dot(axis)
 if plane.length()<0.00001: plane = axis.cross(Vector3.FORWARD)
 if plane.length()<0.00001: plane = axis.cross(Vector3.RIGHT)
 plane = plane.normalized()
 var x = (l1*l1-l2*l2+distance*distance)/(2*distance)
 var knee = a+axis*x+plane*sqrt(max(0,l1*l1-x*x))
 var q1 = Quaternion((b-a).normalized(),(knee-a).normalized())
 var inherited_c = a+q1*(c-a)
 var q2 = Quaternion((inherited_c-knee).normalized(),(target.origin-knee).normalized())
 upper.basis = Basis(q1)*upper.basis
 lower.origin = knee
 lower.basis = Basis(q2)*Basis(q1)*lower.basis
 sk.set_bone_global_pose(ui,upper)
 sk.set_bone_global_pose(li,lower)
 sk.set_bone_global_pose(fi,target)
