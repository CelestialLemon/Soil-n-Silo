"""Open enamel farm garage, solar canopy, living roof and a charging pedestal.

The shapes.ts stand-in is base-centred in three.js, not centre-centred. Its
bounds are Blender (-1,-.99,0)..(1,.99,1.29), front -Y. No recenter/fitting is
allowed: the bay, floor and charging post retain their gameplay coordinates.
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from terra_machines import *

reset(231)
soft_box('Garage_slate_apron', (0, 0, .04), (1.94, 1.94, .08), 'slate', .03)
soft_box('Garage_back_wall', (0, .9, .605), (1.8, .12, 1.05), 'ivory', .035)
for x in [-.9, .9]:
    soft_box('Garage_side_wall', (x, .15, .605), (.1, 1.4, 1.05), 'ivory', .03)
    soft_box('Garage_front_post', (x, -.82, .605), (.12, .12, 1.05), 'ivory', .04)
    detail_box('Garage_post_boot', (x, -.82, .18), (.126, .126, .20), 'orange', .018)
    detail_box('Garage_side_skirt', (x, .15, .22), (.112, 1.38, .15), 'slate', .02)
    for y in [-.30, -.10, .10]:
        detail_box('Garage_side_vent', (x*1.061, y, .73), (.014, .06, .20), 'slate', .005)
soft_box('Garage_roof_edge', (0, 0, 1.17), (2.0, 1.98, .08), 'slate', .035)
soft_box('Garage_living_roof', (0, .45, 1.235), (1.9, 1.0, .05), 'leaf_deep', .035)
# Solar surface matches the original front roof's exact position and thickness.
soft_box('Garage_solar_frame', (0, -.48, 1.235), (1.8, .86, .05), 'ivory', .02)
soft_box('Garage_solar_glass', (0, -.48, 1.273), (1.68, .74, .018), 'solar', .008)
for x in [-.56, 0, .56]:
    detail_box('Garage_cell_busbar', (x, -.48, 1.285), (.018, .74, .008), 'solar_light', .002)
detail_box('Garage_cell_divider', (0, -.48, 1.285), (1.68, .018, .008), 'solar_light', .002)
# Low cushions stay inside the stand-in's 1.29 m overall roof height.
for i, (x, y) in enumerate([(x, y) for y in [.20, .50, .79] for x in [-.68, -.23, .22, .67]]):
    blob('decor_Roof_moss', (x, y, 1.265), (.25, .18, .025),
         ['leaf', 'leaf_light', 'leaf_cool'][i%3], phase=i*.6, segments=12, rings=5)
soft_box('Garage_charging_post', (.6, .6, .38), (.16, .16, .60), 'orange', .04)
soft_box('Garage_charger_head', (.6, .6, .59), (.20, .20, .17), 'ivory', .035)
detail_box('Garage_charge_display', (.6, .51, .54), (.1, .02, .08), 'lamp', .008, emission=.5)
tube('Garage_charge_lead', (.67, .55, .50), (.70, .44, .29), .027, 'recess', 8)
tube('Garage_charge_lead', (.70, .44, .29), (.66, .40, .44), .027, 'recess', 8)
detail_box('Garage_charge_plug', (.66, .40, .455), (.055, .05, .09), 'orange', .014)
# The narrow centre line and a clear entrance preserve the stand-in parking bay.
detail_box('Garage_parking_line', (0, .2, .085), (.06, 1.0, .01), 'ivory', .003)
for x in [-.50, .50]:
    detail_box('Garage_bay_stop', (x, .66, .125), (.32, .08, .09), 'orange', .015)
soft_box('Garage_front_lintel', (0, -.86, 1.075), (1.68, .14, .11), 'orange', .035)
soft_box('Garage_bay_sign', (0, -.944, 1.075), (.36, .025, .085), 'ivory', .015)
# A simple lightning mark, built from geometry, reads as a charger rather than a shop.
for x, z, tilt in [(-.018, 1.094, -.45), (.018, 1.055, -.45)]:
    mark = detail_box('Garage_charge_symbol', (x, -.960, z), (.026, .012, .054), 'slate', .005)
    mark.rotation_euler.y = tilt
pot(-.72, -.75, z=.08, radius=.15)
tube('decor_Vine_stem', (-.962, .67, .27), (-.962, .67, .94), .026, 'leaf_deep', 8)
for i, z in enumerate([.43, .63, .84]):
    blob('decor_Vine_leaf', (-.966, .67, z), (.024, .13, .10),
         ['leaf', 'leaf_light', 'leaf_cool'][i], phase=i, segments=10, rings=6)
soft_box('Garage_rear_service_panel', (0, .966, .61), (.46, .026, .34), 'orange', .035)
detail_box('Garage_rear_panel_insert', (0, .981, .63), (.34, .008, .22), 'ivory', .015)
for x in [-.10, 0, .10]:
    detail_box('Garage_rear_panel_vent', (x, .987, .66), (.025, .006, .10), 'slate', .004)
objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
low, high = bounds(objects)
assert (low-Vector((-1, -.99, 0))).length < 1e-5, low
assert (high-Vector((1, .99, 1.29))).length < 1e-5, high
complete('garage', (2, 1.98, 1.29), reach=.25)
