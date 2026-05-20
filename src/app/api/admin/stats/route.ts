import { NextResponse } from "next/server";
import { listTickets } from "@/lib/store/tickets";

export const runtime = "nodejs";

export async function GET() {
  const all = listTickets();
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const last24 = all.filter((t) => now - new Date(t.createdAt).getTime() <= ONE_DAY);
  const prev24 = all.filter((t) => {
    const age = now - new Date(t.createdAt).getTime();
    return age > ONE_DAY && age <= 2 * ONE_DAY;
  });

  // 자동 해결률: AI가 답변하고 사람으로 안 넘어간 비율 (answered without escalation)
  const isAutoResolved = (t: typeof all[number]) =>
    (t.status === "answered" || t.status === "resolved") && !t.escalation;
  const considered24 = last24.filter((t) => t.status !== "ai_answering");
  const autoCount24 = considered24.filter(isAutoResolved).length;
  const autoRate24 = considered24.length === 0 ? 0 : autoCount24 / considered24.length;
  const consideredPrev = prev24.filter((t) => t.status !== "ai_answering");
  const autoCountPrev = consideredPrev.filter(isAutoResolved).length;
  const autoRatePrev = consideredPrev.length === 0 ? 0 : autoCountPrev / consideredPrev.length;
  const autoRateDeltaPct = Math.round((autoRate24 - autoRatePrev) * 100);

  // 카테고리 분포 (전체)
  const categoryDist = all.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + 1;
    return acc;
  }, {});

  // 언어 분포 (전체)
  const languageDist = all.reduce<Record<string, number>>((acc, t) => {
    const iso = t.language?.iso ?? "unknown";
    acc[iso] = (acc[iso] ?? 0) + 1;
    return acc;
  }, {});

  // AI 인용율 (citations >= 1) / answered
  const withResponse = all.filter((t) => t.aiResponse);
  const withCitation = withResponse.filter((t) => (t.aiResponse?.citations.length ?? 0) > 0);
  const citationRate = withResponse.length === 0 ? 0 : withCitation.length / withResponse.length;

  // 24h 신규 vs 직전 24h
  const newCountTrend = { current: last24.length, prev: prev24.length };

  // 평균 AI 툴 호출 수
  const toolCallCounts = withResponse.map((t) => t.aiResponse?.toolCalls.length ?? 0);
  const avgToolCalls =
    toolCallCounts.length === 0
      ? 0
      : toolCallCounts.reduce((a, b) => a + b, 0) / toolCallCounts.length;

  return NextResponse.json({
    autoResolveRate24h: { rate: autoRate24, deltaPct: autoRateDeltaPct, sampleSize: considered24.length },
    citationRate: { rate: citationRate, sampleSize: withResponse.length },
    categoryDist,
    languageDist,
    newCountTrend,
    avgToolCalls: Number(avgToolCalls.toFixed(2)),
  });
}
