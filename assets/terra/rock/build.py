"""Three softly bevelled fieldstones with moss cushions and grass at their feet."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from terra_common import *
import bmesh

reset(230)
EXPECTED = {
    'variant_0': ((-.435637295, -.374382079, 0), (.435637295, .374382079, .4)),
    'variant_1': ((-.396837831, -.337737262, 0), (.396837831, .337737262, .58)),
    'variant_2': ((-.441259176, -.346094191, 0), (.441259176, .346094191, .38)),
}


def stone(name, x, y, width, depth, height, colour, phase):
    vertices = []
    for z, size, shift in [(0, .66, 0), (.29, 1, .09), (.77, .84, -.06), (1, .42, .10)]:
        for i in range(8):
            a = i*math.tau/8+.17
            wobble = 1+.08*math.sin(i*2.7+phase)
            vertices.append((x+math.cos(a)*width*.5*size*wobble+shift*width,
                             y+math.sin(a)*depth*.5*size*wobble, z*height))
    faces = [tuple(range(7, -1, -1))]
    faces += [(j*8+i, j*8+(i+1)%8, (j+1)*8+(i+1)%8, (j+1)*8+i)
              for j in range(3) for i in range(8)]
    faces.append(tuple(range(24, 32)))
    obj = mesh(name, vertices, faces, paint(colour))
    soften(obj, min(width, depth, height)*.12, segments=2, weighted=False)
    # Bevel clamping can leave duplicate corner vertices on the smallest pebble.
    data = bmesh.new()
    data.from_mesh(obj.data)
    bmesh.ops.remove_doubles(data, verts=list(data.verts), dist=1e-6)
    data.to_mesh(obj.data)
    data.free()
    normal = obj.modifiers.new('Broad stone faces', 'WEIGHTED_NORMAL')
    normal.keep_sharp = True
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=normal.name)
    # Soft moss patches sit on sloping shoulders rather than a green polygon cap.
    for i, (dx, dy, dz, r) in enumerate([(-.05, .02, .975, .26), (.09, .07, .94, .14),
                                       (-.13, -.07, .92, .12)]):
        leafy_blob('Rock_moss_cushion', (x+width*dx, y+depth*dy, height*dz),
            (width*r, depth*r, height*.045), 'moss' if i else 'leaf_cool',
            phase+i, segments=16 if i == 0 else 8, rings=7 if i == 0 else 4, relief=.25)


for n in range(3):
    before = set(bpy.context.scene.objects)
    root = empty('variant_'+str(n))
    if n == 0:
        stone('Rock_broad_boulder', 0, 0, .78, .72, .40, 'stone', .4)
        grass_x, grass_y = -.27, -.25
    elif n == 1:
        stone('Rock_tall_split_boulder', -.06, .02, .61, .60, .58, 'stone_light', 1.2)
        stone('Rock_broken_shard', .22, -.15, .35, .40, .27, 'stone_deep', 2.1)
        grass_x, grass_y = -.25, .23
    else:
        stone('Rock_low_cluster_left', -.21, .04, .45, .53, .31, 'stone', 2.6)
        stone('Rock_low_cluster_right', .15, .02, .48, .55, .38, 'stone_light', 3.5)
        stone('Rock_small_front_pebble', 0, -.25, .30, .26, .19, 'stone_deep', 4.1)
        grass_x, grass_y = .25, .22
    for j, (dx, dy) in enumerate([(-.08, 0), (.08, .04), (0, -.05)]):
        curved_leaf('decor_Grass', (grass_x+dx, grass_y+dy, .01),
                    (grass_x+dx+.07, grass_y+dy+.035, .19+j*.025), .065,
                    'sprout' if j == 1 else 'leaf_cool', bow=.035)
    parts = [o for o in bpy.context.scene.objects if o not in before and o != root]
    fit_bounds(parts, *EXPECTED[root.name])
    parent_objects(parts, root)
preserve_original_contract('rock')
complete('rock', EXPECTED, reach=.18, budget=2000, root_prefix='variant_')
