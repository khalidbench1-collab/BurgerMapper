# Initial decisions

These decisions define the starting constraints for BurgerMapper. They can change only when later evidence or requirements justify a documented revision.

| Decision | Reason |
| --- | --- |
| Build a web app rather than a native mobile app | A responsive web app is faster to distribute, test, and demonstrate during the hackathon without app-store review. |
| Use a mobile-first, PWA-ready architecture | People may need help while handling a letter away from a desktop; responsive foundations and web app metadata preserve a path to an app-like experience. |
| Keep the MVP anonymous | Removing accounts reduces friction, implementation scope, and the amount of sensitive personal data the project must retain. |
| Use English for the interface | English is the primary interface language for the initial audience and submission, while keeping the navigation experience consistent. |
| Support English, German, and Arabic generated output | These languages cover the initial accessibility goal: English guidance, the source-system language, and an important community language in Berlin. |
| Make official-letter analysis the flagship workflow | Starting from a real letter gives the product a concrete input and lets it identify actionable deadlines, requests, and next steps. |
| Accept PDF and image uploads | Official correspondence arrives digitally and on paper, so both document formats are necessary for the intended workflow. |
| Use the OpenAI API only | One AI platform keeps the architecture coherent and follows the Build Week technical direction; no other AI provider will be integrated. |
| Make API calls server-side only | Server-side calls keep credentials out of browser code and provide a controlled boundary for document processing. |
| Require official government sources for changing factual claims | Administrative facts, requirements, and deadlines can change; official sources provide the strongest basis for route guidance and citations. |
| Target Vercel for deployment | Vercel is a natural operational fit for the Next.js App Router and supports a fast hackathon deployment path. |
| Use no database initially | The anonymous first MVP can process a session without persistent application data, reducing scope and privacy risk until persistence is clearly justified. |

## Phase 1 implementation decisions

| Decision | Reason |
| --- | --- |
| Keep selected files only in browser memory | Phase 1 needs to demonstrate intake without transmitting or persisting sensitive documents. React state drops the `File` object on removal, start-over, refresh, or tab close. |
| Make the mock service return the future AI output contract | UI components consume a provider-independent `CaseAnalysis`, so a later server-side OpenAI service can replace the mock implementation without redesigning the result interface. |
| Show one clarification question before route confirmation | Employment status changes the correct income-evidence step in the fictional scenario. Asking only this question demonstrates the rule that a question must materially change the route. |
| Exclude OCR and PDF extraction from Phase 1 | The phase validates interaction, contract, accessibility, and privacy boundaries first; document parsing needs its own security, accuracy, and fixture work. |
| Keep one client state boundary in `CaseWorkspace` | A single case route has a short-lived state machine and no cross-route persistence. Central local state with pure leaf components is easier to audit than adding context or a state library. |
| Split result sections into focused components | Summary, deadline, requirements, clarification, route, sources, and disclaimer have different semantic and visual responsibilities. The suggested structure was followed where it improved clarity; orchestration remains in `AnalysisResult` rather than adding a component for every wrapper. |

## Phase 1.5 intake decisions

| Decision | Reason |
| --- | --- |
| Treat categories as optional orientation aids | Users may not know the official procedure name, and real letters can span topics. A category can preselect context or be cleared, but it never determines eligibility or blocks a general case. |
| Normalize text, file, and sample inputs into one discriminated `CaseInput` contract | One typed service boundary prevents separate analysis UIs and makes it explicit which payload exists for each input kind. A later server implementation can accept the same union while preserving `CaseAnalysis`. |
| Keep arbitrary pasted text mock-only | Until a real server-side interpretation pipeline and evaluations exist, returning fictional labelled output is safer than implying the pasted message was legally or factually understood. |
| Keep pasted text only in browser memory | Official messages may contain sensitive information. React state supports the intake demonstration without storage, logs, analytics, or transmission, and reset removes it immediately. |
| Confirm before discarding an active input during mode changes | Text and selected files are private user work. An explicit confirmation reduces accidental loss while still enforcing one active input method at a time. |

## Phase 2 server-boundary decisions

