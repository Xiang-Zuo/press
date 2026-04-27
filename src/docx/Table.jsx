/**
 * Table, Tr, Td — ergonomic wrappers for Press's table vocabulary.
 *
 * Common case (percent column widths, soft borders):
 *
 *   <Table widths={[15, 60, 25]}>
 *     <Tr header>
 *       <Td>Period</Td>
 *       <Td>Project and source</Td>
 *       <Td>Amount</Td>
 *     </Tr>
 *     <Tr>
 *       <Td>1831–1836</Td>
 *       <Td>Voyage of the Beagle</Td>
 *       <Td>£450</Td>
 *     </Tr>
 *   </Table>
 *
 * Stage 1 of press-professional-docx adds:
 *
 *   - <Table columnWidths={[cm(15), cm(4), cm(1.5), cm(4)]} layout="fixed">
 *     fixed-width columns specified in twips (use the unit helpers).
 *   - <Table width={{ size: 100, type: 'pct' }}>
 *     whole-table width.
 *   - <Table borders={{ top: { style: 'single', size: 4, color: 'cccccc' }, … }}>
 *     table-default borders. Per-cell borders still win.
 *   - <Td shading="4775b2"> or <Td shading={{ fill: '4775b2', type: 'clear' }}>
 *     cell background color.
 *   - <Td valign="center"> top | center | bottom.
 *   - <Tr header> now also marks the row as a docx tableHeader, so it
 *     repeats at the top of each new page when the table breaks.
 *
 * Every data-* attribute set by default can be overridden by passing the
 * same attribute on the Td — explicit spreads win. String children are
 * wrapped in a Press <Paragraph> automatically; complex cells (multiple
 * paragraphs, inline <TextRun bold>) can pass React children.
 *
 * The emitted HTML is plain <div>s laid out with flexbox in the browser,
 * matching Press's existing table-as-flexbox convention — the docx
 * adapter walks the same data attributes regardless of element type.
 */
import {
    createContext,
    useContext,
    Children,
    cloneElement,
    isValidElement,
} from 'react'
import Paragraph from './Paragraph.jsx'
import TextRun from './TextRun.jsx'

const TableCtx = createContext({ widths: null, borderColor: 'cccccc' })

/**
 * Table — the outer wrapper.
 *
 * @param {Object} props
 * @param {number[]} [props.widths] - Column widths in percent. Each Td reads
 *   its width by column index. Cell-level widths are emitted via
 *   `data-width-size`/`data-width-type=pct`.
 * @param {number[]} [props.columnWidths] - Column widths in twips. Sets
 *   docx `columnWidths` for layout-aware sizing. Use the unit helpers
 *   (cm, mm, inch, pt) to express them naturally. When set, `layout`
 *   defaults to 'fixed' so Word doesn't redistribute columns.
 * @param {'fixed'|'autofit'} [props.layout] - Table layout type. 'fixed'
 *   honors columnWidths exactly; 'autofit' lets Word redistribute to
 *   fit content. Defaults to 'fixed' when columnWidths is provided.
 * @param {{size: number, type?: string}} [props.width] - Whole-table width.
 *   { size, type } where type is 'pct' (percent), 'dxa' (twips), or 'auto'.
 * @param {Object} [props.borders] - Table-default borders. Same shape as
 *   per-cell borders: { top, bottom, left, right, insideHorizontal,
 *   insideVertical } each with { style, size, color }.
 * @param {string} [props.borderColor='cccccc'] - Hex (no #) for cell-level
 *   default borders. Used by Td when no per-cell borders are set.
 */
export function Table({
    widths,
    columnWidths,
    layout,
    width,
    borders,
    borderColor = 'cccccc',
    className,
    children,
    ...props
}) {
    const tableAttrs = {}

    if (columnWidths && columnWidths.length) {
        tableAttrs['data-table-column-widths'] = columnWidths.join(',')
        // Default to fixed when the foundation gave us widths — Word
        // otherwise redistributes them. Honor an explicit `layout` prop.
        tableAttrs['data-table-layout'] = layout || 'fixed'
    } else if (layout) {
        tableAttrs['data-table-layout'] = layout
    }

    if (width) {
        if (width.size != null) tableAttrs['data-table-width-size'] = width.size
        tableAttrs['data-table-width-type'] = width.type ?? 'pct'
    }

    if (borders) {
        for (const [side, sideProps] of Object.entries(borders)) {
            if (!sideProps) continue
            // The IR map uses `insideh`/`insidev` (single token) to keep
            // attribute names parser-friendly. Translate from camelCase.
            const sideKey =
                side === 'insideHorizontal'
                    ? 'insideh'
                    : side === 'insideVertical'
                      ? 'insidev'
                      : side
            if (sideProps.style)
                tableAttrs[`data-table-borders-${sideKey}-style`] = sideProps.style
            if (sideProps.size != null)
                tableAttrs[`data-table-borders-${sideKey}-size`] = sideProps.size
            if (sideProps.color)
                tableAttrs[`data-table-borders-${sideKey}-color`] = sideProps.color
        }
    }

    return (
        <TableCtx.Provider value={{ widths, borderColor }}>
            <div data-type="table" className={className} {...tableAttrs} {...props}>
                {children}
            </div>
        </TableCtx.Provider>
    )
}

