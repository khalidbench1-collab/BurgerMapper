# BurgerMapper

BurgerMapper is a Berlin-first bureaucracy navigator. Official letters can be difficult to interpret, especially across language and administrative barriers; BurgerMapper is intended to turn them into understandable, actionable routes.

## Intended Build Week workflow

The Build Week target is to let a user upload an official German letter as a PDF or image, receive a plain-language explanation, see extracted deadlines and requested actions, answer only clarification questions that could change the route, and get personalized next steps backed by official German government sources. The interface is in English, with generated routes planned in English, German, and Arabic.

Phase 2 implements the complete intake and server boundary with fixed fictional scenarios. It validates text and document inputs but does not yet interpret their contents.

## Phase 2 secure mock workflow

- Concise landing page at `/` and a case workspace at `/case`.
- Four entry methods through one analysis flow: paste letter text, upload a PDF, upload an image, or use the fictional sample.
- Plain-text input with whitespace normalization, a minimum of 20 non-whitespace characters, a visible character count, and a 20,000-character maximum.
- Drag-and-drop and keyboard file selection for PDF, PNG, JPEG, and WebP documents up to 10 MB.
- A fictional sample letter so the workflow can be tested without a personal document.
- A single `multipart/form-data` boundary at `POST /api/cases/analyze` for text, PDF, image, and sample input.
- Independent server validation, MIME and magic-byte checks, sanitized filename metadata, deterministic mock-analysis state, and a full start-over path.
- In-memory request handling with no database, file writes, content logs, analytics, or third-party transfer.
- Typed API errors, request references, no-store responses, and explicit discarded-after-processing metadata and headers.
- Hand-written English, German, and Arabic mock results; Arabic results use right-to-left layout while dates and source URLs remain readable.
- A typed analysis contract covering document facts, plain-language interpretation, deadline and urgency, requested action, required documents, uncertainty, one useful clarification question, adaptive next steps, unverified source placeholders, and a legal-information disclaimer.
- Print-friendly result styling and clear separation between extracted facts, interpretation, uncertainty, action, and sources.

Six visible orientation categories are available on the landing page and in the case workflow:

- Arrival & Registration
- Visa & Immigration
- Work & Business
- Housing & Money
- Health & Insurance
- Family & Children

Category selection is optional. It helps users begin without knowing an official procedure name and never determines legal eligibility. Arrival & Registration and Work & Business have small fictional mock variations; Visa & Immigration uses the existing residence-renewal route. Other categories retain the default route while displaying the selected context.

Mock mode does not analyze arbitrary text or documents. It demonstrates the expected route structure with fictional content and explicitly says that the pasted text or selected file was not interpreted. The browser now sends the active input to the BurgerMapper application server; the server validates it in memory and invokes the same replaceable mock provider for every input kind.

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

Run the Phase 2 checks with:

```bash
npm test
npm run lint
npm run build
```

The future server-side AI integration will use this placeholder:

```text
OPENAI_API_KEY=
```

No API key is required for the current Phase 2 workflow. Keep `ENABLE_MOCK_AI=true` for the working mock route. `OPENAI_MODEL` remains a placeholder for a later real provider.

## Current implementation status

Phase 2 is complete. Text, PDF, image, and sample inputs now cross one validated application-server endpoint and return the existing typed `CaseAnalysis`. The implementation preserves six optional categories, multilingual mock routes, clarification adaptation, Arabic RTL, reset and print behavior, and the PWA foundation. The automated suite contains 59 passing tests.

Current limitations:

- No PDF text extraction, OCR, or image inspection.
- No pasted text or file contents are interpreted; every result comes from a labelled fictional scenario or variation.
- No OpenAI call, source retrieval, or source verification.
- No login, database, local storage, analytics, tracking, or deployment.
- Source links are clearly labelled placeholders and do not support factual reliance yet.

The internal request planner prepares the future Responses API mapping without sending it: pasted text and the trusted sample become `input_text`, PDFs become `input_file`, images become `input_image`, and a separate context block carries category, language, and reusable prompt-injection protections. Real integration still requires the OpenAI SDK/provider adapter, validated structured output, evaluation fixtures, consent, and later official-source retrieval. A client-side API key will never be used.

## Privacy behavior

Before analysis, text and the selected `File` remain in React state for the open tab. On analysis, the active input is sent only to the BurgerMapper application server as multipart form data. The server normalizes text, verifies document type and signature, runs the mock provider, and returns no original text, filename, file bytes, or base64 data. Inputs are not intentionally stored, logged, written to disk, or sent to an AI provider and are discarded from request memory after processing. The response carries `retentionStatus: discarded-after-processing` and the matching `X-BurgerMapper-Retention` header. Switching input methods requires confirmation; reset, refresh, or tab close clears browser state.

## Security

Future AI calls will be server-side only. Local `.env*` files are ignored except for the intentionally empty `.env.example`; never commit real credentials or expose an OpenAI API key to browser code. The public endpoint revalidates all browser input, accepts only known sample IDs and supported MIME/signature pairs, returns safe typed errors without stack traces, and marks responses `no-store`. Document content is treated as untrusted data in the future request plan. Phase 2 has no analytics, tracking, remote font, remote application asset, or `dangerouslySetInnerHTML`.

## Build Week provenance

The BurgerMapper concept and an earlier, unrelated prototype predated OpenAI Build Week 2026. No code from that prototype is included here. This repository and the submitted technical implementation are being built from scratch during Build Week. See [docs/PRIOR_WORK_DISCLOSURE.md](docs/PRIOR_WORK_DISCLOSURE.md) and the dated build log for the detailed record.

## How Codex contributed

Codex established the Phase 0 repository and helped implement Phases 1, 1.5, and 2: typed domain and transport contracts, client and server validation, the in-memory API boundary, magic-byte checks, future OpenAI request planning and prompt-injection controls, the multilingual mock service, accessibility behavior, tests, audits, verification, and documentation. The final submission account will add later-phase evidence and accurately distinguish how Codex and GPT-5.6 were used without claiming unfinished work.

## Codex `/feedback` Session ID

Placeholder: add the final Codex `/feedback` Session ID before submission.

## Live demo

Placeholder: add the live deployment URL before submission.

## Demo video

Placeholder: add the public YouTube demo URL before submission.
