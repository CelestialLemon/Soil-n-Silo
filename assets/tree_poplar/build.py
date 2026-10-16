"""Tall Lombardy poplar with a narrow upright crown. Distant canopy: #2e633d."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from trees import *
reset(318)


def poplar(n):
    lean = [.03,.14,-.11][n]
    stem('Poplar_upright_trunk',[(0,0,0,.16),(0,0,.9,.105),(lean,0,3.15,.05)])
    crown('Poplar_tall_column',(lean,0,2.62),(.51,.51,1.58),'poplar_leaf')
    for i in range(4):
        a = i*math.tau/4+.2
        crown('Poplar_upright_lobe',(.28*math.cos(a)+lean*.5,.28*math.sin(a),2.05+.13*(i%2)+.08*n*math.cos(a)),
              (.43,.43,.99),'poplar_light' if i%2 else 'poplar_leaf',a)


variants('tree_poplar',poplar,[(1,1,0),(1.08,.88,.28),(.94,1.06,-.18)])
