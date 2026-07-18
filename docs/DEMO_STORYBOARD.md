# Three-minute demo storyboard — Phase 3 draft

> Draft based on the working Phase 3 implementation. All profile decisions and routes remain deterministic fictional mock output. No OpenAI request, OCR, source search, or genuine goal/document interpretation occurs yet.

The storyboard stays limited to behavior that actually exists after Phase 3 and will be updated by every later product phase.

## 0:00–0:18 — Problem hook

Show why a newcomer should be able to state an outcome in ordinary language and receive a route without knowing a German procedure name or navigating a chat transcript.

## 0:18–0:40 — Start with the goal

Open `/case` and enter a fictional goal such as “I need to renew my residence permit.” Show that this is the primary input and can be submitted without a document.

## 0:40–0:58 — Add optional context

Choose **Visa & Immigration** and add the trusted fictional sample. Briefly show that paste and PDF/image upload remain alternatives, while category and evidence are optional.

## 0:58–1:20 — Privacy-controlled mock profile

Build the case. State that the server validates the goal and evidence in memory, sends nothing to an AI provider, stores nothing intentionally, and discards request input. Mock mode demonstrates a structured `CaseProfile` without understanding the goal or sample.

## 1:20–1:47 — One useful question

Show the editable profile summary and the single employment-status question with its “Why this changes the route” explanation. Choose **I don't know** and show uncertainty retained with a safe verification step.

## 1:47–2:08 — Correct the case

Edit the goal or category, rebuild the question, then change the previous answer. Show that the correction is remembered in the current tab and that the route is regenerated from the profile rather than an endless conversation.

## 2:08–2:31 — Route and Arabic RTL

Show the deadline and first actions in the final fictional route. Start over, choose Arabic, rebuild the fictional case, and show right-to-left output while dates and source URLs remain readable.

## 2:27–2:43 — Honest source limitation

Show **Placeholder — not verified** labels and the legal-information disclaimer. Official-source research begins only after a future real case profile is ready.

## 2:43–3:00 — Engineering evidence

Show `POST /api/cases/analyze`, strict `CaseProfile`, provider-independent `CaseBuilderService`, stable `CaseAnalysis`, 80 passing tests, dated commits, and prior-work disclosure. Credit Codex only for evidenced architecture, implementation, testing, verification, and documentation work; add GPT-5.6 contributions after they occur.
