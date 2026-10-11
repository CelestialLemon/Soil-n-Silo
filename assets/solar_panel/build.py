"""A sleek, low solar array: one thin sheet of deep-blue cells in a slim white frame, tilted to the front on a single
copper rail and two slender posts, with meadow growing in its shade."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(201)
tilt = math.radians(24)
W, D = 1.86, 1.52                 # the sheet, across and up the slope
centre = Vector((0,.02,.62))
rot = Matrix.Rotation(tilt,4,'X')
def at(dx,dy,dz=0):
    return centre+rot@Vector((dx,dy,dz))
# The sheet: a thin white frame, a solar-light backing that shows as the lines between cells, and the cells on it.
box('Solar_ceramic_frame',at(0,0,0),(W,D,.045),'ceramic',rot=(tilt,0,0))
box('Solar_cell_backing',at(0,0,.02),(W-.08,D-.08,.02),'solar_light',rot=(tilt,0,0))
cols, rows, gap = 4, 3, .045
cw, ch = (W-.08-gap*(cols+1))/cols, (D-.08-gap*(rows+1))/rows
for i in range(cols):
    for j in range(rows):
        x = -(W-.08)/2+gap+cw/2+i*(cw+gap)
        y = -(D-.08)/2+gap+ch/2+j*(ch+gap)
        box('Solar_cell',at(x,y,.035),(cw,ch,.02),'solar',rot=(tilt,0,0))
# The mount: one copper rail under the sheet's middle, on two slim posts.
rail = at(0,0,-.06)
cylinder('Solar_copper_rail',rail,.045,1.5,'copper',8,rot=(0,math.pi/2,0))
for x in [-.6,.6]:
    cylinder('Solar_ceramic_post',(x,rail.y,(rail.z-.03)/2),.045,rail.z-.03,'ceramic',8)
    cylinder('Solar_post_foot',(x,rail.y,.04),.09,.08,'stone_light',8)
    beam('Solar_post_brace',(x,rail.y,rail.z-.03),(x,rail.y+.42,.06),.04,'ceramic',6)
# Agrivoltaic meadow under and around the sheet.
for x,y in [(-.72,-.66),(.7,-.62),(-.2,.3),(.35,.55),(-.75,.62),(.15,-.7)]:
    grass(x,y)
for x,y,c in [(-.45,-.5,'gold'),(.5,.2,'feather'),(-.6,.25,'red_light'),(.3,-.45,'feather')]:
    cylinder('decor_Flower_stem',(x,y,.08),.012,.16,'green',4)
    sphere('decor_Meadow_flower',(x,y,.17),(.045,.045,.03),c,6,3)
build_complete('solar_panel',2)
