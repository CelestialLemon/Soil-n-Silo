"""Shared deterministic geometry and the single Soil n Silo colour palette.

Blender Z-up, metres, front -Y. Runtime GLB is Y-up. No image materials.
"""
import bpy
import json
import math
import random
import struct
from pathlib import Path
from mathutils import Vector, Matrix

ROOT = Path(__file__).resolve().parents[1]
PALETTE = {
    'feather': '#fff5e2', 'chalk': '#f2e8cc', 'cream': '#e5c992',
    'red': '#bb4743', 'red_light': '#d65a4b', 'tomato': '#e25136',
    'pumpkin': '#e58a32', 'pumpkin_dark': '#bc6127',
    'gold': '#ddba57', 'straw': '#b48d42',
    'green': '#528447', 'leaf': '#76a84e', 'darkleaf': '#326043', 'sprout': '#91bc61',
    'wood': '#8a6a44', 'lightwood': '#a07a50', 'darkwood': '#59432f', 'bark': '#674735',
    'stone': '#898c83', 'stone_light': '#b5ad94', 'slate': '#4b6470', 'slate_light': '#627c84',
    'iron': '#38484a', 'black': '#262d2c', 'clay': '#cb7852', 'brick': '#aa523c',
    'sack': '#c5aa70', 'glow': '#ffd68b', 'fire': '#ff9c39',
    'dung': '#68412e', 'dung_light': '#8a5835',
}
MATERIAL_NAMES = {
    'feather': 'Hen ivory feathers', 'chalk': 'Eggshell warm white', 'cream': 'Cream linen and trim',
    'red': 'Barn vermilion paint', 'red_light': 'Warm scarlet paint', 'tomato': 'Ripe tomato red',
    'pumpkin': 'Pumpkin orange', 'pumpkin_dark': 'Pumpkin russet ribs',
    'gold': 'Ripe wheat gold', 'straw': 'Nest straw ochre',
    'green': 'Plant stem green', 'leaf': 'Leaf meadow green', 'darkleaf': 'Deep foliage green',
    'sprout': 'Fresh sprout green', 'wood': 'Weathered honey wood', 'lightwood': 'Sunlit honey wood',
    'darkwood': 'Dark walnut timber', 'bark': 'Oak bark brown', 'stone': 'Warm grey fieldstone',
    'stone_light': 'Pale sandstone', 'slate': 'Blue slate roof', 'slate_light': 'Slate ridge highlight',
    'iron': 'Forged blue iron', 'black': 'Charcoal eyes and interior', 'clay': 'Warm terracotta clay',
    'brick': 'Fired red brick', 'sack': 'Seed sack burlap', 'glow': 'Warm window light',
    'fire': 'Oven amber fire', 'dung': 'Manure cocoa brown', 'dung_light': 'Manure warm brown',
}
_MATERIALS = {}


def reset(seed=42):
    random.seed(seed)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for data in list(bpy.data.materials):
        if not data.users:
            bpy.data.materials.remove(data)
    _MATERIALS.clear()
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1


def material(key, emission=0):
    cache_key = (key, emission)
    if cache_key in _MATERIALS:
        return _MATERIALS[cache_key]
    srgb = [int(PALETTE[key][i:i+2], 16)/255 for i in (1, 3, 5)]
    rgb = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in srgb]
    name = MATERIAL_NAMES[key] + (' emissive' if emission else '')
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1)
    m.use_nodes = True
    shader = m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*rgb, 1)
    shader.inputs['Roughness'].default_value = .85
    if emission:
        shader.inputs['Emission Color'].default_value = (*rgb, 1)
        shader.inputs['Emission Strength'].default_value = emission
    _MATERIALS[cache_key] = m
    return m


def finish(obj, name, colour):
    obj.name = name
    if colour:
        obj.data.materials.append(material(colour) if isinstance(colour, str) else colour)
    return obj


def mesh(name, vertices, faces, colour):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, colour)


def box(name, location, size, colour, rot=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if rot:
        obj.rotation_euler = rot
    return finish(obj, name, colour)


def cylinder(name, location, radius, height, colour, vertices=8, rot=None, top=None):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius,
                                  radius2=radius if top is None else top,
                                  depth=height, location=location)
    obj = bpy.context.object
    if rot:
        obj.rotation_euler = rot
    return finish(obj, name, colour)


