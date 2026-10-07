"""A toy conifer with three heavy tiered foliage skirts."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(115)
cylinder('Pine_trunk',(0,0,.59),.14,1.18,'bark',7,top=.11)
for z,r,height,colour in [(1.36,.81,1.24,'darkleaf'),(2.02,.63,1.22,'green'),(2.64,.43,1.12,'leaf')]:
    cylinder('Pine_foliage_tier',(0,0,z),r,height,colour,9,top=0)
for i in range(3):
    a=i*math.tau/3
    beam('Pine_root',(0,0,.13),(.27*math.cos(a),.27*math.sin(a),.070),.115,'bark',5)
centre_xy()
export_and_preview('tree_pine',3000)
