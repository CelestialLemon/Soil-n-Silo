"""A little electric farm truck: ceramic cab, solar roof and an open honey-timber bed.

Front -Y becomes +Z in glTF. The cargo floor is exactly Z=0.27 here (game Y).
TRUCK_BED slots (game X,Z) become (X,-Z): (+/-0.1, 0.08/0.20/0.32).
Nothing projects into the cargo space above those six slots.
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(241)

# Four broad, faceted tyres with ceramic hubs and copper centres. Axles run along X.
for x in [-.21,.21]:
    for y in [-.255,.265]:
        cylinder('Truck_rubber_tyre',(x,y,.10),.10,.08,'black',12,rot=(0,math.pi/2,0))
        outer = x + (.012 if x > 0 else -.012)
        cylinder('Truck_ceramic_hub',(outer,y,.10),.063,.06,'ceramic',8,rot=(0,math.pi/2,0))
        cylinder('Truck_copper_hub',(outer,y,.10),.032,.065,'copper',8,rot=(0,math.pi/2,0))
rounded_box('Truck_underframe',(0,0,.145),(.40,.80,.10),'darkwood',.035)
rounded_box('Truck_battery',(0,.09,.18),(.34,.42,.10),'copper',.035)

# Rounded lower cab, with a raked sea-glass greenhouse and broad ceramic pillars.
rounded_box('Truck_ceramic_cab',(0,-.215,.245),(.43,.37,.17),'ceramic',.06)
profile = [(-.385,.29),(-.31,.405),(-.075,.405),(-.035,.29)]
# Extrude the Y/Z profile along X, with outward faces.
verts = [(x,y,z) for x in [-.19,.19] for y,z in profile]
mesh('Truck_cab_glazing',verts,
     [(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],material('glass',.5))
for x in [-.19,.19]:
    beam('Truck_front_pillar',(x,-.385,.29),(x,-.31,.405),.06,'ceramic')
    beam('Truck_rear_pillar',(x,-.035,.29),(x,-.075,.405),.06,'ceramic')
rounded_box('Truck_roof_frame',(0,-.19,.417),(.43,.32,.06),'ceramic',.035)
rounded_box('Truck_solar_roof',(0,-.19,.43),(.33,.24,.06),'solar',.025)
box('Truck_solar_divider',(0,-.19,.435),(.06,.24,.06),'solar_light')

# A copper bumper and two warm lamps make the front legible at game scale.
rounded_box('Truck_front_bumper',(0,-.40,.19),(.44,.06,.06),'copper',.025)
for x in [-.135,.135]:
    rounded_box('Truck_headlamp',(x,-.395,.265),(.09,.06,.07),material('glow',.7),.02)

# Flat, unbevelled cargo floor: its whole top is at 0.27 m, including all token slots.
floor = box('Truck_flat_bed_floor',(0,.205,.24),(.42,.43,.06),'lightwood')
for x in [-.21,.21]:
    rounded_box('Truck_bed_side',(x,.205,.305),(.06,.43,.07),'wood',.012)
rounded_box('Truck_bed_bulkhead',(0,-.045,.305),(.42,.06,.07),'wood',.012)
# A broad but shallow tailgate leaves room for the back row of goods.
rounded_box('Truck_bed_tailgate',(0,.415,.305),(.42,.03,.07),'wood',.012)
rounded_box('Truck_rear_bumper',(0,.40,.19),(.44,.06,.06),'copper',.025)
for x in [-.16,.16]:
    box('Truck_tail_lamp',(x,.40,.24),(.07,.06,.06),material('red_light',.5))

# Guard the gameplay contract before the shared bounds/export checks. Ray tests also
# reserve room for the widest scaled goods (~0.15 m across) at each cargo slot.
bpy.context.view_layer.update()
for x in [-.10,.10]:
    for y in [.08,.20,.32]:
        for dx,dy in [(0,0),(-.077,0),(.077,0),(0,-.077),(0,.077)]:
            hit, point, normal, index, obj, matrix = bpy.context.scene.ray_cast(
                bpy.context.evaluated_depsgraph_get(),Vector((x+dx,y+dy,1)),Vector((0,0,-1)))
            assert hit and obj == floor and abs(point.z-.27) < 1e-6, 'Cargo floor obstructed or uneven'
points = [o.matrix_world@v.co for o in bpy.context.scene.objects if o.type == 'MESH' for v in o.data.vertices]
assert max(p.z for p in points) <= .47, 'Truck too tall'
assert abs(min(p.x for p in points)+max(p.x for p in points)) < 1e-6, 'Truck off-centre X'
assert abs(min(p.y for p in points)+max(p.y for p in points)) < 1e-6, f'Truck off-centre Y: {min(p.y for p in points)}, {max(p.y for p in points)}'
build_complete('truck',(.52,.86))
