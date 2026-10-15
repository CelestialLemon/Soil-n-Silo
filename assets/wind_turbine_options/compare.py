"""Assemble the three Blender front-right renders, left to right, at native size.

Run after building each candidate, with Blender --background --python.
"""
from pathlib import Path
import bpy

ASSETS = Path(__file__).resolve().parents[1]
NAMES = ['petal', 'prairie', 'zephyr']
SIZE = 640
pixels = [0.0]*(len(NAMES)*SIZE*SIZE*4)
for column, name in enumerate(NAMES):
    source = bpy.data.images.load(str(ASSETS/f'wind_turbine_{name}'/'front-right.png'), check_existing=False)
    assert tuple(source.size) == (SIZE, SIZE), f'Unexpected render size: {name}'
    data = list(source.pixels)
    for row in range(SIZE):
        start = (row*SIZE*len(NAMES)+column*SIZE)*4
        pixels[start:start+SIZE*4] = data[row*SIZE*4:(row+1)*SIZE*4]
    bpy.data.images.remove(source)
sheet = bpy.data.images.new('Petal / Prairie / Zephyr', width=SIZE*len(NAMES), height=SIZE)
sheet.pixels.foreach_set(pixels)
sheet.filepath_raw = str(Path(__file__).resolve().parent/'comparison.png')
sheet.file_format = 'PNG'
sheet.save()
