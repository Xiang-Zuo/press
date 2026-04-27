/**
 * Stage 1 — cell shading.
 *
 * `<Td shading="4775b2">` should produce a TableCell with a solid fill,
 * which docx serialises as <w:shd w:fill="4775B2" w:val="clear" w:color="auto"/>
 * inside the cell properties.
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Table, Tr, Td } from '../../src/docx/index.js'
import { compileInvoice } from '../integration/invoice-fixtures/_harness.jsx'

describe('Stage 1: cell shading', () => {
    it('emits <w:shd> for a hex shorthand', async () => {
        const { documentXml } = await compileInvoice(
            <Table widths={[100]}>
                <Tr header>
                    <Td shading="4775b2">Header</Td>
                </Tr>
            </Table>,
        )
        // OOXML attribute order on w:shd is library-specific; check for
        // each attribute independently rather than asserting a specific
        // serialisation. docx@9.x preserves the hex case as given.
        expect(documentXml).toMatch(/<w:shd\b[^>]*\bw:fill="4775b2"/)
        expect(documentXml).toMatch(/<w:shd\b[^>]*\bw:val="clear"/)
    })

    it('accepts an object form with explicit type', async () => {
        const { documentXml } = await compileInvoice(
            <Table widths={[100]}>
                <Tr>
                    <Td shading={{ fill: 'FFFF00', type: 'horizontalStripe' }}>
                        Pattern
                    </Td>
                </Tr>
            </Table>,
        )
        expect(documentXml).toMatch(/<w:shd\b[^>]*\bw:fill="FFFF00"/i)
        expect(documentXml).toMatch(/<w:shd\b[^>]*\bw:val="horzStripe"/)
    })
})
