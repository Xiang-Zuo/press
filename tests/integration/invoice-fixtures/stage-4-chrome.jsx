/**
 * Stage 4 invoice fixture — branded page header + tabbed page footer +
 * A4 page setup. Builds on Stage 2 (colSpan totals).
 *
 * Header: brand wordmark right-aligned (placeholder for the legacy
 * logo image — Stage 5 wires the real asset pipeline).
 * Footer: three-column tabbed remit block matching the legacy invoice.
 * Page setup: A4 portrait, 2cm margins, header/footer slots reserved.
 *
 * The header/footer fragments compose <PageHeader> / <PageFooter>
 * around the branded content; the harness lifts them into the docx
 * Section.
 */
import React from 'react'
import {
    Paragraph,
    TextRun,
    Table,
    Tr,
    Td,
    PageHeader,
    PageFooter,
    PageNumber,
    TotalPages,
    Tab,
    cm,
} from '../../../src/docx/index.js'
import { SAMPLE_INVOICE } from './stage-0-baseline.jsx'
import { Stage2Invoice } from './stage-2-spans.jsx'

const BRAND_ACCENT = '4775b2'
const BRAND_TEXT_DIM = '757575'

export function Stage4Body({ data = SAMPLE_INVOICE }) {
    return <Stage2Invoice data={data} />
}

export function Stage4Header({ data = SAMPLE_INVOICE }) {
    return (
        <PageHeader>
            <Paragraph data-alignment="right">
                <TextRun bold size={28} color={BRAND_ACCENT}>
                    {data.vendor.organization.toUpperCase()}
                </TextRun>
            </Paragraph>
        </PageHeader>
    )
}

export function Stage4Footer({ data = SAMPLE_INVOICE }) {
    return (
        <PageFooter>
            {/* Three columns laid out via tab stops:
                  left:   vendor name + GST/HST
                  middle: address line
                  right:  page X of Y                                       */}
            <Paragraph
                tabStops={[
                    { position: cm(8), type: 'center' },
                    { position: cm(16), type: 'right' },
                ]}
            >
                <TextRun color={BRAND_TEXT_DIM}>
                    {data.vendor.organization}
                </TextRun>
                <Tab />
                <TextRun color={BRAND_TEXT_DIM}>
                    {data.vendor.address}
                </TextRun>
                <Tab />
                <TextRun color={BRAND_TEXT_DIM}>Page </TextRun>
                <PageNumber />
                <TextRun color={BRAND_TEXT_DIM}> of </TextRun>
                <TotalPages />
            </Paragraph>
        </PageFooter>
    )
}

/**
 * Compile-options bundle used by the build-fixtures registry. Returns
 * the body JSX plus the options that route header/footer/page setup
 * through compileInvoice.
 */
export function stage4Options(data = SAMPLE_INVOICE) {
    return {
        title: 'Invoice INV-0001 (Stage 4 — page chrome)',
        // ISO A4 portrait with 2cm margins; header/footer slots reserved.
        pageSize: { width: 11906, height: 16838 },
        pageOrientation: 'portrait',
        pageMargin: {
            top: cm(2.5),
            bottom: cm(2.5),
            left: cm(2),
            right: cm(2),
            header: cm(1.2),
            footer: cm(1.2),
        },
        header: <Stage4Header data={data} />,
        footer: <Stage4Footer data={data} />,
    }
}
