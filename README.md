# BurgerMapper

BurgerMapper is a Berlin-first bureaucracy navigator. Official letters can be difficult to interpret, especially across language and administrative barriers; BurgerMapper is intended to turn them into understandable, actionable routes.

## Intended Build Week workflow

The planned workflow will let a user upload an official German letter as a PDF or image, receive a plain-language explanation, see extracted deadlines and requested actions, answer only clarification questions that could change the route, and get personalized next steps backed by official German government sources. The interface will be in English, with generated routes available in English, German, and Arabic.

This describes the Build Week target, not the current implementation.

## Technical stack

- Next.js 16 App Router
- React 19
- TypeScript in strict mode
- Tailwind CSS 4
- ESLint 9 with the Next.js configuration
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

The future server-side AI integration will use this placeholder:

```text
OPENAI_API_KEY=
```

No API key is required for the current Phase 0 page. `OPENAI_MODEL` and `ENABLE_MOCK_AI` are also documented in `.env.example` for later phases.

## Current implementation status

Phase 0 is complete: the repository foundation, responsive temporary landing page, PWA manifest baseline, environment template, lint/build configuration, and Build Week documentation are present. Letter uploads, analysis, clarification questions, multilingual routes, official-source retrieval, OpenAI API calls, and the full mock AI path are not implemented yet.

## Security

AI calls will be server-side only. Local `.env*` files are ignored except for the intentionally empty `.env.example`; never commit real credentials or expose an OpenAI API key to browser code.

## Build Week provenance

The BurgerMapper concept and an earlier, unrelated prototype predated OpenAI Build Week 2026. No code from that prototype is included here. This repository and the submitted technical implementation are being built from scratch during Build Week. See [docs/PRIOR_WORK_DISCLOSURE.md](docs/PRIOR_WORK_DISCLOSURE.md) and the dated build log for the detailed record.

## How Codex contributed

Placeholder for the final account of how Codex and GPT-5.6 supported planning, implementation, testing, debugging, and documentation. This section will be completed before submission and will not claim work that has not occurred.

## Codex `/feedback` Session ID

Placeholder: add the final Codex `/feedback` Session ID before submission.

## Live demo

Placeholder: add the live deployment URL before submission.

## Demo video

Placeholder: add the public YouTube demo URL before submission.
