/**
 * Stage 5 invoice fixture — fully themed, no hardcoded colors.
 *
 * Same visual output as Stage 4, but every brand color now comes
 * through the <DocumentProvider theme={...}> channel rather than
 * inline hex literals. Foundations consume theme keys
 * ('accent', 'muted', 'softBorder', etc.) and Press resolves them at
 * render time. This is the API the rewritten business-docs Invoice
 * section will use.
 *
 * The visual side-by-side acceptance test for Stage 5 is "the docx
 * looks the same as the legacy Proximify invoice." That comparison
 * is manual — open out/stage-5-themed.docx alongside a legacy artifact.
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

/**
 * Reusable theme that matches the legacy Proximify invoice palette.
 * Foundations would normally derive this from the foundation config
 * (theme.yml on the site). Here it's inline so the fixture is
 * self-contained.
 */
export const PROXIMIFY_THEME = {
    colors: {
        accent: '4775B2',
        body: '3B3B3B',
        muted: '757575',
        softBorder: 'BFD3ED',
        surface: 'FFFFFF',
    },
    fonts: {
        heading: 'Calibri',
        body: 'Calibri',
    },
}

const fmt = (n) =>
    typeof n === 'number'
        ? `$${n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : n

const borderless = () => ({
    top: { style: 'none', size: 0, color: 'FFFFFF' },
    bottom: { style: 'none', size: 0, color: 'FFFFFF' },
    left: { style: 'none', size: 0, color: 'FFFFFF' },
    right: { style: 'none', size: 0, color: 'FFFFFF' },
    insideHorizontal: { style: 'none', size: 0, color: 'FFFFFF' },
    insideVertical: { style: 'none', size: 0, color: 'FFFFFF' },
})

const themedGrid = () => ({
    top: { style: 'single', size: 4, color: 'softBorder' },
    bottom: { style: 'single', size: 4, color: 'softBorder' },
    left: { style: 'single', size: 4, color: 'softBorder' },
    right: { style: 'single', size: 4, color: 'softBorder' },
    insideHorizontal: { style: 'single', size: 4, color: 'softBorder' },
    insideVertical: { style: 'single', size: 4, color: 'softBorder' },
})

export function Stage5Body({ data = SAMPLE_INVOICE }) {
    return (
        <>
            <Paragraph data-spacing-after={240}>
                <TextRun bold size={56} color="accent" font="heading">
                    INVOICE
                </TextRun>
            </Paragraph>

            <Table widths={[50, 50]} borders={borderless()}>
                <Tr>
                    <Td borderBottom="none">
                        <Paragraph>
                            <TextRun bold color="muted">FROM</TextRun>
                        </Paragraph>
                        <Paragraph>
                            <TextRun bold color="body">{data.vendor.organization}</TextRun>
                        </Paragraph>
                        <Paragraph>
                            <TextRun color="body">{data.vendor.address}</TextRun>
                        </Paragraph>
                    </Td>
                    <Td borderBottom="none">
                        <Paragraph>
                            <TextRun bold color="muted">BILL TO</TextRun>
                        </Paragraph>
                        <Paragraph>
                            <TextRun bold color="body">{data.client.organization}</TextRun>
                        </Paragraph>
                        <Paragraph>
                            <TextRun color="body">{data.client.contact}</TextRun>
                        </Paragraph>
                    </Td>
                </Tr>
            </Table>

            <Paragraph data-spacing-before={200} data-spacing-after={120}>
                <TextRun bold color="muted">INVOICE NUMBER</TextRun>{' '}
                <TextRun bold color="body">{data.number}</TextRun>
                {'   '}
                <TextRun bold color="muted">ISSUED</TextRun>{' '}
                <TextRun color="body">{data.issued}</TextRun>
                {'   '}
                <TextRun bold color="muted">DUE</TextRun>{' '}
                <TextRun color="body">{data.due}</TextRun>
            </Paragraph>

            <Table
                columnWidths={[cm(10), cm(2), cm(2.5), cm(2.5)]}
                borders={themedGrid()}
            >
                <Tr header>
                    {['Description', 'Qty', 'Unit price', 'Amount'].map((label, i) => (
                        <Td key={i} shading="accent" valign="center">
                            <Paragraph data-alignment={i === 0 ? 'left' : 'right'}>
                                <TextRun bold color="surface">{label}</TextRun>
                            </Paragraph>
                        </Td>
                    ))}
                </Tr>
                {data.items.map((item, i) => (
                    <Tr key={i}>
                        <Td valign="center">
                            <Paragraph>
                                <TextRun color="body">{item.description}</TextRun>
                            </Paragraph>
                        </Td>
                        <Td valign="center">
                            <Paragraph data-alignment="right">
                                <TextRun color="body">{item.qty}</TextRun>
                            </Paragraph>
                        </Td>
                        <Td valign="center">
                            <Paragraph data-alignment="right">
                                <TextRun color="body">{fmt(item.unitPrice)}</TextRun>
                            </Paragraph>
                        </Td>
                        <Td valign="center">
                            <Paragraph data-alignment="right">
                                <TextRun color="body">{fmt(item.amount)}</TextRun>
                            </Paragraph>
                        </Td>
                    </Tr>
                ))}
            </Table>

            <Paragraph data-spacing-before={240} />

            <Table
                columnWidths={[cm(10), cm(2), cm(2.5), cm(2.5)]}
                borders={borderless()}
            >
                <Tr>
                    <Td colSpan={3} borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun color="muted">Subtotal</TextRun>
                        </Paragraph>
                    </Td>
                    <Td borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun bold color="body">{fmt(data.subtotal)}</TextRun>
                        </Paragraph>
                    </Td>
                </Tr>
                <Tr>
                    <Td colSpan={3} borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun color="muted">{data.taxLabel}</TextRun>
                        </Paragraph>
                    </Td>
                    <Td borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun bold color="body">{fmt(data.taxAmount)}</TextRun>
                        </Paragraph>
                    </Td>
                </Tr>
                <Tr>
                    <Td colSpan={3} shading="accent" borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun bold color="surface">Total</TextRun>
                        </Paragraph>
                    </Td>
                    <Td shading="accent" borderBottom="none">
                        <Paragraph data-alignment="right">
                            <TextRun bold color="surface">{fmt(data.total)}</TextRun>
                        </Paragraph>
                    </Td>
                </Tr>
            </Table>
        </>
    )
}

export function Stage5Header({ data = SAMPLE_INVOICE }) {
    return (
        <PageHeader>
            <Paragraph data-alignment="right">
                <TextRun bold size={28} color="accent" font="heading">
                    {data.vendor.organization.toUpperCase()}
                </TextRun>
            </Paragraph>
        </PageHeader>
    )
}

export function Stage5Footer({ data = SAMPLE_INVOICE }) {
    return (
        <PageFooter>
            <Paragraph
                tabStops={[
                    { position: cm(8), type: 'center' },
                    { position: cm(16), type: 'right' },
                ]}
            >
                <TextRun color="muted">{data.vendor.organization}</TextRun>
                <Tab />
                <TextRun color="muted">{data.vendor.address}</TextRun>
                <Tab />
                <TextRun color="muted">Page </TextRun>
                <PageNumber />
                <TextRun color="muted"> of </TextRun>
                <TotalPages />
            </Paragraph>
        </PageFooter>
    )
}

export function stage5Options(data = SAMPLE_INVOICE) {
    return {
        title: 'Invoice INV-0001 (Stage 5 — themed, legacy parity)',
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
        header: <Stage5Header data={data} />,
        footer: <Stage5Footer data={data} />,
        theme: PROXIMIFY_THEME,
    }
}
