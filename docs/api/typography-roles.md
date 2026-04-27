# Typography roles

Reference for the role registry that Press synthesises into OOXML named styles. Use this alongside the [docx cookbook](../guides/docx-foundation-cookbook.md), which has the conceptual introduction.

## What roles are

A role is a name (string) for a typographic intent: `Title`, `Heading1`, `Body`, `Label`, `Caption`, etc. Section components reference roles via `<Paragraph role="…">` and `<TextRun role="…">`. At compile time, Press resolves each role against the active theme into a Word named style — so the recipient can edit the style in Word's Styles pane and have every reference update.

## Default registry

```js
{
    Title:       { font: 'heading', size: 56, bold: true, color: 'accent' },
    Heading1:    { font: 'heading', size: 32, bold: true, color: 'body' },
    Heading2:    { font: 'heading', size: 26, bold: true, color: 'body' },
    Heading3:    { font: 'heading', size: 22, bold: true, color: 'body' },
    Body:        { font: 'body', size: 22, color: 'body' },
    Display:     { font: 'body', size: 28, bold: true, color: 'body' },
    BodyStrong:  { font: 'body', size: 22, bold: true, color: 'body' },
    Label:       { font: 'body', size: 18, bold: true, color: 'muted', allCaps: true },
    Caption:     { font: 'body', size: 18, color: 'muted' },
    TableHeader: { font: 'heading', size: 20, bold: true, color: 'surface' },
    TotalLine:   { font: 'heading', size: 26, bold: true, color: 'surface' },
}
```

Sizes are half-points (11pt = 22). Color and font values can be theme keys (`'accent'`, `'body'`, `'heading'`, …) or literals.

## Role catalog

### Block-level (use on `<Paragraph>`)

| Role | Default | Typical use |
|---|---|---|
| `Title` | 28pt heading-bold-accent | Document title — "ANNUAL ACTIVITY REPORT" |
| `Heading1` | 16pt heading-bold-body | Top-level section — "Publications" |
| `Heading2` | 13pt heading-bold-body | Subsection — "Peer-reviewed Articles" |
| `Heading3` | 11pt heading-bold-body | Sub-subsection |
| `Body` | 11pt body | Default paragraph; also sets `<w:rPrDefault>` so every run inherits |
| `Display` | 14pt body-bold | Highlighted secondary value — invoice number, total figure, count |

### Inline (use on `<TextRun>`)

| Role | Default | Typical use |
|---|---|---|
| `BodyStrong` | 11pt body-bold | Bold emphasis within body — vendor name, faculty name |
| `Label` | 9pt body-bold-muted-allCaps | Small uppercase labels — "DEPARTMENT", "BILL TO" |
| `Caption` | 9pt body-muted | Footnote-style secondary text — period dates, dept, email |
| `TableHeader` | 10pt heading-bold-surface | White-on-accent table header rows |
| `TotalLine` | 13pt heading-bold-surface | Big bold total row in a totals table |

## OOXML routing

Press chooses where each role lands based on whether Word has a built-in style with that name:

| Role | OOXML target | Why |
|---|---|---|
| `Body` / `Normal` | `default.document` → `<w:rPrDefault>` / `<w:pPrDefault>` | Document-wide default. Pins the body font for every run that doesn't override. |
| `Title` | `default.title` → built-in Title overrides | Word ships a Title style; this is the canonical override slot. |
| `Heading1` … `Heading6` | `default.heading1`-`heading6` | Same — built-in slots. |
| `Hyperlink` | `default.hyperlink` | Built-in. |
| `Strong` | `default.strong` | Built-in. |
| `ListParagraph` | `default.listParagraph` | Built-in. |
| Everything else (`Display`, `Label`, …) | `paragraphStyles[]` or `characterStyles[]` | Custom styles, addressable by name from the Styles pane. |

The split between paragraph-level and character-level matters because Word treats them as different style types. `Title` / `Heading1` apply to a whole paragraph; `Label` / `Caption` apply to a span within a paragraph.

`typographyKinds` classifies each custom role:

```js
{
    Title: 'paragraph',      // applied via <Paragraph role="Title">
    Heading1: 'paragraph',
    Heading2: 'paragraph',
    Heading3: 'paragraph',
    Body: 'paragraph',
    Display: 'paragraph',
    BodyStrong: 'character', // applied via <TextRun role="BodyStrong">
    Label: 'character',
    Caption: 'character',
    TableHeader: 'character',
    TotalLine: 'character',
}
```

Foundations adding a new role classify it here. Unclassified roles default to `'character'`.

## Inline overrides

Inline props on TextRun and the various builders still work and win over the role's resolved style. This is direct formatting in Word terms — applies to that specific run, not the style:

```jsx
<TextRun role="Label" color="accent">SIGNED</TextRun>  // Label style + accent color override
<TextRun role="Body" italics>quietly</TextRun>           // Body style + italics override
```

A recipient editing the Label style in Word's pane changes every Label *except* this one's color (because the inline override is direct formatting). That matches the Word user's expectation: direct formatting always trumps the style.

## Overriding per-foundation

Foundations override the role registry in `compile-options.js` by passing `theme.typography`:

```js
const DEFAULT_THEME = {
    colors: { accent: '0B5394', body: '212121', muted: '6B7280', /* … */ },
    fonts: { body: 'Calibri', heading: 'Calibri' },
    typography: {
        // Override only what differs from the defaults; rest inherits.
        Title:    { font: 'heading', size: 64, bold: true, color: 'accent' }, // bigger
        Heading1: { font: 'heading', size: 36, bold: true, color: 'accent' },
        // Add a foundation-specific role:
        Quote:    { font: 'body', size: 22, italics: true, color: 'muted' },
    },
    typographyKinds: {
        Quote: 'paragraph',
    },
}
```

Use the new role:

```jsx
<Paragraph role="Quote">
    <TextRun>"The unexamined life is not worth living."</TextRun>
</Paragraph>
```

## Caller-supplied styles

Foundations may also pass raw `paragraphStyles` / `characterStyles` arrays for cases where the role registry isn't enough. These merge on top of the synthesised pack:

```js
return {
    theme,
    adapterOptions: {
        paragraphStyles: [
            {
                id: 'BlockQuote',
                name: 'Block Quote',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { italics: true, color: '666666' },
                paragraph: { indent: { left: 720, right: 720 } },
            },
        ],
    },
}
```

When a caller-supplied style has a built-in ID (`Title`, `Heading1-6`, `Hyperlink`, `Strong`, `ListParagraph`), Press routes it to the corresponding `default.{slot}` instead of the custom array. This is the only way to override a built-in's properties.

## Verifying

Open the compiled docx, unzip, inspect `word/styles.xml`. You should see:

- `<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="…">…` — the Body role on document defaults.
- `<w:style w:type="paragraph" w:styleId="Title">…` — Title with your accent color.
- `<w:style w:type="character" w:styleId="Label">…` — Label as a character style.
- `<w:pStyle w:val="Title"/>` references inside `word/document.xml` — paragraphs using the Title role.
- `<w:rStyle w:val="Label"/>` references — runs using the Label role.

Or, just open the docx in Word, place your cursor in a Title paragraph, and look at the Styles pane: it should highlight "Title" and let you click "Modify Style" to edit it.

## Troubleshooting

### Title comes out without my color/font

Check: did you pass `theme` in `getOptions`? The synthesizer requires a theme to run.

```js
return {
    theme: resolveTheme(cfg),       // required
    adapterOptions: { /* … */ },
}
```

Without `theme`, Press falls back to legacy passthrough — caller-supplied raw styles only, no synthesis.

### My custom role doesn't render

Check `typographyKinds`. If a role isn't classified, Press defaults to `'character'`. A paragraph-level role (intended for `<Paragraph role>`) without a `'paragraph'` classification ends up as a character style and won't apply correctly when used on a paragraph.

### Heading1 has a hardcoded blue color

Word's built-in Heading1 has `color="2E74B5"` by default. Press overrides this by routing your Heading1 through `default.heading1`, which works *only when you provide a complete spec*. If you set just `color: 'accent'` on Heading1, the built-in's other defaults (like its size) might not be what you expect.

Either set every property explicitly (`{ font: 'heading', size: 32, bold: true, color: 'accent' }`) or accept the built-in fallback for unspecified fields.