| Decision | Reason |
| --- | --- |
| Use one multipart endpoint for every input kind | `multipart/form-data` carries text fields and binary files without base64 expansion in the browser and keeps one transport path for text, PDF, image, and sample modes. |
| Keep `CaseInput` backward-compatible and add `NormalizedCaseInput` on the server | Browser `File` state and validated server bytes have different responsibilities. A separate server union preserves the stable public contract without leaking browser objects into provider code. |
| Implement the four magic-byte checks without a new package | PDF, PNG, JPEG, and WebP have small deterministic signatures. A focused audited helper materially improves validation without adding a dependency tree. |
| Default mock mode only in non-production when configuration is absent | Local development remains usable without a key, while production cannot silently present fictional output because an environment variable was forgotten. |
| Return a typed response envelope around `CaseAnalysis` | Request ID, processing mode, input kind, receipt time, and discard status belong to transport metadata, not the stable analysis contract. |
| Use AbortController and an in-flight guard in the workspace | Reset and mode changes can cancel abandoned requests, and repeated clicks cannot submit the same sensitive input twice concurrently. |
| Prepare an internal request plan without installing the OpenAI SDK | Phase 2 can test input mappings and security context without implying an exact SDK payload, constructing a client, or risking an external request. |
| Keep real-mode consent copy separate and inactive | The mock privacy message must describe current behavior. A separate prepared message avoids falsely implying OpenAI transfer before the real provider and consent step exist. |
| Widen `CaseAnalysis.isMock` from literal `true` to `boolean` | This backward-compatible type widening preserves every current mock result while allowing the future provider to return the same contract honestly with `isMock: false`. No field name or current runtime value changed. |

## Remaining-phase execution decisions

| Decision | Reason |
| --- | --- |
| Make root `AGENTS.md` the canonical permanent agent rule set | Product, privacy, safety, quality, evidence, and Git constraints must survive across fresh Codex sessions rather than depend on one conversation. |
| Keep complete standalone prompts for Phases 3–8 in one master plan | Each phase can be copied into a fresh session with full scope, gates, tests, exact commit message, and stop behavior while preserving a single roadmap. |
| Execute and commit only one phase per run | A hard stop after each phase keeps review points small, prevents accidental scope creep, and creates clear dated Build Week evidence. |
| Use `PHASE_STATUS.md` as the authoritative execution state | Explicit prerequisites and blocked reasons prevent Codex from skipping unresolved external gates or inferring that credentials and authorizations exist. |
| Block Phase 4 until private API access is ready | OpenAI billing and `OPENAI_API_KEY` setup require user action. Codex must never request the secret in chat or implement around unavailable access. |
| End autonomous work at the deployed release-candidate handoff | Current-rule verification, category choice, application writing, video publishing, `/feedback`, and Devpost submission require current external facts or user-controlled actions and remain outside autonomous repository work. |

## Planned Luna interaction and API decisions

| Decision | Reason |
| --- | --- |
| Plan `gpt-5.6-luna` as the primary model while keeping `OPENAI_MODEL` configurable | The explicit model target makes Phase 4 and Phase 6 planning concrete, while configuration preserves operational flexibility. Its exact identifier, access, capabilities, and reasoning values must be verified from current official OpenAI documentation before implementation. |
| Use procedural warmth | Calm, respectful, patient, direct behavior helps stressed users without creating an emotional, chatty, or falsely reassuring assistant persona. |
| Make warmth behavioral | One consequential question, acceptance of “I don't know”, remembered corrections, a brief reason for each question, and avoidance of repetition or judgment are more useful than conversational filler. |
| Use acknowledgements selectively | Routine acknowledgement before every response adds friction and can feel artificial. Reserve it for corrections, urgency, confusion, or major route changes. |
| Use `CaseProfile` as MVP memory and do not add a vector database | The route depends on a small structured set of goal, facts, answers, uncertainty, and corrections. A vector store would add privacy and retrieval complexity without a demonstrated MVP need. |
| Use Structured Outputs for clarification decisions, profile updates, document interpretation, and routes | Runtime-validated schemas make the model boundary testable and keep facts, decisions, uncertainty, and route data explicit. |
| Do not request chain of thought or hidden reasoning | BurgerMapper needs validated decisions and short user-facing explanations, not private reasoning traces or sensitive internal material. |
| Plan task-specific reasoning levels, subject to implementation verification | Intake is planned at `low`, profile decisions at `medium`, document analysis/research/routes at `high`, and high-risk cases at `xhigh`. Phase 4 must verify these exact values against the selected model and API before use. |
| Do not use a second tone-polishing call | Procedural warmth belongs in the primary task instructions and product behavior; a routine extra call adds latency, cost, and another failure surface without improving route evidence. |
| Allow only a narrowly triggered structured verification pass | A bounded additional pass is justified for high-risk routes, source conflicts, suspected unsupported claims, or failed validation—not for routine cases or general tone. |
| Keep final routes more serious than intake | Intake can be calmly conversational, while the route must prioritize factual actions, deadlines, uncertainty, and evidence. |

