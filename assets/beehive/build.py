"""Three ivory timber hive boxes, copper lid and a flowering terracotta trough."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from botanical import *
reset(228)
for x in [-.23,.23]:
    for y in [-.18,.25]:
        box('Hive_timber_leg',(x,y,.14),(.10,.10,.28),'wood')
box('Hive_stand',(0,.035,.25),(.63,.59,.10),'lightwood')
for i in range(3):
    z=.37+i*.17
    rounded_box('Hive_stacked_ceramic_box',(0,.035,z),(.58,.51,.16),'ceramic',.035)
    for y in [-.232,.302]:
        box('Hive_timber_lifting_handle',(0,y,z),(.23,.065,.06),'wood')
rounded_box('Hive_copper_weather_lid',(0,.035,.82),(.69,.62,.14),'copper',.045)
box('Hive_dark_entry',(0,-.235,.305),(.26,.025,.065),'darkwood')
box('Hive_landing_board',(0,-.32,.28),(.38,.19,.065),'lightwood')
rounded_box('decor_Hive_flower_trough',(0,-.405,.115),(.70,.17,.23),'clay',.035)
box('decor_Hive_trough_soil',(0,-.405,.231),(.58,.12,.025),'darkwood')
for i,x in enumerate([-.23,0,.23]):
    beam('decor_Flower_stem',(x,-.40,.24),(x,-.40,.41+.045*(i%2)),.04,'green',6)
    flower('decor_Hive_flower',(x,-.40,.42+.045*(i%2)),.085,'gold' if i!=1 else 'red_light',5)
    leaf('decor_Flower_leaf',(x,-.40,.29),(x+.09,-.34,.37),.08,'leaf')
build_complete('beehive',1)
