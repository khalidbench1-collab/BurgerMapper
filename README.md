# BurgerMapper

BurgerMapper is a Berlin-first bureaucracy navigator. A user can begin by describing what they need to get done without knowing the German procedure name, optionally add an official letter or message, and build an understandable, actionable route.

## Intended Build Week workflow

The Build Week target is to let a user state a goal, optionally add an official German letter as text, PDF, or image, receive a plain-language explanation, answer only clarification questions that could change the route, and get personalized next steps backed by official German government sources. The interface is in English, with generated routes in English, German, and Arabic.

Phase 5 adds official-source research after the structured case profile is sufficient. The route—not search results—remains the product: supported changing claims are connected to official Berlin or German federal evidence beside the relevant step, while document facts, inference, conflict, and uncertainty remain distinct.

## Phase 6 reliability-hardened workflow

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
- A separate `POST /api/cases/research` boundary that accepts only an abstract route topic, optional category, language, and profile-sufficiency state—never a goal, name, raw letter, pasted text, file, or model response.
- Official research starts only after the profile is sufficient. Before the consequential question is answered, the endpoint returns a safe typed error.
- Atomic route claims distinguish federal law, official service guidance, Berlin administrative practice, document facts, inference, and unresolved uncertainty.
- Citations appear beside the exact supported route step. Source cards show publisher, title, canonical URL, domain, access date, jurisdiction, support relationship, verification status, and conflict state.
- Deadlines detected in a letter are labelled as document facts and must be confirmed against the original unless an official source separately supports them.
- Anonymous analysis and research boundaries now have typed process-local request and endpoint-wide concurrency limits, safe `Retry-After` responses, bounded client-hash state, and aggregate-only in-memory operational metrics.
- A versioned synthetic evaluation gate covers routine, ambiguous, missing-data, high-risk, multilingual, correction, prompt-injection, citation, deadline, fallback, latency, and cost behavior. See [docs/RELIABILITY_REPORT.md](docs/RELIABILITY_REPORT.md).

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

The current official-source provider is a deterministic server-side snapshot inspected on 2026-07-18. It covers the fictional residence-permit renewal, Berlin address registration, and freelance tax-registration routes. Allowed domains are limited to `service.berlin.de`, `www.berlin.de`, `www.gesetze-im-internet.de`, and `www.elster.de`. Other topics retain an honest no-source or unverified state. Automated tests do not depend on live web availability, and the application does not yet refresh sources at request time.

## Phase 7 experience polish

- The homepage and case screen now describe the active analysis mode truthfully: mock configurations state that nothing is sent to an AI provider, and real configurations state that input goes to OpenAI only after explicit consent on the case screen.
- The final route now opens with the deadline/urgency card and a "Your first action" card before the extracted facts and long summary, so the most consequential information is first in reading, print, and export order.
- A "Download route" button saves the already rendered structured route as a local plain-text file (`burgermapper-route.txt`) assembled entirely in the browser from `src/lib/route-export.ts`. Nothing is uploaded or persisted, and the fixed file name cannot contain personal data. Printing remains available.
- A persistent header note and shared footer state that BurgerMapper is an independent guide, not an official government service, and provides legal information rather than legal advice. No official logo, seal, or authority branding is used.
- A skip-to-content link precedes the header on every page, and both pages expose a `main-content` landmark target.
- User-facing source status copy no longer references internal build-phase names in any language.
- The PWA manifest describes the goal-first product, declares the favicon as an installability icon, and makes no offline claim.
- The Build Week phase label was removed from the header in favor of the permanent independent-guide identity.
- All user-visible copy now uses customer vocabulary: "Demo mode", "demo route", and "example letter"/"example case" replace the internal "mock" and "fictional sample" terms, and no rendered text references Build Week, prototypes, or build phases. Internal identifiers (`ENABLE_MOCK_AI`, `isMock`, mock providers, sample IDs) are unchanged. Every honesty obligation remains in product language: demo routes state that they come from an example case, were not interpreted by AI, are not legal advice, and cite unverified sources as such.

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

Run the Phase 6 checks with:

```bash
npm test
npm run eval
npm run lint
npm run build
npm audit
```

