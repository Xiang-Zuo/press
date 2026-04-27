/**
 * Stage 6.1 — TextRun Date safety net.
 *
 * If a Date object reaches a TextRun as a child (because YAML parsed
 * an ISO into a Date and a foundation forgot to format it), Press
 * coerces it to ISO YYYY-MM-DD before React's default
 * stringification produces "Sat Feb 28 2026 19:00:00 GMT-0500 …".
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Paragraph, TextRun } from '../../src/docx/index.js'
import { compileInvoice } from '../integration/invoice-fixtures/_harness.jsx'

describe('Stage 6.1: TextRun Date safety net', () => {
    it('coerces a bare Date child to ISO YYYY-MM-DD', async () => {
        const date = new Date(Date.UTC(2026, 2, 31)) // 2026-03-31 UTC
        const { documentXml } = await compileInvoice(
            <Paragraph>
                <TextRun>{date}</TextRun>
            </Paragraph>,
        )
        expect(documentXml).toContain('2026-03-31')
        // None of the toString() leak words sneak through.
        expect(documentXml).not.toMatch(/GMT/)
        expect(documentXml).not.toMatch(/Sat|Sun|Mon|Tue|Wed|Thu|Fri/)
    })

    it('passes invalid Date objects through as empty', async () => {
        const bad = new Date('not-a-date')
        const { documentXml } = await compileInvoice(
            <Paragraph>
                <TextRun>before:{bad}:after</TextRun>
            </Paragraph>,
        )
        expect(documentXml).toMatch(/before/)
        expect(documentXml).toMatch(/after/)
        expect(documentXml).not.toMatch(/Invalid Date/)
    })

    it('does not coerce strings or numbers', async () => {
        const { documentXml } = await compileInvoice(
            <Paragraph>
                <TextRun>{'hello'} and {42}</TextRun>
            </Paragraph>,
        )
        expect(documentXml).toContain('hello')
        expect(documentXml).toContain('42')
    })
})
