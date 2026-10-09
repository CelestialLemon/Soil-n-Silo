"""Flush sorting belt, copper diversion gate and ceramic product sign."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from logistics import *
reset(223)
straight_deck(rails=False)
branch_wings()
corner_rails()
cylinder('Sorter_gate_hinge',(.29,-.08,.245),.06,.29,'brass',8)
rounded_box('Sorter_copper_diverter',(.24,-.045,.25),(.085,.32,.16),'copper',.025).rotation_euler.z = -.42
beam('Sorter_sign_post',(-.39,.32,.08),(-.39,.32,.48),.085,'wood')
rounded_box('Sorter_ceramic_sign',(-.34,.32,.48),(.28,.12,.22),'ceramic',.04)
box('Sorter_blue_label',(-.34,.251,.48),(.15,.025,.105),'solar')
box('Sorter_back_label',(-.34,.389,.48),(.15,.025,.105),'solar')
check_deck()
build_complete('sorter',1)
