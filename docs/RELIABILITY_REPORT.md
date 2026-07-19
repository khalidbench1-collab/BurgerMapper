# Phase 6 reliability report

Date: 2026-07-18

## Release-gate result

Phase 6 passes its local release gate. This is evidence for a release candidate, not proof of legal correctness or production readiness. The deterministic suite contains 11 versioned synthetic cases spanning routine, ambiguous, missing-data, high-risk, German, Arabic, correction, and adversarial goal/text/PDF/image/source inputs. It makes no OpenAI or live research request.

Release-blocking thresholds are deliberately strict for the synthetic set:

- 100% schema-valid structured outputs.
- 100% exactly-one-consequential-question behavior when a question is needed, and zero questions after sufficiency.
- 100% “I don't know”, correction-memory, profile-sufficiency, route-completeness, deadline, escalation, citation, injection, and RTL checks.
- Zero repeated questions, false reassurance, robotic filler, or obeyed document/source instructions.
- Routine synthetic task latency at or below 5 seconds and high-risk task latency at or below 20 seconds.
- Estimated `gpt-5.6-luna` spend at or below USD 0.10 per case and USD 1.00 per complete synthetic suite.
- Zero high or critical dependency-audit findings.

`npm run eval` passed all 5 evaluation tests and all 11 cases, with no blockers. It includes an injected provider transport and deterministic source retriever path with no network traffic. Estimated synthetic-case spend was USD 0.176 total if those fixed token estimates were billed; the suite itself used mocked data and cost USD 0.

## Failure and abuse controls

- Analysis and research endpoints use a salted, in-memory client-key hash, a fixed one-minute request window, and endpoint-wide concurrent-request ceilings. Analysis allows 20 requests/minute and 2 concurrent requests per process; research allows 30/minute and 3 concurrent. The client-hash map prunes expired inactive windows and caps retained entries at 2,048.
- Limit failures return typed `429` responses with safe copy and `Retry-After`. Successful responses expose limit/remaining/reset headers without exposing the client key.
- This guard is intentionally process-local. It is not a distributed production rate limiter and can reset on restart or vary across serverless instances. Phase 8 must add platform-level protection before public deployment.
- Provider timeout, transient retry, auth, billing, rate, outage, invalid-schema, and request-ceiling paths remain typed. Research retriever exceptions now map to `RESEARCH_UNAVAILABLE`, so the route stays explicitly unverified and presents an authority escalation.

## Cost and operational metrics

The server can collect only aggregate request count, outcome, latency band, provider mode, token totals, retry totals, and estimated cost. It accepts no prompts, filenames, goals, answers, source queries, client identifiers, response bodies, or case content, and retains counters rather than request events. Metrics are in memory only and no analytics or reporting service was added.

Current Luna planning prices were checked against official OpenAI documentation on 2026-07-18: USD 1.00 per million input tokens, USD 0.10 per million cached input tokens, and USD 6.00 per million output tokens. Real transport usage is converted into those aggregate cost units. Pricing and reasoning settings must be rechecked before deployment.

## Reviews

### Security and privacy

- Server validation, magic-byte checks, in-memory document handling, `store: false`, per-case consent, no content logging, prompt-injection boundaries, exact official-domain allowlisting, no-store responses, `nosniff`, no-referrer, and safe typed errors remain intact.
- The API never returns original input, binary, base64, a secret, a stack trace, or raw provider exception.
- Anonymous limits reduce accidental abuse but do not replace authentication, edge protection, or a distributed limiter.
- No real document, private letter, personal information, production API response, or new live API call was used.

### Accessibility and multilingual behavior

- Existing semantic headings, labels, keyboard-operable native controls, `aria-live` status/error messages, visible focus rings, motion-reduced loading indicator, print styles, language attributes, and Arabic RTL/LTR URL handling remain covered by component tests and source inspection.
- The in-app browser could not initialize because its sandbox-policy metadata was unavailable. Therefore no Phase 6 visual-browser or automated browser accessibility claim is made. Phase 7 must perform the full 320 px, desktop, keyboard, focus, contrast, zoom, screen-reader-oriented, print, and mixed-direction review.

### Performance

- Local development HTTP checks returned `200` for `/`, `/case`, `/case?category=visa-immigration`, and `/manifest.webmanifest`. Observed cold/warm development responses were approximately 2477/722/339/500 ms respectively, with HTML sizes of 33,590/25,810/26,090 bytes and a 225-byte manifest.
- Production-build local HTTP checks returned `200` for `/`, `/case?category=visa-immigration`, the manifest, mock analysis, and the honest unsupported-topic research result; a too-short goal returned typed `422`. A fixed synthetic client burst produced 20 `200` analysis responses followed by 30 typed `429` responses and a `Retry-After` header. The required in-app browser could not initialize because its sandbox-policy metadata was unavailable.
- These are development measurements on one Windows machine, not production benchmarks. No bundle-budget or load-test claim is made.

### Dependencies and licenses

- `npm audit --audit-level=moderate` reported 0 vulnerabilities.
- Direct production licenses checked locally: Next.js, React, React DOM, and Zod are MIT; OpenAI SDK is Apache-2.0.
- Representative development licenses checked locally: Vitest, ESLint, and Tailwind CSS are MIT.
- `npm ls --depth=0` reported several extraneous optional WASM runtime packages in the local install. They are not declared direct dependencies and did not affect lint, tests, build, or audit; a clean Phase 8 install should confirm they are absent or harmless.

## Remaining release blockers

Phase 7 visual/accessibility/UX polish and Phase 8 production deployment checks remain required. Public release is blocked if any synthetic release check fails, the dependency audit gains a high/critical finding, browser accessibility checks reveal a critical barrier, official-source evidence is stale or unsupported, production rate protection is absent, consent/retention copy is inaccurate, or a real provider test exceeds its approved cost/scope. No deployment or submission is claimed.
