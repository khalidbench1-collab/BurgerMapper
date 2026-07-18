# BurgerMapper master remaining-build plan

This document contains the complete autonomous execution prompts for the remaining product phases. Each prompt is standalone and may be copied into a fresh Codex session. `AGENTS.md` remains canonical if a prompt omits a permanent repository rule.

## Master execution command

```text
Read AGENTS.md, docs/MASTER_BUILD_PLAN.md, and docs/PHASE_STATUS.md. Execute the first phase marked NOT STARTED whose prerequisites are complete. Follow its full prompt. Stop after its commit and final report. Never automatically begin the next phase.
```

Run one phase at a time. Do not batch prompts, pre-implement later phases, or bypass a `BLOCKED` status. Completed history must remain intact.

## Planned Luna interaction and API architecture

- `gpt-5.6-luna` is the planned primary model; `OPENAI_MODEL` remains configurable. Phase 4 must verify the exact identifier, project availability, multimodal support, Structured Outputs support, and reasoning-setting values in current official OpenAI documentation before implementation. Do not silently substitute another model.
- Use procedural warmth: calm, respectful, patient, and direct, not emotional, chatty, or overly reassuring. Warmth comes from one consequential question at a time, accepting “I don't know”, remembering corrections, briefly explaining why a question matters, and avoiding repeated questions or judgmental language.
- Do not force an acknowledgement before every response. Use one only for a correction, urgency, confusion, or a major route change. Final routes should be factual and more serious than intake conversation.
- The structured `CaseProfile` is MVP memory. Do not add a vector database.
- Use Structured Outputs for clarification decisions, profile updates, document interpretation, and routes. Do not request visible chain of thought or hidden reasoning.
- Planned reasoning levels are intake `low`, profile decisions `medium`, document analysis/research/routes `high`, and high-risk cases `xhigh`; Phase 4 must verify that these exact values are supported before use.
- Do not use a second tone-polishing model call. Permit an optional structured verification pass only for high-risk routes, source conflicts, suspected unsupported claims, or failed validation.

## Completed baseline

| Phase | Commit |
| --- | --- |
| Phase 0 — foundation | `e28b367f4e31fda6a2f783584e0ffa2135a1439a` |
| Phase 1 — mock document analysis | `6c1a9869a64da6aca834f5d02ffbd475256d0f17` |
| Phase 1.5 — multimodal intake | `aeb7f42033e01d5295ceae5ae6b3367eb87b5cd0` |
| Phase 2 — secure multimodal boundary | `c6369e91a505e8d97ce2a7a6bbd460492b5dda9b` |

The remaining prompts begin below.

---

## Phase 3 — Goal-based Case Builder Agent in mock mode

Copy the complete prompt below into a fresh Codex session.

````text
You are continuing BurgerMapper for OpenAI Build Week 2026.

PHASE

Phase 3 — Goal-based Case Builder Agent in mock mode

CURRENT STATUS ASSUMPTIONS

- Phases 0, 1, 1.5, and 2 are complete.
- Phase 2 commit is c6369e91a505e8d97ce2a7a6bbd460492b5dda9b.
- The repository has a strict TypeScript Next.js 16.2.10 App Router application.
- `/api/cases/analyze` accepts server-validated multipart text, PDF, image, and trusted sample input.
- Existing mock analysis, six optional categories, English/German/Arabic output, Arabic RTL, clarification adaptation, privacy metadata, typed errors, tests, and mock fallback work.
- No OpenAI request, web research, database, authentication, analytics, or persistent private-data storage exists.
- `docs/PHASE_STATUS.md` marks Phase 3 NOT STARTED and its prerequisites complete.

Before changing files, read `AGENTS.md`, `INSTRUCTIONS.md`, this entire prompt, `docs/PHASE_STATUS.md`, current domain/service contracts, tests, and relevant version-specific Next.js documentation. Confirm the worktree is clean and record the starting commit. If assumptions differ, reconcile them without rewriting completed history.

OBJECTIVE

Build a calm, goal-first Case Builder Agent entirely in deterministic mock mode. A user must be able to begin with “What do you need to get done?” without knowing German administrative terminology, optionally add a document or category, answer one route-changing question at a time, correct earlier answers, and receive a final fictional route derived from a structured `CaseProfile`.

This is not a chatbot. The profile and personalized route are the product.

REGRESSION POLICY

- Preserve every supported intake method: free-form goal, pasted letter/message, PDF, PNG/JPEG/WebP, and trusted sample.
- Preserve all six optional categories and general uncategorized entry.
- Preserve `/api/cases/analyze`, safe multipart validation, signature checks, typed errors, in-memory behavior, mock provider, multilingual output, RTL, clarification adaptation, reset, print, privacy copy, and no-store/discard metadata.
- Preserve all existing tests. Add tests; do not delete useful coverage.
- Avoid renaming stable components or broad refactors unless a tested compatibility layer is provided.
- If a public contract changes, explain why, prefer a backward-compatible migration, and update contract tests and documentation.

UX REQUIREMENTS

- Make the primary entry question exactly or equivalently: “What do you need to get done?”
- Place the free-form goal input before category and document choices. Categories remain secondary shortcuts.
- Allow a goal-only case with no document.
- Keep document input available as optional evidence, not a mandatory starting point.
- Show one deterministic clarification question at a time.
- Every question must explain briefly why the answer changes the route.
- Include an “I don't know” or equivalent answer wherever uncertainty is valid.
- Establish procedural warmth through calm, respectful, patient, direct wording and useful behavior, not chatty reassurance or an emotional assistant persona.
- Do not add routine acknowledgement copy before every question or result. Reserve acknowledgements for corrections, urgency, confusion, or major route changes.
- Let the user view an editable case summary and correct any previous answer without starting over.
- Recompute downstream profile sufficiency and route implications after corrections.
- Use a progress indicator based on meaningful states such as “Understanding your goal”, “Need one detail”, and “Route ready”. Do not display fake step totals or pretend the number of questions is known.
- Stop asking when enough route-changing information exists.
- Never show an endless conversation, generic chat bubbles, assistant persona, fake streaming, or agent theater.
- Keep English interface chrome, multilingual output, correct Arabic RTL, keyboard access, focus, labels, live status, safe errors, mobile layout, print behavior, and reset.

ARCHITECTURE REQUIREMENTS

- Create a central, strict `CaseProfile` schema representing at least: case ID, user goal, optional category, evidence/input references without retained sensitive content, known facts, user answers, uncertainties, output language, sufficiency state, asked-question history, correction history where useful, and timestamps/status metadata.
- Create typed supporting concepts such as `CaseGoal`, `CaseProfileField`, `CaseBuilderQuestion`, `CaseBuilderAnswer`, `ProfileSufficiency`, and `CaseBuilderState` as appropriate.
- Define deterministic profile sufficiency rules separately from UI components.
- Define a provider-independent Case Builder service contract that can later be implemented by OpenAI while mock mode remains available.
- Keep one normalized path from goal and optional evidence into the profile and final route. Do not build separate result UIs for goal-only and document cases.
- Extend existing `CaseInput`/server transport only as necessary. Keep backward compatibility for existing clients and tests.
- Keep the final route compatible with or deliberately evolve `CaseAnalysis`; document any migration.
- Keep deterministic mock scenarios and question selection outside components.
- Do not add a database or localStorage. Short-lived case state remains in memory.
- Treat the structured `CaseProfile` as the case's memory. Do not add embeddings or a vector database for the MVP.

IMPLEMENTATION TASKS

1. Inspect the current `/` and `/case` experience and choose the smallest coherent goal-first flow.
2. Add the primary free-form goal field with visible label, clear limits, whitespace normalization, plain-text rendering, validation, character count, and privacy copy.
3. Support goal-only submission through the existing secure server boundary.
4. Preserve optional paste, upload, image, sample, category, and language inputs.
5. Build a deterministic mock `CaseProfile` from the goal and optional context without claiming real understanding.
6. Implement a question policy that chooses exactly one unanswered route-changing question.
7. Include deterministic “I don't know” behavior and explicit uncertainty in the profile.
8. Implement sufficiency rules that stop questioning and permit a useful mock route.
9. Add an editable case-summary view with correction controls for goal, category, and previous answers.
10. Invalidate or recompute affected mock route fields when an answer is corrected.
11. Generate the final mock route from the `CaseProfile`, not from transient component state.
12. Keep the mock badge and honest statement that arbitrary goals/documents were not interpreted by AI.
13. Update status, loading, error, reset, cancellation, duplicate-request, print, and RTL behavior for the new flow.
14. Add only reusable components needed to keep the workspace understandable; avoid a monolith and avoid a crowded dashboard.

PRIVACY REQUIREMENTS

- Goals and evidence may be sensitive. Keep them in browser/request memory only and never log them.
- Do not persist goals, answers, profile content, or documents.
- Do not return original private input in error or metadata responses.
- Do not add analytics, tracking, error-reporting services, storage, or a third-party request.
- Preserve app-server validation and discard metadata.
- Keep the future real-provider consent message inactive.

