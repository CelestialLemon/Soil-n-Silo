"""Friendly ceramic energy cabinet, copper bands and paired mint charge windows."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(203)
for x in [-.48,.48]:
    for y in [-.36,.36]:
        box('Battery_wood_foot',(x,y,.08),(.19,.19,.16),'wood')
rounded_box('Battery_ceramic_cabinet',(0,0,.68),(1.28,1.04,1.07),'ceramic',.13)
for x in [-.44,.44]:
    rounded_box('Battery_copper_band',(x,0,.69),(.11,1.07,1.10),'copper',.04)
for y in [-.546,.546]:
    rounded_box('Battery_charge_recess',(0,y,.68),(.55,.07,.55),'darkwood',.055)
    for z in [.51,.68,.85]:
        box('Battery_charge_indicator',(0,y*1.055,z),(.38,.065,.11),material('charge',.7))
for x in [-.685,.685]:
    rounded_box('Battery_side_handle',(x,0,.85),(.10,.40,.17),'brass',.04)
planter(-.65,.68,radius=.16)
planter(.65,-.68,radius=.16)
build_complete('battery',2)
