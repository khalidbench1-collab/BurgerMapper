# Three-minute demo storyboard — Phase 4 draft

> Draft based on the Phase 4 implementation. Mock mode is fully working. Real OpenAI analysis is implemented and covered with mocked transport, but no paid live request has been authorized or run; do not present real output in the demo until one synthetic live check is separately approved and passes. No source search or verification exists yet.

The storyboard stays limited to behavior that actually exists after Phase 3 and will be updated by every later product phase.

## 0:00–0:18 — Problem hook

Show why a newcomer should be able to state an outcome in ordinary language and receive a route without knowing a German procedure name or navigating a chat transcript.

## 0:18–0:40 — Start with the goal

Open `/case` and enter a fictional goal such as “I need to renew my residence permit.” Show that this is the primary input and can be submitted without a document.

## 0:40–0:58 — Add optional context

Choose **Visa & Immigration** and add the trusted fictional sample. Briefly show that paste and PDF/image upload remain alternatives, while category and evidence are optional.

## 0:58–1:20 — Privacy-controlled analysis choice

Show mock mode first: the server validates in memory, sends nothing to an AI provider, and intentionally stores nothing. Then show the real-mode consent state in a prepared local configuration: it explains the BurgerMapper-to-OpenAI transfer and does not send until checked. Do not click it during recording unless the user has approved that exact synthetic call.

## 1:20–1:47 — One useful question

Show the editable profile summary and the single employment-status question with its “Why this changes the route” explanation. In mock mode, choose **I don't know** and show uncertainty retained with a safe verification step. Explain that real mode uses schema-validated question-or-sufficient output and rebuilds the profile/route from the answer.

## 1:47–2:08 — Correct the case

Edit the goal or category, rebuild the question, then change the previous answer. Show that the correction is remembered in the current tab and that the route is regenerated from the profile rather than an endless conversation.

## 2:08–2:31 — Route and Arabic RTL

Show the deadline and first actions in the final fictional route. Start over, choose Arabic, rebuild the sample, and show right-to-left output while dates and source URLs remain readable.

## 2:27–2:43 — Honest source limitation

Show **Placeholder — not verified** labels and the legal-information disclaimer. Official-source research begins only after a future real case profile is ready.

## 2:43–3:00 — Engineering evidence

Show `POST /api/cases/analyze`, strict `CaseProfile`, provider-independent mock/OpenAI adapters, stable `CaseAnalysis`, explicit consent, prompt-injection boundary, 107 passing tests, dated commits, and prior-work disclosure. Credit Codex for evidenced implementation. Do not claim `gpt-5.6-luna` produced a tested route until a separately approved live call occurs.
