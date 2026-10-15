"""An open timber truck shelter, with a living roof, solar glass and a copper charger.

Front is -Y. No threshold or floor slab: trucks park on the ground under the canopy.
The roof and details stay inside the 2 x 2 m building footprint.
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(240)

# Four stout posts on individual stone shoes; a wide, permanently open entrance.
for x in [-.82,.82]:
    for y in [-.80,.80]:
        cylinder('Garage_stone_shoe',(x,y,.07),.12,.14,'stone_light',8)
        rounded_box('Garage_timber_post',(x,y,.70),(.16,.16,1.30),'wood',.035)
        box('Garage_copper_collar',(x,y,.22),(.18,.18,.12),'copper')
    box('Garage_side_plate',(x,0,1.27),(.19,1.82,.16),'lightwood')
    # Side walls end short of the entrance, so both bays remain easy to read.
    for z in [.30,.53,.76]:
        box('Garage_side_plank',(x,.30,z),(.12,1.02,.16),'lightwood')
    for y in [-.80,.80]:
        end = y + (.31 if y < 0 else -.31)
        beam('Garage_side_knee_brace',(x,y,.99),(x,end,1.27),.11,'wood')

# Broad rear planks, with enough gaps to keep the shelter light and airy.
for z in [.30,.53,.76,.99]:
    box('Garage_back_plank',(0,.82,z),(1.58,.12,.16),'lightwood')
for y in [-.81,.81]:
    rounded_box('Garage_header',(0,y,1.27),(1.78,.16,.17),'wood',.035)
    for sign in [-1,1]:
        beam('Garage_front_back_brace',(sign*.81,y,.98),(sign*.50,y,1.27),.12,'lightwood')
        beam('Garage_gable_rafter',(sign*.92,y,1.33),(0,y,1.57),.12,'wood')

# A shallow pitched roof: soft moss on one slope, a single framed solar panel on the other.
roof('Garage_roof_deck',1.96,1.96,1.34,1.59,'darkwood',.10)
slope = math.atan2(.25,.98)
for x in [-.28,-.70]:
    for y in [-.64,0,.64]:
        z = 1.59-.25*abs(x)/.98+.035
        obj = rounded_box('Garage_living_roof',(x,y,z),(.44,.62,.10),'moss',.045)
        obj.rotation_euler.y = -slope
for x,y in [(-.76,-.54),(-.30,.61),(-.72,.50)]:
    z = 1.59-.25*abs(x)/.98+.065
    sphere('decor_Garage_roof_sedum',(x,y,z),(.16,.19,.07),'leaf',8,3)

panel = Vector((.49,0,1.59-.25*.49/.98+.025))
rot = Matrix.Rotation(slope,4,'Y')
def at(x,y,z):
    return panel+rot@Vector((x,y,z))
obj = rounded_box('Garage_solar_ceramic_frame',panel,(.83,1.76,.10),'ceramic',.035)
obj.rotation_euler.y = slope
box('Garage_solar_glass',at(0,0,.055),(.69,1.60,.06),'solar',rot=(0,slope,0))
for y in [-.52,0,.52]:
    box('Garage_solar_cell_separator',at(0,y,.06),(.69,.065,.06),'solar_light',rot=(0,slope,0))
cylinder('Garage_copper_ridge',(0,0,1.60),.06,1.96,'copper',8,rot=(math.pi/2,0,0))

# A recognisable charging station tucked against the rear wall, outside the parking space.
rounded_box('Garage_charger_foot',(.62,.59,.07),(.27,.30,.14),'ceramic',.04)
rounded_box('Garage_copper_charger',(.62,.59,.44),(.20,.22,.66),'copper',.06)
rounded_box('Garage_charger_face',(.62,.46,.64),(.16,.08,.20),'ceramic',.025)
box('Garage_charge_indicator',(.62,.41,.66),(.09,.06,.08),material('charge',.7))
beam('Garage_charging_cable',(.73,.56,.55),(.75,.40,.30),.07,'darkwood',6)
beam('Garage_charging_cable',(.75,.40,.30),(.75,.26,.45),.07,'darkwood',6)
rounded_box('Garage_charge_plug',(.75,.26,.49),(.10,.10,.16),'copper',.03)

# A bold plug emblem identifies the open front; planting softens a rear corner.
rounded_box('Garage_entry_sign',(0,-.92,1.22),(.44,.10,.27),'ceramic',.04)
rounded_box('Garage_plug_symbol',(0,-.98,1.21),(.18,.06,.12),'copper',.025)
for x in [-.055,.055]:
    box('Garage_plug_pin',(x,-.98,1.30),(.06,.06,.09),'copper')
planter(-.67,.60,radius=.16)
vine((-.84,.73,.32),(-.84,.73,1.26))

bpy.context.view_layer.update()
assert max((o.matrix_world@v.co).z for o in bpy.context.scene.objects
           if o.type == 'MESH' for v in o.data.vertices) <= 1.67, 'Garage too tall'
build_complete('garage',2)
