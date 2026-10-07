"""A small open market with cream/red awning, seed sacks and produce crates."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(108)
for x in [-.83,.83]:
    for y in [-.32,.32]:
        box('Stall_wooden_post',(x,y,.69),(.10,.10,1.38),'darkwood')
box('Stall_counter',(0,-.045,.70),(1.82,.67,.12),'lightwood')
for i in range(8):
    box('Stall_counter_front_board',(-.79+i*.226,-.33,.39),(.217,.08,.54),'wood' if i%2 else 'lightwood')
box('Stall_counter_back',(0,.23,.36),(1.74,.07,.54),'wood')
# Closed canvas strips give robust normals and broad alternating colour.
for i in range(8):
    x=-.83125+i*.2375
    box('Striped_canvas_awning',(x,0,1.40),(.2375,.94,.09),'red' if i%2 else 'cream',rot=(.12,0,0))
    box('Awning_front_valance',(x,-.452,1.31),(.2375,.08,.16),'red' if i%2 else 'cream')
# Sacks and crates use the same palette as the crops they sell.
for x,y in [(-.58,.025),(-.25,.06)]:
    sphere('Burlap_seed_sack',(x,y,.88),(.145,.16,.18),'sack',8,4)
    cylinder('Seed_sack_neck',(x,y,1.065),.07,.09,'cream',6)
for x in [.24,.62]:
    box('Produce_crate_base',(x,-.045,.80),(.31,.38,.08),'darkwood')
    for dx in [-.16,.16]:
        box('Produce_crate_side',(x+dx,-.045,.86),(.06,.38,.18),'lightwood')
    for y in [-.235,.145]:
        box('Produce_crate_end',(x,y,.86),(.37,.06,.18),'wood')
    for i in range(2):
        sphere('Market_produce',(x+.075*(2*i-1),-.065+.09*(i%2),.94),(.076,.075,.072),'tomato' if x<.4 else 'pumpkin',6,3)
box('Market_sign_board',(0,.20,1.66),(.69,.11,.32),'wood')
box('Market_sign_face',(0,.135,1.66),(.59,.065,.22),'darkwood')
cylinder('Market_coin_symbol',(0,.085,1.66),.084,.065,'gold',8,rot=(math.pi/2,0,0))
centre_xy()
export_and_preview('shop_stall',800)
