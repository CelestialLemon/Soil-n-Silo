"""Moss-capped ceramic biogas dome with copper plumbing and a small flare stack."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(205)
cylinder('Digester_ceramic_tank',(0,0,.39),.66,.78,'ceramic',12)
# A true hemisphere with a broad green cap, closed underneath.
vertices = [(0,0,1.48)]
for j in range(1,5):
    angle = j*math.pi/8
    for i in range(12):
        a = i*math.tau/12
        vertices.append((.66*math.sin(angle)*math.cos(a),.66*math.sin(angle)*math.sin(a),.78+.70*math.cos(angle)))
faces = [(0,1+i,1+(i+1)%12) for i in range(12)]
for j in range(3):
    for i in range(12):
        a,b = 1+j*12+i,1+j*12+(i+1)%12
        faces.append((a,a+12,b+12,b))
faces.append(tuple(range(48,36,-1)))
dome = mesh('Digester_living_dome',vertices,faces,'ceramic')
dome.data.materials.append(material('moss'))
for polygon in dome.data.polygons:
    if polygon.index<24:
        polygon.material_index = 1
ring('Digester_copper_belt',(0,0,.75),.66,.065,'copper')
for y in [-.685,.685]:
    rounded_box('Digester_access_hatch',(0,y,.36),(.40,.10,.35),'wood',.06)
    box('Digester_hatch_latch',(.12,y*1.08,.37),(.08,.065,.13),'brass')
beam('Digester_gas_pipe',(.48,.27,.80),(.76,.27,.80),.12,'copper',8)
beam('Digester_flare_stack',(.76,.27,.12),(.76,.27,1.49),.12,'copper',8)
cylinder('Digester_flare_cowl',(.76,.27,1.49),.12,.14,'brass',8)
cylinder('running_flare',(.76,.27,1.60),.065,.15,material('fire',.8),6,top=0)
empty('smoke_emitter',(.76,.27,1.67))
planter(-.69,-.57,radius=.17)
grass(.64,-.54)
build_complete('digester',2,states=True)
