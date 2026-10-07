"""A 0.46 m straw bowl cradling two bold, 0.22 m long cream eggs."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(112)
sphere('Nest_woven_bowl',(0,0,.04),(.195,.195,.04),'straw',10,3)
# A chunky open toroidal rim; the egg remains visible from every side.
vertices=[]
for i in range(12):
    angle=i*math.tau/12
    for j in range(4):
        tube=j*math.tau/4
        r=.186+.044*math.cos(tube)
        vertices.append((r*math.cos(angle),r*math.sin(angle),.064+.044*math.sin(tube)))
faces=[]
for i in range(12):
    for j in range(4):
        a=i*4+j;b=i*4+(j+1)%4;c=((i+1)%12)*4+(j+1)%4;d=((i+1)%12)*4+j
        faces.append((a,d,c,b))
mesh('Straw_nest_rim',vertices,faces,'gold')
for i in range(6):
    a=i*math.tau/6
    beam('Straw_woven_bundle',(.173*math.cos(a-.16),.173*math.sin(a-.16),.070),
         (.173*math.cos(a+.27),.173*math.sin(a+.27),.081),.077,'cream')
for x,y in [(-.077,-.02),(.077,.02)]:
    egg=sphere('Cream_egg',(x,y,.15),(.071,.073,.110),'chalk',10,5)
    # Pinch the upper hemisphere gently into an egg, not a symmetric ball.
    for v in egg.data.vertices:
        if v.co.z>0:
            factor=1-.16*v.co.z
            v.co.x*=factor;v.co.y*=factor
centre_xy()
export_and_preview('egg_nest',800)
