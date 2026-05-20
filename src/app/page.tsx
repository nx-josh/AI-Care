"use client";

import { useEffect, useMemo, useState } from "react";
import { DEMO_USERS, SCENARIOS } from "@/lib/scenarios";

type Ticket = {
  id: string;
  status: "ai_answering" | "answered" | "pending_human" | "resolved";
  category: string;
  subject: string;
  body: string;
  language?: { iso: string; name: string };
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  aiResponse?: {
    text: string;
    citations: string[];
    toolCalls: Array<{ name: string; input: unknown; output: unknown }>;
  };
  escalation?: { queue: string; priority: string; reason: string; summary: string };
};

type FAQ = {
  slug: string;
  title: string;
  version: string;
  section: string;
  body: string;
  category: string;
  layer: "tenant" | "cross";
};

const CAT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  account: { label: "계정·결제", icon: "💳", color: "bg-emerald-100 text-emerald-700" },
  faq: { label: "게임 진행", icon: "🎮", color: "bg-blue-100 text-blue-700" },
  bug: { label: "버그·오류", icon: "🐛", color: "bg-amber-100 text-amber-700" },
  abuse: { label: "유저 신고", icon: "🚨", color: "bg-rose-100 text-rose-700" },
  onchain: { label: "지갑·블록체인", icon: "🔗", color: "bg-purple-100 text-purple-700" },
};

const QUEUE_LABELS: Record<string, { label: string; color: string }> = {
  payment: { label: "결제팀", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  infra: { label: "INFRA팀", color: "bg-purple-100 text-purple-700 border-purple-300" },
  moderation: { label: "모더팀", color: "bg-rose-100 text-rose-700 border-rose-300" },
  tenant: { label: "게임사 운영팀", color: "bg-blue-100 text-blue-700 border-blue-300" },
  general: { label: "일반 큐", color: "bg-neutral-100 text-neutral-700 border-neutral-300" },
};

const STATUS_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  ai_answering: { label: "AI 응답 작성 중", icon: "⏱️", color: "text-blue-600" },
  answered: { label: "답변 완료", icon: "✓", color: "text-green-600" },
  pending_human: { label: "사람 검토 중", icon: "⏳", color: "text-orange-600" },
  resolved: { label: "처리 완료", icon: "✓", color: "text-neutral-500" },
};