## Phase 3 guided-case decisions

| Decision | Reason |
| --- | --- |
| Make the free-form goal the primary input | Users should be able to describe the outcome they need without knowing German bureaucracy terminology. Categories and evidence remain useful, optional context. |
| Extend `CaseInput` backward-compatibly with goal context and a goal-only variant | Existing text, file, and sample clients keep their discriminants while every route can carry the same normalized goal through the secure endpoint. |
| Use `CaseProfile` as short-lived route memory | A strict profile makes the goal, evidence reference, known facts, answers, uncertainty, sufficiency, and corrections inspectable without persistent storage or a conversation transcript. |
| Ask exactly one consequential question before the fictional route | One deterministic answer changes the mock route while keeping the interface calm. A written reason makes the question's route impact explicit. |
| Treat “I don't know” as a valid answer | Uncertainty should not block the user. The mock route preserves the unknown and adds a verification step instead of inventing certainty. |
| Use explicit sufficiency rules outside UI components | A pure rule stops questioning after the route-changing answer and prevents an endless or UI-dependent conversation loop. |
| Rebuild from corrected profile context | Editing the goal, category, or answer invalidates the affected mock decision and regenerates the question or route, while correction history remains in the current tab. |
| Keep the Phase 3 builder deterministic and provider-independent | `CaseBuilderService` can later be backed by structured OpenAI outputs, while current behavior remains testable and does not claim to understand arbitrary user input. |

## Phase 4 OpenAI integration decisions

| Decision | Reason |
| --- | --- |
| Default to `gpt-5.6-luna` behind server-only `OPENAI_MODEL` | Official documentation verifies the required multimodal, Responses, Structured Outputs, and reasoning features while configuration avoids locking deployments to an immutable choice. |
| Require explicit consent immediately before real transfer | A configured key does not authorize sending a user's goal or document to a third party; the user must see what is sent and why. |
| Keep mock mode as the default development path | Automated work, demos, and regressions remain deterministic, private, free of API spend, and functional without a key. |
| Use one primary structured result for interpretation, profile, question, and route | One schema keeps facts, interpretation, uncertainty, and actions explicit without a second tone-polishing call. |
| Rebuild a real route from a bounded clarification answer | The answer can change the profile and route while the UI remains one-question-at-a-time and non-chatbot-like. |
| Default PDF/image detail to `low` and cap output at 6,000 tokens | These limits reduce accidental latency and cost while Phase 6 evaluation is still pending. |
| Retry only one transient provider failure | A bounded retry helps temporary outages without multiplying billing/auth/input failures or hiding an unavailable provider. |
| Never silently replace requested real analysis with mock fiction | Real-mode failures return typed errors; the user may deliberately retry or switch configuration, preserving honesty. |
| Permit one structured verification pass only for approved triggers | Extra cost is restricted to high-risk, conflicting, unsupported, or invalid output rather than routine tone work. |
| Do not run a manual live test without separate call permission | API access enables implementation but does not authorize spending balance or transmitting content; mocked transport proves the boundary without a paid call. |

## Phase 5 live-provider smoke-test authorization

| Decision | Reason |
| --- | --- |
| Use the user's 2026-07-18 standing authorization for exactly one bounded synthetic Luna smoke request at the start of Phase 5 | One real request can verify project-level model access and the implemented Responses/Structured Outputs boundary before source-research complexity is added. The exception is limited to synthetic `input_text`, `low` reasoning, `store: false`, 2,000 output tokens, no tools/retry/verification/second call, and an estimated billable cost no greater than USD 0.10. It supersedes the Phase 4 call-permission decision only for this exact request; every other API call still requires specific permission. |

## Phase 5 official-source decisions

