# Architecture decision records

These dated records capture durable technical choices. Product-level choices and phase-specific implementation notes remain in [DECISIONS.md](DECISIONS.md) and [BUILD_LOG.md](BUILD_LOG.md).

## 2026-07-18 — Next.js App Router

- **Context:** BurgerMapper needs responsive pages, server endpoints, metadata, and a short path to deployment.
- **Decision:** Use the current stable Next.js App Router with TypeScript strict mode.
- **Reason:** One framework can own the UI and server boundary while preserving clear client/server module separation.
- **Tradeoff:** Framework conventions and version-specific behavior require careful upgrades and documentation checks.
- **Revisit when:** The application needs runtime or deployment capabilities the App Router cannot provide reliably.

## 2026-07-18 — Responsive PWA rather than native mobile

- **Context:** Users may open BurgerMapper while handling paperwork on a phone, but Build Week has limited delivery time.
- **Decision:** Build a mobile-first responsive web application with PWA-ready metadata, not native iOS or Android applications.
- **Reason:** A web URL provides the fastest cross-device access and iteration path.
- **Tradeoff:** Offline behavior, device integration, and install polish remain less complete than a mature native application.
- **Revisit when:** Validated usage requires native-only capabilities or reliable offline document handling.

## 2026-07-18 — Anonymous MVP

- **Context:** Official letters can contain sensitive personal information, while the first route does not require an account.
- **Decision:** Keep the MVP anonymous and session-scoped.
- **Reason:** This reduces friction, identity risk, and the amount of personal data BurgerMapper must control.
- **Tradeoff:** Cases cannot sync between devices or persist across sessions.
- **Revisit when:** Users demonstrate a clear need for saved cases and a privacy review defines identity and deletion controls.

## 2026-07-18 — No database initially

- **Context:** The intake and route can be completed within one request and browser session.
- **Decision:** Do not add a database or application persistence layer.
- **Reason:** Avoiding storage narrows the sensitive-data surface and keeps the hackathon architecture auditable.
- **Tradeoff:** There is no case history, long-running workflow state, or administrative analytics.
- **Revisit when:** A validated feature cannot work safely with short-lived state and has explicit retention requirements.

## 2026-07-18 — One normalized CaseInput contract

- **Context:** Pasted text, uploaded files, and the trusted sample must produce the same route UI.
- **Decision:** Keep one discriminated client `CaseInput` and translate it into a separate discriminated `NormalizedCaseInput` at the server boundary.
- **Reason:** Input-specific validation remains type-safe without multiplying analysis interfaces or result components.
- **Tradeoff:** Transport and provider adapters must deliberately map between client and server representations.
- **Revisit when:** A genuinely different workflow cannot satisfy the shared `CaseAnalysis` result contract.

## 2026-07-18 — Server-side analysis boundary

- **Context:** Future multimodal analysis needs secrets and must not trust browser validation.
- **Decision:** Route every analysis through `POST /api/cases/analyze` using centralized multipart field names, server revalidation, typed errors, and no-store responses.
- **Reason:** The endpoint creates one controlled privacy, configuration, validation, and provider-selection boundary.
- **Tradeoff:** Even mock analysis now incurs an application-server request and multipart parsing overhead.
- **Revisit when:** Measured scale or platform limits require a dedicated isolated processing service without weakening the contract.

## 2026-07-18 — Direct future Responses API multimodal input

- **Context:** The intended OpenAI provider can accept text, PDF, and image inputs directly.
- **Decision:** Plan pasted text as `input_text`, PDF as `input_file`, PNG/JPEG/WebP as `input_image`, and the trusted sample as server-resolved `input_text`, with separate category and language context.
- **Reason:** Direct multimodal input avoids maintaining a parallel extraction interpretation pipeline for the hackathon MVP.
- **Tradeoff:** Provider cost, file limits, latency, and document-understanding quality become external constraints that require evaluation.
- **Revisit when:** Evaluations show that controlled preprocessing materially improves accuracy, privacy, latency, or cost.

## 2026-07-18 — No separate OCR system for the MVP