LEGAL AND SAFETY RULES

- All routes remain clearly fictional mock demonstrations.
- Do not claim that a goal, document, eligibility condition, or deadline was truly understood or legally verified.
- Keep facts, interpretation, uncertainty, action, and source placeholders visually distinct.
- Ask only questions whose answers can change eligibility, documents, timing, sequence, risk, or route.
- If the user answers “I don't know”, surface the resulting uncertainty and safe verification/escalation step.
- Preserve prompt-injection protections even though no model call occurs.

TESTING

Keep all existing tests and add synthetic-only coverage for at least:

- primary goal input rendering and validation;
- goal normalization and maximum length;
- goal-only case creation;
- goal plus pasted text;
- goal plus PDF/image metadata path without parsing content;
- category remains optional;
- `CaseProfile` contract construction;
- deterministic first question;
- exactly one visible question at a time;
- every mock question has a route-impact reason;
- “I don't know” behavior;
- profile sufficiency stops questions;
- prevention of an endless question loop;
- procedural-warmth behavior, including no routine acknowledgements, no judgmental phrasing, and no repeated questions;
- editable summary and correction of previous answers;
- downstream recomputation after correction;
- final route derives from `CaseProfile`;
- duplicate/cancellation and typed-error regressions;
- existing file, sample, category, clarification, reset, print, multilingual, and Arabic RTL behavior.

Use only fictional and synthetic fixtures. Do not commit real goals, government letters, personal names, identifiers, passport data, or provider responses.

OUT OF SCOPE

- Real OpenAI calls or SDK installation.
- API billing or key setup.
- OCR or separate PDF extraction.
- Web search, official-source retrieval, or citation verification.
- Authentication, database, localStorage, cloud storage, analytics, tracking, payments, alerts, deployment, or a GitHub remote.
- A generic chatbot or free-form assistant conversation.
- Work from Phases 4 through 8.

MANDATORY DOCUMENTATION UPDATES

Update accurately:

- `README.md` with the goal-first mock workflow, `CaseProfile`, supported evidence, sufficiency behavior, privacy, and limitations;
- `docs/BUILD_LOG.md` with objective, clean starting hash, implementation, tests, gates, problems/fixes, Codex contribution, and next phase;
- `docs/DECISIONS.md` with goal-first, one-question, correction, and sufficiency decisions;
- `docs/ARCHITECTURE_DECISIONS.md` for the durable `CaseProfile` and Case Builder service boundary;
- `docs/DEMO_STORYBOARD.md` with the actual goal-first mock demo;
- `docs/SUBMISSION_CHECKLIST.md` only where evidence genuinely advances;
- `docs/PHASE_STATUS.md`, setting Phase 3 COMPLETE only after all work passes and following the canonical non-circular hash-recording rule in `AGENTS.md`.

Use `docs/PHASE_REPORT_TEMPLATE.md` to ensure evidence is complete.

QUALITY GATES

Run and pass:

- `npm run lint`
- `npm test`
- `npm run build`
- `npm audit`
- local HTTP checks for `/`, `/case`, category preselection, manifest, goal-only analysis success, representative invalid goal, existing sample, and representative file validation;
- relevant keyboard, focus, live-region, mobile, print, multilingual, RTL, privacy, and security checks.

If visual browser automation is unavailable, report it honestly and use component/integration/HTTP evidence without substituting an unauthorized browser surface.

GIT CHECKS

- Confirm the worktree was clean before Phase 3.
- Show status and diff summary before committing.
- Inspect the full staged file list and run `git diff --check`.
- Verify no secret, private goal, real document, personal information, API response, or unintended binary is tracked.
- Verify documentation and exact quality results.
- Create exactly one commit with this exact message:

feat: add guided case builder

- Report the full commit hash and final worktree status.

FINAL REPORT FORMAT

Return:

1. Goal-first workflow implemented
2. `CaseProfile` schema and service boundary
3. Clarification and sufficiency behavior
4. Editable summary and correction behavior
5. Existing document/category/language workflows preserved
6. Privacy and safety behavior
7. Tests added and total passing
8. Lint result
9. Build result
10. Audit result
11. HTTP/accessibility verification
12. Documentation updated
13. Dependencies changed
14. Commit hash
15. Warnings and limitations
16. Exact Phase 4 API-access action required

STOP CONDITION

Stop immediately after the Phase 3 commit and final report. Do not install the OpenAI SDK, check billing, request a key, verify a current model, make an OpenAI call, research sources, or begin any Phase 4 work. Phase 4 remains blocked until the user privately completes the API-access gate.
````

---

## Phase 4 — Real OpenAI multimodal and structured-output integration

Copy the complete prompt below only after the API-access gate is resolved.

````text
You are continuing BurgerMapper for OpenAI Build Week 2026.

PHASE

Phase 4 — Real OpenAI multimodal and structured-output integration

CURRENT STATUS ASSUMPTIONS

- Phases 0 through 3 are complete and committed with one coherent commit per phase.
- Phase 3 provides goal-first cases, a structured `CaseProfile`, deterministic one-question-at-a-time mock building, corrections, sufficiency rules, and final mock routes.
- Phase 2's secure multipart endpoint, normalized server inputs, signature validation, typed errors, in-memory discard behavior, future request planner, injection boundary, cancellation, and mock provider remain operational.
- `docs/PHASE_STATUS.md` records Phase 4 as `BLOCKED — PENDING API ACCESS` until the user privately resolves the gate.

API ACCESS CHECKPOINT — PERFORM BEFORE IMPLEMENTATION

Ask the user only to confirm that:

1. OpenAI API billing/project access is enabled; and
2. `OPENAI_API_KEY` has been configured privately in `.env.local`.

Never ask the user to paste or reveal the key. Never print, inspect, echo, validate by displaying, or commit its value. Check only whether the server environment reports a non-empty configuration.

If access is unavailable, do not install the SDK or change product code. Keep Phase 4 `BLOCKED — PENDING API ACCESS`, return a concise blocked report with the private setup action, and stop. Do not start Phase 5.

Once the user confirms access, deliberately change Phase 4 to `NOT STARTED`, then begin. Confirm a clean worktree and record the starting commit. Read `AGENTS.md`, `INSTRUCTIONS.md`, this entire prompt, current contracts/tests, and relevant version-specific Next.js documentation.

OBJECTIVE

Implement a server-only OpenAI Responses API provider for goal, pasted text, PDF, and image understanding. It must build and update `CaseProfile`, decide whether one more route-changing question is needed, and return strict schema-validated structured output while preserving the complete mock fallback.

OFFICIAL MODEL/API VERIFICATION

- Start with `gpt-5.6-luna` as the explicitly planned primary model and keep `OPENAI_MODEL` configurable.
- Before writing SDK payloads, use current official OpenAI developer documentation through the configured OpenAI docs skill/MCP. Verify that the exact `gpt-5.6-luna` identifier is available to the project and supports the required Responses API multimodal inputs, Structured Outputs, and reasoning controls. Do not silently choose a substitute if it is unavailable; stop and request an explicit model decision.
- Verify the current supported Responses API, multimodal `input_text`/`input_file`/`input_image` shapes, Structured Outputs method, file/image limits, detail controls, timeout/error guidance, and the exact supported reasoning-setting values.
- Use only official OpenAI documentation for these API facts. Do not rely on memory, old examples, or third-party tutorials.
- Record the verification date and direct official documentation links in the build log or architecture decision without copying excessive text.
- Keep `OPENAI_MODEL` configurable. Do not hard-code an unverified “latest” alias.
- Treat intake `low`, profile decisions `medium`, document analysis/research/routes `high`, and high-risk cases `xhigh` as planned values only until this verification succeeds. Record any supported-value difference and obtain a deliberate decision rather than inventing a mapping.

REGRESSION POLICY

- Preserve Phase 3 goal-first UX, `CaseProfile`, one-question policy, correction behavior, sufficiency rules, document support, categories, multilingual output, Arabic RTL, typed errors, reset, print, privacy copy, and route UI.
- Preserve Phase 2 validation, magic-byte checks, in-memory handling, no private-content logs, request IDs, no-store/discard metadata, cancellation, duplicate prevention, and prompt-injection boundary.
- Keep `ENABLE_MOCK_AI=true` fully operational without a key or network.
- Do not remove existing tests. Provider calls in automated tests must be mocked.
- Keep provider-specific types behind the server boundary and avoid exposing the SDK or secrets to client bundles.

UX REQUIREMENTS