| Decision | Reason |
| --- | --- |
| Enforce profile sufficiency before research | A route-changing answer can change the relevant procedure, documents, and evidence. Researching earlier wastes work and can attach generic or misleading sources. |
| Send only an abstract route topic to the research endpoint | Category, language, topic, and sufficiency are enough for the current curated provider. Names, goals, letters, files, reference numbers, and profile text add privacy risk without improving retrieval. |
| Start with four exact official hostnames | `service.berlin.de`, `www.berlin.de`, `www.gesetze-im-internet.de`, and `www.elster.de` cover the three fictional demo routes while preventing aggregators or lookalike domains from becoming primary evidence. HTTPS, exact hostname, same-host canonical redirects, metadata, status, and recency are validated. |
| Model atomic claims separately from source cards | Explicit claim IDs and step mappings make citations evidentiary rather than decorative. A source supports only the claims listed in its contract. |
| Preserve law, service guidance, local practice, document fact, inference, and uncertainty as different kinds | Users should not mistake a Berlin service page for federal law, or a model interpretation for official policy. |
| Display conflicts and downgrade missing evidence | BurgerMapper does not silently select among official conflicts. Stale, unavailable, incomplete, redirected, or non-allowlisted evidence cannot support a certain route instruction and triggers limitation/escalation copy. |
| Treat a letter deadline as a document fact by default | A date detected in the user's letter comes from that document, not from web research. The UI requires confirmation against the original unless separate official evidence supports the deadline. |
| Use a dated curated provider for the Phase 5 demo | The server boundary, validation, claim synthesis, and rendering are fully replaceable and deterministic offline. Runtime live refresh and unrestricted web search are deferred until evaluation proves their reliability and privacy behavior. |

## Phase 6 reliability decisions

| Decision | Reason |
| --- | --- |
| Make deterministic synthetic checks release blocking | A hackathon demo still needs repeatable evidence for question quality, profile/route completeness, citations, deadlines, RTL, injection, fallback, latency, and cost without spending API credit or transmitting private data. |
| Require 100% pass rates on the versioned synthetic critical set | The compact set represents invariants rather than statistical model quality; accepting a known failure would weaken the safety contract. Larger probabilistic real-model samples remain separate future evidence. |
| Use aggregate-only operational metrics | Request counts, outcomes, latency bands, token totals, retries, and estimated cost support reliability decisions without retaining prompts, files, names, answers, identifiers, or responses. |
| Add a salted process-local anonymous guard now | The anonymous MVP needs immediate request and endpoint-wide concurrency ceilings without a database. Expired inactive client windows are pruned and client-hash state is capped at 2,048 entries; serverless/multi-instance protection still requires a shared platform limiter before public release. |
| Estimate Luna cost from provider-reported token usage | Content-free usage supports the USD 0.10 per-case planning ceiling while keeping `OPENAI_MODEL` configurable and avoiding a second billing/logging service. Pricing must be reverified before deployment. |
| Map source-retriever failure to an explicit unavailable state | A temporary source outage must not look like verified guidance or leak internal exceptions. The route remains usable only with visible uncertainty and authority escalation. |
| Use a 10-second test ceiling for UI interaction tests | Two jsdom tests passed alone but exceeded 5 seconds under full constrained parallel execution. A test-only ceiling removes infrastructure flakiness without changing the 20-second production provider timeout. |

## Phase 7 experience decisions

| Decision | Reason |
| --- | --- |
| Open the route with the deadline/urgency card followed by a first-action card | A stressed reader needs the date and the single next thing to do before facts and summaries. The same order applies on screen, in print, and in the exported file. |
| Export as a browser-built plain-text file with a fixed name | Plain text prints, mails, and archives everywhere; building it client-side from the already rendered `CaseAnalysis` avoids any upload or persistence; the constant `burgermapper-route.txt` name cannot leak a goal or personal detail. |
| Show the non-government identity persistently in the header and footer | The per-route disclaimer only appears after analysis; an official-looking landing page must never imply authority status, so the identity moved into permanent chrome without seals or authority styling. |
| Make homepage and goal-help copy mode-aware | The Phase 3 "never sent to an AI provider" wording became false once real mode existed. Each configuration now states only what it actually does, keeping consent copy accurate but concise. |
| Remove internal phase names from user-facing source status | "Not verified in Phase 2" is developer vocabulary; users need the plain status "not accessed or verified yet" in all three languages. |
| Add a skip link and keep the Build Week label out of the header | Keyboard and screen-reader users get a direct path to content; a permanent product identity replaces a stale internal phase label. |
| Keep category and evidence visible rather than collapsing them | Progressive disclosure is already achieved by ordering (goal first, optional panels after); hiding the six categories or evidence methods behind extra interactions would reduce discoverability for exactly the users the product serves. |
| Present demo honesty in product language (user decision, 2026-07-19) | The user directed that the app read as a real customer product. All rendered "mock/fictional/Build Week prototype" vocabulary became "demo/example" wording, while every honesty obligation — example-case basis, no AI interpretation in demo mode, not legal advice, unverified sources, non-government identity — remains in the copy. Internal contracts and configuration keep the mock naming to avoid breaking stable boundaries. |
