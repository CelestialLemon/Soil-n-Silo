"""Ceramic and timber henhouse, living pitched roof, solar glass and fenced run."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(235)
# House occupies the rear; its little run is wholly inside the 3 x 3 footprint.
for x in [-.89,.89]:
    for y in [-.22,1.02]:
        box('Coop_solar_timber_support',(x,y,.15),(.16,.16,.30),'wood')
rounded_box('Coop_solar_raised_floor',(0,.40,.28),(2.16,1.60,.16),'wood',.045)
for x in [-1.01,1.01]:
    rounded_box('Coop_solar_ceramic_side',(x,.40,.91),(.14,1.60,1.12),'ceramic',.035)
box('Coop_solar_ceramic_back',(0,1.13,.91),(1.92,.14,1.12),'ceramic')
for x in [-.66,.66]:
    box('Coop_solar_front_wall',(x,-.33,.91),(.71,.14,1.12),'ceramic')
box('Coop_solar_entry_header',(0,-.33,1.32),(.62,.14,.30),'ceramic')
box('Coop_solar_dark_interior',(0,.58,.81),(1.88,.06,1.04),'darkwood')
for y in [-.33,1.13]:
    extrude_xz('Coop_solar_timber_gable',[(-1.08,1.47),(1.08,1.47),(0,1.99)],y,.15,'lightwood')
for x in [-1.09,1.09]:
    for y in [-.30,.40,1.10]:
        box('Coop_solar_frame_post',(x,y,.92),(.12,.12,1.16),'wood')
for y in [-.42,1.22]:
    box('Coop_solar_front_back_beam',(0,y,1.43),(2.20,.10,.14),'wood')
roof('Coop_solar_ceramic_roof',2.40,1.88,1.49,2.06,'ceramic',.11)
# Shift only the roof pair to the house centre.
for obj in bpy.context.scene.objects:
    if obj.name.startswith('Coop_solar_ceramic_roof'):
        obj.location.y=.40
slope=math.atan2(.57,1.20)
for sign in [-1,1]:
    for x in [.32,.80]:
        for y in [-.19,.40,.99]:
            z=2.06-.57*x/1.20+.055
            rounded_box('Coop_solar_living_roof_tile',(sign*x,y,z),(.45,.50,.09),'moss',.03).rotation_euler.y=sign*slope
# Solar cells lie over the forward part of both pitched green slopes.
for sign in [-1,1]:
    x=sign*.64
    z=2.06-.57*.64/1.20+.13
    # solar_tile tilts around X; rotate its assembly 90 degrees to follow this roof.
    before=set(bpy.context.scene.objects)
    solar_tile('Coop_solar_roof_array',(0,0,0),(.58,.80),-slope)
    bpy.context.view_layer.update()
    transform=Matrix.Translation(Vector((x,-.03,z)))@Matrix.Rotation(-sign*math.pi/2,4,'Z')
    for obj in bpy.context.scene.objects:
        if obj not in before:
            obj.matrix_world=transform@obj.matrix_world
box('Coop_solar_copper_ridge',(0,.40,2.09),(.12,1.94,.12),'copper')
for x in [-.36,.36]:
    box('Coop_solar_entry_jamb',(x,-.425,.78),(.10,.10,.92),'lightwood')
box('Coop_solar_entry_lintel',(0,-.425,1.25),(.82,.10,.10),'lightwood')
beam('Coop_solar_ramp_left',(-.29,-1.05,.075),(-.29,-.44,.32),.09,'wood')
beam('Coop_solar_ramp_right',(.29,-1.05,.075),(.29,-.44,.32),.09,'wood')
for i in range(6):
    t=i/5
    box('Coop_solar_ramp_tread',(0,-1.05+.61*t,.08+.27*t),(.66,.10,.07),'lightwood')
window('Coop_solar_side_window',1.105,.40,.97,.49,.48,side=True,lit=False)
window('Coop_solar_other_window',-1.105,.40,.97,.49,.48,side=True,lit=False)
window('Coop_solar_back_window',0,1.235,.96,.54,.48,lit=False)
# Open timber rails, with a bold gate brace: enough space to see into the run.
for x in [-1.30,0,1.30]:
    box('Coop_solar_run_post',(x,-1.31,.30),(.11,.11,.60),'wood')
for x in [-1.30,1.30]:
    box('Coop_solar_run_side_post',(x,-.41,.30),(.11,.11,.60),'wood')
    for z in [.20,.46]:
        box('Coop_solar_run_side_rail',(x,-.86,z),(.075,.90,.075),'lightwood')
for z in [.20,.46]:
    box('Coop_solar_run_front_rail',(0,-1.31,z),(2.60,.075,.075),'lightwood')
beam('Coop_solar_run_gate_brace',(.10,-1.315,.20),(1.21,-1.315,.46),.07,'wood')
planter(-1.18,.88,radius=.14)
vine((1.16,.92,.26),(1.16,.92,1.36))
grass(-.88,-.89)
grass(.96,-.89)
build_complete('coop_solar',3)
