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

type ProfileLite = {
  displayName: string;
  banned: boolean;
  tenantId: string;
  mainCharacter: { id: string; name: string; level: number; class: string } | null;
  progress: { currentQuest: string; questStep: string; guild: string | null };
  walletShort: string | null;
};

const CAT_LABELS: Record<string, { label: string; icon: string; bg: string; text: string; ring: string }> = {
  account: { label: "계정·결제", icon: "💰", bg: "bg-gradient-to-br from-amber-50 to-yellow-100", text: "text-amber-800", ring: "ring-amber-400" },
  faq: { label: "게임 진행", icon: "⚔️", bg: "bg-gradient-to-br from-cyan-50 to-blue-100", text: "text-blue-800", ring: "ring-cyan-400" },
  bug: { label: "버그·오류", icon: "🛡️", bg: "bg-gradient-to-br from-orange-50 to-amber-100", text: "text-orange-800", ring: "ring-orange-400" },
  abuse: { label: "유저 신고", icon: "🚨", bg: "bg-gradient-to-br from-rose-50 to-red-100", text: "text-rose-800", ring: "ring-rose-400" },
  onchain: { label: "NFT·지갑", icon: "💎", bg: "bg-gradient-to-br from-violet-50 to-purple-100", text: "text-purple-800", ring: "ring-purple-400" },
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
    <div
      className={`min-h-screen transition-colors duration-500 ${
        tab === "user" ? "bg-slate-950" : "bg-neutral-100"
      }`}
    >
      <header
        className={`border-b transition-colors ${
          tab === "user"
            ? "border-white/10 bg-slate-900/70 backdrop-blur"
            : "border-neutral-200 bg-white"
        }`}
      >
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <h1
              className={`text-lg font-semibold ${
                tab === "user" ? "text-white" : "text-neutral-900"
              }`}
            >
              CROSS AI Care
            </h1>
            <p className={`text-xs ${tab === "user" ? "text-white/60" : "text-neutral-500"}`}>
              게임 고객지원 시스템 — 데모
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`flex rounded-lg overflow-hidden border ${
                tab === "user" ? "border-white/20" : "border-neutral-300"
              }`}
            >
              <button
                onClick={() => setTab("user")}
                className={`px-3 py-1.5 text-xs ${
                  tab === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-neutral-700"
                }`}
              >
                🎮 유저 (게임 안 위젯)
              </button>
              <button
                onClick={() => setTab("admin")}
                className={`px-3 py-1.5 text-xs ${
                  tab === "admin"
                    ? "bg-blue-600 text-white"
                    : tab === "user"
                    ? "bg-white/10 text-white/70"
                    : "bg-white text-neutral-700"
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
                  className="rounded border border-white/20 bg-white/10 text-white px-2 py-1 text-xs backdrop-blur"
                >
                  {DEMO_USERS.map((u) => (
                    <option key={u.id} value={u.id} className="text-neutral-900">
                      {u.label}
                    </option>
                  ))}
                </select>
                <div className="flex rounded border border-white/20 overflow-hidden">
                  {(["ko", "en", "ja"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`px-2 py-1 text-xs ${
                        language === l
                          ? "bg-white text-neutral-900"
                          : "bg-white/10 text-white/80"
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

      <main className="mx-auto max-w-6xl px-6 py-8">
        {tab === "user" ? (
          <GameSceneView userId={userId} language={language} />
        ) : (
          <AdminConsole />
        )}
      </main>

      <footer
        className={`mx-auto max-w-6xl px-6 py-4 text-[11px] border-t ${
          tab === "user"
            ? "text-white/40 border-white/10"
            : "text-neutral-500 border-neutral-200 bg-white"
        }`}
      >
        AI 응답은 즉시 (10초 이내) · 사람 처리는 비실시간 (SLA 미보장) · 변경 액션은 사람만 처리
      </footer>
    </div>
  );
}

// ============================================================
// GAME SCENE VIEW (실제 게임 화면 + AI Care 버튼 + 모달 위젯)
// ============================================================

