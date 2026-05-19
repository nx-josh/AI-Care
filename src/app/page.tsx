"use client";

import { useEffect, useRef, useState } from "react";
import { SCENARIOS, DEMO_USERS } from "@/lib/scenarios";

type Msg = {
  role: "user" | "assistant";
  content: string;
  meta?: {
    category?: string;
    language?: string;
    toolCalls?: Array<{ name: string; input: unknown; output: unknown }>;
    citations?: string[];
    escalated?: { queue: string; priority: string; reason: string } | null;
  };
};

type QueueItem = {
  id: string;
  ticketId: string;
  queue: string;
  priority: string;
  reason: string;
  summary: string;
  userName: string;
  category: string;
  createdAt: string;
  toolCalls: Array<{ name: string }>;
};

const QUEUE_LABELS: Record<string, { label: string; color: string }> = {
  payment: { label: "결제팀", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  infra: { label: "INFRA팀", color: "bg-purple-100 text-purple-700 border-purple-300" },
  moderation: { label: "모더팀", color: "bg-rose-100 text-rose-700 border-rose-300" },
  tenant: { label: "게임사 운영팀", color: "bg-blue-100 text-blue-700 border-blue-300" },
  general: { label: "일반 큐", color: "bg-neutral-100 text-neutral-700 border-neutral-300" },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "text-red-600 font-semibold",
  normal: "text-neutral-700",
  low: "text-neutral-500",
};

export default function Demo() {
  const [userId, setUserId] = useState(DEMO_USERS[0].id);
  const [language, setLanguage] = useState<"ko" | "en" | "ja">("ko");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [newQueueIds, setNewQueueIds] = useState<Set<string>>(new Set());
  const [selectedTicket, setSelectedTicket] = useState<QueueItem | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    try {
      const res = await fetch("/api/queue", { cache: "no-store" });
      const data = await res.json();
      setQueue(data.queue ?? []);
    } catch {}
  }

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const prevQueueIds = new Set(queue.map((q) => q.id));
    const newMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, text, history }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: `[error] ${data.error}: ${data.detail ?? ""}` },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: data.reply,
            meta: {
              category: data.category,
              language: data.language?.name,
              toolCalls: data.toolCalls,
              citations: data.citations,
              escalated: data.escalated,
            },
          },
        ]);
        const updatedQueue: QueueItem[] = data.queue ?? [];
        setQueue(updatedQueue);
        const fresh = new Set(
          updatedQueue.filter((q) => !prevQueueIds.has(q.id)).map((q) => q.id)
        );
        if (fresh.size > 0) {
          setNewQueueIds(fresh);
          setTimeout(() => setNewQueueIds(new Set()), 3500);
        }
      }
    } catch (e) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: `[network error] ${(e as Error).message}` },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
    }
  }

  async function resetDemo() {
    await fetch("/api/queue", { method: "DELETE" });
    setMessages([]);
    setQueue([]);
    setNewQueueIds(new Set());
    setSelectedTicket(null);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">CROSS AI Care — 데모</h1>
            <p className="text-xs text-neutral-500">
              왼쪽: 게임 안 위젯 (유저) / 오른쪽: 운영자 큐 (실시간)
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="rounded border border-neutral-300 bg-white px-2 py-1"
            >
              {DEMO_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
            <div className="flex rounded border border-neutral-300 overflow-hidden">
              {(["ko", "en", "ja"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2 py-1 text-xs ${
                    language === l ? "bg-blue-600 text-white" : "bg-white text-neutral-700"
                  }`}
                >
                  {l === "ko" ? "🇰🇷 한국어" : l === "en" ? "🇺🇸 English" : "🇯🇵 日本語"}
                </button>
              ))}
            </div>
            <button
              onClick={resetDemo}
              className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
            >
              ↻ 초기화
            </button>
          </div>
        </div>

        {/* Scenario buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setInput(s.samples[language]);
                setTimeout(() => send(s.samples[language]), 100);
              }}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
              title={s.description}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-4 p-4">
        {/* LEFT — Widget */}
        <section className="rounded-lg border border-neutral-200 bg-white flex flex-col h-[calc(100vh-180px)]">
          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-600 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
            게임 안 채팅창 (SDK 위젯)
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-neutral-400 text-sm pt-12">
                위 시나리오 버튼을 누르거나 직접 입력해보세요.
              </div>
            )}
            {messages.map((m, i) => (
              <Message key={i} msg={m} />
            ))}
            {loading && (
              <div className="text-xs text-neutral-400 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                AI 응답 생성 중...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <form
            className="border-t border-neutral-200 p-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm"
              placeholder="문의 내용을 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              보내기
            </button>
          </form>
        </section>

        {/* RIGHT — Queue */}
        <section className="rounded-lg border border-neutral-200 bg-white flex flex-col h-[calc(100vh-180px)]">
          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-xs text-neutral-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
              운영자 큐 (Hub Console) — 사람 처리 대기
            </div>
            <span className="text-neutral-500">
              {queue.length}건 대기 중
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
            {/* Queue list */}
            <div className="overflow-y-auto border-r border-neutral-200 p-3 space-y-2">
              {queue.length === 0 && (
                <div className="text-center text-neutral-400 text-sm pt-12">
                  아직 큐가 비어있습니다.
                  <br />
                  왼쪽에서 변경 액션을 요청해보세요.
                </div>
              )}
              {queue.map((q) => {
                const isNew = newQueueIds.has(q.id);
                const label = QUEUE_LABELS[q.queue] ?? QUEUE_LABELS.general;
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedTicket(q)}
                    className={`w-full text-left rounded-lg border p-3 text-xs transition-all ${
                      isNew ? "animate-pulse ring-2 ring-orange-400" : ""
                    } ${
                      selectedTicket?.id === q.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-neutral-200 hover:border-neutral-400 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${label.color}`}>
                        {label.label}
                      </span>
                      <span className={`text-[10px] ${PRIORITY_COLORS[q.priority]}`}>
                        {q.priority === "high" ? "⚠ HIGH" : q.priority}
                      </span>
                    </div>
                    <div className="font-medium text-neutral-800">{q.reason}</div>
                    <div className="mt-1 text-neutral-600 line-clamp-2">{q.summary}</div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>{q.userName}</span>
                      <span>{new Date(q.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Ticket detail */}
            <div className="overflow-y-auto p-4 text-xs bg-neutral-50">
              {!selectedTicket && (
                <div className="text-center text-neutral-400 pt-12">
                  티켓을 클릭하면 상세가 보입니다.
                </div>
              )}
              {selectedTicket && (
                <div className="space-y-3">
                  <div>
                    <div className="text-neutral-500 mb-0.5">티켓 ID</div>
                    <div className="font-mono">{selectedTicket.ticketId}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-0.5">큐 · 우선순위</div>
                    <div>
                      {QUEUE_LABELS[selectedTicket.queue]?.label ?? selectedTicket.queue} ·{" "}
                      <span className={PRIORITY_COLORS[selectedTicket.priority]}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-0.5">유저</div>
                    <div>{selectedTicket.userName}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-0.5">카테고리 · 사유</div>
                    <div>
                      {selectedTicket.category} / {selectedTicket.reason}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-0.5">요약</div>
                    <div className="bg-white border border-neutral-200 rounded p-2 whitespace-pre-wrap">
                      {selectedTicket.summary}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-0.5">
                      AI 툴 호출 ({selectedTicket.toolCalls.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTicket.toolCalls.map((t, i) => (
                        <span
                          key={i}
                          className="rounded bg-white border border-neutral-200 px-1.5 py-0.5 text-[10px]"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 text-[10px] text-neutral-400">
                    출시 시점 운영 모델: 사람 처리 SLA 미보장. cross_admin이 가용 시간에 처리.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Footer info */}
      <footer className="border-t border-neutral-200 bg-white px-6 py-2 text-[11px] text-neutral-500">
        AI 응답은 즉시 (10초 이내) · 사람 처리는 비실시간 (SLA 미보장) ·{" "}
        모든 변경 액션 (환불·복구·재지급) 은 사람이 처리
      </footer>
    </div>
  );
}

function Message({ msg }: { msg: Msg }) {
  const meta = msg.meta;
  return (
    <div className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[88%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
          msg.role === "user"
            ? "bg-blue-600 text-white"
            : "bg-white border border-neutral-200"
        }`}
      >
        <div>{msg.content}</div>
        {meta && (
          <div className="mt-2 pt-2 border-t border-neutral-200 text-[11px] text-neutral-500 space-y-1">
            <div className="flex flex-wrap gap-2">
              {meta.category && (
                <span className="rounded bg-neutral-100 px-1.5 py-0.5">
                  카테고리: <b className="text-neutral-700">{meta.category}</b>
                </span>
              )}
              {meta.language && (
                <span className="rounded bg-neutral-100 px-1.5 py-0.5">
                  언어: <b className="text-neutral-700">{meta.language}</b>
                </span>
              )}
              {meta.toolCalls && meta.toolCalls.length > 0 && (
                <span className="rounded bg-neutral-100 px-1.5 py-0.5">
                  툴: <b className="text-neutral-700">{meta.toolCalls.map((t) => t.name).join(", ")}</b>
                </span>
              )}
              {meta.escalated && (
                <span className="rounded bg-orange-100 text-orange-700 px-1.5 py-0.5">
                  ⚑ {meta.escalated.queue} 큐로 이관 ({meta.escalated.priority})
                </span>
              )}
            </div>
            {meta.citations && meta.citations.length > 0 && (
              <div className="text-neutral-400">📎 {meta.citations.join(" · ")}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
