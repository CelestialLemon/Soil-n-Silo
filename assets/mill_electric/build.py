"""Electric grain mill: high hopper, timber tower, ceramic grinder and a driven sieve."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(206)
for x in [-.50,.50]:
    for y in [-.42,.42]:
        box('Mill_timber_upright',(x,y,.78),(.15,.15,1.56),'wood')
for y in [-.42,.42]:
    beam('Mill_tower_brace',(-.50,y,.12),(.50,y,1.33),.10,'lightwood')
box('Mill_machine_shelf',(0,0,.93),(1.23,1.05,.14),'lightwood')
cylinder('Mill_ceramic_grinder',(0,0,1.14),.40,.37,'ceramic',12)
cylinder('Mill_copper_neck',(0,0,1.42),.18,.23,'copper',8)
# Hollow square hopper, with a visible grain surface below the broad rim.
vertices = [(x*s,y*s,z) for s,z in [(.21,1.45),(.60,1.93),(.49,1.91),(.16,1.51)]
            for x,y in [(-1,-1),(1,-1),(1,1),(-1,1)]]
faces = []
for i in range(4):
    j = (i+1)%4
    faces += [(i,j,j+4,i+4),(i+4,j+4,j+8,i+8),(i+8,j+8,j+12,i+12),(i+12,j+12,j,i)]
mesh('Mill_open_hopper',vertices,faces,'ceramic')
box('Mill_visible_grain',(0,0,1.77),(.68,.68,.065),'gold')
wheel('move_spin_drive',(0,-.63,.86),.33,'copper',2.1)
beam('Mill_drive_axle',(0,-.65,.86),(0,-.20,.86),.12,'brass',8)
beam('Mill_flour_chute',(.29,-.18,.96),(.55,-.35,.47),.20,'ceramic',6)
rounded_box('Mill_flour_bin',(.48,-.36,.22),(.45,.44,.42),'sack',.07)
box('running_flour',(.48,-.36,.45),(.31,.31,.08),'chalk')
box('idle_bin_interior',(.48,-.36,.435),(.31,.31,.055),'darkwood')
box('Mill_motor',(-.36,.22,.56),(.42,.44,.32),'ceramic')
solar_tile('Mill_solar_control',(-.36,.22,.76),(.44,.45),math.radians(12))
planter(-.64,-.56,radius=.17)
vine((.58,.42,.23),(.58,.42,1.28))
build_complete('mill_electric',2,states=True)
