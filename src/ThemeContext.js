/**
 * Document theme — colors, fonts, and other cross-cutting brand tokens
 * that builders should consult when foundations don't pass explicit
 * literal values.
 *
 * Stage 5 of kb/framework/plans/press-professional-docx.md.
 *
 * The shape is intentionally small and forgiving: a foundation passes
 * whatever subset of keys it cares about, and builders fall back to
 * sensible defaults when a key is absent. The DEFAULT_THEME below
 * documents the full surface; foundations may override any subset.
 *
 * Resolution timing: builders consume the theme during React render
 * and emit literal hex/font values into data-* attributes. The IR
 * walker and the docx adapter never see theme keys — by the time IR
 * exists, the substitution has already happened. This keeps the
 * adapter ignorant of theming and means foundations can pre-render
 * outside a provider for testing without crashing on missing keys.
 *
 * `wrapWithProviders` re-applies the theme during the compile pass
 * (renderToStaticMarkup outside the original React tree), so the
 * fragment registered live and the fragment compiled later resolve
 * to the same values.
 */
import { createContext, useContext } from 'react'

/**
 * The full shape, with documented defaults. Foundations may override
 * any subset.
 *
 * Color values are hex strings without the leading `#`. Foundations
 * that pass a value with `#` get it stripped on resolve so authors
 * don't have to remember which form.
 */
export const DEFAULT_THEME = {
    colors: {
        // Primary brand accent — used for titles, header rows, and
        // emphasis. Foundations should override this.
        accent: '0B5394',
        // Body text color.
        body: '3B3B3B',
        // Secondary / muted text (helper labels, footers).
        muted: '757575',
        // Soft border / grid color (table grid, dividers).
        softBorder: 'BFD3ED',
        // Stage 6+: surface, surfaceAlt for tinted backgrounds.
        surface: 'FFFFFF',
        surfaceAlt: 'F5F7FB',
    },
    fonts: {
        // Default body font.
        body: 'Calibri',
        // Headings / titles. Match body to keep things simple.
        heading: 'Calibri',
        // Monospace (code, fixed-width data). Stage 6+.
        mono: 'Consolas',
    },
    /**
     * Typography roles. Each entry is a small `{ font, size, bold,
     * italics, color, smallCaps, allCaps, strike, paragraph }` shape;
     * `font` and `color` may be theme keys ('body', 'heading', 'accent',
     * …) which resolve at compile time. `size` is in half-points
     * (use the convertPointsToHalfPoints helper / `pt(n)` wrapper).
     *
     * Press synthesises OOXML paragraph styles + character styles from
     * this registry on docx compile. Builders consume roles via
     * `<Paragraph role="Title">` / `<TextRun role="Label">`; the docx
     * adapter emits style references (<w:pStyle>/<w:rStyle>) instead
     * of inline run properties, so users can edit fonts/colors/sizes
     * from Word's Styles pane without find-and-replace formatting.
     *
     * Roles split into two natural buckets:
     *   - block-level (paragraph): set both paragraph and run properties,
     *     applied via `<Paragraph role="…">`. Use for whole-paragraph
     *     constructs like Title, Heading1-3, Body, Display.
     *   - inline (character): set run properties only, applied via
     *     `<TextRun role="…">`. Use for inline emphasis like Label,
     *     Caption, BodyStrong.
     *
     * Foundations override individual entries by passing
     * `theme.typography.<RoleName>` partial — anything not specified
     * inherits the default.
     */
    typography: {
        // ---- Block-level roles (paragraph) -----------------------------
        Title: {
            font: 'heading',
            size: 56,
            bold: true,
            color: 'accent',
            paragraph: { spacing: { after: 240 } },
        },
        Heading1: {
            font: 'heading',
            size: 32,
            bold: true,
            color: 'body',
            paragraph: { spacing: { before: 240, after: 120 } },
        },
        Heading2: {
            font: 'heading',
            size: 26,
            bold: true,
            color: 'body',
            paragraph: { spacing: { before: 200, after: 100 } },
        },
        Heading3: {
            font: 'heading',
            size: 22,
            bold: true,
            color: 'body',
            paragraph: { spacing: { before: 160, after: 80 } },
        },
        Body: {
            font: 'body',
            size: 22,
            color: 'body',
            paragraph: { spacing: { line: 276 } }, // 1.15 line height
        },
        Display: {
            font: 'body',
            size: 28,
            bold: true,
            color: 'body',
        },

        // ---- Inline roles (character) ----------------------------------
        BodyStrong: { font: 'body', size: 22, bold: true, color: 'body' },
        Label: {
            font: 'body',
            size: 18,
            bold: true,
            color: 'muted',
            allCaps: true,
        },
        Caption: { font: 'body', size: 18, color: 'muted' },
        TableHeader: {
            font: 'heading',
            size: 20,
            bold: true,
            color: 'surface',
        },
        TotalLine: {
            font: 'heading',
            size: 26,
            bold: true,
            color: 'surface',
        },
    },
    /**
     * Roles whose declaration should land in the OOXML paragraphStyles
     * bucket vs the characterStyles bucket. Block roles cover both
     * paragraph and run properties; inline roles cover only run
     * properties. Foundations adding new roles should classify them
     * here; unclassified roles default to character-style (run-only).
     */
    typographyKinds: {
        Title: 'paragraph',
        Heading1: 'paragraph',
        Heading2: 'paragraph',
        Heading3: 'paragraph',
        Body: 'paragraph',
        Display: 'paragraph',
        BodyStrong: 'character',
        Label: 'character',
        Caption: 'character',
        TableHeader: 'character',
        TotalLine: 'character',
    },
}

export const ThemeContext = createContext(DEFAULT_THEME)

/**
 * Look up the active theme. Builders that need theme values call this
 * at render time. Outside a DocumentProvider, returns DEFAULT_THEME.
 */
export function useDocumentTheme() {
    return useContext(ThemeContext) || DEFAULT_THEME
}

/**
 * Resolve a color prop value against the theme.
 *
 * Accepts:
 *   - A theme key matching `theme.colors.<key>` (e.g. 'accent', 'body',
 *     'muted', 'softBorder') — returned as the resolved hex.
 *   - A hex literal with or without leading '#' — returned without '#'.
 *   - Any other string — returned verbatim (the docx layer falls back
 *     to library defaults if it doesn't recognize the value).
 *
 * Returns undefined for nullish input so builders can chain
 * `if (resolved) defaults['data-color'] = resolved` cleanly.
 */
export function resolveThemeColor(value, theme = DEFAULT_THEME) {
    if (!value) return undefined
    if (typeof value !== 'string') return value
    const colors = theme && theme.colors ? theme.colors : DEFAULT_THEME.colors
    if (Object.prototype.hasOwnProperty.call(colors, value)) {
        return stripHash(colors[value])
    }
    return stripHash(value)
}

/**
 * Resolve a font-family prop against the theme.
 *
 * Accepts:
 *   - A theme key matching `theme.fonts.<key>` (e.g. 'body', 'heading').
 *   - A literal family name — returned verbatim.
 */
export function resolveThemeFont(value, theme = DEFAULT_THEME) {
    if (!value) return undefined
    if (typeof value !== 'string') return value
    const fonts = theme && theme.fonts ? theme.fonts : DEFAULT_THEME.fonts
    if (Object.prototype.hasOwnProperty.call(fonts, value)) {
        return fonts[value]
    }
    return value
}

function stripHash(hex) {
    return typeof hex === 'string' && hex.startsWith('#') ? hex.slice(1) : hex
}
