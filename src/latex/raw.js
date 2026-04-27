/**
 * Raw-LaTeX passthrough sentinels.
 *
 * Foundation code that needs to inject verbatim LaTeX into a paragraph's
 * `text` field (e.g. `\cite{darwin1859}` substituted for an inline cite
 * inset) wraps the LaTeX between these Unicode private-use-area
 * characters. The adapter's `escapeLatexInline` pass leaves the
 * sentinel-bracketed segments unescaped and strips the sentinel
 * characters themselves before emission.
 *
 * Why a sentinel rather than an IR-level marker: the substitution
 * happens before Sequence builds JSX (foundation calls
 * `resolveInlineInsets` on the content sequence), so the raw text lands
 * in a paragraph's HTML string. The IR walker has no per-character
 * provenance — by the time we emit, we can't tell "this `\` came from a
 * cite substitution" from "this `\` came from authored prose." The
 * sentinel carries that provenance through unchanged.
 *
 * The characters are PUA: U+E000 (start) and U+E001 (end). Authors
 * never type these; HTML / React / parse5 all treat them as ordinary
 * characters and round-trip them unchanged.
 *
 * Lives here (rather than in src/adapters/latex.js) because the
 * adapter must stay dynamic-imported only — but foundations need to
 * statically import `markRawLatex` to use it during render. The adapter
 * imports the sentinel constants from this file too, so there is one
 * source of truth.
 */

export const RAW_BEGIN = ''
export const RAW_END = ''

/**
 * Wrap a string of verbatim LaTeX so the adapter's escape pass passes
 * it through unchanged. Foundations call this when substituting
 * commands into paragraph text (cite substitution, future xref
 * substitution, etc.).
 */
export function markRawLatex(s) {
    return RAW_BEGIN + String(s) + RAW_END
}
