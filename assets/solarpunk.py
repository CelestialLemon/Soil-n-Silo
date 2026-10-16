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


def build_complete(name, footprint, states=False, budget=3000, overhang_above=None,
                   front_water_parts=()):
    """Check static and swept bounds, then use the existing export pipeline.

    footprint is a square side length or an (X, Y) pair for rectangular models.
    overhang_above lets a move_spin_ part (a turbine's rotor) sweep past the footprint, as long as its whole swept disc
    stays above that height, clear of the buildings beside it.

    front_water_parts explicitly names the water wheel and its axle/bearings.
    Only these meshes may extend 0.9 m past the front (-Y) bank edge. Named
    spinning geometry may dip to -0.26 m; static parts remain above ground.
    Their complete swept bounds are checked against that envelope; every
    other mesh stays grounded inside the bank footprint. Bank-anchored
    geometry must not be recentered around its overhanging wheel.
    """
    bounds = (footprint, footprint) if isinstance(footprint, (int, float)) else footprint
    assert not (front_water_parts and overhang_above is not None), 'Choose one overhang convention'
    if not front_water_parts:
        centre_xy()
    bpy.context.view_layer.update()
    normal_bounds = ((-bounds[0]/2,-bounds[1]/2,0),(bounds[0]/2,bounds[1]/2,math.inf))
    overrides = {part: ((-bounds[0]/2,-bounds[1]/2-.9,-.26 if part.startswith('move_spin_') else 0),
                        (bounds[0]/2,bounds[1]/2,1.3)) for part in front_water_parts}
    assert set(front_water_parts) <= {o.name for o in bpy.context.scene.objects if o.type == 'MESH'}, 'Unknown water part'
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH':
            continue
        for v in obj.data.vertices:
            p = obj.matrix_world@v.co
            spins = obj.name.startswith('move_spin_')
            lower,upper = overrides.get(obj.name,normal_bounds)
            if obj.name in overrides:
                assert all(lower[i]-1e-5 <= p[i] <= upper[i]+1e-5 for i in range(3)), f'{obj.name} outside front water envelope'
            elif not (spins and overhang_above is not None):
                assert abs(p.x) <= bounds[0]/2+1e-5, f'{obj.name} outside X footprint'
                assert abs(p.y) <= bounds[1]/2+1e-5, f'{obj.name} outside Y footprint'
            if spins:
                axis = (obj.matrix_world.to_3x3()@Vector((1,0,0))).normalized()
                delta = p-obj.matrix_world.translation
                axial = obj.matrix_world.translation+axis*delta.dot(axis)
                radial = (delta-axis*delta.dot(axis)).length
                if overhang_above is not None:
                    low = axial.z-radial*math.sqrt(max(0,1-axis.z**2))
                    assert low >= overhang_above, f'{obj.name} sweeps below {overhang_above} m: {low:.3f}'
                    assert abs(axial.x) <= bounds[0]/2+1e-5 and abs(axial.y) <= bounds[1]/2+1e-5, f'{obj.name} hub outside footprint'
                    continue
                for i in [0,1]:
                    reach = radial*math.sqrt(max(0,1-axis[i]**2))
                    assert axial[i]-reach >= lower[i]-1e-5 and axial[i]+reach <= upper[i]+1e-5, f'{obj.name} rotation outside footprint'
                low = axial.z-radial*math.sqrt(max(0,1-axis.z**2))
                high = axial.z+radial*math.sqrt(max(0,1-axis.z**2))
                assert low >= lower[2]-.001 and high <= upper[2]+.001, 'Rotation outside vertical bounds'
    export_and_preview(name,budget,states=states,
                       bounds=normal_bounds if front_water_parts else None,
                       bounds_overrides=overrides)