/**
 * Tr — a table row.
 *
 * Clones direct child <Td> elements to inject the column index so each
 * cell can look up its width from the Table context, and to mark cells
 * in a `header` row for the default emphasis + heavier bottom border.
 *
 * Column-index assignment is span-aware: a <Td colSpan={3}> takes
 * three column slots, so the next cell is at index 3, not 1. Without
 * this, a row with a colSpan'd cell followed by a per-column-width
 * cell would pull the wrong width from `widths={…}`.
 *
 * @param {Object} props
 * @param {boolean} [props.header=false] - Bolds text, thickens the bottom
 *   border, and marks the row as a docx tableHeader (it repeats at the
 *   top of each new page when the table breaks across pages).
 */
export function Tr({ header = false, className, children, ...props }) {
    let nextCol = 0
    const cells = Children.toArray(children).map((child) => {
        if (!isValidElement(child)) return child
        const col = child.props._col ?? nextCol
        const span =
            typeof child.props.colSpan === 'number' && child.props.colSpan > 1
                ? child.props.colSpan
                : 1
        nextCol = col + span
        return cloneElement(child, {
            _col: col,
            _header: child.props._header ?? header,
        })
    })
    const rowAttrs = header ? { 'data-row-header': '' } : {}
    return (
        <div data-type="tableRow" className={className} {...rowAttrs} {...props}>
            {cells}
        </div>
    )
}

// Default cell padding (twips). ~4pt top/bottom, ~6pt left/right.
const CELL_PAD = { top: 80, bottom: 80, left: 120, right: 120 }

/**
 * Td — a table cell.
 *
 * Width resolution order: explicit `width` prop > `widths[_col]` from the
 * parent <Table> > unset (cell occupies natural width).
 *
 * String children are wrapped in a <Paragraph>. Headers get a bold
 * TextRun and a heavier bottom border by default. Any data-* attribute
 * passed in props wins over the defaults.
 *
 * @param {Object} props
 * @param {number} [props.width] - Column width in percent (overrides Table.widths).
 * @param {boolean} [props.emphasis=false] - Force bold regardless of header state.
 * @param {'single'|'double'|'none'|string} [props.borderBottom] - Bottom border style.
 * @param {string|{fill: string, type?: string, color?: string}} [props.shading] -
 *   Cell background fill. String shorthand is the hex color (no '#'),
 *   defaulting to a solid fill. Object form lets you set the OOXML
 *   shading type ('clear' default = plain fill, 'pct25' / 'horzStripe' / …
 *   for patterns).
 * @param {'top'|'center'|'bottom'} [props.valign] - Vertical alignment of cell content.
 */
export function Td({
    _col = 0,
    _header = false,
    width,
    emphasis = false,
    borderBottom,
    shading,
    valign,
    colSpan,
    rowSpan,
    className,
    style,
    children,
    ...rest
}) {
    const { widths, borderColor } = useContext(TableCtx)
    const colWidth = width ?? widths?.[_col]

    const defaults = {
        'data-type': 'tableCell',
        'data-margins-top': CELL_PAD.top,
        'data-margins-bottom': CELL_PAD.bottom,
        'data-margins-left': CELL_PAD.left,
        'data-margins-right': CELL_PAD.right,
        'data-borders-top-style': 'none',
        'data-borders-left-style': 'none',
        'data-borders-right-style': 'none',
        'data-borders-bottom-style': borderBottom ?? 'single',
        'data-borders-bottom-size': _header ? 6 : 4,
        'data-borders-bottom-color': borderColor,
    }
    if (colWidth != null) {
        defaults['data-width-size'] = colWidth
        defaults['data-width-type'] = 'pct'
    }
    if (shading) {
        const s =
            typeof shading === 'string' ? { fill: shading } : shading
        if (s.fill) defaults['data-shading-fill'] = s.fill
        if (s.type) defaults['data-shading-type'] = s.type
        if (s.color) defaults['data-shading-color'] = s.color
    }
    if (valign) {
        defaults['data-valign'] = valign
    }
    if (typeof colSpan === 'number' && colSpan > 1) {
        defaults['data-grid-span'] = colSpan
    }
    if (typeof rowSpan === 'number' && rowSpan > 1) {
        defaults['data-row-span'] = rowSpan
    }

    const flexStyle =
        colWidth != null
            ? { flex: `${colWidth} ${colWidth} 0%`, minWidth: 0, ...style }
            : style

    const isPrimitive = typeof children === 'string' || typeof children === 'number'
    const content = isPrimitive ? (
        <Paragraph>
            {emphasis || _header ? <TextRun bold>{children}</TextRun> : children}
        </Paragraph>
    ) : (
        children
    )

    return (
        <div className={className} style={flexStyle} {...defaults} {...rest}>
            {content}
        </div>
    )
}
