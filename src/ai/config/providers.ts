/**
 * providers — AI provider configuration for the TTA reporter.
 *
 * The reporter's RCA and flaky analyzers are optional: they only run when an
 * LLM API key is configured. This module centralises that check so the
 * reporter can degrade gracefully when no key is present.
 */

/** True when an LLM API key is available to power AI analyses. */
export function hasApiKey(): boolean {
    return Boolean(
        process.env.OPENAI_API_KEY ||
        process.env.ANTHROPIC_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.LLM_API_KEY,
    );
}
