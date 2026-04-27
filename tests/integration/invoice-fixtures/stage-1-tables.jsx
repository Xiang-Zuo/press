/**
 * Stage 1 invoice fixture — first real table layout.
 *
 * Uses the table-foundation capabilities added in Stage 1 of the
 * press-professional-docx plan:
 *
 *   - Two-column borderless cover table (vendor / invoice metadata)
 *   - Real line-items table with:
 *       * White-on-blue (#4775b2) shaded header row that repeats on
 *         page break
 *       * Soft-blue (#bfd3ed) cell grid via table-default borders
 *       * Fixed column widths (15cm / 4cm / 1.5cm / 4cm), expressed
 *         with the cm() unit helper
 *       * Right-aligned numeric columns
 *       * Vertical-aligned cells
 *   - Right-aligned totals table (still without colSpan — that lands
 *     in Stage 2)
 *
 * This is where line items first look like a real table.
 */
import React from 'react'
import {
    H1,
    Paragraph,
    TextRun,
    Table,
    Tr,
    Td,
    cm,
} from '../../../src/docx/index.js'
import { SAMPLE_INVOICE } from './stage-0-baseline.jsx'

// Brand palette — Stage 5 lifts these into the theme channel.
const BRAND_ACCENT = '4775b2'      // Blue header fill.
const BRAND_GRID = 'bfd3ed'        // Soft-blue grid lines.
const BRAND_TEXT_DIM = '757575'    // Muted secondary text.
const BRAND_TEXT = '3b3b3b'        // Body text.

const fmt = (n) =>
    typeof n === 'number'
        ? `$${n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : n

export function Stage1Invoice({ data = SAMPLE_INVOICE }) {
    return (
        <>
            {/* Title */}
            <Paragraph data-spacing-after={240}>
                <TextRun bold size={56} color={BRAND_ACCENT}>
                    INVOICE
                </TextRun>
            </Paragraph>

            {/* Cover: two-column borderless table for vendor / invoice meta */}
            <Table widths={[50, 50]} borders={borderless()}>
                <Tr>
                    <Td borderBottom="none">
                        <Paragraph>
                            <TextRun bold color={BRAND_TEXT_DIM}>
                                FROM
                            </TextRun>
                        </Paragraph>
                        <Paragraph>
                            <TextRun bold>{data.vendor.organization}</TextRun>
                        </Paragraph>
                        <Paragraph>{data.vendor.address}</Paragraph>
                    </Td>
                    <Td borderBottom="none">
                        <Paragraph>
                            <TextRun bold color={BRAND_TEXT_DIM}>
                                BILL TO
                            </TextRun>
                        </Paragraph>
                        <Paragraph>
                            <TextRun bold>{data.client.organization}</TextRun>
                        </Paragraph>
                        <Paragraph>{data.client.contact}</Paragraph>
                    </Td>
                </Tr>
            </Table>

            <Paragraph data-spacing-before={200} data-spacing-after={120}>
                <TextRun bold color={BRAND_TEXT_DIM}>
                    INVOICE NUMBER
                </TextRun>{' '}
                <TextRun bold>{data.number}</TextRun>
                {'   '}
                <TextRun bold color={BRAND_TEXT_DIM}>
                    ISSUED
                </TextRun>{' '}
                {data.issued}
                {'   '}
                <TextRun bold color={BRAND_TEXT_DIM}>
                    DUE
                </TextRun>{' '}
                {data.due}
            </Paragraph>

            {/* Line items: real table with branded header row + grid */}
            <Table
                columnWidths={[cm(10), cm(2), cm(2.5), cm(2.5)]}
                borders={brandGrid()}
            >
                <Tr header>
                    <Td shading={BRAND_ACCENT} valign="center">
                        <Paragraph>
                            <TextRun bold color="FFFFFF">
                                Description
                            </TextRun>
                        </Paragraph>
                    </Td>
                    <Td shading={BRAND_ACCENT} valign="center">
                        <Paragraph data-alignment="right">
                            <TextRun bold color="FFFFFF">
                                Qty
                            </TextRun>
                        </Paragraph>
                    </Td>
                    <Td shading={BRAND_ACCENT} valign="center">
                        <Paragraph data-alignment="right">
                            <TextRun bold color="FFFFFF">
                                Unit price
                            </TextRun>
                        </Paragraph>
                    </Td>
                    <Td shading={BRAND_ACCENT} valign="center">
                        <Paragraph data-alignment="right">
                            <TextRun bold color="FFFFFF">
                                Amount
                            </TextRun>
                        </Paragraph>
                    </Td>
                </Tr>
                {data.items.map((item, i) => (
                    <Tr key={i}>
                        <Td valign="center">
                            <Paragraph>
                                <TextRun color={BRAND_TEXT}>
                                    {item.description}
                                </TextRun>
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

            {/* Totals: right-aligned table. Stage 2 will collapse the label
                cells into a single colSpan'd cell for a cleaner result. */}
            <Paragraph data-spacing-before={240} />
            <Table
                columnWidths={[cm(10), cm(4), cm(3)]}
                borders={borderless()}
            >
                <Tr>
                    <Td borderBottom="none">{''}</Td>
                    <Td borderBottom="none">
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
                    <Td borderBottom="none">{''}</Td>
                    <Td borderBottom="none">
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
                    <Td borderBottom="none">{''}</Td>
                    <Td shading={BRAND_ACCENT} borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun bold color="FFFFFF">
                                Total
                            </TextRun>
                        </Paragraph>
                    </Td>
                    <Td shading={BRAND_ACCENT} borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun bold color="FFFFFF">
                                {fmt(data.total)}
                            </TextRun>
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
