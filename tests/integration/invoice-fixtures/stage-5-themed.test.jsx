import React from 'react'
import { describe, it, expect } from 'vitest'
import { compileInvoice, verifyDocx, readDocxParts } from './_harness.jsx'
import { Stage5Body, stage5Options, PROXIMIFY_THEME } from './stage-5-themed.jsx'

describe('stage 5: themed fixture', () => {
    it('renders the legacy-parity invoice with no inline brand colors', async () => {
        const opts = stage5Options()
        const { buffer, zip, documentXml } = await compileInvoice(
            <Stage5Body />,
            opts,
        )
        await verifyDocx(buffer)

        // Theme keys ('accent', 'softBorder', 'muted', 'surface') resolved
        // to the Proximify palette during render. The output XML carries
        // the resolved hex values, never the keys.
        expect(documentXml).not.toContain('"accent"')
        expect(documentXml).not.toContain('"softBorder"')
        expect(documentXml).not.toContain('"surface"')

        // Brand accent (#4775B2) shows up in title and table header.
        expect(documentXml).toMatch(/<w:color\b[^>]*\bw:val="4775B2"/)
        expect(documentXml).toMatch(/<w:shd\b[^>]*\bw:fill="4775B2"/i)

        // Soft-blue grid color resolved.
        expect(documentXml).toMatch(/<w:tblBorders\b[\s\S]*?w:color="BFD3ED"/i)

        // Header / footer present.
        const { headerXmls, footerXmls } = await readDocxParts(zip)
        expect(headerXmls.length).toBeGreaterThan(0)
        expect(footerXmls.length).toBeGreaterThan(0)
        expect(headerXmls[0]).toContain('PROXIMIFY INC.')

        // Sanity: the theme is exported for foundations to consume.
        expect(PROXIMIFY_THEME.colors.accent).toBe('4775B2')
    })
})
