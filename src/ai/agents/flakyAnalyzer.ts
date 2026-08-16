/**
 * flakyAnalyzer — compares the current build against the previous build to
 * flag tests whose status changed (flaky) or which are consistently failing.
 *
 * The reporter persists a JSON snapshot per build and feeds both into this
 * module. The LLM summary is optional and only produced when an API key is
 * configured.
 */

export type BuildSummary = {
    runId: string;
    tests: Record<string, string>;
};

export type FlakyResult = {
    counts: { flaky: number; failing: number; total: number };
    flaky: string[];
    failing: string[];
    summary?: string;
};

function categorize(prev: BuildSummary, curr: BuildSummary): {
    flaky: string[];
    failing: string[];
} {
    const flaky: string[] = [];
    const failing: string[] = [];

    for (const [title, status] of Object.entries(curr.tests)) {
        if (status === 'passed' || status === 'skipped') continue;
        const prevStatus = prev.tests[title];
        // Newly failing this build, or failed in both builds -> "failing".
        if (prevStatus === undefined || prevStatus === 'failed' || prevStatus === 'timedOut') {
            failing.push(title);
        } else if (prevStatus === 'passed') {
            flaky.push(title);
        }
    }

    return { flaky, failing };
}

export async function analyzeFlaky(
    prev: BuildSummary,
    curr: BuildSummary,
    useLlm: boolean,
): Promise<FlakyResult> {
    const { flaky, failing } = categorize(prev, curr);
    const counts = {
        flaky: flaky.length,
        failing: failing.length,
        total: Object.keys(curr.tests).length,
    };

    const result: FlakyResult = { counts, flaky, failing };
    if (useLlm && flaky.length > 0) {
        result.summary = `${flaky.length} test(s) flipped from passed to failed since the previous build (${prev.runId}).`;
    }
    return result;
}
