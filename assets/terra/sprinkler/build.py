"""Enamel garden sprinkler with orange swing arms and slate nozzle mouths."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from terra_machines import *

reset(227)
round_cylinder('Sprinkler_ceramic_foot',(0,0,.075),.18,.15,'slate',top=.13,segments=20,bevel=.025)
round_cylinder('Sprinkler_copper_riser',(0,0,.34),.065,.56,'ivory',segments=16,bevel=.012)
for z in [.17,.54]:
    round_cylinder('Sprinkler_brass_collar',(0,0,z),.10,.075,'orange',segments=16,bevel=.014)
parts=[round_cylinder('Head_ceramic_cap',(0,0,.66),.115,.13,'ivory',segments=20,bevel=.025)]
for sign in [-1,1]:
    parts.append(tube('Head_copper_outlet',(0,0,.66),(sign*.245,0,.69),.07,'orange',12))
    nozzle=Vector((sign*.26,0,.70)); rotation=(0,sign*math.pi/3,0)
    parts.append(round_cylinder('Head_brass_nozzle',nozzle,.065,.10,'ivory',rot=rotation,segments=16))
    direction=Vector((sign*math.sin(math.pi/3),0,math.cos(math.pi/3)))
    parts.append(round_cylinder('Head_nozzle_mouth',nozzle+direction*.051,.042,.009,
                                'recess',rot=rotation,segments=12,bevel=.002))
parts.append(tube('Head_water_deflector',(-.13,.04,.72),(-.25,.10,.78),.06,'trim',8))
parts.append(round_cylinder('Head_top_badge',(0,0,.73),.055,.018,'orange',segments=12,bevel=.004))
head=join(parts,'move_spin_head',(0,0,.66)); orient_x(head,(0,0,1)); head['speed']=3
hoop('Sprinkler_tap_wheel',(.13,0,.29),.09,.022,'orange',(0,math.pi/2,0))
tube('Sprinkler_tap_connector',(0,0,.29),(.13,0,.29),.06,'trim')
for a in [0,math.pi/2]:
    d=Vector((0,math.cos(a),math.sin(a)))*.075
    tube('Sprinkler_tap_spoke',Vector((.13,0,.29))-d,Vector((.13,0,.29))+d,.024,'orange',8)
tuft(-.25,-.21)
tuft(.24,.20)
machine_complete('sprinkler',1,reach=.17)
