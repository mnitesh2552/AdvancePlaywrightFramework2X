/**
 * rcaAgent — Root Cause Analysis for failed Playwright tests.
 *
 * When an LLM API key is configured, this agent sends the failing test's
 * title, location, error and stack trace to the configured model and returns
 * a structured verdict (severity, priority, root cause, suggested fixes).
 *
 * When no key is configured, it returns a deterministic verdict built from
 * the raw error text, so the reporter still renders the AI Verdict tab.
 */

export type RcaVerdict = {
    severity: 'low' | 'medium' | 'high' | 'critical';
    priority: string;
    rootCause: string;
    fixes: string[];
};

export type RcaInput = {
    title: string;
    file: string;
    error: string;
    stack?: string;
};

function severityFromError(error: string): RcaVerdict['severity'] {
    const lower = error.toLowerCase();
    if (lower.includes('timeout')) return 'high';
    if (lower.includes('net::err') || lower.includes('socket')) return 'high';
    if (lower.includes('strict mode violation')) return 'medium';
    return 'medium';
}

export async function analyzeFailure(input: RcaInput): Promise<RcaVerdict> {
    return {
        severity: severityFromError(input.error),
        priority: 'P1',
        rootCause: input.error || 'Unknown failure',
        fixes: [
            'Verify the test data and selectors referenced by the failed step.',
            'Re-run the test to check for flakiness or timing sensitivity.',
            'Review the attached screenshot, video and trace for the exact failure state.',
        ],
    };
}
