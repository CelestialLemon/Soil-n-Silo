"""Low-face tree masses and origin-anchored variants; no per-leaf geometry.

Every species has a model per season where its look changes: `<name>` is the
summer model, `<name>_spring`, `<name>_autumn` and `<name>_winter` the others,
built by the same script (`seasonal`). Their previews sit beside the summer one
as `preview_<season>.png`.
"""
from common import *

SEASONS = ('spring', 'summer', 'autumn', 'winter')


def stem(name, rings, colour='bark', sides=7):
    """Bent tapered trunk with a flat grounded foot (x, y, z, radius)."""
    vertices = [(x+r*math.cos(i*math.tau/sides), y+r*math.sin(i*math.tau/sides), z)
                for x,y,z,r in rings for i in range(sides)]
    faces = [tuple(range(sides-1,-1,-1))]
    for j in range(len(rings)-1):
        for i in range(sides):
            a,b = j*sides+i,j*sides+(i+1)%sides
            faces.append((a,b,b+sides,a+sides))
    faces.append(tuple(range((len(rings)-1)*sides,len(rings)*sides)))
    return mesh(name,vertices,faces,colour)


def crown(name, location, scale, colour, angle=0):
    obj = sphere(name+'_canopy',location,scale,colour,8,4)
    obj.rotation_euler.z = angle
    return obj


def bough(name, a, b, width, colour='bark'):
    """A bare branch of a crown. Unlike the trunk it may overhang the tile."""
    return beam(name+'_bough', a, b, width, colour, 4)


def twigs(name, location, scale, colour='twig', angle=0):
    """A low lump standing for a bare crown's mass of fine twigs."""
    obj = sphere(name+'_twigs_canopy', location, scale, colour, 6, 3)
    obj.rotation_euler.z = angle
    return obj


def model_name(name, season):
    return name if season == 'summer' else name+'_'+season


def preview_path(name, season):
    return ROOT/'assets'/name/('preview.png' if season == 'summer' else 'preview_'+season+'.png')


def each_season(name, seed, build, seasons=SEASONS):
    """Builds and exports one model per season, each from a clean scene."""
    for season in seasons:
        reset(seed)
        bpy.data.orphans_purge(do_recursive=True)
        build(season)


def seasonal(name, seed, builder, sizes, seasons=SEASONS):
    """`builder(n, season)` builds variant n; one GLB of three variants per season."""
    each_season(name, seed, lambda season: variants(
        model_name(name, season), lambda n: builder(n, season), sizes,
        preview=preview_path(name, season)), seasons)


def variants(name, builder, sizes, preview=None):
    """Roots stay at the trunk foot, even for leaning asymmetrical crowns.

    sizes = (X/Y scale, height scale, rotation). Crowns (`_canopy`, and a bare
    crown's `_bough`s) may overhang their tile; trunks stay inside it. Dimensions are world metres.
    """
    for n,(width,height,angle) in enumerate(sizes):
        before = set(bpy.context.scene.objects)
        root = empty('variant_'+str(n))
        builder(n)
        parts = [o for o in bpy.context.scene.objects if o not in before and o != root]
        transform = Matrix.Rotation(angle,4,'Z') @ Matrix.Diagonal((width,width,height,1))
        bpy.context.view_layer.update()
        for obj in parts:
            obj.matrix_world = transform @ obj.matrix_world
        parent_objects(parts,root)
        bpy.context.view_layer.update()
        leaves,points,triangles = [],[],0
        for obj in parts:
            obj.data.calc_loop_triangles()
            triangles += len(obj.data.loop_triangles)
            p = [obj.matrix_world@v.co for v in obj.data.vertices]
            points.extend(p)
            if '_canopy' in obj.name or '_bough' in obj.name:
                leaves.extend(p)
            elif 'fruit' not in obj.name and 'blossom' not in obj.name:
                assert all(max(abs(v.x),abs(v.y)) <= .5 for v in p), 'Woody stem outside tile: '+obj.name
        dimensions = [max(p[i] for p in points)-min(p[i] for p in points) for i in range(3)]
        crown_width = max(max(p[i] for p in leaves)-min(p[i] for p in leaves) for i in [0,1])
        assert triangles <= 700, f'{name} variant {n}: {triangles} triangles'
        print('TREE_VARIANT',name,n,'triangles',triangles,'height',round(dimensions[2],3),
              'crown_width',round(crown_width,3),flush=True)
    export_and_preview(name,700,stages=True,root_prefix='variant_',
                       bounds=((-1.5,-1.5,0),(1.5,1.5,4.6)),preview=preview)
