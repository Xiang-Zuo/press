import {
    useDocumentTheme,
    resolveThemeColor,
    resolveThemeFont,
} from '../ThemeContext.js'

/**
 * Inline text span. Renders <span data-type="text"> with optional
 * bold/italic/underline + color/size/font via data attributes.
 *
 * Maps to the `text` IR node type → docx TextRun.
 *
 * @param {Object} props
 * @param {boolean} [props.bold]
 * @param {boolean} [props.italics]
 * @param {boolean} [props.underline]
 * @param {string} [props.color] - Hex color (with or without '#') or a
 *   theme key ('accent', 'body', 'muted', 'softBorder'). Theme keys
 *   resolve via the active <DocumentProvider theme={…}>; literals
 *   pass through after stripping any leading '#'.
 * @param {number} [props.size] - Font size in half-points (so 28pt = 56).
 *   Use the convertPointsToHalfPoints helper to keep the doubling
 *   intent visible in foundation code.
 * @param {string} [props.font] - Font family name (e.g. 'Calibri') or a
 *   theme key ('body', 'heading', 'mono').
 * @param {string} [props.style] - Named character/paragraph style.
 */
export default function TextRun({
    children,
    bold,
    italics,
    underline,
    color,
    size,
    font,
    smallCaps,
    allCaps,
    strike,
    style,
    ...props
}) {
    const theme = useDocumentTheme()
    const resolvedColor = resolveThemeColor(color, theme)
    const resolvedFont = resolveThemeFont(font, theme)
    const dataProps = { 'data-type': 'text' }
    if (bold) dataProps['data-bold'] = 'true'
    if (italics) dataProps['data-italics'] = 'true'
    if (underline) dataProps['data-underline'] = 'true'
    if (resolvedColor) dataProps['data-color'] = resolvedColor
    if (size != null) dataProps['data-size'] = size
    if (resolvedFont) dataProps['data-font'] = resolvedFont
    if (smallCaps) dataProps['data-smallcaps'] = 'true'
    if (allCaps) dataProps['data-allcaps'] = 'true'
    if (strike) dataProps['data-strike'] = 'true'
    if (style) dataProps['data-style'] = style

    return (
        <span {...dataProps} {...props}>
            {children}
        </span>
    )
}
