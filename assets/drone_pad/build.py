"""Round ceramic landing deck, mint light ring and a copper charging mast."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(225)
for x,y in [(-.54,-.54),(.54,-.54),(-.54,.54),(.54,.54)]:
    rounded_box('Pad_timber_foot',(x,y,.08),(.22,.22,.16),'wood',.035)
cylinder('Pad_ceramic_landing_platform',(0,0,.16),.89,.20,'ceramic',24)
cylinder('Pad_solar_blue_landing_disc',(0,0,.27),.70,.035,'solar',24)
ring('Pad_emissive_charge_ring',(0,0,.278),.785,.045,material('charge',.8))
for x in [-.19,.19]:
    box('Pad_landing_mark',(x,0,.295),(.09,.50,.025),'ceramic')
box('Pad_landing_mark_crossbar',(0,0,.295),(.42,.09,.025),'ceramic')
rounded_box('Pad_charger_base',(.70,.62,.24),(.25,.25,.36),'wood',.045)
cylinder('Pad_copper_charging_mast',(.70,.62,.47),.07,.40,'copper',8)
rounded_box('Pad_ceramic_charging_head',(.70,.62,.67),(.25,.22,.14),'ceramic',.04)
box('Pad_charge_indicator',(.70,.50,.67),(.12,.035,.07),material('charge',.8))
beam('Pad_charging_arm',(.70,.62,.57),(.49,.41,.57),.08,'brass')
grass(-.75,.65)
grass(-.72,-.66)
build_complete('drone_pad',2)
