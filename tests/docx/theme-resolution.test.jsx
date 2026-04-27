/**
 * Stage 5 — theme channel.
 *
 * `<DocumentProvider theme={...}>` flows brand colors / fonts through
 * to TextRun and Td builders. Builders accept either a literal hex or
 * a theme key ('accent', 'softBorder', etc.); the key resolves at
 * render time so the IR walker never sees theme keys.
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Packer } from 'docx'
import JSZip from 'jszip'
import {
    DocumentProvider,
    useDocumentOutput,
    useDocumentCompile,
} from '../../src/index.js'
import {
    Paragraph,
    TextRun,
    Table,
    Tr,
    Td,
} from '../../src/docx/index.js'
import { htmlToIR } from '../../src/ir/parser.js'
import { buildDocument } from '../../src/adapters/docx.js'

/**
 * Render a JSX fragment through DocumentProvider's wrapping so the
 * theme context is active during renderToStaticMarkup. Mirrors what
 * compile() does internally.
 */
async function compileWithTheme(jsx, theme) {
    const html = renderToStaticMarkup(
        <DocumentProvider theme={theme}>{jsx}</DocumentProvider>,
    )
    const ir = htmlToIR(html)
    const doc = await buildDocument({ sections: [ir] }, {})
    const buffer = await Packer.toBuffer(doc)
    const zip = await JSZip.loadAsync(buffer)
    return zip.file('word/document.xml').async('string')
}

describe('Stage 5: theme channel', () => {
    const theme = {
        colors: {
            accent: '4775B2',
            body: '3B3B3B',
            muted: '757575',
            softBorder: 'BFD3ED',
        },
        fonts: { heading: 'Calibri' },
    }

    it('resolves color="accent" on TextRun', async () => {
        const xml = await compileWithTheme(
            <Paragraph>
                <TextRun color="accent">title</TextRun>
            </Paragraph>,
            theme,
        )
        expect(xml).toMatch(/<w:color\b[^>]*\bw:val="4775B2"/)
    })

    it('resolves shading="accent" on Td', async () => {
        const xml = await compileWithTheme(
            <Table widths={[100]}>
                <Tr>
                    <Td shading="accent">x</Td>
                </Tr>
            </Table>,
            theme,
        )
        expect(xml).toMatch(/<w:shd\b[^>]*\bw:fill="4775B2"/)
    })

    it('resolves border color theme keys on Table', async () => {
        const xml = await compileWithTheme(
            <Table
                widths={[100]}
                borders={{
                    top: { style: 'single', size: 4, color: 'softBorder' },
                }}
            >
                <Tr>
                    <Td>x</Td>
                </Tr>
            </Table>,
            theme,
        )
        expect(xml).toMatch(/<w:tblBorders\b[\s\S]*?w:color="BFD3ED"/)
    })

    it('passes hex literals through unchanged', async () => {
        const xml = await compileWithTheme(
            <Paragraph>
                <TextRun color="FF8800">orange</TextRun>
            </Paragraph>,
            theme,
        )
        expect(xml).toMatch(/<w:color\b[^>]*\bw:val="FF8800"/)
    })

    it('strips a leading # from hex literals', async () => {
        const xml = await compileWithTheme(
            <Paragraph>
                <TextRun color="#33CC44">spring</TextRun>
            </Paragraph>,
            theme,
        )
        expect(xml).toMatch(/<w:color\b[^>]*\bw:val="33CC44"/)
    })
})
