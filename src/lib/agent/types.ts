export type Category = "account" | "faq" | "bug" | "abuse" | "unknown";

export type Channel = "discord" | "sdk" | "email" | "test";

export type IncomingMessage = {
  channel: Channel;
  text: string;
  identity: { firebaseSub?: string; gameUuid?: string } | null;
  attachments?: Array<{ url: string; contentType?: string; filename?: string }>;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};

export type AgentRunResult = {
  reply: string;
  category: Category;
  language: { iso: string; name: string };
  toolCalls: Array<{ name: string; input: unknown; output: unknown }>;
  escalated: boolean;
};