- **Context:** Local OCR and PDF parsing would add dependencies, quality tuning, and another sensitive-content pipeline.
- **Decision:** Do not build local OCR or separate PDF text extraction during the hackathon MVP.
- **Reason:** The future provider boundary is designed for direct multimodal documents, so an unvalidated duplicate pipeline would add risk without proving the core route.
- **Tradeoff:** Phase 2 validates transport and safety but cannot interpret documents without the future provider.
- **Revisit when:** Provider evaluations, accessibility needs, cost controls, or offline requirements justify a dedicated extraction layer.

## 2026-07-18 — Shared CaseAnalysis provider contract

- **Context:** Mock mode must remain useful before a key exists and after a real provider is added.
- **Decision:** The mock provider and future OpenAI provider must return the same `CaseAnalysis` contract.
- **Reason:** The route UI, multilingual rendering, clarification adaptation, and print layout remain provider-independent.
- **Tradeoff:** Provider-specific detail must be normalized or kept outside the public analysis result.
- **Revisit when:** Evidence shows the contract cannot represent a required, user-visible safety or routing concept.

## 2026-07-18 — In-memory processing and discard signal

- **Context:** Letters and messages may contain identity, immigration, financial, or health information.
- **Decision:** Validate and process request data in memory, write no files, return no original content, mark responses `no-store`, and report `discarded-after-processing` in response metadata and a header.
- **Reason:** This is the smallest retention footprint compatible with server-side multimodal transport.
- **Tradeoff:** The discard signal describes application behavior rather than providing cryptographic proof of memory erasure or infrastructure-level deletion.
- **Revisit when:** A deployment privacy review identifies platform buffering, abuse protection, or audit requirements that need stronger controls and disclosure.

## 2026-07-18 — Prompt-injection boundary

- **Context:** Documents can contain malicious or irrelevant instructions directed at an analysis model.
- **Decision:** Treat all document content as untrusted evidence and include a reusable higher-priority instruction that forbids document commands from overriding application rules, following embedded links, revealing instructions, or claiming unsupported legal certainty.
- **Reason:** The trust boundary must exist before the first model request is implemented.
- **Tradeoff:** Instructions reduce risk but cannot guarantee model behavior; structured output validation and adversarial evaluations are still required.
- **Revisit when:** Model/tool access expands, new injection patterns appear, or evaluations identify missing controls.

## 2026-07-18 — Official-source research after case profile

- **Context:** Source needs depend on the identified letter, user context, uncertainty, and route-changing clarification.
- **Decision:** Defer official-source retrieval and verification until the case profile is ready; do not search during Phase 2.
- **Reason:** Research should answer the resolved case question rather than gather generic or potentially misleading links too early.
- **Tradeoff:** Current results contain clearly labelled, unverified placeholders and cannot support changing factual claims.
- **Revisit when:** The real analysis contract and clarification sequence are evaluated and stable enough to define scoped source queries.

## 2026-07-18 — Phase-gated autonomous execution

- **Context:** Remaining implementation spans model access, external research, hardening, UX, repository publication, deployment, and submission handoff across multiple future sessions.
- **Decision:** Govern work through canonical `AGENTS.md`, an authoritative phase-status file, standalone prompts, one exact commit per phase, explicit prerequisite gates, and a mandatory stop after each final report.
- **Reason:** Repository-local instructions make execution reproducible while preserving review points, privacy boundaries, user-controlled external actions, and dated Build Week provenance.
- **Tradeoff:** The plan deliberately sacrifices continuous multi-phase execution and may pause for user confirmation even when later technical work is defined.
- **Revisit when:** The Build Week release candidate and handoff are complete; do not extend the phase sequence automatically.

## 2026-07-18 — Configurable Luna provider and task-specific reasoning

- **Context:** Phase 4 will add one OpenAI provider for intake, profile decisions, multimodal interpretation, research support, and route construction, but the API is not implemented and access is still gated.
- **Decision:** Plan `gpt-5.6-luna` as the primary model behind configurable `OPENAI_MODEL`. Plan reasoning by task: intake `low`, profile decisions `medium`, document analysis/research/routes `high`, and high-risk cases `xhigh`. Phase 4 must verify the exact model identifier, project availability, capabilities, and supported reasoning values in current official OpenAI documentation before using them.
- **Reason:** A named primary model and task-specific effort plan support repeatable implementation and evaluation without hard-coding deployment configuration or pretending unverified API details are settled.
- **Tradeoff:** Availability or accepted reasoning values may differ when Phase 4 begins, which can block implementation pending an explicit decision.
- **Revisit when:** Official documentation, project access, evaluations, latency, or cost show that the planned model or a reasoning level is unsupported or unsuitable.

