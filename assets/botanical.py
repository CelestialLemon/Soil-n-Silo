"""Bold faceted flowers, built entirely from the established shared palette."""
from solarpunk import *


def flower(name, centre, radius, colour, petals=6, normal=(0,0,1), core='gold'):
    centre, normal = Vector(centre), Vector(normal).normalized()
    tangent = normal.cross(Vector((0,1,0)) if abs(normal.y)<.9 else Vector((0,0,1))).normalized()
    other = normal.cross(tangent)
    parts=[]
    for i in range(petals):
        direction = tangent*math.cos(i*math.tau/petals)+other*math.sin(i*math.tau/petals)
        petal=sphere(name+'_petal',centre+direction*radius*.63,
                     (radius*.50,radius*.34,radius*.20),colour,6,3)
        # Local X follows the radial direction; local Z is the flower's normal.
        petal.rotation_euler = Matrix((direction,normal.cross(direction),normal)).transposed().to_euler()
        parts.append(petal)
    disc=cylinder(name+'_seed_disc',centre+normal*radius*.18,radius*.43,radius*.28,core,10)
    disc.rotation_euler=normal.to_track_quat('Z','Y').to_euler()
    parts.append(disc)
    return join(parts,name,centre)
