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
math mtable.tml-jot mtd { padding-top: 0.7ex; padding-bottom: 0.7ex; }`