def sphere(name, location, scale, colour, segments=8, rings=4):
    vertices = [(0, 0, 1)]
    for j in range(1, rings):
        latitude = j*math.pi/rings
        for i in range(segments):
            longitude = i*math.tau/segments
            vertices.append((math.sin(latitude)*math.cos(longitude),
                             math.sin(latitude)*math.sin(longitude), math.cos(latitude)))
    south = len(vertices)
    vertices.append((0, 0, -1))
    faces = [(0, 1+i, 1+(i+1)%segments) for i in range(segments)]
    for j in range(rings-2):
        for i in range(segments):
            a, b = 1+j*segments+i, 1+j*segments+(i+1)%segments
            faces.append((a, a+segments, b+segments, b))
    start = 1+(rings-2)*segments
    faces += [(start+i, south, start+(i+1)%segments) for i in range(segments)]
    obj = mesh(name, vertices, faces, colour)
    obj.location = location
    obj.scale = scale
    return obj


def beam(name, a, b, width, colour, vertices=4):
    a, b = Vector(a), Vector(b)
    radius = width/math.sqrt(2) if vertices == 4 else width/2
    obj = cylinder(name, (a+b)/2, radius, (b-a).length, colour, vertices)
    obj.rotation_euler = (b-a).to_track_quat('Z', 'Y').to_euler()
    return obj


def leaf(name, a, b, width, colour):
    """Chunky eight-triangle diamond with a raised ridge, no alpha/texture."""
    a, b = Vector(a), Vector(b)
    mid = (a+b)/2
    direction = b-a
    side = Vector((-direction.y, direction.x, 0)).normalized()*width/2
    vertices = [a, mid+side, b, mid-side, mid+Vector((0, 0, .035)), mid-Vector((0, 0, .025))]
    return mesh(name, vertices, [(4,1,0),(4,2,1),(4,3,2),(4,0,3),
                                 (5,0,1),(5,1,2),(5,2,3),(5,3,0)], colour)


def empty(name, location=(0,0,0)):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    return obj


def parent_objects(objects, parent):
    bpy.context.view_layer.update()
    for obj in objects:
        world = obj.matrix_world.copy()
        obj.parent = parent
        obj.matrix_world = world


def stage(number, builder):
    before = set(bpy.context.scene.objects)
    root = empty('stage_'+str(number))
    builder()
    parent_objects([o for o in bpy.context.scene.objects if o not in before and o != root], root)
    return root


def pivot(obj, position):
    bpy.context.scene.cursor.location = position
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')


def join(objects, name, position):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = name
    pivot(obj, position)
    return obj


def orient_x(obj, direction):
    bpy.context.view_layer.update()
    old = obj.matrix_world.copy()
    q = Vector(direction).normalized().to_track_quat('X', 'Z')
    world = Matrix.LocRotScale(old.translation, q, Vector((1,1,1)))
    obj.data.transform(world.inverted() @ old)
    obj.matrix_world = world


def extrude_xz(name, polygon, y, depth, colour):
    """CCW polygon seen in X/Z, extruded with outward faces."""
    n = len(polygon)
    vertices = [(x, y+dy, z) for dy in [-depth/2, depth/2] for x,z in polygon]
    faces = [tuple(range(n)), tuple(range(2*n-1,n-1,-1))]
    faces += [(i,i+n,(i+1)%n+n,(i+1)%n) for i in range(n)]
    return mesh(name, vertices, faces, colour)


def roof(name, width, depth, eave, ridge, colour='slate', thickness=.10):
    half = width/2
    for side in [-1, 1]:
        a = side*half
        # A closed roof panel, intentionally broad with no subpixel shingles.
        obj = mesh(name+('_left' if side<0 else '_right'),
             [(0,-depth/2,ridge),(a,-depth/2,eave),(a,depth/2,eave),(0,depth/2,ridge),
              (0,-depth/2,ridge-thickness),(a,-depth/2,eave-thickness),
              (a,depth/2,eave-thickness),(0,depth/2,ridge-thickness)],
             [(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)], colour)
        if side < 0:
            for polygon in obj.data.polygons:
                polygon.flip()


