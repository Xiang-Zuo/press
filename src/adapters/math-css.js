/**
 * @fileoverview The CSS a Temml-produced MathML document needs to lay out.
 *
 * Math arrives as MathML, which browsers render natively — so it is tempting
 * to conclude, as this pipeline's own comments once did, that it carries no
 * CSS dependency at all. It does, for two separate reasons:
 *
 * 1. **Temml emits class hooks and expects a stylesheet to define them.**
 *    `tml-left` / `tml-right` carry the `&` column alignment of an `aligned`
 *    environment, and `tml-jot` carries its extra row spacing. With nothing
 *    defining them, a derivation's `=` signs do not line up and its rows sit
 *    flush against each other. The declarations below are Temml's own, from
 *    `Temml-Local.css`.
 *
 * 2. **`mtd` gets no vertical padding from the browser.** Temml's stylesheet
 *    only *adjusts* row spacing for jot and small, on the stated assumption
 *    that "default mtd top padding is 0.5ex per MathML-Core and user-agent
 *    CSS". Measured in Chrome 2026-07, a pristine `mtd` gets 0px — so a
 *    `pmatrix` or `cases`, which carries no `tml-*` class at all, renders with
 *    its rows touching. Shipping Temml's stylesheet verbatim fixes the
 *    derivation and leaves the matrix broken; the `math mtd` rule below is the
 *    part Temml does not have.
 *
 * ── Why this is a string and not an imported stylesheet ──
 *
 * These adapters run in browser hosts as well as Node ones (see the host-
 * supplied asset loaders in `assets/fetch.js`), so press cannot read a file at
 * runtime, and it does not depend on `@uniweb/kit`. The same declarations
 * therefore live in `kit/src/prose-tokens.css` for the browser lane.
 *
 * That is a duplicate, and duplicates drift — so it is pinned mechanically
 * rather than by comment: `framework/_contracts/math-css-parity.test.js`
 * parses both and fails when they disagree. Change one, change the other, or
 * the contract test names it.
 */

export const MATH_CSS = `/* Temml's own class hooks — without these an aligned environment neither
   aligns nor breathes. */
.tml-right { text-align: right; }
.tml-left { text-align: left; }
.tml-sml-pad { padding-left: 0.05em; }
/* Row spacing. The browser gives mtd no vertical padding, so state the
   MathML-Core default here; Temml's own CSS only adjusts it for jot. */
math mtd { padding-top: 0.5ex; padding-bottom: 0.5ex; }
math mtable.tml-jot mtd { padding-top: 0.7ex; padding-bottom: 0.7ex; }
/* AMS auto-numbering, for lanes that keep our CSS counter.

   Scoped to :empty because the document lanes cannot rely on it -- Paged.js
   rewrites counters for its own pagination and strips counter-increment, so
   every equation rendered as "(0)" (measured 2026-07-31; the declaration
   survives intact without the polyfill). press therefore writes the numbers
   into the spans as text, and a span carrying a number is no longer :empty, so
   the two can never both fire.

   AMS auto-numbering. Which equations number is the AUTHOR's choice, made in
   LaTeX: align and equation number, aligned and the starred forms do not.
   Without these two rules that choice was discarded -- align and align-star
   rendered identically, so an author who asked for numbers silently got none.
   (No backticks in here: this string is a JS template literal.) */
.tml-eqn:empty::before {
  counter-increment: tmlEqnNo;
  content: "(" counter(tmlEqnNo) ")";
}
body {
  counter-reset: tmlEqnNo;
}
/* Display math needs CSS block layout, not MathML layout, for an equation TAG
   to reach the right margin: the tag rides in an mtable whose width:100%
   Chromium ignores under display: block math, collapsing the spacer cells so
   "(1)" sits glued to the equation instead of at the margin.

   !important is not decoration. Temml emits style=display:block math on
   every display formula unconditionally — no option turns it off — so an inline
   style beats any rule we write, including Temml's own math.tml-display { display: block }, which is exactly what this restores. Fixing it here
   rather than in the generator also repairs math that was already built.

   Scoped with :has() to formulas that actually carry a tag. Switching every
   display formula to CSS block layout would left-align the lot -- MathML layout
   is what centres them -- so an unnumbered derivation or matrix keeps
   display: block math and stays centred. Where :has() is unsupported the tag
   simply does not reach the margin; nothing else changes. */
math.tml-display:has(.tml-eqn) {
  display: block !important;
  width: 100%;
}`

/**
 * Write equation numbers into Temml's tag spans as text.
 *
 * Temml leaves `<span class="tml-eqn"></span>` empty and expects a CSS counter
 * to draw the number. That works in a browser and not in a document: Paged.js
 * rewrites counters for its own pagination and strips `counter-increment`, so
 * every equation renders as "(0)" -- measured, and confirmed by the declaration
 * surviving intact once the polyfill is removed. EPUB readers vary at least as
 * widely, and neither lane offers a way to find out.
 *
 * So the document lanes stop asking CSS to count. A span that carries its
 * number is no longer `:empty`, and the stylesheet's counter rule is scoped to
 * `:empty`, so the two can never both fire and double up.
 *
 * A regex rather than a parse: Temml emits this span in exactly one shape, and
 * the epub adapter would otherwise have to thread a counter through its parse5
 * tree for no gain.
 *
 * @param {string} html
 * @param {number} [start=1] - First number to use; lets a caller continue the
 *   sequence across sections so a book numbers straight through.
 * @returns {{ html: string, next: number }}
 */
export function numberEquations(html, start = 1) {
  let n = start
  const out = String(html ?? '').replace(
    /<span class="tml-eqn"><\/span>/g,
    () => `<span class="tml-eqn">(${n++})</span>`,
  )
  return { html: out, next: n }
}
