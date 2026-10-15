"""Shared geometry and review studio for the three unselected turbine candidates.

Game assets are exported before the studio is added. Build scripts remain the
source of truth; the saved .blend is a convenient editable review deliverable.
"""
from solarpunk import *


HUB_Z = 3.68
HUB = Vector((0, -.28, HUB_Z))


def blade(name, angle, stations, colour='ceramic', tip_colour=None):
    """A closed, faceted airfoil with swept centreline and a raised chord ridge.

    Stations are (radius, tangential sweep, half chord, half thickness).
    All rings have four vertices, so the tip is closed without zero-area faces.
    """
    radial = Vector((math.cos(angle), 0, math.sin(angle)))
    tangent = Vector((-math.sin(angle), 0, math.cos(angle)))
    vertices = []
    for radius, sweep, width, depth in stations:
        for chord, y in [(-width, 0), (0, -depth), (width, 0), (0, depth)]:
            vertices.append(HUB + radial*radius + tangent*(sweep+chord) + Vector((0, y, 0)))
    faces = [tuple(range(4))]
    for i in range(len(stations)-1):
        for j in range(4):
            a, b = i*4+j, i*4+(j+1)%4
            faces.append((a, a+4, b+4, b))
    faces.append(tuple(reversed(range(len(vertices)-4, len(vertices)))))
    obj = mesh(name, vertices, faces, colour)
    if tip_colour:
        obj.data.materials.append(material(tip_colour))
        for face in list(obj.data.polygons)[-5:]:
            face.material_index = 1
    return obj


def nacelle(colour='ceramic'):
    rounded_box('Crafted_nacelle', (0, .045, HUB_Z), (.24, .48, .25), colour, .09)
    cylinder('Copper_yaw_bearing', (0, .02, 3.49), .125, .12, 'copper', 10)
    box('Nacelle_copper_rear_band', (0, .24, HUB_Z), (.20, .065, .20), 'copper')


def rotor(parts):
    parts.append(cylinder('Rotor_hub', HUB, .14, .15, 'copper', 12, rot=(math.pi/2, 0, 0)))
    parts.append(sphere('Ceramic_spinner', HUB+Vector((0, -.085, 0)), (.105, .105, .105), 'ceramic', 10, 4))
    obj = join(parts, 'move_spin_rotor', HUB)
    orient_x(obj, (0, -1, 0))
    obj['speed'] = 1.2
    return obj


def complete(name):
    """Run the production checks, then save native Blender and extra views."""
    build_complete(name, 1, overhang_above=2.3)
    scene = bpy.context.scene
    model_objects = list(scene.objects)
    # The production helper leaves a preview camera. Replace it with a studio
    # camera; keep all studio objects in their own collection in the .blend.
    for obj in model_objects:
        if obj.type == 'CAMERA':
            bpy.data.objects.remove(obj, do_unlink=True)
    studio = bpy.data.collections.new('REVIEW_STUDIO (not exported)')
    scene.collection.children.link(studio)

    def studio_object(obj):
        for collection in list(obj.users_collection):
            collection.objects.unlink(obj)
        studio.objects.link(obj)
        return obj

    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.render.threads_mode = 'FIXED'
    scene.render.threads = 6
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get('Background')
    background.inputs['Color'].default_value = (.72, .79, .84, 1)
    background.inputs['Strength'].default_value = .65
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -.015))
    ground = studio_object(bpy.context.object)
    ground.name = 'Studio ground (not part of model)'
    mat = bpy.data.materials.new('Studio sage backdrop')
    mat.diffuse_color = (.21, .27, .24, 1)
    mat.use_nodes = True
    mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value = mat.diffuse_color
    mat.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value = 1
    ground.data.materials.append(mat)
    bpy.ops.object.light_add(type='AREA', location=(-3, -4, 8))
    light = studio_object(bpy.context.object)
    light.name = 'Studio softbox'
    light.data.energy = 700
    light.data.shape = 'DISK'
    light.data.size = 5
    light.rotation_euler = (Vector((0, 0, 2))-light.location).to_track_quat('-Z', 'Y').to_euler()
    bpy.ops.object.camera_add()
    camera = studio_object(bpy.context.object)
    camera.name = 'Review camera'
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 6.1
    scene.camera = camera
    size = 640
    scene.render.resolution_x = scene.render.resolution_y = size
    scene.render.resolution_percentage = 100
    scene.render.image_settings.color_mode = 'RGB'
    target = Vector((0, 0, 2.4))
    folder = ROOT/'assets'/name
    # Same camera distance, scale, pitch and lighting for all three models.
    for view, (x, y) in [('front-right', (1, -1)), ('back-right', (1, 1)),
                         ('back-left', (-1, 1)), ('front-left', (-1, -1))]:
        direction = Vector((x, y, 0)).normalized()*math.cos(math.pi/6)
        direction.z = .5
        camera.location = target + direction*18
        camera.rotation_euler = (-direction).to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = str(folder/f'{view}.png')
        bpy.ops.render.render(write_still=True)
    # Save opening on the most descriptive view, with only the rotor selected.
    camera.location = target + Vector((math.sqrt(3/8), -math.sqrt(3/8), .5))*18
    camera.rotation_euler = (target-camera.location).to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = str(folder/'front-right.png')
    bpy.ops.object.select_all(action='DESELECT')
    moving = scene.objects['move_spin_rotor']
    moving.select_set(True)
    bpy.context.view_layer.objects.active = moving
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                area.spaces.active.region_3d.view_perspective = 'CAMERA'
                area.spaces.active.overlay.show_overlays = False
                area.spaces.active.shading.color_type = 'MATERIAL'
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(folder/f'{name}.blend'), compress=True)
