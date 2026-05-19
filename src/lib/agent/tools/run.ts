import { gameApi } from "@/lib/gameapi/client";
import { parseIdentity } from "@/lib/gameapi/identity";

type ToolContext = {
  defaultIdentity: { firebaseSub?: string; gameUuid?: string } | null;
  onEscalate: (e: {
    reason: string;
    priority: "low" | "normal" | "high";
    summary: string;
    suggestedAction?: string;
  }) => Promise<void> | void;
};

function resolveIdentity(
  input: { firebase_sub?: string; game_uuid?: string },
  ctx: ToolContext
) {
  return parseIdentity({
    firebaseSub: input.firebase_sub ?? ctx.defaultIdentity?.firebaseSub ?? null,
    gameUuid: input.game_uuid ?? ctx.defaultIdentity?.gameUuid ?? null,
  });
}

export async function runTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  switch (name) {
    case "user_lookup": {
      const id = resolveIdentity(input as never, ctx);
      if (!id) return { error: "no_identity_provided" };
      const user = await gameApi().getUser(id);
      return user ?? { error: "user_not_found" };
    }

    case "payment_history": {
      const id = resolveIdentity(input as never, ctx);
      if (!id) return { error: "no_identity_provided" };
      const limit = typeof input.limit === "number" ? input.limit : 20;
      return await gameApi().listPayments(id, { limit });
    }

    case "kb_search": {
      const query = String(input.query ?? "");
      // TODO M2: replace with real RAG over /knowledge or knowledge_docs table
      return {
        query,
        results: [],
        note: "Knowledge base is empty in M1. Tell the user you cannot find a verified guide and offer to escalate.",
      };
    }

    case "log_fetch": {
      const id = resolveIdentity(input as never, ctx);
      if (!id) return { error: "no_identity_provided" };
      const since = typeof input.since === "string" ? input.since : undefined;
      const limit = typeof input.limit === "number" ? input.limit : 30;
      return await gameApi().fetchLogs(id, { since, limit });
    }

    case "escalate_to_human": {
      const reason = String(input.reason ?? "unspecified");
      const priority = (input.priority as "low" | "normal" | "high") ?? "normal";
      const summary = String(input.summary ?? "");
      const suggestedAction =
        typeof input.suggested_action === "string"
          ? input.suggested_action
          : undefined;
      await ctx.onEscalate({ reason, priority, summary, suggestedAction });
      return { ok: true, queued: true };
    }

    default:
      return { error: `unknown_tool:${name}` };
  }
}
