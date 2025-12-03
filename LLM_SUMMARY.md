LLM Summary — D365 F&O Playwright Test Framework

Purpose
- Short: Playwright test framework for Dynamics 365 Finance & Operations (D365 F&O) focused on Employee Self Service (ESS) and reliable data extraction.

Quick facts
- Primary entry points: `global-setup.ts`, `playwright.config.ts`, `helpers/d365-form-utils.ts`, `tests/checkESS-test.spec.ts`.
- Auth: `playwright/.auth/user.json` created by `global-setup.ts`.
- Primary language: TypeScript + Playwright.

Run (Windows PowerShell)
```powershell
npm install
npx playwright test
# debug UI
npx playwright test --ui
```

Agent-friendly pointers
- To understand extraction logic: search for `extractFieldValue` and `extractAllFormFields` in `helpers/d365-form-utils.ts`.
- To find navigation/wait patterns: open `navigateToWorkspace` in `helpers/d365-form-utils.ts` and `playwright.config.ts` for timeouts.
- To run a fast check: run `npx playwright test checkESS-test.spec.ts`.

Canonical docs (machine index)
- See `docs/docmap.json` for the list of canonical docs and short summaries.

Recommended LLM queries (examples)
- "Summarize how `extractFieldValue` works and list its fallback strategies."
- "Which tests exercise the ESS workspace? List file names and descriptions."
- "Show me the wait strategy used by the framework and where it is implemented."

Suggested next actions for agents
1. Load `docs/docmap.json` to discover canonical docs.
2. Inspect `helpers/d365-form-utils.ts` for core domain logic.
3. Run the `checkESS-test.spec.ts` to validate extraction behavior.

Contact / Maintainer notes
- Repository README.md contains longer human-oriented guides and run instructions.
- Use `docs/` as canonical doc location; the repo contains additional legacy files at the repo root which are being consolidated.

Generated: 2025-12-03T12:10:00Z
