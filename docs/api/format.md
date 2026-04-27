# `@uniweb/press/format` — locale-aware formatters

Builders for dates, date ranges, and currency. Each renders a single text node with a formatted string. Locale and currency code default to the active theme; per-call props override.

The same JSX is used in both the React preview and the docx fragment — these aren't docx-specific. They emit `<span data-type="text">` which the IR walker turns into a `text` node.

```js
import {
    DateText,
    DateRangeText,
    Currency,
    formatters,
} from '@uniweb/press/format'
```

## `<DateText>`

Format a single date.

```jsx
<DateText value="2024-12-31" />
<DateText value={record.appointed_on} format="long" locale="fr-CA" />
<DateText value={new Date()} format="iso" />
```

### Props

- **`value`** — `Date | string | number`. Accepts a `Date` instance, an ISO string (`'2024-12-31'`), or an epoch milliseconds number. Invalid input renders empty (no error).
- **`format`** — `'iso' | 'short' | 'medium' | 'long' | 'full'`. Default `'medium'`.
  - `'iso'` — `'2024-12-31'` (always UTC; no locale variation).
  - `'short'` — `'12/31/2024'` (en-US) / `'2024-12-31'` (en-CA, fr-CA) / `'31.12.2024'` (de-DE).
  - `'medium'` — `'Dec 31, 2024'` (en-US) / `'31 déc. 2024'` (fr-CA).
  - `'long'` — `'December 31, 2024'` (en-US) / `'31 décembre 2024'` (fr-CA).
  - `'full'` — `'Tuesday, December 31, 2024'` (en-US).
- **`locale`** — BCP-47. Defaults to `theme.locale` (theme default `'en-CA'`).

### Timezone

Date formatting forces `timeZone: 'UTC'`. This is intentional — date-only inputs (`'2024-12-31'`) shouldn't drift to "Dec 30" when the host runs in EST. If you have a true datetime with timezone semantics (a meeting time), pass a `Date` already adjusted to the right zone.

## `<DateRangeText>`

Two dates joined by an en dash.

```jsx
<DateRangeText from="2024-01-01" to="2024-12-31" format="medium" />
// "Jan 1, 2024 – Dec 31, 2024"

<DateRangeText period={{ from, to }} format="long" />
// Convenience for the { from, to } object shape.

<DateRangeText from={appointment.starts_at} format="medium" />
// "Jan 1, 2024" — only the from bound, no dash.
```

### Props

- **`from`** / **`to`** — same shape as `<DateText value>`.
- **`period`** — `{ from, to }` shorthand (mutually exclusive with `from` / `to`; useful when reading a record's period field directly).
- **`format`** / **`locale`** — same as `<DateText>`.

When one bound is missing, only the other renders (no dash).

## `<Currency>`

Format a money amount.

```jsx
<Currency value={1234.56} />
// theme.locale='en-CA', theme.currency='CAD' -> "$1,234.56"

<Currency value={1234.56} code="EUR" locale="de-DE" />
// "1.234,56 €"

<Currency value="42" code="USD" />
// String input is coerced to number — "$42.00"
```

### Props

- **`value`** — `number | string`. Strings are coerced (`Number(value)`); non-numeric input renders empty.
- **`code`** — ISO 4217 code (`'USD'`, `'EUR'`, `'CAD'`, `'JPY'`). Defaults to `theme.currency`.
- **`locale`** — BCP-47. Defaults to `theme.locale`.

The formatter is `Intl.NumberFormat` with `style: 'currency'` and `maximumFractionDigits: 2`. JPY-style zero-decimal currencies render with no decimals; CHF-style three-decimal currencies do too.

## `formatters` — imperative API

Sometimes you need a string outside JSX (a filename, a cell label derived from a date). Use the imperative formatters:

```js
import { formatters } from '@uniweb/press/format'

formatters.date('2024-12-31', { format: 'iso' })           // "2024-12-31"
formatters.date(new Date(), { format: 'medium', locale: 'fr-CA' })

formatters.dateRange('2024-01-01', '2024-12-31', { format: 'medium' })
// "Jan 1, 2024 – Dec 31, 2024"

formatters.currency(1234.56, { code: 'CAD', locale: 'en-CA' })
// "$1,234.56"
```

These don't read the theme — pass locale and code explicitly. They're the right tool for compile-time string assembly (filenames, downloaded-file naming, cell text built before render).

## Theme defaults

The active theme carries `locale` and `currency` defaults:

```js
{
    colors: { /* … */ },
    fonts: { /* … */ },
    locale: 'en-CA',
    currency: 'CAD',
    typography: { /* … */ },
}
```

Foundations override per-institution by setting these in the theme they pass to `<DocumentProvider>` (or return from `getOptions`):

```js
const FRENCH_QUEBEC_THEME = {
    /* … */
    locale: 'fr-CA',
    currency: 'CAD',
}
```

A foundation that serves both en-CA and fr-CA institutions can compute the locale per-document from a `language` field in the document config:

```js
function resolveTheme(cfg) {
    const language = cfg?.language || 'en'
    const country = cfg?.country || 'CA'
    return {
        ...DEFAULT_THEME,
        locale: `${language}-${country}`,
        currency: cfg?.currency || (country === 'US' ? 'USD' : 'CAD'),
    }
}
```

## The Date safety net

`<TextRun>{date}</TextRun>` — accidentally passing a `Date` object as a child — coerces to ISO `YYYY-MM-DD` instead of letting React stringify the Date with its `toString()` (which produces `'Sat Feb 28 2024 19:00:00 GMT-0500 (Eastern Standard Time)'`). This is a floor, not a feature: the right thing is to wrap dates in `<DateText>` with an explicit format.

The safety net specifically avoids:

1. The GMT timezone leak in the docx output.
2. The React-19 runtime error `Objects are not valid as a React child (found: Invalid Date)` for invalid `Date` instances.

It applies one level deep — direct children of `<TextRun>`. A `Date` nested inside a custom component is the component's responsibility.

## See also

- [docx cookbook](../guides/docx-foundation-cookbook.md) — complete worked examples.
- [Loom expressions](https://github.com/uniweb/loom) — for prose templating, an alternative to the JSX builders. Use Loom when authors write `{due AS long date}` in markdown; use the format builders when you're constructing JSX in a section component.
