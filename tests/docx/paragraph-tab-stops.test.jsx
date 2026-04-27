/**
 * Stage 3 — paragraph tab stops + <Tab/> inline marker.
 *
 * The legacy invoice's footer uses a 12cm tab stop to push the right
 * column over. JSX equivalent:
 *
 *   <Paragraph tabStops={[{position: cm(12), type: 'right', leader: 'dot'}]}>
 *     Left side<Tab/>Right side
 *   </Paragraph>
 *
 * Should serialise as <w:tabs><w:tab w:val="right" w:pos="6804" w:leader="dot"/></w:tabs>
 * inside the paragraph properties, with a <w:tab/> element in the run.
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Paragraph, Tab, TextRun, cm } from '../../src/docx/index.js'
import { compileInvoice } from '../integration/invoice-fixtures/_harness.js'

describe('Stage 3: paragraph tab stops', () => {
    it('emits <w:tabs>/<w:tab> in paragraph properties', async () => {
        const { documentXml } = await compileInvoice(
            <Paragraph
                tabStops={[
                    { position: cm(12), type: 'right', leader: 'dot' },
                ]}
            >
                <TextRun>Left side</TextRun>
                <Tab />
                <TextRun>Right side</TextRun>
            </Paragraph>,
        )
        // Tab stop definition.
        // cm(12) is convertCentimetersToTwip(12) = Math.floor(120/25.4*1440) = 6803.
        expect(documentXml).toMatch(/<w:tab\b[^>]*\bw:val="right"/)
        expect(documentXml).toMatch(/<w:tab\b[^>]*\bw:pos="6803"/)
        expect(documentXml).toMatch(/<w:tab\b[^>]*\bw:leader="dot"/)
    })

    it('emits a <w:tab/> run for the <Tab/> marker', async () => {
        const { documentXml } = await compileInvoice(
            <Paragraph tabStops={[{ position: cm(6), type: 'left' }]}>
                <TextRun>A</TextRun>
                <Tab />
                <TextRun>B</TextRun>
            </Paragraph>,
        )
        // The <Tab/> compiles to <w:r><w:tab/></w:r> inside the paragraph.
        expect(documentXml).toMatch(/<w:r>\s*<w:tab\s*\/>\s*<\/w:r>/)
    })
})
