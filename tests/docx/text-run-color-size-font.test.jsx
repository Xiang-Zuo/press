/**
 * Stage 1 — TextRun color/size/font props (pulled forward from Stage 3
 * because the Stage 1 invoice fixture needs them for branded headers).
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Paragraph, TextRun } from '../../src/docx/index.js'
import { compileInvoice } from '../integration/invoice-fixtures/_harness.js'

describe('Stage 1: TextRun color / size / font', () => {
    it('emits <w:color>, <w:sz>, <w:rFonts> when set', async () => {
        const { documentXml } = await compileInvoice(
            <Paragraph>
                <TextRun color="4775b2" size={56} font="Calibri">
                    Brand title
                </TextRun>
            </Paragraph>,
        )
        expect(documentXml).toMatch(/<w:color\b[^>]*\bw:val="4775b2"/)
        expect(documentXml).toMatch(/<w:sz\b[^>]*\bw:val="56"/)
        expect(documentXml).toMatch(/<w:rFonts\b[^>]*\bw:ascii="Calibri"/)
    })
})
