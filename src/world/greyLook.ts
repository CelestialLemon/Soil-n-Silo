import * as THREE from 'three';
import type { Look } from 'pixel3d-renderer';
import type { Weather } from '../game/sim/weather.ts';

// A grey day: cloud and rain take the sun's strength, wash out the colours and tint, and pull the sky down to a flat grey.
// The weather glides between spells (sim/weather.ts), so blending the hour's look by it is smooth too.

/** What full cloud takes off the sun, the world's brightness and its colour; rain takes more of each, and of the sky's colour. */
const SUN = 0.6, EXPOSURE = 0.12, CHROMA = 0.4, TINT = 0.7;
const RAIN_SUN = 0.2, RAIN_EXPOSURE = 0.08, RAIN_CHROMA = 0.3;
/** How far the sky is pulled to its own grey by cloud and by rain, and how much darker it goes. */
const SKY_GREY = 0.65, RAIN_SKY_GREY = 0.3, SKY_DARK = 0.12;

/** A colour pulled `t` of the way to the grey of its own lightness, and darkened by `dark`. */
function greyed(c: THREE.Color, t: number, dark: number) {
  const grey = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return new THREE.Color(c.r + (grey - c.r) * t, c.g + (grey - c.g) * t, c.b + (grey - c.b) * t).multiplyScalar(1 - dark);
}

/** `look` on a day with this `weather`: cloudier and rainier is dimmer, greyer and flatter. Clear sky leaves it as it is. */
export function greyLook(look: Look, { cloud, precip }: Pick<Weather, 'cloud' | 'precip'>): Look {
  if (cloud <= 0 && precip <= 0) return look;
  const c = Math.min(1, cloud), p = Math.min(1, precip);
  const sun = 1 - SUN * c - RAIN_SUN * p, exp = 1 - EXPOSURE * c - RAIN_EXPOSURE * p, chroma = 1 - CHROMA * c - RAIN_CHROMA * p, tint = 1 - TINT * c;
  const sky = Math.min(1, SKY_GREY * c + RAIN_SKY_GREY * p);
  return {
    ...look,
    sunI: look.sunI * sun,
    // The shadow bands carry more of the light on a grey day: the sun is soft, so the ambient fills what it no longer lights.
    ambient: look.ambient * (1 + 0.25 * c),
    expo: look.expo * exp,
    chroma: look.chroma * chroma,
    litTint: [look.litTint[0] * tint, look.litTint[1] * tint],
    shadeTint: [look.shadeTint[0] * tint, look.shadeTint[1] * tint],
    skyTop: greyed(look.skyTop, sky, SKY_DARK * c),
    skyBot: greyed(look.skyBot, sky, SKY_DARK * c * 0.5),
  };
}

/** The drawn fall for a precipitation of 0–1: none below a trace, else light to moderate (renderer 0.15 to 0.5), leaving the heavy end (up to 1) for storms and blizzards. */
export function fallIntensity(precip: number) {
  return precip < 0.02 ? 0 : 0.15 + 0.35 * Math.min(1, precip);
}
