extends Node3D
var actor
var unit_select
var clip_select
var camera
var label
var angle=0.7
var elevation=0.45
var radius=9.0
func _ready():
 var env=WorldEnvironment.new()
 env.environment=Environment.new()
 env.environment.background_mode=Environment.BG_COLOR
 env.environment.background_color=Color(0.065,0.075,0.095)
 env.environment.ambient_light_source=Environment.AMBIENT_SOURCE_COLOR
 env.environment.ambient_light_color=Color(0.75,0.82,1.0)
 env.environment.ambient_light_energy=0.65
 add_child(env)
 for data in [[Vector3(-45,-30,0),2.0],[Vector3(-30,150,0),0.9]]:
  var light=DirectionalLight3D.new()
  light.rotation_degrees=data[0]
  light.light_energy=data[1]
  light.shadow_enabled=true
  add_child(light)
 var floor=MeshInstance3D.new()
 var plane=PlaneMesh.new()
 plane.size=Vector2(200,200)
 floor.mesh=plane
 var material=StandardMaterial3D.new()
 material.albedo_color=Color(0.14,0.16,0.18)
 material.roughness=0.9
 floor.material_override=material
 add_child(floor)
 var grid=ImmediateMesh.new()
 grid.surface_begin(Mesh.PRIMITIVE_LINES)
 for i in range(-30,31):
  grid.surface_add_vertex(Vector3(i,0.002,-30));grid.surface_add_vertex(Vector3(i,0.002,30))
  grid.surface_add_vertex(Vector3(-30,0.002,i));grid.surface_add_vertex(Vector3(30,0.002,i))
 grid.surface_end()
 var lines=MeshInstance3D.new();lines.mesh=grid
 var gm=StandardMaterial3D.new();gm.shading_mode=BaseMaterial3D.SHADING_MODE_UNSHADED;gm.albedo_color=Color(0.25,0.28,0.3);lines.material_override=gm;add_child(lines)
 camera=Camera3D.new();add_child(camera);camera.current=true
 var canvas=CanvasLayer.new();add_child(canvas)
 var panel=VBoxContainer.new();panel.position=Vector2(16,16);canvas.add_child(panel)
 label=Label.new();label.text="MORDRA • Godot 4.7 | Jobb egér: kamera • Görgő: távolság";panel.add_child(label)
 unit_select=OptionButton.new();unit_select.add_item("Kisebb Mordra rovar");unit_select.add_item("Nagy Mordra lény");panel.add_child(unit_select);unit_select.item_selected.connect(func(i):change_unit("infantry" if i==0 else "brute"))
 clip_select=OptionButton.new();panel.add_child(clip_select);clip_select.item_selected.connect(func(i):actor.show_clip(clip_select.get_item_text(i)))
 var row=HBoxContainer.new();panel.add_child(row)
 for degrees in [-90,-45,-20,20,45,90,180]:
  var b=Button.new();b.text=str(degrees)+"°";row.add_child(b);b.pressed.connect(func():actor.request_turn(deg_to_rad(degrees)))
 var row2=HBoxContainer.new();panel.add_child(row2)
 for item in [["Séta",0],["Futás / séta",1],["Megállás",2],["Támadás célra",3],["Újrakezdés",4]]:
  var b=Button.new();b.text=item[0];row2.add_child(b);var index=item[1]
  b.pressed.connect(func():
   if index==0:actor.move_toward_direction(-actor.global_basis.z,actor.meta.gaits.walk.speed)
   elif index==1:actor.move_toward_direction(-actor.global_basis.z,actor.meta.gaits.get("run",actor.meta.gaits.walk).speed)
   elif index==2:actor.desired_speed=0
   elif index==3:actor.attack("attack_bite" if actor.unit=="brute" else "attack_tentacle_double",Basis(Vector3.UP,deg_to_rad(65))*(-actor.global_basis.z))
   else:change_unit(actor.unit)
  )
 change_unit("infantry")
func change_unit(kind):
 if is_instance_valid(actor):remove_child(actor);actor.queue_free()
 actor=load("res://scripts/mordra_controller.gd").new();add_child(actor);actor.setup(kind)
 clip_select.clear()
 for name in actor.meta.animations:clip_select.add_item(name)
 radius=3.0 if kind=="infantry" else 10.0
func _process(_dt):
 if not actor:return
 var focus=actor.global_position+Vector3.UP*(0.3 if actor.unit=="infantry" else 1.4)
 camera.position=focus+Vector3(sin(angle)*cos(elevation),sin(elevation),cos(angle)*cos(elevation))*radius
 camera.look_at(focus)
 label.text="MORDRA • "+actor.unit+" • "+actor.clip+" • "+actor.state+" | Jobb egér: kamera • Görgő: távolság"
func _unhandled_input(event):
 if event is InputEventMouseMotion and Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):angle-=event.relative.x*0.007;elevation=clamp(elevation+event.relative.y*0.005,0.1,1.3)
 if event is InputEventMouseButton and event.pressed:
  if event.button_index==MOUSE_BUTTON_WHEEL_UP:radius=max(1,radius*0.9)
  if event.button_index==MOUSE_BUTTON_WHEEL_DOWN:radius*=1.1
