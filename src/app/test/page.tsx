"use client";

import { useRef, useState } from "react";

type ToolCall = { name: string; input: unknown; output: unknown };
type AgentResponse = {
  reply: string;
  category: string;
  language: { iso: string; name: string };
  toolCalls: ToolCall[];
  escalated: boolean;
};

type Turn =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; meta?: AgentResponse };

const DEMO_IDENTITIES = [
  { label: "None", firebaseSub: "", gameUuid: "" },
  { label: "Firebase: demo-user-001 (clean)", firebaseSub: "demo-user-001", gameUuid: "" },
  { label: "Game UUID: GU-9F2A (banned)", firebaseSub: "", gameUuid: "GU-9F2A" },
];

export default function TestPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [identityIdx, setIdentityIdx] = useState(1);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Turn[] = [...turns, { role: "user", content: text }];
    setTurns(next);
    setInput("");
    setLoading(true);

    const id = DEMO_IDENTITIES[identityIdx];
    const history = turns.map((t) => ({
      role: t.role,
      content: t.content,
    }));

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          channel: "test",
          text,
          identity:
            id.firebaseSub || id.gameUuid
              ? { firebaseSub: id.firebaseSub || undefined, gameUuid: id.gameUuid || undefined }
              : null,
          conversationHistory: history,
        }),
      });
      const data: AgentResponse | { error: string; detail?: string } = await res.json();
      if ("error" in data) {
        setTurns([
          ...next,
          { role: "assistant", content: `[error] ${data.error}: ${data.detail ?? ""}` },
        ]);
      } else {
        setTurns([...next, { role: "assistant", content: data.reply, meta: data }]);
      }
    } catch (e) {
      setTurns([
        ...next,
        { role: "assistant", content: `[network error] ${(e as Error).message}` },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 font-sans">
      <h1 className="text-xl font-semibold">CS Agent — Test Console</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Local end-to-end test for the agent core. Identity is mocked.
      </p>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <label className="text-neutral-600">Identity:</label>
        <select
          className="rounded border border-neutral-300 bg-white px-2 py-1"
          value={identityIdx}
          onChange={(e) => setIdentityIdx(Number(e.target.value))}
        >
          {DEMO_IDENTITIES.map((d, i) => (
            <option key={d.label} value={i}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 min-h-[300px]">
        {turns.length === 0 && (
          <div className="text-sm text-neutral-400">
            Try: &quot;5월 10일 결제 환불 받고 싶어요&quot; · &quot;게임이 던전에서 자꾸 튕겨요&quot;
            · &quot;PlayerX가 매크로 쓰는 것 같아요&quot;
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={t.role === "user" ? "text-right" : ""}>
            <div
              className={
                "inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap " +
                (t.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-neutral-200")
              }
            >
              {t.content}
            </div>
            {t.role === "assistant" && t.meta && (
              <details className="mt-1 text-xs text-neutral-500">
                <summary className="cursor-pointer">
                  category: <b>{t.meta.category}</b> · lang:{" "}
                  <b>{t.meta.language.name}</b>
                  {t.meta.escalated && " · ⚑ escalated"}
                  {t.meta.toolCalls.length > 0 &&
                    ` · tools: ${t.meta.toolCalls.map((c) => c.name).join(", ")}`}
                </summary>
                <pre className="mt-1 overflow-x-auto rounded bg-neutral-100 p-2">
                  {JSON.stringify(t.meta.toolCalls, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
        {loading && (
          <div className="text-xs text-neutral-400">agent thinking…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm"
          placeholder="Type a customer message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
