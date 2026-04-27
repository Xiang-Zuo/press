/**
 * Stage 6.4 — <BrandLogo> builder.
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { BrandLogo, cm } from '../../src/docx/index.js'

describe('Stage 6.4: <BrandLogo>', () => {
    it('renders a bare img with alignment attribute when url is provided', () => {
        const html = renderToStaticMarkup(
            <BrandLogo url="https://example.com/logo.png" width={cm(5)} />,
        )
        // Bare <img> at section level; the docx adapter wraps it in a
        // paragraph with the right alignment.
        expect(html).toContain('<img data-type="image"')
        expect(html).toContain('data-alignment="right"')
        expect(html).toContain('logo.png')
        expect(html).toMatch(/data-transformation-width="\d+"/)
        expect(html).toMatch(/data-transformation-height="\d+"/)
        // No outer paragraph wrapper — that would push the image into
        // inline context where the adapter drops it.
        expect(html).not.toContain('<p ')
    })

    it('renders nothing when url is empty', () => {
        const html = renderToStaticMarkup(<BrandLogo url="" />)
        expect(html).toBe('')
    })

    it('honors an explicit align prop', () => {
        const html = renderToStaticMarkup(
            <BrandLogo url="logo.png" align="center" />,
        )
        expect(html).toContain('data-alignment="center"')
    })
})
