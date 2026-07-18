# Phase report template

Copy this template into the phase's final report or a dated build-log entry. Replace every placeholder with verified evidence. Remove inapplicable items only with a short reason.

## Phase identity

- Phase: `[number — title]`
- Date: `[YYYY-MM-DD]`
- Starting commit: `[full hash]`
- Final status: `[COMPLETE or precise BLOCKED reason]`
- Required commit message: `[exact message]`
- Final commit hash: `[full hash, or N/A when blocked before a commit]`

## Objective and outcome

- Objective: `[one precise sentence]`
- Outcome: `[what is actually working]`
- Explicitly not implemented: `[out-of-scope and deferred work]`

## User workflow

1. `[entry action]`
2. `[case-building or analysis action]`
3. `[clarification behavior]`
4. `[route/result behavior]`

Record mobile, multilingual, RTL, keyboard, loading, error, empty, reset, print, and export behavior when relevant.

## Architecture and contracts

- Types/contracts added or changed: `[list and compatibility impact]`
- Client/server/provider boundaries: `[summary]`
- New dependencies: `[package, reason, direct/transitive, production/development, license]`
- Decisions and tradeoffs: `[links to decision records]`

## Privacy, security, and legal safety

- Input transmission: `[destinations and consent]`
- Retention/storage/logging: `[exact behavior]`
- Secret handling: `[server-only evidence without values]`
- Prompt-injection or untrusted-content controls: `[evidence]`
- Official-source and legal-certainty behavior: `[evidence and limitations]`
- Abuse/rate/cost controls: `[when relevant]`

## Verification

| Check | Exact result |
| --- | --- |
| `npm run lint` | `[pass/fail and findings]` |
| `npm test` | `[files, total tests, pass/fail]` |
| `npm run build` | `[pass/fail and routes]` |
| `npm audit` | `[counts and dependency total]` |
| HTTP/API checks | `[routes, statuses, representative success/error]` |
| Accessibility checks | `[automated/manual/browser evidence]` |
| Security/privacy checks | `[evidence]` |
| Multilingual/RTL checks | `[evidence]` |
| Provider/fallback checks | `[evidence]` |

Use synthetic fixtures only. Do not paste private inputs, API payloads, provider responses, or secret values into this report.

## Regressions and fixes

- Existing workflows verified: `[list]`
- Problems found: `[list]`
- Fixes applied: `[list]`
- Remaining risks: `[list]`

## Documentation updated

- [ ] `README.md`
- [ ] `docs/BUILD_LOG.md`
- [ ] `docs/DECISIONS.md`
- [ ] `docs/ARCHITECTURE_DECISIONS.md` when architecture changed
- [ ] `docs/DEMO_STORYBOARD.md`
- [ ] `docs/SUBMISSION_CHECKLIST.md`
- [ ] `docs/PHASE_STATUS.md`

## Git and evidence audit

- [ ] Starting worktree was clean or pre-existing changes were explicitly preserved.
- [ ] Status, diff summary, staged file list, and `diff --check` were inspected.
- [ ] No secret, real letter, private document, personal information, raw API response, or unintended binary is tracked.
- [ ] Build log matches exact results.
- [ ] One coherent phase commit uses the exact required message.
- [ ] Final worktree status and full hash were verified.

## External gates and handoff

- Gate encountered: `[none or exact gate]`
- User action required: `[non-secret action only]`
- Next phase prerequisite: `[exact condition]`
- Recommended next action: `[one sentence]`
- Stop confirmation: `No work from the next phase was started.`

## Final response order

Return the numbered items required by the phase prompt. Lead with the implemented outcome, include exact test/build/audit evidence and commit hash, state limitations honestly, give one exact next action, and stop.
