"""Terra machine details and checks against the shipped models' swap contracts."""
import sys
sys.dont_write_bytecode = True
from mathutils import Quaternion
import terra_common as terra
from terra_common import *
from common import _canonical_glb

# Machine-only additions; the pilot palette and its shared module stay untouched.
COLOURS.update({'solar': '#294e66', 'solar_light': '#688e9a',
                'grain': '#d8b76d', 'lamp': '#ffe3a0'})


def tube(name, a, b, width, colour='ivory', segments=12):
    return soften(beam(name, a, b, width, paint(colour), segments),
                  min(.012, width*.15), 1)


def hoop(name, location, radius, thickness, colour='orange', rot=None, segments=16):
    bpy.ops.mesh.primitive_torus_add(major_segments=segments, minor_segments=6,
        location=location, major_radius=radius, minor_radius=thickness)
    obj = bpy.context.object
    if rot:
        obj.rotation_euler = rot
    return smooth(finish(obj, name, paint(colour)))


def tuft(x, y, z=0, scale=1):
    # Rounded, tapered leaves lean outwards in a little fan; all remain decor_.
    for i, (dx,dy,h) in enumerate([(-.07,0,.16),(.07,.035,.21),(0,-.04,.24)]):
        obj = blob('decor_Grass', (x+dx*scale,y+dy*scale,z+h*scale/2),
                   (.035*scale,.025*scale,h*scale/2),
                   ['leaf_deep','leaf','leaf_light'][i], phase=i, segments=8,rings=5)
        obj.rotation_euler = (.12*(i-1), .32*(i-1), .3*i)


def pot(x, y, z=0, radius=.19):
    round_cylinder('decor_Terracotta_planter',(x,y,z+.14),radius,.28,'orange',
                   top=radius*1.12,segments=12)
    smooth(cylinder('decor_Planter_soil',(x,y,z+.285),radius*.95,.07,paint('recess'),12))
    for i,(dx,dy) in enumerate([(-.10,0),(.10,.03),(0,-.10)]):
        blob('decor_Living_leaves',(x+dx,y+dy,z+.40),(.16,.14,.16),
             ['leaf_deep','leaf','leaf_light'][i],phase=i,segments=10,rings=6)


def creeper(a,b):
    tube('decor_Vine_stem',a,b,.055,'leaf_deep',8)
    for i,t in enumerate([.2,.5,.8]):
        blob('decor_Vine_leaf',Vector(a).lerp(Vector(b),t),(.14,.10,.11),
             ['leaf','leaf_light','leaf_cool'][i],phase=i,segments=10,rings=6)


def solar_roof(name, location, size, tilt=0):
    w,d = size
    rot = Matrix.Rotation(tilt,4,'X')
    def at(x,y,z):
        return Vector(location)+rot@Vector((x,y,z))
    frame = soft_box(name+'_timber_frame',location,(w,d,.12),'ivory',.045)
    frame.rotation_euler.x = tilt
    glass = soft_box(name+'_blue_glass',at(0,0,.075),(w-.13,d-.13,.055),'solar',.022)
    glass.rotation_euler.x = tilt
    for x,y,sx,sy in [(-w/6,0,.026,d-.13),(w/6,0,.026,d-.13),(0,0,w-.13,.026)]:
        obj=detail_box(name+'_cell_separator',at(x,y,.107),(sx,sy,.018),'solar_light',.006)
        obj.rotation_euler.x=tilt


