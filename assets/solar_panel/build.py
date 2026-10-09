"""Tilted six-cell solar glass on an open timber trestle, with living ground cover."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(201)
tilt = math.radians(20)
solar_tile('Solar_array',(0,0,.66),(1.78,1.58),tilt)
for x in [-.69,.69]:
    for y in [-.56,.56]:
        h = .61+y*math.tan(tilt)
        box('Solar_timber_leg',(x,y,h/2),(.13,.13,h),'wood')
    beam('Solar_trestle_brace',(x,-.56,.12),(x,.56,.65),.11,'lightwood')
box('Solar_converter_support',(0,.20,.34),(1.40,.16,.12),'wood')
box('Solar_copper_converter',(0,.20,.27),(.46,.32,.25),'copper')
for x,y in [(-.66,-.69),(.66,.69),(-.68,.65),(.67,-.64)]:
    grass(x,y)
build_complete('solar_panel',2)
