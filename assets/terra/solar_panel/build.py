"""Soft enamel solar array with twelve slate-blue cells and a meadow skirt."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from terra_machines import *

reset(201)
tilt=math.radians(24)
W,D=1.86,1.52
centre=Vector((0,.02,.62)); rot=Matrix.Rotation(tilt,4,'X')
def at(x,y,z=0):
    return centre+rot@Vector((x,y,z))
def panel(name,location,size,colour,radius):
    obj=soft_box(name,location,size,colour,radius)
    obj.rotation_euler.x=tilt
    return obj
panel('Solar_ceramic_frame',at(0,0,0),(W,D,.045),'ivory',.02)
panel('Solar_cell_backing',at(0,0,.02),(W-.08,D-.08,.02),'solar_light',.008)
cols,rows,gap=4,3,.045
cw,ch=(W-.08-gap*(cols+1))/cols,(D-.08-gap*(rows+1))/rows
for i in range(cols):
    for j in range(rows):
        x=-(W-.08)/2+gap+cw/2+i*(cw+gap)
        y=-(D-.08)/2+gap+ch/2+j*(ch+gap)
        panel('Solar_cell',at(x,y,.035),(cw,ch,.02),'solar',.009)
        # A quiet busbar gives each cell a crafted, legible surface.
        busbar=detail_box('Solar_busbar',at(x,y,.047),(.009,ch-.045,.004),'solar_light',.001)
        busbar.rotation_euler.x=tilt
rail=at(0,0,-.06)
round_cylinder('Solar_copper_rail',rail,.045,1.5,'orange',rot=(0,math.pi/2,0),segments=12)
for x in [-.6,.6]:
    round_cylinder('Solar_ceramic_post',(x,rail.y,(rail.z-.03)/2),.045,rail.z-.03,'ivory',segments=12)
    round_cylinder('Solar_post_foot',(x,rail.y,.04),.09,.08,'slate',segments=12)
    tube('Solar_post_brace',(x,rail.y,rail.z-.03),(x,rail.y+.42,.06),.04,'ivory',8)
    round_cylinder('Solar_mount_collar',(x,rail.y,.48),.054,.065,'orange',segments=12)
soft_box('Solar_junction_box',(0,.09,.53),(.24,.17,.095),'slate',.025)
for x,y in [(-.72,-.66),(.7,-.62),(-.2,.3),(.35,.55),(-.75,.62),(.15,-.7)]:
    tuft(x,y)
for x,y,c in [(-.45,-.5,'grain'),(.5,.2,'white'),(-.6,.25,'orange'),(.3,-.45,'white')]:
    round_cylinder('decor_Flower_stem',(x,y,.08),.012,.16,'leaf_deep',segments=6,bevel=.002)
    blob('decor_Meadow_flower',(x,y,.17),(.045,.045,.03),c,segments=8,rings=5)
machine_complete('solar_panel',2,reach=.24)
