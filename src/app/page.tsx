import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 font-sans">
      <h1 className="text-3xl font-semibold tracking-tight">CS Agent</h1>
      <p className="mt-2 text-neutral-600">
        AI-powered customer support center for live online games.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/test"
          className="rounded-lg border border-neutral-200 p-4 transition hover:border-neutral-400"
        >
          <div className="font-medium">Test Console →</div>
          <div className="mt-1 text-sm text-neutral-500">
            End-to-end chat with mocked identity. M1 verification surface.
          </div>
        </Link>
        <div className="rounded-lg border border-dashed border-neutral-300 p-4 opacity-60">
          <div className="font-medium">Admin Dashboard</div>
          <div className="mt-1 text-sm text-neutral-500">M6 — ticket review, escalation queue.</div>
        </div>
      </div>

      <section className="mt-10 text-sm text-neutral-600">
        <h2 className="font-medium text-neutral-900">Channels</h2>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Discord bot — M3</li>
          <li>In-game SDK (REST + HMAC) — M4</li>
          <li>Email (inbound webhook) — M5</li>
        </ul>
      </section>
    </main>
  );
}
