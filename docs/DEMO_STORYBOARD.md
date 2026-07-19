# Three-minute demo storyboard — Phase 7 draft

> Draft based on the Phase 7 implementation. Mock mode, consent-gated real mode, post-sufficiency cited routes, deadline-first results, and local print/plain-text export are implemented. Phases 6 and 7 made no API call. The source catalog is a dated, narrow official snapshot rather than live web research, and final visual capture in a real browser is still pending before recording.

The storyboard stays limited to behavior that actually exists after Phase 3 and will be updated by every later product phase.

## 0:00–0:18 — Problem hook

Show why a newcomer should be able to state an outcome in ordinary language and receive a route without knowing a German procedure name or navigating a chat transcript.

## 0:18–0:40 — Start with the goal

Open `/case` and enter a fictional goal such as “I need to renew my residence permit.” Show that this is the primary input and can be submitted without a document.

## 0:40–0:58 — Add optional context

Choose **Visa & Immigration** and add the built-in example letter. Briefly show that paste and PDF/image upload remain alternatives, while category and evidence are optional.

## 0:58–1:20 — Privacy-controlled analysis choice

Show demo mode first: the server validates in memory, sends nothing to an AI provider, and intentionally stores nothing. Then show the real-mode consent state in a prepared local configuration: it explains the BurgerMapper-to-OpenAI transfer and does not send until checked. Do not click it during recording unless the user has approved that exact synthetic call.

## 1:20–1:47 — One useful question

Show the editable profile summary and the single employment-status question with its “Why this changes the route” explanation. In demo mode, choose **I don't know** and show uncertainty retained with a safe verification step. Explain that real mode uses schema-validated question-or-sufficient output and rebuilds the profile/route from the answer.

## 1:47–2:08 — Correct the case

Edit the goal or category, rebuild the question, then change the previous answer. Show that the correction is remembered in the current tab and that the route is regenerated from the profile rather than an endless conversation.

## 2:08–2:31 — Route and Arabic RTL

Show that the final fictional route opens with the deadline/urgency card and the "Your first action" card before the detailed summary. Briefly click "Download route" to show the local plain-text export next to "Print route". Start over, choose Arabic, rebuild the sample, and show right-to-left output while dates and source URLs remain readable.

## 2:27–2:47 — Cited claims and honest limits

After the profile becomes sufficient, show verified official sources connected beside the exact route claims they support. Point out the law/service-guidance/administrative-practice labels, publisher and access date, and the document-fact warning on the detected deadline. Switch to Arabic and show that the result remains RTL while official URLs stay LTR. Briefly choose an unsupported category to show an honest no-source limitation and authority escalation rather than invented certainty.

## 2:47–3:00 — Engineering evidence

Show `POST /api/cases/analyze`, privacy-minimal `POST /api/cases/research`, strict `CaseProfile`, atomic claim/source mappings, the exact official-domain allowlist, 155 passing tests, the 11-case synthetic release gate, dated commits, and prior-work disclosure. Briefly mention typed outage/rate fallback and content-free cost accounting. Credit Codex for evidenced implementation. Describe the Luna smoke only as project/model/schema access evidence; do not claim it produced or verified the demonstrated route.
