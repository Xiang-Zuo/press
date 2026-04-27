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
 * @param {string} [props.color] - Hex color, no '#'. Forwarded as
 *   `data-color`; the docx adapter passes it through to TextRun's
 *   `color` option.
 * @param {number} [props.size] - Font size in half-points (so 28pt = 56).
 *   Use the convertPointsToHalfPoints helper to keep the doubling
 *   intent visible in foundation code.
 * @param {string} [props.font] - Font family name (e.g. 'Calibri').
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
    const dataProps = { 'data-type': 'text' }
    if (bold) dataProps['data-bold'] = 'true'
    if (italics) dataProps['data-italics'] = 'true'
    if (underline) dataProps['data-underline'] = 'true'
    if (color) dataProps['data-color'] = color
    if (size != null) dataProps['data-size'] = size
    if (font) dataProps['data-font'] = font
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
