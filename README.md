# BurgerMapper

BurgerMapper is a Berlin-first bureaucracy navigator. A user can begin by describing what they need to get done without knowing the German procedure name, optionally add an official letter or message, and build an understandable, actionable route.

## Intended Build Week workflow

The Build Week target is to let a user state a goal, optionally add an official German letter as text, PDF, or image, receive a plain-language explanation, answer only clarification questions that could change the route, and get personalized next steps backed by official German government sources. The interface is in English, with generated routes in English, German, and Arabic.

Phase 4 adds a server-only OpenAI Responses API provider behind the secure Phase 2 boundary while preserving the Phase 3 goal-first mock workflow. Real mode is consent-gated and schema-validated; mock mode remains the development and demo default.

## Phase 4 real and mock workflow

- Goal-first landing page at `/` and case workspace at `/case`, led by “What do you need to get done?”.
- Goal-only cases are supported. Pasted text, PDF/image upload, and the fictional sample remain optional evidence through the same route flow.
- A visible 1,000-character goal limit, whitespace normalization, plain-text rendering, and client/server validation.
- Plain-text input with whitespace normalization, a minimum of 20 non-whitespace characters, a visible character count, and a 20,000-character maximum.
- Drag-and-drop and keyboard file selection for PDF, PNG, JPEG, and WebP documents up to 10 MB.
- A fictional sample letter so the workflow can be tested without a personal document.
- A single `multipart/form-data` boundary at `POST /api/cases/analyze` for goal-only, text, PDF, image, and sample input.
- Independent server validation, MIME and magic-byte checks, sanitized filename metadata, deterministic mock-analysis state, and a full start-over path.
- In-memory request handling with no database, file writes, content logs, analytics, or third-party transfer.
- Typed API errors, request references, no-store responses, and explicit discarded-after-processing metadata and headers.
- Hand-written English, German, and Arabic mock results; Arabic results use right-to-left layout while dates and source URLs remain readable.
- A strict `CaseProfile` holding the goal, optional category, non-sensitive evidence reference, answers, uncertainty, sufficiency, correction history, and timestamps in browser memory.
- Exactly one deterministic route-changing clarification question with a short reason, an “I don't know” path, and explicit sufficiency rules that stop questioning.
- An editable case summary for correcting the goal, category, or previous answer without starting over; the mock route is regenerated from the corrected profile.
- A typed analysis contract covering document facts, plain-language interpretation, deadline and urgency, requested action, required documents, uncertainty, adaptive next steps, unverified source placeholders, and a legal-information disclaimer.
- Print-friendly result styling and clear separation between extracted facts, interpretation, uncertainty, action, and sources.

Six visible orientation categories are available on the landing page and in the case workflow:

- Arrival & Registration
- Visa & Immigration
- Work & Business
- Housing & Money
- Health & Insurance
- Family & Children

Category selection is optional. It helps users begin without knowing an official procedure name and never determines legal eligibility. Arrival & Registration and Work & Business have small fictional mock variations; Visa & Immigration uses the existing residence-renewal route. Other categories retain the default route while displaying the selected context.

Mock mode does not analyze arbitrary goals, text, or documents. It demonstrates the expected profile, clarification, and route structure with fictional content and explicitly says that the goal or evidence was not interpreted.

Real mode maps goal and pasted content to `input_text`, verified PDFs to `input_file`, and verified PNG/JPEG/WebP images to `input_image`. The server uses the official OpenAI SDK and Responses API with `gpt-5.6-luna` by default, configurable through `OPENAI_MODEL`. Structured Outputs are runtime-validated with Zod for document interpretation, profile facts and uncertainty, the next-question decision, and the route. One narrowly triggered verification pass is allowed only for high risk, source conflict, suspected unsupported claims, or failed validation; it is never used to polish tone.

## Mock configuration

- `ENABLE_MOCK_AI=true` selects the server-side mock provider and makes no external AI request.
- `ENABLE_MOCK_AI=false` selects the server-side OpenAI provider. A non-empty private `OPENAI_API_KEY` is required or the endpoint returns `API_NOT_CONFIGURED`.
- If `ENABLE_MOCK_AI` is unset, mock mode defaults on only outside production. An unset production configuration is disabled to avoid accidental mock behavior.
- `OPENAI_MODEL` defaults to `gpt-5.6-luna` and remains configurable on the server.
- `OPENAI_API_KEY` remains server-only. No `NEXT_PUBLIC` secret or model credential exists.
- Real analysis requires an explicit checkbox immediately before transfer. A configured key or funded balance alone never triggers a request.

## Technical stack

- Next.js 16 App Router
- Next.js Route Handler for the server analysis boundary
- React 19
- TypeScript in strict mode
- Tailwind CSS 4
- ESLint 9 with the Next.js configuration
- Vitest, jsdom, and React Testing Library
- Official OpenAI JavaScript SDK 6.48.0
- Zod 4.4.3 for runtime schemas and Structured Outputs
- npm
- Vercel as the planned deployment target
- OpenAI Responses API through server-side calls in explicitly selected real mode

The architecture is mobile-first and PWA-ready. The anonymous MVP will not use a database unless a later requirement establishes a clear need.

## Local setup

Prerequisites: Node.js 20.9 or newer and npm.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from the safe template:

   ```bash
   cp .env.example .env.local
   ```

   On PowerShell, use `Copy-Item .env.example .env.local`.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