## 2026-07-18 — Structured CaseProfile memory and outputs

- **Context:** BurgerMapper must remember corrections and build a route across several bounded decisions without persistent private-content storage.
- **Decision:** Use the structured `CaseProfile` as MVP memory and use Structured Outputs for clarification decisions, profile updates, document interpretation, and routes. Validate outputs at runtime; do not add a vector database or request visible chain of thought or hidden reasoning.
- **Reason:** Explicit schemas provide the route-relevant memory and validation boundary the product needs while minimizing retention, retrieval complexity, and unverifiable reasoning artifacts.
- **Tradeoff:** The profile must be deliberately evolved when new route-relevant facts appear, and it will not support semantic recall over a large external corpus.
- **Revisit when:** A validated use case requires retrieval over a bounded knowledge corpus that cannot be represented or linked safely through `CaseProfile`, or the provider's verified Structured Outputs interface changes.

## 2026-07-18 — Procedural warmth without a tone-polishing pass

- **Context:** Stressed users need respectful guidance, but chatbot-like reassurance, routine acknowledgements, and extra model calls can obscure the route and increase cost and latency.
- **Decision:** Express warmth through one consequential question at a time, acceptance of “I don't know”, remembered corrections, a brief reason for questions, and non-judgmental language. Use acknowledgements only for corrections, urgency, confusion, or major route changes. Keep final routes factual and more serious than intake. Do not add a second tone-polishing call.
- **Reason:** Useful behavior is calmer and more trustworthy than conversational filler, and it keeps the primary structured response responsible for both content and presentation.
- **Tradeoff:** Tone quality must be evaluated within task outputs rather than isolated in a dedicated rewriting stage.
- **Revisit when:** Phase 6 evidence shows a specific tone failure that cannot be corrected through instructions, schema fields, deterministic UI copy, or primary-call evaluation.

## 2026-07-18 — Selective structured verification pass

- **Context:** A routine second model pass would add cost and latency, while a small set of safety-critical conditions deserves additional scrutiny.
- **Decision:** Permit an optional schema-validated verification pass only for high-risk routes, official-source conflicts, suspected unsupported claims, or failed validation. It must not serve as a general tone-polishing step.
- **Reason:** Risk-triggered verification concentrates additional work where it can materially improve safety and evidence quality.
- **Tradeoff:** Trigger definitions and pass/fail handling add branching and must be evaluated for missed triggers and unnecessary calls.
- **Revisit when:** Phase 6 evaluation shows the trigger policy has unacceptable false negatives, false positives, latency, or cost.

## 2026-07-18 — Structured CaseProfile and guided-builder boundary

- **Context:** Goal-only and document-supported cases need one route memory that can show uncertainty, accept corrections, and stop asking questions without a chat transcript or persistence layer.
- **Decision:** Introduce a strict in-memory `CaseProfile` and provider-independent `CaseBuilderService`. The profile records normalized goal, optional category, content-free evidence metadata, known mock facts, answers, uncertainties, output language, asked-question and correction history, sufficiency, and timestamps. Deterministic pure functions select one question, evaluate sufficiency, apply corrections, and build the final mock `CaseAnalysis` route.
- **Reason:** A structured profile keeps the route auditable, makes corrections and stopping behavior testable, and provides the future Structured Outputs boundary without weakening the established analysis API.
- **Tradeoff:** Phase 3 profile construction is partly client-side and deterministic; it cannot understand arbitrary goals or infer new facts, and its one-question policy represents only fictional scenarios.
- **Revisit when:** Phase 4 has verified API access and schema-valid structured profile updates can replace deterministic mock construction while preserving privacy, correction history, mock fallback, and the `CaseAnalysis` route contract.

## 2026-07-18 — Backward-compatible goal transport

