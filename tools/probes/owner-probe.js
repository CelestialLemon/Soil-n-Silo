/* global window, console, performance, navigator, requestAnimationFrame, cancelAnimationFrame, setTimeout, innerWidth, innerHeight, devicePixelRatio */
// Soil-n-Silo performance probe (issue #176). Paste into the browser console with a game open (any build: window.game is
// always there). It changes nothing saved: each variant is swapped in and out in memory, alternating, ~40 s in all.
// Keep the window in front, the pointer still and off the window (the probe picks by itself in the pick variants),
// and note the power state (plugged in / battery / low-power mode). Copy the JSON it prints at the end.
(async () => {
const g = window.game, R = g.renderer, r = R.renderer, gl = r.getContext();
// Variants: the resolve shader as shipped, and the same algorithm unrolled with constant indices (no dynamically indexed arrays).
const ORD = [[1,1],[0,1],[2,1],[1,0],[1,2],[0,0],[2,0],[0,2],[2,2]], N = 9, K = [...Array(N).keys()];
const pre = (i, fast) => fast ? `(n${i}.w - (r${i} * OX.x + u${i} * OX.y) * k${i})` : `(n${i}.w - (r${i} * OX.x + u${i} * OX.y) * uTexel / nf${i})`;
const pd = (i, o, fast) => pre(i, fast).replaceAll('OX', `(${o})`);
function gen(fast) {
  let s = `
precision highp float; precision highp int;
uniform sampler2D tAlbedo; uniform sampler2D tNormal; uniform sampler2D tShadow; uniform sampler2D tObjectId;
uniform int uS; uniform int uPolicy; uniform float uTexel; uniform int uThinOnly;
uniform vec3 uRight; uniform vec3 uUp; uniform vec3 uFwd;
layout(location = 0) out vec4 oAlbedo; layout(location = 1) out vec4 oNormal; layout(location = 2) out vec4 oShadow;
vec2 signNZ(vec2 v){ return mix(vec2(-1.0), vec2(1.0), step(vec2(0.0), v)); }
vec3 surfaceNormal(vec3 shading, vec2 encoded){
  if (encoded.x == 0.0) return shading;
  vec2 e = encoded - 2.0;
  vec3 n = vec3(e, 1.0 - abs(e.x) - abs(e.y));
  if (n.z < 0.0) n.xy = (1.0 - abs(n.yx)) * signNZ(n.xy);
  return normalize(n);
}
void main(){
  ivec2 p = ivec2(gl_FragCoord.xy);
  if (uS == 1) {
    oAlbedo = texelFetch(tAlbedo, p, 0); oNormal = texelFetch(tNormal, p, 0);
    oShadow = vec4(texelFetch(tObjectId, p, 0).rgb, texelFetch(tShadow, p, 0).a);
    return;
  }
  ivec2 base = p * 3;
  float eps = 0.004 + 0.1 * uTexel, margin = max(0.10, uTexel * 3.0);
`;
  for (const i of K) {
    const q = `base + ivec2(${ORD[i][0]}, ${ORD[i][1]})`;
    s += `  vec4 a${i} = texelFetch(tAlbedo, ${q}, 0); vec4 n${i} = texelFetch(tNormal, ${q}, 0);
  vec3 f${i} = surfaceNormal(n${i}.xyz, texelFetch(tObjectId, ${q}, 0).gb);
  bool s${i} = a${i}.a < 0.5; float d${i} = s${i} ? 1e9 : n${i}.w; vec2 o${i} = (vec2(ivec2(${ORD[i][0]}, ${ORD[i][1]})) - 1.0) / 3.0;
  float r${i} = dot(f${i}, uRight), u${i} = dot(f${i}, uUp), nf${i} = dot(f${i}, uFwd); nf${i} = (nf${i} < 0.0 ? -1.0 : 1.0) * max(abs(nf${i}), 1e-3);${fast ? ` float k${i} = uTexel / nf${i};` : ''}
`;
  }
  for (const i of K) for (const j of K) if (i < j) s += `  bool c${i}_${j} = (s${i} || s${j}) ? (s${i} && s${j}) : !(abs(a${i}.a - a${j}.a) > 0.5 || any(greaterThan(abs(a${i}.rgb - a${j}.rgb), vec3(1e-4))));\n`;
  const c = (i, j) => `c${Math.min(i, j)}_${Math.max(i, j)}`;
  for (const i of K) {
    s += `  int cnt${i} = 1, rep${i} = ${i}; float nr${i} = d${i};\n`;
    for (const j of K) if (j !== i) s += `  if (${c(i, j)} && (s${i} || abs(n${j}.w - ${pd(i, `o${j} - o${i}`, fast)}) < eps)) { cnt${i}++; nr${i} = min(nr${i}, d${j});${j < i ? ` rep${i} = min(rep${i}, ${j});` : ''} }\n`;
  }
  s += `  int best = 0, bc = cnt0; float bn = nr0;\n`;
  for (const i of K.slice(1)) s += `  if (cnt${i} > bc || (cnt${i} == bc && nr${i} < bn - 1e-4)) { best = ${i}; bc = cnt${i}; bn = nr${i}; }\n`;
  s += `  int m = rep0;${K.slice(1).map((i) => ` if (best == ${i}) m = rep${i};`).join('')}\n`;
  s += `  if (uPolicy >= 1) {
    vec2 mo = o0; float mw = n0.w, mr = r0, mu = u0, mnf = nf0, md = d0; bool ms = s0;${fast ? ' float mk = k0;' : ''}
`;
  for (const i of K.slice(1)) s += `    if (m == ${i}) { mo = o${i}; mw = n${i}.w; mr = r${i}; mu = u${i}; mnf = nf${i}; md = d${i}; ms = s${i};${fast ? ` mk = k${i};` : ''} }\n`;
  s += `    int fg = best; float fgD = md;\n`;
  for (const i of K) s += `    if (!(cnt${i} < uPolicy + 1 || rep${i} != ${i}) && !(uThinOnly == 1 && fract(a${i}.a) < 0.1)) { vec2 o = o${i} - mo; float behind = ms ? 1e9 : ${fast ? 'mw - (mr * o.x + mu * o.y) * mk' : 'mw - (mr * o.x + mu * o.y) * uTexel / mnf'}; if (d${i} < behind - margin && d${i} < fgD) { fg = ${i}; fgD = d${i}; } }\n`;
  s += `    if (fg != best) m = fg;\n  }\n`;
  // emit sample m
  s += `  vec4 wa = a0, wn = n0; vec2 wo = o0; float wr = r0, wu = u0, wnf = nf0; ivec2 wq = ivec2(${ORD[0]});\n`;
  for (const i of K.slice(1)) s += `  if (m == ${i}) { wa = a${i}; wn = n${i}; wo = o${i}; wr = r${i}; wu = u${i}; wnf = nf${i}; wq = ivec2(${ORD[i]}); }\n`;
  s += `  float mm = 2.0 * margin;
  float dc = clamp(wn.w - (wr * (-wo).x + wu * (-wo).y) * uTexel / wnf, wn.w - mm, wn.w + mm);
  oAlbedo = wa;
  oNormal = vec4(wn.xyz, wa.a < 0.5 ? wn.w : dc);
  ivec2 q = base + wq;
  oShadow = vec4(texelFetch(tObjectId, q, 0).rgb, texelFetch(tShadow, q, 0).a);
}`;
  return s;
}
const orig = R.resolveMat, M = orig.constructor;
const mk = (fs) => { const m = new M({ vertexShader: orig.vertexShader, fragmentShader: fs, uniforms: orig.uniforms, glslVersion: orig.glslVersion, depthTest: orig.depthTest, depthWrite: orig.depthWrite, blending: orig.blending, toneMapped: orig.toneMapped }); return m; };
const unrolled = mk(gen(false));
const oPose = R.poseObjects, oPick = R.pick, oG = R.renderGeometry;
const hideAfter = function () { oPose.call(this); for (const b of this.batches.values()) { for (const x of b.meshes) x.visible = x.count > 0; for (const x of b.glassMeshes) x.visible = x.count > 0; } };
const showAll = () => { for (const b of R.batches.values()) for (const x of [...b.meshes, ...b.glassMeshes]) x.visible = true; };
let picking = false; const pickEvery = (on) => { picking = on; };
const V = {
  base: { on() {}, off() {} },
  hideEmpty: { on() { R.poseObjects = hideAfter; }, off() { R.poseObjects = oPose; showAll(); } },
  resolve: { on() { R.resolveMat = unrolled; }, off() { R.resolveMat = orig; } },
  both: { on() { R.poseObjects = hideAfter; R.resolveMat = unrolled; }, off() { R.poseObjects = oPose; showAll(); R.resolveMat = orig; } },
  pickEveryFrame: { on() { pickEvery(true); }, off() { pickEvery(false); } },
  bothPickEveryFrame: { on() { R.poseObjects = hideAfter; R.resolveMat = unrolled; pickEvery(true); }, off() { R.poseObjects = oPose; showAll(); R.resolveMat = orig; pickEvery(false); } },
};
// Frame times from requestAnimationFrame, the CPU time of each frame's callbacks, and the GPU time of each pass where the
// browser has timer queries (Chrome on Windows and macOS usually; Safari never).
const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
const tmap = new Map(); for (const k of Object.keys(R)) { const v = R[k]; if (v && v.isWebGLRenderTarget) tmap.set(v, k); }
let active = null, cur = null; const pending = [];
const S = Object.fromEntries(Object.keys(V).map((n) => [n, { dts: [], work: [], gpu: {}, frames: 0 }]));
const begin = (k) => { if (!ext || !active) return; const q = gl.createQuery(); gl.beginQuery(ext.TIME_ELAPSED_EXT, q); cur = [q, k, active]; };
const end = () => { if (cur) { gl.endQuery(ext.TIME_ELAPSED_EXT); pending.push(cur); cur = null; } };
const oRender = r.render.bind(r);
r.render = (s, c) => { const t = r.getRenderTarget(); begin(t ? tmap.get(t) || 'other' : 'canvas'); const x = oRender(s, c); end(); return x; };
const poll = () => { while (pending.length) { const [q, k, v] = pending[0]; if (!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) break; if (!gl.getParameter(ext.GPU_DISJOINT_EXT)) S[v].gpu[k] = (S[v].gpu[k] || 0) + gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6; gl.deleteQuery(q); pending.shift(); } };
let last = 0, workStart = 0;
const tick = (t) => { if (active && last) { S[active].dts.push(t - last); S[active].frames++; } last = t; raf = requestAnimationFrame(tick); };
let raf = requestAnimationFrame(tick);
const sleep = (ms) => new Promise((f) => setTimeout(f, ms));
// The renderer's CPU time per frame: renderGeometry (with the probe's pick before it, in the pick variants) and renderStyle.
const oStyle = R.renderStyle;
R.renderGeometry = function (t) { workStart = performance.now(); if (picking) oPick.call(R, innerWidth / 2, innerHeight / 2); return oG.call(this, t); };
R.renderStyle = function (...a) { const x = oStyle.apply(this, a); if (active) S[active].work.push(performance.now() - workStart); return x; };
console.log('probe: art', R.width, 'x', R.height, 'timer queries', !!ext, 'GPU', (gl.getExtension('WEBGL_debug_renderer_info') && gl.getParameter(0x9246)) || '?');
await sleep(1000);
for (let round = 0; round < 4; round++) for (const n of Object.keys(V)) {
  V[n].on(); active = null; await sleep(300); last = 0; active = n; await sleep(1200); active = null; V[n].off();
  for (let i = 0; i < 10 && ext && pending.length; i++) { await sleep(20); poll(); }
}
cancelAnimationFrame(raf); r.render = oRender; R.renderStyle = oStyle; R.renderGeometry = oG;
const q = (a, f) => { const s = a.slice().sort((x, y) => x - y); return s.length ? +s[Math.min(s.length - 1, Math.floor(s.length * f))].toFixed(2) : null; };
const mean = (a) => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : null;
const out = { ua: navigator.userAgent, gpu: (gl.getExtension('WEBGL_debug_renderer_info') && gl.getParameter(0x9246)) || null, art: [R.width, R.height], css: [innerWidth, innerHeight], dpr: devicePixelRatio, timerQueries: !!ext, variants: {} };
for (const [n, s] of Object.entries(S)) out.variants[n] = { frames: s.frames, meanMs: mean(s.dts), p50: q(s.dts, 0.5), p90: q(s.dts, 0.9), p99: q(s.dts, 0.99), workMs: q(s.work, 0.5), gpuMs: ext ? Object.fromEntries(Object.entries(s.gpu).map(([k, v]) => [k, +(v / s.frames).toFixed(2)])) : null };
console.table(Object.fromEntries(Object.entries(out.variants).map(([n, v]) => [n, { meanMs: v.meanMs, p90: v.p90, p99: v.p99, workMs: v.workMs, gpuMs: v.gpuMs ? +Object.values(v.gpuMs).reduce((a, b) => a + b, 0).toFixed(2) : null }])));
console.log(JSON.stringify(out));
window.__probe176 = out;
})();

