/**
 * BrandLogo — a brand image suitable for page headers, cover blocks,
 * and watermarks.
 *
 * Stage 6.4 of kb/framework/plans/press-professional-docx.md.
 *
 * Emits a bare `<img data-type="image">` (no Paragraph wrapper) so
 * the IR walker keeps the image at section level — Press's docx
 * adapter creates the carrier paragraph itself, and inline-context
 * images are silently dropped (Image.jsx's documented contract).
 *
 * Alignment flows through the IR's `data-alignment` channel: the
 * adapter applies it to the carrier paragraph before emitting the
 * ImageRun. Foundations get a right-aligned wordmark with one prop:
 *
 *   <BrandLogo url={vendor.logo} width={cm(4)} align="right" />
 *
 * The legacy PHP-rendered Proximify invoice used a 5cm logo right-
 * anchored in the page header. The default values match that visual.
 */
import Image from './Image.jsx'

const DEFAULT_WIDTH = 180 // ~5 cm at the docx default DPI
const DEFAULT_HEIGHT_RATIO = 0.32 // typical horizontal-wordmark aspect

/**
 * @param {Object} props
 * @param {string} [props.url] - Image source. Resolved against
 *   DocumentProvider's basePath if site-absolute. When absent, the
 *   builder renders nothing.
 * @param {string} [props.alt] - Accessibility text. Defaults to ''
 *   (decorative).
 * @param {number} [props.width=180] - Width in docx transformation
 *   units. Use cm()/inch()/pt() for natural values.
 * @param {number} [props.height] - Height. When omitted, defaults to
 *   width * 0.32 (typical horizontal-wordmark aspect).
 * @param {'left'|'center'|'right'} [props.align='right'] - Alignment of
 *   the carrier paragraph the docx adapter wraps the ImageRun in.
 */
export default function BrandLogo({
    url,
    alt = '',
    width = DEFAULT_WIDTH,
    height,
    align = 'right',
    ...rest
}) {
    if (!url) return null
    const h = height ?? Math.round(width * DEFAULT_HEIGHT_RATIO)
    return (
        <Image
            data={{ url, alt }}
            width={width}
            height={h}
            data-alignment={align}
            {...rest}
        />
    )
}
