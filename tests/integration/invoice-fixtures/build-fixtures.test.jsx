/**
 * Build invoice fixtures to disk for visual review in Word.
 *
 * Wired as `pnpm test:invoice` in the package.json — a thin vitest
 * invocation targeting only this file. Each fixture compiles, passes
 * verifyDocx, and writes a .docx to tests/integration/invoice-fixtures/out/.
 *
 * The file is shaped as a vitest test (rather than a plain Node script)
 * because the fixtures use JSX, and vitest is what gives us the React/JSX
 * transform without dragging in a separate build step.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, it } from 'vitest'
import { compileInvoice, verifyDocx } from './_harness.js'
import { FIXTURES } from './fixtures.jsx'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(HERE, 'out')

describe('invoice fixtures: visual-review build', () => {
    for (const fixture of FIXTURES) {
        it(`compiles ${fixture.name}`, async () => {
            await mkdir(OUT_DIR, { recursive: true })
            const { buffer } = await compileInvoice(
                fixture.render(),
                fixture.options,
            )
            await verifyDocx(buffer)
            const out = join(OUT_DIR, `${fixture.name}.docx`)
            await writeFile(out, buffer)
            // eslint-disable-next-line no-console
            console.log(`  → ${out}`)
        })
    }
})
