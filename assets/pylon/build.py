"""Timber power post with warm solar lantern, ceramic insulators and a climbing vine."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(204)
cylinder('Pylon_ceramic_socket',(0,0,.12),.21,.24,'ceramic',8)
box('Pylon_timber_post',(0,0,.99),(.16,.16,1.78),'wood')
box('Pylon_copper_crossarm',(0,0,1.73),(.80,.14,.12),'copper')
for x in [-.32,.32]:
    cylinder('Pylon_ceramic_insulator',(x,0,1.86),.09,.18,'ceramic',8)
    cylinder('Pylon_brass_terminal',(x,0,1.98),.065,.08,'brass',8)
rounded_box('Pylon_lantern_frame',(0,0,1.96),(.31,.31,.33),'brass',.04)
for y in [-.17,.17]:
    box('Pylon_lantern_window',(0,y,1.96),(.22,.065,.20),material('glow',.7))
for x in [-.17,.17]:
    box('Pylon_lantern_window',(x,0,1.96),(.065,.22,.20),material('glow',.7))
solar_tile('Pylon_solar_cap',(0,0,2.14),(.47,.43),math.radians(10))
vine((.11,.03,.25),(.11,.03,1.24))
planter(.23,-.22,radius=.13)
grass(-.24,.21)
build_complete('pylon',1)
