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
import { Stage1Invoice } from './stage-1-tables.jsx'
import { Stage2Invoice } from './stage-2-spans.jsx'
import { Stage4Body, stage4Options } from './stage-4-chrome.jsx'
import { Stage5Body, stage5Options } from './stage-5-themed.jsx'

export const FIXTURES = [
    {
        name: 'stage-0-baseline',
        description: 'Pre-professional invoice — flat headings, no table',
        render: () => <BaselineInvoice />,
        options: { title: 'Invoice INV-0001 (Stage 0 baseline)' },
    },
    {
        name: 'stage-1-tables',
        description:
            'Real line-items table with shaded header, soft grid, fixed columns',
        render: () => <Stage1Invoice />,
        options: { title: 'Invoice INV-0001 (Stage 1 — table foundations)' },
    },
    {
        name: 'stage-2-spans',
        description: 'Adds colSpan to the totals block for cleaner alignment',
        render: () => <Stage2Invoice />,
        options: { title: 'Invoice INV-0001 (Stage 2 — colSpan / rowSpan)' },
    },
    {
        name: 'stage-4-chrome',
        description:
            'Adds page header (brand wordmark), tabbed footer with Page X of Y, A4 setup',
        render: () => <Stage4Body />,
        options: stage4Options(),
    },
    {
        name: 'stage-5-themed',
        description:
            'Same look as Stage 4 but every brand color flows through the theme channel',
        render: () => <Stage5Body />,
        options: stage5Options(),
    },
]
