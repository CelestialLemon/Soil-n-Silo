"""Riverside willow: wide dome and long soft curtains. Distant canopy: #83b390."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from trees import *
reset(317)


def willow(n):
    lean = [.10,-.13,.04][n]
    stem('Willow_crooked_trunk',[(0,0,0,.23),(-.10,0,.75,.17),(lean,.03,1.68,.13),(.10,0,2.3,.075)])
    for i in range(3):
        a = i*math.tau/3
        beam('Willow_low_bough',(lean,0,1.43),(.38*math.cos(a),.38*math.sin(a),2.18),.16,'bark',6)
    crown('Willow_dome',(0,0,2.39),(.94,.94,.59),'willow_leaf')
    for i in range(8):
        a = i*math.tau/8+.1*n
        z = 1.48 + .12*math.sin(i*2+n)
        crown('Willow_drooping_curtain',(.74*math.cos(a),.74*math.sin(a),z),
              (.42,.42,1.13+.06*math.cos(i+n)),
              'willow_shade' if i%3 == 0 else 'willow_leaf',a)


variants('tree_willow',willow,[(1,1,0),(.92,.88,.23),(1.04,1.06,-.21)])