def window(name, x, y, z, width=.5, height=.6, side=False, lit=True):
    colour = material('glow', .5) if lit else material('slate_light')
    if side:
        box(name+'_light', (x,y,z), (.07,width,height), colour)
        for dy in [-width/2,width/2]:
            box(name+'_jamb', (x,y+dy,z), (.10,.09,height+.14), 'cream')
        for dz in [-height/2,height/2]:
            box(name+'_sill', (x,y,z+dz), (.10,width+.17,.09), 'cream')
        box(name+'_mullion', (x,y,z), (.11,.075,height), 'cream')
    else:
        box(name+'_light', (x,y,z), (width,.07,height), colour)
        for dx in [-width/2,width/2]:
            box(name+'_jamb', (x+dx,y,z), (.09,.10,height+.14), 'cream')
        for dz in [-height/2,height/2]:
            box(name+'_sill', (x,y,z+dz), (width+.17,.10,.09), 'cream')
        box(name+'_mullion', (x,y,z), (.075,.11,height), 'cream')


def arch_polygon(width, bottom, spring, segments=8):
    r = width/2
    return [(-r,bottom),(r,bottom),(r,spring)] + [
        (r*math.cos(i*math.pi/segments),spring+r*math.sin(i*math.pi/segments))
        for i in range(1,segments+1)]


def centre_xy():
    bpy.context.view_layer.update()
    points = [o.matrix_world@v.co for o in bpy.context.scene.objects if o.type=='MESH' for v in o.data.vertices]
    offset = Vector((-(min(p.x for p in points)+max(p.x for p in points))/2,
                     -(min(p.y for p in points)+max(p.y for p in points))/2,0))
    for o in bpy.context.scene.objects:
        if o.parent is None:
            if o.name.startswith('stage_'):
                for child in o.children:
                    child.location += offset
            else:
                o.location += offset


def _canonical_glb(path):
    data = bytearray(path.read_bytes())
    offset = 12
    while offset < len(data):
        length, kind = struct.unpack_from('<II',data,offset)
        if kind == 0x4e4f534a:
            doc = json.loads(data[offset+8:offset+8+length])
        elif kind == 0x004e4942:
            binary_offset = offset+8
        offset += length+8
    for mesh_data in doc['meshes']:
        for primitive in mesh_data['primitives']:
            acc = doc['accessors'][primitive['indices']]
            view = doc['bufferViews'][acc['bufferView']]
            fmt = {5121:'B',5123:'H',5125:'I'}[acc['componentType']]
            count = acc['count']
            start = binary_offset+view.get('byteOffset',0)+acc.get('byteOffset',0)
            indices = struct.unpack_from('<'+fmt*count,data,start)
            triangles = []
            for i in range(0,count,3):
                tri = indices[i:i+3]
                triangles.append(min(tri,tri[1:]+tri[:1],tri[2:]+tri[:2]))
            ordered = [v for tri in sorted(triangles) for v in tri]
            struct.pack_into('<'+fmt*count,data,start,*ordered)
    path.write_bytes(data)


