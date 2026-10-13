"""Copper garden riser with an articulated spinning brass water head."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(227)
cylinder('Sprinkler_ceramic_foot',(0,0,.075),.18,.15,'ceramic',10,top=.13)
cylinder('Sprinkler_copper_riser',(0,0,.34),.065,.56,'copper',8)
for z in [.17,.54]:
    cylinder('Sprinkler_brass_collar',(0,0,z),.10,.075,'brass',8)
parts=[cylinder('Head_ceramic_cap',(0,0,.66),.115,.13,'ceramic',10)]
for sign in [-1,1]:
    parts.append(beam('Head_copper_outlet',(0,0,.66),(sign*.245,0,.69),.07,'copper',8))
    parts.append(cylinder('Head_brass_nozzle',(sign*.26,0,.70),.065,.10,'brass',8,rot=(0,sign*math.pi/3,0)))
parts.append(beam('Head_water_deflector',(-.13,.04,.72),(-.25,.10,.78),.06,'brass'))
head=join(parts,'move_spin_head',(0,0,.66))
orient_x(head,(0,0,1))
head['speed']=3
ring('Sprinkler_tap_wheel',(.13,0,.29),.09,.025,'copper',rot=(0,math.pi/2,0))
beam('Sprinkler_tap_connector',(0,0,.29),(.13,0,.29),.06,'brass')
grass(-.25,-.21)
grass(.24,.20)
build_complete('sprinkler',1)
