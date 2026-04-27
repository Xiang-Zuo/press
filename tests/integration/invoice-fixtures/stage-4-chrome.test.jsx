import React from 'react'
import { describe, it, expect } from 'vitest'
import { compileInvoice, verifyDocx, readDocxParts } from './_harness.jsx'
import { Stage4Body, stage4Options } from './stage-4-chrome.jsx'

describe('stage 4: chrome fixture', () => {
    it('compiles with page header, tabbed footer, A4 setup', async () => {
        const opts = stage4Options()
        const { buffer, zip, documentXml } = await compileInvoice(
            <Stage4Body />,
            opts,
        )
        await verifyDocx(buffer)

        // Page setup: A4 portrait + 2cm margins.
        expect(documentXml).toMatch(/<w:pgSz\b[^>]*\bw:w="11906"/)
        expect(documentXml).toMatch(/<w:pgSz\b[^>]*\bw:h="16838"/)
        expect(documentXml).toMatch(/<w:pgSz\b[^>]*\bw:orient="portrait"/)
        // 2cm = 1133 twips (floor).
        expect(documentXml).toMatch(/<w:pgMar\b[^>]*\bw:left="1133"/)

        // Header/footer parts emitted.
        const { headerXmls, footerXmls } = await readDocxParts(zip)
        expect(headerXmls.length).toBeGreaterThan(0)
        expect(footerXmls.length).toBeGreaterThan(0)

        // Footer carries the tabbed three-column pattern.
        const footerXml = footerXmls.find((x) => /tab/i.test(x))
        expect(footerXml).toBeDefined()
        expect(footerXml).toMatch(/<w:tabs\b/)
        // PAGE field for "Page X of Y".
        expect(footerXml).toMatch(/PAGE/i)
        expect(footerXml).toMatch(/NUMPAGES/i)

        // Header carries the brand wordmark (uppercased vendor name).
        const headerXml = headerXmls[0]
        expect(headerXml).toContain('PROXIMIFY INC.')
    })
})
