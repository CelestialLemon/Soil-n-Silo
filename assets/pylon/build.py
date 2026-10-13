"""A quiet power post: a short, slim timber pole on a small stone foot, topped by a ceramic insulator and a copper cap
with a tiny lamp. Pylons are many and should sit in the background; the game draws their links and reach when you
work with power."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(204)
cylinder('Pylon_stone_foot',(0,0,.05),.14,.1,'stone',8,top=.11)
cylinder('Pylon_timber_pole',(0,0,.62),.06,1.06,'wood',6,top=.05)
cylinder('Pylon_ceramic_insulator',(0,0,1.2),.075,.1,'ceramic',8)
cylinder('Pylon_ceramic_insulator',(0,0,1.29),.06,.08,'ceramic',8)
cylinder('Pylon_copper_cap',(0,0,1.37),.085,.06,'copper',8,top=.04)
sphere('Pylon_lamp',(0,0,1.43),(.04,.04,.04),material('glow',.7),6,3)
grass(.13,-.1)
build_complete('pylon',1)
