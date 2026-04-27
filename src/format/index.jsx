/**
 * @uniweb/press/format — locale-aware text formatters.
 *
 * Stage 6.1 of kb/framework/plans/press-professional-docx.md.
 *
 * The same JSX feeds the React preview and the docx fragment, so
 * these are React components that emit <span data-type="text"> and
 * route through the standard IR walker. Each takes a `value` prop
 * (or `from`/`to` for ranges) plus optional locale + format props,
 * and produces a single text node with the formatted string. They
 * are theme-aware: an active <DocumentProvider> supplies the
 * default locale and (for currency) the default ISO code, so
 * foundations don't have to repeat them at every call site.
 *
 * The motivation: foundations had been writing `String(invoice.due)`
 * which yields `"Sat Feb 28 2026 19:00:00 GMT-0500 …"` whenever
 * YAML eagerly turns an ISO string into a JS Date. The IR layer
 * also has a defensive Date->ISO coercion (src/adapters/docx.js),
 * but the right way to render dates is to choose a format
 * explicitly via these builders.
 */
import { useDocumentTheme } from '../ThemeContext.js'

/**
 * Coerce a value to a JS Date for formatting. Accepts:
 *   - Date instance (used as-is)
 *   - ISO string ('2026-03-31')
 *   - epoch number
 * Returns null on invalid input so the builder renders nothing.
 */
function toDate(value) {
    if (value == null || value === '') return null
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value
    }
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Map our small set of format names onto Intl.DateTimeFormat option
 * bags. 'iso' is special-cased — it returns the YYYY-MM-DD form
 * exactly, using UTC components (not local) so a date like
 * `2026-03-31` doesn't shift across timezones.
 */
const DATE_FORMATS = {
    iso: null, // sentinel — handled before Intl
    short: { year: 'numeric', month: 'numeric', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    },
}

function formatIso(d) {
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function formatDate(value, { locale = 'en-CA', format = 'medium' } = {}) {
    const d = toDate(value)
    if (!d) return ''
    if (format === 'iso') return formatIso(d)
    const opts = DATE_FORMATS[format] || DATE_FORMATS.medium
    try {
        // Force UTC so date-only ISO inputs ('2026-03-31') don't drift
        // by the local timezone — without this, en-CA in EST renders
        // 'Mar 30, 2026' instead of 'Mar 31, 2026'.
        return new Intl.DateTimeFormat(locale, { ...opts, timeZone: 'UTC' }).format(d)
    } catch {
        // Bad locale — fall back to ISO.
        return formatIso(d)
    }
}

function formatDateRange(from, to, opts) {
    const f = formatDate(from, opts)
    const t = formatDate(to, opts)
    if (f && t) return `${f} – ${t}`
    return f || t || ''
}

function formatCurrency(value, { locale = 'en-CA', code = 'CAD' } = {}) {
    if (value == null || value === '') return ''
    const n = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(n)) return ''
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: code,
            maximumFractionDigits: 2,
        }).format(n)
    } catch {
        // Unknown currency code — fall back to plain number with the code.
        return `${n.toFixed(2)} ${code}`
    }
}

/**
 * Inline date — emits a single text node with a formatted date.
 *
 * @param {Object} props
 * @param {Date|string|number} props.value
 * @param {'iso'|'short'|'medium'|'long'|'full'} [props.format='medium']
 * @param {string} [props.locale] - BCP-47. Defaults to theme.locale.
 */
export function DateText({ value, format = 'medium', locale }) {
    const theme = useDocumentTheme()
    const text = formatDate(value, {
        locale: locale ?? theme.locale,
        format,
    })
    return <span data-type="text">{text}</span>
}

/**
 * Inline date range — emits a single text node with two formatted
 * dates joined by an en dash. When one bound is missing, only the
 * other one renders.
 */
export function DateRangeText({
    from,
    to,
    period,
    format = 'medium',
    locale,
}) {
    const theme = useDocumentTheme()
    const f = period?.from ?? from
    const t = period?.to ?? to
    const text = formatDateRange(f, t, {
        locale: locale ?? theme.locale,
        format,
    })
    return <span data-type="text">{text}</span>
}

/**
 * Inline currency — emits a single text node with a locale- and
 * code-aware money amount.
 *
 * @param {Object} props
 * @param {number|string} props.value
 * @param {string} [props.code] - ISO 4217. Defaults to theme.currency.
 * @param {string} [props.locale]
 */
export function Currency({ value, code, locale }) {
    const theme = useDocumentTheme()
    const text = formatCurrency(value, {
        locale: locale ?? theme.locale,
        code: code ?? theme.currency,
    })
    return <span data-type="text">{text}</span>
}

/**
 * Imperative versions for callers that need a string outside JSX
 * (cell content building, header data, etc.). These don't touch the
 * theme — pass locale/code explicitly.
 */
export const formatters = {
    date: formatDate,
    dateRange: formatDateRange,
    currency: formatCurrency,
}