- Continue with “What do you need to get done?” as the primary entry.
- Allow real goal-only, goal plus pasted message, PDF, PNG/JPEG/WebP, and trusted sample cases.
- Show clear consent immediately before a real analysis sends input from BurgerMapper to OpenAI.
- State what is sent, why, that OpenAI is the processor used for analysis, and the current retention limitation supported by verified configuration/documentation. Do not overpromise deletion.
- Keep one meaningful clarification question at a time and stop when the profile is sufficient.
- Apply procedural warmth: calm, respectful, patient, direct, and useful—not emotional, chatty, or overly reassuring. Accept “I don't know”, remember corrections, explain briefly why a question matters, and avoid repeated questions and judgmental language.
- Do not prepend acknowledgements routinely. Use them only for corrections, urgency, confusion, or major route changes.
- Separate extracted facts, model interpretation, uncertainty, requested action, and recommended route.
- Keep final routes factual and more serious than the conversational intake.
- Label real and mock modes unambiguously.
- Provide calm typed errors and retry choices; never display provider exceptions or raw responses.
- Preserve keyboard, focus, live-region, mobile, print, multilingual, and RTL behavior.

ARCHITECTURE REQUIREMENTS

- Install the official server-side OpenAI SDK only after the gate and official verification.
- Instantiate the OpenAI client only after explicit server configuration validation.
- Implement an `OpenAICaseBuilderProvider` (name may vary) behind the existing provider-independent service contract.
- Use the Responses API directly; do not add Anthropic, another AI provider, a local OCR engine, or a separate PDF text-extraction pipeline.
- Map normalized goal/text/sample to `input_text`, verified PDF to `input_file`, and verified image to `input_image` using the tested Phase 2 planner or a documented compatible evolution.
- Send optional category and output language as separate trusted application context.
- Preserve and strengthen the untrusted-document security instruction.
- Use Structured Outputs with strict schemas for clarification decisions, profile updates, extracted document facts, uncertainty, document interpretation, clarification options including “I don't know” where valid, sufficiency, and final `CaseAnalysis`/route.
- Validate every model response at runtime. Reject or safely repair only within bounded, tested rules; never trust TypeScript types alone.
- Use the structured `CaseProfile` as the only MVP case memory; do not add a vector database.
- Apply the verified task-specific reasoning level to each request. Do not request visible chain of thought or hidden reasoning; return only schema-defined decisions and concise user-facing rationale.
- Do not make a second call solely for tone polishing. Allow a separate structured verification pass only for a high-risk route, source conflict, suspected unsupported claim, or failed validation, and keep it bounded and testable.
- Keep original private input and full request plans out of responses and logs.
- Keep mock and real providers returning the same public contracts with honest `isMock`/processing metadata.

IMPLEMENTATION TASKS

1. Complete the API-access and official-documentation checkpoints.
2. Add the official OpenAI SDK and record version, reason, license, audit impact, and lockfile change.
3. Add strict server configuration for `OPENAI_API_KEY`, configurable `OPENAI_MODEL`, and provider selection. No `NEXT_PUBLIC` secret or model credential.
4. Evolve the request planner to verified SDK request types without exposing provider objects to the client.
5. Implement real goal-only and trusted-sample `input_text` analysis.
6. Implement real pasted-message `input_text` analysis.
7. Implement real PDF `input_file` and PNG/JPEG/WebP `input_image` analysis with verified detail/size constraints.
8. Implement structured profile extraction/update and a structured next-question-or-sufficient decision.
9. Implement structured final route generation after sufficient profile data.
10. Apply the verified task-specific reasoning configuration and record the mapping without requesting or retaining chain of thought.
11. Keep document facts, interpretation, missing information, and uncertainty distinct in contracts and UI.
12. Encode procedural warmth in the primary structured call and UI behavior; do not add a tone-polishing call.
13. Add the narrowly triggered, optional structured verification pass with explicit tests and request/cost ceilings.
14. Add explicit real-mode consent and ensure cancellation before/during the request is honored where technically possible.
15. Add bounded timeout, retry, backoff, and provider-error mapping. Do not blindly retry invalid input, permission, billing, or safety errors.
16. Enforce input size, output size, token/output limits, maximum clarification count, and per-case request ceilings for cost control.
17. Preserve mock fallback for development, demos, provider outage, or missing configuration as explicitly selected behavior; do not silently replace a requested real analysis with fictional output.
18. Keep raw provider responses, prompt content, goals, letters, documents, profile content, and hidden reasoning out of logs.

PRIVACY REQUIREMENTS

- Require explicit user consent before real third-party transfer.
- Send only the minimum goal, evidence, category context, language, and security instruction needed.
- Do not add database, filesystem, cloud storage, analytics, or content logging.
- Do not retain raw provider payloads/responses in code, tests, docs, screenshots, or error services.
- Keep request IDs content-free.
- Accurately document the difference between browser-to-BurgerMapper transfer, BurgerMapper-to-OpenAI transfer, application memory behavior, and any verified provider retention terms.
- Synthetic manual testing only; never send a real personal letter during development.

LEGAL AND SAFETY RULES

- The model may extract and interpret but must not claim legal certainty.
- Preserve prompt-injection controls: document instructions cannot override application rules, request tool use, reveal prompts, or trigger link following.
- Do not add web research or source verification in this phase.
- Official-source fields remain clearly unverified placeholders or absent until Phase 5.
- Surface uncertainty, unreadable content, conflicting dates, low confidence, and missing facts.
- Provide an escalation/safe-verification step for high-risk ambiguity.
- Never ask the model to reveal or provide hidden reasoning. Brief user-facing explanations must be generated as explicit structured fields, not chain of thought.

TESTING

All automated provider tests must use mocked transport—never spend API credit or require a key. Keep all existing tests and add at least:

- configuration selection for mock/real/missing key;
- no client-bundle secret access;
- verified request mapping for goal, text, PDF, and each image type;
- structured schema acceptance and rejection;
- malformed, partial, overlong, and adversarial model outputs;
- next-question versus sufficient decisions;
- correct Structured Outputs usage for clarification, profile update, document interpretation, and route schemas;
- verified reasoning selection by task class and safe handling when a requested value is unsupported;
- no requested/returned chain of thought and no second tone-polishing call;
- verification pass triggers only for high risk, source conflict, suspected unsupported claim, or failed validation;
- procedural warmth, correction handling, selective acknowledgements, and a more factual final-route tone;
- maximum-question and request ceilings;
- facts/interpretation/uncertainty separation;
- prompt-injection instruction presence and hostile document fixtures;
- timeout, abort, transient retry, non-retryable error, rate-limit, billing, authentication, and provider-outage mapping;
- mock fallback remains operational without a key;
- no original input or raw provider response in client/server errors;
- English, German, Arabic, RTL, corrections, print, reset, and existing file/category regressions.

After automated gates pass, perform at most one safe manual real request only if a key exists and the user has authorized normal API usage. Use the trusted fictional sample or synthetic goal, keep output out of Git/logs, record only pass/fail, model identifier, date, latency/cost metadata that contains no content, and limitations. If the request would incur unexpected cost or access fails, stop and report without repeated attempts.

OUT OF SCOPE

- Official-source web research, citations, allowlists, or legal-claim verification.
- Local OCR or separate PDF extraction.
- Database, login, localStorage, cloud document storage, analytics, tracking, payments, alerts, GitHub remote, deployment, YouTube, or Devpost.
- A generic chatbot, multiple simultaneous questions, or autonomous tool use.
- Vector-database memory, chain-of-thought collection, routine tone-polishing calls, or unconditional verification calls.
- Phases 5 through 8.

MANDATORY DOCUMENTATION UPDATES

Update accurately:

- `README.md` with real/mock configuration, private key setup without values, supported real inputs, consent, privacy, errors, limits, fallback, and limitations;
- `docs/BUILD_LOG.md` with the API gate, official docs/model verification links and date, implementation, dependency, tests, optional single manual test, problems/fixes, Codex contribution, and next phase;
- `docs/DECISIONS.md` with model/configuration, schemas, retry, consent, fallback, and cost-limit decisions;
- `docs/ARCHITECTURE_DECISIONS.md` with the real provider, verified Responses API mapping, structured validation, consent/transfer, and retry/fallback architecture;
- `docs/DEMO_STORYBOARD.md` with only actually working real analysis behavior;
- `docs/SUBMISSION_CHECKLIST.md` only for genuine progress;
- `docs/PHASE_STATUS.md` with Phase 4 COMPLETE only after completion, following the canonical non-circular hash-recording rule in `AGENTS.md`.

Use `docs/PHASE_REPORT_TEMPLATE.md`. Never record secret values, raw prompts, private inputs, or raw provider output.

QUALITY GATES

Run and pass:

- `npm run lint`
- `npm test`
- `npm run build`
- `npm audit`
- HTTP/API checks for mock success, typed configuration failure, mocked real success, mocked provider errors, cancellation, duplicate prevention, goal/text/sample/file routes, and no-store/discard metadata;
- client-bundle secret scan, dependency/license review, prompt-injection checks, schema validation, multilingual/RTL, accessibility, and privacy checks;
- at most one authorized synthetic manual real request when access exists.

GIT CHECKS

- Confirm a clean start and Phase 3 completion.
- Inspect status, diff summary, staged list, and `git diff --check`.
- Verify `.env.local` is ignored and no secret, private content, raw request/response, test output, or unintended binary is tracked.
- Verify mock mode passes with no key.
- Create exactly one commit with this exact message:

feat: integrate OpenAI case analysis

- Report the full hash and final worktree status.

