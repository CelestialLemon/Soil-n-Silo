"""Broad lumpy oak on a stout forked trunk. Distant canopy: #467348.

Spring fresh green (#76a84e), summer deep green, autumn amber and russet
(#d98a32), winter bare boughs with grey-brown twig masses (#8a7d6e).
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from trees import *

CLUSTERS = [((0,0,2.29),(.81,.76,.72)), ((-.55,-.26,2.13),(.58,.63,.61)),
            ((.53,-.27,2.04),(.64,.59,.58)), ((-.33,.51,2.18),(.67,.56,.63)),
            ((.43,.43,2.25),(.62,.61,.59)), ((-.15,.02,2.62),(.58,.57,.52))]
COLOURS = {
    'spring': ['leaf','sprout','leaf','leaf','sprout','sprout'],
    'summer': ['oak_leaf','oak_light','oak_leaf','oak_leaf','oak_light','oak_light'],
    'autumn': ['amber_leaf','gold_leaf','russet_leaf','amber_leaf','russet_leaf','gold_leaf'],
}


def oak(n, season):
    lean = [-.06,.15,-.13][n]
    stem('Oak_stout_trunk',[(0,0,0,.22),(.02,0,.55,.17),(lean,.02,1.25,.14),(lean,.04,1.85,.085)])
    for i in range(3):
        a = i*math.tau/3+.2
        beam('Oak_fork',(lean,0,1.12),(.32*math.cos(a)+lean,.32*math.sin(a),1.95),.17,'bark',6)
    if season == 'winter':
        # Bare: each fork spreads into two crooked boughs that split into
        # upturned branchlets, with a loose mass of twigs at their ends.
        for i in range(3):
            a = i*math.tau/3+.2
            fork = (.32*math.cos(a)+lean,.32*math.sin(a),1.95)
            for j,(spread,rise,turn) in enumerate([(.82,2.3,-.38),(.55,2.62,.42)]):
                b = a+turn
                tip = (spread*math.cos(b)+lean,spread*math.sin(b),rise-.10*((i+n)%2))
                bough('Oak_bare',fork,tip,.11-.02*j)
                for side in (-.5,.5):
                    end = (tip[0]+.3*math.cos(b+side),tip[1]+.3*math.sin(b+side),tip[2]+.32)
                    bough('Oak_bare_branchlet',tip,end,.07)
                twigs('Oak_bare',(tip[0]+.12*math.cos(b),tip[1]+.12*math.sin(b),tip[2]+.3),
                      (.25,.23,.2),'twig',b)
        twigs('Oak_bare_top',(lean-.08,0,2.82),(.3,.28,.22),'twig',n*.4)
        return
    for ((x,y,z),scale),colour in zip(CLUSTERS,COLOURS[season]):
        crown('Oak_cluster',(x+lean,y,z),scale,colour,n*.19)


seasonal('tree_oak',314,oak,[(1,1,0),(.88,.88,.32),(.97,1.08,-.28)])
