"""Smooth Terra-style pilot: geometry, deterministic vertex AO, GLB and previews."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import *
from common import _canonical_glb
from mathutils.bvhtree import BVHTree
from mathutils import Quaternion
from mathutils.noise import noise

TERRA = Path(__file__).resolve().parent
COLOURS = {
    'ivory': '#f3eee0', 'white': '#fff8e8', 'orange': '#d95e3b',
    'slate': '#3b505b', 'trim': '#6d8087', 'recess': '#263c46',
    'bark': '#887052', 'wood': '#a18a5c', 'moss': '#718449',
    'leaf': '#80a94e', 'leaf_light': '#93b65b', 'leaf_deep': '#64944e',
    'leaf_gold': '#8cad50', 'leaf_cool': '#6c9e58',
    'pine': '#487e61', 'pine_light': '#72a273', 'pine_deep': '#396a56',
    'berry': '#cf5946', 'stone': '#8e9c9b', 'stone_light': '#b3b8a7',
    'stone_deep': '#6c8186', 'grain': '#dfbd68', 'grain_light': '#edce81',
    'straw': '#b89b56', 'sprout': '#9dbf68',
}


def paint(key, emission=0):
    name = 'Terra ' + key + (f' emissive {emission:g}' if emission else '')
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    rgb = [int(COLOURS[key][i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055)**2.4 for v in rgb]
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*linear, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (1, 1, 1, 1)
    shader.inputs['Roughness'].default_value = .82
    shader.inputs['Specular IOR Level'].default_value = .22
    if emission:
        shader.inputs['Emission Color'].default_value = (*linear, 1)
        shader.inputs['Emission Strength'].default_value = emission
    colour = mat.node_tree.nodes.new('ShaderNodeVertexColor')
    colour.layer_name = 'Color'
    mat.node_tree.links.new(colour.outputs['Color'], shader.inputs['Base Color'])
    return mat


def smooth(obj):
    for face in obj.data.polygons:
        face.use_smooth = True
    return obj


def soften(obj, radius=.04, segments=3, weighted=True):
    bpy.context.view_layer.objects.active = obj
    bevel = obj.modifiers.new('Soft moulded edges', 'BEVEL')
    bevel.width = radius
    bevel.segments = segments
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    smooth(obj)
    if weighted:
        normal = obj.modifiers.new('Broad face normals', 'WEIGHTED_NORMAL')
        normal.keep_sharp = True
        normal.weight = 40
        bpy.ops.object.modifier_apply(modifier=normal.name)
    return obj


def soft_box(name, location, size, colour, radius=.03, emission=0):
    return soften(box(name, location, size, paint(colour, emission)), min(radius, min(size)*.45), segments=2)


def round_cylinder(name, location, radius, height, colour, top=None, rot=None,
                   bevel=.012, segments=20):
    obj = cylinder(name, location, radius, height, paint(colour), segments, rot, top)
    return soften(obj, min(bevel, height*.23, radius*.3), segments=2)


def blob(name, location, scale, colour, phase=0, segments=20, rings=12, emission=0):
    obj = sphere(name, location, scale, paint(colour, emission), segments, rings)
    # Broad, gentle bulges rather than random vertex noise or faceted geometry.
    for vertex in obj.data.vertices:
        p = vertex.co
        longitude = math.atan2(p.y, p.x)
        waist = max(0, 1-p.z*p.z)
        amount = 1 + .045*math.sin(3*longitude+phase)*waist + .025*math.sin(5*p.z+phase)
        p.x *= amount
        p.y *= amount
    return smooth(obj)


def leafy_blob(name, location, scale, colour, phase=0, segments=20, rings=10,
               relief=.14):
    """Soft leaf masses with coherent small clumps, rather than inflated lobes."""
    obj = sphere(name, location, scale, paint(colour), segments, rings)
    for vertex in obj.data.vertices:
        vertex.co *= foliage_radius(vertex.co, phase, relief)
    return smooth(obj)


def foliage_radius(direction, phase, relief):
    """Shared radial field lets small leaf cushions nest into the main surface."""
    shift = Vector((phase*1.37, phase*.83, phase*1.91))
    n = noise(direction*3.4+shift, noise_basis='PERLIN_ORIGINAL')
    fine = noise(direction*6.7+shift, noise_basis='PERLIN_ORIGINAL')
    return 1 + relief*n + relief*.18*fine


def leaf_cushion(name, location, scale, colour, direction=(0, 0, 1), phase=0):
    """A tiny smooth 20-triangle leaf cluster, flattened against its branch mass."""
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1, location=location)
    obj = finish(bpy.context.object, name, paint(colour))
    obj.scale = scale
    obj.rotation_euler = Vector(direction).to_track_quat('Z', 'Y').to_euler()
    # Rotate the little leaf cushion within its tangent plane.
    obj.rotation_euler = (obj.rotation_euler.to_quaternion() @
                          Quaternion((0, 0, 1), phase)).to_euler()
    return smooth(obj)


def leaf_tuft(name, location, radius, colour, phase=0):
    """Three overlapping, flattened young-leaf clusters (72 triangles total)."""
    for i in range(3):
        a = phase+i*math.tau/3
        obj = blob(name, Vector(location)+Vector((radius*.32*math.cos(a),
                   radius*.32*math.sin(a), radius*.06*(i%2))),
                   (radius*.80, radius*.49, radius*.26), colour,
                   phase+i, segments=6, rings=3)
        obj.rotation_euler = (.12*math.sin(a), .16*math.cos(a), a)


def curved_leaf(name, a, b, width, colour, bow=.025, segments=5):
    """Closed plump blade with a curved centreline and a tapered tip."""
    a, b = Vector(a), Vector(b)
    side = Vector((-(b-a).y, (b-a).x, 0)).normalized()
    if side.length < .1:
        side = Vector((1, 0, 0))
    vertices = [tuple(a)]
    for j in range(1, segments):
        t = j/segments
        centre = a.lerp(b, t)+Vector((0, 0, bow*math.sin(t*math.pi)))
        radius = width*.5*math.sin(t*math.pi)**.7
        for i in range(4):
            angle = i*math.tau/4
            vertices.append(tuple(centre+side*(radius*math.cos(angle))+
                                  Vector((0, 0, width*.15*math.sin(angle)))))
    tip = len(vertices)
    vertices.append(tuple(b))
    faces = [(0, 1+(i+1)%4, 1+i) for i in range(4)]
    faces += [(1+j*4+i, 1+j*4+(i+1)%4, 1+(j+1)*4+(i+1)%4, 1+(j+1)*4+i)
              for j in range(segments-2) for i in range(4)]
    last = 1+(segments-2)*4
    faces += [(last+i, last+(i+1)%4, tip) for i in range(4)]
    return smooth(mesh(name, vertices, faces, paint(colour)))


def preserve_original_contract(name):
    """Retain every original node's name, parent, transform and custom extras.

    Move only mesh-local geometry when restoring a transform: the new sculpture
    stays put. Original GLBs are read-only contract references, never overwritten.
    """
    raw = (ROOT/'public'/'models'/f'{name}.glb').read_bytes()
    doc = json.loads(raw[20:20+struct.unpack_from('<I', raw, 12)[0]])
    basis = Matrix.Rotation(math.pi/2, 4, 'X')
    def visit(index, parent_world, parent_name=None):
        node = doc['nodes'][index]
        if 'matrix' in node:
            local = Matrix([node['matrix'][i:i+4] for i in range(0, 16, 4)]).transposed()
        else:
            q = node.get('rotation', [0, 0, 0, 1])
            local = Matrix.LocRotScale(Vector(node.get('translation', [0, 0, 0])),
                Quaternion((q[3], q[0], q[1], q[2])), Vector(node.get('scale', [1, 1, 1])))
        world = parent_world @ local
        obj = bpy.data.objects.get(node['name'])
        assert obj is not None, 'Missing original node '+node['name']
        assert (obj.parent.name if obj.parent else None) == parent_name, obj.name+' parent'
        old = obj.matrix_world.copy()
        restored = basis @ world @ basis.inverted()
        if obj.type == 'MESH':
            obj.data.transform(restored.inverted() @ old)
        obj.matrix_world = restored
        for key, value in node.get('extras', {}).items():
            obj[key] = value
        bpy.context.view_layer.update()
        for child in node.get('children', []):
            visit(child, world, node['name'])
    bpy.context.view_layer.update()
    for index in doc['scenes'][doc.get('scene', 0)]['nodes']:
        visit(index, Matrix.Identity(4))


def bounds(objects):
    bpy.context.view_layer.update()
    points = [o.matrix_world @ v.co for o in objects for v in o.data.vertices]
    return (Vector(tuple(min(p[i] for p in points) for i in range(3))),
            Vector(tuple(max(p[i] for p in points) for i in range(3))))


def fit_bounds(objects, low, high):
    """Fit mesh geometry in world space; object origins/animation axes stay fixed."""
    old_low, old_high = bounds(objects)
    low, high = Vector(low), Vector(high)
    scale = Vector(tuple((high[i]-low[i])/(old_high[i]-old_low[i]) for i in range(3)))
    for obj in objects:
        world = obj.matrix_world.copy()
        inverse = world.inverted()
        for vertex in obj.data.vertices:
            point = world @ vertex.co
            point = Vector(tuple(low[i]+(point[i]-old_low[i])*scale[i] for i in range(3)))
            vertex.co = inverse @ point
        obj.data.update()


def bake_colours(objects, reach):
    """Bake linear albedo * local AO * cool-bottom/warm-top gradient to Color."""
    bpy.context.view_layer.update()
    vertices, faces = [], []
    for obj in objects:
        offset = len(vertices)
        vertices.extend(obj.matrix_world @ v.co for v in obj.data.vertices)
        faces.extend(tuple(offset+i for i in p.vertices) for p in obj.data.polygons)
    bvh = BVHTree.FromPolygons(vertices, faces)
    low, high = bounds(objects)
    # Fixed cosine-weighted hemisphere, no random state or Cycles bake dependency.
    samples = []
    for i in range(40):
        r = math.sqrt((i+.5)/40)
        a = i*math.pi*(3-math.sqrt(5))
        samples.append(Vector((r*math.cos(a), r*math.sin(a), math.sqrt(1-r*r))))
    for obj in objects:
        obj.data.update()
        normals = obj.matrix_world.to_3x3().inverted().transposed()
        colours = obj.data.color_attributes.new(name='Color', type='FLOAT_COLOR', domain='CORNER')
        obj.data.color_attributes.active_color = colours
        obj.data.color_attributes.render_color_index = 0
        cached = {}
        for loop in obj.data.loops:
            index = loop.vertex_index
            if index not in cached:
                vertex = obj.data.vertices[index]
                point = obj.matrix_world @ vertex.co
                normal = (normals @ vertex.normal).normalized()
                rotation = normal.to_track_quat('Z', 'Y')
                occlusion = 0
                for sample in samples:
                    hit, _, _, distance = bvh.ray_cast(point+normal*.003, rotation @ sample, reach)
                    if hit is not None:
                        occlusion += 1 - .45*distance/reach
                ao = 1 - .48*occlusion/len(samples)
                height = (point.z-low.z)/(high.z-low.z)
                # No fixed compass-direction light baked into the spinning rotor.
                light = (.84+.16*height) * (.92+.08*max(-1, min(1, normal.z)))
                cool = ( .87+.13*height, .94+.06*height, 1.0 )
                cached[index] = tuple(ao*light*c for c in cool)
        # Material assignment is per polygon (joined rotor has several paints).
        for polygon in obj.data.polygons:
            mat = obj.data.materials[polygon.material_index]
            for loop_index in polygon.loop_indices:
                shade = cached[obj.data.loops[loop_index].vertex_index]
                colours.data[loop_index].color = tuple(mat.diffuse_color[i]*shade[i] for i in range(3))+(1,)
        print('VERTEX_COLOUR', obj.name, len(cached), flush=True)


def preview(name, objects, root_prefix=None):
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.cycles.seed = 1701
    scene.render.threads_mode = 'FIXED'
    scene.render.threads = 8
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get('Background')
    background.inputs['Color'].default_value = (.64, .74, .84, 1)
    background.inputs['Strength'].default_value = .55
    bpy.ops.object.light_add(type='SUN', location=(-3,-4,7))
    sun = bpy.context.object
    sun.data.energy = 2.0
    sun.data.angle = math.radians(18)
    sun.data.color = (1, .91, .77)
    sun.rotation_euler = Vector((.6,.8,-1.6)).to_track_quat('-Z','Y').to_euler()
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    scene.render.film_transparent = False
    scene.render.resolution_x = scene.render.resolution_y = 256
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    low, high = bounds(objects)
    target = (low+high)/2
    bpy.ops.object.camera_add()
    camera = bpy.context.object
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = max(high-low)*1.24
    scene.camera = camera
    # Keep temporary images within the permitted output directory, then remove.
    temp = TERRA/name/'preview.view.png'
    roots = sorted([o for o in scene.objects if root_prefix and o.name.startswith(root_prefix)],
                   key=lambda o: o.name) if root_prefix else [None]
    rows, columns = (len(roots), 4) if root_prefix else (2, 2)
    width, height = columns*256, rows*256
    pixels = [0.]*(width*height*4)
    hidden = {o: o.hide_render for o in objects}
    try:
        for row, root in enumerate(roots):
            if root_prefix:
                for obj in objects:
                    ancestor = obj
                    while ancestor.parent:
                        ancestor = ancestor.parent
                    obj.hide_render = ancestor != root
            for index, (x,y) in enumerate([(0,-1),(0,1),(-1,0),(1,0)]):
                direction = Vector((x*math.cos(math.pi/6), y*math.cos(math.pi/6), .5))
                camera.location = target+direction*20
                camera.rotation_euler = (-direction).to_track_quat('-Z','Y').to_euler()
                scene.render.filepath = str(temp)
                bpy.ops.render.render(write_still=True)
                image = bpy.data.images.load(str(temp), check_existing=False)
                source = list(image.pixels)
                r, c = (row, index) if root_prefix else (index//2, index%2)
                for line in range(256):
                    start = ((rows-1-r)*256+line)*width*4+c*256*4
                    pixels[start:start+1024] = source[line*1024:(line+1)*1024]
                bpy.data.images.remove(image)
                temp.unlink()
    finally:
        for obj, value in hidden.items():
            obj.hide_render = value
        if temp.exists():
            temp.unlink()
    sheet = bpy.data.images.new(name+' four views', width=width, height=height, alpha=True)
    sheet.pixels.foreach_set(pixels)
    sheet.filepath_raw = str(TERRA/name/'preview.png')
    sheet.file_format = 'PNG'
    sheet.save()


def complete(name, expected, reach=.4, budget=6000, root_prefix=None):
    objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    bpy.context.view_layer.update()
    triangles = 0
    groups = {}
    counts = {}
    for obj in objects:
        root = obj
        while root.parent:
            root = root.parent
        key = root.name if root_prefix else name
        if root_prefix:
            assert key.startswith(root_prefix), obj.name+' outside a state root'
            assert root.location.length < 1e-7 and root.rotation_euler.to_matrix() == Matrix.Identity(3)
            assert (root.scale-Vector((1, 1, 1))).length < 1e-7
        groups.setdefault(key, []).append(obj)
        obj.data.calc_loop_triangles()
        triangles += len(obj.data.loop_triangles)
        counts[key] = counts.get(key, 0)+len(obj.data.loop_triangles)
        assert all(t.area > 1e-10 for t in obj.data.loop_triangles), obj.name+' degenerate'
        assert all(f.use_smooth for f in obj.data.polygons), obj.name+' flat shaded'
        for layer in list(obj.data.uv_layers):
            obj.data.uv_layers.remove(layer)
    low, high = bounds(objects)
    assert low.z >= -1e-5
    assert max(counts.values()) <= budget, counts
    if isinstance(expected, dict):
        assert groups.keys() == expected.keys(), groups.keys()
        for key, parts in groups.items():
            state_low, state_high = bounds(parts)
            want_low, want_high = expected[key]
            assert (state_low-Vector(want_low)).length < 1e-5, (key, state_low)
            assert (state_high-Vector(want_high)).length < 1e-5, (key, state_high)
    else:
        assert all(abs((high-low)[i]-expected[i]) < .002 for i in range(3)), (low, high)
    if name == 'wind_turbine':
        rotor = bpy.data.objects['move_spin_rotor']
        assert (rotor.location-Vector((.001249969, -.251110647, 3.62))).length < 1e-5
        axis = (rotor.matrix_world.to_3x3() @ Vector((1,0,0))).normalized()
        assert (axis-Vector((0,-1,0))).length < 1e-5
        assert rotor['speed'] == 1.2
        for obj in objects:
            for v in obj.data.vertices:
                p = obj.matrix_world @ v.co
                if obj == rotor:
                    delta = p-rotor.location
                    radial = (delta-axis*delta.dot(axis)).length
                    assert rotor.location.z-radial >= 2.3, 'Rotor sweep below clearance'
                else:
                    assert abs(p.x) <= .5 and abs(p.y) <= .5, 'Outside one tile'
    # Overlapping variants/stages must not occlude each other in the bake.
    for parts in groups.values():
        bake_colours(parts, reach)
    # Palette is now entirely in Color. All shaders have identical white factors;
    # one material slot also avoids Blender 5.2's white-placeholder colours on
    # secondary primitives that use the same named vertex attribute.
    baked_material = paint('white')
    for obj in objects:
        # Emissive parts retain their palette-coloured emission through export.
        if any(mat.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value >= .5
               for mat in obj.data.materials):
            continue
        obj.data.materials.clear()
        obj.data.materials.append(baked_material)
        for polygon in obj.data.polygons:
            polygon.material_index = 0
    output = ROOT/'public'/'models'/'terra'/f'{name}.glb'
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', export_yup=True,
        export_apply=True, export_cameras=False, export_lights=False,
        export_image_format='NONE', export_texcoords=False, export_extras=True,
        export_normals=True, export_materials='EXPORT', export_animations=False,
        export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    _canonical_glb(output)
    # Check the actual GLB, not only Blender's source meshes.
    raw = output.read_bytes()
    length = struct.unpack_from('<I', raw, 12)[0]
    doc = json.loads(raw[20:20+length])
    exported = 0
    for mesh_data in doc['meshes']:
        for p in mesh_data['primitives']:
            assert 'COLOR_0' in p['attributes'] and 'NORMAL' in p['attributes']
            assert 'TEXCOORD_0' not in p['attributes']
            accessor = doc['accessors'][p['attributes']['COLOR_0']]
            view = doc['bufferViews'][accessor['bufferView']]
            components = {'VEC3': 3, 'VEC4': 4}[accessor['type']]
            code = {5121: 'B', 5123: 'H', 5126: 'f'}[accessor['componentType']]
            maximum = {5121: 255, 5123: 65535, 5126: 1}[accessor['componentType']]
            if code != 'f':
                assert accessor.get('normalized'), 'Unnormalised vertex colours'
            fmt = '<'+code*components
            stride = view.get('byteStride', struct.calcsize(fmt))
            start = 28+length+view.get('byteOffset', 0)+accessor.get('byteOffset', 0)
            has_albedo = False
            for i in range(accessor['count']):
                colour = struct.unpack_from(fmt, raw, start+i*stride)
                assert all(math.isfinite(c) and 0 <= c <= maximum for c in colour)
                if components == 4:
                    assert colour[3] == maximum, 'Nonopaque baked colour'
                has_albedo |= any(c < maximum*.9999 for c in colour[:3])
            assert has_albedo, mesh_data['name']+' has white placeholder COLOR_0'
            exported += doc['accessors'][p['indices']]['count']//3
    assert not doc.get('images') and not doc.get('textures')
    assert exported == triangles
    assert all(m['pbrMetallicRoughness'].get('baseColorFactor', [1,1,1,1]) == [1,1,1,1]
               for m in doc['materials'])
    print('MODEL_READY', name, json.dumps(counts), 'triangles; dimensions', tuple(round(v,6) for v in high-low), flush=True)
    preview(name, objects, root_prefix=root_prefix)
