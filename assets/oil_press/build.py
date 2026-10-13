"""Timber screw press with a copper drive wheel and a broad golden oil jar."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(207)
for x in [-.46,.46]:
    box('Press_timber_column',(x,0,.68),(.16,.22,1.36),'wood')
box('Press_top_crossbeam',(0,0,1.30),(1.17,.36,.19),'lightwood')
box('Press_workbench',(0,0,.38),(1.24,.85,.13),'wood')
for x in [-.46,.46]:
    for y in [-.29,.29]:
        box('Press_workbench_foot',(x,y,.16),(.16,.16,.32),'darkwood')
cylinder('Press_ceramic_basket',(0,0,.65),.34,.47,'ceramic',12)
for i in range(8):
    a = i*math.tau/8
    box('Press_timber_basket_stave',(.34*math.cos(a),.34*math.sin(a),.65),(.075,.075,.38),'lightwood')
for z in [.49,.81]:
    ring('Press_copper_basket_band',(0,0,z),.34,.055,'copper')
cylinder('Press_vertical_screw',(0,0,1.03),.095,.42,'brass',8)
for z in [.90,1.01,1.12,1.23]:
    cylinder('Press_screw_thread',(0,0,z),.14,.065,'copper',8)
wheel('move_spin_press_wheel',(0,-.42,1.05),.30,'wood',1.4)
beam('Press_oil_spout',(.25,-.15,.50),(.64,-.42,.44),.12,'copper',8)
cylinder('Press_sea_glass_jar',(.64,-.47,.20),.20,.40,'glass',10)
cylinder('Press_golden_oil_window',(.64,-.47,.18),.213,.22,'gold',10)
ring('Press_jar_lip',(.64,-.47,.40),.19,.045,'brass')
box('running_oil_stream',(.64,-.47,.43),(.07,.07,.13),'gold')
planter(-.66,.56,radius=.17)
vine((.53,.12,.45),(.53,.12,1.15))
build_complete('oil_press',2,states=True)
