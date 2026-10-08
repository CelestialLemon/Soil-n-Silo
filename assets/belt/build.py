"""A seamless timber conveyor with flush brass forward chevrons."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from logistics import *
reset(221)
straight_deck()
check_deck()
build_complete('belt',1)
