"""Eight softly curved wheat plants, from bright shoots to heavy golden ears."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from terra_common import *

reset(102)
POSITIONS = [(-.22, -.22), (.03, -.25), (.23, -.14), (-.27, .06),
             (-.04, .01), (.20, .12), (-.14, .24), (.10, .25)]
EXPECTED = {
    'stage_0': ((-.323513627, -.331933796, .008285159), (.278729200, .269166172, .124534443)),
    'stage_1': ((-.323513627, -.331933796, .029924348), (.310127914, .331933916, .304316908)),
    'stage_2': ((-.323513627, -.331933886, .032771505), (.310127914, .331933916, .592068255)),
    'stage_3': ((-.323513687, -.331933886, .032727443), (.323513687, .331933916, .706195951)),
}


def stalk(x, y, height, angle, colour):
    vertices = []
    centres = []
    for j in range(4):
        t = j/3
        centre = Vector((x+.035*math.cos(angle)*t*t, y+.035*math.sin(angle)*t*t,
                         .03+(height-.03)*t))
        centres.append(centre)
        radius = .018*(1-.35*t)
        for k in range(6):
            a = k*math.tau/6
            vertices.append(tuple(centre+Vector((radius*math.cos(a), radius*math.sin(a), 0))))
    faces = [tuple(range(5, -1, -1))]
    faces += [(j*6+k, j*6+(k+1)%6, (j+1)*6+(k+1)%6, (j+1)*6+k)
              for j in range(3) for k in range(6)]
    faces.append(tuple(range(18, 24)))
    smooth(mesh('decor_wheat_stalk', vertices, faces, paint(colour)))
    return centres[-1]


def ear(tip, angle):
    # A tapered central rachis with paired scallops reads as grain, not a cone.
    rows, sides = 9, 8
    vertices = []
    for j in range(rows):
        t = j/(rows-1)
        centre = tip+Vector((.026*t*math.cos(angle), .026*t*math.sin(angle), -.02+.16*t))
        radius = .010+.030*math.sin(math.pi*t)**.65
        for k in range(sides):
            a = k*math.tau/sides+angle
            r = radius*(1.12 if (j+k)%2 else .84)
            vertices.append(tuple(centre+Vector((r*math.cos(a), r*math.sin(a), 0))))
    faces = [tuple(range(sides-1, -1, -1))]
    faces += [(j*sides+k, j*sides+(k+1)%sides, (j+1)*sides+(k+1)%sides, (j+1)*sides+k)
              for j in range(rows-1) for k in range(sides)]
    faces.append(tuple(range((rows-1)*sides, rows*sides)))
    obj = smooth(mesh('Heavy_golden_ear', vertices, faces, paint('grain')))
    obj.data.materials.append(paint('grain_light'))
    for j, face in enumerate(obj.data.polygons):
        if j%8 in (2, 3):
            face.material_index = 1
    for k in range(2):
        a = angle+k*math.pi
        start = tip+Vector((.026*math.cos(a), .026*math.sin(a), .07))
        end = start+Vector((.022*math.cos(a), .022*math.sin(a), .11))
        smooth(beam('Wheat_soft_awn', start, end, .008, paint('grain_light'), 4))


for n in range(4):
    before = set(bpy.context.scene.objects)
    root = empty('stage_'+str(n))
    for i, (x, y) in enumerate(POSITIONS):
        angle = i*2.4
        height = [.105, .29, .57, .55][n]-.018*(i%3)
        tip = stalk(x, y, height, angle, 'straw' if n == 3 else 'sprout' if n == 0 else 'leaf_deep')
        length = .085 if n == 0 else .16
        z = height*.44
        curved_leaf('decor_wheat_blade', (x, y, z),
                    (x+length*math.cos(angle), y+length*math.sin(angle), z+length*.36),
                    .060 if n == 0 else .055, 'straw' if n == 3 else 'leaf_light',
                    bow=length*.29)
        if n < 3:
            a = angle+2.5
            curved_leaf('Wheat_second_blade', (x, y, height*.62),
                (x+length*.8*math.cos(a), y+length*.8*math.sin(a), height*.68),
                .040, 'sprout' if n == 0 else 'leaf_cool', bow=length*.25)
        if n == 3:
            ear(tip, angle)
    parts = [o for o in bpy.context.scene.objects if o not in before and o != root]
    fit_bounds(parts, *EXPECTED[root.name])
    parent_objects(parts, root)
preserve_original_contract('wheat')
complete('wheat', EXPECTED, reach=.10, budget=2000, root_prefix='stage_')
