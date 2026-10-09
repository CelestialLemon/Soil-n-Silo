"""Fine upright flax, from cotyledons to a tile of small blue blossoms."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from botanical import *
reset(234)
POSITIONS=[(-.25,-.23),(.02,-.24),(.25,-.16),(-.27,.07),(0,.02),(.23,.12),(-.15,.27),(.10,.28)]


def plant(n):
    for i,(x,y) in enumerate(POSITIONS):
        h=[.12,.29,.52,.67][n]-.035*(i%3)
        tip=Vector((x+.025*math.sin(i),y+.025*math.cos(i),h))
        beam('Flax_fine_stem',(x,y,.02),tip,.045,'sprout' if n==0 else 'green',6)
        for j in range(2 if n<2 else 3):
            angle=i*2.4+j*math.pi
            z=h*(.3+j*.20)
            leaf('Flax_narrow_blade',(x,y,z),(x+.12*math.cos(angle),y+.12*math.sin(angle),z+.095),.065,'leaf')
        if n==2:
            sphere('Flax_closed_bud',tip,(.045,.045,.06),'sprout',6,3)
        if n==3:
            flower('Flax_blue_flower',tip,.080,'solar_light',5,normal=(0,-.45,1),core='cream')


for n in range(4):
    stage(n,lambda n=n:plant(n))
centre_xy()
bpy.context.view_layer.update()
for obj in bpy.context.scene.objects:
    if obj.type=='MESH':
        for v in obj.data.vertices:
            p=obj.matrix_world@v.co
            assert max(abs(p.x),abs(p.y))<=.5
export_and_preview('flax',3000,stages=True)
