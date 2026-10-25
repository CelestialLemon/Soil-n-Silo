"""A little weather station: a white slatted instrument screen (a Stevenson screen) on timber legs, a copper mast with a
wind vane and a three-cup anemometer, and a copper-funnelled rain gauge. About a metre and a bit tall, so it reads among the
fields next to a sprinkler and a pylon without sheltering a turbine (not `tall`).

The cups are `move_spin_anemometer` (local X vertical, `speed = 2.5`): they turn with the wind, powered or not. The game sets
the speed per wind band, the way it does for the turbine's rotor."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(231)
SX, SY = -.11, -.04            # the screen's centre
BODY_W, BODY_D = .46, .34
LEG_Z, BODY_TOP = .30, .62     # the screen's floor and its top
MAST = (.27,.25)               # the mast, in the back-right corner
HUB_Z = 1.04

# Four timber legs on small stone feet, braced by a ceramic floor board.
for dx in [-1,1]:
    for dy in [-1,1]:
        x,y = SX+dx*(BODY_W/2-.04),SY+dy*(BODY_D/2-.04)
        cylinder('Station_stone_foot',(x,y,.04),.065,.08,'stone',6,top=.055)
        rounded_box('Station_timber_leg',(x,y,.18),(.06,.06,.28),'wood',.015)
box('Station_floor_board',(SX,SY,LEG_Z+.02),(BODY_W+.02,BODY_D+.02,.04),'lightwood')

# The screen: a linen core, wrapped in tilted ceramic louvres on all four sides, and a front door catch.
box('Station_linen_core',(SX,SY,(LEG_Z+BODY_TOP)/2+.02),(BODY_W-.06,BODY_D-.06,BODY_TOP-LEG_Z-.04),'linen')
tilt = .55
for z in [LEG_Z+.075,LEG_Z+.15,LEG_Z+.225,LEG_Z+.30]:
    for side in [-1,1]:
        box('Station_ceramic_louvre',(SX,SY+side*(BODY_D/2-.015),z),(BODY_W,.07,.045),'ceramic',rot=(side*tilt,0,0))
        box('Station_ceramic_louvre',(SX+side*(BODY_W/2-.015),SY,z),(.07,BODY_D,.045),'ceramic',rot=(0,-side*tilt,0))
for dx in [-1,1]:
    for dy in [-1,1]:
        box('Station_timber_corner',(SX+dx*(BODY_W/2-.01),SY+dy*(BODY_D/2-.01),(LEG_Z+BODY_TOP)/2+.02),(.045,.045,BODY_TOP-LEG_Z),'wood')
sphere('Station_brass_knob',(SX+.12,SY-BODY_D/2-.03,(LEG_Z+BODY_TOP)/2),(.032,.032,.032),'brass',6,3)

# A shallow lid of living moss on a ceramic roof plate, with a copper rim.
rounded_box('Station_ceramic_lid',(SX,SY,BODY_TOP+.04),(BODY_W+.08,BODY_D+.08,.06),'ceramic',.02)
rounded_box('Station_moss_lid',(SX,SY,BODY_TOP+.095),(BODY_W+.02,BODY_D+.02,.06),'moss',.03)
box('Station_copper_lid_rim',(SX,SY-BODY_D/2-.05,BODY_TOP+.025),(BODY_W+.09,.03,.03),'copper')
sphere('decor_Station_lid_sedum',(SX-.10,SY+.03,BODY_TOP+.14),(.09,.07,.04),'leaf',6,3)

# The mast: a copper pole on a stone foot, with brass collars, a vane and the cups on top.
mx,my = MAST
cylinder('Station_mast_foot',(mx,my,.05),.085,.10,'stone',8,top=.065)
cylinder('Station_copper_mast',(mx,my,.55),.027,1.0,'copper',6)
for z in [.16,.74]:
    cylinder('Station_brass_collar',(mx,my,z),.045,.04,'brass',6)
box('Station_mast_brace',(mx-.07,my-.07,.14),(.04,.04,.04),'wood')
# Vane: a boom along X, a diamond head on the −X end and a broad tail fin on the +X end.
VZ = .90
cylinder('Station_vane_hub',(mx,my,VZ),.04,.05,'brass',6)
beam('Station_vane_boom',(mx-.13,my,VZ),(mx+.13,my,VZ),.035,'copper')
extrude_xz('Station_vane_head',[(mx-.20,VZ),(mx-.12,VZ-.045),(mx-.10,VZ),(mx-.12,VZ+.045)],my,.04,'copper')
extrude_xz('Station_vane_tail',[(mx+.10,VZ-.012),(mx+.22,VZ-.085),(mx+.19,VZ),(mx+.22,VZ+.085),(mx+.10,VZ+.012)],my,.035,'brass')

# The anemometer: three copper cups on a brass hub, turning about the mast's axis.
hub = Vector((mx,my,HUB_Z))
cups = [cylinder('Anemometer_brass_hub',hub,.04,.07,'brass',6),
        cylinder('Anemometer_copper_cap',hub+Vector((0,0,.05)),.022,.04,'copper',6,top=.01)]
for i in range(3):
    a = i*math.tau/3+.4
    d = Vector((math.cos(a),math.sin(a),0))
    t = Vector((-math.sin(a),math.cos(a),0))
    cups.append(beam('Anemometer_copper_arm',hub,hub+d*.14,.03,'copper'))
    # A cup: a half-sphere-ish bowl at the arm's end, facing round the circle.
    cup = sphere('Anemometer_cup',hub+d*.165+t*.0+Vector((0,0,-.01)),(.06,.06,.055),'ceramic',6,3)
    cups.append(cup)
spinner = join(cups,'move_spin_anemometer',hub)
orient_x(spinner,(0,0,1))
spinner['speed'] = 2.5

# The rain gauge: a ceramic cylinder with a copper funnel and a brass band, at the front right.
gx,gy = .30,-.27
cylinder('Gauge_ceramic_body',(gx,gy,.13),.075,.26,'ceramic',8)
cylinder('Gauge_brass_band',(gx,gy,.20),.082,.04,'brass',8)
cylinder('Gauge_copper_funnel',(gx,gy,.30),.10,.07,'copper',8,top=.045)
cylinder('Gauge_stone_foot',(gx,gy,.015),.09,.03,'stone',8)

grass(-.38,-.34)
grass(-.36,.30)
grass(.07,.38)
build_complete('weather_station',1)
