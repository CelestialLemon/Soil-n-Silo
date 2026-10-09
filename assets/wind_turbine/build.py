"""One-tile white wind tower; three rounded blades turn around the front-facing axle."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(202)
cylinder('Turbine_ceramic_foot',(0,0,.14),.28,.28,'ceramic',12,top=.21)
cylinder('Turbine_slim_tower',(0,0,1.56),.13,2.84,'ceramic',10,top=.075)
for z in [.27,1.2,2.62]:
    cylinder('Turbine_copper_collar',(0,0,z),.14 if z<2 else .095,.10,'copper',10)
rounded_box('Turbine_nacelle',(0,.01,3.04),(.24,.42,.23),'ceramic',.07)
hub = Vector((0,-.255,3.04))
parts = [sphere('Turbine_brass_hub',hub,(.10,.105,.10),'brass',10,4)]
for i in range(3):
    angle = math.pi/2+i*math.tau/3
    d = Vector((math.cos(angle),0,math.sin(angle)))
    t = Vector((-math.sin(angle),0,math.cos(angle)))
    # Broad tapered, closed blades; sweep radius remains below .45 m.
    corners = [hub+d*.07-t*.05,hub+d*.27-t*.095,
               hub+d*.44-t*.025,hub+d*.42+t*.055,hub+d*.13+t*.06]
    vertices = [tuple(p+Vector((0,dy,0))) for dy in [-.04,.04] for p in corners]
    parts.append(mesh('Turbine_ceramic_blade',vertices,
        [(0,1,2,3,4),(9,8,7,6,5)]+[(j+5,(j+1)%5+5,(j+1)%5,j) for j in range(5)],'ceramic'))
rotor = join(parts,'move_spin_rotor',hub)
orient_x(rotor,(0,-1,0))
rotor['speed'] = 1.8
vine((.14,.05,.30),(.12,.05,1.0))
grass(-.26,-.18)
grass(.24,.18)
build_complete('wind_turbine',1)
