"""Eight wheat stalks; every stage is an independent overlapping root."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(102)
POSITIONS=[(-.22,-.22),(.03,-.25),(.23,-.14),(-.27,.06),(-.04,.01),(.20,.12),(-.14,.24),(.10,.25)]
def plant(n):
    height=[.11,.30,.59,.58][n]
    for i,(x,y) in enumerate(POSITIONS):
        tip=(x+.025*math.sin(i),y+.025*math.cos(i),height-.020*(i%3))
        colour='gold' if n==3 else 'sprout' if n==0 else 'green'
        beam('decor_wheat_stalk',(x,y,.035),tip,.065,colour)
        angle=i*2.4
        z=height*.45
        length=.075 if n==0 else .14
        leaf('decor_wheat_blade',(x,y,z),(x+length*math.cos(angle),y+length*math.sin(angle),z+length*.65),.07,
             'straw' if n==3 else 'leaf')
        if n==3:
            ear=sphere('Heavy_golden_ear',(tip[0]+.025,tip[1],tip[2]+.025),(.054,.054,.105),'gold',4,2)
            ear.rotation_euler=(0,.27,angle)
for n in range(4):
    stage(n,lambda n=n:plant(n))
centre_xy()
export_and_preview('wheat',250,stages=True)
