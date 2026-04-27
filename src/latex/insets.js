/**
 * LaTeX inset formatters.
 *
 * Generic helpers that emit `\cite{...}` and `\autoref{...}` commands
 * wrapped in raw-passthrough sentinels (see `./raw.js`). Foundations
 * substitute the result into paragraph text via the inline-inset
 * resolution pass; the LaTeX adapter's body-text escape pass leaves
 * sentinel-bracketed segments unescaped.
 *
 * **Resolution stays foundation-side.** These helpers do not know how
 * to look up bibliography records or xref entries — that's a foundation
 * concern (book uses a per-website cite-registry; @uniweb/kit/xref's
 * registry handles xref ids). The foundation passes already-resolved
 * key arrays in. Press's job is the LaTeX emission shape:
 *
 *   formatCite(['darwin1859', 'mendel1866'])
 *     -> '\cite{darwin1859,mendel1866}' (sentinel-wrapped)
 *
 *   formatCite(['darwin1859'], { locator: '42' })
 *     -> '\cite[42]{darwin1859}' (sentinel-wrapped)
 *
 *   formatCite(['darwin1859'], { suppressAuthor: true })
 *     -> '\citeyear{darwin1859}' (sentinel-wrapped)
 *
 *   formatAutoref(['fig-doors', 'sec-method'])
 *     -> '\autoref{fig-doors}, \autoref{sec-method}' (sentinel-wrapped)
 *
 * Why these live in press: foundations doing document output already
 * import `@uniweb/press`. The shape of these helpers — emit-LaTeX with
 * sentinel wrapping — is exactly press's domain. Adding them here lets
 * any future academic foundation (`@uniweb/scholar`, a thesis-only
 * variant, an arXiv-flavored foundation) reuse the LaTeX emission
 * vocabulary without re-deriving it.
 */

import { markRawLatex } from './raw.js'

/**
 * Emit a biblatex `\cite` (or `\citeyear`) command for one or more
 * pre-resolved bibliography keys. Returns an empty string when the
 * caller has filtered out every key (no resolved cites → no command).
 *
 * @param {string[]} keys - Resolved bibliography keys. Foundation has
 *   already filtered out any keys that don't appear in the website's
 *   bibliography (biblatex would fail on unknown keys at TeX-compile
 *   time; we drop them at substitution time so authors see clean
 *   output even with typos).
 * @param {Object} [options]
 * @param {string} [options.locator] - Page or location reference,
 *   becomes the optional `[N]` argument: `\cite[42]{key}`.
 * @param {boolean} [options.suppressAuthor] - When true, emit
 *   `\citeyear` instead of `\cite` (author-date styles render only the
 *   year — useful for "(Darwin 1859)" → "1859" inline).
 * @returns {string} Sentinel-wrapped LaTeX command, or '' when keys
 *   is empty.
 */
export function formatCite(keys, options = {}) {
    if (!Array.isArray(keys) || keys.length === 0) return ''
    const cmd = options.suppressAuthor ? '\\citeyear' : '\\cite'
    const list = keys.join(',')
    const raw = options.locator
        ? `${cmd}[${String(options.locator)}]{${list}}`
        : `${cmd}{${list}}`
    return markRawLatex(raw)
}

/**
 * Emit one or more `\autoref{}` commands for pre-resolved xref ids.
 * Multi-id clusters render as comma-separated autorefs because biblatex
 * has no native multi-cite-style \autoref grouping; cleveref does (via
 * \cref{a,b}) but adds a package dependency the v1 LaTeX template
 * avoids.
 *
 * @param {string[]} ids - Resolved xref ids (foundation filtered out
 *   anything not present in the xref-registry).
 * @returns {string} Sentinel-wrapped LaTeX command(s), or '' when ids
 *   is empty.
 */
export function formatAutoref(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return ''
    const refs = ids.map((id) => `\\autoref{${id}}`).join(', ')
    return markRawLatex(refs)
}