FINAL REPORT FORMAT

Return:

1. API-access and official model verification
2. OpenAI SDK/provider implementation
3. Real goal, text, PDF, and image behavior
4. Structured schemas and validation
5. Next-question and sufficiency behavior
6. Prompt-injection and legal-safety controls
7. Consent, privacy, and retention behavior
8. Timeout, retry, cancellation, limits, and cost controls
9. Mock fallback
10. Tests and total passing
11. Lint result
12. Build result
13. Audit/dependency/license result
14. HTTP and optional manual real-test result
15. Documentation updated
16. Commit hash
17. Warnings and limitations
18. Exact recommended Phase 5 objective

STOP CONDITION

If API access is unavailable, stop as BLOCKED before implementation and do not create a false completion commit. If implemented, stop immediately after the exact Phase 4 commit and final report. Do not perform web research, verify government sources, create citations, or begin Phase 5.
````

---

## Phase 5 — Official-source research and cited personalized routes

Copy the complete prompt below into a fresh Codex session after Phase 4 is complete.

````text
You are continuing BurgerMapper for OpenAI Build Week 2026.

PHASE

Phase 5 — Official-source research and cited personalized routes

CURRENT STATUS ASSUMPTIONS

- Phases 0 through 4 are complete and committed.
- Goal-first cases, structured `CaseProfile`, real and mock providers, multimodal Responses API input, structured validation, one-question sufficiency behavior, consent, typed errors, and fallback work.
- Real analysis separates extracted facts, interpretation, and uncertainty but does not yet research or verify official sources.
- Current source entries are absent or explicitly unverified placeholders.
- `docs/PHASE_STATUS.md` marks Phase 5 NOT STARTED and Phase 4 COMPLETE.

Read `AGENTS.md`, `INSTRUCTIONS.md`, this entire prompt, status, source-related contracts, provider architecture, tests, and current official-source limitations. Confirm a clean worktree and record the starting commit.

OBJECTIVE

Add official-source research only after `CaseProfile` is sufficiently complete, then produce a cited personalized route whose changing factual claims are traceable to current official Berlin or German federal sources. The route must distinguish authoritative facts, service guidance, local practice, inference, conflict, and uncertainty.

REGRESSION POLICY

- Preserve goal-first and document workflows, profile correction, sufficiency, real/mock providers, consent, privacy, validation, multilingual output, Arabic RTL, cancellation, fallback, typed errors, reset, print, and existing tests.
- Do not research before the profile is sufficient.
- Do not allow source retrieval to change extracted document facts silently.
- Preserve the provider-independent `CaseAnalysis`/route UI; evolve source contracts compatibly and test migrations.
- Keep mock mode deterministic and usable without live research.

UX REQUIREMENTS

- Research begins only after the UI shows that the case profile is ready.
- Keep the route—not a list of search results—as the final product.
- Put deadline, urgency, and first recommended action near the top.
- Place citations beside the exact claim or step they support.
- Make source status understandable without legal jargon.
- Show when sources conflict, are stale, are incomplete, or apply only locally.
- Provide alternatives and escalation when official guidance cannot resolve the case.
- Keep source URLs LTR inside Arabic RTL output and ensure mixed-script layouts remain readable.
- Do not overload users with a research dashboard or raw snippets.

ARCHITECTURE REQUIREMENTS

- Add a server-side source-research service boundary invoked only for a sufficiently complete `CaseProfile`.
- Define a centralized official-domain allowlist. Start narrowly with directly relevant Berlin authority domains and German federal government domains; document every allowed domain and reason.
- Reject, quarantine, or clearly downgrade redirects and sources outside the allowlist.
- Extend `SourceReference` or a compatible source-evidence contract to include publisher, title, canonical URL, domain, access date/time, supported claim IDs, verification status, authority level/type, jurisdiction, and conflict status.
- Model claim-to-source relationships explicitly so citations cannot be decorative.
- Represent distinctions among law/regulation, official service guidance, local administrative practice, model inference, and unresolved uncertainty.
- Keep retrieved web content untrusted and preserve prompt-injection controls. Source pages cannot override application instructions or trigger actions.
- Separate source retrieval, source validation, claim synthesis, and route rendering for testability.
- Do not store full retrieved pages or private case content. Cache only if a later explicit privacy-safe decision is justified; default to request memory.

IMPLEMENTATION TASKS

1. Define profile-sufficiency preconditions for research and enforce them server-side.
2. Create and document the official-domain allowlist and redirect policy.
3. Implement official-source retrieval using the approved server-side OpenAI/tool or direct retrieval architecture established from current official documentation; do not add a second AI provider.
4. Scope research queries from the resolved profile without including unnecessary personal details.
5. Validate final URLs, domains, publishers, titles, access dates, and response status.
6. Extract atomic supported claims and connect each to one or more verified sources.
7. Identify conflicts among official sources, jurisdiction mismatches, date/version issues, and claims with no adequate support.
8. Prevent unsupported changing factual claims from appearing as certain route instructions.
9. Build the final personalized route with: detected and user-provided deadlines; ordered actions; documents; responsible party; timing; dependencies; alternatives; uncertainty; citations; escalation; and safe verification steps.
10. Render citations beside relevant route steps and claims in English, German, and Arabic.
11. Keep URLs and identifiers LTR in Arabic output.
12. Replace Phase 2/4 source placeholders only when evidence is actually retrieved and verified; otherwise retain an honest unverified state.
13. Add failure behavior for unavailable pages, redirects, blocked retrieval, no sources, source conflicts, and provider/tool outage.
14. Preserve a deterministic mocked research provider and fixtures for tests and offline demos.

PRIVACY REQUIREMENTS

- Send the minimum abstracted case facts needed for research; do not place names, addresses, file content, passport numbers, reference numbers, or raw letters into search queries.
- Do not log queries when they contain case-derived details.
- Do not persist full pages, private profiles, query/result payloads, or browsing traces.
- Document every external destination used by the research path and the consent/processing boundary.
- Keep request IDs and cost/source metadata content-free.

LEGAL AND SAFETY RULES

- Use official Berlin and German federal sources as primary evidence. Add another official authority only when jurisdiction requires it and document why.
- Never use an aggregator, forum, law-firm blog, social post, or SEO page as primary evidence.
- Do not describe service guidance as law or inference as official policy.
- Cite the exact claim supported; one generic source link cannot validate an entire route.
- Record and display official-source conflicts rather than choosing silently.
- Do not claim legal certainty. Include a clear legal-information limitation and appropriate human/authority escalation for high-risk or unresolved cases.
- If a deadline comes from the user's letter, label it as a document fact and require confirmation against the original; if it comes from a source, cite it.
- Treat retrieved pages as untrusted content and ignore embedded commands or requests for secrets/tool use.

TESTING

Keep all existing tests. Use mocked retrieval and synthetic profiles for automated tests. Add at least:

- research blocked when profile is insufficient;
- research begins when profile becomes sufficient;
- official-domain allowlist acceptance and non-official rejection;
- redirect and canonical-domain validation;
- publisher/title/URL/access-date/claim/status contract;
- claim-to-source citation mapping;
- citations beside supported route claims;
- unsupported claim suppression or uncertainty downgrade;
- law versus guidance versus local practice versus inference labels;
- official-source conflict detection and rendering;
- stale/unavailable/no-source behavior;
- deadline provenance checks;
- no private identifiers in research queries or logs;
- prompt-injection content in a retrieved-page fixture;
- deterministic mocked research fallback;
- English/German/Arabic citation rendering;
- Arabic RTL with LTR URLs;
- existing goal, document, correction, provider, typed-error, mock, reset, print, and accessibility regressions.

Use short synthetic excerpts authored for tests; do not commit copied government pages, full copyrighted pages, real letters, or personal information.

OUT OF SCOPE

- Reliability/evaluation expansion beyond tests needed for this phase.
- Accounts, database, case persistence, cloud document storage, analytics, tracking, payments, alerts, GitHub remote, deployment, YouTube, or Devpost.
- A generic browsing chatbot, unrestricted web search, non-official primary sources, or autonomous submission actions.
- Phases 6 through 8.

MANDATORY DOCUMENTATION UPDATES

Update accurately:

- `README.md` with research timing, official allowlist, citation semantics, privacy, source limitations, mocked/offline behavior, and testing;
- `docs/BUILD_LOG.md` with objective, starting hash, source architecture, allowlist, implementation, tests, quality results, problems/fixes, Codex contribution, and next phase;
- `docs/DECISIONS.md` with sufficiency-before-research, allowlist, conflict, claim-evidence, deadline-provenance, and privacy decisions;
- `docs/ARCHITECTURE_DECISIONS.md` with retrieval/validation/synthesis boundaries and source evidence model;
- `docs/DEMO_STORYBOARD.md` with the actually working cited-route flow;
- `docs/SUBMISSION_CHECKLIST.md` only where evidence advances;
- `docs/PHASE_STATUS.md` with Phase 5 COMPLETE only after completion, following the canonical non-circular hash-recording rule in `AGENTS.md`.

