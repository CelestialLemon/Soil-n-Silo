"""Cream cottage with blue roof, warm windows, shutters and a porch step."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(107)
box('Cottage_walls',(0,0,1.0),(3.60,2.60,2.0),'chalk')
# Foundation is the building's base, not a ground slab.
box('Cottage_foundation',(0,0,.16),(3.64,2.64,.32),'stone')
for y in [-1.30,1.30]:
    extrude_xz('Cottage_gable',[(-1.80,2.0),(1.80,2.0),(0,3.03)],y,.12,'cream')
roof('Cottage_slate_roof',3.94,2.88,2.0,3.10)
box('Cottage_roof_ridge',(0,0,3.10),(.14,2.94,.12),'slate_light')
for x in [-1.74,1.74]:
    for y in [-1.33,1.33]:
        box('Cottage_corner_timber',(x,y,1.12),(.13,.13,1.75),'wood')
box('Home_front_door',(0,-1.345,.83),(.74,.10,1.30),'wood')
for x in [-.43,.43]:
    box('Home_door_jamb',(x,-1.405,.84),(.11,.12,1.45),'cream')
box('Home_door_lintel',(0,-1.405,1.54),(.98,.12,.13),'cream')
box('Home_door_handle',(.23,-1.43,.83),(.08,.08,.11),'iron')
box('Porch_step',(0,-1.40,.115),(1.14,.25,.23),'stone_light')
for x in [-1.14,1.14]:
    window('Home_front_window',x,-1.355,1.15,.60,.70)
    for dx in [-.43,.43]:
        box('Home_green_shutter',(x+dx,-1.395,1.15),(.19,.09,.79),'darkleaf')
window('Home_back_window',0,1.355,1.20,.65,.68)
for x in [-1.845,1.845]:
    window('Home_side_window',x,.20,1.2,.56,.67,side=True)
# Chimney at the back so it does not hide the welcoming facade.
box('Cottage_brick_chimney',(.99,.64,2.89),(.39,.42,1.05),'brick')
for z in [2.53,2.80,3.08]:
    box('Chimney_brick_band',(.99,.64,z),(.42,.45,.085),'clay')
box('Chimney_coping',(.99,.64,3.45),(.51,.53,.13),'stone_light')
box('Dark_chimney_flue',(.99,.64,3.522),(.28,.30,.065),'black')
centre_xy()
export_and_preview('farmhouse',3000)
