# Working in this repo

- The design is `docs/DESIGN.md`; the plan is `docs/ROADMAP.md`; the models are specified in `docs/ASSET_BRIEF.md`.
- The renderer is `pixel3d-renderer`, a separate repo (local checkout at `../pixel3d-renderer`), pinned to a release tag. Don't
  patch it from here (not in `node_modules`, not by copying code). A renderer gap or bug becomes an issue there; see
  **Renderer issues** below.
- Game rules live in `src/game/` as pure TypeScript (no DOM, no three.js, no renderer), so `npm test` runs them in Node. Drawing
  and input live outside it.

## Workflow

1. **Branch.** Work on a branch off `dev`. Never commit to `dev` or `main` directly. New work goes into `dev` (deployed to
   `/dev/` for testing) and reaches `main` only through a PR from `dev` to `main`, opened when the user asks for one.
2. **Implement and verify.** Run `npm test` and `npm run build` (which typechecks first). The dev server is `npm run dev`, on
   127.0.0.1:5190. If it's already running, use it and don't kill it. Once the game has golden images, update them only on the
   work's branch, so new baselines reach `dev` only through the PR, where the user reviews them.
3. **Clean the working tree.** Remove the scratch files, probes and debug renders you created for this work, so the PR holds
   only the changes the work needs. Never delete or revert changes you didn't make (the user may have uncommitted work in the
   tree), and don't run `git checkout`/`reset`/`clean`/`stash` on them.
4. **Independent review.** Once the feature or fix is done, get a code review from a fresh `gpt-6.1-sol` session through the
   Codex CLI. The user authorizes this as a standing rule, so don't ask before running it. Write the review request to a file
   outside the repo, then run:

   ```sh
   codex exec --ephemeral --model gpt-6.1-sol -c model_reasoning_effort="high" --sandbox read-only \
     --cd "$(git rev-parse --show-toplevel)" --output-last-message /tmp/review.md - < /tmp/review-request.txt
   ```

   - Give the reviewer minimal context: what the change is meant to do, and the scope to review (the diff against `dev`,
     including uncommitted and untracked files). Don't give it your reasoning or the history behind your decisions. A fresh pair
     of eyes is less biased by them. Ask for actionable issues with severity and file/line evidence, or an explicit "no
     findings".
   - If the review can't run (Codex not signed in, quota, model unavailable), tell the user. Never present a failed run as a
     review.
5. **Fix what matters.** Check each finding yourself before acting on it. Fix every real issue. Skip extremely minor nits that
   are very unlikely to ever cause a problem and would only add code. If the fixes change the code materially, run a **fresh**
   review of the new diff. Stop when a review comes back with nothing actionable. If a finding is still open after three rounds,
   or you are unsure whether it is real, ask the user.
6. **Push and open the PR.** Commit, push the branch and open a PR against `dev` (unless the user says otherwise). The PR
   description is for the user, who will review it:
   - Start with a concise summary of what was done.
   - Briefly say what the review found and what you fixed or deliberately left.
   - If there is anything the user should check by hand, give step-by-step instructions (commands, URL, what to look for).
   - Include screenshots wherever they help.
7. **Handle the GitHub review bot.** Opening the PR triggers an automatic review by the Codex connector
   (`chatgpt-codex-connector`), which takes a few minutes. Wait for it, then read every comment
   (`gh api repos/CelestialLemon/Soil-n-Silo/pulls/<N>/comments` and `.../reviews`). Judge each one the same way as in step 5,
   and push fixes to the same PR. A thumbs-up reaction on the PR instead of a review means it found nothing.

## Renderer issues

When the game needs something the renderer doesn't do, or hits a renderer bug:

1. Check the renderer's open issues and `docs/ROADMAP.md` there first; it may already be known or planned.
2. Make sure it is really the renderer's job (the renderer draws; the game owns state, input, UI and timing, see the renderer's
   roadmap, "Who owns what"). Prefer a game-side workaround when one is cheap and honest.
3. Open the issue in `CelestialLemon/pixel3d-renderer` with the `soil-n-silo` label and the `bug` or `enhancement` label: what the
   game needs, a minimal repro or screenshot, the renderer version the game pins, and what the game does meanwhile. If game work
   is blocked on it, link it from a game issue labelled `renderer`.
4. The fix ships in a new renderer release tag. Bumping the game's pin is its own small change here (re-approve the install script,
   see `README.md`).