Use `docs/PHASE_REPORT_TEMPLATE.md` and include the allowlist and representative synthetic citation evidence without private content.

QUALITY GATES

Run and pass:

- `npm run lint`
- `npm test`
- `npm run build`
- `npm audit`
- local HTTP/API checks for insufficient profile, successful mocked/authorized official research, non-official rejection, no-source/conflict errors, cited route, and existing mock/real analysis;
- source allowlist, redirect, claim support, injection, privacy-query, multilingual, RTL/LTR URL, accessibility, print, and provider-fallback checks.

Do not depend on live web availability for automated tests. If a bounded live official-source check is needed, use only synthetic/non-private case context and record date/domain/status without copying full content.

GIT CHECKS

- Confirm clean start and Phase 4 completion.
- Inspect status, diff summary, staged list, and `git diff --check`.
- Verify no private case data, research query, downloaded page, raw tool/provider output, secret, or unintended binary is tracked.
- Verify source claims in documentation are evidence-backed and not invented.
- Create exactly one commit with this exact message:

feat: add official-source route research

- Report the full hash and final worktree status.

FINAL REPORT FORMAT

Return:

1. Research trigger and sufficiency gate
2. Official-domain allowlist
3. Retrieval and validation architecture
4. Source and claim contracts
5. Personalized cited-route behavior
6. Conflict, uncertainty, deadline, and escalation behavior
7. Privacy and injection controls
8. Multilingual and Arabic URL behavior
9. Tests and total passing
10. Lint result
11. Build result
12. Audit/dependency result
13. HTTP/source verification
14. Documentation updated
15. Commit hash
16. Warnings and limitations
17. Exact recommended Phase 6 objective

STOP CONDITION

Stop immediately after the Phase 5 commit and final report. Do not begin broad evaluation hardening, UX redesign, deployment, GitHub setup, or Phase 6 work.
````

---

## Phase 6 — Reliability, safety, evaluation, and cost controls

Copy the complete prompt below into a fresh Codex session after Phase 5 is complete.

````text
You are continuing BurgerMapper for OpenAI Build Week 2026.

PHASE

Phase 6 — Reliability, safety, evaluation, and cost controls

CURRENT STATUS ASSUMPTIONS

- Phases 0 through 5 are complete and committed.
- BurgerMapper supports goal-first case building, optional multimodal evidence, real/mock OpenAI-compatible providers, strict structured output, one route-changing question at a time, sufficiently complete `CaseProfile`, and official-source cited routes.
- Privacy, consent, in-memory processing, typed errors, mock fallback, prompt-injection controls, source allowlisting, citations, RTL, and existing automated tests work.
- `docs/PHASE_STATUS.md` marks Phase 6 NOT STARTED and Phase 5 COMPLETE.

Read `AGENTS.md`, `INSTRUCTIONS.md`, this full prompt, status, all provider/profile/source contracts, existing tests, security/privacy decisions, and current dependency/runtime configuration. Confirm a clean worktree and record the starting commit.

OBJECTIVE

Harden BurgerMapper into a release-candidate-quality system through representative synthetic evaluations, release-blocking safety criteria, provider-failure handling, abuse and cost controls, and documented security, privacy, performance, dependency, and accessibility reviews.

This phase prioritizes reliability evidence over new user-facing features.

REGRESSION POLICY

- Preserve every working goal, evidence, category, language, profile, question, correction, route, citation, consent, privacy, fallback, reset, print, and accessibility behavior.
- Do not change product behavior merely to make an evaluation pass; diagnose whether the prompt, schema, logic, source evidence, or expectation is wrong.
- Keep existing tests and add an evaluation layer without making the ordinary unit suite depend on live network or API credit.
- Any contract change must be safety-motivated, backward-compatible where practical, tested, and documented.

UX REQUIREMENTS

- Keep current UX stable except for improvements directly required by failure handling, safety, rate/cost limits, or accessibility findings.
- Errors must remain calm, specific, recoverable, and free of raw provider details.
- Provider outage or rate limiting must offer an honest retry or explicitly selected mock path, never silent fictional substitution.
- High-risk or insufficient cases must show clear uncertainty and escalation rather than a confident incomplete route.
- Do not add dashboards or expose internal evaluation/cost telemetry to ordinary users.

ARCHITECTURE REQUIREMENTS

- Create a synthetic evaluation framework that can run deterministically in CI/local development with mocked provider and retrieval transports.
- Define versioned evaluation case contracts and expected invariants rather than brittle full-string snapshots.
- Cover profile building, question selection, sufficiency, analysis, route construction, source evidence, multilingual layout, injection resistance, provider fallback, and cost/limit behavior.
- Create content-free operational metrics for request count, latency bands, input/output token or usage units, estimated/actual cost when the provider supplies it, retries, rate-limit events, and failure category. Do not retain goals, documents, prompts, model output, queries, or sources tied to a person.
- Add appropriate abuse protection for the anonymous endpoint. Prefer a minimal, documented mechanism compatible with the deployment target; do not claim distributed guarantees from an in-memory limiter.
- Define release-blocking criteria in code/docs with machine-checkable tests where possible.
- Keep security-sensitive controls server-side and preserve provider/source abstractions.

IMPLEMENTATION TASKS

1. Inventory current risk areas, failure modes, dependencies, endpoint limits, accessibility gaps, and provider/source costs.
2. Create a representative synthetic evaluation set containing routine, ambiguous, multilingual, missing-data, high-risk, and adversarial cases.
3. Add prompt-injection fixtures in goals, pasted text, PDF/image-derived content, and retrieved-source content.
4. Add Luna-specific question and tone evaluation: useful and route-changing questions, one at a time, understandable rationale, “I don't know” when valid, correction handling, no repeated or unnecessary questions, no false reassurance, and no robotic filler.
5. Add profile-completeness evaluation: required route facts, honest unknowns, correction propagation, and stop conditions.
6. Add route-completeness evaluation: first action, deadline provenance, documents, timing, sequence, alternatives, uncertainty, citations, and escalation.
7. Add citation validation: official allowlist, claim mapping, access date, verification state, URL validity, conflict handling, and no unsupported claims.
8. Add unsupported-claim detection and release-blocking examples.
9. Add deadline checks for impossible, past, conflicting, missing, document-derived, and source-derived dates.
10. Add English/German/Arabic content and RTL/mixed-URL structural checks.
11. Test provider outage, malformed output, timeout, abort, retry, rate limit, billing/authentication error, source outage, and safe mock fallback.
12. Add endpoint abuse protection, request ceilings, concurrency limits where appropriate, input/output/token budgets, and bounded retries.
13. Add cost/usage monitoring that stores or emits only aggregate/content-free measurements. If persistence would be required, keep it out of scope and document the limitation.
14. Run and document a security review: secrets, client bundles, injection, SSRF/URL allowlist, file validation, error exposure, dependencies, headers, and denial-of-service surfaces.
15. Run and document a privacy review: consent, data flow, retention claims, provider/source transfer, logs, platform caveats, and deletion/erasure limitations.
16. Run and document performance checks for initial page, case flow, representative API latency with mocks, large allowed input, and print/result rendering.
17. Run dependency audit and license review for direct production dependencies.
18. Run accessibility review covering keyboard, focus, names, status/errors, heading order, contrast, zoom/reflow, RTL, reduced motion, and print.
19. Define explicit release-blocking thresholds and make the phase fail when they are not met.
20. Evaluate `gpt-5.6-luna` structured-output validity, multilingual quality, latency, and cost by task class, using the verified reasoning settings and content-free measurements.

PRIVACY REQUIREMENTS

- Evaluation fixtures must be wholly synthetic and contain no real person, letter, API response, search history, or production log.
- Do not persist private content for debugging or evaluation.
- Telemetry/cost records must be content-free and should not permit reconstruction of a case.
- Do not add third-party analytics or error-reporting services.
- Verify privacy copy against actual OpenAI, source-retrieval, application, and deployment behavior known at this phase.
- Document limits of in-memory discard and infrastructure/platform logging without making unsupported guarantees.

LEGAL AND SAFETY RULES

- High-risk cases, unsupported claims, missing citations, wrong jurisdiction, and unresolved source conflicts must be release-blocking or visibly escalated.
- Do not optimize evaluation pass rate by suppressing uncertainty.
- Do not treat model confidence as legal evidence.
- Ensure every changing factual claim used for action has appropriate official support or is marked uncertain/inference.
- Injection fixtures must verify that untrusted content cannot reveal prompts, broaden tools/domains, follow commands, or override route rules.

TESTING AND EVALUATION

Keep all existing tests. Add a documented command or commands for the evaluation suite and cover at least:

