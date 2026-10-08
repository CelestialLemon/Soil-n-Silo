"""Two flush belt axes with raised bridge shoulders, keeping goods at .16 m."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from logistics import *
reset(224)
straight_deck(rails=False)
branch_wings(crossing=True)
# Crafted bridge arches clear .25 m goods on the lateral lane, including the
# game's .02 m router offset. Both riding decks remain exactly .16 m high.
for x in [-.375,.375]:
    for y in [-.43,.43]:
        rounded_box('Crossing_ceramic_bridge_foot',(x,y,.125),(.14,.14,.25),'ceramic',.03)
    outline=[(-.49,.20),(-.20,.43),(.20,.43),(.49,.20),
             (.49,.26),(.20,.45),(-.20,.45),(-.49,.26)]
    vertices=[(x+dx,y,z) for dx in [-.055,.055] for y,z in outline]
    n=len(outline)
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh('Crossing_copper_bridge_shoulder',vertices,faces,'copper')
check_deck()
build_complete('crossing',1)
