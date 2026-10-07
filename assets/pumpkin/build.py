"""Broad-leafed trailing vines and a deeply ribbed single pumpkin."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(104)
def fruit(size,colour):
    # One ribbed lathe with alternating palette colours, not intersecting lobes.
    segments=12
    verts=[(0,0,.055)]
    for z,r in [(.11,.62),(.29,1),(.48,.77)]:
        for i in range(segments):
            a=i*math.tau/segments
            radius=size*r*(1 if i%2==0 else .84)
            verts.append((radius*math.cos(a),radius*math.sin(a),z*size/.30))
    verts[0]=(0,0,.05)
    verts.append((0,0,.52*size/.30))
    faces=[]
    for i in range(segments):
        faces.append((0,1+(i+1)%segments,1+i))
    for ring in range(2):
        for i in range(segments):
            a=1+ring*segments+i;b=1+ring*segments+(i+1)%segments
            faces.append((a,b,b+segments,a+segments))
    for i in range(segments):
        faces.append((25+i,25+(i+1)%segments,37))
    obj=mesh('Ribbed_pumpkin',verts,faces,colour)
    obj.data.materials.append(material('pumpkin_dark' if colour=='pumpkin' else 'darkleaf'))
    for p in obj.data.polygons:
        p.material_index=1 if p.index%6==1 else 0
    beam('Pumpkin_stalk',(0,0,.48*size/.30),(.045,0,.59*size/.30),.075,'bark')
def plant(n):
    if n==0:
        beam('decor_sprout_stem',(0,0,.01),(0,0,.10),.065,'green')
        for side in [-1,1]:
            leaf('decor_sprout_leaf',(0,0,.07),(side*.13,0,.12),.10,'sprout')
        return
    for i in range(3 if n==1 else 5):
        angle=i*math.tau/(3 if n==1 else 5)+.2
        radius=.13 if n==1 else .28
        a=(radius*math.cos(angle),radius*math.sin(angle),.065)
        if n>=2:
            beam('decor_trailing_vine',(0,0,.065),a,.067,'green')
        leaf('decor_broad_pumpkin_leaf',a,((radius+.14)*math.cos(angle),(radius+.14)*math.sin(angle),.13),.22,'leaf' if i%2 else 'darkleaf')
    if n==3:
        fruit(.13,'green')
    if n==4:
        fruit(.30,'pumpkin')
for n in range(5):
    stage(n,lambda n=n:plant(n))
centre_xy()
export_and_preview('pumpkin',250,stages=True)