def read_contract(name):
    """Read original GLB nodes and actual vertices, without rebuilding originals."""
    raw=(ROOT/'public'/'models'/f'{name}.glb').read_bytes()
    n=struct.unpack_from('<I',raw,12)[0]
    doc=json.loads(raw[20:20+n])
    binary=20+n+8
    conversion=Matrix.Rotation(math.pi/2,4,'X')  # glTF Y-up -> Blender Z-up
    worlds={}
    def visit(index,parent):
        node=doc['nodes'][index]
        if 'matrix' in node:
            matrix=Matrix([node['matrix'][i:i+4] for i in range(0,16,4)]).transposed()
        else:
            q=node.get('rotation',[0,0,0,1])
            matrix=Matrix.LocRotScale(Vector(node.get('translation',[0,0,0])),
                Quaternion((q[3],q[0],q[1],q[2])),Vector(node.get('scale',[1,1,1])))
        world=parent@matrix
        worlds[index]=world
        for child in node.get('children',[]):
            visit(child,world)
    for index in doc['scenes'][doc.get('scene',0)]['nodes']:
        visit(index,Matrix.Identity(4))
    contract={}
    points=[]
    for index,node in enumerate(doc['nodes']):
        world=conversion@worlds[index]@conversion.inverted()
        node_points=[]
        contract[node['name']]=(world,node.get('extras',{}),None)
        if 'mesh' not in node:
            continue
        for primitive in doc['meshes'][node['mesh']]['primitives']:
            accessor=doc['accessors'][primitive['attributes']['POSITION']]
            view=doc['bufferViews'][accessor['bufferView']]
            offset=binary+view.get('byteOffset',0)+accessor.get('byteOffset',0)
            assert accessor['componentType']==5126
            for i in range(accessor['count']):
                p=Vector(struct.unpack_from('<3f',raw,offset+i*view.get('byteStride',12)))
                point=conversion@worlds[index]@p
                points.append(point)
                node_points.append(point)
        node_low=Vector(tuple(min(p[i] for p in node_points) for i in range(3)))
        node_high=Vector(tuple(max(p[i] for p in node_points) for i in range(3)))
        contract[node['name']]=(world,node.get('extras',{}),(node_low,node_high))
    low=Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high=Vector(tuple(max(p[i] for p in points) for i in range(3)))
    return contract,low,high


def restore_contract(objects,contract):
    """Keep new world geometry but restore every original node's origin and basis."""
    for name,(world,extras,_) in contract.items():
        obj=bpy.data.objects.get(name)
        assert obj is not None, 'Missing original node: '+name
        bpy.context.view_layer.update()
        if obj.type=='MESH':
            obj.data.transform(world.inverted()@obj.matrix_world)
        obj.matrix_world=world
        for key,value in extras.items():
            obj[key]=value
    bpy.context.view_layer.update()
    for name,(world,extras,_) in contract.items():
        obj=bpy.data.objects[name]
        assert max(abs(obj.matrix_world[i][j]-world[i][j]) for i in range(4) for j in range(4))<1e-5,name
        assert all(obj[k]==v for k,v in extras.items()),name


