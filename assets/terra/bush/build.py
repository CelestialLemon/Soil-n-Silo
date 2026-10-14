"""A leafy berry bush: irregular clumps, sunlit tips and four warm red berries."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from terra_common import *

reset(116)
smooth(cylinder('Bush_woody_stem', (0, 0, .16), .095, .32, paint('bark'), 10))
for i, (position, scale, colour) in enumerate([
    ((0, 0, .43), (.34, .31, .37), 'leaf'),
    ((-.20, -.08, .36), (.22, .24, .27), 'leaf_light'),
    ((.19, .08, .39), (.24, .24, .29), 'leaf_deep')]):
    phase = i+.4
    leafy_blob('Bush_round_foliage', position, scale, colour, phase,
               segments=16, rings=7, relief=.10)
    before = set(bpy.context.scene.objects)
    for j in range(13):
        z = -.25+1.2*(j+.5)/13
        a = j*math.pi*(3-math.sqrt(5))+phase
        direction = Vector((math.sqrt(1-z*z)*math.cos(a), math.sqrt(1-z*z)*math.sin(a), z))
        radial = foliage_radius(direction, phase, .10)*.99
        p = Vector(position)+Vector(tuple(direction[k]*scale[k]*radial for k in range(3)))
        normal = Vector(tuple(direction[k]/scale[k] for k in range(3))).normalized()
        leaf_cushion('Bush_leaf_cluster', p, (.095, .075, .023),
                     'leaf_light' if z > .6 else colour, normal, a)
    join([o for o in bpy.context.scene.objects if o not in before],
         'Bush_leaf_clusters_'+str(i), (0, 0, 0))
for x, y, z in [(-.10, -.15, .70), (.08, .06, .73)]:
    leaf_tuft('Bush_leaf_tuft', (x, y, z), .075, 'leaf_light', z*12)
for x, y, z in [(-.24, -.24, .49), (.23, -.18, .57), (.16, .27, .45), (-.23, .19, .60)]:
    blob('Bush_red_berry', (x, y, z), (.057, .054, .054), 'berry', segments=10, rings=5)
    blob('Bush_berry_calyx', (x, y, z+.048), (.023, .023, .012), 'leaf_deep',
         segments=6, rings=3)
objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
fit_bounds(objects, (-.413742989, -.309391439, 0), (.413743019, .309391439, .8))
preserve_original_contract('bush')
complete('bush', (.827486008, .618782878, .8), reach=.16, budget=2000)
