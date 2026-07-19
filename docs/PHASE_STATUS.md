# BurgerMapper phase status

This file is the authoritative execution state for the Build Week plan. Update it only with verified Git and external-gate evidence. Never place secret values here.

Last verified: 2026-07-19

| Phase | Title | Status | Commit / blocker | Prerequisites |
| --- | --- | --- | --- | --- |
| 0 | Build Week project foundation | COMPLETE | `e28b367f4e31fda6a2f783584e0ffa2135a1439a` | None |
| 1 | Mock document analysis workflow | COMPLETE | `6c1a9869a64da6aca834f5d02ffbd475256d0f17` | Phase 0 |
| 1.5 | Multimodal case intake | COMPLETE | `aeb7f42033e01d5295ceae5ae6b3367eb87b5cd0` | Phase 1 |
| 2 | Secure multimodal analysis boundary | COMPLETE | `c6369e91a505e8d97ce2a7a6bbd460492b5dda9b` | Phase 1.5 |
| 3 | Goal-based Case Builder Agent in mock mode | COMPLETE | `f72589e7102403ca9fa8b78c16f46c401b6c934b` | Phase 2 COMPLETE |
| 4 | Real OpenAI multimodal and structured-output integration | COMPLETE | `4d0b20d73defbb72ed8af9efeecd07b58ff041be` | Phase 3 COMPLETE and API gate resolved |
| 5 | Official-source research and cited personalized routes | COMPLETE | `8c24cb60476ff8bf88e199bdf45685e7fab777ce` | Phase 4 COMPLETE |
| 6 | Reliability, safety, evaluation, and cost controls | COMPLETE | `94b72cb3602684ab9280fc8493dc4f2459d78edd` | Phase 5 COMPLETE |
| 7 | Final user-experience and accessibility polish | COMPLETE | `feat: polish the BurgerMapper experience`; hash pending final report | Phase 6 COMPLETE |
| 8 | GitHub, deployment, release candidate, and submission handoff | NOT STARTED | Exact future commit: `chore: prepare Build Week release candidate` | Phase 7 COMPLETE plus GitHub, visibility, Vercel, and production-variable gates |

## Implemented Phase 4 model boundary

- Primary model: `gpt-5.6-luna`; runtime selection remains configurable through server-only `OPENAI_MODEL`.
- Official documentation was verified on 2026-07-18 for the exact ID, Responses API, text/image/PDF inputs, Structured Outputs, and `low`, `medium`, `high`, and `xhigh` reasoning.
- The official server SDK, strict schemas, consent, provider adapter, bounded errors/retries/limits, selective verification, and mock fallback are implemented.
- No real API request was made during Phase 4. Phase 5 later completed the one bounded synthetic smoke described below; the key value was never inspected, printed, logged, or committed.

## Phase 5 bounded smoke-test result

- The single authorized request passed on 2026-07-18 using `gpt-5.6-luna`, short synthetic `input_text`, low reasoning, `store: false`, no tools/retry/verification/second call, and a strict schema.
- Content-free metadata: 2,252 ms latency; 47 input, 30 output, and 77 total tokens; estimated cost USD 0.000227; data-sharing status unknown.
- No prompt or output content was recorded. The smoke proves project/model/schema access only, not real document quality, route accuracy, multilingual quality, or production readiness.
- The user later allowed a second call if necessary, but no gap required it and no second call was made.

## Implemented Phase 5 source boundary

- Research starts only after `CaseProfile.sufficiency.state` is `sufficient`; the server independently rejects early research.
- `POST /api/cases/research` receives only an abstract topic, optional category, language, and sufficiency state and returns no-store/discard metadata.
- Exact official hosts are allowlisted, claim/source/step mappings are explicit, deadline provenance is visible, conflicts and unsupported evidence are downgraded, and Arabic links remain LTR.
- The current provider is a dated deterministic snapshot for three fictional demo topics. It is not a live source-refresh system.
- Phase 5 gates passed: 16 files and 128 tests, lint, strict production build, 0-vulnerability audit, and required local HTTP/API checks.

## Implemented Phase 6 reliability boundary

- Eleven versioned synthetic cases cover routine, ambiguous, missing-data, high-risk, multilingual, correction, and adversarial goal/text/PDF/image/source behavior.
- Machine-checkable release blockers require schema validity, useful non-repeated questions, “I don't know”, correction memory, sufficient profiles, complete routes/deadlines/escalation/citations, injection containment, serious tone, Arabic RTL/LTR, and latency/cost budgets.
- Analysis and research enforce typed process-local anonymous request limits and endpoint-wide concurrency limits; their salted client-hash maps are bounded and provider/source failures remain safe.
- Operational metrics are aggregate-only in-memory counters: counts, outcomes, latency bands, mode, tokens, retries, and estimated cost—never content, identifiers, or per-request events.
- Phase 6 gates passed: 18 files and 139 tests, 5 evaluation tests over 11 cases, lint, strict production build, 0-vulnerability audit, license review, and required local HTTP/API checks. The visual browser was unavailable, so full visual accessibility review remains required in Phase 7.

