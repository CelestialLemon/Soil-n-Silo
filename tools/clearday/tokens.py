# Compiles the design tokens (src/ui/clearday/tokens.json) into CSS custom properties (colours, shadows, sizes, type):
#
#   python3 tools/clearday/tokens.py src/ui/clearday/tokens.json Clearday src/ui/clearday/tokens.css
import json, re, sys
d = json.load(open(sys.argv[1])); title = sys.argv[2]
def v(x): return re.sub(r'^\{(.+)\}$', r'var(--\1)', x)
themes = [t['id'] for t in d['color']['themes']]
out = [f'/* {title} — generated from tokens.json */']
def block(sel, th):
    lines = []
    for t in d['color']['tokens']:
        val = t['value'] if isinstance(t['value'], str) else t['value'].get(th, t['value'].get(themes[0]))
        if th != themes[0] and (isinstance(t['value'], str) or th not in t['value']): continue
        lines.append(f'  --{t["name"]}: {v(val)};')
    for t in d.get('shadow', {}).get('tokens', []):
        val = t['value'] if isinstance(t['value'], str) else t['value'].get(th, t['value'].get(themes[0]))
        if th != themes[0] and (isinstance(t['value'], str) or th not in t['value']): continue
        lines.append(f'  --{t["name"]}: {val};')
    out.append(f'{sel} {{\n' + '\n'.join(lines) + '\n}')
block(f':root, [data-theme="{themes[0]}"]', themes[0])
for th in themes[1:]: block(f'[data-theme="{th}"]', th)
rest = []
for fam, body in d.items():
    if fam in ('name', 'version', 'color', 'type', 'shadow', 'meta'): continue
    for t in body['tokens']: rest.append(f'  --{t["name"]}: {t["value"]};')
for k, s in d['type']['families'].items(): rest.append(f'  --font-{k}: {s};')
out.append(':root {\n' + '\n'.join(rest) + '\n}')
def px(x): return f'{x}px' if isinstance(x, (int, float)) and not isinstance(x, bool) else x
# Type styles become variables, not classes, so the cd- classes in clearday.css read them and nothing generic leaks out:
# --type-<name> is the font shorthand, and -size, -line, -weight and -tracking are its parts.
type_vars = []
for g in d['type']['groups']:
    for s in g['styles']:
        n, fam = s['name'], s.get('family', g['family'])
        size, line, weight = px(s['fontSize']), s.get('lineHeight', 'normal'), s.get('fontWeight', 400)
        type_vars += [f'  --type-{n}: {weight} {size}/{line} var(--font-{fam});', f'  --type-{n}-size: {size};',
                      f'  --type-{n}-line: {line};', f'  --type-{n}-weight: {weight};',
                      f'  --type-{n}-tracking: {s.get("letterSpacing", "normal")};']
out.append(':root {\n' + '\n'.join(type_vars) + '\n}')
open(sys.argv[3], 'w').write('\n'.join(out) + '\n')
