"""Closed terracotta hemisphere with a bold arched facade and mouth states."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(111)
box('Oven_stone_plinth',(0,0,.265),(1.56,1.42,.53),'stone')
for x in [-.54,0,.54]:
    box('Oven_front_foundation_stone',(x,-.74,.23),(.47,.10,.29),'stone_light')
# Build the flat-bottomed hemisphere directly, without cuts or modifiers.
vertices=[]
for j in range(4):
    theta=math.pi/2-j*math.pi/8
    for i in range(16):
        a=i*math.tau/16
        vertices.append((.73*math.sin(theta)*math.cos(a),.67*math.sin(theta)*math.sin(a),.56+.79*math.cos(theta)))
vertices.append((0,0,1.35))
faces=[tuple(range(15,-1,-1))]
for j in range(3):
    for i in range(16):
        a=j*16+i;b=j*16+(i+1)%16
        faces.append((a,b,b+16,a+16))
faces += [(48+i,48+(i+1)%16,64) for i in range(16)]
mesh('Terracotta_oven_dome',vertices,faces,'clay')
# Both panels sit entirely in front of the dome's most forward point (-.67).
# The fire is slightly forward of the idle panel; the game toggles the states.
polygon=arch_polygon(.65,.55,.79)
extrude_xz('idle_mouth',polygon,-.71,.03,'black')
extrude_xz('running_fire',polygon,-.745,.03,material('fire',.7))
# Closed wedge pieces form a continuous arch frame, in front of both panels.
for i in range(8):
    a=i*math.pi/8;b=(i+1)*math.pi/8
    wedge=[(r*math.cos(angle),.79+r*math.sin(angle))
           for r,angle in [(.325,a),(.485,a),(.485,b),(.325,b)]]
    extrude_xz('Oven_arch_stone',wedge,-.75,.16,'stone' if i%2 else 'stone_light')
for x in [-.405,.405]:
    box('Oven_arch_pier',(x,-.75,.67),(.16,.16,.24),'stone_light')
box('Oven_mouth_sill',(0,-.74,.55),(.98,.30,.10),'stone_light')
box('Oven_chimney',(0,.36,1.30),(.31,.34,.83),'brick')
box('Oven_chimney_cap',(0,.36,1.73),(.41,.44,.12),'stone_light')
box('Oven_chimney_flue',(0,.36,1.80),(.21,.24,.07),'black')
empty('smoke_emitter',(0,.36,1.86))
centre_xy()
export_and_preview('oven',3000)
