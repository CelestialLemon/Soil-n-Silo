"""One tile of pole beans: four overlapping roots, ripe hanging green pods."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(232)


def plant(n):
    if n==0:
        for x,y in [(-.14,-.10),(.13,.10),(0,.17)]:
            beam('Bean_seedling',(x,y,.02),(x,y,.11),.05,'green',6)
            for sign in [-1,1]:
                leaf('Bean_seed_leaf',(x,y,.09),(x+sign*.12,y+.045,.16),.13,'sprout')
        return
    beam('Bean_climbing_pole',(0,0,0),(0,0,.92),.075,'lightwood',6)
    cylinder('Bean_pole_copper_cap',(0,0,.92),.055,.07,'copper',8)
    h=[0,.35,.66,.88][n]
    turns=2.1
    count=5+n*3
    for strand in range(2):
        prev=Vector((.10*math.cos(strand*math.pi),.10*math.sin(strand*math.pi),.035))
        for i in range(1,count+1):
            angle=i/count*math.tau*turns+strand*math.pi
            p=Vector((.11*math.cos(angle),.11*math.sin(angle),.035+h*i/count))
            beam('Bean_twining_stem',prev,p,.045,'green',6)
            if i%2==0:
                d=Vector((math.cos(angle),math.sin(angle),.30))
                leaf('Bean_broad_leaf',p,p+d*.23,.18,'leaf' if n<3 else 'darkleaf')
                if n==3 and i>=6:
                    pod=sphere('Bean_ripe_hanging_pod',p+d*.15-Vector((0,0,.115)),(.055,.055,.15),'sprout',6,3)
                    pod.rotation_euler=(.18*math.cos(angle),.18*math.sin(angle),angle)
            prev=p


for n in range(4):
    stage(n,lambda n=n:plant(n))
centre_xy()
for obj in bpy.context.scene.objects:
    if obj.type=='MESH':
        for v in obj.data.vertices:
            p=obj.matrix_world@v.co
            assert max(abs(p.x),abs(p.y))<=.5
export_and_preview('beans',3000,stages=True)
