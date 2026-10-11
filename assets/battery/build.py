"""Four slim ceramic storage cells on a low timber deck, joined by copper bus bars. Each cell wears four charge rings
that light from the bottom up as the battery fills: `charge_<n>` holds the n-th ring of every cell (the game shows
rings 0..k-1 for k quarters of charge). An empty battery is plain white cells."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(203)
CELLS = [(x,y) for y in [-.4,.4] for x in [-.4,.4]]
R, BOTTOM, TOP = .26, .12, .92
RINGS = [.42+i*.12 for i in range(4)]
rounded_box('Battery_timber_deck',(0,0,.06),(1.56,1.56,.12),'wood',.04)
for i,y in enumerate([-.5,0,.5]):
    box('Battery_deck_slat',(0,y,.122),(1.5,.06,.012),'lightwood')
lit = [[] for _ in RINGS]
for x,y in CELLS:
    cylinder('Battery_copper_foot',(x,y,BOTTOM+.04),R+.025,.08,'copper',12)
    cylinder('Battery_ceramic_cell',(x,y,(BOTTOM+.08+TOP)/2),R,TOP-BOTTOM-.08,'ceramic',12)
    sphere('Battery_ceramic_cap',(x,y,TOP),(R,R,.09),'ceramic',12,4)
    cylinder('Battery_brass_terminal',(x,y,TOP+.1),.07,.08,'brass',8)
    for n,z in enumerate(RINGS):
        lit[n].append(cylinder('Battery_charge_ring',(x,y,z),R+.018,.1,material('charge',.8),12))
for n,parts in enumerate(lit):
    join(parts,f'charge_{n}',(0,0,RINGS[n]))
# Copper bus bars between the terminals, round the square.
for (ax,ay),(bx,by) in [(CELLS[0],CELLS[1]),(CELLS[1],CELLS[3]),(CELLS[3],CELLS[2]),(CELLS[2],CELLS[0])]:
    beam('Battery_copper_bus',(ax,ay,TOP+.12),(bx,by,TOP+.12),.05,'copper',6)
grass(-.68,.05)
grass(.05,-.7)
build_complete('battery',2)
