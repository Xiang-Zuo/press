/**
 * Math equation — non-text inline atom. Emits a marker span the IR
 * walker turns into a `math` IR node. The docx adapter's v1 fallback
 * emits the LaTeX source as plain text (better than the mathml soup
 * it was leaking before this builder existed); a faithful OMML emitter
 * is tracked in kb/framework/plans/math-print-adapters.md §"Future work".
 *
 * Inline and block math share the same builder, distinguished by the
 * `display` flag. The optional `id` flows through for parity with the
 * typst/latex builders even though docx v1 doesn't use it.
 *
 * Mirrors `Image` — same role (non-text inline atom), same attribute
 * convention, same dispatch shape on the adapter side.
 */
export default function Math({ latex, display = false, id, ...props }) {
    const attrs = { 'data-type': 'math' }
    attrs['data-latex'] = latex || ''
    attrs['data-display'] = display ? 'true' : 'false'
    if (id) attrs['data-id'] = id

    return <span {...attrs} {...props} />
}
