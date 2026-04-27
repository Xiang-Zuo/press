/**
 * Synthesize OOXML style definitions from a Press theme.
 *
 * Stage 6.0 of kb/framework/plans/press-professional-docx.md.
 *
 * The theme.typography registry is the foundation-facing API:
 *
 *   theme.typography.Title = {
 *     font: 'heading',         // theme key or literal family
 *     size: 56,                // half-points (28pt)
 *     bold: true,
 *     color: 'accent',         // theme key or hex
 *     paragraph: { spacing: { after: 240 } },
 *   }
 *
 * docx@9.x is opinionated about where named styles live. It ships
 * built-in styles for Title, Heading1-6, Hyperlink, Strong, and
 * ListParagraph; entries with those ids in the custom `paragraphStyles`
 * array are ignored in favor of the built-ins. The library exposes
 * `default.{title, heading1, …, hyperlink, strong, listParagraph}`
 * slots specifically for overriding the built-ins. We route role
 * specs to the right slot:
 *
 *   - 'Body' / 'Normal'             -> default.document       (doc-wide rPrDefault/pPrDefault)
 *   - 'Title'                       -> default.title
 *   - 'Heading1'..'Heading6'        -> default.heading1..6
 *   - 'Hyperlink'                   -> default.hyperlink
 *   - 'Strong'                      -> default.strong
 *   - 'ListParagraph'               -> default.listParagraph
 *   - everything else, kind=paragraph  -> custom paragraphStyles[]
 *   - everything else, kind=character  -> custom characterStyles[]
 *
 * Foundations may also pass `paragraphStyles` / `characterStyles`
 * directly through compile options; those merge on top of the
 * synthesized entries (caller wins on style id conflict).
 */

import { resolveThemeColor, resolveThemeFont, DEFAULT_THEME } from '../ThemeContext.js'

// Roles that map to docx's named built-in slots in `default.*`.
const BUILT_IN_DEFAULT_SLOTS = {
    Body: 'document',
    Normal: 'document',
    Title: 'title',
    Heading1: 'heading1',
    Heading2: 'heading2',
    Heading3: 'heading3',
    Heading4: 'heading4',
    Heading5: 'heading5',
    Heading6: 'heading6',
    Hyperlink: 'hyperlink',
    Strong: 'strong',
    ListParagraph: 'listParagraph',
}

/**
 * Resolve a single typography-role spec against the theme, producing
 * the `{ paragraph, run }` shape the docx library expects.
 */
function resolveRoleSpec(spec, theme) {
    const run = {}
    if (spec.bold) run.bold = true
    if (spec.italics) run.italics = true
    if (spec.smallCaps) run.smallCaps = true
    if (spec.allCaps) run.allCaps = true
    if (spec.strike) run.strike = true
    if (spec.size != null) run.size = spec.size
    const color = resolveThemeColor(spec.color, theme)
    if (color) run.color = color
    const font = resolveThemeFont(spec.font, theme)
    if (font) run.font = font
    if (spec.underline) {
        run.underline =
            typeof spec.underline === 'string'
                ? { type: spec.underline }
                : spec.underline
    }

    const out = {}
    if (Object.keys(run).length) out.run = run
    if (spec.paragraph) out.paragraph = spec.paragraph
    return out
}

/**
 * Build the `styles` block for `new Document({ styles: … })` from a
 * theme.typography registry.
 *
 * @param {Object} theme
 * @param {Object} [overrides]
 * @param {Array} [overrides.paragraphStyles] - merged on top, caller wins.
 * @param {Array} [overrides.characterStyles] - merged on top, caller wins.
 * @returns {{ default: Object, paragraphStyles: Array, characterStyles: Array }}
 */
export function buildStylePack(theme = DEFAULT_THEME, overrides = {}) {
    const typography = theme?.typography || DEFAULT_THEME.typography
    const kinds = theme?.typographyKinds || DEFAULT_THEME.typographyKinds

    const defaults = {}
    const paragraphStyles = []
    const characterStyles = []

    for (const [roleName, spec] of Object.entries(typography)) {
        const resolved = resolveRoleSpec(spec, theme)
        const slot = BUILT_IN_DEFAULT_SLOTS[roleName]

        if (slot === 'document') {
            // Doc-wide defaults — applies to every paragraph and run.
            // The OOXML <w:rPrDefault>/<w:pPrDefault>. This is what
            // pins the body font (no more Times New Roman fallback).
            defaults.document = {
                ...(resolved.run ? { run: resolved.run } : {}),
                ...(resolved.paragraph ? { paragraph: resolved.paragraph } : {}),
            }
            continue
        }

        if (slot) {
            // Override a built-in named style (Title, Heading1-6, etc.).
            defaults[slot] = resolved
            continue
        }

        // Custom role — falls into paragraphStyles or characterStyles.
        const kind = kinds[roleName] || 'character'
        if (kind === 'paragraph') {
            paragraphStyles.push({
                id: roleName,
                name: roleName,
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                ...resolved,
            })
        } else {
            characterStyles.push({
                id: roleName,
                name: roleName,
                basedOn: 'Normal',
                quickFormat: true,
                ...(resolved.run ? { run: resolved.run } : {}),
            })
        }
    }

    // Caller-supplied paragraph/character styles take effect in two
    // ways. Entries with built-in style IDs (Title, Heading1-6,
    // Hyperlink, Strong) route to `default.{slot}` since docx ignores
    // those IDs in the custom `paragraphStyles` / `characterStyles`
    // arrays. Everything else appends/overrides in the array.
    const callerParagraphs = overrides.paragraphStyles || []
    const callerCharacters = overrides.characterStyles || []

    for (const style of [...callerParagraphs, ...callerCharacters]) {
        const slot = BUILT_IN_DEFAULT_SLOTS[style.id]
        if (!slot) continue
        const { id: _id, name: _name, basedOn: _b, next: _n, quickFormat: _q, run, paragraph } =
            style
        defaults[slot] = {
            ...(run ? { run } : {}),
            ...(paragraph ? { paragraph } : {}),
        }
    }

    const filteredCallerParagraphs = callerParagraphs.filter(
        (s) => !BUILT_IN_DEFAULT_SLOTS[s.id],
    )
    const filteredCallerCharacters = callerCharacters.filter(
        (s) => !BUILT_IN_DEFAULT_SLOTS[s.id],
    )

    return {
        default: defaults,
        paragraphStyles: mergeById(paragraphStyles, filteredCallerParagraphs),
        characterStyles: mergeById(characterStyles, filteredCallerCharacters),
    }
}

function mergeById(synthesized, caller) {
    if (!Array.isArray(caller) || caller.length === 0) return synthesized
    const callerById = new Map(caller.map((s) => [s.id, s]))
    const out = synthesized.map((s) =>
        callerById.has(s.id) ? callerById.get(s.id) : s,
    )
    const synthIds = new Set(synthesized.map((s) => s.id))
    for (const s of caller) {
        if (!synthIds.has(s.id)) out.push(s)
    }
    return out
}
