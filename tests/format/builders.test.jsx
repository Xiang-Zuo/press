/**
 * Stage 6.1 — DateText / DateRangeText / Currency builders.
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DocumentProvider } from '../../src/index.js'
import {
    DateText,
    DateRangeText,
    Currency,
    formatters,
} from '../../src/format/index.jsx'

const THEME = {
    colors: {},
    fonts: {},
    locale: 'en-CA',
    currency: 'CAD',
}

function render(jsx, theme = THEME) {
    return renderToStaticMarkup(
        <DocumentProvider theme={theme}>{jsx}</DocumentProvider>,
    )
}

describe('Stage 6.1: <DateText>', () => {
    it('renders an ISO date in medium format by default', () => {
        const html = render(<DateText value="2026-03-31" />)
        // Intl.DateTimeFormat output for en-CA medium varies slightly
        // by Node version; just assert the year + day are present and
        // it isn't the JS Date.toString() leak.
        expect(html).toContain('2026')
        expect(html).toContain('31')
        expect(html).not.toContain('GMT')
    })

    it('renders ISO when format="iso" using UTC components', () => {
        const html = render(<DateText value="2026-03-31" format="iso" />)
        expect(html).toContain('2026-03-31')
    })

    it('renders nothing for invalid input', () => {
        const html = render(<DateText value="not-a-date" />)
        expect(html).toContain('<span data-type="text"></span>')
    })

    it('honors an explicit locale prop', () => {
        const html = render(<DateText value="2026-03-31" locale="de-DE" />)
        // de-DE uses dotted day-month-year; 31. März or 31. Mär.
        expect(html).toMatch(/31/)
        expect(html).toMatch(/2026/)
        expect(html).toMatch(/Mär|März/)
    })
})

describe('Stage 6.1: <DateRangeText>', () => {
    it('joins from + to with an en dash', () => {
        const html = render(
            <DateRangeText from="2026-01-01" to="2026-12-31" format="iso" />,
        )
        expect(html).toContain('2026-01-01 – 2026-12-31')
    })

    it('renders only one bound when the other is missing', () => {
        const html = render(<DateRangeText from="2026-01-01" format="iso" />)
        expect(html).toContain('2026-01-01')
        expect(html).not.toContain('–')
    })

    it('accepts a `period` object (matches business-docs shape)', () => {
        const html = render(
            <DateRangeText
                period={{ from: '2026-01-01', to: '2026-12-31' }}
                format="iso"
            />,
        )
        expect(html).toContain('2026-01-01 – 2026-12-31')
    })
})

describe('Stage 6.1: <Currency>', () => {
    it('renders a value using theme.currency by default', () => {
        const html = render(<Currency value={32000} />, {
            ...THEME,
            currency: 'CAD',
        })
        // en-CA + CAD: $32,000.00 (with non-breaking space variants
        // in some locales). Just check the canonical digits are there.
        expect(html).toMatch(/32,000\.00/)
    })

    it('honors an explicit code prop', () => {
        const html = render(<Currency value={100} code="EUR" locale="de-DE" />)
        // de-DE emits "100,00 €" or "100,00 €".
        expect(html).toMatch(/100,00/)
        expect(html).toMatch(/€/)
    })

    it('renders nothing for non-numeric input', () => {
        const html = render(<Currency value="not-a-number" />)
        expect(html).toContain('<span data-type="text"></span>')
    })
})

describe('Stage 6.1: imperative formatters', () => {
    it('exposes date / dateRange / currency for non-JSX callers', () => {
        expect(formatters.date('2026-03-31', { format: 'iso' })).toBe('2026-03-31')
        expect(
            formatters.dateRange('2026-01-01', '2026-12-31', { format: 'iso' }),
        ).toBe('2026-01-01 – 2026-12-31')
        expect(formatters.currency(50, { code: 'USD', locale: 'en-US' })).toMatch(
            /\$50\.00/,
        )
    })
})
