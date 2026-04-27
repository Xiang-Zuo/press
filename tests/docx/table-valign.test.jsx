/**
 * Stage 1 — vertical alignment.
 *
 * `<Td valign="center">` should set <w:vAlign w:val="center"/> on the cell.
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Table, Tr, Td } from '../../src/docx/index.js'
import { compileInvoice } from '../integration/invoice-fixtures/_harness.js'

describe('Stage 1: cell vertical alignment', () => {
    it('emits <w:vAlign> for top/center/bottom', async () => {
        const { documentXml } = await compileInvoice(
            <Table widths={[33, 33, 34]}>
                <Tr>
                    <Td valign="top">Top</Td>
                    <Td valign="center">Center</Td>
                    <Td valign="bottom">Bottom</Td>
                </Tr>
            </Table>,
        )
        expect(documentXml).toMatch(/<w:vAlign\b[^>]*\bw:val="top"/)
        expect(documentXml).toMatch(/<w:vAlign\b[^>]*\bw:val="center"/)
        expect(documentXml).toMatch(/<w:vAlign\b[^>]*\bw:val="bottom"/)
    })

    it('accepts the `middle` alias for center', async () => {
        const { documentXml } = await compileInvoice(
            <Table widths={[100]}>
                <Tr>
                    <Td valign="middle">m</Td>
                </Tr>
            </Table>,
        )
        expect(documentXml).toMatch(/<w:vAlign\b[^>]*\bw:val="center"/)
    })
})
