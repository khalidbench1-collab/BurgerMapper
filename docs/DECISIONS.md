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
