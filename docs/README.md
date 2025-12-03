Docs — canonical documentation for the D365HR-tests repo

Purpose
- This `docs/` folder contains the canonical documentation for the repository. Top-level docs are being consolidated here to reduce duplication and improve machine/LLM discoverability.

Structure
- `docs/docmap.json` — machine-readable index of canonical docs (id, path, tags, short summary).
- `guides/` — long-form guides (data extraction, conversion patterns).
- `quick-reference.md` — a single quick reference for common commands and pointers.
- `research/` — experimental and research notes (Playwright MCP research, experiments).
- `archived/` — deprecated or duplicate docs (kept for traceability).

How to use
1. Read `docs/docmap.json` to see the canonical doc list and summaries.
2. Open the doc listed in the `path` field; paths are relative to the repository root.
3. When moving a doc into `docs/`, update `docs/docmap.json` and add a 1-line redirect file in the old location (optional).

Next steps
- Consolidate authoritative docs from the repo root into `docs/` (move or copy; create redirects as needed).
- Add optional YAML front-matter to major docs for title, summary, and tags.
- Create a small script to validate `docmap.json` paths (optional automation).

Generated: 2025-12-03T12:10:05Z
