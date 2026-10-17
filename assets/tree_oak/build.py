"""Broad lumpy oak on a stout forked trunk. Distant canopy: #467348."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from trees import *
reset(314)


def oak(n):
    lean = [-.06,.15,-.13][n]
    stem('Oak_stout_trunk',[(0,0,0,.22),(.02,0,.55,.17),(lean,.02,1.25,.14),(lean,.04,1.85,.085)])
    for i in range(3):
        a = i*math.tau/3+.2
        beam('Oak_fork',(lean,0,1.12),(.32*math.cos(a)+lean,.32*math.sin(a),1.95),.17,'bark',6)
    for loc,scale,colour in [
        ((lean,0,2.29),(.81,.76,.72),'oak_leaf'),
        ((-.55+lean,-.26,2.13),(.58,.63,.61),'oak_light'),
        ((.53+lean,-.27,2.04),(.64,.59,.58),'oak_leaf'),
        ((-.33+lean,.51,2.18),(.67,.56,.63),'oak_leaf'),
        ((.43+lean,.43,2.25),(.62,.61,.59),'oak_light'),
        ((-.15+lean,.02,2.62),(.58,.57,.52),'oak_light')]:
        crown('Oak_cluster',loc,scale,colour,n*.19)


variants('tree_oak',oak,[(1,1,0),(.88,.88,.32),(.97,1.08,-.28)])
