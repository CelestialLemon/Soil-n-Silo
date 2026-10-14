"""Little electric farm pickup with a cream cab and an open orange-edged bed.

Keep shapes.ts's precise bounds, axle positions (including its cylinder base
placement), +Z glTF facing and TRUCK_BED contract. Blender bed is Z=.27, goods
sit at X=+/-.1, Y=.08/.20/.32. New empties document those attachment points;
current game code needs none of them and already discovers terra/truck.glb.
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from terra_machines import *

reset(232)
# Kit.cyl applies rz=pi/2 about a base, placing axle centres at x-.035.
for x in [-.235, .165]:
    for y in [-.22, .24]:
        # Closed rounded tyre section with an actual rim opening: no hidden caps.
        section = [(.049, -.035), (.078, -.035), (.087, -.026), (.09, -.015),
                   (.09, .015), (.087, .026), (.078, .035), (.049, .035)]
        verts = [(x+axial, y+r*math.cos(i*math.tau/16), .09+r*math.sin(i*math.tau/16))
                 for r, axial in section for i in range(16)]
        faces = [(j*16+i, j*16+(i+1)%16, ((j+1)%8)*16+(i+1)%16, ((j+1)%8)*16+i)
                 for j in range(8) for i in range(16)]
        smooth(mesh('Truck_tyre', verts, faces, paint('recess')))
        side = -1 if x < 0 else 1
        round_cylinder('Truck_wheel_hub', (x+side*.032, y, .09), .048, .004,
                       'ivory', rot=(0, math.pi/2, 0), bevel=.002, segments=12)
        round_cylinder('Truck_axle_button', (x+side*.033, y, .09), .018, .004,
                       'orange', rot=(0, math.pi/2, 0), bevel=.001, segments=8)
soft_box('Truck_chassis', (0, 0, .12), (.42, .86, .08), 'slate', .02)
soft_box('Truck_ceramic_cab', (0, -.24, .28), (.42, .32, .24), 'ivory', .045)
# Blue glazing sits in a dark frame on the rounded cab. The cab roof stays at .46.
soft_box('Truck_roof_frame', (0, -.20, .42), (.38, .26, .04), 'ivory', .025)
soft_box('Truck_solar_roof', (0, -.20, .451), (.31, .19, .018), 'solar', .008)
detail_box('Truck_roof_busbar', (0, -.20, .461- .004), (.009, .17, .005), 'solar_light', .001)
soft_box('Truck_windshield_frame', (0, -.397, .302), (.35, .022, .124), 'slate', .012)
soft_box('Truck_front_glass', (0, -.408, .302), (.30, .014, .093), 'solar_light', .012, emission=.5)
detail_box('Truck_windshield_divider', (0, -.417, .30), (.009, .006, .088), 'slate', .002)
for side in [-1, 1]:
    soft_box('Truck_side_window', (side*.207, -.245, .325), (.012, .175, .09), 'solar', .006)
    detail_box('Truck_door_handle', (side*.210, -.19, .255), (.008, .045, .012), 'orange', .003)
soft_box('Truck_front_bumper', (0, -.41, .185), (.36, .02, .05), 'orange', .008)
for x in [-.14, .14]:
    soft_box('Truck_headlamp', (x, -.415, .22), (.06, .02, .04), 'lamp', .008, emission=.5)
for x in [-.035, .035]:
    detail_box('Truck_grille', (x, -.405, .222), (.018, .009, .036), 'slate', .003)
# A thin separate top preserves a truly flat cargo floor across all six slots.
soft_box('Truck_bed_support', (0, .2, .205), (.42, .46, .09), 'slate', .015)
bed = detail_box('Truck_bed_floor', (0, .2, .26), (.42, .46, .02), 'wood', .004)
for x in [-.2, .2]:
    soft_box('Truck_bed_side', (x, .2, .305), (.03, .46, .07), 'ivory', .009)
    detail_box('Truck_bed_rail', (x, .2, .336), (.03, .46, .014), 'orange', .004)
soft_box('Truck_tailgate', (0, .415, .305), (.42, .03, .07), 'ivory', .009)
soft_box('Truck_bed_headboard', (0, -.02, .315), (.42, .03, .09), 'ivory', .009)
detail_box('Truck_tailgate_band', (0, .426, .321), (.33, .008, .027), 'orange', .005)
for x in [-.14, .14]:
    detail_box('Truck_tail_lamp', (x, .426, .29), (.035, .008, .021), 'orange', .004)
# Zero-geometry attachment nodes, with game-space coordinates after Y-up export.
for name, location in [('bed_floor', (0, .2, .27))] + [
        (f'cargo_slot_{i}', (x, y, .27))
        for i, (x, y) in enumerate([(-.1, .08), (.1, .08), (-.1, .2), (.1, .2), (-.1, .32), (.1, .32)])]:
    obj = empty(name, location)
    if name == 'bed_floor':
        obj['cargo_scale'] = .55
objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
low, high = bounds(objects)
# Tiny hub caps must remain within the original asymmetrical tyre envelope.
assert low.x >= -.27-1e-5 and high.x <= .215+1e-5, (low, high)
assert abs(low.y+.43) < 1e-5 and abs(high.y-.43) < 1e-5
assert abs(low.z) < 1e-5 and abs(high.z-.46) < 1e-5
# Ray-check every goods point: top surface .27, no mesh above it in the open bed.
from mathutils.bvhtree import BVHTree
for i in range(6):
    at = bpy.data.objects[f'cargo_slot_{i}'].location.copy()
    for obj in objects:
        verts = [obj.matrix_world@v.co for v in obj.data.vertices]
        bvh = BVHTree.FromPolygons(verts, [tuple(p.vertices) for p in obj.data.polygons])
        hit, _, _, _ = bvh.ray_cast(at+Vector((0, 0, 1)), Vector((0, 0, -1)), 1)
        assert hit is None or hit.z <= .27001, (obj.name, i, hit)
complete('truck', (.485, .86, .46), reach=.075)
