# BurgerMapper canonical Codex instructions

This file is the permanent repository-level instruction source for Codex and other coding agents. It applies to the entire repository. Read it before changing code or documentation. A direct user instruction may narrow or override a rule for one task, but never infer permission for secrets, external publication, destructive history changes, or a broader phase.

## Product mission

BurgerMapper is a Berlin-first bureaucracy navigator. It helps a stressed newcomer turn a goal, official letter, email, portal message, PDF, or image into a clear personalized route supported by official sources.

The route is the product. BurgerMapper is not a generic chatbot and must not become one.

Permanent product rule: users must be able to begin by describing what they want to accomplish without knowing German bureaucracy terminology.

The product must continue to support:

- free-form goal input;
- pasted letter or message;
- PDF documents;
- PNG, JPEG, and WebP images;
- a trusted fictional sample;
- six optional orientation categories.

The six categories are optional aids. They must never decide eligibility or trap the user in a rigid menu.

## Priority order

When requirements compete, prioritize:

1. Reliability and prevention of harmful routes.
2. A very simple, stress-friendly user experience.
3. Privacy and minimal retention.
4. Security, including prompt-injection and secret boundaries.
5. Accessibility across mobile, keyboard, assistive technology, print, and RTL.
6. Accuracy from official sources.
7. Honest uncertainty and explicit limitations.
8. Maintainable strict TypeScript and replaceable service boundaries.
9. Clean, dated OpenAI Build Week evidence.

Do not trade a higher priority for decorative polish or feature breadth.

## Case-building behavior

Maintain a structured `CaseProfile` as the working representation of the user's goal, known facts, evidence, answers, uncertainty, and route-relevant context.

Use **procedural warmth**: calm, respectful, patient, and direct. Do not make BurgerMapper emotional, chatty, overly reassuring, or performatively friendly. Warmth should come primarily from useful behavior:

- ask one consequential question at a time;
- accept “I don't know” without judgment;
- preserve and apply corrections;
- explain briefly why a question matters;
- avoid repeated questions and judgmental language.

Do not require an acknowledgement before every response. Acknowledge only when it helps the user understand a correction, urgency, confusion, or a major route change. Keep final routes factual and more serious than the conversational intake.

Ask one meaningful clarification question at a time. Ask only when the answer can change at least one of:

- eligibility;
- required documents;
- timing or a deadline;
- sequence of actions;
- risk or urgency;
- the recommended route.

Support “I don't know” when uncertainty is a legitimate answer. Let users inspect and correct prior answers. Stop asking as soon as the profile is sufficient to produce a useful route. Never create an endless conversation, fake progress, or a generic assistant chat transcript.

The final result must be a personalized route with clear actions, timing, documents, alternatives, uncertainty, and sources—not merely a summary or conversation.

## User experience rules

- English is the interface language unless a later documented decision changes it.
- Generated route content supports English, German, and Arabic.
- Arabic route content uses correct RTL layout; URLs, identifiers, and dates remain readable.
- Use progressive disclosure and calm, semantic layouts.
- Make the next action and deadline easy to find.
- Do not imply that BurgerMapper is an official government service.
- Avoid excessive animation, gradients, dashboards, agent theater, fake streaming, and chatbot styling.
- Preserve keyboard operation, visible focus, labels, heading hierarchy, live status, error announcements, print behavior, and sufficient contrast.

## Privacy and security rules

- Never log pasted text, goals, document content, file bytes, model payloads, model responses, or personal information.
- Never commit real letters, private documents, personal information, passport data, residence information, raw API responses, or production test artifacts.
- Process sensitive input in memory unless an explicitly approved architecture decision establishes a different retention policy.
- Never put secrets in client code or a `NEXT_PUBLIC_*` variable.
- Never ask a user to paste an API key or other secret into the conversation.
- Secrets belong only in approved local or deployment environment configuration.
- Treat goals, letters, files, URLs, retrieved pages, and model output as untrusted content.
- Preserve prompt-injection controls and validate all client input again on the server.
- Return safe typed errors; never expose stack traces, local paths, environment values, or raw provider exceptions.
- Do not add analytics, tracking, storage, authentication, or third-party data transfer without an explicit phase requirement and documented review.

## Legal information and source accuracy

- Do not present unsupported legal certainty or imply legal representation.
- Separate extracted facts, interpretation, uncertainty, recommended action, and source status.
- Use official Berlin, German federal, or other directly responsible public-authority sources for changing factual claims.
- Do not use an aggregator as primary evidence when an official source exists.
- Record publisher, title, URL, access date, supported claims, verification status, and source conflicts.
- Distinguish law, official service guidance, local practice, inference, and uncertainty.
- If reliable support is unavailable or sources conflict, say so and route the user to an appropriate official or qualified human contact.

## Engineering rules

