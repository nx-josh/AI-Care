export type Category = "account" | "faq" | "bug" | "abuse" | "onchain" | "unknown";

export type ChatRequest = {
  userId: string;
  text: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

export type ToolCallRecord = {
  name: string;
  input: unknown;
  output: unknown;
};

export type ChatResult = {
  reply: string;
  category: Category;
  language: { iso: string; name: string };
  toolCalls: ToolCallRecord[];
  escalated: { queue: string; priority: string; reason: string } | null;
  citations: string[];
};
