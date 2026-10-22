"""Rounded berry shrub with broad foliage and a few bold red berries.

Spring fresh green in white flower (#76a84e), summer green with berries,
autumn russet and amber with berries (#a8502f), winter a bare twiggy mound
keeping its red berries (#6d5644 from afar).
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from trees import *

FOLIAGE = {'spring': ('leaf','sprout','green'), 'summer': ('green','leaf','darkleaf'),
           'autumn': ('russet_leaf','amber_leaf','russet_leaf'), 'winter': ('twig','darkwood','twig')}


def bush(season):
    cylinder('Bush_woody_stem',(0,0,.16),.095,.32,'bark',6)
    shrink = .8 if season == 'winter' else 1
    for (loc,scale),colour in zip([((0,0,.43),(.34,.34,.37)),((-.20,-.08,.36),(.22,.24,.27)),
                                   ((.19,.08,.39),(.24,.24,.29))],FOLIAGE[season]):
        sphere('Bush_round_foliage',loc,tuple(v*shrink for v in scale),colour,10,5)
    for x,y,z in [(-.24,-.24,.49),(.23,-.18,.57),(.16,.27,.45),(-.23,.19,.60)]:
        if season == 'spring':
            sphere('Bush_white_flower',(x,y,z),(.07,.07,.05),'feather',6,3)
        else:
            sphere('Bush_red_berry',(x*shrink,y*shrink,z*shrink),(.055,.055,.054),'tomato',6,3)
    centre_xy()
    export_and_preview(model_name('bush',season),800,preview=preview_path('bush',season))


each_season('bush',116,bush)