function GameSceneView({ userId, language }: { userId: string; language: "ko" | "en" | "ja" }) {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch(`/api/tickets?userId=${userId}&status=pending_human,ai_answering`)
      .then((r) => r.json())
      .then((d) => setPendingCount((d.tickets ?? []).length))
      .catch(() => {});
  }, [userId, widgetOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setWidgetOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      {/* 게임 뷰포트 — 세로형 (모바일 게임 화면) */}
      <div
        className="relative mx-auto w-full max-w-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl ring-4 ring-neutral-900/80"
        style={{ aspectRatio: "9 / 16" }}
      >
        {/* 게임 배경 이미지 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/gameplay-world-map.jpg"
          alt="Game scene"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* 위젯 열렸을 때 dim + blur */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            widgetOpen ? "bg-black/55 backdrop-blur-sm" : "bg-black/0 backdrop-blur-0"
          }`}
          onClick={() => widgetOpen && setWidgetOpen(false)}
        />

        {/* AI Care 사이드 버튼 — 게임의 SHOP 아래 위치 (게임 자체 UI와 어울리게) */}
        {!widgetOpen && (
          <button
            onClick={() => setWidgetOpen(true)}
            className="group absolute right-2 top-[34%] flex flex-col items-center gap-1"
            aria-label="Open AI Care"
          >
            <div className="relative">
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 z-10 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-white shadow">
                  {pendingCount}
                </span>
              )}
              {/* 외곽 골드 링 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 blur-md opacity-70 group-hover:opacity-100 animate-pulse" />
              {/* 본체 — 게임 SHOP/Wild 버튼 톤 */}
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-300 via-blue-500 to-indigo-700 ring-[3px] ring-amber-300 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">🎧</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[9px] font-extrabold text-stone-900 tracking-wider shadow-md ring-1 ring-amber-300/60">
              AI CARE
            </span>
          </button>
        )}

        {/* AI Care 위젯 모달 레이어 — 세로 화면에 꽉 채우기 */}
        {widgetOpen && (
          <div
            className="absolute inset-0 flex items-end sm:items-center justify-center p-2 sm:p-3 animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setWidgetOpen(false)}
          >
            <div
              className="relative w-full max-h-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <UserWidget
                userId={userId}
                language={language}
                onClose={() => setWidgetOpen(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 게임 뷰포트 외부 — 데모 안내 */}
      <div className="mt-3 text-center text-[11px] text-white/60">
        {!widgetOpen ? (
          <>오른쪽 사이드의 <b className="text-amber-300">🎧 AI CARE</b> 버튼을 눌러보세요</>
        ) : (
          <>ESC 또는 바깥 클릭으로 닫기</>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}


// ============================================================
// USER WIDGET
// ============================================================

type UserView = { type: "home" } | { type: "form"; presetCategory?: string; presetBody?: string } | { type: "detail"; ticketId: string };

function UserWidget({
  userId,
  language,
  onClose,
}: {
  userId: string;
  language: "ko" | "en" | "ja";
  onClose?: () => void;
}) {
  const [view, setView] = useState<UserView>({ type: "home" });
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [profile, setProfile] = useState<ProfileLite | null>(null);

  async function refreshTickets() {
    try {
      const res = await fetch(`/api/tickets?userId=${userId}`, { cache: "no-store" });
      const data = await res.json();
      setMyTickets(data.tickets ?? []);
    } catch {}
  }

  useEffect(() => {
    refreshTickets();
    fetch(`/api/me?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => setProfile(d.profile ?? null))
      .catch(() => {});
    setView({ type: "home" });
  }, [userId]);

  return (
    <div className="mx-auto w-full rounded-2xl bg-white shadow-[0_0_0_3px_rgba(251,191,36,0.85),0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-full flex flex-col">
      <div className="relative shrink-0">
        <GameWidgetHeader profile={profile} />
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white flex items-center justify-center text-sm ring-2 ring-amber-300 shadow-lg transition-all"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {view.type === "home" && (
          <Home
            language={language}
            tickets={myTickets}
            onOpenForm={(cat, body) =>
              setView({ type: "form", presetCategory: cat, presetBody: body })
            }
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

function GameWidgetHeader({ profile }: { profile: ProfileLite | null }) {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 py-3 text-white overflow-hidden border-b-2 border-amber-400/60">
      {/* 배경 장식 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(56,189,248,0.25),_transparent_60%)]" />
      <div className="absolute -top-4 -right-4 text-6xl opacity-10">❄️</div>
      <div className="relative flex items-center justify-between gap-2 pr-8">
        <div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-amber-300 font-semibold flex items-center gap-1">
            ⚔️ Pixel Heroes
          </div>
          <div className="text-sm font-bold mt-0.5 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent">
            AI CARE — 고객지원
          </div>
        </div>
        {profile && (
          <div className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-2 py-1 ring-1 ring-white/30">
            <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">
              {profile.displayName.slice(0, 1)}
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-semibold flex items-center gap-1">
                {profile.displayName}
                {profile.banned && (
                  <span className="text-[7px] px-1 py-0.5 rounded bg-red-500/40">BAN</span>
                )}
              </div>
              <div className="text-[8px] opacity-80">
                {profile.mainCharacter
                  ? `Lv.${profile.mainCharacter.level} ${profile.mainCharacter.class}`
                  : "—"}
              </div>
            </div>
          </div>
        )}
      </div>
      {profile && (
        <div className="relative mt-2.5 grid grid-cols-3 gap-1.5 text-[9px]">
          <div className="rounded-md bg-white/10 backdrop-blur px-1.5 py-1 ring-1 ring-white/20">
            <div className="opacity-70">진행도</div>
            <div className="font-medium truncate">{profile.progress.questStep || "—"}</div>
          </div>
          <div className="rounded-md bg-white/10 backdrop-blur px-1.5 py-1 ring-1 ring-white/20">
            <div className="opacity-70">길드</div>
            <div className="font-medium truncate">{profile.progress.guild || "없음"}</div>
          </div>
          <div className="rounded-md bg-white/10 backdrop-blur px-1.5 py-1 ring-1 ring-white/20">
            <div className="opacity-70">지갑</div>
            <div className="font-mono text-[8px]">{profile.walletShort || "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Home({
  language,
  tickets,
  onOpenForm,
  onOpenTicket,
}: {
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
            className="w-full rounded-xl border border-neutral-300 px-11 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
        </div>

        {faqs.length > 0 && !selectedFaq && (
          <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
            <div className="px-3 py-1.5 text-[10px] text-neutral-500 bg-neutral-100 border-b border-neutral-200">
              💡 빠른 도움말 ({faqs.length}건)
            </div>
            {faqs.map((f) => (
              <button
                key={f.slug}
                onClick={() => setSelectedFaq(f)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-white border-b border-neutral-200 last:border-b-0"
              >
                <div className="font-medium text-neutral-800">{f.title}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  {f.layer === "cross" ? "🔵 CROSS 표준" : "🟢 게임별"} · {f.version}
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedFaq && (
          <div className="mt-3 rounded-xl border border-blue-300 bg-blue-50 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium text-sm text-neutral-800">{selectedFaq.title}</div>
              <button
                onClick={() => setSelectedFaq(null)}
                className="text-xs text-neutral-500 hover:text-neutral-800"
              >
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
                className="flex-1 rounded-lg bg-green-600 text-white text-xs py-2 hover:bg-green-700 font-medium"
              >
                ✓ 해결됐어요
              </button>
              <button
                onClick={() => onOpenForm(selectedFaq.category, q)}
                className="flex-1 rounded-lg border border-neutral-300 text-xs py-2 hover:bg-white font-medium"
              >
                도움 더 필요해요
              </button>
            </div>
          </div>
        )}

        {q.trim().length >= 2 && faqs.length === 0 && (
          <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-500">
            검증된 가이드가 없어요.{" "}
            <button
              onClick={() => onOpenForm(undefined, q)}
              className="text-blue-600 underline font-medium"
            >
              정식 문의로 작성
            </button>
          </div>
        )}
      </div>

      {/* Category quick start */}
      {!selectedFaq && (
        <div>
          <div className="text-xs text-neutral-500 mb-2 font-medium">또는 카테고리 선택</div>
          <div className="grid grid-cols-5 gap-2">
            {SCENARIOS.map((s) => {
              const cat = CAT_LABELS[s.category] ?? CAT_LABELS.account;
              return (
                <button
                  key={s.id}
                  onClick={() => onOpenForm(s.category, s.samples[language])}
                  className={`flex flex-col items-center gap-1 rounded-xl ${cat.bg} px-2 py-3 ring-2 ${cat.ring}/40 hover:${cat.ring} hover:scale-105 transition-all shadow-sm`}
                  title={s.description}
                >
                  <span className="text-2xl drop-shadow-sm">{s.icon}</span>
                  <span className={`text-[10px] ${cat.text} text-center leading-tight font-bold`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* My tickets */}
      {tickets.length > 0 && (
        <div>
          <div className="text-xs text-neutral-500 mb-2 font-medium flex items-center justify-between">
            <span>📋 내 문의 ({tickets.length}건)</span>
            <span className="text-[10px] text-neutral-400">최근순</span>
          </div>
          <div className="space-y-1.5">
            {tickets.slice(0, 6).map((t) => (
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
  const cat = CAT_LABELS[ticket.category] ?? CAT_LABELS.account;
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-neutral-200 bg-white px-3 py-2.5 hover:border-indigo-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-lg ${cat.bg} rounded-lg w-8 h-8 flex items-center justify-center`}>
            {cat.icon}
          </span>
          <div className="min-w-0">
            <div className="text-xs font-medium text-neutral-800 truncate">{ticket.subject}</div>
            <div className="text-[10px] text-neutral-400 font-mono">{ticket.id}</div>
          </div>
        </div>
        <span className={`text-[10px] ${status.color} whitespace-nowrap ml-2 font-medium`}>
          {status.icon} {status.label}
        </span>
      </div>
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
      else alert(`문의 제출 실패: ${data.error ?? "unknown"} ${data.detail ?? ""}`);
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

      <div className="text-sm font-semibold">📝 문의 작성</div>

      <div>
        <label className="text-xs text-neutral-500 mb-1.5 block font-medium">카테고리</label>
        <div className="grid grid-cols-5 gap-1.5">
          {Object.entries(CAT_LABELS).map(([key, { label, icon, bg, text }]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`rounded-xl border-2 px-2 py-2.5 text-[11px] transition-all ${
                category === key
                  ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                  : `border-transparent ${bg}`
              }`}
            >
              <div className="text-lg">{icon}</div>
              <div className={`mt-0.5 ${text} font-medium`}>{label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-neutral-500 mb-1.5 block font-medium">제목</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="간단한 제목"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="text-xs text-neutral-500 mb-1.5 block font-medium">
          내용
          {samples && !body && (
            <button
              onClick={() => setBody(samples)}
              className="ml-2 text-blue-600 hover:underline font-normal"
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
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800">
        ⚠️ AI가 먼저 검토해 1차 답변하거나, 사람 검토가 필요한 경우 담당팀에 전달됩니다.
        <br />
        담당팀 처리는 비실시간이며 구체적인 시간은 약속하지 않습니다.
      </div>

      <button
        onClick={submit}
        disabled={submitting || !subject.trim() || !body.trim()}
        className="w-full rounded-xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 text-stone-900 py-3 text-sm font-extrabold tracking-wide ring-2 ring-amber-300 shadow-lg hover:from-amber-300 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-white/50 animate-pulse" />
            AI 처리 중...
          </span>
        ) : (
          "문의 제출"
        )}
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
  const cat = CAT_LABELS[ticket.category] ?? CAT_LABELS.account;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-neutral-500 hover:text-neutral-800">
        ← 내 문의 목록
      </button>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-lg ${cat.bg} rounded-lg w-9 h-9 flex items-center justify-center`}>
            {cat.icon}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{ticket.subject}</div>
            <div className="text-[10px] text-neutral-400 font-mono">{ticket.id}</div>
          </div>
        </div>
        <span className={`text-xs ${status.color} whitespace-nowrap font-medium`}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* 내 문의 */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
        <div className="text-[10px] text-neutral-500 mb-1 flex items-center gap-1">
          📝 내 문의 · {new Date(ticket.createdAt).toLocaleString()}
        </div>
        <div className="text-sm text-neutral-800 whitespace-pre-wrap">{ticket.body}</div>
      </div>

      {/* AI 응답 */}
      {ticket.aiResponse && (
        <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-3.5">
          <div className="text-[10px] text-blue-700 mb-1.5 flex items-center gap-1 font-medium">
            🤖 AI 응답 {ticket.language && <span className="opacity-70">· {ticket.language.name}</span>}
          </div>
          <div className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
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
                AI가 사용한 툴 ({ticket.aiResponse.toolCalls.length}개)
              </summary>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {ticket.aiResponse.toolCalls.map((tc, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-white border border-blue-200 px-1.5 py-0.5 text-[10px] font-mono"
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
        <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-3.5">
          <div className="flex items-center gap-2 text-sm text-orange-800 font-semibold">
            ⏳ 사람 검토 중
          </div>
          <div className="mt-1.5 text-xs text-orange-700">
            {QUEUE_LABELS[ticket.escalation.queue]?.label ?? ticket.escalation.queue} 으로 전달됨
            {ticket.escalation.priority === "high" && (
              <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                ⚠ HIGH
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-orange-700">
            처리 대기 중입니다. 처리되는 대로 안내드릴게요. 구체적인 시간은 약속하지 않습니다.
          </div>
        </div>
      )}

      {ticket.status === "answered" && !ticket.escalation && (
        <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-3.5 text-xs text-green-800">
          ✓ AI가 답변했어요. 도움이 됐나요?
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
        <div className="border-r border-neutral-200 p-3 space-y-2 overflow-y-auto max-h-[600px]">
          {tickets.length === 0 && (
            <div className="text-center text-neutral-400 text-sm pt-12">
              아직 큐가 비어있습니다.
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
                    {QUEUE_LABELS[selected.escalation.queue]?.label} ·{" "}
                    {selected.escalation.priority}
                  </div>
                  <div className="mt-0.5 text-neutral-600">사유: {selected.escalation.reason}</div>
                  {selected.escalation.summary && (
                    <div className="mt-1 bg-neutral-50 border border-neutral-200 rounded p-2 whitespace-pre-wrap">
                      {selected.escalation.summary}
                    </div>
                  )}
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
                        className="rounded bg-white border border-neutral-200 px-1.5 py-0.5 text-[10px] font-mono"
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
