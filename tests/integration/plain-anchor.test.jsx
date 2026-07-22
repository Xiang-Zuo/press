import { describe, it, expect } from 'vitest'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { htmlToIR } from '../../src/ir/parser.js'
import { Paragraph } from '../../src/typst/index.js'
import { buildBundle } from '../../src/adapters/typst.js'

/**
 * A plain <a href> written directly in JSX.
 *
 * Foundations reach this shape by writing one component that serves both the
 * browser preview and the compile input — the same-source property
 * principles.md §8 asks us to pursue. An author doing that writes an ordinary
 * anchor, because that is what the browser needs.
 *
 * The IR is data-* driven, so attributesToProperties dropped `href` and the
 * adapters emitted the link TEXT with its destination silently gone. That is
 * exactly the preview/output drift §8 exists to eliminate: the preview links,
 * the export does not, and nothing says so.
 *
 * Only `href`, and only on an anchor. The IR stays data-* driven everywhere
 * else.
 */

function irOf(element) {
    return htmlToIR(ReactDOMServer.renderToStaticMarkup(element))
}

function typstOf(element) {
    return buildBundle({ sections: [irOf(element)], metadata: null })['content.typ']
}

describe('plain <a href> in same-source JSX', () => {
    it('carries the href into the IR', () => {
        const ir = irOf(
            <Paragraph>
                See <a href="https://example.com">the docs</a>.
            </Paragraph>,
        )

        const anchor = ir[0].children.find((c) => c.type === 'a')
        expect(anchor).toMatchObject({ type: 'a', href: 'https://example.com' })
    })

    it('emits a typst #link, matching the data-type path', () => {
        const plain = typstOf(
            <Paragraph>
                See <a href="https://example.com">the docs</a>.
            </Paragraph>,
        )
        const viaData = typstOf(<Paragraph data='See <a href="https://example.com">the docs</a>.' />)

        expect(plain).toContain('#link("https://example.com")')
        expect(plain).toContain('the docs')
        // Both routes describe the same document, so both emit the same link.
        expect(viaData).toContain('#link("https://example.com")')
    })

    it('leaves an anchor with no href alone', () => {
        const ir = irOf(
            <Paragraph>
                <a>no destination</a>
            </Paragraph>,
        )

        const anchor = ir[0].children.find((c) => c.type === 'a')
        expect(anchor.href).toBeUndefined()
    })

    it('does not lift any other plain attribute', () => {
        // The IR is data-* driven; href is the single deliberate exception.
        const ir = irOf(
            <Paragraph>
                <a href="/x" title="tip" rel="noopener">
                    link
                </a>
            </Paragraph>,
        )

        const anchor = ir[0].children.find((c) => c.type === 'a')
        expect(anchor.href).toBe('/x')
        expect(anchor.title).toBeUndefined()
        expect(anchor.rel).toBeUndefined()
    })

    it('lets an explicit data-href win over the plain attribute', () => {
        const ir = htmlToIR('<a href="/plain" data-href="/explicit">x</a>')

        expect(ir[0].href).toBe('/explicit')
    })
})
