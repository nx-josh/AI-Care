export type Profile = {
  id: string;
  identityKind: "firebase_sub" | "game_uuid";
  identityValue: string;
  displayName: string;
  email: string;
  joinedAt: string;
  tenantId: string;
  banned: boolean;
  characters: Array<{ id: string; name: string; level: number; class: string }>;
  progress: {
    currentQuest: string;
    questStep: string;
    guild: string | null;
  };
  payments: Array<{
    id: string;
    date: string;
    amount: number;
    currency: string;
    product: string;
    status: "completed" | "pending" | "refunded" | "failed";
    deliveredInGame: boolean;
  }>;
  wallets: Array<{ chain: string; address: string }>;
  onChain: {
    mints: Array<{ tx: string; nft: string; status: "confirmed" | "pending" | "failed"; ts: string }>;
    recentTx: Array<{ tx: string; status: "confirmed" | "pending" | "failed"; ts: string; gasFee: string }>;
  };
  deviceContext: {
    build: string;
    os: string;
    locale: string;
    lastSession: string;
  };
};

export const PROFILES: Record<string, Profile> = {
  "demo-user-001": {
    id: "u_001",
    identityKind: "firebase_sub",
    identityValue: "demo-user-001",
    displayName: "DemoPlayer",
    email: "demo@example.com",
    joinedAt: "2025-08-12T03:21:00Z",
    tenantId: "pixel-heroes",
    banned: false,
    characters: [
      { id: "c_01", name: "Aria", level: 47, class: "Mage" },
      { id: "c_02", name: "Borin", level: 22, class: "Warrior" },
    ],
    progress: {
      currentQuest: "용병 5명 모집",
      questStep: "Chapter 3-2",
      guild: "Dawnbreakers",
    },
    payments: [
      {
        id: "pay_2026_0501",
        date: "2026-05-01T08:14:00Z",
        amount: 9.99,
        currency: "USD",
        product: "Starter Pack",
        status: "completed",
        deliveredInGame: true,
      },
      {
        id: "pay_2026_0510",
        date: "2026-05-10T19:02:00Z",
        amount: 49.99,
        currency: "USD",
        product: "Premium Bundle",
        status: "completed",
        deliveredInGame: true,
      },
      {
        id: "pay_2026_0515",
        date: "2026-05-15T11:30:00Z",
        amount: 4.99,
        currency: "USD",
        product: "Gem Pack S",
        status: "failed",
        deliveredInGame: false,
      },
    ],
    wallets: [{ chain: "Ethereum", address: "0xAb12cd34ef56789012345678901234567890c0d3" }],
    onChain: {
      mints: [
        {
          tx: "0xMint01ab12cd34ef56789012345678901234567890c0d3aabbccdd0011223344",
          nft: "Hero Card #4821",
          status: "confirmed",
          ts: "2026-05-18T10:00:00Z",
        },
      ],
      recentTx: [
        {
          tx: "0xAb12cd34ef56789012345678901234567890c0d3aabbccdd0011223344556677",
          status: "pending",
          ts: "2026-05-19T08:55:00Z",
          gasFee: "0.0012 ETH",
        },
      ],
    },
    deviceContext: {
      build: "1.4.2",
      os: "iOS 18.2",
      locale: "ko-KR",
      lastSession: "2026-05-19T08:30:00Z",
    },
  },
  "demo-user-002": {
    id: "u_002",
    identityKind: "game_uuid",
    identityValue: "GU-9F2A",
    displayName: "ShadowFox",
    email: "shadow@example.com",
    joinedAt: "2026-01-05T11:00:00Z",
    tenantId: "pixel-heroes",
    banned: true,
    characters: [{ id: "c_11", name: "Shade", level: 60, class: "Rogue" }],
    progress: { currentQuest: "—", questStep: "—", guild: null },
    payments: [],
    wallets: [{ chain: "Ethereum", address: "0xDeadBeef00000000000000000000000000000abc" }],
    onChain: { mints: [], recentTx: [] },
    deviceContext: {
      build: "1.4.2",
      os: "Android 14",
      locale: "en-US",
      lastSession: "2026-04-22T14:55:00Z",
    },
  },
};

export function findProfile(id: string): Profile | null {
  return PROFILES[id] ?? null;
}
