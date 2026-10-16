"""2x2 bank generator; front (-Y) faces the river.

Only the explicitly listed wheel, axle, cantilever bearings and dynamo assembly
overhang the front. The full rotating paddle envelope fits Y >= -1.9 m and
Z >= -0.26 m. Other parts stay inside the grounded 2x2 bank footprint.
Wheel local X is its axle; speed = 2*pi/5 rad/s (one turn per five seconds).
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(320)

# Small open-front timber mill house on individual stone shoes, no ground slab.
for x in [-.61,.61]:
    for y in [-.11,.70]:
        box('Waterwheel_stone_shoe',(x,y,.12),(.30,.31,.24),'stone_light')
        box('Waterwheel_timber_post',(x,y,.72),(.15,.15,1.20),'wood')
    box('Waterwheel_side_sill',(x,.30,.33),(.16,.95,.15),'lightwood')
    box('Waterwheel_side_wall',(x,.31,.80),(.12,.75,.77),'ceramic')
    beam('Waterwheel_side_brace',(x,-.06,.39),(x,.67,1.24),.10,'lightwood')
box('Waterwheel_back_wall',(0,.70,.79),(1.17,.12,.90),'lightwood')
box('Waterwheel_front_lintel',(0,-.11,1.27),(1.38,.17,.16),'wood')
box('Waterwheel_back_lintel',(0,.70,1.27),(1.38,.17,.16),'wood')
before = set(bpy.context.scene.objects)
roof('Waterwheel_moss_roof',1.72,1.18,1.43,1.86,'moss',.12)
for obj in set(bpy.context.scene.objects)-before:
    obj.location.y += .28
beam('Waterwheel_copper_ridge',(0,-.35,1.86),(0,.91,1.86),.10,'copper',6)
# A compact interior generator cabinet and large readable state lamp.
rounded_box('Waterwheel_control_cabinet',(.27,.35,.78),(.48,.48,.69),'ceramic',.06)
box('Waterwheel_copper_control_trim',(.27,.092,.88),(.39,.08,.24),'copper')
box('idle_control_window',(.27,.043,.88),(.24,.08,.14),'glass')
box('running_control_window',(.27,.043,.88),(.24,.08,.14),material('glow',.8))
box('Waterwheel_back_window',(0,.77,.93),(.43,.08,.37),'glass')
box('Waterwheel_back_window_mullion',(0,.82,.93),(.08,.08,.42),'lightwood')
planter(-.65,.69,radius=.16)

hub = Vector((0,-.98,.47))
# Cantilever arms are attached to the bank shoes; they do not touch the bed.
supports = []
for x in [-.47,.47]:
    supports.append(box('Wheel_bank_leg',(x,-.68,.23),(.19,.23,.46),'wood'))
    supports.append(beam('Wheel_cantilever',(x,-.57,.37),(x,-1.10,.37),.16,'wood'))
    supports.append(beam('Wheel_diagonal_brace',(x,-.55,.08),(x,-1.02,.37),.12,'lightwood'))
    supports.append(box('Wheel_brass_bearing',(x,-.98,.47),(.22,.24,.24),'brass'))
join(supports,'Waterwheel_bank_bearings',(0,0,0))
cylinder('Waterwheel_axle',hub,.095,1.48,'brass',10,rot=(0,math.pi/2,0))

parts = []
for x in [-.095,.095]:
    parts.append(ring('Wheel_timber_rim',hub+Vector((x,0,0)),.56,.045,'wood',(0,math.pi/2,0)))
    for i in range(4):
        a = i*math.tau/4+.18
        d = Vector((0,math.cos(a),math.sin(a)))*.54
        parts.append(beam('Wheel_broad_spoke',hub+Vector((x,0,0)),hub+Vector((x,0,0))+d,.10,'lightwood'))
parts.append(cylinder('Wheel_copper_hub',hub,.16,.34,'copper',10,rot=(0,math.pi/2,0)))
for i in range(10):
    a = i*math.tau/10
    p = hub+Vector((0,math.cos(a),math.sin(a)))*.63
    parts.append(box('Wheel_chunky_paddle',p,(.34,.17,.14),'lightwood',rot=(a,0,0)))
rotor = join(parts,'move_spin_wheel',hub)
orient_x(rotor,(1,0,0))
rotor['speed'] = math.tau/5

# Coaxial dynamo on the bank's lip, feeding a chunky copper cable conduit.
drive = [cylinder('Dynamo_copper_coil',(.67,-.98,.47),.19,.28,'copper',10,rot=(0,math.pi/2,0)),
         cylinder('Dynamo_ceramic_end',(.84,-.98,.47),.16,.10,'ceramic',10,rot=(0,math.pi/2,0)),
         box('Dynamo_timber_mount',(.69,-.89,.23),(.37,.22,.30),'wood')]
for a,b in [((.78,-.98,.63),(.78,-.49,.63)),
            ((.78,-.49,.63),(.78,-.49,1.10)),
            ((.78,-.49,1.10),(.37,-.16,1.10))]:
    drive.append(beam('Dynamo_copper_conduit',a,b,.09,'copper',8))
join(drive,'Waterwheel_dynamo_and_conduit',(0,0,0))

build_complete('water_wheel',2,states=True,front_water_parts=(
    'move_spin_wheel','Waterwheel_axle','Waterwheel_bank_bearings','Waterwheel_dynamo_and_conduit'))
