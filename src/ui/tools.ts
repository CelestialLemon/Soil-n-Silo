// The tool strip's tools: how they're grouped, what each is called, its icon, its key and the hint the readout pill shows
// while it's in hand.
import { CATALOG, isThingKind, type ThingKind } from '../game/index.ts';
import type { IconName } from './icons.ts';
import type { ToolId } from './types.ts';

export type GroupId = 'homestead' | 'power' | 'land' | 'yard';

export interface ToolDef {
  id: ToolId;
  label: string;
  icon: IconName;
  /**
   * Its key, as `KeyboardEvent.key` lower-cased (a digit by its key, whatever Shift makes of it: `keyOf`); `shift` when it's
   * taken with Shift.
   */
  key?: string; shift?: boolean;
  hint: string;
}

export interface GroupDef { id: GroupId; label: string; icon: IconName; tools: readonly ToolDef[] }

export const placeTool = (kind: ThingKind): ToolId => `place:${kind}` as const;

/** The thing a place tool puts down, or null for every other tool. */
export function placedKind(tool: ToolId): ThingKind | null {
  if (!tool.startsWith('place:')) return null;
  const kind = tool.slice('place:'.length);
  return isThingKind(kind) ? kind : null;
}

function place(kind: ThingKind, icon: IconName, key: string | undefined, hint: string, shift?: boolean): ToolDef {
  return { id: placeTool(kind), label: CATALOG[kind].label, icon, key, shift, hint };
}

const turn = 'R to turn';

export const SELECT_TOOL: ToolDef = {
  id: 'select', label: 'Select', icon: 'select', key: 'v',
  hint: 'Click a building to move, turn or remove it · drag to look around',
};

export const GROUPS: readonly GroupDef[] = [
  {
    id: 'homestead', label: 'Homestead', icon: 'homestead', tools: [
      place('farmhouse', 'farmhouse', '1', `Click a sunny, gentle clearing to settle your Farmhouse · free · ${turn}`),
      place('silo', 'silo', '2', `Click gentle ground to place the Silo · it stores the harvest · ${turn}`),
      place('garage', 'garage', '3', `Click gentle ground to place the Garage · it comes with an Electric Cart · ${turn}`),
      place('mill', 'mill', '4', `Click gentle ground to place the Mill · it grinds wheat into flour · ${turn}`),
      place('coop', 'coop', '5', `Click gentle ground to place the Coop · hens turn bran or wheat into eggs · ${turn}`),
      place('bakery', 'bakery', '6', `Click gentle ground to place the Bakery · flour and eggs make bread · ${turn}`),
      place('composter', 'composter', '7', `Click gentle ground to place the Composter · it feeds the fields' soil · ${turn}`),
      place('beehive', 'beehive', '8', 'Bees pollinate fields and make honey within 14 m'),
      place('rain_tank', 'rain_tank', '9', 'Store rain and water nearby fields within 10 m'),
      place('sprinkler', 'sprinkler', '0', 'Water uphill fields within 11 m · needs 1 W'),
    ],
  },
  {
    // Shift and a number: the plain numbers are the homestead's.
    id: 'power', label: 'Power', icon: 'power', tools: [
      place('solar', 'solar', '1', `Click to place a Solar Canopy · it may stand over a field · ${turn}`, true),
      place('turbine', 'turbine', '2', `Click to place a Wind Turbine · ridges catch more wind · ${turn}`, true),
      place('waterwheel', 'waterwheel', '3', `Click a brook bank · the wheel turns in the water, day and night · ${turn}`, true),
      place('battery', 'battery', '4', `Click to place a Battery · it carries the day's power into the night · ${turn}`, true),
      place('relay', 'relay', '5', 'Click to raise a Power Relay · free · it carries power 15 m around, no wires', true),
    ],
  },
  {
    id: 'land', label: 'Land', icon: 'land', tools: [
      { id: 'field:wheat', label: 'Wheat Field', icon: 'wheat', key: 'f', hint: 'Drag to paint wheat onto gentle ground' },
      { id: 'field:beans', label: 'Bean Field', icon: 'beans', key: 'b', hint: 'Drag to paint beans onto gentle ground' },
      { id: 'field:erase', label: 'Erase Field', icon: 'eraseField', key: 'x', hint: 'Drag over a field to wipe it back to meadow' },
      { id: 'channel:dig', label: 'Dig Channel', icon: 'dig', key: 'c', hint: 'Drag from the brook downhill · contours show on the grass' },
      { id: 'channel:fill', label: 'Fill Channel', icon: 'fill', key: 'c', shift: true, hint: 'Click or drag over a rill to fill it in' },
      { id: 'track:draw', label: 'Dirt Track', icon: 'track', key: 't', hint: 'Drag a curving track · bridges appear where it crosses water' },
      { id: 'hedge:draw', label: 'Hedgerow', icon: 'hedge', key: 'h', hint: 'Drag a hedgerow along a field edge or slope' },
      { id: 'tree:plant', label: 'Plant Tree', icon: 'tree', key: 'g', hint: 'Click to plant a sapling' },
      { id: 'erase:land', label: 'Clear', icon: 'clear', key: 'x', shift: true, hint: 'Click a track, hedgerow or planted tree to clear it' },
    ],
  },
  {
    id: 'yard', label: 'Yard', icon: 'yard', tools: [
      place('bench', 'bench', undefined, `Click to set down a Bench · ${turn}`),
      place('lantern', 'lantern', undefined, `Click to stand a Solar Lantern · it glows after dusk · ${turn}`),
      place('planter', 'planter', undefined, `Click to set down a Planter · ${turn}`),
      place('crates', 'crates', undefined, `Click to stack Crates · ${turn}`),
    ],
  },
];

const ALL: readonly ToolDef[] = [SELECT_TOOL, ...GROUPS.flatMap((g) => g.tools)];

export function toolDef(tool: ToolId): ToolDef | undefined {
  return ALL.find((t) => t.id === tool);
}

export function groupOf(tool: ToolId): GroupId | null {
  return GROUPS.find((g) => g.tools.some((t) => t.id === tool))?.id ?? null;
}

/** A key press as the tools name their keys: a digit key by its digit (Shift+1 reads "!" on most layouts), else its key. */
export function keyOf(e: KeyboardEvent): string {
  const digit = /^(?:Digit|Numpad)(\d)$/.exec(e.code)?.[1];
  return digit ?? e.key.toLowerCase();
}

/** The tool a key press picks. */
export function toolForKey(key: string, shift: boolean): ToolDef | undefined {
  return ALL.find((t) => t.key === key && (t.shift ?? false) === shift);
}

/** How a tool's key reads on its badge. */
export function keyLabel(t: ToolDef): string {
  if (t.key === undefined) return '';
  return `${t.shift ? '⇧' : ''}${t.key.toUpperCase()}`;
}
