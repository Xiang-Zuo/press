/**
 * Stage 1 — fixed table layout + columnWidths.
 *
 * `<Table columnWidths={[cm(15), cm(4), cm(1.5), cm(4)]}>` should:
 *   - emit <w:tblLayout w:type="fixed"/> in the table properties
 *   - emit <w:tblGrid> with one <w:gridCol w:w="…"/> per column
 *   - default `layout` to 'fixed' when columnWidths is set
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Table, Tr, Td, cm } from '../../src/docx/index.js'
import { compileInvoice } from '../integration/invoice-fixtures/_harness.js'

describe('Stage 1: fixed table layout and column widths', () => {
    it('emits <w:tblLayout w:type="fixed"/> by default when columnWidths is set', async () => {
        const cols = [cm(15), cm(4), cm(1.5), cm(4)]
        const { documentXml } = await compileInvoice(
            <Table columnWidths={cols}>
                <Tr>
                    <Td>a</Td>
                    <Td>b</Td>
                    <Td>c</Td>
                    <Td>d</Td>
                </Tr>
            </Table>,
        )
        expect(documentXml).toMatch(/<w:tblLayout\b[^>]*\bw:type="fixed"/)

        // <w:tblGrid> has one <w:gridCol> per column with the right widths.
        const gridColMatches =
            documentXml.match(/<w:gridCol\b[^>]*\bw:w="(\d+)"/g) || []
        expect(gridColMatches).toHaveLength(4)
        const widths = gridColMatches.map((m) => Number(/w:w="(\d+)"/.exec(m)[1]))
        expect(widths).toEqual(cols)
    })

    it('honors an explicit layout="autofit"', async () => {
        const { documentXml } = await compileInvoice(
            <Table columnWidths={[cm(5), cm(5)]} layout="autofit">
                <Tr>
                    <Td>a</Td>
                    <Td>b</Td>
                </Tr>
            </Table>,
        )
        expect(documentXml).toMatch(/<w:tblLayout\b[^>]*\bw:type="autofit"/)
    })
})