- **Context:** The secure endpoint already accepts four evidence kinds, while a user must now be able to start with a goal alone or attach that goal to any existing input.
- **Decision:** Add a `goal` input discriminant and optional goal context on existing `CaseInput` variants, validate the goal independently on client and server, and map goal-only requests to the internal future `input_text` plan. Do not echo goal content in the API response.
- **Reason:** One multipart boundary continues to protect every case path without creating a second goal endpoint or separate result UI.
- **Tradeoff:** The stable API now has an additional optional field and error codes, and current mock analysis still cannot semantically interpret that field.
- **Revisit when:** A future structured provider requires a versioned transport change that cannot be introduced compatibly.

## 2026-07-18 — Server-only OpenAI Responses provider

- **Context:** The secure multimodal boundary and structured mock builder were ready for a real provider, but secrets, user consent, cost, provider errors, and schema trust needed one controlled design.
- **Decision:** Add an `OpenAICaseBuilderProvider` behind the existing server analysis boundary. Instantiate the official SDK only in explicitly selected real mode after configuration and consent; return the same `CaseAnalysis` plus an optional structured `CaseProfile`.
- **Reason:** Provider-specific SDK types and credentials remain server-only while the client route UI and mock fallback stay replaceable and compatible.
- **Tradeoff:** The public success envelope gains an optional profile and the provider adapter must normalize SDK output into existing domain types.
- **Revisit when:** Evaluations show a single provider cannot meet accuracy, latency, or availability requirements, without adding an unauthorized AI vendor.

## 2026-07-18 — Structured multimodal request and response boundary

- **Context:** Goals, pasted text, PDFs, and images require different Responses content items, and model output is untrusted even when statically typed.
- **Decision:** Map text/sample to `input_text`, PDF data URLs to `input_file`, and image data URLs to `input_image`; send separate category/language/security context; parse Zod Structured Outputs and revalidate coherence at runtime.
- **Reason:** Direct multimodal input avoids a duplicate OCR/PDF pipeline and strict schemas keep profile, question, interpretation, uncertainty, and route decisions testable.
- **Tradeoff:** Direct files can increase provider token cost, and strict schemas can reject otherwise usable prose; bounded failed-validation verification is the only repair path.
- **Revisit when:** Phase 6 evaluations justify preprocessing, schema changes, different detail settings, or smaller task-specific calls.

## 2026-07-18 — Consent, provider retention, and application discard

- **Context:** Real cases may contain sensitive personal information, and application-memory discard does not control OpenAI platform retention or project data-sharing settings.
- **Decision:** Require explicit per-case UI/server consent, send the minimum case content with `store: false`, log no content, write no files, and disclose the provider's documented default abuse-monitoring retention rather than promise deletion.
- **Reason:** Users need an accurate boundary between browser memory, BurgerMapper processing, OpenAI processing, and provider controls.
- **Tradeoff:** Consent adds a deliberate step, and `store: false` does not mean zero provider retention.
- **Revisit when:** Deployment project retention/data-sharing settings are verified or stronger eligible retention controls are configured.

## 2026-07-18 — Bounded provider reliability and cost policy

- **Context:** Multimodal reasoning can be slow or costly, while blind retries and routine verification can consume a small project balance.
- **Decision:** Use a 20-second timeout, one transient retry, 6,000 output-token ceiling, low document detail, four provider requests and three clarification questions per case, plus at most one trigger-restricted verification pass.
- **Reason:** Explicit ceilings make failure and spend behavior predictable enough for later evaluation without adding persistence or a rate-limit database.
- **Tradeoff:** Difficult documents may time out or need more context; current per-case ceiling is enforced inside the provider request contract rather than across distributed anonymous sessions.
- **Revisit when:** Phase 6 measures quality, latency, cost, abuse, and provider-limit behavior with synthetic evaluations.

## 2026-07-18 — Post-sufficiency official-source research boundary

- **Context:** A completed `CaseProfile` needs current official evidence, but the analysis endpoint may contain private goals and document data that official-source retrieval does not need.
- **Decision:** Add `POST /api/cases/research` as a separate JSON boundary invoked only for a `sufficient` profile. Its strict request accepts only an abstract route topic, optional category, output language, and sufficiency state; extra fields are rejected.
- **Reason:** The boundary enforces research timing and data minimization independently of the browser and analysis provider.
- **Tradeoff:** The client performs one additional application-server request after clarification, and topic coverage is deliberately narrower than arbitrary goal interpretation.
- **Revisit when:** Phase 6 evaluation shows that a richer abstract profile is necessary; any added field requires a privacy and query-leakage review.

