"""Low 3x3 timber glasshouse shell: clear crop beds, copper ridge vents and living corners.
Panes are single surfaces split at the bars, recessed at least 40 mm from the frame face.
The game's field view supplies all crops and soil; running_ lanterns mean night heating.
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(151)
EAVE, RIDGE, EDGE = 1.45, 2.10, 1.39
BAYS = [-1.39, -.46, .46, 1.39]

def pane(name, points):
    return mesh('glass_'+name, points, [tuple(range(len(points)))], 'glass')

# The eave clears ripe sunflowers in the outer rows, including their wind sway.
# Discrete stone shoes, low sill and warm timber posts. No slab across the growing beds.
for side in [-1, 1]:
    for q in BAYS:
        for x,y in [(side*EDGE,q),(q,side*EDGE)]:
            rounded_box('Stone_shoe',(x,y,.09),(.20,.20,.18),'stone_light',.025)
            box('Timber_post',(x,y,.795),(.10,.10,1.35),'lightwood')
    for z in [.22,EAVE]:
        box('Timber_side_rail',(side*EDGE,0,z),(.10,2.88,.10),'wood')
        box('Timber_end_rail',(0,side*EDGE,z),(2.88,.10,.10),'wood')
    # Side windows split at every bar; the pane centre is behind the outer face of the bar.
    for a,b in zip(BAYS,BAYS[1:]):
        pane('side',[(side*EDGE,a,.25),(side*EDGE,b,.25),(side*EDGE,b,EAVE),(side*EDGE,a,EAVE)])
    # Gable glazing in two triangular lights, and the end-wall panes below it.
    for a,b in zip(BAYS,BAYS[1:]):
        pane('end',[(a,side*EDGE,.25),(b,side*EDGE,.25),(b,side*EDGE,EAVE),(a,side*EDGE,EAVE)])
    for x in [-EDGE,EDGE]:
        beam('Gable_rafter',(x,side*EDGE,EAVE),(0,side*EDGE,RIDGE),.11,'lightwood')
        pane('gable',[(x,side*EDGE,EAVE),(0,side*EDGE,EAVE),(0,side*EDGE,RIDGE)])
    beam('Gable_kingpost',(0,side*EDGE,EAVE),(0,side*EDGE,RIDGE),.10,'wood')
    # Individual roof bays: no glazing on ambient-motion meshes.
    for a,b in zip(BAYS,BAYS[1:]):
        pane('roof',[(side*EDGE,a,EAVE),(side*EDGE,b,EAVE),(0,b,RIDGE),(0,a,RIDGE)])
    for y in BAYS:
        beam('Roof_rafter',(side*EDGE,y,EAVE),(0,y,RIDGE),.11,'lightwood')
box('Copper_ridge',(0,0,RIDGE+.025),(.13,2.90,.12),'copper')
# A clearly framed central front door, still glazed; a brass pull is visible from close up.
for x in [-.46,.46]:
    box('Door_jamb',(x,-EDGE-.015,.71),(.09,.13,1.02),'wood')
box('Door_head',(0,-EDGE-.015,1.16),(.98,.13,.10),'wood')
box('Door_crossrail',(0,-EDGE-.015,.65),(.96,.13,.08),'wood')
sphere('Brass_door_pull',(.32,-EDGE-.035,.72),(.07,.05,.07),'brass',6,3)
# Two raised copper vent hoods along the ridge, with a dark open throat.
for y in [-.75,.75]:
    box('Vent_throat',(0,y,RIDGE+.075),(.30,.47,.12),'darkwood')
    box('Copper_vent_hood',(0,y,RIDGE+.17),(.44,.58,.075),'copper',rot=(0,.16,0))
# Vines climb the outside corners, rather than occupying crop beds.
for x,y in [(-1.34,-1.34),(1.34,1.34)]:
    vine((x,y,.23),(x,y,1.13))
    vine((x,y,1.13),(x*.65,y,1.28))
# Warm self-lit heater lanterns hanging just inside both gables, behind the panes.
for y in [-1.20,1.20]:
    box('Lantern_copper_cap',(0,y,1.49),(.31,.24,.08),'copper')
    box('idle_Heater_lantern',(0,y,1.35),(.24,.18,.20),'clay')
    box('running_Heater_lantern',(0,y,1.35),(.24,.18,.20),material('glow',.8))
build_complete('greenhouse',3,states=True)
