# BurgerMapper final handoff checklist

This checklist defines the end of autonomous repository work. It is not evidence that release or submission tasks are complete. Update it only with verified artifacts and never invent URLs, IDs, access status, or rule compliance.

## Release-candidate prerequisites

- [x] Phases 0, 1, 1.5, 2, 3, 4, 5, 6, and 7 are `COMPLETE` in `PHASE_STATUS.md`.
- [x] Phase 8 quality, deployment, and documentation requirements are complete (release commit itself pending; see below).
- [x] Git history preserves one coherent commit per phase.
- [ ] Worktree is clean and the release-candidate commit hash is recorded (pending: `chore: prepare Build Week release candidate`).
- [x] Lint, full tests, production build, and audit pass (re-verified 2026-07-19: lint clean, 155/155 tests, strict build, 0 vulnerabilities).
- [x] Release-blocking evaluation criteria pass (5/5 evaluations over 11 synthetic cases, 2026-07-19).
- [x] No secret, real private document, raw provider response, or personal information is tracked.

## Repository handoff

- [x] README accurately describes the working workflow, setup, architecture, privacy, security, testing, and limitations.
- [x] Prior-work disclosure is current and honest.
- [x] Codex collaboration evidence is specific and dated.
- [x] Dependency licenses and audit results are recorded.
- [x] Repository URL: `https://github.com/khalidbench1-collab/BurgerMapper`
- [x] Repository visibility and judge access are confirmed (public; no credentials needed; verified 2026-07-19).
- [x] Default branch and complete dated history are available to judges (`main`, remote head `86e3d85f3dee2f6afca3cd64995a799df1ae259e` at verification time).
- [x] Repository `LICENSE` file added — MIT, chosen by the user on 2026-07-19 (in the working tree; ships with the pending release commit and push).

## Deployment handoff

- [x] Vercel ownership and authentication were confirmed by the user.
- [x] Production variables were configured privately without recording their values (presence of real mode and key proven by typed `CONSENT_REQUIRED` boundary behavior only).
- [x] Live deployment URL: `https://burger-mapper.vercel.app` (verified 2026-07-19; consent-gated real OpenAI mode).
- [x] Production smoke tests cover landing, category preselection, manifest, goal validation, typed consent/validation/research errors, privacy and rate headers, real-mode copy, and non-government identity — all with synthetic data. A full consented OpenAI analysis was deliberately not run by an agent; it remains user- or judge-initiated with per-request consent.
- [x] No private production test document was used.
- [x] Privacy, retention, provider transfer, and limitation copy matches production behavior.

## Demo capture readiness

- [x] Judge-friendly example letter produces a stable route (deterministic in local demo mode; consent-gated live analysis on production).
- [x] Demo sequence fits under three minutes before recording (timed ~2:50 narration script exists alongside the storyboard).
- [x] Goal-first entry, meaningful clarification, route, deadline, official citations, Arabic output, and limitations are demonstrable.
- [x] Error or fallback behavior has a safe backup demonstration (typed validation errors reproducible with a too-short goal).
- [ ] Screenshot list is agreed after current competition rules are verified.
- [ ] Demo video URL: `[placeholder — user adds after YouTube upload]`

## Submission evidence placeholders

- [ ] Chosen category: `[placeholder — decide after current official-rule verification; "Apps for Your Life" is the natural fit]`
- [ ] Devpost project description: `[placeholder — write with ChatGPT after release candidate]`
- [ ] Public YouTube URL: `[placeholder — user upload only]`
- [ ] Codex `/feedback` Session ID: `[placeholder — user provides after running /feedback]`
- [ ] Final submission deadline and rules: submission closes 2026-07-21 17:00 PT per the official rules pasted by the user on 2026-07-19; re-verify on the Devpost page before submitting.
- [x] Live demo URL: `https://burger-mapper.vercel.app`
- [x] Repository URL: `https://github.com/khalidbench1-collab/BurgerMapper`

## External actions Codex must not perform autonomously

- [ ] User completes OpenAI billing and secret configuration privately.
- [ ] User authenticates GitHub and chooses repository ownership/visibility.
- [ ] User authenticates Vercel and approves production configuration.
- [ ] User runs Codex `/feedback` and supplies only the Session ID.
- [ ] User uploads the final video to YouTube.
- [ ] User submits the Devpost entry.

## Return-to-ChatGPT package

After the working deployed release candidate exists, the user returns to ChatGPT for:

- current official-rule verification;
- category decision;
- Devpost description and application answers;
- the three-minute video script and demo sequence;
- screenshot selection;
- YouTube title, description, and wording;
- Codex collaboration explanation;
- GPT-5.6 contribution explanation;
- prior-work disclosure review;
- final submission compliance review.

## Autonomous stop condition

Autonomous development ends when the working, deployed, documented release candidate and this handoff package are complete. Do not upload to YouTube, submit Devpost, invent missing evidence, or continue into submission-writing work.
