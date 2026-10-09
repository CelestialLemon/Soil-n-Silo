"""Low three-way distributor: flush junction and three crafted guide flaps."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from logistics import *
reset(222)
straight_deck(rails=False)
branch_wings()
corner_rails()
for x,y,angle in [(-.30,-.30,-.65),(.30,-.30,.65),(.30,.30,-.65)]:
    rounded_box('Splitter_ceramic_guide_flap',(x,y,.225),(.08,.18,.13),'ceramic',.025).rotation_euler.z = angle
# A central low brass selector is beneath the token's riding surface.
cylinder('Splitter_turntable_hub',(0,0,.08),.18,.12,'copper',12)
check_deck()
build_complete('splitter',1)
