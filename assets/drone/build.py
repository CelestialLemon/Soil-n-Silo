"""Four-rotor ceramic cargo drone, centred at its flying origin."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(226)
rounded_box('Drone_ceramic_body',(0,0,.015),(.29,.32,.13),'ceramic',.055)
box('Drone_solar_timber_frame',(0,0,.083),(.23,.25,.025),'lightwood')
box('Drone_solar_glass',(0,0,.103),(.19,.21,.02),'solar')
box('Drone_solar_cell_separator',(0,0,.117),(.025,.21,.012),'solar_light')
# Compact four rotors; circular guards and full swept blades stay inside .7 m.
for n,(x,y) in enumerate([(-.225,-.225),(.225,-.225),(-.225,.225),(.225,.225)]):
    beam('Drone_copper_arm',(0,0,.01),(x,y,.035),.055,'copper',6)
    ring('Drone_rotor_guard',(x,y,.06),.111,.014,'copper')
    cylinder('Drone_rotor_motor',(x,y,.053),.037,.065,'brass',8)
    parts=[cylinder('Rotor_hub',(x,y,.09),.035,.035,'brass',8)]
    for angle in [0,math.pi/2]:
        parts.append(rounded_box('Rotor_ceramic_blade',(x,y,.094),(.197,.042,.022),'ceramic',.009))
        parts[-1].rotation_euler.z=angle
    rotor=join(parts,'move_spin_rotor_'+str(n),(x,y,.094))
    orient_x(rotor,(0,0,1))
    rotor['speed']=18
# Open basket rather than a solid parcel: dark base and timber slats below.
rounded_box('Drone_cargo_basket_base',(0,0,-.13),(.26,.26,.045),'wood',.015)
for x in [-.115,.115]:
    for y in [-.115,.115]:
        beam('Drone_basket_corner',(x,y,-.13),(x,y,-.04),.035,'lightwood')
for z in [-.095,-.05]:
    for x in [-.13,.13]:
        box('Drone_basket_side',(x,0,z),(.03,.26,.03),'lightwood')
    for y in [-.13,.13]:
        box('Drone_basket_end',(0,y,z),(.26,.03,.03),'lightwood')
box('Drone_front_charge_eye',(0,-.168,.02),(.10,.025,.055),material('charge',.8))
build_complete('drone',.7,airborne=True)