## 2026-07-18 — Retrieval, validation, synthesis, and rendering separation

- **Context:** Search results, validated official sources, supported claims, and user-visible steps have different trust levels and failure modes.
- **Decision:** Separate an `OfficialSourceRetriever`, exact-host allowlist and canonical/status/recency validation, atomic claim synthesis, and UI route/source rendering. The Phase 5 provider uses a dated curated official-source snapshot and exposes a replaceable retriever interface; automated tests inject synthetic records and never depend on live web availability.
- **Reason:** Each trust transition is testable, retrieved content cannot directly control actions, and unsupported evidence can be filtered before route rendering.
- **Tradeoff:** The current snapshot does not automatically detect source changes after its access date. A live refresh provider still needs bounded retrieval, parsing, monitoring, and evaluation.
- **Revisit when:** Phase 6 establishes freshness thresholds, outage behavior, conflict precision, and a privacy-safe live-refresh strategy.

## 2026-07-18 — Explicit source-evidence graph

- **Context:** A generic list of links can look authoritative without proving any route statement.
- **Decision:** Extend `CaseAnalysis` compatibly with optional `RouteClaim`, `CaseResearchSummary`, and deadline-provenance records; extend sources with supported claim IDs, authority type, jurisdiction, conflict, HTTP status, and access time; extend steps with claim IDs. Existing source and analysis fields remain valid for mock placeholders.
- **Reason:** The route can place citations beside the exact claim and distinguish federal law, official service guidance, Berlin practice, document facts, inference, and unresolved uncertainty.
- **Tradeoff:** Claim/source/step IDs must remain internally coherent and multilingual text must be authored or generated consistently.
- **Revisit when:** Evaluation requires versioned evidence, quoted passages, machine-readable statutory references, or claim-level confidence beyond the current support states.

## 2026-07-18 — Official pages remain untrusted content

- **Context:** Even an official page can contain irrelevant instructions, compromised content, or links that should not trigger application actions.
- **Decision:** Page text is evidence only. It cannot override application instructions, request secrets, trigger tools, follow links, or create a claim without validated metadata and an explicit support relationship. Full pages, queries, and browsing traces are not persisted.
- **Reason:** Official-domain status narrows provenance but does not eliminate prompt injection or content-integrity risk.
- **Tradeoff:** Useful page changes may be ignored until the curated claim record is refreshed and reviewed.
- **Revisit when:** A live retrieval/parser implementation is evaluated against adversarial official-page fixtures and content-change monitoring.

## 2026-07-18 — Versioned synthetic release-evaluation boundary

- **Context:** Provider, profile, evidence, multilingual, and failure behavior need repeatable release evidence without private cases or routine paid calls.
- **Decision:** Keep versioned synthetic evaluation contracts and fixtures in the repository, run them through pure invariant checks, and fail the release gate on any critical check.
- **Reason:** Deterministic evidence is reviewable in commits and covers question quality, sufficiency, route/citation/deadline completeness, injection, RTL, fallback, latency, and cost.
- **Tradeoff:** Synthetic invariants do not measure real-model accuracy distributions or real document quality.
- **Revisit when:** A privacy-approved, budgeted evaluation program can add sampled real-model evidence without replacing deterministic regressions.

## 2026-07-18 — Process-local abuse protection and content-free telemetry

- **Context:** Anonymous expensive endpoints need basic abuse and cost visibility, but the MVP has no identity, database, analytics, or retention system.
- **Decision:** Use salted in-memory client hashes for fixed-window request limits, endpoint-wide concurrency limits, and a 2,048-entry cap with expiry pruning; collect only aggregate counts, outcomes, latency bands, token/retry totals, and estimated cost.
- **Reason:** This materially limits accidental abuse and makes spend/failure behavior observable without persisting content, a recoverable user identifier, or an unbounded in-memory event log.
- **Tradeoff:** State resets on restart and is not coordinated across serverless instances; metrics are ephemeral and unsuitable for production incident history.
- **Revisit when:** Phase 8 deployment architecture is known and can provide shared edge rate limiting plus privacy-reviewed aggregate monitoring.
