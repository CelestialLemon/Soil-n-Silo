"""A chunky branching oak with a round, asymmetrical crown."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(114)
cylinder('Oak_trunk',(0,0,.91),.18,1.82,'bark',7,top=.12)
for i in range(4):
    a=i*math.tau/4+.3
    beam('Oak_root',(0,0,.16),(.34*math.cos(a),.34*math.sin(a),.070),.13,'bark',5)
for i in range(3):
    a=.4+i*math.tau/3
    beam('Oak_bough',(0,0,1.25),(.48*math.cos(a),.48*math.sin(a),2.02),.15,'wood',6)
for location,scale,colour in [((0,0,2.34),(.87,.82,.70),'leaf'),
    ((-.58,-.20,2.03),(.66,.64,.62),'green'),((.56,-.12,2.10),(.68,.68,.64),'leaf'),
    ((0,.53,2.11),(.69,.68,.61),'darkleaf'),((-.10,.03,2.70),(.66,.62,.35),'leaf')]:
    sphere('Oak_round_leaf_crown',location,scale,colour,10,5)
centre_xy()
export_and_preview('tree_oak',3000)
