"""Three overlapping, independent mossy fieldstone variants at the origin."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(230)


def stone(name, x, y, width, depth, height, colour):
    # Irregular octagonal rings, a grounded foot and a broad faceted crown.
    vertices=[]
    for z,scale,shift in [(0,.68,0),(height*.37,1,.13),(height*.81,.81,-.08),(height,.42,.12)]:
        for i in range(8):
            angle=i*math.tau/8+.17
            wobble=1+.09*math.sin(i*2.7+height*9)
            vertices.append((x+math.cos(angle)*width*.5*scale*wobble+shift*width,
                             y+math.sin(angle)*depth*.5*scale*wobble,z))
    faces=[tuple(range(7,-1,-1))]
    for ring_index in range(3):
        for i in range(8):
            a=ring_index*8+i
            b=ring_index*8+(i+1)%8
            faces.append((a,b,b+8,a+8))
    faces.append(tuple(range(24,32)))
    obj=mesh(name,vertices,faces,colour)
    obj.data.materials.append(material('moss'))
    obj.data.materials.append(material('stone_light'))
    for i in [18,19,25]:
        obj.data.polygons[i].material_index=1
    for i in [10,22]:
        obj.data.polygons[i].material_index=2


for n in range(3):
    before=set(bpy.context.scene.objects)
    root=empty('variant_'+str(n))
    if n==0:
        stone('Rock_broad_boulder',0,0,.78,.72,.40,'stone')
        grass(-.27,-.25)
    elif n==1:
        stone('Rock_tall_split_boulder',-.06,.02,.61,.60,.58,'stone_light')
        stone('Rock_broken_shard',.22,-.15,.35,.40,.27,'stone')
        grass(-.25,.23)
    else:
        stone('Rock_low_cluster_left',-.21,.04,.45,.53,.31,'stone')
        stone('Rock_low_cluster_right',.15,.02,.48,.55,.38,'stone_light')
        stone('Rock_small_front_pebble',0,-.25,.30,.26,.19,'stone')
        grass(.25,.22)
    parts=[o for o in bpy.context.scene.objects if o not in before and o!=root]
    bpy.context.view_layer.update()
    points=[o.matrix_world@v.co for o in parts if o.type=='MESH' for v in o.data.vertices]
    offset=Vector((-(min(p.x for p in points)+max(p.x for p in points))/2,
                   -(min(p.y for p in points)+max(p.y for p in points))/2,0))
    for obj in parts:
        obj.location+=offset
    parent_objects(parts,root)
    bpy.context.view_layer.update()
    for obj in parts:
        for v in obj.data.vertices:
            p=obj.matrix_world@v.co
            assert max(abs(p.x),abs(p.y))<=.5, 'Rock outside its tile'
export_and_preview('rock',3000,stages=True,root_prefix='variant_')
