/**
 * Stage 1 — repeating header row.
 *
 * `<Tr header>` should set the docx `tableHeader` flag, which serialises
 * as <w:tblHeader/> in the row properties. Word uses this to repeat the
 * header at the top of each new page when the table breaks.
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Table, Tr, Td } from '../../src/docx/index.js'
import { compileInvoice } from '../integration/invoice-fixtures/_harness.jsx'

describe('Stage 1: repeating header row', () => {
    it('emits <w:tblHeader/> on rows marked header', async () => {
        const { documentXml } = await compileInvoice(
            <Table widths={[50, 50]}>
                <Tr header>
                    <Td>Name</Td>
                    <Td>Amount</Td>
                </Tr>
                <Tr>
                    <Td>Hosting</Td>
                    <Td>$8,000</Td>
                </Tr>
            </Table>,
        )

        // Exactly one <w:tblHeader> for the one header row.
        const matches = documentXml.match(/<w:tblHeader\b/g) || []
        expect(matches.length).toBe(1)
    })

    it('does not emit <w:tblHeader/> for body rows', async () => {
        const { documentXml } = await compileInvoice(
            <Table widths={[100]}>
                <Tr>
                    <Td>only-body</Td>
                </Tr>
            </Table>,
        )
        expect(documentXml).not.toMatch(/<w:tblHeader\b/)
    })
})
