# BurgerMapper phase status

This file is the authoritative execution state for the Build Week plan. Update it only with verified Git and external-gate evidence. Never place secret values here.

Last verified: 2026-07-20

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
| 7 | Final user-experience and accessibility polish | COMPLETE | `86e3d85f3dee2f6afca3cd64995a799df1ae259e` | Phase 6 COMPLETE |
| 8 | GitHub, deployment, release candidate, and submission handoff | COMPLETE | `hash pending final report` — `chore: prepare Build Week release candidate` | Phase 7 COMPLETE plus GitHub, visibility, Vercel, and production-variable gates |

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

## Implemented Phase 8 release state — 2026-07-19

- Repository: public at `https://github.com/khalidbench1-collab/BurgerMapper`, default branch `main`, remote head equal to local `86e3d85f3dee2f6afca3cd64995a799df1ae259e` before this release commit, full phase history preserved without rewrites. Judge access requires no credentials. An MIT `LICENSE` file is included in this release candidate.
- Deployment: production at `https://burger-mapper.vercel.app` via the user's GitHub-connected Vercel project. `/`, `/case`, `/case?category=visa-immigration`, and the manifest return `200` with the expected content.
- Production mode: real consent-gated OpenAI analysis. A goal-only request without consent returns typed `403 CONSENT_REQUIRED` (proving `ENABLE_MOCK_AI=false` and a configured `OPENAI_API_KEY` without exposing values), a too-short goal returns typed `422 GOAL_TOO_SHORT` with a request reference, premature research returns `400`, and responses carry `no-store`, `nosniff`, and active rate-limit headers. The homepage shows the real-mode consent copy, "AI analysis" badge, independent non-government identity, and skip link, with no demo-only or competition vocabulary.
- No full consented production OpenAI call has been made by an agent; per `AGENTS.md`, any live analysis remains user-authorized. Judges exercising the site provide their own consent per request.
- Local gates re-verified on 2026-07-19 after the deployment: lint clean, 155/155 tests in 22 files, 5/5 release evaluations, strict production build, `npm audit` 0 vulnerabilities.
- Codex resolved the GitHub/Vercel gates and began release verification, but probed a protected deployment-specific URL (Vercel authentication interstitial caused the HTML responses it saw) and then hit its usage limit; Claude re-ran the verification against the public production domain and completed the release documentation without git mutations.

## Phase 8 release actions

The release candidate was committed as `06ffe5f584676bbdd60aedea3236a05fa114e82b` with message `chore: prepare Build Week release candidate`, pushed to `origin/main`, and verified on the public deployment. The worktree and remote branch are synchronized.

## Post-release UX simplification and real-mode loop fix — 2026-07-20 (uncommitted; Codex to commit)

User-directed intake simplification, then a first real consumer walkthrough in Chrome against the live OpenAI path, which uncovered three blocking defects that unit tests could not see.

### Requested UX changes (all implemented)

- Clarification now shows **exactly two** concrete options plus a **free-text "Neither — type your answer"** field; the typed answer is used verbatim (`custom-answer`). Spans UI, i18n (en/de/ar), the mock builder, and the OpenAI prompt.
- Homepage: removed the "Inputs stay in memory…" paragraph (footer already covers it); added a **Beta** chip beside the wordmark.
- Case page: **"Guide me"** button moved directly under the goal box; consent block, evidence-method selector, and category selector removed; a light **upload icon** now sits inside the goal textarea.

### Defects found only by the browser walkthrough

1. **Every real analysis returned `502 PROVIDER_RESPONSE_INVALID`.** `isCoherentOutput` still required an option with id `dont-know`, which the new prompt tells the model never to emit. `provider.test.ts`'s fixture still contained that option, so the suite stayed green while production was fully broken. Requirement dropped; the duplicate-id check remains, and the test now asserts duplicate ids instead.
2. **The clarification loop never terminated.** Both caps were dead code: `requestNumber` is never sent so `MAX_PROVIDER_REQUESTS_PER_CASE` never tripped, and `askedQuestionIds` was rebuilt each round from the single latest answer so `MAX_CLARIFICATION_QUESTIONS` never tripped. The client also sent only the current Q&A, so the model had no memory and re-asked questions verbatim (observed: Q4 identical to Q1). Fixed by adding `ClarificationResolution.answerHistory` (client ref → form JSON → validator → prompt), accumulating `answers`/`askedQuestionIds` server-side, and **deterministically forcing route-ready once three questions are answered**.
3. **A good analysis was discarded when the optional verification pass failed.** In the `shouldRunVerification` branch a `null` verification response 502'd the whole case even though the primary output had already satisfied the strict schema. Verification is now best-effort: the schema-valid primary is kept unless the correction itself parses. The failed-validation branch still fails hard, since there is nothing to fall back to.

### Other fixes

