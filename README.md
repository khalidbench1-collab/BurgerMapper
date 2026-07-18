# BurgerMapper

BurgerMapper is a Berlin-first bureaucracy navigator. Official letters can be difficult to interpret, especially across language and administrative barriers; BurgerMapper is intended to turn them into understandable, actionable routes.

## Intended Build Week workflow

The Build Week target is to let a user upload an official German letter as a PDF or image, receive a plain-language explanation, see extracted deadlines and requested actions, answer only clarification questions that could change the route, and get personalized next steps backed by official German government sources. The interface is in English, with generated routes planned in English, German, and Arabic.

Phase 1 implements this interaction with a fixed fictional scenario. It does not yet extract or analyze the selected document.

## Phase 1.5 mock workflow

- Concise landing page at `/` and a case workspace at `/case`.
- Four entry methods through one analysis flow: paste letter text, upload a PDF, upload an image, or use the fictional sample.
- Plain-text input with whitespace normalization, a minimum of 20 non-whitespace characters, a visible character count, and a 20,000-character maximum.
- Drag-and-drop and keyboard file selection for PDF, PNG, JPEG, and WebP documents up to 10 MB.
- A fictional sample letter so the workflow can be tested without a personal document.
- In-memory document metadata, removable selection, deterministic mock-analysis state, and a full start-over path.
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

Mock mode does not analyze arbitrary text or documents. It demonstrates the expected route structure with fictional content and explicitly says that the pasted text or selected file was not interpreted.

## Technical stack

- Next.js 16 App Router
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

Run the Phase 1.5 checks with:

```bash
npm test
npm run lint
npm run build
```

The future server-side AI integration will use this placeholder:

```text
OPENAI_API_KEY=
```

No API key is required for the current Phase 1.5 workflow. `OPENAI_MODEL` and `ENABLE_MOCK_AI` are documented in `.env.example` for later phases.

## Current implementation status

Phase 1.5 is complete. The front-end intake now covers pasted text, PDF, image, and sample inputs through one discriminated `CaseInput` contract, plus six optional product categories, multilingual mock routes, clarification-driven adaptation, focused tests, and the PWA foundation.

Current limitations:

- No PDF text extraction, OCR, or image inspection.
- No pasted text or file contents are interpreted; every result comes from a labelled fictional scenario or variation.
- No OpenAI call, API route, source retrieval, or source verification.
- No login, database, local storage, analytics, tracking, or deployment.
- Source links are clearly labelled placeholders and do not support factual reliance yet.

Real OpenAI integration will require a server-only implementation of the existing analysis-service contract, validated structured output, safe document extraction, official-source retrieval and verification, error handling, and a mock fallback. A client-side API key will never be used.

## Privacy behavior

For a user-selected document, the browser keeps the `File` object only in React state for the open case. Phase 1.5 reads only browser-provided metadata (name, MIME type, and size); it does not read file bytes. Pasted text is also kept only in React state and rendered as textarea text—never as HTML or Markdown. Switching an active input method requires confirmation before clearing it. Starting over, refreshing, or closing the tab drops the current text or file. Nothing is logged, transmitted, or persisted.

## Security

Future AI calls will be server-side only. Local `.env*` files are ignored except for the intentionally empty `.env.example`; never commit real credentials or expose an OpenAI API key to browser code. Phase 1.5 has no API route, analytics, tracking, remote font, or remote application asset and never uses `dangerouslySetInnerHTML`.

## Build Week provenance

The BurgerMapper concept and an earlier, unrelated prototype predated OpenAI Build Week 2026. No code from that prototype is included here. This repository and the submitted technical implementation are being built from scratch during Build Week. See [docs/PRIOR_WORK_DISCLOSURE.md](docs/PRIOR_WORK_DISCLOSURE.md) and the dated build log for the detailed record.

## How Codex contributed

Codex established the Phase 0 repository and helped implement Phases 1 and 1.5: the typed domain and discriminated input contracts, local-only file/text validation and state model, optional category orientation, multilingual mock service, reusable interface components, accessibility behavior, route adaptation, test suite, dependency remediation, verification, and documentation. The final submission account will add later-phase evidence and accurately distinguish how Codex and GPT-5.6 were used without claiming unfinished work.

## Codex `/feedback` Session ID

Placeholder: add the final Codex `/feedback` Session ID before submission.

## Live demo

Placeholder: add the live deployment URL before submission.

## Demo video

Placeholder: add the public YouTube demo URL before submission.