- routine successful goal-only and document cases;
- ambiguous goals and documents;
- English, German, and Arabic inputs/outputs;
- missing data and “I don't know”;
- high-risk immigration, housing, health, family, and deadline scenarios using fictional facts;
- malicious document/source instructions;
- irrelevant or repeated clarification questions;
- useful-question rate, unnecessary-question rate, correction handling, false reassurance, and robotic filler;
- insufficient and sufficient profiles;
- corrections and invalidated downstream answers;
- complete/incomplete routes;
- citation correctness and unsupported claims;
- deadline provenance and calculation invariants;
- RTL and LTR URLs;
- provider/source outage and fallback;
- timeouts, aborts, rate limits, duplicate/concurrent requests, abuse limits, and cost ceilings;
- client secret scan and no private-content logging;
- Structured Outputs validity for clarification, profile-update, document-interpretation, route, and optional verification schemas;
- Luna multilingual quality plus latency and cost across intake, profile, document/research/route, and high-risk task classes;
- dependency/license and accessibility checks suitable for automation.

Do not make routine tests call live providers or the web. If an optional bounded live smoke test is retained, gate it explicitly, use only synthetic input, limit cost, and exclude output from Git/logs.

RELEASE-BLOCKING CRITERIA

Define exact measurable criteria before marking Phase 6 complete. At minimum block release for:

- any secret exposure or private-content logging;
- any test/evaluation failure in critical workflows;
- unsupported high-impact claim presented as certain;
- missing or non-official primary citation for a changing route claim;
- failure to stop asking questions;
- repeated/unnecessary questions, ignored corrections, false reassurance, or robotic filler above the documented Luna evaluation thresholds;
- structured-output validity, multilingual quality, latency, or cost outside documented release thresholds;
- route missing a known deadline or first action;
- broken Arabic RTL/URL behavior;
- provider outage without safe recovery;
- bypassed input, domain, request, or cost limits;
- high/critical audit vulnerability without an accepted documented mitigation;
- critical keyboard, focus, label, or error-announcement barrier.

OUT OF SCOPE

- Broad visual redesign or marketing polish.
- New bureaucracy categories or major product features.
- Accounts, database, private-content analytics, cloud document storage, payments, alerts, GitHub remote, deployment, YouTube, or Devpost.
- Phases 7 and 8.

MANDATORY DOCUMENTATION UPDATES

Update accurately:

- `README.md` with evaluation commands, reliability/fallback/limit behavior, privacy, and current limitations;
- `docs/BUILD_LOG.md` with objective, starting hash, evaluation set, controls, reviews, exact results, problems/fixes, Codex contribution, and next phase;
- `docs/DECISIONS.md` with evaluation invariants, abuse protection, cost metadata, retry/fallback, and release-blocker decisions;
- `docs/ARCHITECTURE_DECISIONS.md` when adding evaluation, limiter, or operational-metadata boundaries;
- `docs/DEMO_STORYBOARD.md` only for behavior that remains demonstrable;
- `docs/SUBMISSION_CHECKLIST.md` for genuine testing/license progress only;
- `docs/PHASE_STATUS.md` with Phase 6 COMPLETE only after completion, following the canonical non-circular hash-recording rule in `AGENTS.md`.

Create a focused evaluation/reliability report under `docs/` if useful; link it from the README/build log. Use `docs/PHASE_REPORT_TEMPLATE.md`.

QUALITY GATES

Run and pass:

- `npm run lint`
- `npm test`
- the new complete evaluation command(s)
- `npm run build`
- `npm audit`
- HTTP/API integration checks for critical success/error/fallback/limit paths;
- documented security, privacy, performance, dependency/license, accessibility, multilingual, and RTL reviews;
- all defined release-blocking criteria.

GIT CHECKS

- Confirm clean start and Phase 5 completion.
- Inspect status, diff summary, staged list, and `git diff --check`.
- Verify only synthetic fixtures are tracked and no secrets, private cases, raw responses, logs, reports with content, or large unintended artifacts exist.
- Verify exact evaluation and audit results in documentation.
- Create exactly one commit with this exact message:

test: harden BurgerMapper reliability

- Report the full hash and final worktree status.

FINAL REPORT FORMAT

Return:

1. Evaluation framework and synthetic case set
2. Question/profile/route evaluation results
3. Citation, claim, and deadline validation
4. Injection and adversarial results
5. Provider/source outage and fallback behavior
6. Abuse, rate, token, and cost controls
7. Security and privacy review
8. Performance, dependency, and license review
9. Accessibility and RTL review
10. Release-blocking criteria and result
11. Tests/evaluations and totals
12. Lint result
13. Build result
14. Audit result
15. HTTP verification
16. Documentation updated
17. Commit hash
18. Warnings and limitations
19. Exact recommended Phase 7 objective

STOP CONDITION

Stop immediately after the Phase 6 commit and final report. Do not redesign screens, deploy, configure GitHub/Vercel, create submission content, or begin Phase 7.
````

---

## Phase 7 — Final user-experience and accessibility polish

Copy the complete prompt below into a fresh Codex session after Phase 6 is complete.

````text
You are continuing BurgerMapper for OpenAI Build Week 2026.

PHASE

Phase 7 — Final user-experience and accessibility polish

CURRENT STATUS ASSUMPTIONS

- Phases 0 through 6 are complete and committed.
- Goal-first case building, optional multimodal evidence, real/mock analysis, structured profile, route-changing clarification, corrections, sufficiency, official cited routes, reliability evaluations, abuse/cost controls, and release-blocking criteria work.
- The current application is technically complete but has not received final end-to-end UX and accessibility simplification.
- `docs/PHASE_STATUS.md` marks Phase 7 NOT STARTED and Phase 6 COMPLETE.

Read `AGENTS.md`, `INSTRUCTIONS.md`, this entire prompt, phase status, current screens/components/styles/copy, accessibility and reliability reports, demo storyboard, and relevant version-specific Next.js guidance. Confirm a clean worktree and record the starting commit.

OBJECTIVE

Polish and simplify the complete BurgerMapper experience so a stressed newcomer understands the homepage within seconds, can start with a free-form goal, provide optional evidence without confusion, answer one useful question, and act on a calm cited route across mobile, desktop, English, German, and Arabic.

Reliability and clarity outrank visual novelty. Remove or simplify features when that produces a safer, easier product.

REGRESSION POLICY

- Preserve every validated domain, provider, source, privacy, consent, security, evaluation, limit, and fallback behavior.
- Preserve all tests and release-blocking criteria.
- Do not change legal/source semantics merely for visual simplification.
- Avoid architecture refactors unless required for accessibility or maintainability and fully tested.
- Keep mock and real workflows, all inputs, categories, profile correction, route, citations, errors, reset, print, and PWA metadata working.

UX REQUIREMENTS

- The homepage must communicate within seconds: what BurgerMapper does, that users can describe a goal without terminology, and the primary next action.
- Free-form “What do you need to get done?” is the primary action.
- Six categories are visible but clearly secondary orientation shortcuts.
- Use progressive disclosure. Do not show a crowded dashboard or all controls at once.
- Clearly distinguish goal, paste, PDF upload, image upload, and trusted sample without implying they are separate products.
- Keep category optional and prevent it from implying eligibility.
- Make the current case summary and correction controls easy to find but not dominant.
- Show one clarification question at a time with why it matters and “I don't know” where valid.
- Put the deadline/urgency and first action at the top of results.
- Present the rest of the route in a stress-friendly sequence with documents, timing, alternatives, uncertainty, citations, and escalation.
- Never imply BurgerMapper is an official government service. Use no official logo, seal, eagle, authority branding, or misleading color/copy treatment.
- Avoid chat bubbles, assistant avatars, fake typing/streaming, excessive animation, decorative gradients, and agent theater.

ARCHITECTURE REQUIREMENTS

- Keep business rules, profile sufficiency, source evidence, and provider behavior outside visual components.
- Reuse or simplify components; do not create a second workflow.
- Preserve semantic HTML and print-specific structure.
- Implement a practical privacy-preserving route export. Prefer browser-side print/download of the already rendered structured route; do not upload or persist the case for export.
- Review PWA metadata, icons, installability foundations, theme/background colors, and offline claims. Do not claim offline analysis if it does not exist.
- Add an accessibility testing dependency only if small, justified, maintained, and license/audit reviewed.

IMPLEMENTATION TASKS

1. Inspect every screen and state: landing, category preselection, goal-only, paste, PDF/image, sample, profile summary, clarification, sufficient profile, loading, consent, success route, sources, errors, outage/fallback, empty, reset, print, and export.
2. Simplify homepage hierarchy and copy so the value proposition and primary goal action are immediate.
3. Make categories secondary while keeping all six discoverable.
4. Apply progressive disclosure to optional evidence, language, category, and advanced context.
5. Clarify differences among goal, pasted message, document/image upload, and sample.
6. Simplify the Case Builder state and summary without hiding corrections or uncertainty.
7. Put deadline/urgency and first action above long summaries in results.
8. Refine route typography, spacing, action grouping, documents, alternatives, citations, limitation, and escalation for stressed reading.
9. Review and refine English interface copy. Review generated/demo English, German, and Arabic copy for layout and obvious consistency; do not invent machine translations when provider output is dynamic.
10. Review Arabic RTL and mixed URLs, dates, identifiers, numerals, badges, timelines, and print/export.
11. Complete keyboard order, focus visibility/restoration, skip/navigation semantics, labels, descriptions, headings, landmarks, status/live regions, errors, dialogs/consent, and disabled/busy behavior.
12. Review contrast, zoom/reflow, reduced motion, touch targets, readable line lengths, and information not conveyed by color alone.
13. Test and refine at 320 CSS pixels and representative mobile/tablet/desktop widths.
14. Review print output and implement practical route export with privacy disclosure.
15. Review PWA manifest/metadata and remove inaccurate install/offline claims.
16. Ensure the trusted sample is judge-friendly, deterministic, fictional, and demonstrates the core route in under three minutes.
17. Remove redundant copy, controls, or decorative elements when usability improves.
18. Keep a visible non-government/legal-information identity and honest source/AI status.