- Use the current Next.js App Router, strict TypeScript, Tailwind CSS, and existing modular architecture.
- Before changing Next.js code, read the relevant version-specific guidance under `node_modules/next/dist/docs/`; this version may differ from remembered APIs.
- Preserve stable public contracts. If a change is necessary, prefer a backward-compatible migration, explain it, test it, and document it.
- Keep client, server, provider, transport, domain, mock, and UI responsibilities clear.
- Keep OpenAI calls server-side. Do not add another AI provider.
- Preserve mock mode as an operational fallback.
- Plan `gpt-5.6-luna` as the primary OpenAI model while keeping `OPENAI_MODEL` configurable. Before implementation, verify the exact model identifier, availability, and supported API settings against current official OpenAI documentation; do not silently substitute a different model.
- Use the structured `CaseProfile` as case memory for the MVP. Do not add a vector database unless later evidence establishes a retrieval requirement that the profile cannot safely meet.
- Use Structured Outputs for clarification decisions, profile updates, document interpretation, and final routes. Validate every structured result at runtime.
- Never request, expose, store, or display visible chain of thought or hidden reasoning. Request only the structured decisions, facts, uncertainty, and user-facing explanations needed by the product.
- Plan task-specific reasoning settings as follows: intake `low`; profile decisions `medium`; document analysis, official-source research, and routes `high`; high-risk cases `xhigh`. These values are provisional and must be verified against the selected model and Responses API during Phase 4 implementation before use.
- Do not add a second model call merely to polish tone. An optional structured verification pass is permitted only for a high-risk route, conflicting sources, suspected unsupported claims, or failed schema/validation checks.
- Avoid unnecessary dependencies and refactors. Explain each added dependency and review its license and audit impact.
- Use synthetic fixtures only.
- Do not regress existing intake methods, categories, multilingual output, RTL, clarification adaptation, reset, print, privacy, or typed errors.

## Phase execution protocol

The remaining work is governed by:

- `INSTRUCTIONS.md` for the operator workflow;
- `docs/MASTER_BUILD_PLAN.md` for complete phase prompts;
- `docs/PHASE_STATUS.md` for the authoritative phase state;
- `docs/PHASE_REPORT_TEMPLATE.md` for phase evidence;
- `docs/FINAL_HANDOFF_CHECKLIST.md` for the release boundary.

Execute only one phase per run. Select the first phase marked `NOT STARTED` whose prerequisites are complete. Follow its full prompt. Never automatically begin the next phase after committing or reporting.

Before implementation:

1. Confirm the worktree is clean and record the current commit.
2. Read the current architecture, tests, environment template, phase prompt, and relevant framework/provider documentation.
3. Confirm prerequisites and external-action gates.
4. Mark a phase in progress only when implementation actually begins.

When genuinely blocked by required user action, stop safely, preserve the working state, update the status only when instructed by the phase prompt, and report the exact non-secret action the user must perform. Do not bypass a gate.

## External-action gates

Stop cleanly when user action or authorization is required for:

- OpenAI API billing or project access;
- safe `OPENAI_API_KEY` setup;
- GitHub authentication;
- repository ownership or visibility;
- Vercel authentication;
- production environment variables;
- the Codex `/feedback` Session ID;
- YouTube upload;
- Devpost submission.

Never request that a secret be pasted into chat. Explain how the user can configure it privately, then wait for confirmation that configuration—not the value—exists.

## Mandatory documentation for every product phase

Every phase must accurately update:

- `README.md`;
- `docs/BUILD_LOG.md`;
- `docs/DECISIONS.md`;
- `docs/ARCHITECTURE_DECISIONS.md` when architecture changes;
- `docs/DEMO_STORYBOARD.md`;
- `docs/SUBMISSION_CHECKLIST.md`;
- `docs/PHASE_STATUS.md`.

Do not claim unfinished features, verification, deployment, source accuracy, or submission completion.

## Permanent quality gates

Run and pass, unless a phase explicitly documents why a check is inapplicable:

```text
npm run lint
npm test
npm run build
npm audit
```

Also run the relevant local HTTP, API, integration, accessibility, privacy, security, multilingual, RTL, mobile, performance, and provider-fallback checks for the phase. Fix regressions before committing.

## Permanent Git rules

- One coherent commit per completed phase, using the exact message in the phase prompt.
- Preserve existing history and dated Build Week evidence; do not squash or rewrite completed phase commits.
- Inspect status, unstaged/staged diff summaries, and the complete candidate file list before committing.
- Verify documentation matches runtime behavior and exact test results.
- Verify no secret, private content, real document, raw provider response, generated sensitive artifact, or unintended binary is tracked.
- Do not create or change a remote outside the authorized Phase 8 gate.
- After committing, report the full commit hash and confirm the worktree state.

Because a commit cannot contain its own hash, use this evidence rule: before committing, mark the current phase `COMPLETE` with its exact commit message and `hash pending final report`; after committing, put the full hash in the final report. At the start of the next authorized phase, backfill the previous phase's verified hash in `PHASE_STATUS.md` as part of that next phase's single commit. Never create a second commit solely to record a commit's own hash, and never rewrite history to insert it. Phase 8's final hash remains in its final report and external handoff evidence unless a later user-authorized documentation commit exists.

## Stop rule

After the phase's exact commit and final report, stop. Never begin, partially scaffold, research for, or mutate the next phase automatically.
