import type Anthropic from "@anthropic-ai/sdk";
import { claude, MODEL } from "./claude";
import { detectLanguage } from "./language";
import { classifyMessage } from "./prompts/classifier";
import { buildSystemPrompt } from "./prompts/system";
import { TOOL_DEFS } from "./tools/definitions";
import { runTool } from "./tools/run";
import type { AgentRunResult, IncomingMessage } from "./types";

const MAX_TOOL_TURNS = 6;

export async function runAgent(input: IncomingMessage): Promise<AgentRunResult> {
  const language = detectLanguage(input.text);
  const category = await classifyMessage(input.text);
  const system = buildSystemPrompt(category, language.name);

  const messages: Anthropic.MessageParam[] = [
    ...(input.conversationHistory ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: input.text },
  ];

  const toolCalls: AgentRunResult["toolCalls"] = [];
  let escalated = false;

  const ctx = {
    defaultIdentity: input.identity,
    onEscalate: async () => {
      escalated = true;
    },
  };

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    const res = await claude().messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: system,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: TOOL_DEFS,
      messages,
    });

    if (res.stop_reason !== "tool_use") {
      const reply = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { reply, category, language, toolCalls, escalated };
    }

    messages.push({ role: "assistant", content: res.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of res.content) {
      if (block.type !== "tool_use") continue;
      const output = await runTool(
        block.name,
        block.input as Record<string, unknown>,
        ctx
      );
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
        ? "죄송합니다. 처리 시간이 초과되어 상담사가 곧 도와드릴 예정입니다."
        : "Sorry, this is taking longer than expected. A human agent will follow up shortly.",
    category,
    language,
    toolCalls,
    escalated: true,
  };
}
