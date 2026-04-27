/**
 * Stage 6.0 — typography roles via OOXML styles.
 *
 * Verifies that:
 *   - theme.typography roles synthesise OOXML paragraphStyles +
 *     characterStyles in the docx output (word/styles.xml).
 *   - The Body role becomes the document default (so the file uses
 *     theme.fonts.body without every TextRun emitting data-font —
 *     fixes the Times New Roman fallback).
 *   - <Paragraph role="Title"> emits <w:pStyle w:val="Title"/>.
 *   - <TextRun role="Label"> emits <w:rStyle w:val="Label"/>.
 *   - Inline overrides (color="accent") still work alongside roles.
 *   - Caller-supplied paragraphStyles / characterStyles override
 *     synthesised ones with the same id.
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Packer } from 'docx'
import JSZip from 'jszip'
import { DocumentProvider } from '../../src/index.js'
import { Paragraph, TextRun } from '../../src/docx/index.js'
import { htmlToIR } from '../../src/ir/parser.js'
import { buildDocument } from '../../src/adapters/docx.js'

const THEME = {
    colors: {
        accent: '4775B2',
        body: '3B3B3B',
        muted: '757575',
        softBorder: 'BFD3ED',
        surface: 'FFFFFF',
    },
    fonts: { body: 'Calibri', heading: 'Calibri' },
}

async function compile(jsx, options = {}) {
    const html = renderToStaticMarkup(
        <DocumentProvider theme={THEME}>{jsx}</DocumentProvider>,
    )
    const ir = htmlToIR(html)
    const doc = await buildDocument(
        { sections: [ir] },
        { theme: THEME, ...options },
    )
    const buffer = await Packer.toBuffer(doc)
    const zip = await JSZip.loadAsync(buffer)
    return {
        documentXml: await zip.file('word/document.xml').async('string'),
        stylesXml: await zip.file('word/styles.xml').async('string'),
    }
}

describe('Stage 6.0: typography roles', () => {
    it('synthesises a Title paragraph style from the theme', async () => {
        const { stylesXml } = await compile(<Paragraph>x</Paragraph>)
        // Title is a paragraph style with the resolved heading font + 28pt accent.
        expect(stylesXml).toMatch(/<w:style\b[^>]*\bw:styleId="Title"/)
        expect(stylesXml).toMatch(/<w:rFonts\b[^>]*\bw:ascii="Calibri"/)
        // Title accent color resolved from theme.
        expect(stylesXml).toMatch(/4775B2/)
    })

    it('emits Label as a character style (run properties only)', async () => {
        const { stylesXml } = await compile(<Paragraph>x</Paragraph>)
        // <w:style w:type="character" w:styleId="Label">
        expect(stylesXml).toMatch(
            /<w:style\b[^>]*\bw:type="character"[^>]*\bw:styleId="Label"/,
        )
    })

    it('Body role becomes the document default (fixes Times New Roman fallback)', async () => {
        const { stylesXml } = await compile(<Paragraph>x</Paragraph>)
        // <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri"/>…
        expect(stylesXml).toMatch(/<w:docDefaults\b/)
        expect(stylesXml).toMatch(
            /<w:docDefaults\b[\s\S]*?<w:rFonts\b[^>]*\bw:ascii="Calibri"/,
        )
    })

    it('Paragraph role="Title" emits <w:pStyle w:val="Title"/>', async () => {
        const { documentXml } = await compile(
            <Paragraph role="Title">INVOICE</Paragraph>,
        )
        expect(documentXml).toMatch(/<w:pStyle\b[^>]*\bw:val="Title"/)
    })

    it('TextRun role="Label" emits <w:rStyle w:val="Label"/>', async () => {
        const { documentXml } = await compile(
            <Paragraph>
                <TextRun role="Label">DUE</TextRun>
            </Paragraph>,
        )
        expect(documentXml).toMatch(/<w:rStyle\b[^>]*\bw:val="Label"/)
    })

    it('inline color overrides apply on top of a role', async () => {
        const { documentXml } = await compile(
            <Paragraph>
                <TextRun role="Label" color="accent">
                    DUE
                </TextRun>
            </Paragraph>,
        )
        // Label style reference present.
        expect(documentXml).toMatch(/<w:rStyle\b[^>]*\bw:val="Label"/)
        // Inline accent override emitted.
        expect(documentXml).toMatch(/<w:color\b[^>]*\bw:val="4775B2"/)
    })

    it('caller-supplied Title overrides the synthesised default.title', async () => {
        const { stylesXml } = await compile(<Paragraph>x</Paragraph>, {
            paragraphStyles: [
                {
                    id: 'Title',
                    name: 'Title',
                    basedOn: 'Normal',
                    quickFormat: true,
                    run: { color: 'FF0000', size: 99 },
                },
            ],
        })
        // Caller's red 49.5pt Title wins inside the built-in Title style.
        expect(stylesXml).toMatch(
            /<w:style\b[^>]*\bw:styleId="Title"[\s\S]*?<w:color\b[^>]*\bw:val="FF0000"/,
        )
        expect(stylesXml).not.toMatch(
            /<w:style\b[^>]*\bw:styleId="Title"[\s\S]*?<w:color\b[^>]*\bw:val="4775B2"/,
        )
    })

    it('falls back to legacy paragraphStyles passthrough when no theme is given', async () => {
        // Compile without theme — the synthesizer should be skipped
        // (no docDefault font set, no synthesised Body/Display/Label),
        // and the raw paragraphStyles array reaches docx as-is.
        const html = renderToStaticMarkup(<Paragraph>x</Paragraph>)
        const ir = htmlToIR(html)
        const doc = await buildDocument(
            { sections: [ir] },
            {
                paragraphStyles: [
                    {
                        id: 'Custom',
                        name: 'Custom',
                        basedOn: 'Normal',
                        quickFormat: true,
                        run: { bold: true },
                    },
                ],
            },
        )
        const buffer = await Packer.toBuffer(doc)
        const zip = await JSZip.loadAsync(buffer)
        const stylesXml = await zip.file('word/styles.xml').async('string')
        expect(stylesXml).toMatch(/<w:style\b[^>]*\bw:styleId="Custom"/)
        // No theme synthesis: docDefaults stays empty (no font pinned).
        expect(stylesXml).toMatch(/<w:docDefaults><w:rPrDefault\/><w:pPrDefault\/><\/w:docDefaults>/)
    })
})
