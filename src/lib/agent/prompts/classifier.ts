import type Anthropic from "@anthropic-ai/sdk";
import { claude, MODEL } from "../claude";
import type { Category } from "../types";

const CLASSIFIER_PROMPT = `You are a strict classifier for game customer-support messages.

Output exactly one of these tokens and nothing else:
- account   (login, password, payment, refund, missing item, account recovery)
- faq       (gameplay questions, strategy, how-to, mechanics)
- bug       (crashes, errors, glitches, performance issues)
- abuse     (reporting another player, harassment, cheating, macro use)
- unknown   (cannot determine confidently)

Reply with the single token only.`;

export async function classifyMessage(userMessage: string): Promise<Category> {
  const res = await claude().messages.create({
    model: MODEL,
    max_tokens: 8,
    system: CLASSIFIER_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim()
    .toLowerCase();
  const allowed: Category[] = ["account", "faq", "bug", "abuse", "unknown"];
  return (allowed.includes(text as Category) ? text : "unknown") as Category;
}
