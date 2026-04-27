/**
 * Stage 4 — page size + orientation as compile options.
 *
 * Foundations write:
 *   compile('docx', { pageSize: pageSizes.A4, pageOrientation: 'portrait' })
 *
 * Adapter should emit <w:pgSz w:w="…" w:h="…" w:orient="…"/> in <w:sectPr>.
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Packer, PageOrientation } from 'docx'
import JSZip from 'jszip'
import { renderToStaticMarkup } from 'react-dom/server'
import { Paragraph, pageSizes } from '../../src/docx/index.js'
import { htmlToIR } from '../../src/ir/parser.js'
import { buildDocument } from '../../src/adapters/docx.js'

async function compileWithOptions(jsx, options) {
    const html = renderToStaticMarkup(jsx)
    const ir = htmlToIR(html)
    const doc = await buildDocument({ sections: [ir] }, options)
    const buffer = await Packer.toBuffer(doc)
    const zip = await JSZip.loadAsync(buffer)
    return zip.file('word/document.xml').async('string')
}

describe('Stage 4: page size and orientation', () => {
    it('emits A4 dimensions when pageSize=pageSizes.A4', async () => {
        const xml = await compileWithOptions(<Paragraph>p</Paragraph>, {
            pageSize: pageSizes.A4,
        })
        expect(xml).toMatch(/<w:pgSz\b[^>]*\bw:w="11906"/)
        expect(xml).toMatch(/<w:pgSz\b[^>]*\bw:h="16838"/)
    })

    it('emits Letter dimensions when pageSize=pageSizes.LETTER', async () => {
        const xml = await compileWithOptions(<Paragraph>p</Paragraph>, {
            pageSize: pageSizes.LETTER,
        })
        expect(xml).toMatch(/<w:pgSz\b[^>]*\bw:w="12240"/)
        expect(xml).toMatch(/<w:pgSz\b[^>]*\bw:h="15840"/)
    })

    it('honors pageOrientation alongside pageSize', async () => {
        const xml = await compileWithOptions(<Paragraph>p</Paragraph>, {
            pageSize: pageSizes.A4,
            pageOrientation: PageOrientation.LANDSCAPE,
        })
        expect(xml).toMatch(/<w:pgSz\b[^>]*\bw:orient="landscape"/)
    })
})
