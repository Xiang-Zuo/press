/**
 * Stage 1 invoice fixture — verifyDocx + spot checks that the
 * branded-table layout actually emitted.
 */
import React from 'react'
import { describe, it, expect } from 'vitest'
import { compileInvoice, verifyDocx } from './_harness.js'
import { Stage1Invoice } from './stage-1-tables.jsx'

describe('stage 1: tables fixture', () => {
    it('compiles to a Word-clean docx with shaded headers and a fixed-layout grid', async () => {
        const { buffer, documentXml } = await compileInvoice(<Stage1Invoice />)
        await verifyDocx(buffer)

        // INVOICE title in brand color.
        expect(documentXml).toContain('INVOICE')
        expect(documentXml).toMatch(/<w:color\b[^>]*\bw:val="4775b2"/)

        // White-on-blue header row.
        expect(documentXml).toMatch(/<w:shd\b[^>]*\bw:fill="4775b2"/)
        expect(documentXml).toMatch(/<w:color\b[^>]*\bw:val="FFFFFF"/)

        // Fixed table layout + repeating header row.
        expect(documentXml).toMatch(/<w:tblLayout\b[^>]*\bw:type="fixed"/)
        expect(documentXml).toMatch(/<w:tblHeader\b/)

        // Soft-blue grid.
        expect(documentXml).toMatch(/<w:tblBorders\b[\s\S]*?w:color="bfd3ed"/)

        // Data made it through.
        expect(documentXml).toContain('Hosting (Year 1)')
        expect(documentXml).toContain('$46,330.00')
    })
})
