"""Quiet enamel power marker with ceramic insulators and an amber bead."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from terra_machines import *

reset(204)
round_cylinder('Pylon_stone_foot',(0,0,.05),.14,.10,'slate',top=.11,segments=16,bevel=.016)
round_cylinder('Pylon_timber_pole',(0,0,.62),.06,1.06,'ivory',top=.05,segments=16,bevel=.012)
round_cylinder('Pylon_ceramic_insulator',(0,0,1.20),.075,.10,'ivory',segments=16,bevel=.018)
round_cylinder('Pylon_ceramic_insulator',(0,0,1.29),.06,.08,'white',segments=16,bevel=.017)
round_cylinder('Pylon_copper_cap',(0,0,1.37),.085,.06,'orange',top=.04,segments=16,bevel=.012)
blob('Pylon_lamp',(0,0,1.43),(.04,.04,.04),'lamp',segments=12,rings=8,emission=.7)
round_cylinder('Pylon_orange_boot',(0,0,.16),.070,.12,'orange',top=.066,segments=12,bevel=.01)
round_cylinder('Pylon_insulator_gasket',(0,0,1.25),.057,.028,'slate',segments=12,bevel=.005)
soft_box('Pylon_service_hatch',(0,-.059,.40),(.066,.018,.13),'slate',.008)
detail_box('Pylon_hatch_mark',(0,-.071,.42),(.025,.008,.034),'white',.003)
tuft(.13,-.1)
machine_complete('pylon',1,reach=.13)