def export_and_preview(name, budget, stages=False):
    """Validate geometry, export ALL states, then render cardinal contact sheets.

    Static sheets: front/back/left/right in a 2x2 grid. Crop sheets: stages
    top to bottom, same four directions left to right. Coop/oven sheets have
    closed/open and idle/running rows respectively. Camera pitch = 30 deg.
    """
    bpy.context.view_layer.update()
    meshes = [o for o in bpy.context.scene.objects if o.type=='MESH']
    points = []
    counts = {}
    for obj in meshes:
        obj.data.calc_loop_triangles()
        root = obj
        while root.parent:
            root = root.parent
        key = root.name if stages else name
        counts[key] = counts.get(key,0)+len(obj.data.loop_triangles)
        points.extend(obj.matrix_world@v.co for v in obj.data.vertices)
        for tri in obj.data.loop_triangles:
            a,b,c = [obj.data.vertices[i].co for i in tri.vertices]
            assert (b-a).cross(c-a).length>1e-10, 'Degenerate '+obj.name
        assert all(not f.use_smooth for f in obj.data.polygons), 'Smooth mesh '+obj.name
    low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
    assert low.z >= -.001, f'Below ground: {low.z}'
    assert abs(low.x+high.x)<.1 and abs(low.y+high.y)<.1, 'Footprint not centred'
    assert max(counts.values()) <= budget, f'Triangle budget: {counts} > {budget}'
    output = ROOT/'public'/'models'/f'{name}.glb'
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', export_yup=True,
        export_apply=True, export_cameras=False, export_lights=False,
        export_image_format='NONE', export_texcoords=False, export_extras=True,
        export_normals=True, export_materials='EXPORT', export_animations=False)
    _canonical_glb(output)
    print('MODEL_READY',name,json.dumps(counts),'dimensions',tuple(round(v,3) for v in high-low), flush=True)
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_WORKBENCH'
    shading = scene.display.shading
    shading.light = 'STUDIO'
    shading.color_type = 'MATERIAL'
    shading.show_shadows = True
    shading.show_cavity = True
    shading.cavity_type = 'BOTH'
    shading.show_specular_highlight = False
    shading.background_type = 'WORLD'
    scene.world.color = (.11,.14,.16)
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    scene.render.film_transparent = False
    size = 256
    scene.render.resolution_x = scene.render.resolution_y = size
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    bpy.ops.object.camera_add()
    camera = bpy.context.object
    camera.data.type = 'ORTHO'
    scene.camera = camera
    target = (low+high)/2
    # Same framing for every direction and stage, so growth stays comparable.
    camera.data.ortho_scale = max(high.x-low.x,high.y-low.y,high.z-low.z)*1.38
    stage_roots = sorted([o for o in scene.objects if o.name.startswith('stage_')], key=lambda o:o.name)
    stateful = name in ('coop', 'oven')
    rows = len(stage_roots) if stages else 2
    columns = 4 if stages or stateful else 2
    sheet_width, sheet_height = columns*size, rows*size
    pixels = [0.0]*(sheet_width*sheet_height*4)
    variants = stage_roots if stages else ([False,True] if stateful else [None])
    door = bpy.data.objects.get('door') if name == 'coop' else None
    door_rotation = door.rotation_euler.copy() if door else None
    directions = [(0,-1,0),(0,1,0),(-1,0,0),(1,0,0)]
    for s,root in enumerate(variants):
        if door:
            door.rotation_euler.z = math.radians(-105) if root else 0
        for obj in meshes:
            if stages:
                obj.hide_render = obj.parent != root
            elif obj.name.startswith('running_'):
                obj.hide_render = not bool(root)
            elif obj.name.startswith('idle_'):
                obj.hide_render = bool(root)
        for index,(x,y,_) in enumerate(directions):
            direction = Vector((x*math.cos(math.pi/6),y*math.cos(math.pi/6),.5))
            camera.location = target+direction*20
            camera.rotation_euler = (-direction).to_track_quat('-Z','Y').to_euler()
            # File-backed result works in headless Workbench (Render Result pixels may be empty).
            temp = Path('/tmp')/f'soil-n-silo-{name}-{s}-{index}.png'
            scene.render.filepath = str(temp)
            bpy.ops.render.render(write_still=True)
            image = bpy.data.images.load(str(temp),check_existing=False)
            source = list(image.pixels)
            row,col = (s,index) if stages or stateful else (index//2,index%2)
            for line in range(size):
                start = ((rows-1-row)*size+line)*sheet_width*4+col*size*4
                pixels[start:start+size*4] = source[line*size*4:(line+1)*size*4]
            bpy.data.images.remove(image)
            temp.unlink()
    sheet = bpy.data.images.new(name+' four views',width=sheet_width,height=sheet_height,alpha=True)
    sheet.pixels.foreach_set(pixels)
    sheet.filepath_raw = str(ROOT/'assets'/name/'preview.png')
    sheet.file_format = 'PNG'
    sheet.save()
    for obj in meshes:
        obj.hide_render = False
    if door:
        door.rotation_euler = door_rotation
