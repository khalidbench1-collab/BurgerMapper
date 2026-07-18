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
