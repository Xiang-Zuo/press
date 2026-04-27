/**
 * Stage 2 invoice fixture — totals row uses colSpan for a cleaner layout.
 *
 * Builds on Stage 1. The line-items table is unchanged. The totals
 * block now uses a single colSpan'd label cell instead of three
 * empty/right-aligned cells. The Total row is one merged cell pair
 * with bold + brand fill, much closer to the legacy invoice's look.
 */
import React from 'react'
import {
    Paragraph,
    TextRun,
    Table,
    Tr,
    Td,
    cm,
} from '../../../src/docx/index.js'
import { SAMPLE_INVOICE } from './stage-0-baseline.jsx'

const BRAND_ACCENT = '4775b2'
const BRAND_GRID = 'bfd3ed'
const BRAND_TEXT_DIM = '757575'
const BRAND_TEXT = '3b3b3b'

const fmt = (n) =>
    typeof n === 'number'
        ? `$${n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : n

export function Stage2Invoice({ data = SAMPLE_INVOICE }) {
    return (
        <>
            <Paragraph data-spacing-after={240}>
                <TextRun bold size={56} color={BRAND_ACCENT}>
                    INVOICE
                </TextRun>
            </Paragraph>

            <Table widths={[50, 50]} borders={borderless()}>
                <Tr>
                    <Td borderBottom="none">
                        <Paragraph>
                            <TextRun bold color={BRAND_TEXT_DIM}>FROM</TextRun>
                        </Paragraph>
                        <Paragraph>
                            <TextRun bold>{data.vendor.organization}</TextRun>
                        </Paragraph>
                        <Paragraph>{data.vendor.address}</Paragraph>
                    </Td>
                    <Td borderBottom="none">
                        <Paragraph>
                            <TextRun bold color={BRAND_TEXT_DIM}>BILL TO</TextRun>
                        </Paragraph>
                        <Paragraph>
                            <TextRun bold>{data.client.organization}</TextRun>
                        </Paragraph>
                        <Paragraph>{data.client.contact}</Paragraph>
                    </Td>
                </Tr>
            </Table>

            <Paragraph data-spacing-before={200} data-spacing-after={120}>
                <TextRun bold color={BRAND_TEXT_DIM}>INVOICE NUMBER</TextRun>{' '}
                <TextRun bold>{data.number}</TextRun>
                {'   '}
                <TextRun bold color={BRAND_TEXT_DIM}>ISSUED</TextRun>{' '}
                {data.issued}
                {'   '}
                <TextRun bold color={BRAND_TEXT_DIM}>DUE</TextRun>{' '}
                {data.due}
            </Paragraph>

            <Table
                columnWidths={[cm(10), cm(2), cm(2.5), cm(2.5)]}
                borders={brandGrid()}
            >
                <Tr header>
                    {['Description', 'Qty', 'Unit price', 'Amount'].map((label, i) => (
                        <Td key={i} shading={BRAND_ACCENT} valign="center">
                            <Paragraph data-alignment={i === 0 ? 'left' : 'right'}>
                                <TextRun bold color="FFFFFF">{label}</TextRun>
                            </Paragraph>
                        </Td>
                    ))}
                </Tr>
                {data.items.map((item, i) => (
                    <Tr key={i}>
                        <Td valign="center">
                            <Paragraph>
                                <TextRun color={BRAND_TEXT}>{item.description}</TextRun>
                            </Paragraph>
                        </Td>
                        <Td valign="center">
                            <Paragraph data-alignment="right">
                                <TextRun color={BRAND_TEXT}>{item.qty}</TextRun>
                            </Paragraph>
                        </Td>
                        <Td valign="center">
                            <Paragraph data-alignment="right">
                                <TextRun color={BRAND_TEXT}>{fmt(item.unitPrice)}</TextRun>
                            </Paragraph>
                        </Td>
                        <Td valign="center">
                            <Paragraph data-alignment="right">
                                <TextRun color={BRAND_TEXT}>{fmt(item.amount)}</TextRun>
                            </Paragraph>
                        </Td>
                    </Tr>
                ))}
            </Table>

            <Paragraph data-spacing-before={240} />

            {/* Totals: 4 columns matching the line-items table. The label
                column spans the first three columns; the value column is
                aligned to the rightmost line-items column for visual flow. */}
            <Table
                columnWidths={[cm(10), cm(2), cm(2.5), cm(2.5)]}
                borders={borderless()}
            >
                <Tr>
                    <Td colSpan={3} borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun color={BRAND_TEXT_DIM}>Subtotal</TextRun>
                        </Paragraph>
                    </Td>
                    <Td borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun bold>{fmt(data.subtotal)}</TextRun>
                        </Paragraph>
                    </Td>
                </Tr>
                <Tr>
                    <Td colSpan={3} borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun color={BRAND_TEXT_DIM}>{data.taxLabel}</TextRun>
                        </Paragraph>
                    </Td>
                    <Td borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun bold>{fmt(data.taxAmount)}</TextRun>
                        </Paragraph>
                    </Td>
                </Tr>
                <Tr>
                    <Td colSpan={3} shading={BRAND_ACCENT} borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun bold color="FFFFFF">Total</TextRun>
                        </Paragraph>
                    </Td>
                    <Td shading={BRAND_ACCENT} borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun bold color="FFFFFF">{fmt(data.total)}</TextRun>
                        </Paragraph>
                    </Td>
                </Tr>
            </Table>
        </>
    )
}

function borderless() {
    return {
        top: { style: 'none', size: 0, color: 'FFFFFF' },
        bottom: { style: 'none', size: 0, color: 'FFFFFF' },
        left: { style: 'none', size: 0, color: 'FFFFFF' },
        right: { style: 'none', size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: 'none', size: 0, color: 'FFFFFF' },
        insideVertical: { style: 'none', size: 0, color: 'FFFFFF' },
    }
}

function brandGrid() {
    return {
        top: { style: 'single', size: 4, color: BRAND_GRID },
        bottom: { style: 'single', size: 4, color: BRAND_GRID },
        left: { style: 'single', size: 4, color: BRAND_GRID },
        right: { style: 'single', size: 4, color: BRAND_GRID },
        insideHorizontal: { style: 'single', size: 4, color: BRAND_GRID },
        insideVertical: { style: 'single', size: 4, color: BRAND_GRID },
    }
}
