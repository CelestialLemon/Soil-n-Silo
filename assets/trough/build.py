"""Open wooden trough; the grain surface is exactly the separate mesh fill."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(106)
box('Trough_floor',(0,0,.18),(.94,.32,.08),'darkwood')
for x in [-.35,.35]:
    for y in [-.125,.125]:
        box('Trough_short_leg',(x,y,.075),(.10,.10,.15),'wood')
for y in [-.165,.165]:
    box('Trough_side',(0,y,.265),(1.0,.07,.17),'lightwood')
for x in [-.465,.465]:
    box('Trough_end',(x,0,.265),(.07,.33,.17),'wood')
parts=[box('Grain_surface',(0,0,.265),(.85,.24,.075),'gold')]
for i in range(7):
    parts.append(sphere('Grain_mound',(-.32+.105*i,.045*(1 if i%2 else -1),.297),(.071,.068,.035),'cream',4,2))
join(parts,'fill',(0,0,0))
centre_xy()
export_and_preview('trough',800)
