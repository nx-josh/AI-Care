import type {
  GameApiClient,
  GameLogEntry,
  Payment,
  UserProfile,
} from "./client";
import { identityKey, type Identity } from "./identity";

const users: Record<string, UserProfile> = {
  "firebase_sub:demo-user-001": {
    userId: "u_001",
    displayName: "DemoPlayer",
    email: "demo@example.com",
    createdAt: "2025-08-12T03:21:00Z",
    banned: false,
    characters: [
      { id: "c_01", name: "Aria", level: 47, class: "Mage" },
      { id: "c_02", name: "Borin", level: 22, class: "Warrior" },
    ],
  },
  "game_uuid:GU-9F2A": {
    userId: "u_002",
    displayName: "ShadowFox",
    email: null,
    createdAt: "2026-01-05T11:00:00Z",
    banned: true,
    banReason: "Macro use detected on 2026-04-22",
    characters: [{ id: "c_11", name: "Shade", level: 60, class: "Rogue" }],
  },
};

const payments: Record<string, Payment[]> = {
  "firebase_sub:demo-user-001": [
    {
      id: "pay_2026_0501",
      amount: 9.99,
      currency: "USD",
      productId: "starter_pack",
      status: "completed",
      createdAt: "2026-05-01T08:14:00Z",
    },
    {
      id: "pay_2026_0510",
      amount: 49.99,
      currency: "USD",
      productId: "premium_bundle",
      status: "refunded",
      createdAt: "2026-05-10T19:02:00Z",
    },
  ],
  "game_uuid:GU-9F2A": [],
};

const logs: Record<string, GameLogEntry[]> = {
  "firebase_sub:demo-user-001": [
    {
      ts: "2026-05-18T22:01:11Z",
      level: "error",
      event: "client_crash",
      detail: { build: "1.4.2", os: "iOS 18.2", scene: "dungeon_03" },
    },
    {
      ts: "2026-05-18T22:01:09Z",
      level: "info",
      event: "scene_load",
      detail: { scene: "dungeon_03" },
    },
  ],
  "game_uuid:GU-9F2A": [
    {
      ts: "2026-04-22T14:55:00Z",
      level: "warn",
      event: "macro_detected",
      detail: { confidence: 0.93 },
    },
  ],
};

export const mockGameApi: GameApiClient = {
  async getUser(id: Identity) {
    return users[identityKey(id)] ?? null;
  },
  async listPayments(id: Identity, opts = {}) {
    const list = payments[identityKey(id)] ?? [];
    return opts.limit ? list.slice(0, opts.limit) : list;
  },
  async fetchLogs(id: Identity, opts = {}) {
    let list = logs[identityKey(id)] ?? [];
    if (opts.since) {
      const cutoff = new Date(opts.since).getTime();
      list = list.filter((l) => new Date(l.ts).getTime() >= cutoff);
    }
    return opts.limit ? list.slice(0, opts.limit) : list;
  },
};
