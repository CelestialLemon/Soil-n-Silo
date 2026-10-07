"""Staked tomato; harvest returns to the matching mature leaf stage_2."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(103)
def plant(n):
    if n<2:
        h=.12 if n==0 else .30
        beam('decor_tomato_stem',(0,0,.01),(0,0,h),.065,'green')
        for i in range(2 if n==0 else 4):
            a=i*math.pi/2+.4
            z=h*(.4+.12*i)
            leaf('decor_tomato_leaf',(0,0,z),(.13*math.cos(a),.13*math.sin(a),z+.065),.105,'sprout' if n==0 else 'leaf')
        return
    box('Wooden_tomato_stake',(.06,.075,.32),(.07,.07,.64),'wood')
    beam('decor_tomato_stem',(0,0,.01),(0,0,.59),.07,'green')
    for i in range(4):
        angle=.4+i*math.pi/2
        z=.23+.08*i
        end=(.22*math.cos(angle),.22*math.sin(angle),z+.045)
        beam('decor_tomato_branch',(0,0,z),end,.063,'green')
    for i in range(6):
        a=.5+i*math.tau/6
        z=.20+.062*i
        leaf('decor_tomato_leaf',(.06*math.cos(a),.06*math.sin(a),z),
             (.29*math.cos(a),.29*math.sin(a),z+.085),.16,'leaf' if i%2 else 'darkleaf')
    for z in [.22,.45]:
        box('Stake_tie',(0,.05,z),(.13,.08,.06),'straw')
    if n==3:
        for i in range(3):
            a=i*math.tau/3
            sphere('Golden_tomato_flower',(.22*math.cos(a),.22*math.sin(a),.34+.07*i),(.06,.06,.05),'glow',4,2)
    if n==4:
        for i in range(4):
            a=.4+i*math.pi/2
            sphere('Ripe_red_tomato',(.23*math.cos(a),.23*math.sin(a),.22+.065*i),(.088,.088,.08),'tomato',6,3)
for n in range(5):
    stage(n,lambda n=n:plant(n))
centre_xy()
export_and_preview('tomato',250,stages=True)
