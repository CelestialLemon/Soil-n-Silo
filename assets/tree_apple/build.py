"""Low orchard tree, short trunk and coral fruit dots. Distant canopy: #567843."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from trees import *
reset(319)


def apple(n):
    lean = [-.07,.10,0][n]
    stem('Apple_short_trunk',[(0,0,0,.17),(.02,0,.5,.12),(lean,0,1.19,.08)])
    for i in range(3):
        a = i*math.tau/3+.3
        beam('Apple_orchard_fork',(lean,0,.64),(.31*math.cos(a),.31*math.sin(a),1.30),.13,'bark',6)
    crown('Apple_low_crown',(lean,0,1.53),(.73,.69,.59),'apple_leaf')
    for i in range(4):
        a = i*math.tau/4+.24*n
        crown('Apple_round_lobe',(.42*math.cos(a)+lean,.42*math.sin(a),1.38+.10*(i%2)),
              (.46,.46,.49),'apple_leaf',a)
    for i in range(6):
        a = i*math.tau/6+.17
        sphere('Apple_fruit',(.73*math.cos(a)+lean,.73*math.sin(a),1.47+.17*(i%2)),
               (.115,.115,.12),'apple_red' if i%3 else 'blossom',6,3)


variants('tree_apple',apple,[(1,1,0),(.92,.96,.28),(1.06,1.06,-.2)])
