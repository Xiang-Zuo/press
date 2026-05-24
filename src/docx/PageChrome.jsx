/**
 * Page-chrome builders — page header, page footer, and page-number
 * field codes.
 *
 * Stage 4 of the print/docx work.
 *
 * The underlying registration plumbing already exists in Press:
 * `useDocumentOutput(block, 'docx', body, { role: 'header' })` lifts
 * a fragment into the docx Section's header; `role: 'footer'` does the
 * same for the footer. These builders are ergonomic wrappers — they
 * give foundations a JSX shape that matches how Word documents are
 * usually authored (a tree with PageHeader / PageFooter elements at
 * the top level), and route the registration internally.
 *
 * Usage in a section component:
 *
 *   import {
 *     useDocumentOutput,
 *     useDocumentOutputAsHeader,
 *     useDocumentOutputAsFooter,
 *   } from '@uniweb/press'
 *   import {
 *     PageHeader, PageFooter, PageNumber, TotalPages,
 *   } from '@uniweb/press/docx'
 *
 *   function Cover({ block }) {
 *     useDocumentOutput(block, 'docx', body)
 *     useDocumentOutputAsHeader(block, 'docx',
 *       <PageHeader>
 *         <Paragraph data-alignment="right">
 *           <Image src="logo.png" />
 *         </Paragraph>
 *       </PageHeader>
 *     )
 *     useDocumentOutputAsFooter(block, 'docx',
 *       <PageFooter>
 *         <Paragraph data-alignment="center">
 *           <TextRun>Page </TextRun><PageNumber />
 *           <TextRun> of </TextRun><TotalPages />
 *         </Paragraph>
 *       </PageFooter>
 *     )
 *   }
 *
 * The PageHeader / PageFooter components are layout-transparent: they
 * render their children inside an HTML container that the IR walker
 * treats as a normal sequence of paragraphs. The role-based routing
 * happens at the registration layer (useDocumentOutputAsHeader / Footer),
 * not via element identity. This lets foundations build complex headers
 * (multi-row layouts, brand blocks) without the IR walker needing a
 * special "page header" type.
 */

/**
 * Wrapper element for a page header. Renders its children with no
 * additional structure — used as a documentation/identity hint at the
 * top of a header tree, and to give foundations a single JSX node to
 * pass to `useDocumentOutputAsHeader`.
 */
export function PageHeader({ children }) {
    return <>{children}</>
}

/**
 * Wrapper element for a page footer. Mirror of PageHeader.
 */
export function PageFooter({ children }) {
    return <>{children}</>
}

/**
 * The current page number, as a Word field code that updates on
 * print/preview. Inline element — usable inside any TextRun-context
 * (Paragraph children, table cells, etc.).
 *
 * The IR walker has special-cased '_currentPage' as text content
 * since pre-Press days; we emit a TextRun-shaped span carrying
 * exactly that sentinel so the existing pipeline turns it into a
 * <w:fldSimple> / <w:fldChar> page reference.
 */
export function PageNumber() {
    return <span data-type="text">_currentPage</span>
}

/**
 * The total number of pages. Companion to PageNumber for "Page X of Y"
 * footer patterns.
 */
export function TotalPages() {
    return <span data-type="text">_totalPages</span>
}

/**
 * Common page-size presets, in twips. Foundations pass these to
 * `compile('docx', { pageSize: pageSizes.A4 })` to override Word's
 * default. The orientation field is set separately via the
 * `pageOrientation` compile option (or by spreading + overriding).
 *
 * ISO A-series and US presets are exact. Other sizes available
 * directly through the docx library if needed.
 */
export const pageSizes = {
    A4: { width: 11906, height: 16838 },        // 21.0 × 29.7 cm
    A5: { width: 8419, height: 11906 },          // 14.8 × 21.0 cm
    A3: { width: 16838, height: 23811 },         // 29.7 × 42.0 cm
    LETTER: { width: 12240, height: 15840 },     // 8.5 × 11 in
    LEGAL: { width: 12240, height: 20160 },      // 8.5 × 14 in
    TABLOID: { width: 15840, height: 24480 },    // 11 × 17 in
}
