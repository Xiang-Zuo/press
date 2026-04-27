# AI prompt — Press docx authoring

A self-contained prompt to paste into Claude (or another LLM) before asking for help with `@uniweb/press` foundation code. The model needs the right scaffolding to give answers that compile cleanly. Without it, models default to React idioms that don't fit Press's IR-walker contract (e.g. wrapping `<Image>` in a `<Paragraph>`).

Copy everything between the lines into a fresh chat, then ask your question.

---

You are helping me build a foundation for **`@uniweb/press`**, a library that produces Word (`.docx`) files (and other formats) from React JSX. I'll describe the document I'm trying to render; you give me JSX that will compile.

## Mental model

Press separates *registration* from *rendering*. A section component:
1. Builds a JSX tree using Press's docx builders.
2. Calls `useDocumentOutput(block, 'docx', tree)` to register it.
3. Returns the same tree (or a similar one) for the React preview.

The same JSX feeds both the browser preview and the docx compile. There's an off-screen pass that re-renders registered fragments, walks the HTML to an intermediate representation (IR), and emits OOXML.

## Builders — `@uniweb/press/docx`

```jsx
import {
    Paragraph, TextRun,           // text
    H1, H2, H3, H4,               // legacy headings (prefer role="Heading1")
    Image, BrandLogo,             // images
    Table, Tr, Td,                // tables
    List, BulletList, NumberedList,
    PageHeader, PageFooter, PageNumber, TotalPages,
    Tab,                          // inline tab marker
    cm, mm, inch, pt,             // unit helpers (return twips)
    pageSizes,                    // A3/A4/A5/LETTER/LEGAL/TABLOID presets
} from '@uniweb/press/docx'
```

```jsx
import {
    DateText, DateRangeText, Currency, formatters,
} from '@uniweb/press/format'
```

## Key principles

1. **Use `role` props, not inline `color`/`size`/`font`.** Roles route through OOXML named styles so recipients can edit them in Word's Styles pane. Available roles:
    - **Block-level** (on `<Paragraph>`): `Title`, `Heading1`, `Heading2`, `Heading3`, `Body`, `Display`.
    - **Inline** (on `<TextRun>`): `BodyStrong`, `Label`, `Caption`, `TableHeader`, `TotalLine`.
    - Custom roles can be added in the foundation's theme.

   Inline overrides still work and win for that specific run: `<TextRun role="Label" color="accent">SIGNED</TextRun>`.

2. **Theme keys for colors and shading.** Use `'accent'`, `'body'`, `'muted'`, `'softBorder'`, `'surface'`, `'surfaceAlt'` instead of literal hex. They resolve at compile time through the active theme. Literal hex (with or without `#`) also works.

3. **Tables need `columnWidths` for stable layout.**

   ```jsx
   <Table columnWidths={[cm(8), cm(2), cm(3), cm(3)]} borders={{ /* … */ }}>
       <Tr header>
           <Td shading="accent" valign="center">
               <Paragraph><TextRun role="TableHeader">Title</TextRun></Paragraph>
           </Td>
           {/* … */}
       </Tr>
       <Tr>
           <Td valign="center"><Paragraph><TextRun>Cell</TextRun></Paragraph></Td>
           {/* … */}
       </Tr>
   </Table>
   ```

   - `<Tr header>` repeats the row across page breaks.
   - `borders` is shared across the table; per-cell borders override.
   - `<Td colSpan={n}>` and `<Td rowSpan={n}>` work; the row indexes are span-aware.
   - Use `data-alignment="right"` on Paragraph for right-aligned numerics.

4. **Images go at section level, not nested in a Paragraph.** The IR walker drops images that appear inline. Pass `data-alignment="right"` on `<Image>` itself for alignment; the adapter wraps in a paragraph during emission.

   ```jsx
   {/* Wrong — image dropped: */}
   <Paragraph data-alignment="right">
       <Image data={{ url: 'logo.png' }} />
   </Paragraph>

   {/* Right: */}
   <Image data={{ url: 'logo.png' }} data-alignment="right" />

   {/* Or use the BrandLogo wrapper: */}
   <BrandLogo url="logo.png" align="right" width={cm(4)} />
   ```

5. **Page header/footer register from a section.** The cover slice is the natural owner. Three registrations from the same block don't collide — Press keys by `(block, format, role)`:

   ```jsx
   useDocumentOutput(block, 'docx', body)
   useDocumentOutput(block, 'docx', <PageHeader>...</PageHeader>, { role: 'header' })
   useDocumentOutput(block, 'docx', <PageFooter>...</PageFooter>, { role: 'footer' })
   ```

