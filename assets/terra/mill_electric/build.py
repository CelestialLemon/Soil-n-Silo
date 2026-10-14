"""Friendly electric flour mill with a rolled hopper and orange flywheel."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from terra_machines import *

reset(206)
for x in [-.50,.50]:
    for y in [-.42,.42]:
        soft_box('Mill_timber_upright',(x,y,.78),(.15,.15,1.56),'ivory',.045)
        detail_box('Mill_leg_boot',(x,y,.10),(.18,.18,.20),'slate',.025)
for y in [-.42,.42]:
    tube('Mill_tower_brace',(-.50,y,.12),(.50,y,1.33),.10,'trim',8)
soft_box('Mill_machine_shelf',(0,0,.93),(1.23,1.05,.14),'slate',.04)
round_cylinder('Mill_ceramic_grinder',(0,0,1.14),.40,.37,'ivory',bevel=.045,segments=24)
round_cylinder('Mill_copper_neck',(0,0,1.42),.18,.23,'orange',bevel=.025,segments=16)
# A genuinely hollow hopper, with a cream rolled edge and recessed grain.
verts=[(x*s,y*s,z) for s,z in [(.21,1.45),(.60,1.93),(.49,1.91),(.16,1.51)]
       for x,y in [(-1,-1),(1,-1),(1,1),(-1,1)]]
faces=[]
for i in range(4):
    j=(i+1)%4
    faces += [(i,j,j+4,i+4),(i+4,j+4,j+8,i+8),(i+8,j+8,j+12,i+12),(i+12,j+12,j,i)]
soften(mesh('Mill_open_hopper',verts,faces,paint('ivory')),.025,3)
soft_box('Mill_visible_grain',(0,0,1.77),(.68,.68,.065),'grain',.025)
for x,y in [(-.18,-.1),(.12,-.17),(.04,.15),(-.2,.19),(.23,.12)]:
    blob('Mill_grain_kernel',(x,y,1.807),(.055,.032,.018),'grain',segments=8,rings=4)
hub=Vector((0,-.63,.86))
parts=[hoop('Drive_rim',hub,.30,.055,'orange',(math.pi/2,0,0),20),
       round_cylinder('Drive_hub',hub,.105,.20,'slate',rot=(math.pi/2,0,0),segments=16)]
for a in [0,math.pi/3,2*math.pi/3]:
    d=Vector((math.cos(a),0,math.sin(a)))*.28
    parts.append(tube('Drive_spoke',hub-d,hub+d,.065,'ivory',8))
parts.append(round_cylinder('Drive_axle_cap',hub+Vector((0,-.11,0)),.063,.025,
                            'white',rot=(math.pi/2,0,0),segments=12))
rotor=join(parts,'move_spin_drive',hub)
orient_x(rotor,(0,-1,0)); rotor['speed']=2.1
tube('Mill_drive_axle',(0,-.65,.86),(0,-.20,.86),.12,'trim')
tube('Mill_flour_chute',(.29,-.18,.96),(.55,-.35,.47),.20,'ivory')
# Closed wall section around an open top, rather than a solid box under a decal.
verts=[(.48+x*w,-.36+y*d,z) for w,d,z in
       [(.225,.22,.01),(.225,.22,.43),(.175,.17,.43),(.175,.17,.07)]
       for x,y in [(-1,-1),(1,-1),(1,1),(-1,1)]]
faces=[(3,2,1,0),(12,13,14,15)]
for i in range(4):
    j=(i+1)%4
    faces += [(i,j,j+4,i+4),(i+4,j+4,j+8,i+8),(i+8,j+8,j+12,i+12),(i+12,j+12,j,i)]
soften(mesh('Mill_flour_bin',verts,faces,paint('ivory')),.018,2)
blob('running_flour',(.48,-.36,.435),(.16,.15,.065),'white',segments=12,rings=6)
soft_box('idle_bin_interior',(.48,-.36,.32),(.31,.30,.035),'recess',.012)
soft_box('Mill_motor',(-.36,.22,.56),(.42,.44,.32),'ivory',.07)
solar_roof('Mill_solar_control',(-.36,.22,.76),(.44,.45),math.radians(12))
for x in [-.46,-.36,-.26]:
    detail_box('Mill_motor_vent',(x,-.008,.56),(.028,.018,.14),'slate',.005)
soft_box('Mill_service_panel',(0,.399,1.14),(.29,.025,.15),'orange',.025)
pot(-.64,-.56,radius=.17)
creeper((.58,.42,.23),(.58,.42,1.28))
machine_complete('mill_electric',2,states=True,reach=.30)
