/**
 * Stage 4 — <PageNumber/> and <TotalPages/> field-code builders.
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import {
    Paragraph,
    TextRun,
    PageNumber,
    TotalPages,
} from '../../src/docx/index.js'
import { compileInvoice } from '../integration/invoice-fixtures/_harness.jsx'

describe('Stage 4: page-number field codes', () => {
    it('emits a PAGE field for <PageNumber/>', async () => {
        const { documentXml } = await compileInvoice(
            <Paragraph>
                <TextRun>Page </TextRun>
                <PageNumber />
            </Paragraph>,
        )
        // docx@9.x emits a fldChar triplet around an <w:instrText>PAGE</w:instrText>.
        // We don't pin the exact serialisation; just confirm Word will see
        // the page field at all.
        expect(documentXml).toMatch(/<w:fldChar\b|<w:fldSimple\b/)
        expect(documentXml).toMatch(/PAGE/i)
    })

    it('emits a NUMPAGES field for <TotalPages/>', async () => {
        const { documentXml } = await compileInvoice(
            <Paragraph>
                <TextRun>Pages: </TextRun>
                <TotalPages />
            </Paragraph>,
        )
        expect(documentXml).toMatch(/NUMPAGES/i)
    })
})