PRIVACY REQUIREMENTS

- Export must happen locally from already available structured data and must not create server/cloud persistence.
- Do not add analytics, session replay, tracking, remote fonts/assets, or error-reporting services.
- Keep consent and transfer copy accurate but concise.
- Do not expose private input in page titles, URLs, query strings, analytics-like metadata, filenames generated from personal data, or screenshots.
- Use only the trusted fictional sample for visual/demo artifacts.

LEGAL AND SAFETY RULES

- Preserve legal-information disclaimer, uncertainty, source statuses, conflicts, and escalation.
- Do not simplify away evidence or make unverified claims look verified.
- Do not use official government branding or wording that suggests authority approval.
- Keep document facts, user answers, model interpretation, official evidence, and recommendations distinguishable.
- High-risk routes must remain calm but appropriately urgent.

TESTING AND REVIEW

Keep all existing tests/evaluations. Add or update coverage for at least:

- homepage primary goal hierarchy and six secondary categories;
- progressive disclosure and input-method clarity;
- goal-only and each evidence mode;
- correction and one-question behavior;
- deadline and first action order;
- keyboard-only completion of the core sample flow;
- focus movement/restoration, names, descriptions, errors, live regions, consent, and busy states;
- 320px reflow and no horizontal overflow;
- desktop layout;
- English/German/Arabic route rendering;
- Arabic RTL with mixed LTR URLs/dates/identifiers;
- contrast and non-color status cues where automated checks are practical;
- reduced motion;
- print and export content/order/privacy;
- PWA manifest/metadata;
- mock/real/fallback/source/reliability regressions;
- no official-government visual implication.

Perform visual inspection with the in-app browser when available, at 320px mobile and representative desktop sizes. Use DOM/accessibility snapshots and screenshots only with the fictional sample. If unavailable, report the limitation and rely on component, accessibility, CSS/reflow, print, and HTTP evidence without using an unauthorized browser controller.

OUT OF SCOPE

- New bureaucracy categories, new agent capabilities, new source providers, or major backend architecture.
- Authentication, database, cloud case storage, analytics, tracking, payments, alerts, GitHub remote, production deployment, YouTube, or Devpost.
- Marketing-site expansion beyond what clarifies the product.
- Phase 8 work.

MANDATORY DOCUMENTATION UPDATES

Update accurately:

- `README.md` with final local UX, accessibility, export, PWA behavior, testing, privacy, and limitations;
- `docs/BUILD_LOG.md` with objective, starting hash, screen audit, simplifications/removals, accessibility/mobile/RTL/print/export checks, exact gates, problems/fixes, Codex contribution, and next phase;
- `docs/DECISIONS.md` with hierarchy, progressive disclosure, export, removals, and non-government identity decisions;
- `docs/ARCHITECTURE_DECISIONS.md` only if export/PWA/component architecture changes durably;
- `docs/DEMO_STORYBOARD.md` as the actual three-minute product flow, still a draft until final capture;
- `docs/SUBMISSION_CHECKLIST.md` only for genuinely completed accessibility/testing/demo-readiness items;
- `docs/PHASE_STATUS.md` with Phase 7 COMPLETE only after completion, following the canonical non-circular hash-recording rule in `AGENTS.md`.

Use `docs/PHASE_REPORT_TEMPLATE.md` and record visual-browser availability honestly.

QUALITY GATES

Run and pass:

- `npm run lint`
- `npm test`
- all Phase 6 evaluation commands/release blockers
- `npm run build`
- `npm audit`
- local HTTP/API checks for all routes and representative modes/errors;
- 320px mobile, desktop, keyboard, focus, labels, errors, loading, empty, print/export, PWA, multilingual, Arabic RTL/mixed URL, contrast/reflow, privacy, and non-government-identity checks.

GIT CHECKS

- Confirm clean start and Phase 6 completion.
- Inspect status, diff summary, staged list, and `git diff --check`.
- Verify no private screenshot, real document, generated case export, secret, raw provider response, or unintended binary is tracked. If screenshots are deliberately added for documentation, use only the fictional sample, justify each, and review metadata.
- Verify documentation matches actual screens.
- Create exactly one commit with this exact message:

feat: polish the BurgerMapper experience

- Report the full hash and final worktree status.

FINAL REPORT FORMAT

Return:

1. Homepage and goal-first improvements
2. Case intake and progressive disclosure
3. Case Builder/clarification/correction polish
4. Result route, deadline, and first-action improvements
5. Mobile and desktop review
6. English/German/Arabic and RTL review
7. Keyboard and accessibility review
8. Loading/error/empty/reset review
9. Print, export, and PWA review
10. Simplifications or removals
11. Privacy/legal/non-government safeguards
12. Tests/evaluations and totals
13. Lint result
14. Build result
15. Audit result
16. HTTP/visual verification
17. Documentation updated
18. Dependencies changed
19. Commit hash
20. Warnings and limitations
21. Exact Phase 8 external checkpoints required

STOP CONDITION

Stop immediately after the Phase 7 commit and final report. Do not authenticate GitHub or Vercel, create a remote, deploy, configure production secrets, capture/upload the final video, submit Devpost, or begin Phase 8.
````

---

## Phase 8 — GitHub, deployment, release candidate, and submission handoff

Copy the complete prompt below into a fresh Codex session after Phase 7 is complete. Expect pauses at external-action gates.

````text
You are continuing BurgerMapper for OpenAI Build Week 2026.

PHASE

Phase 8 — GitHub, deployment, release candidate, and submission handoff

CURRENT STATUS ASSUMPTIONS

- Phases 0 through 7 are complete and committed with preserved Build Week history.
- The application is goal-first, multimodal, real/mock OpenAI-backed, structured, source-cited, evaluated, hardened, accessible, multilingual, polished, and locally release-ready.
- Release-blocking criteria pass locally.
- No GitHub remote or Vercel deployment should be assumed.
- `docs/PHASE_STATUS.md` marks Phase 8 NOT STARTED and Phase 7 COMPLETE.

Read `AGENTS.md`, `INSTRUCTIONS.md`, this entire prompt, phase status, `docs/FINAL_HANDOFF_CHECKLIST.md`, all submission/provenance docs, README, package/dependency metadata, environment templates, Git history, evaluation results, and current official deployment guidance as needed. Confirm a clean worktree and record the starting commit.

OBJECTIVE

Produce a working, deployed, documented release candidate with preserved repository evidence and a complete handoff package. Stop before YouTube upload, Devpost submission, official-rule/application writing, or any invented link/ID.

EXTERNAL ACTION GATES

This phase may pause and resume. Stop cleanly at each unresolved gate. Never request a password, token, API key, or secret value in conversation.

1. GITHUB AUTHENTICATION GATE
   - Check whether GitHub CLI is installed and authenticated without exposing tokens.
   - If not authenticated, ask the user to authenticate privately and confirm completion; then stop.

2. REPOSITORY OWNERSHIP/VISIBILITY GATE
   - Ask the user to confirm the GitHub owner and whether the repository must be public or private.
   - If private, require an explicit judge-access plan.
   - Do not guess ownership, create a repository, or change visibility before authorization.

3. VERCEL AUTHENTICATION GATE
   - Check authentication without exposing credentials.
   - If missing, ask the user to authenticate privately and confirm; then stop.

4. PRODUCTION ENVIRONMENT GATE
   - Ask the user to configure required production variables privately in the authorized Vercel project.
   - Never print, retrieve, paste, echo, or commit values.
   - Confirm only variable names/presence and environment scope.

5. CODEX `/feedback` GATE
   - Leave a placeholder. The user runs `/feedback` and later supplies only the Session ID.

6. YOUTUBE AND DEVPOST GATES
   - Do not upload video or submit Devpost. Leave verified placeholders and handoff instructions.

If an unresolved gate prevents useful work, report the exact non-secret action, leave status precise, and stop without fabricating completion.

REGRESSION POLICY

- Preserve all local functionality, tests, evaluations, privacy, consent, provider/source behavior, accessibility, multilingual/RTL, mock fallback, and release blockers.
- Preserve every existing phase commit. Do not squash, rebase, amend, filter, or force-push Build Week evidence.
- Do not change repository visibility, remote, deployment ownership, domains, or production variables without explicit authorization.
- Use only fictional sample data for live testing.