- `OPENAI_REQUEST_TIMEOUT_MS` 20s → 40s (full route builds were timing out and surfacing a false outage), and `maxDuration = 60` added to `src/app/api/cases/analyze/route.ts` — **without it the hosted function is killed mid-analysis on Vercel**, so this matters for the deployed site, not just locally.
- Copy: "No adequate official source was found for this **mock** topic" → "for this topic" (leaked in real mode); the deadline card's missing-information list no longer reuses the clarification-question heading (new `openPoints` key in all three locales); both case-page subheadings no longer advertise the removed selectors.

### Verification

- Real OpenAI mode, goal "i want to renew my freelance permit residency": reached a complete route twice — once via a single typed answer (the model extracted permit basis, validity, and expiry from one free-text reply), once via three option answers where the cap correctly demoted the model's fourth question to a route step. No console errors.
- Demo mode re-checked end-to-end including the typed-answer path; route and verified citations render.
- Gates: **157/157 tests in 22 files**, lint clean. `npx tsc --noEmit` still reports the same 3 pre-existing errors in `analysis-result.test.tsx` and `provider.test.ts` (untouched, unrelated).
- `.env.local` was temporarily set to `ENABLE_MOCK_AI=false` for the walkthrough and has been **restored to `true`**. Note production is intentionally real mode.

### Follow-up — irrelevant clarification question (same day)

User reported that the goal "i want to do reunification to my wife" produced the question "Are you currently employed, self-employed, or both?".

**Cause: not a logic defect.** The prior cleanup step restored `ENABLE_MOCK_AI=true`, and demo mode is a single fixed example case — `MOCK_CONTENT` in `src/mocks/case-analysis.ts` is keyed **only by language**, so demo mode asks that one employment question and renders the Samira permit-renewal route for *any* goal, by design and without interpreting input. Because the case-page category selector was removed in this same round, a demo user landing on `/case` directly can no longer vary the fixture at all.

- `.env.local` is now `ENABLE_MOCK_AI=false` and is **deliberately left that way** so local testing matches production (production is real mode). Do not restore it to `true` without telling the user.
- Re-verified in real mode with the same goal: Q1 "What is your wife's status in Germany?" (German citizen vs. non-German resident), Q2 "Where are you currently located in relation to Germany?", Q3 nationality/travel document — all route-changing, none repeated — then the cap produced a complete reunification route (German mission, marriage certificate, national visa materials). No console errors.

**Open product decision:** demo mode still shows an unrelated example case beside the user's own typed goal. Honest per its disclaimers, but it reads as broken. Unchanged pending the user's call.

### Additional copy fixes

- The deadline card showed "confirm this date against the original letter" even when the deadline was "Not detected" and no document existed. Now gated on an actual `detectedDeadline`, and reworded to "your original document" (all three locales) since goal-only is the primary path.
- "What this letter says" now renders as "What this means for your case" (`summaryFromGoal`, all three locales) when `inputKind === "goal"`.
- Gates after these changes: **158/158 tests in 22 files**, lint clean.

### Demo mode removed — real OpenAI analysis is the only mode

User decision after the reunification report: the product should never run demo mode. Demo is now unreachable, not merely disabled.

- **Server** (`src/server/cases/provider.ts`): `mockEnabled` deleted from `AnalysisRuntimeConfiguration`; `runConfiguredAnalysis` always constructs the OpenAI provider and throws `API_NOT_CONFIGURED` (503) without a key — it fails loudly instead of silently serving an example case. `toMockCaseInput` and the `MockDocumentAnalysisService` import are gone.
- **Handler** (`handle-request.ts`): the API-key and `CONSENT_REQUIRED` gates are now unconditional.
- **`ENABLE_MOCK_AI` is no longer read anywhere in the application.** It was removed from `.env.local`; any value left in Vercel is inert. Verified by setting it to `true` and observing a 7.2 s real OpenAI call and an on-topic AI question.
- **Domain**: `CaseAnalysis.isMock` removed, which let the compiler enumerate every demo branch. All collapsed to the real-mode string across `analysis-result`, `analysis-summary`, `case-profile-summary`, `route-export`, `analysis-loading-state`, `app-header`, `goal-input-panel`, and both pages. The `analysisMode`/`mode` props are gone.
- **Client** (`case-workspace.tsx`): the client-side mock answer path is deleted — `handleClarification` and `handleClarificationText` now always round-trip to the server, so an answer is a real request rather than a local fixture resolution.

**Deliberately kept as test-only fixtures:** `src/mocks/*` and `MockDocumentAnalysisService` still exist because component tests need a fixture to render. No product file imports them (`document-analysis.ts` reaches them, and is used by `case-builder.ts` only for `adaptAnalysisToClarification` and the `createMockCaseProfile` fallback, which builds a profile from real analysis data and never invents demo content). `buildMockRouteFromProfile` keeps its historical name but operates on real data. Renaming these is cosmetic and was left alone.

Gates: **158/158 tests in 22 files**, lint clean, strict production build succeeds, `tsc` unchanged at the 2 pre-existing `analysis-result.test.tsx` errors. README's "Mock configuration" section is now "Analysis configuration" and states the real-only contract.

