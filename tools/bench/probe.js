/* global window, performance, navigator, setTimeout */
// The benchmark's side of the page (tools/bench.ts injects this before the game loads). It wraps the game's frame and the
// renderer's entry points to count, per frame, what three.js is asked to do and how long the JS and (where the browser
// has timer queries) the GPU take. Plain JavaScript: it runs in the page, outside the Node typecheck. It only observes; the
// game and the renderer are not changed.

(() => {
  const frames = [];
  let current = null;
  let recording = false;
  let hooked = null;
  let prevStamp = null;
  const pending = [];
  const MAX_PENDING = 8;

  // Every animation-frame callback is timed; the one that draws (calls renderGeometry) is the game's frame.
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((stamp) => {
    const start = performance.now();
    current = { stamp, geometry: 0, style: 0, visits: 0, shadowRedraws: 0, passes: 0, picks: 0, pickMs: 0, drawn: false };
    if (hooked) { hooked.info.reset(); pollQueries(); }
    try { cb(stamp); } finally {
      const frame = current;
      current = null;
      if (frame.drawn && recording) {
        frame.callback = performance.now() - start;
        frame.interval = prevStamp === null ? null : stamp - prevStamp;
        frame.draws = hooked.info.render.calls;
        frame.triangles = hooked.info.render.triangles;
        frames.push(frame);
      }
      if (frame.drawn) prevStamp = stamp;
    }
  });

  function pollQueries() {
    const { gl, ext } = hooked;
    if (!ext) return;
    while (pending.length && gl.getQueryParameter(pending[0].query, gl.QUERY_RESULT_AVAILABLE)) {
      const p = pending.shift();
      const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);
      if (!disjoint) p.frame[p.part] = gl.getQueryParameter(p.query, gl.QUERY_RESULT) / 1e6;
      gl.deleteQuery(p.query);
    }
  }

  /** Runs `fn` between a timer query's begin and end when one can be started; its result lands on the frame later. */
  function timed(part, fn) {
    const { gl, ext } = hooked;
    if (!ext || pending.length >= MAX_PENDING || !current) return fn();
    const query = gl.createQuery();
    gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
    try { return fn(); } finally {
      gl.endQuery(ext.TIME_ELAPSED_EXT);
      pending.push({ query, part, frame: current });
    }
  }

  function hook(game) {
    const px = game.renderer, three = px.renderer;
    const gl = three.getContext();
    const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    three.info.autoReset = false;
    hooked = { px, three, gl, ext, info: three.info };

    const direct = three.renderBufferDirect;
    three.renderBufferDirect = function (...a) { if (current) current.visits++; return direct.apply(this, a); };
    const render = three.render;
    three.render = function (...a) { if (current) current.passes++; return render.apply(this, a); };
    const shadows = three.shadowMap.render;
    // three calls this on every render() and the map itself returns early unless it is due a redraw (the renderer sets needsUpdate).
    three.shadowMap.render = function (...a) { if (current && (this.autoUpdate || this.needsUpdate)) current.shadowRedraws++; return shadows.apply(this, a); };

    const geometry = px.renderGeometry;
    px.renderGeometry = function (...a) {
      if (!current) return geometry.apply(this, a);
      current.drawn = true;
      const t = performance.now();
      try { return timed('gpuGeometry', () => geometry.apply(this, a)); } finally { current.geometry = performance.now() - t; }
    };
    const style = px.renderStyle;
    px.renderStyle = function (...a) {
      if (!current) return style.apply(this, a);
      const t = performance.now();
      try { return timed('gpuStyle', () => style.apply(this, a)); } finally { current.style = performance.now() - t; }
    };
    // A pick waits for the GPU; a requested one costs its request here, and its delivery inside the next renderGeometry or renderStyle.
    for (const name of ['pick', 'requestPick']) {
      const f = px[name];
      px[name] = function (...a) {
        const t = performance.now();
        try { return f.apply(this, a); } finally { if (current) { current.picks++; current.pickMs += performance.now() - t; } }
      };
    }
  }

  window.__bench = {
    ready: () => !!window.game?.renderer,
    install: () => { if (!hooked) hook(window.game); },
    count: () => frames.length,
    start: () => { frames.length = 0; recording = true; },
    /** The frames since `start`, once their timer queries have come back (or a second has passed). */
    stop: async () => {
      recording = false;
      const until = performance.now() + 1000;
      while (pending.length && performance.now() < until) await new Promise((r) => setTimeout(r, 20));
      return frames.splice(0);
    },
    /** What ran: the GPU and browser, the window and the renderer's sizes. */
    env: () => {
      const { px, gl, ext } = hooked;
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        glRenderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        glVendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
        userAgent: navigator.userAgent, timerQueries: !!ext,
        viewport: [window.innerWidth, window.innerHeight], devicePixelRatio: window.devicePixelRatio,
        art: [px.width, px.height], supersample: px.supersample, shadowMapSize: px.shadowMapSize,
      };
    },
  };
})();