def state_preview(name,objects):
    """Pilot lighting; original machine layout: idle/running rows, four columns."""
    sheets=[]
    for running in [False,True]:
        before=set(bpy.context.scene.objects)
        for obj in objects:
            obj.hide_render=(obj.name.startswith('running_') and not running or
                             obj.name.startswith('idle_') and running)
        machine_preview(name,objects)
        img=bpy.data.images.load(str(terra.TERRA/name/'preview.png'),check_existing=False)
        sheets.append(list(img.pixels))
        bpy.data.images.remove(img)
        for obj in set(bpy.context.scene.objects)-before:
            bpy.data.objects.remove(obj,do_unlink=True)
    pixels=[0.]*(1024*512*4)
    for state,source in enumerate(sheets):
        for view in range(4):
            for line in range(256):
                src=((1-view//2)*256+line)*512*4+(view%2)*256*4
                dst=((1-state)*256+line)*1024*4+view*256*4
                pixels[dst:dst+1024]=source[src:src+1024]
    img=bpy.data.images.new(name+' states',width=1024,height=512,alpha=True)
    img.pixels.foreach_set(pixels)
    img.filepath_raw=str(terra.TERRA/name/'preview.png')
    img.file_format='PNG'
    img.save()
    for obj in objects:
        obj.hide_render=False


def machine_complete(name, footprint, states=False, reach=.25):
    objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
    contract,low,high=read_contract(name)
    # Fit static silhouettes; moving geometry additionally stays anchored on its axle.
    bpy.context.view_layer.update()
    spinning={o.name:(o.matrix_world.translation.copy(),
              [o.matrix_world@v.co for v in o.data.vertices])
              for o in objects if o.name.startswith('move_spin_')}
    fit_bounds(objects,low,high)
    for key,(anchor,points) in spinning.items():
        obj=bpy.data.objects[key]
        world,_,(target_low,target_high)=contract[key]
        target_anchor=world.translation
        source_low=Vector(tuple(min(p[i] for p in points) for i in range(3)))
        source_high=Vector(tuple(max(p[i] for p in points) for i in range(3)))
        inverse=obj.matrix_world.inverted()
        for vertex,point in zip(obj.data.vertices,points):
            fitted=[]
            for i in range(3):
                side_low=point[i]<anchor[i]
                source_end=source_low[i] if side_low else source_high[i]
                target_end=target_low[i] if side_low else target_high[i]
                ratio=(target_end-target_anchor[i])/(source_end-anchor[i])
                fitted.append(target_anchor[i]+(point[i]-anchor[i])*ratio)
            vertex.co=inverse@Vector(fitted)
        obj.data.update()
    restore_contract(objects,contract)
    counts={False:0,True:0}
    for obj in objects:
        obj.data.calc_loop_triangles()
        assert all(t.area>1e-10 for t in obj.data.loop_triangles),obj.name+' degenerate'
        assert all(p.use_smooth for p in obj.data.polygons),obj.name+' flat'
        for state in counts:
            if (obj.name.startswith('running_') and not state or obj.name.startswith('idle_') and state):
                continue
            counts[state]+=len(obj.data.loop_triangles)
        for uv in list(obj.data.uv_layers):
            obj.data.uv_layers.remove(uv)
        for vertex in obj.data.vertices:
            p=obj.matrix_world@vertex.co
            assert abs(p.x)<=footprint/2+1e-5 and abs(p.y)<=footprint/2+1e-5,obj.name+' footprint'
            if obj.name.startswith('move_spin_'):
                axis=(obj.matrix_world.to_3x3()@Vector((1,0,0))).normalized()
                delta=p-obj.matrix_world.translation
                axial=obj.matrix_world.translation+axis*delta.dot(axis)
                radial=(delta-axis*delta.dot(axis)).length
                for i in [0,1]:
                    assert abs(axial[i])+radial*math.sqrt(max(0,1-axis[i]**2))<=footprint/2+1e-5,obj.name+' sweep'
                assert axial.z-radial*math.sqrt(max(0,1-axis.z**2))>=-1e-5,obj.name+' below-ground sweep'
    if max(counts.values())>6000:
        print('BUDGET_PARTS', [(o.name,len(o.data.loop_triangles)) for o in objects],flush=True)
    assert max(counts.values())<=6000,counts
    actual_low,actual_high=bounds(objects)
    assert (actual_low-low).length<1e-5 and (actual_high-high).length<1e-5
    bake_machine_colours(objects,reach,states)
    path=ROOT/'public'/'models'/'terra'/f'{name}.glb'
    path.parent.mkdir(parents=True,exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',export_yup=True,
        export_apply=True,export_cameras=False,export_lights=False,export_image_format='NONE',
        export_texcoords=False,export_extras=True,export_normals=True,export_materials='EXPORT',
        export_animations=False,export_vertex_color='ACTIVE',export_all_vertex_colors=False)
    _canonical_glb(path)
    raw=path.read_bytes(); n=struct.unpack_from('<I',raw,12)[0]; doc=json.loads(raw[20:20+n])
    assert not doc.get('images') and not doc.get('textures') and not doc.get('animations')
    exported=0
    for data in doc['meshes']:
        for p in data['primitives']:
            assert 'NORMAL' in p['attributes'] and 'COLOR_0' in p['attributes']
            assert not any(k.startswith('TEXCOORD') for k in p['attributes'])
            exported+=doc['accessors'][p['indices']]['count']//3
    assert exported==sum(len(o.data.loop_triangles) for o in objects)
    assert all(m['pbrMetallicRoughness'].get('baseColorFactor',[1,1,1,1])==[1,1,1,1] for m in doc['materials'])
    assert set(contract)<=set(n['name'] for n in doc['nodes'])
    print('MODEL_READY',name,'visible triangles',counts,'exported',exported,
          'dimensions',tuple(round(v,6) for v in high-low),flush=True)
    if states:
        state_preview(name,objects)
    else:
        machine_preview(name,objects)


def detail_box(name, location, size, colour, radius=.008, emission=0):
    """A small folded detail with one bevel band, keeping busy machines light."""
    return soften(box(name,location,size,paint(colour,emission)),min(radius,min(size)*.4),1)


def machine_preview(name,objects):
    """Pilot's four views and lighting, framed for the projected machine silhouette."""
    scene=bpy.context.scene
    scene.render.engine='CYCLES'
    scene.cycles.device='CPU'
    scene.cycles.samples=32
    scene.cycles.use_denoising=True
    scene.cycles.seed=1701
    scene.render.threads_mode='FIXED'
    scene.render.threads=8
    scene.world.use_nodes=True
    background=scene.world.node_tree.nodes.get('Background')
    background.inputs['Color'].default_value=(.64,.74,.84,1)
    background.inputs['Strength'].default_value=.55
    bpy.ops.object.light_add(type='SUN',location=(-3,-4,7))
    sun=bpy.context.object
    sun.data.energy=2.0
    sun.data.angle=math.radians(18)
    sun.data.color=(1,.91,.77)
    sun.rotation_euler=Vector((.6,.8,-1.6)).to_track_quat('-Z','Y').to_euler()
    scene.view_settings.view_transform='Standard'
    scene.view_settings.look='None'
    scene.view_settings.exposure=0
    scene.view_settings.gamma=1
    scene.render.film_transparent=False
    scene.render.resolution_x=scene.render.resolution_y=256
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'
    low,high=bounds(objects)
    target=(low+high)/2
    views=[Vector((x*math.cos(math.pi/6),y*math.cos(math.pi/6),.5))
           for x,y in [(0,-1),(0,1),(-1,0),(1,0)]]
    points=[o.matrix_world@v.co-target for o in objects for v in o.data.vertices]
    extent=0
    for direction in views:
        right=direction.cross(Vector((0,0,1))).normalized()
        up=right.cross(direction).normalized()
        extent=max(extent,max(max(abs(p.dot(right)),abs(p.dot(up))) for p in points))
    bpy.ops.object.camera_add()
    camera=bpy.context.object
    camera.data.type='ORTHO'
    camera.data.ortho_scale=max(max(high-low)*1.24,extent*2*1.12)
    scene.camera=camera
    temp=terra.TERRA/name/'preview.view.png'
    pixels=[0.]*(512*512*4)
    for index,direction in enumerate(views):
        camera.location=target+direction*20
        camera.rotation_euler=(-direction).to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(temp)
        bpy.ops.render.render(write_still=True)
        img=bpy.data.images.load(str(temp),check_existing=False)
        source=list(img.pixels)
        for line in range(256):
            start=((1-index//2)*256+line)*512*4+(index%2)*256*4
            pixels[start:start+1024]=source[line*1024:(line+1)*1024]
        bpy.data.images.remove(img)
        temp.unlink()
    sheet=bpy.data.images.new(name+' four views',width=512,height=512,alpha=True)
    sheet.pixels.foreach_set(pixels)
    sheet.filepath_raw=str(terra.TERRA/name/'preview.png')
    sheet.file_format='PNG'
    sheet.save()


def bake_machine_colours(objects,reach,states):
    """Common parts use a neutral bake; state surfaces see only their own state."""
    if not states:
        bake_colours(objects,reach)
        return
    common=[o for o in objects if not o.name.startswith(('idle_','running_'))]
    bake_colours(common,reach)
    for prefix in ['idle_','running_']:
        parts=[o for o in objects if o.name.startswith(prefix)]
        if not parts:
            continue
        # The pilot baker writes every supplied mesh. Retain its original common
        # bake while using those meshes as occluders for this state's surfaces.
        bake_colours(common+parts,reach)
        for obj in common:
            attributes=obj.data.color_attributes
            attributes.remove(attributes.active_color)
            attributes.active_color=attributes['Color']
            attributes.render_color_index=0
