"""Chunky shared details for the solarpunk machines; all dimensions are metres."""
from common import *


def rounded_box(name, location, size, colour, radius=.08):
    obj = box(name, location, size, colour)
    bevel = obj.modifiers.new('Crafted rounded corners', 'BEVEL')
    bevel.width = min(radius,min(size)*.4)
    bevel.segments = 2
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    return obj


def ring(name, location, radius, thickness, colour, rot=None):
    bpy.ops.mesh.primitive_torus_add(major_segments=12, minor_segments=4,
        location=location, major_radius=radius, minor_radius=thickness)
    obj = bpy.context.object
    if rot:
        obj.rotation_euler = rot
    return finish(obj, name, colour)


def planter(x, y, z=0, radius=.20):
    cylinder('decor_Terracotta_planter', (x,y,z+.14), radius, .28, 'clay', 8, top=radius*1.12)
    cylinder('decor_Planter_soil', (x,y,z+.285), radius*.95, .07, 'darkwood', 8)
    for dx,dy in [(-.10,0),(.10,.03),(0,-.10)]:
        sphere('decor_Living_leaves', (x+dx,y+dy,z+.40), (.16,.14,.16), 'leaf', 6, 3)


def grass(x, y):
    for dx,dy in [(-.08,0),(.08,.04),(0,-.05)]:
        leaf('decor_Grass', (x+dx,y+dy,.01), (x+dx+.07,y+dy+.035,.25), .10, 'sprout')


def vine(a, b):
    a,b = Vector(a),Vector(b)
    beam('decor_Vine_stem', a, b, .065, 'darkleaf', 6)
    for t in [.2,.5,.8]:
        p = a.lerp(b,t)
        sphere('decor_Vine_leaf', p, (.14,.10,.11), 'leaf', 6, 3)


def wheel(name, hub, radius, colour='wood', speed=1.5):
    hub = Vector(hub)
    parts = [ring('Crafted_wheel_rim',hub,radius,.065,colour,(math.pi/2,0,0)),
             cylinder('Brass_axle',hub,.105,.20,'brass',8,rot=(math.pi/2,0,0))]
    for a in [0,math.pi/3,2*math.pi/3]:
        d = Vector((math.cos(a),0,math.sin(a)))*(radius-.04)
        parts.append(beam('Wheel_spoke',hub-d,hub+d,.075,'lightwood'))
    obj = join(parts,name,hub)
    orient_x(obj,(0,-1,0))
    obj['speed'] = speed
    return obj


def solar_tile(name, location, size, tilt=0):
    """Closed blue glass tile with bold cell separators, tilted about X."""
    x,y,z = location
    w,d = size
    rot = Matrix.Rotation(tilt,4,'X')
    def point(dx,dy,dz):
        return Vector(location)+rot@Vector((dx,dy,dz))
    box(name+'_timber_frame',location,(w,d,.12),'lightwood',rot=(tilt,0,0))
    box(name+'_blue_glass',point(0,0,.075),(w-.13,d-.13,.055),'solar',rot=(tilt,0,0))
    for dx in [-w/6,w/6]:
        box(name+'_cell_separator',point(dx,0,.11),(.065,d-.13,.025),'solar_light',rot=(tilt,0,0))
    box(name+'_cell_separator',point(0,0,.11),(w-.13,.065,.025),'solar_light',rot=(tilt,0,0))


def build_complete(name, footprint, states=False, budget=3000, airborne=False):
    """Check static and swept bounds, then use the existing export pipeline."""
    centre_xy()
    bpy.context.view_layer.update()
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH':
            continue
        for v in obj.data.vertices:
            p = obj.matrix_world@v.co
            assert abs(p.x) <= footprint/2+1e-5, f'{obj.name} outside X footprint'
            assert abs(p.y) <= footprint/2+1e-5, f'{obj.name} outside Y footprint'
            if obj.name.startswith('move_spin_'):
                axis = (obj.matrix_world.to_3x3()@Vector((1,0,0))).normalized()
                delta = p-obj.matrix_world.translation
                axial = obj.matrix_world.translation+axis*delta.dot(axis)
                radial = (delta-axis*delta.dot(axis)).length
                for i in [0,1]:
                    reach = abs(axial[i])+radial*math.sqrt(max(0,1-axis[i]**2))
                    assert reach <= footprint/2+1e-5, f'{obj.name} rotation outside footprint'
                if not airborne:
                    assert axial.z-radial*math.sqrt(max(0,1-axis.z**2)) >= -.001, 'Rotation below ground'
    export_and_preview(name,budget,states=states,airborne=airborne)
