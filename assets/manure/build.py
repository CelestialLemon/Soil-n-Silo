"""A bold stacked dung pile, about 0.42 m across and 0.20 m tall."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(113)
for x,y,scale in [(-.079,-.050,(.127,.131,.074)),(.079,-.040,(.137,.128,.074)),(0,.079,(.130,.122,.074))]:
    sphere('Manure_lower_lump',(x,y,.074),scale,'dung',8,4)
sphere('Manure_upper_lump',(0,0,.132),(.112,.105,.068),'dung_light',8,4)
centre_xy()
export_and_preview('manure',800)
