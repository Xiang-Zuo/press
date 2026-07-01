/**
 * Inline image bundling for source-bundle adapters (typst, latex).
 *
 * A source-bundle adapter emits an image reference (`#image(src)`,
 * `\includegraphics{src}`) into a text file and ships a directory of assets
 * alongside it. The IR carries only the author's `src` string, so the bytes
 * have to be fetched and written into the bundle — and the src rewritten to the
 * bundle-local path — before `typst` / `latex` can resolve them. Cover images
 * arrive pre-bundled via the foundation's getOptions; this handles the images
 * an author drops into the document body.
 *
 * Extracted from the typst adapter when latex became the second bundle adapter
 * needing it — principle 6 in docs/architecture/principles.md, the same reason
 * src/assets/fetch.js exists. EPUB does its own image embedding (it needs OPF
 * manifest entries and a different on-disk layout), so it doesn't share this.
 */

import { fetchAssets } from './fetch.js'

/**
 * Fetch every inline image referenced in the IR and rewrite its node `src` to a
 * bundle-local `assets/<hash>.<ext>` path, returning the map of bundle files to
 * merge into the source bundle.
 *
 * The format walker emits the (rewritten) src verbatim, so the compiler
 * resolves it against the extracted bundle directory. Byte-loading goes through
 * the shared fetchAssets helper: the host-supplied loadAsset (node:fs in
 * unipress, fetch in the browser) turns a resolved src into bytes. Images that
 * fail to load are left untouched so one missing asset doesn't abort the whole
 * document.
 *
 * @param {Object} input - compileOutputs output ({ sections, header, footer }).
 * @param {(src: string) => Promise<Uint8Array|null>} [loadAsset]
 * @returns {Promise<Record<string, Uint8Array>>} bundlePath → bytes
 */
export async function bundleInlineImages(input, loadAsset) {
    const imageNodes = collectImageNodes(input)
    if (!imageNodes.length) return {}

    const srcs = [...new Set(imageNodes.map((n) => n.src).filter(Boolean))]
    if (!srcs.length) return {}

    const fetched = await fetchAssets(srcs, { loadAsset })

    const assets = {}
    const rewrite = new Map()
    for (const [src, result] of fetched) {
        if (!result || result.error || !result.bytes) continue
        const bundlePath = `assets/${result.hash}.${result.ext}`
        assets[bundlePath] = result.bytes
        rewrite.set(src, bundlePath)
    }

    // Rewrite the IR in place so the walker emits the bundle path. The IR is
    // freshly built by compileOutputs for this compile, so mutation is safe and
    // avoids threading a rewrite map through the whole walker.
    for (const node of imageNodes) {
        const bundlePath = rewrite.get(node.src)
        if (bundlePath) node.src = bundlePath
    }

    return assets
}

/**
 * Collect every image IR node reachable from the compiled input, descending
 * through `children` (paragraphs, lists, tables, figures, …) across sections,
 * header, and footer.
 */
export function collectImageNodes(input) {
    const found = []
    const visit = (nodes) => {
        if (!Array.isArray(nodes)) return
        for (const node of nodes) {
            if (!node || typeof node !== 'object') continue
            if (node.type === 'image') found.push(node)
            if (Array.isArray(node.children)) visit(node.children)
        }
    }
    for (const section of input?.sections || []) visit(section)
    visit(input?.header || [])
    visit(input?.footer || [])
    return found
}