### Premature finalization — route was answering with questions

User report: a parent-reunification case asked only one question, then listed four route-changing unknowns under "Open points to confirm" and made the first action "Select whether your parent is outside Germany or already in Germany" — a question wearing a route step's clothing. This is the opposite failure from the earlier loop: the model under-asked.

- **Question budget in the prompt** (`request-plan.ts`): every request now states "you have asked N of 3 allowed questions… While budget remains, spend it". Without a number the model was left guessing, which is what produced both the loop and the early finalize.
- **Prompt rule** (`prompts.ts`): a route-changing unknown must be the clarification question while budget remains — it may not be parked in `missingInformation` and may not become a next step telling the user to select/choose/decide. When finalizing, remaining items may only be things the user verifies against documents or with the authority.
- **Deterministic guard** (`provider.ts`): once the route is final, any next step with status `needs-answer` is rewritten to `ready`. Nothing is pending, so nothing may claim to await the user.
- **Compactness**: at most 8 documents, 6 steps, 5 open points, one-to-two-sentence descriptions.

**History-truncation bug found while verifying.** `recordAnswer` matched *any* earlier entry by `questionId`, so when the model reused an id for a genuinely new question the history was truncated — which reset the question budget and let the exchange run past the cap. It now only treats a re-answer of the immediately-preceding question (same id *and* prompt) as a correction. Confirmed via server logging: history accumulated correctly afterwards.

**Latency finding (measured, not assumed).** Final route generation is highly variable for identical requests: 10s, 27.7s, 32.7s, 37s, 49.3s, ~50s. It is not correlated with output size (trimming 11 documents to 8 changed nothing) and involves a single model call (verification=0). The old 40s ceiling therefore cut off the slow tail as a false outage. `OPENAI_REQUEST_TIMEOUT_MS` is now 55s, deliberately just under the route's `maxDuration = 60`, since anything slower would be killed by the platform anyway. Also fixed: the SDK raises a plain `Error("Request timed out.")` with no status, which fell through to `PROVIDER_UNAVAILABLE` (503, "temporarily unavailable") instead of `PROVIDER_TIMEOUT` (504); message-based detection was added with a regression test.

Verified in Chrome on the reported case: three questions asked (sponsor status, permit type, parent location — the last two previously deferred), then a compact route whose open points are all "Verify…/Confirm…" tasks, first action "Assemble the relationship and hardship file", and **no step labelled "Needs your answer"**. Gates: **162/162 tests in 22 files**, lint clean, production build succeeds, `tsc` unchanged at the 2 pre-existing errors.

**Residual, not fixed:** the model occasionally lists an already-answered fact among the open points. The prompt forbids it, but there is no deterministic guard, since matching it reliably needs semantic comparison.

### Intake trim — help text, phase name, language menu

- Removed the goal help paragraph ("Use at least 10 non-whitespace characters. Your goal stays in browser/request memory…"). The short "Selecting Guide me sends the minimum required case content to OpenAI for analysis." note is now the only line under the box, at its existing size. `aria-describedby` on the textarea dropped the deleted `goal-help` id so no dangling reference remains; the too-short validation message is unchanged.
- Intake phase 2 renamed from "Need one detail" to "Gathering context" (`intake-progress.tsx`).
- Replaced the full-width "Output language" radio section with a light `LanguageMenu` button placed under the goal box, in the corner opposite the Guide me button. `language-selector.tsx` and its test were deleted. The menu is a real menu button — `aria-haspopup`/`aria-expanded`, `role="menu"` with `menuitemradio` + `aria-checked`, Escape and outside-click close, focus returned to the trigger — covered by four tests in `language-menu.test.tsx`.

Gates: **165/165 tests in 22 files**, lint clean, production build succeeds, `tsc` unchanged at the 2 pre-existing errors. Verified in Chrome: phase reads "Gathering context", old help text gone, no radios remain, and the menu opens with English checked.

### Post-release UX simplification and real-mode loop fix — commit evidence

Completed in one coherent commit: `fix: simplify case intake and end the real-mode clarification loop` — hash pending final report.

Verified before commit: 165/165 tests in 22 files, lint clean, strict production build succeeds, `npm audit` reports 0 vulnerabilities, and `npx tsc --noEmit` reports only the two pre-existing errors in `src/components/case/analysis-result.test.tsx`.

## Status meanings

- `NOT STARTED`: prerequisites are recorded but no implementation for this phase has begun.
- `BLOCKED — …`: a named user or external action is required; do not bypass it or begin dependent phases.
- `IN PROGRESS`: implementation is active in the current run and no completion commit exists yet.
- `COMPLETE`: every required outcome, quality gate, documentation update, exact commit, and final report is complete.

## Next executable phase

Phase 8 is the final autonomous phase and is complete. No further phase exists after Phase 8.

Any future real API request remains separately permission-gated unless the user grants a new exact authorization.
