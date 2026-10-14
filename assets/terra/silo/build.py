"""Cream grain drum, orange retaining hoops, a living cap and three drone pads."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from terra_machines import *

reset(230)
SX, SY = -.36, .36
soft_box('Silo_stone_apron', (0, 0, .05), (1.96, 1.96, .1), 'slate', .04)
round_cylinder('Silo_copper_footing', (SX, SY, .15), .60, .1, 'orange', segments=24)
# Height bands improve the baked gradient and the soft contact shadows.
levels = [.2, .3, .58, .66, 1.08, 1.16, 1.56, 1.64, 1.85, 1.92]
verts = [(SX+.56*math.cos(i*math.tau/28), SY+.56*math.sin(i*math.tau/28), z)
         for z in levels for i in range(28)]
faces = [tuple(range(27, -1, -1))]
faces += [(j*28+i, j*28+(i+1)%28, (j+1)*28+(i+1)%28, (j+1)*28+i)
          for j in range(len(levels)-1) for i in range(28)]
faces.append(tuple(range((len(levels)-1)*28, len(levels)*28)))
soften(mesh('Silo_ceramic_bin', verts, faces, paint('ivory')), .016, 2)
for z in [.62, 1.12, 1.6]:
    round_cylinder('Silo_copper_hoop', (SX, SY, z), .585, .07,
                   'orange', segments=24)
eave = round_cylinder('Silo_roof_eave', (SX, SY, 1.95), .63, .06, 'slate', segments=28)
eave.scale.y = math.cos(math.pi/14)  # Original 14-sided roof's Y extent.
round_cylinder('Silo_moss_roof', (SX, SY, 2.17), .62, .38,
               'leaf_deep', top=.16, segments=28, bevel=.025)
round_cylinder('Silo_brass_vent', (SX, SY, 2.42), .12, .14,
               'ivory', top=.08, segments=12)
blob('Silo_vent_cap', (SX, SY, 2.50), (.1, .1, .05), 'orange', segments=12, rings=5)
# Small leaf cushions follow the conical roof, adding a living silhouette.
for i in range(12):
    a = i*math.pi*(3-math.sqrt(5))
    r = .24 + .25*(i%3)/2
    z = 2.36-(r-.16)*.38/.46
    leaf_cushion('decor_Roof_leaf', (SX+r*math.cos(a), SY+r*math.sin(a), z+.018),
                 (.15, .11, .035), ['leaf', 'leaf_light', 'leaf_cool'][i%3],
                 (math.cos(a)*.6, math.sin(a)*.6, .8), a)
soft_box('Silo_timber_hatch', (SX, SY-.57, .5), (.3, .06, .36), 'slate', .03)
detail_box('Silo_hatch_enamel', (SX, SY-.607, .5), (.245, .025, .29), 'ivory', .02)
detail_box('Silo_hatch_handle', (SX, SY-.625, .5), (.16, .03, .04), 'orange')
# A few broad slats, not a texture: legible from the farm camera.
for z in [.78, .86, .94]:
    detail_box('Silo_service_vent', (SX, SY-.561, z), (.17, .023, .025), 'trim', .006)
y = SY+.60
for dx in [-.11, .11]:
    detail_box('Silo_ladder_rail', (SX+dx, y, 1.05), (.04, .04, 1.7), 'slate')
for z in [.4, .65, .9, 1.15, 1.4, 1.65]:
    detail_box('Silo_ladder_rung', (SX, y, z), (.24, .04, .03), 'ivory')
for px, pz in [(.5, .5), (-.4, .55), (.55, -.45)]:
    x, y = px, -pz
    round_cylinder('Silo_pad_stem', (x, y, .14), .07, .08, 'orange', segments=12, bevel=.008)
    round_cylinder('Silo_pad_disc', (x, y, .20), .3, .05, 'ivory', segments=16)
    # This keeps the original centre and height; a ring leaves a visible landing mark.
    hoop('Silo_pad_ring', (x, y, .23), .18, .02, 'slate', segments=12)
    out = Vector((x, y, 0)).normalized()*.25
    smooth(sphere('Silo_pad_lamp', (x+out.x, y+out.y, .24), (.04, .04, .03),
                  paint('lamp', .7), 8, 4))
for x, y in [(-.86, -.12), (.84, -.05), (.1, .86)]:
    tuft(x, y)
# Global bounds match the original; landing geometry additionally retains the
# shipped pad anchors (including the original centre_xy correction of -.005).
objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
contract, low, high = read_contract('silo')
source_low, source_high = bounds(objects)
scale = Vector(tuple((high[i]-low[i])/(source_high[i]-source_low[i]) for i in range(3)))
pad_anchors = {o.name: o.matrix_world.translation.copy()
               for o in objects if o.name.startswith('Silo_pad_')}
fit_bounds(objects, low, high)
for name, anchor in pad_anchors.items():
    obj = bpy.data.objects[name]
    fitted = Vector(tuple(low[i]+(anchor[i]-source_low[i])*scale[i] for i in range(3)))
    delta = contract[name][0].translation-fitted
    local_delta = obj.matrix_world.inverted().to_3x3()@delta
    for v in obj.data.vertices:
        v.co += local_delta
    obj.data.update()
machine_complete('silo', 2, reach=.27)
