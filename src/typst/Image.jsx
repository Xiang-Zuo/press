/**
 * Image / figure. Emits <img data-type="image"> with src and optional alt,
 * width, caption, id. The adapter fetches, hashes, and rewrites src to
 * assets/<hash>.<ext> in the output bundle, and emits:
 *
 *   #figure(image("assets/<hash>.<ext>", width: <width>), caption: [<caption>])
 *
 * The optional `id` flows through as data-id so format adapters that
 * support cross-references can emit a label (LaTeX `\label{id}`,
 * Typst `<id>`) on the figure environment.
 */
export default function Image({ src, alt, width, caption, id, ...props }) {
    const attrs = { 'data-type': 'image' }
    if (src) attrs['data-src'] = src
    if (alt) attrs.alt = alt
    if (width) attrs['data-width'] = width
    if (caption) attrs['data-caption'] = caption
    if (id) attrs['data-id'] = id

    return <img src={src} {...attrs} {...props} />
}
