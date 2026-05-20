import Anthropic from "@anthropic-ai/sdk";
import { detectLanguage } from "./language";
import { buildSystemPrompt, CLASSIFIER_SYSTEM } from "./prompts";
import { TOOLS, runTool } from "./tools";
import type { Category, ChatRequest, ChatResult, ToolCallRecord } from "./types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const CLASSIFIER_MODEL = process.env.ANTHROPIC_CLASSIFIER_MODEL || "claude-haiku-4-5-20251001";

let _client: Anthropic | null = null;
function client() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

async function classify(text: string): Promise<Category> {
  try {
    const res = await client().messages.create({
      model: CLASSIFIER_MODEL,
      max_tokens: 10,
      system: CLASSIFIER_SYSTEM,
      messages: [{ role: "user", content: text }],
    });
    const out = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
      .toLowerCase();
    const allowed: Category[] = ["account", "faq", "bug", "abuse", "onchain", "unknown"];
    return (allowed.includes(out as Category) ? out : "unknown") as Category;
  } catch {
    return "unknown";
  }
}

const MAX_TURNS = 6;

export async function runAgent(req: ChatRequest): Promise<ChatResult> {
  const language = detectLanguage(req.text);
  const category = await classify(req.text);
  const system = buildSystemPrompt(category, language.name);

  const messages: Anthropic.MessageParam[] = [
    ...(req.history ?? []).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: req.text },
  ];

  const toolCalls: ToolCallRecord[] = [];
  let escalated: ChatResult["escalated"] = null;

  const ctx = {
    userId: req.userId,
    toolCalls,
    onEscalate: (e: { queue: string; priority: string; reason: string }) => {
      escalated = { queue: e.queue, priority: e.priority, reason: e.reason };
    },
  };

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await client().messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      tools: TOOLS,
      messages,
    });

    if (res.stop_reason !== "tool_use") {
      const reply = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      const citations = extractCitations(reply);
      return { reply, category, language, toolCalls, escalated, citations };
    }

    messages.push({ role: "assistant", content: res.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of res.content) {
      if (block.type !== "tool_use") continue;
      const output = await runTool(block.name, block.input as Record<string, unknown>, ctx);
      toolCalls.push({ name: block.name, input: block.input, output });
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(output),
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return {
    reply:
      language.iso === "kor"
        ? "처리에 시간이 더 필요해 사람 검토 큐로 이관했습니다."
        : "Routing to a human reviewer for further handling.",
    category,
    language,
    toolCalls,
    escalated: escalated ?? { queue: "general", priority: "normal", reason: "timeout" },
    citations: [],
  };
}

function extractCitations(text: string): string[] {
  const re = /\[출처:[^\]]+\]/g;
  return text.match(re) ?? [];
}
