import type Anthropic from "@anthropic-ai/sdk";

export const TOOL_DEFS: Anthropic.Tool[] = [
  {
    name: "user_lookup",
    description:
      "Look up a player's account profile by their Firebase Sub or Game UUID. Returns display name, ban status, characters, and account creation date. Use this whenever the user mentions account, login, or anything personal to them.",
    input_schema: {
      type: "object",
      properties: {
        firebase_sub: {
          type: "string",
          description: "Firebase Auth subject claim from the user's ID token.",
        },
        game_uuid: {
          type: "string",
          description: "Game UUID assigned by the game developer.",
        },
      },
    },
  },
  {
    name: "payment_history",
    description:
      "List recent payments for a player. Use for refund disputes, missing-item-after-purchase, and payment failure inquiries. Read-only — does NOT process refunds.",
    input_schema: {
      type: "object",
      properties: {
        firebase_sub: { type: "string" },
        game_uuid: { type: "string" },
        limit: {
          type: "integer",
          description: "Max records to return (default 20).",
        },
      },
    },
  },
  {
    name: "kb_search",
    description:
      "Search the gameplay knowledge base (FAQs, guides, mechanics). Use this for any in-game strategy or how-to question. If no relevant doc returns, you must NOT invent gameplay info.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Natural-language search query.",
        },
        limit: { type: "integer", description: "Max docs (default 4)." },
      },
      required: ["query"],
    },
  },
  {
    name: "log_fetch",
    description:
      "Fetch recent client/server log entries for a player. Use for bug investigation. Provide a 'since' ISO timestamp around the incident time when possible.",
    input_schema: {
      type: "object",
      properties: {
        firebase_sub: { type: "string" },
        game_uuid: { type: "string" },
        since: {
          type: "string",
          description: "ISO 8601 datetime. Only logs after this time are returned.",
        },
        limit: { type: "integer", description: "Max entries (default 30)." },
      },
    },
  },
  {
    name: "escalate_to_human",
    description:
      "Create a ticket for a human support agent. Use this whenever (a) the user requests a mutating action, (b) you lack data to answer, (c) the situation is safety-sensitive, or (d) the issue is a confirmed bug or abuse report.",
    input_schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Short reason code, e.g. 'refund_request', 'login_blocked', 'bug_repro', 'harassment_report'.",
        },
        priority: {
          type: "string",
          enum: ["low", "normal", "high"],
          description: "Priority. Use 'high' for safety-sensitive issues.",
        },
        summary: {
          type: "string",
          description: "2-4 sentence summary of the issue for the human agent.",
        },
        suggested_action: {
          type: "string",
          description: "Concrete next step the human should take.",
        },
      },
      required: ["reason", "priority", "summary"],
    },
  },
];