export default function Demo() {
  const [tab, setTab] = useState<"user" | "admin">("user");
  const [userId, setUserId] = useState(DEMO_USERS[0].id);
  const [language, setLanguage] = useState<"ko" | "en" | "ja">("ko");

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">CROSS AI Care</h1>
            <p className="text-xs text-neutral-500">
              게임 고객지원 시스템 — 데모
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex rounded-lg border border-neutral-300 overflow-hidden">
              <button
                onClick={() => setTab("user")}
                className={`px-3 py-1.5 text-xs ${
                  tab === "user" ? "bg-blue-600 text-white" : "bg-white"
                }`}
              >
                🎮 유저 (게임 안 위젯)
              </button>
              <button
                onClick={() => setTab("admin")}
                className={`px-3 py-1.5 text-xs ${
                  tab === "admin" ? "bg-blue-600 text-white" : "bg-white"
                }`}
              >
                🛠️ 운영자 (Hub Console)
              </button>
            </div>
            {tab === "user" && (
              <>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs"
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
                        language === l ? "bg-neutral-800 text-white" : "bg-white"
                      }`}
                    >
                      {l === "ko" ? "한국어" : l === "en" ? "EN" : "日本語"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {tab === "user" ? (
          <UserWidget userId={userId} language={language} />
        ) : (
          <AdminConsole />
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-4 text-[11px] text-neutral-500 border-t border-neutral-200 bg-white">
        AI 응답은 즉시 (10초 이내) · 사람 처리는 비실시간 (SLA 미보장) · 변경 액션은 사람만 처리
      </footer>
    </div>
  );
}

// ============================================================
// USER WIDGET
// ============================================================

type UserView = { type: "home" } | { type: "form"; presetCategory?: string; presetBody?: string } | { type: "detail"; ticketId: string };

function UserWidget({ userId, language }: { userId: string; language: "ko" | "en" | "ja" }) {
  const [view, setView] = useState<UserView>({ type: "home" });
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);

  async function refreshTickets() {
    try {
      const res = await fetch(`/api/tickets?userId=${userId}`, { cache: "no-store" });
      const data = await res.json();
      setMyTickets(data.tickets ?? []);
    } catch {}
  }

  useEffect(() => {
    refreshTickets();
  }, [userId]);

  return (
    <div className="rounded-2xl bg-white shadow-lg border border-neutral-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white">
        <div className="text-sm font-medium">🎧 고객지원</div>
        <div className="text-xs opacity-90">무엇을 도와드릴까요?</div>
      </div>

      <div className="p-5">
        {view.type === "home" && (
          <Home
            userId={userId}
            language={language}
            tickets={myTickets}
            onOpenForm={(cat, body) => setView({ type: "form", presetCategory: cat, presetBody: body })}
            onOpenTicket={(id) => setView({ type: "detail", ticketId: id })}
          />
        )}
        {view.type === "form" && (
          <TicketForm
            userId={userId}
            language={language}
            presetCategory={view.presetCategory}
            presetBody={view.presetBody}
            onBack={() => setView({ type: "home" })}
            onSubmitted={(t) => {
              refreshTickets();
              setView({ type: "detail", ticketId: t.id });
            }}
          />
        )}
        {view.type === "detail" && (
          <TicketDetail
            ticketId={view.ticketId}
            onBack={() => {
              refreshTickets();
              setView({ type: "home" });
            }}
          />
        )}
      </div>
    </div>
  );
}

function Home({
  userId,
  language,
  tickets,
  onOpenForm,
  onOpenTicket,
}: {
  userId: string;
  language: "ko" | "en" | "ja";
  tickets: Ticket[];
  onOpenForm: (category?: string, body?: string) => void;
  onOpenTicket: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setFaqs([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/faq?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setFaqs(data.results ?? []);
      } catch {}
    }, 200);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <div className="relative">
          <input
            type="text"
            placeholder="질문을 검색하거나 입력하세요…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-10 py-3 text-sm focus:border-blue-500 focus:outline-none"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
        </div>

        {/* FAQ suggestions */}
        {faqs.length > 0 && !selectedFaq && (
          <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden">
            <div className="px-3 py-1.5 text-[10px] text-neutral-500 bg-neutral-100 border-b border-neutral-200">
              💡 빠른 도움말 ({faqs.length}건)
            </div>
            {faqs.map((f) => (
              <button
                key={f.slug}
                onClick={() => setSelectedFaq(f)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white border-b border-neutral-200 last:border-b-0"
              >
                <div className="font-medium text-neutral-800">{f.title}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  {f.layer === "cross" ? "CROSS 표준" : "게임별"} · {f.version}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* FAQ detail */}
        {selectedFaq && (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium text-sm text-neutral-800">{selectedFaq.title}</div>
              <button onClick={() => setSelectedFaq(null)} className="text-xs text-neutral-500 hover:text-neutral-800">
                ✕
              </button>
            </div>
            <div className="text-sm text-neutral-700 whitespace-pre-wrap">{selectedFaq.body}</div>
            <div className="mt-2 text-[10px] text-neutral-500">
              📎 [출처: {selectedFaq.title} {selectedFaq.version} {selectedFaq.section}]
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  setSelectedFaq(null);
                  setQ("");
                }}
                className="flex-1 rounded bg-green-600 text-white text-xs py-2 hover:bg-green-700"
              >
                ✓ 해결됐어요
              </button>
              <button
                onClick={() => onOpenForm(selectedFaq.category, q)}
                className="flex-1 rounded border border-neutral-300 text-xs py-2 hover:bg-white"
              >
                도움 더 필요해요
              </button>
            </div>
          </div>
        )}

        {/* Direct submit */}
        {q.trim().length >= 2 && faqs.length === 0 && (
          <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-500">
            검증된 가이드가 없어요.{" "}
            <button
              onClick={() => onOpenForm(undefined, q)}
              className="text-blue-600 underline"
            >
              정식 문의로 작성
            </button>
          </div>
        )}
      </div>

      {/* Category quick start */}
      {!selectedFaq && (
        <div>
          <div className="text-xs text-neutral-500 mb-2">또는 카테고리 선택</div>
          <div className="grid grid-cols-5 gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => onOpenForm(s.category, s.samples[language])}
                className="flex flex-col items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-3 hover:border-blue-400 hover:bg-blue-50"
                title={s.description}
              >
                <span className="text-2xl">{s.icon}</span>
                <span className="text-[10px] text-neutral-700 text-center leading-tight">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* My tickets */}
      {tickets.length > 0 && (
        <div>
          <div className="text-xs text-neutral-500 mb-2">📋 내 문의 ({tickets.length}건)</div>
          <div className="space-y-1.5">
            {tickets.slice(0, 5).map((t) => (
              <TicketRow key={t.id} ticket={t} onClick={() => onOpenTicket(t.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TicketRow({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const status = STATUS_LABELS[ticket.status];
  const cat = CAT_LABELS[ticket.category] ?? { label: ticket.category, icon: "📝", color: "bg-neutral-100" };
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-neutral-200 bg-white px-3 py-2 hover:border-neutral-400"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">{cat.icon}</span>
          <span className="text-xs font-medium text-neutral-800 truncate">{ticket.subject}</span>
        </div>
        <span className={`text-[10px] ${status.color} whitespace-nowrap ml-2`}>
          {status.icon} {status.label}
        </span>
      </div>
      <div className="mt-0.5 text-[10px] text-neutral-400 font-mono">{ticket.id}</div>
    </button>
  );
}

// ============================================================
// TICKET FORM
// ============================================================

function TicketForm({
  userId,
  language,
  presetCategory,
  presetBody,
  onBack,
  onSubmitted,
}: {
  userId: string;
  language: "ko" | "en" | "ja";
  presetCategory?: string;
  presetBody?: string;
  onBack: () => void;
  onSubmitted: (t: Ticket) => void;
}) {
  const [category, setCategory] = useState(presetCategory ?? "account");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(presetBody ?? "");
  const [submitting, setSubmitting] = useState(false);

  const samples = useMemo(() => {
    return SCENARIOS.find((s) => s.category === category)?.samples[language] ?? "";
  }, [category, language]);

  async function submit() {
    if (!subject.trim() || !body.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, category, subject, body }),
      });
      const data = await res.json();
      if (data.ticket) onSubmitted(data.ticket);
    } catch (e) {
      alert(`문의 제출 실패: ${(e as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-neutral-500 hover:text-neutral-800">
        ← 뒤로
      </button>

      <div className="text-sm font-medium">📝 문의 작성</div>

      <div>
        <label className="text-xs text-neutral-500 mb-1 block">카테고리</label>
        <div className="grid grid-cols-5 gap-1.5">
          {Object.entries(CAT_LABELS).map(([key, { label, icon }]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`rounded border px-2 py-2 text-[11px] ${
                category === key ? "border-blue-500 bg-blue-50" : "border-neutral-200 bg-white"
              }`}
            >
              <div>{icon}</div>
              <div className="mt-0.5">{label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-neutral-500 mb-1 block">제목</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="간단한 제목"
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-neutral-500 mb-1 block">
          내용
          {samples && !body && (
            <button
              onClick={() => setBody(samples)}
              className="ml-2 text-blue-600 hover:underline"
            >
              📋 예시 자동 입력
            </button>
          )}
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="문의 내용을 자세히 작성해주세요."
          rows={5}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm resize-none"
        />
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800">
        ⚠️ AI가 먼저 검토해 1차 답변하거나, 사람 검토가 필요한 경우 담당팀에 전달됩니다.
        <br />
        담당팀 처리는 비실시간이며 구체적인 시간은 약속하지 않습니다.
      </div>

      <button
        onClick={submit}
        disabled={submitting || !subject.trim() || !body.trim()}
        className="w-full rounded-lg bg-blue-600 text-white py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {submitting ? "처리 중..." : "문의 제출"}
      </button>
    </div>
  );
}

// ============================================================
// TICKET DETAIL
// ============================================================

function TicketDetail({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((d) => {
        setTicket(d.ticket);
        setLoading(false);
      });
  }, [ticketId]);

  if (loading) {
    return (
      <div className="text-center py-12 text-sm text-neutral-500">
        <div className="animate-pulse">티켓 불러오는 중...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div>
        <button onClick={onBack} className="text-xs text-neutral-500 hover:text-neutral-800">
          ← 뒤로
        </button>
        <div className="mt-4 text-sm text-red-500">티켓을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const status = STATUS_LABELS[ticket.status];
  const cat = CAT_LABELS[ticket.category] ?? { label: ticket.category, icon: "📝", color: "bg-neutral-100" };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-neutral-500 hover:text-neutral-800">
        ← 내 문의 목록
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cat.icon}</span>
          <div>
            <div className="text-sm font-medium">{ticket.subject}</div>
            <div className="text-[10px] text-neutral-400 font-mono">{ticket.id}</div>
          </div>
        </div>
        <span className={`text-xs ${status.color}`}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* 내 문의 */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        <div className="text-[10px] text-neutral-500 mb-1">
          📝 내 문의 · {new Date(ticket.createdAt).toLocaleString()}
        </div>
        <div className="text-sm text-neutral-800 whitespace-pre-wrap">{ticket.body}</div>
      </div>

      {/* AI 응답 */}
      {ticket.aiResponse && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="text-[10px] text-blue-700 mb-1 flex items-center gap-1">
            🤖 AI 응답 {ticket.language && <span>· {ticket.language.name}</span>}
          </div>
          <div className="text-sm text-neutral-800 whitespace-pre-wrap">
            {ticket.aiResponse.text}
          </div>
          {ticket.aiResponse.citations.length > 0 && (
            <div className="mt-2 text-[10px] text-blue-700">
              📎 {ticket.aiResponse.citations.join(" · ")}
            </div>
          )}
          {ticket.aiResponse.toolCalls.length > 0 && (
            <details className="mt-2">
              <summary className="text-[10px] text-blue-600 cursor-pointer hover:text-blue-800">
                AI가 사용한 툴 ({ticket.aiResponse.toolCalls.length})
              </summary>
              <div className="mt-1 flex flex-wrap gap-1">
                {ticket.aiResponse.toolCalls.map((tc, i) => (
                  <span
                    key={i}
                    className="rounded bg-white border border-blue-200 px-1.5 py-0.5 text-[10px]"
                  >
                    {tc.name}
                  </span>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* 사람 검토 안내 */}
      {ticket.status === "pending_human" && ticket.escalation && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <div className="flex items-center gap-2 text-sm text-orange-800 font-medium">
            ⏳ 사람 검토 중
          </div>
          <div className="mt-1.5 text-xs text-orange-700">
            {QUEUE_LABELS[ticket.escalation.queue]?.label ?? ticket.escalation.queue} 으로 전달됨
            {ticket.escalation.priority === "high" && " · ⚠ HIGH"}
          </div>
          <div className="mt-1.5 text-[11px] text-orange-700">
            처리 대기 중입니다. 처리되는 대로 안내드릴게요. 구체적인 시간은 약속하지 않습니다.
          </div>
        </div>
      )}

      {/* 자동 해결 안내 */}
      {ticket.status === "answered" && !ticket.escalation && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800">
          ✓ AI가 답변했어요. 더 도움이 필요하면 아래에 이어 작성해주세요.
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMIN CONSOLE
// ============================================================

function AdminConsole() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, []);

  async function refresh() {
    try {
      const res = await fetch("/api/admin/queue", { cache: "no-store" });
      const data = await res.json();
      setTickets(data.tickets ?? []);
    } catch {}
  }

  return (
    <div className="rounded-2xl bg-white shadow-lg border border-neutral-200 overflow-hidden">
      <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 px-5 py-3 text-white flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">🛠️ Hub Console — 사람 검토 큐</div>
          <div className="text-xs opacity-80">
            출시 시점: cross_admin 단독 처리 · SLA 미보장
          </div>
        </div>
        <div className="text-xs">{tickets.length}건 대기 중</div>
      </div>

      <div className="grid md:grid-cols-2 min-h-[500px]">
        {/* List */}
        <div className="border-r border-neutral-200 p-3 space-y-2 overflow-y-auto max-h-[600px]">
          {tickets.length === 0 && (
            <div className="text-center text-neutral-400 text-sm pt-12">
              아직 큐가 비어있습니다.
              <br />
              유저 위젯 탭에서 변경 액션을 요청해보세요.
            </div>
          )}
          {tickets.map((t) => {
            const label = QUEUE_LABELS[t.escalation?.queue ?? "general"] ?? QUEUE_LABELS.general;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`w-full text-left rounded-lg border p-3 text-xs ${
                  selected?.id === t.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-neutral-200 hover:border-neutral-400 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] ${label.color}`}>
                    {label.label}
                  </span>
                  <span
                    className={`text-[10px] ${
                      t.escalation?.priority === "high"
                        ? "text-red-600 font-semibold"
                        : "text-neutral-500"
                    }`}
                  >
                    {t.escalation?.priority === "high" ? "⚠ HIGH" : t.escalation?.priority}
                  </span>
                </div>
                <div className="font-medium text-neutral-800">{t.subject}</div>
                <div className="text-neutral-500 text-[10px] mt-0.5">
                  사유: {t.escalation?.reason}
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-400">
                  <span>{t.userName}</span>
                  <span>{new Date(t.createdAt).toLocaleTimeString()}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        <div className="p-4 overflow-y-auto max-h-[600px] bg-neutral-50">
          {!selected && (
            <div className="text-center text-neutral-400 text-xs pt-12">
              티켓을 클릭하면 상세가 보입니다.
            </div>
          )}
          {selected && (
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-neutral-500 mb-0.5">티켓 ID · 유저</div>
                <div className="font-mono">{selected.id}</div>
                <div>{selected.userName}</div>
              </div>
              <div>
                <div className="text-neutral-500 mb-0.5">제목</div>
                <div className="font-medium">{selected.subject}</div>
              </div>
              <div>
                <div className="text-neutral-500 mb-0.5">유저 문의</div>
                <div className="bg-white border border-neutral-200 rounded p-2 whitespace-pre-wrap">
                  {selected.body}
                </div>
              </div>
              {selected.aiResponse && (
                <div>
                  <div className="text-neutral-500 mb-0.5">AI 1차 답변 (참고용)</div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 whitespace-pre-wrap">
                    {selected.aiResponse.text}
                  </div>
                  {selected.aiResponse.citations.length > 0 && (
                    <div className="mt-1 text-[10px] text-neutral-500">
                      📎 {selected.aiResponse.citations.join(" · ")}
                    </div>
                  )}
                </div>
              )}
              {selected.escalation && (
                <div>
                  <div className="text-neutral-500 mb-0.5">에스컬레이션 정보</div>
                  <div>
                    {QUEUE_LABELS[selected.escalation.queue]?.label} · {selected.escalation.priority}
                  </div>
                  <div className="mt-0.5 text-neutral-600">사유: {selected.escalation.reason}</div>
                </div>
              )}
              {selected.aiResponse && (
                <div>
                  <div className="text-neutral-500 mb-0.5">
                    AI 툴 호출 ({selected.aiResponse.toolCalls.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selected.aiResponse.toolCalls.map((t, i) => (
                      <span
                        key={i}
                        className="rounded bg-white border border-neutral-200 px-1.5 py-0.5 text-[10px]"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-2 border-t border-neutral-200 text-[10px] text-neutral-400">
                출시 시점 운영 모델: cross_admin 단독 처리. 사람 처리 SLA 미보장.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
