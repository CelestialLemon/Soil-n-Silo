# Review agents

The user explicitly requests that agents create the independent reviewer sub-agents required by
`docs/BOARD.md` when the work is ready for review. This is standing authorization: do not ask the
user for separate approval or confirmation to create those reviewers. Follow the board's required
reviewer models, scope and context restrictions.

# Working in this repo

- Read `docs/BOARD.md` before starting any piece of work and follow its workflow. The design is `docs/DESIGN.md`; the plan is
  `docs/ROADMAP.md`.
- The renderer is `pixel3d-renderer`, a separate repo (local checkout at `../pixel3d-renderer`), pinned to a release tag. Don't
  patch it from here (not in `node_modules`, not by copying code). A renderer gap or bug becomes an issue there; see
  `docs/BOARD.md`, "Renderer issues".
- Game rules live in `src/game/` as pure TypeScript (no DOM, no three.js, no renderer), so `npm test` runs them in Node. Drawing
  and input live outside it.
