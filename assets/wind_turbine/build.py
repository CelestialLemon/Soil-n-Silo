"""One-tile slim white wind tower with a big three-blade rotor turning around the front-facing axle.

The rotor is the turbine's silhouette, so it is sized like a real turbine's (about two thirds of the hub height across)
and sweeps past the tile, high above the buildings beside it (its lowest tip is above a silo's roof)."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(202)
HUB_Z, BLADE = 3.62, 1.24
cylinder('Turbine_ceramic_foot',(0,0,.08),.3,.16,'ceramic',10,top=.24)
cylinder('Turbine_copper_foot_band',(0,0,.19),.18,.07,'copper',10)
cylinder('Turbine_slim_tower',(0,0,1.86),.15,3.4,'ceramic',10,top=.075)
cylinder('Turbine_copper_collar',(0,0,3.5),.085,.07,'copper',10)
# A sleek nacelle: a long rounded body along the axle, a copper band and a short tail.
rounded_box('Turbine_nacelle',(0,.04,HUB_Z),(.2,.5,.2),'ceramic',.08)
box('Turbine_nacelle_band',(0,.18,HUB_Z),(.215,.06,.215),'copper')
hub = Vector((0,-.27,HUB_Z))
parts = [cylinder('Turbine_spinner',hub+Vector((0,.02,0)),.1,.12,'ceramic',10,rot=(math.pi/2,0,0),top=.035),
         cylinder('Turbine_spinner_tip',hub+Vector((0,-.065,0)),.035,.05,'copper',8,rot=(math.pi/2,0,0),top=.012)]
for i in range(3):
    angle = math.pi/2+i*math.tau/3
    d = Vector((math.cos(angle),0,math.sin(angle)))
    t = Vector((-math.sin(angle),0,math.cos(angle)))
    # A long tapered blade: broad near the root (leading edge straight, trailing edge swept), thin at the tip.
    outline = [(.07,-.05),(.3,-.06),(BLADE-.02,-.02),(BLADE,.015),(.42,.095),(.11,.06)]
    tip = [(BLADE*.86,-.03),(BLADE,-.02),(BLADE,.015),(BLADE*.86,.04)]
    for name,shape,colour,dy in [('Turbine_ceramic_blade',outline,'ceramic',.025),('Turbine_blade_tip',tip,'clay',.033)]:
        vertices = [tuple(hub+d*r+t*w+Vector((0,y,0))) for y in [-dy,dy] for r,w in shape]
        n = len(shape)
        faces = [tuple(range(n)),tuple(range(2*n-1,n-1,-1))]+[(j+n,(j+1)%n+n,(j+1)%n,j) for j in range(n)]
        parts.append(mesh(name,vertices,faces,colour))
rotor = join(parts,'move_spin_rotor',hub)
orient_x(rotor,(0,-1,0))
rotor['speed'] = 1.2
grass(-.27,-.2)
grass(.25,.22)
build_complete('wind_turbine',1,overhang_above=2.3)
