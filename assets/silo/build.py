"""A ceramic grain silo with copper hoops and a living moss roof, on a stone apron with three drone landing pads.

Local (x, z) in the game is (x, -y) here. The silo stands in the back-left corner; the pads sit at the game's
`SILO_PADS` (src/world/shapes.ts), (0.5, 0.5), (-0.4, 0.55) and (0.55, -0.45), each with a small lamp. Drones park
0.42 m up with their basket 0.15 m below that, so the pads stay under 0.25 m."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(230)
SX, SY = -.36, .36                 # the silo's centre (game x -0.36, z -0.36)
R, WALL = .56, 1.72
PADS = [(.5,.5),(-.4,.55),(.55,-.45)]
rounded_box('Silo_stone_apron',(0,0,.05),(1.96,1.96,.1),'stone_light',.04)
# The bin: a ceramic drum on a copper footing, three hoops, a domed moss roof with a brass vent.
cylinder('Silo_copper_footing',(SX,SY,.15),R+.04,.1,'copper',14)
cylinder('Silo_ceramic_bin',(SX,SY,.2+WALL/2),R,WALL,'ceramic',14)
for z in [.62,1.12,1.6]:
    cylinder('Silo_copper_hoop',(SX,SY,z),R+.025,.07,'copper',14)
cylinder('Silo_roof_eave',(SX,SY,.2+WALL+.03),R+.07,.06,'darkwood',14)
cylinder('Silo_moss_roof',(SX,SY,.2+WALL+.25),R+.06,.38,'moss',14,top=.16)
cylinder('Silo_brass_vent',(SX,SY,.2+WALL+.5),.12,.14,'brass',8,top=.08)
sphere('Silo_vent_cap',(SX,SY,.2+WALL+.58),(.1,.1,.05),'copper',8,3)
# A hatch at the front, and a ladder up the side.
rounded_box('Silo_timber_hatch',(SX,SY-R-.01,.5),(.3,.06,.36),'wood',.03)
box('Silo_hatch_handle',(SX,SY-R-.045,.5),(.16,.03,.04),'brass')
y = SY+R+.04
for dx in [-.11,.11]:
    box('Silo_ladder_rail',(SX+dx,y,1.05),(.04,.04,1.7),'darkwood')
for z in [.4,.65,.9,1.15,1.4,1.65]:
    box('Silo_ladder_rung',(SX,y,z),(.24,.04,.03),'wood')
# Landing pads: a ceramic disc on a short copper stem, a ring to land on, and a lamp at its outer edge.
for i,(px,pz) in enumerate(PADS):
    x,y = px,-pz
    cylinder('Silo_pad_stem',(x,y,.14),.07,.08,'copper',8)
    cylinder('Silo_pad_disc',(x,y,.2),.3,.05,'ceramic',12)
    cylinder('Silo_pad_ring',(x,y,.23),.2,.012,'slate',12)
    out = Vector((x,y,0)).normalized()*.25 if (x,y) != (0,0) else Vector((.25,0,0))
    sphere('Silo_pad_lamp',(x+out.x,y+out.y,.24),(.04,.04,.03),material('glow',.7),6,3)
grass(-.86,-.12)
grass(.84,-.05)
grass(.1,.86)
build_complete('silo',2)
