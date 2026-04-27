/**
 * Stage 2 — colSpan (grid-span) for table cells.
 *
 * <Td colSpan={3}> should:
 *   - Emit <w:gridSpan w:val="3"/> in the cell properties.
 *   - Cause the next sibling <Td> in the same <Tr> to be assigned the
 *     correct column index (so per-column widths in <Table widths={…}>
 *     line up correctly).
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Table, Tr, Td } from '../../src/docx/index.js'
import { compileInvoice } from '../integration/invoice-fixtures/_harness.js'

describe('Stage 2: colSpan', () => {
    it('emits <w:gridSpan> for a multi-column cell', async () => {
        const { documentXml } = await compileInvoice(
            <Table widths={[40, 30, 30]}>
                <Tr>
                    <Td colSpan={3}>Header spanning all 3 columns</Td>
                </Tr>
                <Tr>
                    <Td>A</Td>
                    <Td>B</Td>
                    <Td>C</Td>
                </Tr>
            </Table>,
        )
        expect(documentXml).toMatch(/<w:gridSpan\b[^>]*\bw:val="3"/)
    })

    it('skips column indices for the right of a colSpan cell', async () => {
        // Column widths via <Table widths={[10, 30, 60]}>:
        //   Td 0: width 10 (col 0)
        //   Td colSpan=2: covers col 1+2 → next index becomes 3
        // So no third <Td> needed at width 60 — the spanned cell already
        // covers it. We assert the data-width-size attributes that get
        // emitted match the columns the cells actually occupy.
        const { documentXml } = await compileInvoice(
            <Table widths={[10, 30, 60]}>
                <Tr>
                    <Td>narrow</Td>
                    <Td colSpan={2}>wide</Td>
                </Tr>
            </Table>,
        )
        // First cell: 10% (cell index 0).
        expect(documentXml).toMatch(/<w:tcW\b[^>]*\bw:type="pct"[^>]*\bw:w="500"/)
        // Spanned cell: gridSpan=2 with the index-1 width (30%).
        expect(documentXml).toMatch(/<w:gridSpan\b[^>]*\bw:val="2"/)
        expect(documentXml).toMatch(/<w:tcW\b[^>]*\bw:type="pct"[^>]*\bw:w="1500"/)
    })

    it('does not emit gridSpan for colSpan=1 (the default)', async () => {
        const { documentXml } = await compileInvoice(
            <Table widths={[100]}>
                <Tr>
                    <Td colSpan={1}>plain</Td>
                </Tr>
            </Table>,
        )
        expect(documentXml).not.toMatch(/<w:gridSpan\b/)
    })
})
