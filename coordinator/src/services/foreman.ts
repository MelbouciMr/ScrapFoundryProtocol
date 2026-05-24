/**
 * FOREMAN-7 — Coordinator-side LLM service
 * Direct Anthropic API integration for SCRAP Protocol
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com";
const MODEL = "claude-sonnet-4-20250514";

export function isEnabled(): boolean {
  const key = process.env.ANTHROPIC_API_KEY;
  return !!key && key !== "your_anthropic_api_key_here";
}

export async function callLLM(system: string, user: string, maxTokens = 512): Promise<string> {
  if (!isEnabled()) {
    throw new Error("ANTHROPIC_API_KEY not set — running in mock mode");
  }

  const res = await fetch(`${ANTHROPIC_API_URL}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json() as { content?: Array<{ text?: string }> };
  return data.content?.[0]?.text ?? "";
}
