import type Anthropic from "@anthropic-ai/sdk";
import { findProfile } from "@/lib/mock/profiles";
import { searchKB } from "@/lib/mock/kb";
import type { QueueName, Priority } from "@/lib/store/tickets";

export const TOOLS: Anthropic.Tool[] = [
  {
    name: "user_lookup",
    description: "현재 유저의 통합 프로파일을 조회합니다 (신원·캐릭터·진행도·밴 여부·디바이스 컨텍스트).",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "payment_history",
    description: "현재 유저의 최근 결제 이력을 조회합니다. 환불·미지급·중복결제 문의 시 사용.",
    input_schema: {
      type: "object",
      properties: { limit: { type: "integer", description: "최대 건수 (기본 10)" } },
    },
  },
  {
    name: "log_fetch",
    description: "현재 유저의 최근 게임 로그·디바이스 컨텍스트. 버그 리포팅 시 사용.",
    input_schema: {
      type: "object",
      properties: { sinceMinutes: { type: "integer", description: "최근 N분 (기본 30)" } },
    },
  },
  {
    name: "kb_search",
    description: "지식베이스에서 검색. 게임 FAQ·정책·매뉴얼 답변 시 필수. 결과 없으면 추측 답변 금지.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "검색어" },
        category: {
          type: "string",
          enum: ["account", "faq", "bug", "abuse", "onchain"],
          description: "카테고리 필터 (선택)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "onchain_tx_status",
    description: "온체인 트랜잭션 상태 조회. tx hash로 confirmed/pending/failed 확인.",
    input_schema: {
      type: "object",
      properties: { txHash: { type: "string", description: "트랜잭션 해시" } },
      required: ["txHash"],
    },
  },
  {
    name: "escalate_to_human",
    description:
      "사람 담당팀으로 티켓 이관. 변경 액션 요청·KB 미스·안전 민감·버그 리포트 등에 사용. 큐: payment(결제), infra(지갑), moderation(신고), tenant(일반·버그), general(fallback).",
    input_schema: {
      type: "object",
      properties: {
        queue: { type: "string", enum: ["payment", "infra", "moderation", "tenant", "general"] },
        priority: { type: "string", enum: ["low", "normal", "high"] },
        reason: { type: "string", description: "이관 사유 (예: refund_request, bug_repro)" },
        summary: { type: "string", description: "담당자가 볼 2-3문장 요약" },
        suggestedAction: { type: "string", description: "권장 다음 단계 (선택)" },
      },
      required: ["queue", "priority", "reason", "summary"],
    },
  },
];

export type ToolContext = {
  userId: string;
  toolCalls: Array<{ name: string; input: unknown; output: unknown }>;
  onEscalate: (item: {
    queue: QueueName;
    priority: Priority;
    reason: string;
    summary: string;
    suggestedAction?: string;
  }) => void;
};

export async function runTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  const profile = findProfile(ctx.userId);

  switch (name) {
    case "user_lookup": {
      if (!profile) return { error: "user_not_found" };
      return {
        userId: profile.id,
        displayName: profile.displayName,
        joinedAt: profile.joinedAt,
        banned: profile.banned,
        characters: profile.characters,
        progress: profile.progress,
        device: profile.deviceContext,
      };
    }

    case "payment_history": {
      if (!profile) return { error: "user_not_found" };
      const limit = typeof input.limit === "number" ? input.limit : 10;
      return profile.payments.slice(0, limit);
    }

    case "log_fetch": {
      if (!profile) return { error: "user_not_found" };
      return {
        device: profile.deviceContext,
        recentEvents: [
          {
            ts: "2026-05-20T08:55:30Z",
            level: "error",
            event: "client_crash",
            scene: "dungeon_03_boss_phase_1",
            build: profile.deviceContext.build,
          },
          {
            ts: "2026-05-20T08:55:28Z",
            level: "info",
            event: "scene_enter",
            scene: "dungeon_03",
          },
          {
            ts: "2026-05-20T08:50:11Z",
            level: "info",
            event: "session_start",
          },
        ],
      };
    }

    case "kb_search": {
      const query = String(input.query ?? "");
      const category = input.category as "account" | "faq" | "bug" | "abuse" | "onchain" | undefined;
      const results = searchKB(query, { category });
      if (results.length === 0) return { results: [], note: "검증된 KB 없음. 추측 답변 금지." };
      return {
        results: results.map((r) => ({
          slug: r.doc.slug,
          title: r.doc.title,
          version: r.doc.version,
          section: r.doc.section,
          body: r.doc.body,
          citation: `[출처: ${r.doc.title} ${r.doc.version} ${r.doc.section}]`,
        })),
      };
    }

    case "onchain_tx_status": {
      if (!profile) return { error: "user_not_found" };
      const txHash = String(input.txHash ?? "");
      const tx = [...profile.onChain.mints, ...profile.onChain.recentTx].find((t) =>
        t.tx.toLowerCase().startsWith(txHash.toLowerCase().slice(0, 10))
      );
      if (!tx) {
        return {
          txHash,
          status: "unknown",
          note: "지정한 tx를 찾을 수 없습니다. 다시 확인 또는 INFRA팀 이관 권장.",
        };
      }
      return { txHash: tx.tx, status: tx.status, timestamp: tx.ts };
    }

    case "escalate_to_human": {
      const queue = (input.queue as QueueName) ?? "general";
      const priority = (input.priority as Priority) ?? "normal";
      const reason = String(input.reason ?? "unspecified");
      const summary = String(input.summary ?? "");
      const suggestedAction =
        typeof input.suggestedAction === "string" ? input.suggestedAction : undefined;
      ctx.onEscalate({ queue, priority, reason, summary, suggestedAction });
      return { ok: true, queued: true, queue, priority };
    }
  }
  return { error: `unknown_tool:${name}` };
}
