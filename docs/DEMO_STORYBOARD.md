# Three-minute demo storyboard — Phase 1.5 draft

> Draft based on the working Phase 1.5 implementation. It will evolve as extraction, source verification, and real AI analysis are added. All current analysis content is a clearly labelled fictional mock.

## 0:00–0:18 — Problem hook

Show the stress caused by a dense German official letter: the user needs its purpose, deadline, requested documents, and a route—not a chat transcript or knowledge of the official procedure name.

## 0:18–0:35 — Choose an orientation category

Open the BurgerMapper landing page and choose **Visa & Immigration**. Show that `/case` opens with that optional category preselected and that it can be changed or cleared. Explain that categories orient the user; they do not decide eligibility.

## 0:35–0:58 — Paste or upload a letter

Show **Paste text**, then briefly switch to **Upload document** to demonstrate PDF/image intake. Return to text and paste a fictional official message. Point out that the input stays in browser memory and mock mode does not read, send, persist, or truly interpret it. If time is tight, use **Try sample** instead.

## 0:58–1:22 — Demonstrate the route structure

Run the deterministic mock analysis. State explicitly: the later real version is intended to identify the letter's purpose, but the current build uses the fictional Samira Haddad scenario to demonstrate the expected structured route. Show the separated facts, mock interpretation, uncertainty, and requested action.

## 1:22–1:43 — Deadline and one useful clarification

Highlight the fictional deadline and required documents. Answer **Employed** and show the income-evidence step adapt. Explain that BurgerMapper asks a question only when its answer changes the route.

## 1:43–2:08 — Personalized next steps

Walk through the ordered route, responsible party, timing, and status. Emphasize that the route—not a chatbot transcript—is the product.

## 2:08–2:29 — Arabic RTL result

Start over, choose Visa & Immigration again, select the sample and Arabic, then analyze. Show the right-to-left result layout while dates and source URLs remain readable.

## 2:29–2:43 — Official-source verification boundary

Show entries labelled **Placeholder — not verified** and the legal-information disclaimer. Explain that retrieval and verification of official sources will appear in a later workflow phase; do not present these placeholders as citations.

## 2:43–3:00 — Engineering evidence

Briefly show the discriminated `CaseInput`, provider-independent `CaseAnalysis`, 33 passing tests, dated commits, and prior-work disclosure. Explain accurately that Codex supported the architecture, implementation, tests, verification, and documentation; add GPT-5.6 contributions only after they occur and are evidenced.
