"""A soft, spreading oak with clumpy leaf surfaces and lighter crown tufts."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from terra_common import *

reset(114)
# A gently crooked, flared trunk; round cross sections keep the silhouette soft.
levels = [(0, .29, 0, 0), (.12,.25,0,0), (.39,.18,.015,.005),
          (.86,.155,-.025,.02), (1.28,.135,.035,.015), (1.74,.09,.10,.02)]
verts = [(x+r*math.cos(i*math.tau/16), y+r*math.sin(i*math.tau/16), z)
         for z,r,x,y in levels for i in range(16)]
faces = [tuple(range(15,-1,-1))]
faces += [(j*16+i,j*16+(i+1)%16,(j+1)*16+(i+1)%16,(j+1)*16+i)
          for j in range(len(levels)-1) for i in range(16)]
faces.append(tuple(range((len(levels)-1)*16,len(levels)*16)))
smooth(mesh('Oak_trunk', verts, faces, paint('bark')))
for i in range(5):
    a = .35+i*math.tau/5
    obj = blob('Oak_root' if i < 4 else 'Oak_extra_root', (.19*math.cos(a),.19*math.sin(a),.105),
               (.26,.10,.105), 'bark', phase=i, segments=12, rings=6)
    obj.rotation_euler.z = a
for i, (x,y,z) in enumerate([(-.48,-.18,1.92),(.46,-.13,1.95),(.02,.49,2.05)]):
    obj = beam('Oak_bough',(.025,.015,1.03),(x,y,z),.20,paint('wood'),12)
    soften(obj,.045,2)

# The mass is broad and slightly uneven, with smaller lobes interrupting its edge.
lobes = [
    ((-.48,-.14,2.11),(.70,.61,.59),'leaf',.3),
    ((.52,-.10,2.16),(.65,.61,.59),'leaf_light',1.1),
    ((.04,.47,2.19),(.71,.57,.61),'leaf_cool',2.2),
    ((-.10,-.04,2.57),(.76,.64,.48),'leaf_gold',.8),
    ((-.25,.31,2.72),(.47,.43,.36),'leaf_light',5.3),
]
for i,(position,scale,colour,phase) in enumerate(lobes):
    leafy_blob('Oak_round_leaf_crown', position,scale,colour,phase,
               segments=18,rings=9,relief=.10)
    clusters = []
    before = set(bpy.context.scene.objects)
    # An even but non-repeating scattering on the upper surface: small overlapping
    # cushions provide real leaf-cluster relief without jagged displaced triangles.
    for j in range(24):
        z = -.30+1.26*(j+.5)/24
        a = j*math.pi*(3-math.sqrt(5))+phase
        direction = Vector((math.sqrt(1-z*z)*math.cos(a), math.sqrt(1-z*z)*math.sin(a), z))
        radial = foliage_radius(direction, phase, .10)*.99
        p = Vector(position)+Vector(tuple(direction[k]*scale[k]*radial for k in range(3)))
        normal = Vector(tuple(direction[k]/scale[k] for k in range(3))).normalized()
        tint = 'leaf_light' if z > .60 and j%3 == 0 else colour
        r = .19+.025*math.sin(j*2.3+i)
        leaf_cushion('Oak_leaf_cluster', p, (r, r*.85, r*.23), tint, normal, a)
    clusters = [o for o in bpy.context.scene.objects if o not in before]
    join(clusters, 'Oak_leaf_clusters_'+str(i), (0, 0, 0))
    # Just a few pale young tufts crown the upper foliage.
    if i >= 3:
        for j in range(2):
            direction = Vector((.35*math.cos(phase+j*2), .35*math.sin(phase+j*2), .94)).normalized()
            radial = foliage_radius(direction, phase, .10)
            p = Vector(position)+Vector(tuple(direction[k]*scale[k]*radial for k in range(3)))
            leaf_tuft('Oak_leaf_tuft', p, .15, 'leaf_light', phase+j)
objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
# Match the original exported oak's world bounds, including its 3.05 m height.
fit_bounds(objects, (-1.2072079,-.9619756,0), (1.2072079,.9619756,3.05))
preserve_original_contract('tree_oak')
complete('tree_oak', (2.4144158,1.9239512,3.05), reach=.55)
