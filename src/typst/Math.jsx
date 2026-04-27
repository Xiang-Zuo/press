/**
 * Math equation — non-text inline atom. Emits a marker span the IR
 * walker turns into a `math` IR node. The typst adapter dispatches on
 * the node and emits `#mitex(`<latex>`)` (inline) or `$ #mitex(`<latex>`) $`
 * (display); foundations consuming `outputs.typst` import mitex in
 * their preamble.
 *
 * Inline and block math share the same builder, distinguished by the
 * `display` flag. The optional `id` flows through as data-id so the
 * typst adapter can emit a typst label (`<id>`) for native
 * cross-references.
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
