# Working in this repo

- The design is `docs/DESIGN.md`; the plan is `docs/ROADMAP.md`; the models are specified in `docs/ASSET_BRIEF.md`.
- Two renderers, until the swap (epic #212): the game draws with `pixel3d-renderer`, a separate repo pinned to a release tag
  (see **pixel3d-renderer** below), and is moving to **brush3d**, the painterly renderer, which lives in this repo, in
  `brush3d/`. Renderer work is done here, in `brush3d/`; see **The renderer (brush3d)** below.
- Game rules live in `src/game/` as pure TypeScript (no DOM, no three.js, no renderer), so `npm test` runs them in Node. Drawing
  and input live outside it.
- Expected failures (an action against the rules, a broken save or settings) return a `Result` (`src/game/result.ts`) rather
  than throwing; throw only for a programmer's bug or a broken invariant.
- No legacy compatibility: the developer is the game's only player. Don't write save or settings migrations or keep legacy
  keys and fallbacks; bump the save version and refuse old saves instead, and delete legacy paths when you find them.
  Revisit if the game is shared with other players.
- **Clean the working tree.** Remove the scratch files, probes and debug renders you created for this work, so the PR holds
   only the changes the work needs. Never delete or revert changes you didn't make (the user may have uncommitted work in the
   tree), and don't run `git checkout`/`reset`/`clean`/`stash` on them.

## Working with the developer
- The developer is a game designer with some technical experience, not a graphics engineer. Explain rendering problems in
  plain language (what it looks like on screen, with an analogy), not shader jargon.
- Keep it collaborative. Where engineering judgement is needed, give a recommendation and say why; when told "your call",
  decide. Art choices are the developer's: render a few options side by side (stills and videos) for them to pick.
- Record decisions where every agent can read them: issues, PRs, `docs/` and code comments. Never only in one agent's
  private memory, which other sessions and agents can't see.

## Working on an issue
- The developer takes one issue at a time, each in its own thread, and stays in the loop: ask questions at any point, and show
  alternatives before settling.
- Before building, read the issue, its epic (if any) and `docs/ROADMAP.md` (for renderer work, also `brush3d/docs/ROADMAP.md`
  and `brush3d/docs/DIRECTION.md`), and ask about anything unclear.
- An issue can take more than one PR: land the groundwork first and the look second, rather than one PR that's hard to review.
- Every PR from this repo (not from a fork) gets a live preview: the game at
  `https://celestiallemon.github.io/Soil-n-Silo/pr-<number>/` and the renderer's demo at `.../pr-<number>/brush3d/` (linked in a
  comment on it, removed when it closes; `.github/workflows/pages.yml`). For a look choice, build the candidates behind a button
  in the controls (the game's, or the demo's) and a URL option (say `?overcast=a`), so the developer can flip between them on
  the preview in any map or scene, hour and weather. Remove the ones not picked before the PR merges.
- Record each decision in the issue or PR, and update later issues it changes, so the next thread starts with the right picture.
- When an issue is done, update `docs/ROADMAP.md` (and `brush3d/docs/ROADMAP.md` for renderer work). Merge only once the
  developer has approved.

## Workflow
- Before creating a PR always run review-with-sol loops unless asked otherwise.
- Always use the pr skill when creating a PR and babysit a PR unless asked otherwise.
- T3 kills everything a session started from its shell shortly after each turn. Run the dev server as its own service
  (`systemd-run --user --unit=<name> --collect --same-dir --setenv=PATH="$PATH" -- npx vite --port <port> --strictPort`),
  and finish long jobs (renders, videos) within the turn. The dev server serves the game at `/` and the renderer's demo at
  `/brush3d/`; on a port of your own, point the renderer's tools at it with `DEMO_URL=http://127.0.0.1:<port>/brush3d`.

## The renderer (brush3d)
- It lives in `brush3d/`: its code (`brush3d/src/`), the demo (`brush3d/index.html`, `brush3d/src/demo/`: the farm valley,
  meadow, water patch and model gallery scenes, a test bench where a look can be tried in any weather), its tools
  (`brush3d/tools/`), the models' Blender scripts (`brush3d/tools/blender/`) and its docs (`brush3d/docs/`: `DIRECTION.md` the
  look's rules, `API.md`, `ROADMAP.md`, and the notes on models, performance, wind, water and ground). `brush3d/README.md` has
  how it draws and its layout. One `package.json` for both: the renderer's scripts are `render:*` (`render:shot`, `render:video`,
  `render:motion`, `render:pops`, `render:profile`, `render:flash`, `render:test:clouds`, `render:test:wind`,
  `render:test:water`, `render:test:view`, `render:build:wind`); `npm test`, `npm run typecheck`, lint and the build cover it.
- The renderer only draws. The game owns the state and the rules (weather, ground, water, wind, lightning, and anything they
  cause); the renderer draws what it's given.
- The game (and the demo) use it only through `brush3d/src/index.ts`, and the game's rules and tests through
  `brush3d/src/shared.ts` (loads in Node), both written up in `brush3d/docs/API.md`. `npm run typecheck` fails if the demo
  imports anything else. A change to the API updates `API.md`.
- A gap or bug in brush3d is an issue here, labelled `renderer`, fixed in `brush3d/`; the game and the renderer change
  together in one PR when they must. No game-side workaround for a renderer problem: fix the renderer.
- Judge renderer changes with its tools (`brush3d/README.md`): frames you didn't mean to change stay byte-identical
  (`npm run render:shot` before and after), no new shimmer (`render:motion`) or swatch pops (`render:pops`) under camera moves
  and wind, the frame's cost on the GPU pass by pass (`render:profile`, `brush3d/docs/PERFORMANCE.md`), the lightning within
  the flash limits (`render:flash`). Drop a demo scene once the game's own maps cover what it's used for.
- Issue numbers in `brush3d/`: a bare `#1` to `#68` there is one of brush3d-renderer's, the archived repo it came from
  (`#36` is CelestialLemon/brush3d-renderer#36); `#199` and up are this repo's. When you write about an old one, name it in
  full (`brush3d-renderer#36`).

## pixel3d-renderer

The renderer the game draws with until the swap (#211), when it goes for good. Until then the pixel path only has to keep
working, not gain features.

- It is a separate repo (local checkout at `../pixel3d-renderer`), pinned to a release tag. Don't patch it from here (not in
  `node_modules`, not by copying code).
- A pixel3d bug that breaks the game becomes an issue there: check its open issues and its `docs/ROADMAP.md` first, then open
  one in `CelestialLemon/pixel3d-renderer` with the `soil-n-silo` and `bug` labels (what the game needs, a minimal repro or
  screenshot, the version the game pins), linked from a game issue labelled `renderer` if game work is blocked on it. The fix
  ships in a new patch tag (0.5.0 -> 0.5.1: the second number is a major jump); bumping the game's pin is its own small change
  here (re-approve the install script, see `README.md`).
