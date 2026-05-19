export type Scenario = {
  id: string;
  icon: string;
  label: string;
  category: string;
  samples: Record<"ko" | "en" | "ja", string>;
  showsCitation: boolean;
  showsEscalation: boolean;
  showsCrossTenant?: boolean;
  showsOnChain?: boolean;
  description: string;
};

export const SCENARIOS: Scenario[] = [
  {
    id: "refund",
    icon: "💳",
    label: "결제 환불",
    category: "account",
    samples: {
      ko: "5월 10일에 결제한 49.99달러 프리미엄 번들 환불해주세요.",
      en: "Please refund the $49.99 Premium Bundle I bought on May 10.",
      ja: "5月10日に購入した49.99ドルのプレミアムバンドルを返金してください。",
    },
    showsCitation: true,
    showsEscalation: true,
    description: "프로파일에서 결제 이력 자동 조회 → 환불은 결제팀으로 이관 (AI 직접 환불 X)",
  },
  {
    id: "faq",
    icon: "🎮",
    label: "게임 진행 막힘",
    category: "faq",
    samples: {
      ko: "용병 5명 모았는데 다음 퀘스트가 안 열려요.",
      en: "I gathered 5 mercenaries but the next quest won't unlock.",
      ja: "傭兵を5人集めたのに、次のクエストが開きません。",
    },
    showsCitation: true,
    showsEscalation: false,
    description: "지식베이스 검색 + 출처 인용 답변 (자동 해결)",
  },
  {
    id: "bug",
    icon: "🐛",
    label: "클라이언트 크래시",
    category: "bug",
    samples: {
      ko: "던전 3 보스 페이즈에서 자꾸 게임이 튕겨요. 빌드 1.4.2 입니다.",
      en: "The game keeps crashing at Dungeon 3 boss phase. Build 1.4.2.",
      ja: "ダンジョン3のボスフェーズでゲームが落ちます。ビルド1.4.2です。",
    },
    showsCitation: false,
    showsEscalation: true,
    description: "디바이스/로그 자동 수집 + 개발팀 큐 적재",
  },
  {
    id: "abuse",
    icon: "🚨",
    label: "다른 유저 신고",
    category: "abuse",
    samples: {
      ko: "PlayerX 라는 유저가 매크로 쓰는 것 같아요. 오늘 오후 길드전에서 봤습니다.",
      en: "User PlayerX seems to be using a macro. I saw it in the guild war this afternoon.",
      ja: "PlayerXというユーザーがマクロを使っているようです。今日のギルド戦で見ました。",
    },
    showsCitation: false,
    showsEscalation: true,
    description: "AI는 신고 내용 판단 안 함, 인테이크만 → 모더 큐 직행",
  },
  {
    id: "onchain",
    icon: "🔗",
    label: "온체인 (Web3 차별축)",
    category: "onchain",
    samples: {
      ko: "민팅 트랜잭션 0xAb12 가 5분째 안 들어와요. 어떻게 되고 있나요?",
      en: "My mint transaction 0xAb12 hasn't synced for 5 minutes. What's the status?",
      ja: "ミントトランザクション0xAb12が5分間同期されません。状況はどうですか?",
    },
    showsCitation: true,
    showsEscalation: false,
    showsOnChain: true,
    description: "지갑 + tx 상태 직접 조회 (경쟁사가 못 하는 영역)",
  },
];

export const DEMO_USERS = [
  {
    id: "demo-user-001",
    label: "DemoPlayer (정상 유저, 결제 이력 있음)",
  },
  {
    id: "demo-user-002",
    label: "ShadowFox (밴 이력 있음)",
  },
];
