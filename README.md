# CROSS AI Care — 프로토타입

게임 고객지원 AI 데모. 한 화면에서 **유저 위젯 ↔ 운영자 큐**를 동시에 보면서 핵심 가치를 한눈에 확인.

## 빠른 시작

```bash
cp .env.example .env.local
# .env.local 에 ANTHROPIC_API_KEY 채우기

pnpm dev
# http://localhost:3000
```

## 데모에서 보이는 것

- **AI 즉시 응답** (10초 이내) + **사람 처리는 비실시간** (큐 적재)
- **Profile-primary** — 결제·진행도·지갑 자동 조회 후 답변
- **Web3 컨텍스트** — tx 상태 직접 조회 (경쟁사 못 하는 영역)
- **citation 강제** — 출처 footer 표시
- **읽기 전용** — 환불·재지급은 무조건 사람 큐
- **다국어** — 한국어/영어/일본어 동일 응답
- **카테고리 분류** — 계정·FAQ·버그·신고·온체인

## 시나리오 (버튼 클릭 → 자동 데모)

| 버튼 | 보여주는 것 |
|---|---|
| 💳 결제 환불 | payment_history 툴 → 결제팀 큐 |
| 🎮 게임 진행 막힘 | kb_search 툴 → 출처 인용 답변 (자동 해결) |
| 🐛 클라이언트 크래시 | log_fetch 툴 → tenant 큐 → 개발팀 |
| 🚨 다른 유저 신고 | 인테이크만 → 모더 큐 (high priority) |
| 🔗 온체인 (Web3) | onchain_tx_status 툴 → INFRA 큐 (실패 시) |

## 구조

```
src/
├── app/
│   ├── page.tsx              데모 UI (분할 화면)
│   └── api/
│       ├── chat/route.ts     POST — Agent 실행
│       └── queue/route.ts    GET·DELETE — 큐 조회·초기화
└── lib/
    ├── agent/
    │   ├── orchestrator.ts   분류 → 시스템 프롬프트 → tool-use 루프
    │   ├── tools.ts          5개 툴 (mock 구현)
    │   ├── prompts.ts        카테고리별 시스템 프롬프트
    │   ├── language.ts       franc 자동 언어 감지
    │   └── types.ts
    ├── mock/
    │   ├── profiles.ts       유저 2명 (DemoPlayer, ShadowFox)
    │   └── kb.ts             지식베이스 8개 (CROSS + tenant)
    ├── store/queue.ts        in-memory 큐 (사람 처리 대기)
    └── scenarios.ts          5개 데모 시나리오 + 다국어 샘플
```

## Mock 데이터

- **DemoPlayer** (`demo-user-001`) — 정상 유저. 결제 3건, 지갑·민팅 이력, 던전3 크래시 로그
- **ShadowFox** (`demo-user-002`) — 매크로 사용 적발로 밴 상태

## 외부 의존성 (모두 mock)

| 실제 서비스 | 데모에서 |
|---|---|
| CORE-001 Profile Store | `src/lib/mock/profiles.ts` 가짜 데이터 |
| 게임사 백엔드 API | 동상 |
| Sentinel | 미구현 (mock) |
| Hub Builder RBAC | 단순 user select |
| Discord / 이메일 채널 | 위젯만 (Discord·이메일 미포함) |

## 기술 스택

- Next.js 16 (App Router, Turbopack)
- TypeScript, Tailwind CSS 4
- Claude API (Sonnet 4.6 답변, Haiku 4.5 분류)
- in-memory queue (재시작 시 초기화)

## 관련 문서

기획서는 저장소 루트와 `docs/` 에 있습니다:

- `PRD.md` — 요구사항 정의서
- `SIMPLE_PRD.md` — 한 페이지 요약
- `DECISIONS.md` — 결정 사항 로그
- `INDEX.md` — 문서 인덱스
- Confluence: https://tonexus.atlassian.net/wiki/spaces/crossdev/folder/331677744
