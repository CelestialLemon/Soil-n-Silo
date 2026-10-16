"""High-ground pine: uneven tiered blue-green spire. Distant canopy: #28564f."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from trees import *
reset(315)


def pine(n):
    lean = [0,.12,-.10][n]
    stem('Pine_bare_trunk',[(0,0,0,.15),(0,0,.65,.11),(lean,.03,2.9,.055)])
    for i,(z,r,h) in enumerate([(1.23,.88,1.03),(1.80,.73,1.08),(2.33,.56,1.06),(2.88,.34,.94)]):
        r *= 1 + [.0,.07,-.06][n]*math.cos(i*1.1)
        z += .055*n*math.sin(i*1.9)
        obj = cylinder('Pine_canopy_tier',(lean*z/3,0,z),r,h,
                       'pine_light' if i in [1,3] else 'pine_leaf',8,top=0)
        obj.rotation_euler.z = .14*i+.12*n


variants('tree_pine',pine,[(1,1,0),(.86,.86,.2),(.91,1.04,-.22)])
