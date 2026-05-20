export type KBDoc = {
  slug: string;
  title: string;
  layer: "tenant" | "cross";
  category: "account" | "faq" | "bug" | "abuse" | "onchain";
  version: string;
  section: string;
  body: string;
  keywords: string[];
  injectedAt?: string;
  docType?: "spec" | "faq" | "policy";
};

const SEED_DOCS: KBDoc[] = [
  {
    slug: "refund-policy-cross",
    title: "CROSS 표준 환불 정책",
    layer: "cross",
    category: "account",
    version: "v1.2",
    section: "§3.1 환불 가능 조건",
    body: "구매 후 7일 이내, 미사용 상태, 정상 결제 완료된 경우 환불 가능합니다. 모든 환불은 결제팀이 직접 검토 후 처리합니다. AI는 환불을 약속하지 않습니다.",
    keywords: ["환불", "refund", "결제", "payment"],
  },
  {
    slug: "payment-failed-troubleshooting",
    title: "결제 실패 트러블슈팅",
    layer: "cross",
    category: "account",
    version: "v1.0",
    section: "§2",
    body: "결제 실패는 카드사 한도 초과, 잔액 부족, 또는 카드사 승인 거부로 발생합니다. 카드사 한도/잔액을 먼저 확인하고, 그래도 안 되면 결제팀에 문의해주세요.",
    keywords: ["결제 실패", "payment failed"],
  },
  {
    slug: "tx-pending-explained",
    title: "트랜잭션 pending 안내",
    layer: "cross",
    category: "onchain",
    version: "v1.0",
    section: "§4.2 Mint Sync",
    body: "트랜잭션이 pending이면 네트워크 혼잡 또는 가스비 부족일 가능성이 있습니다. 5분 이내 자동 동기화되며, 30분 초과 시 INFRA팀에 문의해주세요.",
    keywords: ["pending", "tx", "트랜잭션", "민팅"],
  },
  {
    slug: "seed-phrase-safety",
    title: "지갑 시드 구절 보안",
    layer: "cross",
    category: "onchain",
    version: "v1.0",
    section: "§1",
    body: "CS Agent는 시드 구절을 절대 묻지 않습니다. 시드를 누군가 요구하면 사기입니다. 시드가 노출되었다면 즉시 자산을 새 지갑으로 이체하세요.",
    keywords: ["시드", "seed phrase", "지갑"],
  },
  {
    slug: "mercenary-quest-chain",
    title: "용병 퀘스트 체인 가이드",
    layer: "tenant",
    category: "faq",
    version: "v0.3",
    section: "§2.4",
    body: "용병 5명을 모집한 뒤, 길드 NPC '루카스'와 대화해야 다음 퀘스트가 활성화됩니다. 길드에 가입되지 않은 상태에서는 활성화되지 않습니다.",
    keywords: ["용병", "퀘스트", "mercenary", "quest"],
  },
  {
    slug: "character-aria",
    title: "캐릭터 - 아리아",
    layer: "tenant",
    category: "faq",
    version: "v1.0",
    section: "§2.1",
    body: "아리아는 마법사 클래스의 프리미엄 캐릭터입니다. 시즌 패스 또는 5,000 다이아로 획득 가능합니다.",
    keywords: ["아리아", "Aria", "캐릭터"],
  },
  {
    slug: "season-pass-info",
    title: "시즌 패스 안내",
    layer: "tenant",
    category: "faq",
    version: "v0.3",
    section: "§5",
    body: "시즌 패스는 30일간 유효하며, 매일 보상을 수령할 수 있습니다. 미사용 보상은 시즌 종료 시 소멸됩니다.",
    keywords: ["시즌", "패스", "season pass"],
  },
  {
    slug: "dungeon-3-crashes",
    title: "던전 3 알려진 이슈",
    layer: "tenant",
    category: "bug",
    version: "v1.0",
    section: "§임시",
    body: "빌드 1.4.x에서 던전 3 보스 페이즈 진입 시 일부 디바이스에서 크래시 발생 보고. 1.4.3 패치에서 수정 예정.",
    keywords: ["던전3", "dungeon 3", "크래시", "crash"],
  },
];

export const KB_DOCS: KBDoc[] = [...SEED_DOCS];

function autoKeywords(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[#*`>\-_[\](){}.,!?;:]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && w.length <= 20);
  const freq: Record<string, number> = {};
  for (const t of tokens) freq[t] = (freq[t] ?? 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);
}

export type KBInjectInput = {
  title: string;
  body: string;
  layer: "tenant" | "cross";
  docType: "spec" | "faq" | "policy";
  category?: KBDoc["category"];
};

export function addKB(input: KBInjectInput): KBDoc {
  const cat: KBDoc["category"] = input.category ?? (input.docType === "policy" ? "account" : "faq");
  const slug = `injected-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const doc: KBDoc = {
    slug,
    title: input.title,
    layer: input.layer,
    category: cat,
    version: "v1.0",
    section: input.docType === "spec" ? "§기획서" : input.docType === "policy" ? "§정책" : "§FAQ",
    body: input.body,
    keywords: autoKeywords(`${input.title} ${input.body}`),
    injectedAt: new Date().toISOString(),
    docType: input.docType,
  };
  KB_DOCS.unshift(doc);
  return doc;
}

export function listInjectedKB(): KBDoc[] {
  return KB_DOCS.filter((d) => d.injectedAt).slice(0, 50);
}

type SearchResult = {
  doc: KBDoc;
  score: number;
};

export function searchKB(query: string, opts?: { category?: KBDoc["category"]; limit?: number }): SearchResult[] {
  const q = query.toLowerCase();
  const results: SearchResult[] = [];
  for (const doc of KB_DOCS) {
    if (opts?.category && doc.category !== opts.category) continue;
    let score = 0;
    for (const kw of doc.keywords) {
      if (q.includes(kw.toLowerCase())) score += 3;
    }
    if (doc.title.toLowerCase().includes(q)) score += 2;
    if (doc.body.toLowerCase().includes(q)) score += 1;
    if (score > 0) results.push({ doc, score });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, opts?.limit ?? 4);
}