## Implemented Phase 7 experience boundary

- The homepage and case screen describe the active analysis mode truthfully; the stale mock-only and "Phase 4" copy is gone and the header/footer carry a permanent independent, non-government, legal-information identity.
- Route results open with the deadline/urgency card and a localized "Your first action" card before facts and summaries, in screen, print, and export order.
- A browser-side plain-text export (`src/lib/route-export.ts`, fixed name `burgermapper-route.txt`) joins printing; nothing is uploaded or persisted and the file name cannot carry personal data.
- A skip-to-content link, `#main-content` landmarks, phase-jargon-free source status in three languages, and a goal-first PWA manifest with a favicon icon and no offline claim complete the polish.
- Phase 7 gates passed on 2026-07-19: 22 files and 155 tests, 5 evaluation tests over 11 cases with zero blockers, lint, strict production build, 0-vulnerability audit, and the required local HTTP checks. No dependency changed.
- A same-day real-browser follow-up (Chrome DevTools, fictional sample only) verified 320 px/desktop layout, keyboard and skip-link behavior, live regions, and Arabic RTL with LTR URLs, then fixed three marginal muted-gray contrast values and one `dl` nesting nit it uncovered. Final Lighthouse mobile scores: accessibility 100, best practices 100, SEO 100 on both the homepage and a completed route. A human screen-reader walkthrough is still recommended before submission.
- A user-directed customer-copy pass (2026-07-19) replaced all rendered "mock/fictional/Build Week" vocabulary with "demo/example" product language in English, German, and Arabic while preserving every honesty obligation (example-case basis, no AI interpretation in demo mode, not legal advice, unverified sources, non-government identity). Internal contracts and `ENABLE_MOCK_AI` keep the mock naming. All gates re-passed after the change.

## Pending git actions — 2026-07-19 (two sequential commits, Codex only)

Both Phase 6 and Phase 7 are implemented, documented, and gate-verified, but neither mandated commit exists yet. The Phase 6 Codex session ended at a usage limit after staging its work; Phase 7 was then executed by Claude with every change left deliberately unstaged, so the Git index still contains exactly the Phase 6 content and the working tree adds Phase 7 on top. `HEAD` remains the Phase 5 commit `8c24cb60476ff8bf88e199bdf45685e7fab777ce`. No git mutation was performed in either Claude session.

Verified evidence from 2026-07-19: the staged-only Phase 6 audit passed (28 files, +938/−36, `git diff --cached --check` clean, no sensitive or binary candidate, only `.env.example` tracked); with Phase 7 applied, lint, 155/155 tests in 22 files, the 5-test evaluation gate, the strict production build, a 0-vulnerability audit, and the local HTTP checks all passed.

Required Codex sequence, and nothing else:

2. Record the new full Phase 6 hash, replace `hash pending final report` in the Phase 6 row above with it, and remove this completed step from this section.
3. Stage all remaining working-tree changes (`git add -A`), inspect the staged list and `git diff --cached --check`, and verify no secret, private content, or unintended binary is included (expected: 29 modified files — 22 under `src/` plus README and 6 documentation files — and 6 new files: `src/components/app-footer.tsx`, `src/lib/route-export.ts`, and four test files).
4. Create the Phase 7 commit with the exact message `feat: polish the BurgerMapper experience`.
5. Report both full hashes and the final clean worktree status, then stop. The Phase 7 hash is backfilled at the start of Phase 8 per the `AGENTS.md` non-circular hash rule.

Do not begin Phase 8 until both commits exist and the worktree is clean.

## Status meanings

- `NOT STARTED`: prerequisites are recorded but no implementation for this phase has begun.
- `BLOCKED — …`: a named user or external action is required; do not bypass it or begin dependent phases.
- `IN PROGRESS`: implementation is active in the current run and no completion commit exists yet.
- `COMPLETE`: every required outcome, quality gate, documentation update, exact commit, and final report is complete.

## Next executable phase

Phase 8 is the first phase marked `NOT STARTED`, but its prerequisites are not complete until Codex creates the two pending commits above and the worktree is clean. Phase 8 additionally pauses at the GitHub, visibility, Vercel, and production-variable gates.

After both pending commits exist, run exactly:

```text
Read AGENTS.md, docs/MASTER_BUILD_PLAN.md, and docs/PHASE_STATUS.md. Execute the first phase marked NOT STARTED whose prerequisites are complete. Follow its full prompt. Stop after its commit and final report. Never automatically begin the next phase.
```

Any future real API request remains separately permission-gated unless the user grants a new exact authorization.
