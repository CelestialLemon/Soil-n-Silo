"""Twin open slatted timber compost bays with a living rear vine."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(229)
for x in [-.86,0,.86]:
    for y in [-.71,.71]:
        rounded_box('Compost_timber_upright',(x,y,.50),(.12,.12,1),'wood',.025)
    for z in [.18,.40,.62,.84]:
        box('Compost_slatted_divider',(x,0,z),(.09,1.40,.14),'lightwood')
for x in [-.43,.43]:
    for z in [.18,.40,.62,.84]:
        box('Compost_back_slat',(x,.71,z),(.78,.09,.14),'lightwood')
    for z in [.18,.40,.62]:
        box('Compost_removable_front_slat',(x,-.71,z),(.78,.09,.14),'wood')
    rounded_box('Compost_dark_earth',(x,0,.32),(.70,1.20,.60),'dung',.09)
    for dx,dy in [(-.17,-.23),(.14,.25),(-.14,.36),(.18,-.35)]:
        sphere('Compost_chunk',(x+dx,dy,.63),(.18,.24,.11),'darkwood',6,3)
    leaf('Compost_garden_cuttings',(x-.19,-.14,.66),(x+.12,.05,.70),.18,'moss')
    box('Compost_brass_front_handle',(x,-.775,.61),(.25,.07,.07),'brass')
vine((-.89,.69,.15),(-.89,.69,.90))
grass(.69,.83)
build_complete('composter',2)
