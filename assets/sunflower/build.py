"""Three sunflowers per tile, four stages; ripe seed heads face glTF +Z."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from botanical import *
reset(233)
POSITIONS=[(0,.08,1),(-.24,-.18,.70),(.24,.20,.78)]


def plant(n):
    for i,(x,y,scale) in enumerate(POSITIONS):
        h=[.12,.39,.85,1.19][n]*scale
        beam('Sunflower_stem',(x,y,.025),(x,y,h),.065,'green',6)
        for j in range(2 if n<2 else 3):
            angle=i*2.5+j*math.pi+.4
            z=h*(.40+j*.19)
            length=.11 if n==0 else .20
            leaf('Sunflower_broad_leaf',(x,y,z),(x+length*math.cos(angle),y+length*math.sin(angle),z+.09),
                 .10 if n==0 else .18,'sprout' if n==0 else 'leaf')
        if n==2:
            sphere('Sunflower_closed_bud',(x,y,h+.045),(.09,.075,.105),'sprout',8,4)
        if n==3:
            r=.215 if i==0 else .155
            flower('Sunflower_ripe_yellow_head',(x,y-.035,h+.035),r,'gold',10,normal=(0,-1,0),core='darkwood')
            # Raised seed centre remains bold at the game's tiny render scale.
            sphere('Sunflower_seed_centre',(x,y-.115,h+.035),(r*.35,.04,r*.35),'straw',8,3)


for n in range(4):
    stage(n,lambda n=n:plant(n))
centre_xy()
bpy.context.view_layer.update()
for obj in bpy.context.scene.objects:
    if obj.type=='MESH':
        for v in obj.data.vertices:
            p=obj.matrix_world@v.co
            assert max(abs(p.x),abs(p.y))<=.5
export_and_preview('sunflower',3000,stages=True)
