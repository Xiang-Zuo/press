/**
 * Stage 0 baseline invoice fixture — component only.
 *
 * Compiles to the "ugly" pre-professional invoice using the builder API
 * as it exists today, before any of the professional-docx work begins.
 * Anchors stage 1's first visual win.
 *
 * Imported by:
 *   - fixtures.jsx (visual-review build via `pnpm test:invoice`)
 *   - stage-0-baseline.test.jsx (vitest assertion)
 *
 * No describe/it lives in this file. Test logic stays in *.test.jsx.
 */
import React from 'react'
import {
    H1,
    H2,
    Paragraph,
    TextRun,
} from '../../../src/docx/index.js'

export const SAMPLE_INVOICE = {
    number: 'INV-0001',
    issued: '2026-03-01',
    due: '2026-03-31',
    period: { from: '2026-01-01', to: '2026-12-31' },
    poNumber: 'PO-2026-001',
    sowRef: '0001',
    vendor: {
        organization: 'Proximify Inc.',
        address: '170 Cathcart St, Unit 7, Ottawa, ON K1N 5B9',
    },
    client: {
        organization: 'Globex Corporation',
        contact: 'Jane Example',
    },
    items: [
        { description: 'Hosting (Year 1)', qty: 1, unitPrice: 8000, amount: 8000 },
        { description: 'Platform support (Year 1)', qty: 1, unitPrice: 24000, amount: 24000 },
        { description: 'Quarterly review sessions', qty: 4, unitPrice: 1500, amount: 6000 },
        { description: 'Migration assistance', qty: 12, unitPrice: 250, amount: 3000 },
    ],
    subtotal: 41000,
    taxLabel: 'HST (13%)',
    taxAmount: 5330,
    total: 46330,
}

export function BaselineInvoice({ data = SAMPLE_INVOICE }) {
    return (
        <>
            <H1 data="Invoice" data-spacing-after={240} />
            <Paragraph data-spacing-after={120}>
                Invoice number: <TextRun bold>{data.number}</TextRun>
            </Paragraph>
            <Paragraph data-spacing-after={120}>
                Issued: <TextRun bold>{data.issued}</TextRun>
                {' · '}Due: <TextRun bold>{data.due}</TextRun>
            </Paragraph>
            <Paragraph data-spacing-after={120}>
                <TextRun bold>From:</TextRun> {data.vendor.organization}
            </Paragraph>
            <Paragraph data-spacing-after={120}>{data.vendor.address}</Paragraph>
            <Paragraph data-spacing-after={240}>
                <TextRun bold>Bill to:</TextRun> {data.client.organization} ·{' '}
                {data.client.contact}
            </Paragraph>

            <H2 data="Line items" data-spacing-before={200} data-spacing-after={120} />
            {data.items.map((item, i) => (
                <Paragraph key={i} data-spacing-after={100}>
                    <TextRun bold>{item.description}</TextRun>
                    {` — ${item.qty} × ${item.unitPrice} = ${item.amount}`}
                </Paragraph>
            ))}

            <H2 data="Totals" data-spacing-before={200} data-spacing-after={120} />
            <Paragraph data-spacing-after={100}>
                Subtotal: <TextRun bold>{data.subtotal}</TextRun>
            </Paragraph>
            <Paragraph data-spacing-after={100}>
                {data.taxLabel}: <TextRun bold>{data.taxAmount}</TextRun>
            </Paragraph>
            <Paragraph data-spacing-after={120}>
                <TextRun bold>{`Total: ${data.total}`}</TextRun>
            </Paragraph>
        </>
    )
}
