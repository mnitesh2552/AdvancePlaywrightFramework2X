/**
 * reportConfig — single source of truth for what gets captured/attached on a run.
 *
 * Controlled by a single env flag, ATTACH_SCREENSHOTS:
 *   - "true"  -> screenshots (test + per-step), videos, and traces are captured
 *                and copied into the TTA report.
 *   - anything else (unset, "false") -> nothing is captured/attached; the
 *                Playwright runner and the TTA reporter both skip all of it,
 *                so runs are faster and the report stays lean.
 *
 * Visual steps (visualStep.ts) and the custom reporter (CustomReporter.ts) both
 * read this same flag so they can never disagree.
 */

// Load .env ourselves so the flag is available no matter who imports us first
// (playwright.config.ts loads this module before its own dotenv.config() runs).
import dotenv from 'dotenv';

dotenv.config();

const flag = process.env.ATTACH_SCREENSHOTS?.toLowerCase();

export const ATTACH_SCREENSHOTS = flag === 'true' || flag === '1';

/** When attachments are off, also disable the Playwright-level capture. */
export const captureScreenshot = ATTACH_SCREENSHOTS ? 'only-on-failure' : 'off';
export const captureVideo = ATTACH_SCREENSHOTS ? 'on' : 'off';
export const captureTrace = ATTACH_SCREENSHOTS ? 'on' : 'off';
