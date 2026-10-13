"""A staked young tree with a small faceted living crown and brass ties."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(231)
beam('Sapling_young_trunk',(0,0,.015),(.035,.01,.48),.075,'bark',6)
beam('Sapling_timber_stake',(-.16,.06,0),(-.16,.06,.49),.07,'wood')
for z in [.18,.35]:
    beam('Sapling_brass_tie',(-.17,.06,z),(.03,0,z),.04,'brass',6)
for a,b in [((.02,0,.28),(-.13,-.05,.46)),((.025,0,.35),(.16,.06,.50))]:
    beam('Sapling_branch',a,b,.045,'bark',6)
for x,y,z,size,colour in [(-.12,-.04,.47,.17,'leaf'),(.13,.05,.49,.16,'sprout'),(.025,0,.54,.13,'leaf')]:
    sphere('Sapling_young_crown',(x,y,z),(size,size*.8,size*.8),colour,7,3)
grass(.16,-.18)
build_complete('sapling',1)
