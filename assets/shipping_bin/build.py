"""A hollow shipping crate with iron bands and a slightly raised hinged lid."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(109)
box('Bin_floor',(0,0,.07),(.90,.70,.14),'darkwood')
for y in [-.315,.315]:
    for i in range(5):
        box('Bin_vertical_plank',(-.36+i*.18,y,.34),(.174,.07,.54),'wood' if i%2 else 'lightwood')
for x in [-.415,.415]:
    for i in range(4):
        box('Bin_side_plank',(x,-.24+i*.16,.34),(.07,.154,.54),'wood' if i%2 else 'lightwood')
for z in [.16,.51]:
    for y in [-.36,.36]:
        box('Bin_iron_end_band',(0,y,z),(.90,.065,.075),'iron')
    for x in [-.45,.45]:
        box('Bin_iron_side_band',(x,0,z),(.065,.72,.075),'iron')
parts=[]
for i in range(5):
    parts.append(box('Bin_lid_plank',(-.36+i*.18,0,.64),(.176,.70,.08),'lightwood' if i%2 else 'wood'))
for x in [-.29,.29]:
    parts.append(box('Bin_lid_iron_band',(x,0,.69),(.075,.72,.06),'iron'))
lid=join(parts,'Slightly_open_shipping_lid',(0,.35,.60))
lid.rotation_euler.x=math.radians(-7)
box('Shipping_bin_latch',(0,-.376,.49),(.10,.07,.15),'iron')
centre_xy()
export_and_preview('shipping_bin',800)
