import React from 'react'
import { describe, it, expect } from 'vitest'
import { compileInvoice, verifyDocx } from './_harness.jsx'
import { Stage2Invoice } from './stage-2-spans.jsx'

describe('stage 2: spans fixture', () => {
    it('totals block uses colSpan=3 for the label cells', async () => {
        const { buffer, documentXml } = await compileInvoice(<Stage2Invoice />)
        await verifyDocx(buffer)

        // The three totals rows each have one colSpan=3 label cell.
        const spanThreeCount =
            (documentXml.match(/<w:gridSpan\b[^>]*\bw:val="3"/g) || []).length
        expect(spanThreeCount).toBe(3)
    })
})
