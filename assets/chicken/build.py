"""A plump rigid hen with an oversized comb, bead eyes and orange feet."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(101)
sphere('Plump_hen_body',(0,.025,.205),(.14,.17,.135),'feather',12,5)
sphere('Hen_head',(0,-.125,.325),(.077,.08,.073),'feather',8,4)
for side in [-1,1]:
    sphere('Rounded_wing',(side*.122,.035,.215),(.042,.11,.085),'chalk',8,3)
    sphere('Black_bead_eye',(side*.068,-.157,.343),(.033,.033,.033),'black',8,2)
    beam('Orange_leg',(side*.061,.025,.028),(side*.061,.025,.11),.061,'pumpkin')
    box('Orange_foot',(side*.061,-.006,.025),(.075,.12,.05),'pumpkin')
# Bold triangular tail and beak use deliberately simple solids.
extrude_xz('Upright_tail',[(-.075,.245),(.075,.245),(.055,.36),(-.055,.36)],.17,.08,'chalk')
mesh('Golden_beak',[(-.042,-.188,.332),(.042,-.188,.332),(0,-.25,.31),(0,-.188,.285)],
     [(0,1,2),(0,3,1),(1,3,2),(2,3,0)],'gold')
for y,z in [(-.17,.374),(-.12,.389),(-.073,.370)]:
    sphere('Red_comb_lobe',(0,y,z),(.028,.035,.030),'red_light',6,2)
sphere('Red_wattle',(0,-.192,.275),(.032,.026,.043),'red',4,2)
centre_xy()
export_and_preview('chicken',400)
