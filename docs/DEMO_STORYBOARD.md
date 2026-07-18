# Three-minute demo storyboard — Phase 2 draft

> Draft based on the working Phase 2 implementation. All analysis remains fictional mock output. No OpenAI request, OCR, source search, or document interpretation occurs yet.

Planning checkpoint: the repository now contains a phase-gated execution system for the remaining work, but this did not add or change a product scene. The storyboard stays limited to behavior that actually exists after Phase 2 and will be updated by every later product phase.

## 0:00–0:18 — Problem hook

Show why a stressed newcomer needs the purpose, deadline, required documents, uncertainty, and next route from an official letter—not a chat transcript or knowledge of a procedure name.

## 0:18–0:35 — Choose optional context

Choose **Visa & Immigration** on the landing page. Show the category preselected on `/case`, then note that it can be changed or cleared and never determines eligibility.

## 0:35–0:57 — Choose one of four inputs

Show Paste text, PDF/image upload, and Try sample as one calm intake. Use only the fictional sample for the recorded demo. Explain that the active input now goes to the BurgerMapper application server for in-memory validation.

## 0:57–1:20 — Privacy-controlled mock request

Run the analysis. State that the server validates text length or document MIME/signature, sends nothing to an AI provider, intentionally stores nothing, and reports that temporary input was discarded. Mock mode demonstrates the future route structure without understanding the document.

## 1:20–1:43 — Structured route and one useful question

Show the separated facts, interpretation, uncertainty, deadline, documents, and ordered next steps. Answer **Employed** and show the income-evidence step adapt because this answer changes the route.

## 1:43–2:05 — Typed safety boundary

Briefly show a safe validation error using a synthetic mismatched file or test evidence. Explain that raw server exceptions and original input never appear in the response.

## 2:05–2:27 — Arabic RTL result

Start over, choose the fictional sample and Arabic, then analyze. Show the right-to-left result while dates and source URLs remain readable.

## 2:27–2:43 — Honest source limitation

Show **Placeholder — not verified** labels and the legal-information disclaimer. Official-source research begins only after a future real case profile is ready.

## 2:43–3:00 — Engineering evidence

Show `POST /api/cases/analyze`, the stable `CaseAnalysis`, discriminated client/server inputs, internal future Responses API plan, 59 passing tests, dated commits, and prior-work disclosure. Credit Codex only for evidenced architecture, implementation, testing, verification, and documentation work; add GPT-5.6 contributions after they occur.