Run the Phase 4 checks with:

```bash
npm test
npm run lint
npm run build
```

The safe environment template contains:

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-luna
ENABLE_MOCK_AI=true
```

No API key is required for mock mode. To test real mode, configure the key privately in `.env.local`, set `ENABLE_MOCK_AI=false`, and leave the key out of source, browser code, logs, screenshots, and conversation. Never commit `.env.local`.

## Current implementation status

Phase 4 is complete at the implementation and mocked-transport level. A user can start with a goal alone or add pasted text, PDF/image evidence, the trusted sample, an optional category, and an output language. One validated application-server endpoint returns the existing `CaseAnalysis` plus an optional structured `CaseProfile`. Real mode uses explicit consent, strict schemas, one-question decisions, answer-driven profile/route rebuilding, task-specific reasoning, cancellation, safe typed errors, bounded retry, request/output ceilings, and selective verification. Mock mode remains fully operational without a key.

The automated suite contains 107 passing tests across 13 files. All OpenAI provider tests use an injected synthetic transport and cannot spend API credit.

The remaining Build Week work is governed by a permanent phase-gated execution system. [AGENTS.md](AGENTS.md) contains canonical repository rules, [INSTRUCTIONS.md](INSTRUCTIONS.md) explains safe operation, and [docs/MASTER_BUILD_PLAN.md](docs/MASTER_BUILD_PLAN.md) contains standalone prompts for Phases 3–8. [docs/PHASE_STATUS.md](docs/PHASE_STATUS.md) is the authoritative state record.

To begin the next eligible phase in a fresh Codex session, use exactly:

```text
Read AGENTS.md, docs/MASTER_BUILD_PLAN.md, and docs/PHASE_STATUS.md. Execute the first phase marked NOT STARTED whose prerequisites are complete. Follow its full prompt. Stop after its commit and final report. Never automatically begin the next phase.
```

Phase 5 is next: official-source research and cited personalized routes. It must not begin automatically.

Current limitations:

- No local PDF text extraction or OCR; real mode sends supported files directly to the Responses API.
- No official-source retrieval or verification. Real results contain no verified citations, and mock results retain clearly labelled placeholders.
- No live real API smoke request was run during Phase 4, so model availability for the configured API project and real-output quality are not yet empirically confirmed. A standing authorization now permits exactly one tightly bounded synthetic `gpt-5.6-luna` smoke request at the start of Phase 5; it does not authorize real documents, research calls, retries, or broader API traffic.
- No login, database, local storage, analytics, tracking, or deployment.
- A model can be wrong, miss text, or misread a deadline; outputs remain legal information rather than legal advice.

The request planner now feeds the real server provider: pasted text and the trusted sample become `input_text`, PDFs become `input_file`, images become `input_image`, and a separate context block carries category, language, clarification answers, and reusable prompt-injection protections. A client-side API key is never used.

## Privacy behavior

Before analysis, the goal, answers, optional text, and selected `File` remain in React state for the open tab. On analysis they are sent to the BurgerMapper server as multipart form data. The server normalizes text, verifies document type/signature, and processes the request in memory. Mock mode makes no third-party transfer. Real mode requires explicit consent and sends the minimum needed goal, evidence, category/language context, and security instructions to OpenAI; the request sets `store: false`. BurgerMapper does not intentionally persist or log content and reports application-memory discard, but this does not promise provider deletion: OpenAI's published default abuse-monitoring retention may be up to 30 days, and any project data-sharing choice also applies. Reset, refresh, or tab close clears browser state.

## Security

AI calls are server-side only. Local `.env*` files are ignored except for the safe `.env.example`; never commit credentials or expose an OpenAI API key to browser code. The public endpoint revalidates all browser input, accepts only known sample IDs and supported MIME/signature pairs, requires real-transfer consent, returns safe typed errors without stack traces or raw provider messages, and marks responses `no-store`. Goals and documents are untrusted evidence that cannot override application instructions or trigger link following. No chain of thought is requested or retained. The app has no analytics, tracking, remote font, remote application asset, or `dangerouslySetInnerHTML`.

## Build Week provenance

The BurgerMapper concept and an earlier, unrelated prototype predated OpenAI Build Week 2026. No code from that prototype is included here. This repository and the submitted technical implementation are being built from scratch during Build Week. See [docs/PRIOR_WORK_DISCLOSURE.md](docs/PRIOR_WORK_DISCLOSURE.md) and the dated build log for the detailed record.

## How Codex contributed

Codex established the Phase 0 repository and helped implement Phases 1, 1.5, 2, 3, and 4: typed domain and transport contracts, client/server validation, the in-memory API boundary, magic-byte checks, the multilingual mock service, structured `CaseProfile`, guided builder, official OpenAI SDK boundary, Responses request mapping, Zod Structured Outputs, consent, prompt-injection controls, provider error/cost limits, tests, audits, verification, and documentation. No real `gpt-5.6-luna` response was generated during Phase 4, so the submission must not yet claim model-output evidence.

## Codex `/feedback` Session ID

Placeholder: add the final Codex `/feedback` Session ID before submission.

## Live demo

Placeholder: add the live deployment URL before submission.

## Demo video

Placeholder: add the public YouTube demo URL before submission.
