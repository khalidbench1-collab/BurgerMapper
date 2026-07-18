# BurgerMapper autonomous execution instructions

This document explains how to run the remaining Build Week plan safely. `AGENTS.md` is the canonical rule set; the master plan supplies phase-specific prompts.

## Master execution command

```text
Read AGENTS.md, docs/MASTER_BUILD_PLAN.md, and docs/PHASE_STATUS.md. Execute the first phase marked NOT STARTED whose prerequisites are complete. Follow its full prompt. Stop after its commit and final report. Never automatically begin the next phase.
```

Use that command in a fresh Codex session from the repository root. Do not paste several phase prompts into one run.

## Required reading order

1. `AGENTS.md`
2. `docs/PHASE_STATUS.md`
3. `docs/MASTER_BUILD_PLAN.md`
4. The selected phase prompt in full
5. Existing code, tests, environment template, and relevant decisions
6. Version-specific Next.js guidance and, when applicable, current official OpenAI documentation

## Phase selection

- Select only the first phase marked `NOT STARTED` whose prerequisites are all `COMPLETE`.
- A `BLOCKED` phase cannot be started until its named external gate is resolved and the status is deliberately changed to `NOT STARTED`.
- Do not skip a blocked phase to implement dependent phases.
- Do not infer that an API key, billing, authentication, repository visibility choice, or deployment authorization exists.

## Start-of-phase checks

- Confirm the current branch, HEAD commit, and clean worktree.
- Compare the status file with Git history and correct documentation-only drift before product work.
- Inspect current public contracts and regression tests.
- Confirm that the phase prompt's external prerequisites are satisfied without printing secrets.
- Record assumptions and the phase objective in the build log.

## Execution behavior

- Work autonomously inside the selected phase's scope.
- Make reasonable implementation decisions consistent with `AGENTS.md` and record material tradeoffs.
- Preserve existing behavior unless the phase explicitly changes it.
- Stop for user action at an external gate; never substitute credentials, publication choices, or invented identifiers.
- Never ask for a secret in conversation. Ask only whether the user has configured it privately.
- Use synthetic data and fictional documents for all tests and demos.

## Completion protocol

1. Run the phase's tests and every permanent quality gate.
2. Run relevant HTTP, API, integration, accessibility, security, privacy, multilingual, and deployment checks.
3. Update all mandatory documentation and `docs/PHASE_STATUS.md` with exact evidence.
4. Complete a report using `docs/PHASE_REPORT_TEMPLATE.md`.
5. Inspect Git status, diff summary, candidate files, secrets, private documents, and binaries.
6. Create exactly one commit using the phase's exact message.
7. Confirm the full commit hash and clean worktree.
8. Return the requested final report and stop.

For commit hashes, follow the canonical non-circular rule in `AGENTS.md`: backfill the prior phase's hash at the next authorized phase, mark the current hash pending before its commit, and report the new full hash after committing. Do not create a second commit or rewrite history just to place a commit hash inside itself.

Do not mark a phase complete because time is short or a partial demo works. A phase is complete only when its required outcome, tests, documentation, and commit are complete.

## Blocked protocol

When a prerequisite requires user action:

- do not implement around the missing prerequisite;
- do not expose or request credential values;
- report the exact private action required;
- state what was and was not changed;
- leave dependent phases untouched;
- keep or set the phase status to the precise blocked reason required by its prompt;
- stop the run without manufacturing a completion commit.

Phase 4 is initially `BLOCKED — PENDING API ACCESS`. The user must privately enable OpenAI API billing/access and configure `OPENAI_API_KEY` in `.env.local`, then confirm only that access is ready. At that point, deliberately change Phase 4 to `NOT STARTED` before executing it.

## Final boundary

Autonomous execution ends after Phase 8 produces a working, deployed, documented release candidate and the final handoff records. Codex must not upload to YouTube, submit Devpost, invent submission answers, or fabricate URLs or IDs.

The user will return to ChatGPT for current official-rule verification, category selection, Devpost writing, application answers, the three-minute video script and sequence, screenshots, YouTube wording, Codex and GPT-5.6 explanations, prior-work disclosure review, and final submission compliance review.
