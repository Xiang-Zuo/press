# `@uniweb/press` documentation

## Where to start

- **New to Press?** Read [Concepts](./concepts.md) for the mental model, then [Quick start](./quick-start.md) for a working Download button.
- **Building a docx-producing foundation?** Read the [docx cookbook](./guides/docx-foundation-cookbook.md). It's task-oriented and walks through the real shape (annual reports, business documents, multi-page output).
- **Asking an LLM for help?** Paste [`ai-prompt.md`](./ai-prompt.md) into a fresh Claude/ChatGPT chat first.

## Guides

Task-oriented walkthroughs.

- **[docx cookbook](./guides/docx-foundation-cookbook.md)** — the load-bearing guide for foundation authors producing Word documents. Covers tables, typography, page chrome, dates, currency, branding, common pitfalls.
- [Book publishing](./guides/book-publishing.md) — multi-chapter compile.
- [Citations](./guides/citations.md) — `@citestyle/*` integration.
- [Compile pattern](./guides/compile-pattern.md) — the registration-and-compile dance.
- [Cross-references](./guides/cross-references.md) — `<Ref>` and bookmarks.
- [Custom adapters](./guides/custom-adapter.md) — adding new format support.
- [Multi-block reports](./guides/multi-block-reports.md) — cross-section aggregation.
- [Preview pattern](./guides/preview-pattern.md) — same-source preview + compile.
- [Style pack](./guides/style-pack.md) — paragraph styles for the docx adapter.

## API references

One file per public subpath.

- **[`@uniweb/press/docx`](./api/docx.md)** — builder components: Paragraph, TextRun, Table, Image, BrandLogo, page chrome, units, presets.
- **[`@uniweb/press/format`](./api/format.md)** — DateText, DateRangeText, Currency, imperative formatters.
- **[Typography roles](./api/typography-roles.md)** — the role registry, OOXML routing, override mechanisms.
- **[Core](./api/core.md)** — DocumentProvider, useDocumentOutput, useDocumentCompile.
- **[`@uniweb/press/sections`](./api/sections.md)** — `Section` and `StandardSection` higher-level templates.
- **[`@uniweb/press/ir`](./api/ir.md)** — IR layer for custom-adapter authors.

## Architecture

Design rationale.

- [Overview](./architecture/overview.md) — registration store, per-format fragment shapes, compile dispatch, adapter boundary.
- [Principles](./architecture/principles.md) — durable commitments about what Press is.
- [Adding a format](./architecture/adding-a-format.md) — checklist for new adapters.
- [Deployment](./architecture/deployment.md) — wire protocol, server-mode adapters.
- **[Word styles decision](./architecture/word-styles-decision.md)** — why typography routes through OOXML named styles.

## Other

- [Concepts](./concepts.md) — the mental model.
- [Quick start](./quick-start.md) — 10-minute tour.
- **[AI prompt](./ai-prompt.md)** — self-contained brief for asking an LLM for Press JSX.
