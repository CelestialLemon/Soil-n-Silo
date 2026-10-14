"""Cream enamel wind turbine with soft aerofoils and vermilion service details."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from terra_common import *

reset(202)
# Preserve the original centre_xy correction and the exact axle/pivot transform.
X, Y, HUB_Z = .001249969, .018889353, 3.62
hub = Vector((X,Y-.27,HUB_Z))
round_cylinder('Turbine_slate_foot',(X,Y,.065),.30,.13,'slate',bevel=.025,segments=24)
round_cylinder('Turbine_foot_cap',(X,Y,.16),.235,.08,'ivory',bevel=.018)
round_cylinder('Turbine_orange_boot',(X,Y,.265),.17,.15,'orange',top=.153)
# Height rings localise baked contact shadows at the boot and yaw bearing.
levels = [.20,.36,.55,1.1,2.0,2.9,3.60]
vertices = [(X+(.15-.075*(z-.2)/3.4)*math.cos(i*math.tau/20),
             Y+(.15-.075*(z-.2)/3.4)*math.sin(i*math.tau/20),z)
            for z in levels for i in range(20)]
faces = [tuple(range(19,-1,-1))]
faces += [(j*20+i,j*20+(i+1)%20,(j+1)*20+(i+1)%20,(j+1)*20+i)
          for j in range(len(levels)-1) for i in range(20)]
faces.append(tuple(range(120,140)))
soften(mesh('Turbine_tower',vertices,faces,paint('ivory')),.015,2)
round_cylinder('Turbine_lower_trim',(X,Y,.37),.151,.055,'slate',bevel=.008)
round_cylinder('Turbine_yaw_collar',(X,Y,3.48),.092,.09,'orange',bevel=.009)
soft_box('Turbine_nacelle',(X,Y+.045,HUB_Z),(.245,.55,.25),'ivory',.095)
soft_box('Turbine_rear_cap',(X,.31411069,HUB_Z),(.19,.054,.19),'slate',.023)
soft_box('Turbine_nacelle_band',(X,Y+.15,HUB_Z),(.253,.065,.252),'orange',.03)
# Service hatch, a grip, and inset-look vent slats on both side cheeks.
soft_box('Turbine_service_frame',(X,Y-.145,.72),(.145,.035,.24),'slate',.025)
soft_box('Turbine_service_panel',(X,Y-.167,.72),(.116,.018,.205),'ivory',.017)
soft_box('Turbine_hatch_latch',(X+.032,Y-.18,.73),(.025,.012,.055),'orange',.005)
for side in [-1,1]:
    soft_box('Turbine_vent_recess',(X+side*.121,Y+.035,3.63),(.016,.14,.095),'recess',.006)
    for z in [3.608,3.639,3.670]:
        soft_box('Turbine_vent_louvre',(X+side*.132,Y+.035,z),(.012,.118,.012),'trim',.004)
for i in range(4):
    a = math.pi/4+i*math.tau/4
    round_cylinder('Turbine_anchor_bolt',(X+.252*math.cos(a),Y+.252*math.sin(a),.133),
                   .023,.025,'trim',bevel=.004,segments=8)

parts = [round_cylinder('Turbine_hub_back',hub+Vector((0,.025,0)),.111,.105,'slate',
                        rot=(math.pi/2,0,0),bevel=.014)]
# Closed, gently rounded blades. Three cross sections give the aerofoil a soft crown.
for i in range(3):
    angle = math.pi/2+i*math.tau/3
    d = Vector((math.cos(angle),0,math.sin(angle)))
    t = Vector((-math.sin(angle),0,math.cos(angle)))
    outline = [(.075,-.048),(.30,-.080),(1.21,-.023),(1.24,.015),
               (1.04,.054),(.43,.180),(.15,.095)]
    for label, shape, colour, depth in [
        ('blade',outline,'ivory',.030),
        ('tip',[(1.035,-.031),(1.21,-.023),(1.24,.015),(1.04,.054)],'orange',.032),
    ]:
        vertices = [tuple(hub+d*r+t*w+Vector((0,y,0))) for y in [-depth,depth] for r,w in shape]
        n = len(shape)
        faces = [tuple(range(n)),tuple(range(2*n-1,n-1,-1))]
        faces += [(j+n,(j+1)%n+n,(j+1)%n,j) for j in range(n)]
        obj = mesh('Turbine_'+label+'_'+str(i),vertices,faces,paint(colour))
        parts.append(soften(obj,.012 if label=='blade' else .004,3))
parts.append(blob('Turbine_spinner',hub+Vector((0,-.013,0)),(.115,.077,.115),
                  'white',segments=16,rings=8))
parts.append(blob('Turbine_spinner_badge',hub+Vector((0,-.081,0)),(.034,.009,.034),
                  'orange',segments=12,rings=6))
rotor = join(parts,'move_spin_rotor',hub)
# Preserve original initial silhouette extents as well as the pivot, axis and speed.
old_low, old_high = bounds([rotor])
fit_bounds([rotor],(-1.0826216,-.34111069,old_low.z),(1.0826216,old_high.y,4.86))
orient_x(rotor,(0,-1,0))
rotor['speed'] = 1.2
complete('wind_turbine',(2.1652432,.68222138,4.86),reach=.24)
