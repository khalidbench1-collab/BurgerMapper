# Initial decisions

These decisions define the starting constraints for BurgerMapper. They can change only when later evidence or requirements justify a documented revision.

| Decision | Reason |
| --- | --- |
| Build a web app rather than a native mobile app | A responsive web app is faster to distribute, test, and demonstrate during the hackathon without app-store review. |
| Use a mobile-first, PWA-ready architecture | People may need help while handling a letter away from a desktop; responsive foundations and web app metadata preserve a path to an app-like experience. |
| Keep the MVP anonymous | Removing accounts reduces friction, implementation scope, and the amount of sensitive personal data the project must retain. |
| Use English for the interface | English is the primary interface language for the initial audience and submission, while keeping the navigation experience consistent. |
| Support English, German, and Arabic generated output | These languages cover the initial accessibility goal: English guidance, the source-system language, and an important community language in Berlin. |
| Make official-letter analysis the flagship workflow | Starting from a real letter gives the product a concrete input and lets it identify actionable deadlines, requests, and next steps. |
| Accept PDF and image uploads | Official correspondence arrives digitally and on paper, so both document formats are necessary for the intended workflow. |
| Use the OpenAI API only | One AI platform keeps the architecture coherent and follows the Build Week technical direction; no other AI provider will be integrated. |
| Make API calls server-side only | Server-side calls keep credentials out of browser code and provide a controlled boundary for document processing. |
| Require official government sources for changing factual claims | Administrative facts, requirements, and deadlines can change; official sources provide the strongest basis for route guidance and citations. |
| Target Vercel for deployment | Vercel is a natural operational fit for the Next.js App Router and supports a fast hackathon deployment path. |
| Use no database initially | The anonymous first MVP can process a session without persistent application data, reducing scope and privacy risk until persistence is clearly justified. |
