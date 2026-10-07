"""Compact flour windmill, one axle-aligned mesh owns all four sails."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(110)
cylinder('Mill_tapered_tower',(0,0,1.18),.79,2.36,'chalk',8,top=.50)
cylinder('Mill_stone_foot',(0,0,.12),.82,.24,'stone',8)
cylinder('Mill_conical_roof',(0,0,2.38),.64,.52,'slate',8,top=0)
box('Mill_front_door',(0,-.73,.48),(.44,.11,.72),'wood')
box('Mill_door_lintel',(0,-.76,.88),(.60,.13,.10),'cream')
window('Mill_back_window',0,.575,1.53,.35,.42,lit=False)
for x in [-.61,.61]:
    window('Mill_side_window',x,0,1.37,.34,.40,side=True,lit=False)
hub=(0,-.73,1.64)
parts=[cylinder('Windmill_hub',hub,.135,.23,'darkwood',10,rot=(math.pi/2,0,0))]
# Four broad canvas paddles on robust oak spars. Shape is entirely in X/Z.
for i in range(4):
    a=math.pi/4+i*math.pi/2
    direction=Vector((math.cos(a),0,math.sin(a)))
    tangent=Vector((-math.sin(a),0,math.cos(a)))
    start=Vector(hub)+direction*.10
    tip=Vector(hub)+direction*.94
    parts.append(beam('Windmill_oak_spar',start,tip,.085,'wood'))
    p=Vector(hub)+direction*.36
    q=Vector(hub)+direction*.94
    # Closed panel thickness .075; a widening trapezoid reads as a sail.
    corners=[p-tangent*.10,q-tangent*.14,q+tangent*.14,p+tangent*.10]
    verts=[tuple(v+Vector((0,dy,0))) for dy in [-.04,.04] for v in corners]
    parts.append(mesh('Windmill_canvas_sail',verts,[(0,1,2,3),(7,6,5,4),(0,4,5,1),
                     (1,5,6,2),(2,6,7,3),(3,7,4,0)],'cream'))
    for radius in [.48,.72,.93]:
        mid=Vector(hub)+direction*radius+Vector((0,-.055,0))
        parts.append(beam('Sail_crossbar',mid-tangent*.14,mid+tangent*.14,.072,'lightwood'))
sails=join(parts,'move_spin_sails',hub)
orient_x(sails,(0,-1,0))
sails['speed']=1.2
centre_xy()
export_and_preview('mill',3000)