The safe environment template contains:

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-luna
ENABLE_MOCK_AI=true
```

No API key is required for mock mode. To test real mode, configure the key privately in `.env.local`, set `ENABLE_MOCK_AI=false`, and leave the key out of source, browser code, logs, screenshots, and conversation. Never commit `.env.local`.

## Current implementation status

Phases 6 and 7 are complete. The experience now leads with the deadline and first action, keeps a visible non-government identity, and offers local print and plain-text export of the route. A user can start with a goal alone or add pasted text, PDF/image evidence, the trusted sample, an optional category, and an output language. The analysis boundary returns `CaseAnalysis` plus an optional structured `CaseProfile`; after sufficiency, the source-research boundary returns atomic claims, official evidence, and step mappings. Real analysis remains consent-gated and mock analysis remains fully operational without a key. Process-local anonymous limits, safe source-outage behavior, content-free cost/latency metrics, and machine-checkable synthetic release blockers now guard these paths.

The automated suite contains 155 passing tests across 22 files. `npm run eval` separately passes 5 release-evaluation tests over 11 versioned synthetic cases. Automated provider and evaluation tests use injected or deterministic synthetic data and cannot spend API credit. One separately authorized, bounded synthetic Luna smoke request succeeded during Phase 5 on 2026-07-18 with 77 total tokens and an estimated cost of USD 0.000227; Phase 6 made no OpenAI call and recorded no prompt or output content.

The remaining Build Week work is governed by a permanent phase-gated execution system. [AGENTS.md](AGENTS.md) contains canonical repository rules, [INSTRUCTIONS.md](INSTRUCTIONS.md) explains safe operation, and [docs/MASTER_BUILD_PLAN.md](docs/MASTER_BUILD_PLAN.md) contains standalone prompts for Phases 3–8. [docs/PHASE_STATUS.md](docs/PHASE_STATUS.md) is the authoritative state record.

To begin the next eligible phase in a fresh Codex session, use exactly:

```text
Read AGENTS.md, docs/MASTER_BUILD_PLAN.md, and docs/PHASE_STATUS.md. Execute the first phase marked NOT STARTED whose prerequisites are complete. Follow its full prompt. Stop after its commit and final report. Never automatically begin the next phase.
```

Phase 8 is next: GitHub, deployment, release candidate, and submission handoff. It pauses at external authentication and ownership gates and must not begin automatically.

Current limitations:

- No local PDF text extraction or OCR; real mode sends supported files directly to the Responses API.
- Official sources are a narrow dated snapshot, not a live crawler. Only three fictional route topics have curated cited evidence; other categories retain an honest no-source or placeholder state.
- The successful live Luna smoke established project/model/schema access only. It did not evaluate real document quality, legal accuracy, multilingual quality, source research, or production behavior.
- No login, database, local storage, analytics, tracking, or deployment.
- Anonymous endpoint limits are bounded, in-memory, and per process, so a multi-instance public deployment still needs platform-level abuse protection.
- A real-browser review was completed on 2026-07-19 with Chrome DevTools against the production build: 320 px and desktop layouts, keyboard and skip-link behavior, Arabic RTL with LTR URLs, and Lighthouse accessibility/best-practices/SEO scores of 100 on the homepage and a completed route. Automated checks cannot replace human assistive technology, so a screen-reader walkthrough is still recommended before submission.
- A model can be wrong, miss text, or misread a deadline; outputs remain legal information rather than legal advice.

The request planner now feeds the real server provider: pasted text and the trusted sample become `input_text`, PDFs become `input_file`, images become `input_image`, and a separate context block carries category, language, clarification answers, and reusable prompt-injection protections. A client-side API key is never used.

## Privacy behavior

Before analysis, the goal, answers, optional text, and selected `File` remain in React state for the open tab. On analysis they are sent to the BurgerMapper server as multipart form data. The server normalizes text, verifies document type/signature, and processes the request in memory. Mock mode makes no third-party transfer. Real mode requires explicit consent and sends the minimum needed goal, evidence, category/language context, and security instructions to OpenAI; the request sets `store: false`. After sufficiency, research sends only an abstract topic, category, language, and sufficiency flag to the BurgerMapper server; the curated provider sends no private query or case content externally. BurgerMapper does not intentionally persist or log content and reports application-memory discard, but this does not promise provider deletion for real OpenAI analysis: published default abuse-monitoring retention may be up to 30 days, and project data-sharing choices also apply. Reset, refresh, or tab close clears browser state.

## Security

AI calls are server-side only. Local `.env*` files are ignored except for the safe `.env.example`; never commit credentials or expose an OpenAI API key to browser code. The public endpoints revalidate browser input, reject private fields at the research boundary, require real-transfer consent, enforce process-local anonymous request and endpoint-wide concurrency limits with bounded client-hash state, return safe typed errors without stack traces or raw provider messages, and mark responses `no-store`, `nosniff`, and no-referrer. Goals, documents, and retrieved pages are untrusted evidence that cannot override application instructions or trigger link following. Canonical URLs must remain HTTPS and on the allowlist; cross-domain redirects and stale, unavailable, or incomplete evidence are downgraded. Aggregate operational metrics contain counts, latency bands, token/retry totals, and estimated cost only—never content or identifiers. No chain of thought is requested or retained. The app has no analytics, tracking, remote font, remote application asset, or `dangerouslySetInnerHTML`.

## Build Week provenance

The BurgerMapper concept and an earlier, unrelated prototype predated OpenAI Build Week 2026. No code from that prototype is included here. This repository and the submitted technical implementation are being built from scratch during Build Week. See [docs/PRIOR_WORK_DISCLOSURE.md](docs/PRIOR_WORK_DISCLOSURE.md) and the dated build log for the detailed record.

## How Codex contributed

Codex established the Phase 0 repository and helped implement Phases 1 through 6: typed contracts, validation, in-memory boundaries, multimodal intake, structured `CaseProfile`, guided builder, server-only Responses integration, consent, prompt-injection controls, official-domain allowlisting, atomic claim-to-source mappings, cited-route rendering, synthetic release evaluations, abuse/cost controls, audits, verification, and documentation. The only live Luna evidence is the content-free Phase 5 synthetic smoke metadata; Phase 6 was fully offline and no real personal document was used. Phase 7 experience polish was implemented by Claude (Anthropic's coding agent) under the same phase protocol after Codex reached a usage limit; Codex remains the agent that creates and verifies the phase commits.

## Codex `/feedback` Session ID

Placeholder: add the final Codex `/feedback` Session ID before submission.

## Live demo

Placeholder: add the live deployment URL before submission.

## Demo video

Placeholder: add the public YouTube demo URL before submission.
