/**
 * Invoice fixture registry — one entry per visual-progression stage of
 * the press-professional-docx plan. Imported by both the per-stage
 * vitest tests (which assert verifyDocx invariants) and the
 * build-fixtures test (which writes each fixture's output to out/ for
 * visual review in Word).
 *
 * Add a new fixture by:
 *   1. Defining a render function in a stage-N-*.jsx file.
 *   2. Adding an entry below.
 *   3. Running `pnpm test:invoice` to compile it to out/.
 */
import React from 'react'
import { BaselineInvoice } from './stage-0-baseline.jsx'

export const FIXTURES = [
    {
        name: 'stage-0-baseline',
        description: 'Pre-professional invoice — flat headings, no table',
        render: () => <BaselineInvoice />,
        options: { title: 'Invoice INV-0001 (Stage 0 baseline)' },
    },
]
