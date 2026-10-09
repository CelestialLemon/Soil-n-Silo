"""Flush, directional timber decks shared by the one-tile logistics pieces.

Every walking surface ends at Z = .16, including the brass chevron inlays.
Slat end faces are square so adjacent tiles meet without a notch or end cap.
"""
from solarpunk import *

DECK_TOP = .16


def slat(name, y, length=.20, width=.64, angle=0, offset=(0,0)):
    half = width/2
    # Three top strips per half: timber, flush brass V, timber. The V points -Y.
    vertices = []
    for x in [-half,0,half]:
        bend = -.055 if x == 0 else .035
        vertices.extend([(x, y+v, DECK_TOP) for v in [-length/2,bend-.03,bend+.03,length/2]])
    faces = []
    for col in range(2):
        for row in range(3):
            a = col*4+row
            faces.append((a,a+4,a+5,a+1))
    # Closed side walls and bottom, sharing the perimeter of the tessellated top.
    boundary = [0,4,8,9,10,11,7,3,2,1]
    start = len(vertices)
    vertices.extend([(vertices[i][0],vertices[i][1],.06) for i in boundary])
    faces.append(tuple(range(start+len(boundary)-1,start-1,-1)))
    for j,i in enumerate(boundary):
        faces.append((i,start+j,start+(j+1)%len(boundary),boundary[(j+1)%len(boundary)]))
    obj = mesh(name,vertices,faces,'lightwood')
    obj.data.materials.append(material('brass'))
    obj.data.materials.append(material('wood'))
    for i in [1,4]:
        obj.data.polygons[i].material_index = 1
    for polygon in list(obj.data.polygons)[6:]:
        polygon.material_index = 2
    obj.rotation_euler.z = angle
    obj.location.x, obj.location.y = offset
    return obj


def straight_deck(rails=True):
    for y in [-.4,-.2,0,.2,.4]:
        slat('Deck_flush_forward_chevron',y)
    if rails:
        for x in [-.405,.405]:
            box('Timber_continuous_side_rail',(x,0,.11),(.15,1,.22),'wood')
            box('Copper_rail_inlay',(x,0,.225),(.075,1,.03),'copper')
            for y in [-.34,.34]:
                rounded_box('Ceramic_roller_bearing',(x,y,.105),(.17,.16,.16),'ceramic',.035)


def branch_wings(crossing=False):
    for sign in [-1,1]:
        # Side outlets also finish flush with the boundary of the tile.
        slat('Deck_flush_branch_chevron',0,length=.18,width=.64,
             angle=(1 if crossing else sign)*math.pi/2,offset=(sign*.41,0))


def corner_rails():
    for x in [-.405,.405]:
        for y in [-.41,.41]:
            rounded_box('Timber_corner_guide',(x,y,.13),(.15,.18,.26),'wood',.04)
            box('Copper_corner_cap',(x,y,.265),(.13,.16,.03),'copper')


def check_deck():
    bpy.context.view_layer.update()
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH' and obj.name.startswith('Deck_'):
            points = [obj.matrix_world@v.co for v in obj.data.vertices]
            assert abs(max(p.z for p in points)-DECK_TOP) < 1e-7, obj.name+' raised deck'
