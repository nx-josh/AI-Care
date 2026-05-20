import type { Ticket } from "@/lib/store/tickets";
import { nanoid } from "@/lib/nanoid";

let seeded = false;

export function getSeedTickets(): Ticket[] {
  if (seeded) return [];
  seeded = true;

  const now = Date.now();
  const ago = (m: number) => new Date(now - m * 60 * 1000).toISOString();

  const seed: Ticket[] = [
    {
      id: `T-${nanoid(8).toUpperCase()}`,
      status: "pending_human",
      category: "account",
      subject: "5월 10일 결제 환불 요청",
      body: "5월 10일에 결제한 49.99달러 프리미엄 번들 환불 부탁드립니다. 실수로 결제했어요.",
      language: { iso: "kor", name: "Korean" },
      userId: "demo-user-001",
      userName: "DemoPlayer",
      createdAt: ago(15),
      updatedAt: ago(15),
      aiResponse: {
        text:
          "확인해드릴게요. 5월 10일 49.99 USD 'Premium Bundle' 결제 내역 조회됐어요 (status: completed). 환불은 결제팀이 직접 검토·처리하므로 담당팀으로 전달했습니다. 처리 대기 중입니다.\n[출처: CROSS Refund Policy v1.2 §3.1]",
        citations: ["[출처: CROSS Refund Policy v1.2 §3.1]"],
        toolCalls: [
          { name: "payment_history", input: { limit: 10 }, output: { status: "ok" } },
          {
            name: "escalate_to_human",
            input: { queue: "payment", priority: "normal", reason: "refund_request" },
            output: { queued: true },
          },
        ],
      },
      escalation: {
        queue: "payment",
        priority: "normal",
        reason: "refund_request",
        summary: "DemoPlayer가 5/10 결제 49.99 USD Premium Bundle 환불 요청. 결제 정상 완료 건.",
      },
    },
    {
      id: `T-${nanoid(8).toUpperCase()}`,
      status: "answered",
      category: "faq",
      subject: "용병 5명 모았는데 다음 퀘스트가 안 열려요",
      body: "용병 5명을 다 모집했는데 챕터 3-3 퀘스트가 활성화되지 않아요. 어떻게 해야 하나요?",
      language: { iso: "kor", name: "Korean" },
      userId: "demo-user-001",
      userName: "DemoPlayer",
      createdAt: ago(45),
      updatedAt: ago(45),
      aiResponse: {
        text:
          "용병 5명 모집 후 길드 NPC '루카스'와 대화해야 다음 퀘스트가 활성화됩니다. 길드(Dawnbreakers)에 이미 가입되어 있으니 마을 광장의 루카스를 찾아주세요.\n[출처: Pixel Heroes FAQ v0.3 §2.4]",
        citations: ["[출처: Pixel Heroes FAQ v0.3 §2.4]"],
        toolCalls: [
          {
            name: "user_lookup",
            input: {},
            output: { progress: { questStep: "Chapter 3-2", guild: "Dawnbreakers" } },
          },
          { name: "kb_search", input: { query: "용병 5명 다음 퀘스트" }, output: { results: 1 } },
        ],
      },
    },
    {
      id: `T-${nanoid(8).toUpperCase()}`,
      status: "pending_human",
      category: "bug",
      subject: "던전 3 보스 페이즈에서 게임이 튕겨요",
      body:
        "던전 3 보스 페이즈 진입할 때마다 클라이언트가 강제 종료됩니다. iOS 18.2 빌드 1.4.2 사용 중입니다.",
      language: { iso: "kor", name: "Korean" },
      userId: "demo-user-001",
      userName: "DemoPlayer",
      createdAt: ago(120),
      updatedAt: ago(120),
      aiResponse: {
        text:
          "크래시 확인했어요. 빌드 1.4.2 · iOS 18.2 환경에서 dungeon_03 보스 페이즈 진입 시 client_crash 이벤트가 잡혔습니다 (08:55:30Z). 동일 빌드 알려진 이슈로 보여 개발팀에 정식 접수했습니다.\n[출처: 던전 3 알려진 이슈 v1.0 §임시]",
        citations: ["[출처: 던전 3 알려진 이슈 v1.0 §임시]"],
        toolCalls: [
          { name: "log_fetch", input: { sinceMinutes: 30 }, output: { events: 3 } },
          {
            name: "escalate_to_human",
            input: { queue: "tenant", priority: "normal", reason: "bug_repro" },
            output: { queued: true },
          },
        ],
      },
      escalation: {
        queue: "tenant",
        priority: "normal",
        reason: "bug_repro",
        summary:
          "DemoPlayer · 빌드 1.4.2 iOS 18.2 · dungeon_03 보스 페이즈 진입 시 client_crash. 1.4.3 패치 대상으로 추정.",
      },
    },
    {
      id: `T-${nanoid(8).toUpperCase()}`,
      status: "pending_human",
      category: "abuse",
      subject: "PlayerX가 매크로 쓰는 것 같아요",
      body:
        "오늘 길드전에서 PlayerX 라는 유저가 매크로를 쓰는 것 같습니다. 입력 패턴이 너무 일정해요. 동영상 첨부합니다.",
      language: { iso: "kor", name: "Korean" },
      userId: "demo-user-001",
      userName: "DemoPlayer",
      createdAt: ago(240),
      updatedAt: ago(240),
      aiResponse: {
        text:
          "신고 접수됐어요. 모더팀이 비공개로 검토하며, 결과는 별도로 공유되지 않는 점 양해 부탁드립니다. 안전한 게임 환경을 위해 신고해주셔서 감사합니다.",
        citations: [],
        toolCalls: [
          {
            name: "escalate_to_human",
            input: { queue: "moderation", priority: "normal", reason: "macro_report" },
            output: { queued: true },
          },
        ],
      },
      escalation: {
        queue: "moderation",
        priority: "normal",
        reason: "macro_report",
        summary:
          "신고자 DemoPlayer · 피신고자 PlayerX · 길드전 매크로 의심 · 동영상 증거 첨부. AI 판단 안 함, 모더팀 검토 필요.",
      },
    },
    {
      id: `T-${nanoid(8).toUpperCase()}`,
      status: "answered",
      category: "onchain",
      subject: "민팅 트랜잭션 0xAb12 가 안 들어와요",
      body: "민팅 트랜잭션 0xAb12cd34 가 5분째 인게임에 동기화되지 않아요. 어떻게 됐나요?",
      language: { iso: "kor", name: "Korean" },
      userId: "demo-user-001",
      userName: "DemoPlayer",
      createdAt: ago(8),
      updatedAt: ago(8),
      aiResponse: {
        text:
          "확인했어요. 트랜잭션 0xAb12cd34...556677 현재 상태: pending (가스비 0.0012 ETH). 네트워크 혼잡으로 보통 5-10분 안에 confirmed 됩니다. 30분 초과 시 다시 알려주시면 INFRA팀에 이관해드릴게요.\n[출처: 트랜잭션 pending 안내 v1.0 §4.2 Mint Sync]",
        citations: ["[출처: 트랜잭션 pending 안내 v1.0 §4.2 Mint Sync]"],
        toolCalls: [
          { name: "onchain_tx_status", input: { txHash: "0xAb12cd34" }, output: { status: "pending" } },
        ],
      },
    },
    {
      id: `T-${nanoid(8).toUpperCase()}`,
      status: "pending_human",
      category: "account",
      subject: "비밀번호 분실 + 누군가 로그인 시도한 것 같아요",
      body:
        "비밀번호를 잊어버렸는데 어제 새벽 알 수 없는 디바이스에서 로그인 시도 알림이 왔어요. 계정 해킹이 의심됩니다.",
      language: { iso: "kor", name: "Korean" },
      userId: "demo-user-002",
      userName: "ShadowFox",
      createdAt: ago(3),
      updatedAt: ago(3),
      aiResponse: {
        text:
          "보안 이슈로 의심되어 우선순위 high로 결제·보안 담당팀에 즉시 전달했습니다. 우선 가능하시면 다른 디바이스에서 모든 활성 세션을 종료해주세요. 본인 인증 후 비밀번호 재설정과 보안 점검을 담당팀이 도와드릴게요.",
        citations: [],
        toolCalls: [
          { name: "user_lookup", input: {}, output: { banned: true } },
          {
            name: "escalate_to_human",
            input: { queue: "payment", priority: "high", reason: "account_hacked_suspected" },
            output: { queued: true },
          },
        ],
      },
      escalation: {
        queue: "payment",
        priority: "high",
        reason: "account_hacked_suspected",
        summary:
          "ShadowFox 계정 해킹 의심 + 비밀번호 분실. 본인 인증 후 비밀번호 재설정 + 활성 세션 강제 종료 필요. 기존 밴 이력 있음.",
      },
    },
  ];

  return seed;
}
