# CS Agent

AI-powered customer support center for live online games. Built on Next.js + Claude API.

## Status — M1 complete

- Next.js (App Router, TS, Tailwind) bootstrap
- Drizzle ORM schema for tickets / messages / escalations / knowledge docs
- Agent Core: category classifier → routed system prompt → tool-use loop
- 4 read-only tools + 1 escalation tool
- Mock game API (Firebase Sub / Game UUID identity)
- Local test console at `/test`

Next milestones: M2 real game API + KB · M3 Discord · M4 SDK · M5 email · M6 admin dashboard.

## Quick start

```bash
cp .env.example .env.local
# set ANTHROPIC_API_KEY in .env.local

pnpm dev
# open http://localhost:3000/test
```

The test console ships with two demo identities:

- `Firebase: demo-user-001` — clean account with one completed payment and one refunded payment
- `Game UUID: GU-9F2A` — banned account (macro detection)

Try these prompts:

- 한국어: `5월 10일에 결제한 49.99 달러 환불해주세요` → triggers `payment_history` + `escalate_to_human`
- English: `My client crashes every time I enter dungeon 03` → triggers `log_fetch` + `escalate_to_human`
- 中文: `有玩家在用宏，名字是 PlayerX` → abuse intake + escalate

## Architecture

```
src/
  lib/
    agent/
      orchestrator.ts        main run loop (classify → system prompt → tools)
      claude.ts              Anthropic client
      language.ts            franc-based language detection
      prompts/
        system.ts            base prompt + per-category guides
        classifier.ts        single-token category classifier
      tools/
        definitions.ts       Anthropic tool schemas
        run.ts               dispatcher → game API / escalation
    channels/                M3-M5 channel adapters (Discord/SDK/email)
    gameapi/
      client.ts              GameApiClient interface (real or mock)
      mock.ts                in-memory fixtures
      identity.ts            Firebase Sub | Game UUID
    db/                      Drizzle schema (not yet wired to runtime)
    env.ts                   zod-validated env
  app/
    api/agent/chat/route.ts  POST /api/agent/chat
    test/page.tsx            local test console
```

## Identity model

Every channel adapter normalizes incoming messages into one identity:

- `firebaseSub` — Firebase Auth subject (verified server-side via Firebase Admin in M2+)
- `gameUuid` — UUID passed by the game developer (HMAC-signed in M4 SDK adapter)

Tools default to whichever identity is present, but the model can override per-call (e.g. an agent looking up a different reported player in an abuse case).

## DB migrations

Schema is defined but DB connection is optional in M1.

```bash
# once DATABASE_URL is set
pnpm db:generate     # create migration from schema
pnpm db:push         # push schema directly (dev only)
pnpm db:studio       # browse data
```

## Safety guarantees

- All tools are **read-only** against the game backend. The only writing tool is `escalate_to_human`, which appends to an internal queue.
- Mutating user requests (refunds, password resets, bans/unbans, inventory grants) always escalate.
- Safety-sensitive content (self-harm, threats, legal) escalates with `priority: high`.
- The agent must cite tool-derived facts before claiming them; the system prompt forbids inventing gameplay guides when KB returns no hits.
