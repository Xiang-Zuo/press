# Architecture note — typography routes through OOXML named styles

Press's docx builders emit named-style references (`<w:pStyle w:val="Title"/>`, `<w:rStyle w:val="Label"/>`) instead of inline run properties (`<w:rPr><w:color w:val="…"/><w:sz w:val="…"/>…</w:rPr>`) for typography. This note explains why, what it costs, and where the boundary sits between styles and inline overrides.

## Background

A docx file has two ways to make text look a certain way:

1. **Direct formatting.** Each run carries its own font, size, color, weight. The OOXML serialization is a `<w:rPr>` block on every `<w:r>`. Word lets users apply this with the toolbar, and stores the result inline.
2. **Named styles.** A document-level `styles.xml` declares named styles (Title, Heading1, Body, Hyperlink, …); runs and paragraphs reference them by name. Edit a style once, and every reference updates. Word's Styles pane is the user-facing surface.

Both work. Word documents in the wild use both, often mixed.

The question Press faced: *which one should the foundation API encourage by default?*

## What we tried first

The pre-Stage-6.0 builders accepted inline props on every TextRun:

```jsx
<TextRun bold size={56} color="accent" font="heading">INVOICE</TextRun>
```

This works. It produces a valid docx. But three properties of the resulting document made it unsuitable as a default:

1. **Recipients couldn't restyle in Word's Styles pane.** The inline formatting "wins" over any style they edit. Right-click "Modify Style" on Title, change the color — every Title in the document keeps the foundation's hardcoded accent color, because that color is direct formatting, not a style.

2. **The body font fell back to whatever Word picked.** Without a Body style or `<w:rPrDefault>` setting, Word uses its template's default. On Mac this is usually Calibri; on some Windows installations or when the user has a custom Normal template, it's Times New Roman, Cambria, or anything. The same docx looked different on different machines.

3. **Every TextRun in foundation code carried four to six attributes.** Section components were buried in formatting noise. The signal-to-noise ratio of a typical foundation file was poor — the layout intent (title, label, value) was hard to read past the styling.

## The redesign

Press now ships a typography registry (`theme.typography`) that maps role names to style specs. Builders accept a `role` prop:

```jsx
<Paragraph role="Title"><TextRun>INVOICE</TextRun></Paragraph>
<TextRun role="Label">DUE</TextRun>
<TextRun role="Display">{invoice.number}</TextRun>
```

At compile time, the registry is synthesized into OOXML named styles. The Title role becomes a `<w:style>` entry; references in the document use `<w:pStyle>` / `<w:rStyle>`.

Three OOXML mechanisms catch different cases:

- **Built-in style overrides** for Title, Heading1-6, Hyperlink, Strong, ListParagraph. These get routed through `default.{title, heading1, …}` because docx's library (and Word) treats those names as built-ins; the slot is the canonical override.
- **Document defaults** (`<w:rPrDefault>` / `<w:pPrDefault>`) for the Body role. This is what makes "set the body font once, every run inherits it" work — and it's what fixed the Times New Roman bug from earlier.
- **Custom named styles** for everything else (Display, Label, Caption, TableHeader, TotalLine). Addressable from Word's Styles pane by their declared name.

## Properties of the result

1. **Recipients can restyle.** A faculty member opens the docx in Word, clicks "Modify Style" on Heading1, picks a different color. Every Heading1 updates. This is what Word users expect; the foundation no longer fights them.

2. **The body font is pinned at the document level.** `<w:rPrDefault>` sets it once; every run inherits unless overridden. The same docx renders with the same font on every machine.

3. **Foundation code reads as layout intent.** A section component looks like:

   ```jsx
   <Paragraph role="Title"><TextRun>INVOICE</TextRun></Paragraph>
   <Paragraph><TextRun role="Label">DUE</TextRun> <TextRun>{date}</TextRun></Paragraph>
   ```

   You can scan it and see structure, not styling.

## The boundary — when to use inline overrides

Direct formatting still has its place:

- **One-off emphasis.** A single bold word inside a paragraph that isn't part of a recurring pattern doesn't earn a role. `<TextRun bold>just this once</TextRun>` is fine.
- **Variation within a role.** A Total row that's the same as `Label` style but in the brand accent color: `<TextRun role="Label" color="accent">SIGNED</TextRun>`. The role provides the size + caps + weight; the inline `color` overrides for this run only. Word users see this as direct formatting on top of the Label style — exactly the convention they understand.
- **Computed values.** A heat-mapped table cell whose color depends on its value can't be a static role. Compute the color and pass it inline.

The signal: if you'd say "this text is a label" or "this is a title," use a role. If you'd say "this text needs to be red because of its value," use direct formatting.

## What we sacrificed

- **Some setup cost.** Foundations have to declare a typography registry up-front. The default registry is shipped with Press, so most foundations only override what differs from the institution's branding — but it's still one more thing to configure.
- **One layer of indirection during debugging.** A foundation that needs to know "what color does Title actually render?" has to look at the theme + the role definition + the resolution logic in `buildStylePack.js`. Inline `color="…"` is more direct.
- **Some flexibility for power users who do want pure direct formatting.** A foundation that intentionally wants no named styles can pass `paragraphStyles: []` and `characterStyles: []` and use only inline props — this works, but it's the unusual path.

We considered these costs acceptable. The vast majority of professional docx documents benefit from being style-driven; the unusual case is the one that should pay an extra cost.

## See also

- [Typography roles reference](../api/typography-roles.md) — the role catalog and OOXML routing.
- [docx cookbook](../guides/docx-foundation-cookbook.md) — practical guidance for foundation authors.
- `framework/press/src/styles/buildStylePack.js` — the synthesizer.
