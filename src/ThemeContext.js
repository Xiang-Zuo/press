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
