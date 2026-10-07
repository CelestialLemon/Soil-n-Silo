"""Rounded berry shrub with broad foliage and a few bold red berries."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(116)
cylinder('Bush_woody_stem',(0,0,.16),.095,.32,'bark',6)
for loc,scale,colour in [((0,0,.43),(.34,.34,.37),'green'),
    ((-.20,-.08,.36),(.22,.24,.27),'leaf'),((.19,.08,.39),(.24,.24,.29),'darkleaf')]:
    sphere('Bush_round_foliage',loc,scale,colour,10,5)
for x,y,z in [(-.24,-.24,.49),(.23,-.18,.57),(.16,.27,.45),(-.23,.19,.60)]:
    sphere('Bush_red_berry',(x,y,z),(.055,.055,.054),'tomato',6,3)
centre_xy()
export_and_preview('bush',800)
