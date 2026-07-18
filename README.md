# BurgerMapper

BurgerMapper is a Berlin-first bureaucracy navigator. A user can begin by describing what they need to get done without knowing the German procedure name, optionally add an official letter or message, and build an understandable, actionable route.

## Intended Build Week workflow

The Build Week target is to let a user state a goal, optionally add an official German letter as text, PDF, or image, receive a plain-language explanation, answer only clarification questions that could change the route, and get personalized next steps backed by official German government sources. The interface is in English, with generated routes in English, German, and Arabic.

Phase 3 adds a goal-first guided case builder to the secure Phase 2 boundary. It builds a short-lived structured case profile and fictional route in deterministic mock mode; it does not yet interpret arbitrary goals or documents.

## Phase 3 guided mock workflow

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
- A strict `CaseProfile` holding the goal, optional category, non-sensitive evidence reference, answer, uncertainty, sufficiency, correction history, and timestamps in browser memory.
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

Mock mode does not analyze arbitrary goals, text, or documents. It demonstrates the expected profile, clarification, and route structure with fictional content and explicitly says that the goal or evidence was not interpreted. The browser sends the goal and active optional evidence to the BurgerMapper application server for in-memory validation and a replaceable mock provider; the client-side `CaseBuilderService` then produces the short-lived structured profile and deterministic route.

## Mock configuration

- `ENABLE_MOCK_AI=true` selects the server-side mock provider and makes no external AI request.
- `ENABLE_MOCK_AI=false` disables mock analysis. Phase 2 has no real provider, so the endpoint returns the typed `API_NOT_CONFIGURED` error; no OpenAI client is created even if a key exists.
- If `ENABLE_MOCK_AI` is unset, mock mode defaults on only outside production. An unset production configuration is disabled to avoid accidental mock behavior.
- `OPENAI_API_KEY` remains server-only and is not required. No `NEXT_PUBLIC` secret variable exists.

## Technical stack

- Next.js 16 App Router
- Next.js Route Handler for the server analysis boundary
- React 19
- TypeScript in strict mode
- Tailwind CSS 4
- ESLint 9 with the Next.js configuration
- Vitest, jsdom, and React Testing Library
- npm
- Vercel as the planned deployment target
- OpenAI Responses API through server-side calls in a later phase

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

Run the Phase 3 checks with:

```bash
npm test
npm run lint
npm run build
```

The future server-side AI integration will use this placeholder:

```text
OPENAI_API_KEY=
```

No API key is required for the current Phase 3 workflow. Keep `ENABLE_MOCK_AI=true` for the working mock route. `OPENAI_MODEL` remains configurable for the later real provider.

## Current implementation status

Phase 3 is complete. A user can start with a goal alone or add pasted text, PDF/image evidence, the trusted sample, an optional category, and an output language. One validated application-server endpoint returns the existing `CaseAnalysis`; a provider-independent guided builder creates a structured `CaseProfile`, asks one consequential question, remembers corrections in the tab, stops at deterministic sufficiency, and builds the final fictional route from the profile. The automated suite contains 80 passing tests.

The remaining Build Week work is governed by a permanent phase-gated execution system. [AGENTS.md](AGENTS.md) contains canonical repository rules, [INSTRUCTIONS.md](INSTRUCTIONS.md) explains safe operation, and [docs/MASTER_BUILD_PLAN.md](docs/MASTER_BUILD_PLAN.md) contains standalone prompts for Phases 3–8. [docs/PHASE_STATUS.md](docs/PHASE_STATUS.md) is the authoritative state record.

To begin the next eligible phase in a fresh Codex session, use exactly:

```text
Read AGENTS.md, docs/MASTER_BUILD_PLAN.md, and docs/PHASE_STATUS.md. Execute the first phase marked NOT STARTED whose prerequisites are complete. Follow its full prompt. Stop after its commit and final report. Never automatically begin the next phase.
```

Phase 4 is next but remains blocked pending privately configured OpenAI API access; no secret should ever be pasted into chat.

Current limitations:

- No PDF text extraction, OCR, or image inspection.
- No goal, pasted text, or file contents are interpreted; every result comes from a labelled fictional scenario or variation.
- No OpenAI call, source retrieval, or source verification.
- No login, database, local storage, analytics, tracking, or deployment.
- Source links are clearly labelled placeholders and do not support factual reliance yet.

The internal request planner prepares the future Responses API mapping without sending it: pasted text and the trusted sample become `input_text`, PDFs become `input_file`, images become `input_image`, and a separate context block carries category, language, and reusable prompt-injection protections. Real integration still requires the OpenAI SDK/provider adapter, validated structured output, evaluation fixtures, consent, and later official-source retrieval. A client-side API key will never be used.

## Privacy behavior

Before analysis, the goal, answers, optional text, and selected `File` remain in React state for the open tab. On analysis, the goal and active optional evidence are sent only to the BurgerMapper application server as multipart form data. The server normalizes text, verifies document type and signature, runs the mock provider, and returns no original text, goal, filename, file bytes, or base64 data. The `CaseProfile` stores only a non-content evidence reference and remains in browser memory. Inputs and profiles are not intentionally persisted, logged, written to disk, or sent to an AI provider; request input is discarded from server memory after processing. Reset, refresh, or tab close clears browser state.

## Security

Future AI calls will be server-side only. Local `.env*` files are ignored except for the intentionally empty `.env.example`; never commit real credentials or expose an OpenAI API key to browser code. The public endpoint revalidates all browser input, accepts only known sample IDs and supported MIME/signature pairs, returns safe typed errors without stack traces, and marks responses `no-store`. Document content is treated as untrusted data in the future request plan. Phase 2 has no analytics, tracking, remote font, remote application asset, or `dangerouslySetInnerHTML`.

## Build Week provenance

The BurgerMapper concept and an earlier, unrelated prototype predated OpenAI Build Week 2026. No code from that prototype is included here. This repository and the submitted technical implementation are being built from scratch during Build Week. See [docs/PRIOR_WORK_DISCLOSURE.md](docs/PRIOR_WORK_DISCLOSURE.md) and the dated build log for the detailed record.

## How Codex contributed

Codex established the Phase 0 repository and helped implement Phases 1, 1.5, 2, and 3: typed domain and transport contracts, client and server validation, the in-memory API boundary, magic-byte checks, future OpenAI request planning and prompt-injection controls, the multilingual mock service, the structured `CaseProfile` and guided builder, accessible interaction behavior, tests, audits, verification, and documentation. Codex also created the phase-gated execution system. The final submission account will add later-phase evidence and accurately distinguish how Codex and GPT-5.6 were used without claiming unfinished work.

## Codex `/feedback` Session ID

Placeholder: add the final Codex `/feedback` Session ID before submission.

## Live demo

Placeholder: add the live deployment URL before submission.

## Demo video

Placeholder: add the public YouTube demo URL before submission.
