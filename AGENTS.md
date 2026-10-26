# Working in this repo

- The design is `docs/DESIGN.md`; the plan is `docs/ROADMAP.md`; the models are specified in `docs/ASSET_BRIEF.md`.
- The renderer is `pixel3d-renderer`, a separate repo (local checkout at `../pixel3d-renderer`), pinned to a release tag. Don't
  patch it from here (not in `node_modules`, not by copying code). A renderer gap or bug becomes an issue there; see
  **Renderer issues** below.
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

## Renderer issues

When the game needs something the renderer doesn't do, or hits a renderer bug:

1. Check the renderer's open issues and `docs/ROADMAP.md` there first; it may already be known or planned.
2. Make sure it is really the renderer's job (the renderer draws; the game owns state, input, UI and timing, see the renderer's
   roadmap, "Who owns what").
3. Open the issue in `CelestialLemon/pixel3d-renderer` with the `soil-n-silo` label and the `bug` or `enhancement` label: what the
   game needs, a minimal repro or screenshot, and the renderer version the game pins. If game work is blocked on it, link it
   from a game issue labelled `renderer`.
4. No game-side workaround: the game waits for the fix.
5. The fix ships in a new renderer release tag; small fixes are patch bumps (0.5.0 -> 0.5.1), because the second number is a
   major jump. Bumping the game's pin is its own small change here (re-approve the install script, see `README.md`).
