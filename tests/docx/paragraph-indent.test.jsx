/**
 * Stage 3 — paragraph indentation.
 *
 * `<Paragraph indent={{left: cm(2), firstLine: cm(1)}}>` should emit
 * <w:ind w:left="…" w:firstLine="…"/> in the paragraph properties.
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Paragraph, cm } from '../../src/docx/index.js'
import { compileInvoice } from '../integration/invoice-fixtures/_harness.js'

describe('Stage 3: paragraph indentation', () => {
    it('emits <w:ind> with left + firstLine attrs', async () => {
        const { documentXml } = await compileInvoice(
            <Paragraph indent={{ left: cm(2), firstLine: cm(1) }}>
                Indented
            </Paragraph>,
        )
        // cm(2) = floor(20/25.4*1440) = 1133; cm(1) = 566.
        expect(documentXml).toMatch(/<w:ind\b[^>]*\bw:left="1133"/)
        expect(documentXml).toMatch(/<w:ind\b[^>]*\bw:firstLine="566"/)
    })

    it('supports hanging indent', async () => {
        const { documentXml } = await compileInvoice(
            <Paragraph indent={{ left: cm(2), hanging: cm(1) }}>Hanging</Paragraph>,
        )
        expect(documentXml).toMatch(/<w:ind\b[^>]*\bw:hanging="566"/)
    })
})
