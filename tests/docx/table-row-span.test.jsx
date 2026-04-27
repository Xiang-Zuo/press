/**
 * Stage 2 — rowSpan for table cells.
 *
 * <Td rowSpan={3}> should produce a vertical merge: the starting cell
 * gets <w:vMerge w:val="restart"/> and subsequent rows get continue
 * cells in the corresponding column. docx@9.x's rowSpan shorthand
 * handles the continue cells internally — foundations only declare
 * the merge on the starting cell.
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Table, Tr, Td } from '../../src/docx/index.js'
import { compileInvoice } from '../integration/invoice-fixtures/_harness.js'

describe('Stage 2: rowSpan', () => {
    it('emits <w:vMerge w:val="restart"/> on the starting cell', async () => {
        const { documentXml } = await compileInvoice(
            <Table widths={[30, 70]}>
                <Tr>
                    <Td rowSpan={3}>Span column</Td>
                    <Td>row 1</Td>
                </Tr>
                <Tr>
                    <Td>row 2</Td>
                </Tr>
                <Tr>
                    <Td>row 3</Td>
                </Tr>
            </Table>,
        )
        expect(documentXml).toMatch(/<w:vMerge\b[^>]*\bw:val="restart"/)
    })

    it('does not emit vMerge for rowSpan=1 (the default)', async () => {
        const { documentXml } = await compileInvoice(
            <Table widths={[100]}>
                <Tr>
                    <Td rowSpan={1}>plain</Td>
                </Tr>
            </Table>,
        )
        expect(documentXml).not.toMatch(/<w:vMerge\b/)
    })
})
