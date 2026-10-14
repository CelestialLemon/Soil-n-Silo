"""A lush conifer with scalloped branch skirts and soft little needle sprays."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from terra_common import *

reset(115)
round_cylinder('Pine_trunk', (0, 0, .59), .14, 1.18, 'bark', top=.10,
               segments=12, bevel=.015)
for i in range(3):
    a = i*math.tau/3
    obj = beam('Pine_root', (0, 0, .13), (.27*math.cos(a), .27*math.sin(a), .07),
               .115, paint('bark'), 8)
    soften(obj, .015, 2)

for tier, (base, radius, height, colour) in enumerate([
        (.74, .81, 1.24, 'pine_deep'), (1.41, .63, 1.22, 'pine'),
        (2.08, .43, 1.12, 'pine_light')]):
    # Layered boughs curl down at their tips, with uneven six-fold scallops.
    profile = [(0, .27), (.06, .80), (.17, 1), (.33, .81), (.53, .61),
               (.73, .39), (.91, .17)]
    count = 28
    vertices = []
    for z, r in profile:
        for i in range(count):
            a = i*math.tau/count
            wave = math.sin(6*a+tier*.9)+.38*math.sin(11*a+.7)
            rr = radius*r*(1+.10*wave*(1-z))
            vertices.append((rr*math.cos(a)+.025*z*math.sin(tier),
                             rr*math.sin(a), base+z*height+.025*wave*(1-z)))
    tip = len(vertices)
    vertices.append((.025*math.sin(tier), 0, base+height))
    faces = [tuple(range(count-1, -1, -1))]
    faces += [(j*count+i, j*count+(i+1)%count, (j+1)*count+(i+1)%count, (j+1)*count+i)
              for j in range(len(profile)-1) for i in range(count)]
    faces += [((len(profile)-1)*count+i, (len(profile)-1)*count+(i+1)%count, tip)
              for i in range(count)]
    smooth(mesh('Pine_foliage_tier', vertices, faces, paint(colour)))
    # Small tapered sprays interrupt the skirts, never a stack of perfect cones.
    for j in range(9):
        a = j*math.tau/9+tier*.65
        d = Vector((math.cos(a), math.sin(a), 0))
        z = base+height*(.26 if j%2 else .16)
        start = d*(radius*.48)+Vector((0, 0, z+.08))
        end = d*(radius*(1.06 if j%2 else 1.14))+Vector((0, 0, z-.025))
        curved_leaf('Pine_needle_spray', start, end, radius*.30,
                    'pine' if tier == 0 else 'pine_light', bow=.055)
        for side in [-1, 1]:
            tangent = Vector((-d.y, d.x, 0))*side
            curved_leaf('Pine_needle_spray_tip', start.lerp(end, .5),
                        end-d*(radius*.11)+tangent*(radius*.12), radius*.14,
                        colour, bow=.025, segments=3)
    before = set(bpy.context.scene.objects)
    for row, (z, r) in enumerate([(.43, .72), (.63, .50), (.81, .28)]):
        for j in range(8):
            a = j*math.tau/8+row*.44+tier*.65
            d = Vector((math.cos(a), math.sin(a), 0))
            start = d*(radius*r*.88)+Vector((0, 0, base+height*(z+.09)))
            end = d*(radius*(r+.15))+Vector((0, 0, base+height*(z-.07)))
            curved_leaf('Pine_surface_spray', start, end, radius*.24,
                        colour if j%3 else 'pine_light', bow=.025, segments=3)
    join([o for o in bpy.context.scene.objects if o not in before],
         'Pine_surface_sprays_'+str(tier), (0, 0, 0))

objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
fit_bounds(objects, (-.797694266, -.785575509, 0), (.797694266, .785575509, 3.2))
preserve_original_contract('tree_pine')
complete('tree_pine', (1.595388532, 1.571151018, 3.2), reach=.38)