6. **Dates and currency: use the format builders.**

   ```jsx
   <DateText value={record.date} format="long" />
   <DateRangeText period={record.period} format="medium" />
   <Currency value={amount} code="CAD" />
   ```

   `String(date)` leaks `"Sat Feb 28 2024 19:00:00 GMT-0500 …"`. The builders force `timeZone: 'UTC'` so `'2024-12-31'` doesn't drift.

7. **`compile-options.js` carries document-level config:**

   ```js
   export function buildDocxOptions(website, hostHints = {}) {
       const cfg = website.config.my_foundation
       return {
           theme: resolveTheme(cfg),  // colors, fonts, typography, locale, currency
           adapterOptions: {
               title: hostHints.title,
               creator: cfg?.creator,
               pageSize: pageSizes.LETTER,
               pageOrientation: 'portrait',
               pageMargin: {
                   top: cm(2.5), bottom: cm(2.5),
                   left: cm(2), right: cm(2),
                   header: cm(1.2), footer: cm(1.2),
               },
               loadAsset: hostHints.loadAsset,
           },
       }
   }
   ```

## Example — slice component

```jsx
import { useDocumentOutput } from '@uniweb/press'
import { Paragraph, TextRun, Table, Tr, Td, cm } from '@uniweb/press/docx'
import { DateText, Currency } from '@uniweb/press/format'

export default function PublicationsTable({ content, block }) {
    const publications = content.__data?.publications ?? []
    if (publications.length === 0) return null

    const tree = (
        <>
            <Paragraph role="Heading1"><TextRun>Publications</TextRun></Paragraph>
            <Table
                columnWidths={[cm(8), cm(3), cm(2), cm(3)]}
                borders={softGrid()}
            >
                <Tr header>
                    {['Title', 'Venue', 'Year', 'Funding'].map((label, i) => (
                        <Td key={i} shading="accent" valign="center">
                            <Paragraph data-alignment={i === 0 ? 'left' : 'right'}>
                                <TextRun role="TableHeader">{label}</TextRun>
                            </Paragraph>
                        </Td>
                    ))}
                </Tr>
                {publications.map((p, i) => (
                    <Tr key={i}>
                        <Td valign="center">
                            <Paragraph><TextRun>{p.title}</TextRun></Paragraph>
                            {p.authors && (
                                <Paragraph><TextRun role="Caption">{p.authors}</TextRun></Paragraph>
                            )}
                        </Td>
                        <Td valign="center">
                            <Paragraph data-alignment="right"><TextRun>{p.venue}</TextRun></Paragraph>
                        </Td>
                        <Td valign="center">
                            <Paragraph data-alignment="right">
                                <TextRun><DateText value={p.published_on} format="iso" /></TextRun>
                            </Paragraph>
                        </Td>
                        <Td valign="center">
                            <Paragraph data-alignment="right">
                                <TextRun><Currency value={p.funding} /></TextRun>
                            </Paragraph>
                        </Td>
                    </Tr>
                ))}
            </Table>
        </>
    )

    useDocumentOutput(block, 'docx', tree)
    useDocumentOutput(block, 'html', tree)
    return <section className="publications">{tree}</section>
}

const softGrid = () => ({
    top:    { style: 'single', size: 4, color: 'softBorder' },
    bottom: { style: 'single', size: 4, color: 'softBorder' },
    left:   { style: 'single', size: 4, color: 'softBorder' },
    right:  { style: 'single', size: 4, color: 'softBorder' },
    insideHorizontal: { style: 'single', size: 4, color: 'softBorder' },
    insideVertical:   { style: 'single', size: 4, color: 'softBorder' },
})
```

## What I'm building

[Describe your section / document / problem here. Be specific about: data shape, layout, format-specific concerns. Examples: "I need a 3-column table where the first column has a colSpan'd category header above its entries"; "How do I render a watermark on every page?"; "What's the right way to add a faculty signature line?"]

[Then: ask your question.]

---

If you have access to the docs, you can also point the model at:

- `framework/press/docs/guides/docx-foundation-cookbook.md` — the conceptual walkthrough.
- `framework/press/docs/api/docx.md`, `format.md`, `typography-roles.md` — API references.
- `framework/unipress/foundations/business-docs/src/sections/Invoice/index.jsx` — a real worked example.
