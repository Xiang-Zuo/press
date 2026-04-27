/**
 * Stage 0 baseline invoice — verifyDocx assertion.
 *
 * The fixture compiles cleanly today; this test is the harness's
 * smoke-check that the Word-clean invariants pass on a real invoice
 * before we start changing the adapter in stage 1.
 */
import React from 'react'
import { describe, it, expect } from 'vitest'
import { compileInvoice, verifyDocx } from './_harness.jsx'
import { BaselineInvoice } from './stage-0-baseline.jsx'

describe('stage 0: baseline invoice fixture', () => {
    it('compiles to a Word-clean docx via the harness', async () => {
        const { buffer, documentXml } = await compileInvoice(<BaselineInvoice />)
        await verifyDocx(buffer)

        expect(documentXml).toContain('Invoice')
        expect(documentXml).toContain('INV-0001')
        expect(documentXml).toContain('Hosting (Year 1)')
        expect(documentXml).toContain('46330')
    })
})