UX REQUIREMENTS

- Deployment must present the same polished goal-first experience verified in Phase 7.
- Homepage, sample, real/mock status, privacy consent, route, citations, Arabic RTL, mobile, print/export, errors, and fallback must remain clear in production.
- No production screen may imply official government affiliation.
- Do not add submission marketing that weakens product clarity or legal limitations.

ARCHITECTURE AND RELEASE REQUIREMENTS

- Perform a complete repository inspection before external setup.
- Verify environment separation, server-only secrets, production provider selection, deployment runtime/file limits, security headers where configured, and no accidental mock/real mismatch.
- Review direct/transitive dependencies, audit, direct dependency licenses, build output, PWA metadata, and deployment compatibility.
- Use the existing Git history and one authorized remote.
- Deploy to the user-authorized Vercel project/owner.
- Do not enable persistent document logging, analytics, or storage during deployment.
- Update release documentation with only verified repository/deployment URLs and behavior.

IMPLEMENTATION TASKS

1. Inspect the full repository tree, Git status/history/tags/remotes, package scripts, environment handling, docs, tests, evaluation reports, assets, ignores, and licenses.
2. Verify no real prototype code, secret, private document, personal information, provider response, research cache, debug log, local environment file, or generated export is tracked.
3. Complete README: product, goal-first workflow, inputs, languages, route, architecture, OpenAI/Codex usage, setup, environment names without values, mock mode, tests/evaluations, privacy/security, official-source behavior, accessibility, known limitations, provenance, repository/deployment/video/feedback placeholders.
4. Review and update prior-work disclosure without weakening the existing truth: concept and earlier prototype predated Build Week; no prior code is included; this repository implementation is traceable through commits and Codex evidence.
5. Complete Codex collaboration explanation with phase-specific evidence; mention `gpt-5.6-luna` only if it was actually used and evidenced.
6. Complete architecture/setup/privacy/security/limitations/dependency/license documentation.
7. Resolve the GitHub gates, then create or connect the authorized repository without rewriting history. Push the full branch/history using normal non-force Git operations.
8. Resolve repository visibility/judge access and record only verified settings.
9. Resolve Vercel gates, link the authorized project, and configure production variable names/presence privately. Never display values.
10. Deploy a production release candidate. Record the verified URL only after success.
11. Run live smoke tests for landing, category link, goal-only, trusted sample, paste, synthetic PDF/image boundary, one clarification, correction, cited route, English/German/Arabic, RTL/mixed URLs, mobile, desktop, print/export, representative validation, provider error/fallback, privacy/consent, and non-government identity.
12. Use no private production test documents. Use the trusted sample and small synthetic generated-in-memory requests only; do not commit test binaries.
13. Verify production provider configuration and cost/abuse limits without exposing values or raw output.
14. Update `docs/FINAL_HANDOFF_CHECKLIST.md` with verified release artifacts and leave user-owned submission placeholders unfilled.
15. Create a final release report and a concise known-limitations section.
16. Create a final demo-capture checklist, not the final script: exact product states to capture, backup flow, fictional input, privacy, citations, Arabic, and time-budget checkpoints.
17. Prepare the return-to-ChatGPT handoff for rule verification, category decision, writing, video, screenshots, attribution explanations, prior-work review, and compliance review.
18. Do not upload to YouTube, submit Devpost, choose a competition category, invent application answers, or fabricate links/IDs.

PRIVACY REQUIREMENTS

- Production tests use only fictional/synthetic data.
- Do not inspect or expose production secret values.
- Verify no platform or application setting intentionally records document, goal, prompt, model output, or route content.
- Document actual production data flow, provider/source destinations, retention limitations, request metadata, and no-persistence behavior.
- Do not add analytics, tracking, session replay, or error-reporting services during release unless a prior completed phase explicitly approved them (the current plan does not).

LEGAL AND SAFETY RULES

- Preserve non-government identity, legal-information disclaimer, uncertainty, citations, conflicts, and escalation.
- Verify official-source links in the live route behave safely and remain LTR in Arabic.
- Do not claim competition compliance, official endorsement, production-grade legal advice, or perfect accuracy.
- Known limitations must be visible, specific, and consistent across README, app, demo checklist, and handoff.

TESTING AND RELEASE VERIFICATION

Run all existing unit, integration, evaluation, accessibility, security, privacy, and release-blocking checks locally before deployment. Then run:

- production build and local production-start smoke where practical;
- live deployment smoke for `/`, `/case`, category preselection, manifest, API success/error, goal-only, sample, synthetic multimodal boundary, real/mock selection, provider/source failure, and no-store/privacy headers;
- mobile 320px and representative desktop visual checks;
- keyboard/focus/error/loading/consent checks;
- English/German/Arabic and RTL/LTR URL checks;
- print/export and PWA checks;
- repository public/private judge-access verification;
- production secret-name/presence check without values;
- dependency audit and license review;
- live URL and GitHub URL verification.

Never run a live test with a real personal letter. Keep raw production/API output out of files, logs, screenshots, docs, and Git.

OUT OF SCOPE

- YouTube upload.
- Devpost submission.
- Current competition-rule interpretation, category selection, application answers, project-description writing, final video script, final screenshots, or marketing copy beyond placeholders/checklists.
- Invented repository/deployment/video URLs or `/feedback` IDs.
- New product features, accounts, database, payments, alerts, or private-content analytics.
- History rewriting or force push.

MANDATORY DOCUMENTATION UPDATES

Update accurately:

- `README.md` to release-candidate quality with verified repository/deployment placeholders or URLs, setup, architecture, tests, privacy/security, limitations, provenance, and collaboration;
- `docs/BUILD_LOG.md` with objective, starting hash, inspections, external gates, repository/deployment actions, live checks, exact gates, problems/fixes, Codex contribution, and autonomous stop;
- `docs/DECISIONS.md` with repository visibility, deployment ownership/runtime/configuration, and release choices when authorized;
- `docs/ARCHITECTURE_DECISIONS.md` for durable deployment/runtime/environment decisions;
- `docs/DEMO_STORYBOARD.md` as the verified capture-ready sequence while leaving final script wording to ChatGPT/user;
- `docs/SUBMISSION_CHECKLIST.md` with only genuinely completed release items;
- `docs/PHASE_STATUS.md` with Phase 8 COMPLETE only after the working deployment and handoff exist, following the canonical non-circular hash-recording rule in `AGENTS.md`;
- `docs/FINAL_HANDOFF_CHECKLIST.md` with verified artifacts and unresolved user actions.

Use `docs/PHASE_REPORT_TEMPLATE.md`. Do not mark YouTube, Devpost, `/feedback`, category, official-rule verification, or unprovided URLs complete.

QUALITY GATES

Run and pass:

- `npm run lint`
- `npm test`
- all evaluation/release-blocker commands
- `npm run build`
- `npm audit`
- local production and live HTTP/API checks;
- live mobile/desktop/accessibility/multilingual/RTL/print/PWA/error/fallback/privacy/security smoke;
- repository/history/access, dependency/license, environment-name/presence, URL, and documentation consistency checks.

GIT CHECKS

- Confirm clean start and Phase 7 completion.
- Preserve all history; no squash, amend of completed phases, rebase, reset, filter, force push, or secret history rewrite should be needed because secrets must never be staged.
- Before the release commit, show status, diff summary, staged list, `git diff --check`, remote, and recent history.
- Verify no secret, `.env.local`, private file, real production response, deployment cache, Vercel state containing credentials, screenshot with private data, or unintended binary is tracked.
- Create exactly one Phase 8 commit with this exact message after documentation contains verified release information:

chore: prepare Build Week release candidate

- Push normally to the authorized remote if approved.
- Report the full hash, remote branch state, deployment URL, and clean worktree.

FINAL REPORT FORMAT

Return:

1. Repository inspection and history preservation
2. README/provenance/collaboration completion
3. Dependency, license, privacy, and security review
4. GitHub authentication/owner/remote status
5. Repository visibility and judge-access status
6. Vercel authentication/project status
7. Production environment-variable presence status without values
8. Deployment URL and result
9. Live smoke, mobile, multilingual, sample, and error results
10. Evaluation, lint, tests, build, and audit results
11. Documentation and final handoff updated
12. Release-candidate commit hash and remote state
13. Final known limitations
14. Demo-capture checklist status
15. Unresolved external placeholders: category, video URL, `/feedback` Session ID, and Devpost
16. Exact return-to-ChatGPT task list
17. Autonomous development stop confirmation

STOP CONDITION

Stop when—and only when—a working, deployed, documented release candidate and final handoff package exist, or when an external gate prevents further authorized work. Do not upload YouTube video, submit Devpost, invent links/IDs, choose the category, write final application answers, or continue beyond the release-candidate handoff.
````

---

## End of autonomous product development

Phase 8 is the final autonomous repository phase. After it, use `docs/FINAL_HANDOFF_CHECKLIST.md` and return to ChatGPT for current-rule verification and submission preparation. Do not create a Phase 9 automatically.
