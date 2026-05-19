import { env } from "@/lib/env";
import type { Identity } from "./identity";
import { mockGameApi } from "./mock";

export type UserProfile = {
  userId: string;
  displayName: string;
  email: string | null;
  createdAt: string;
  banned: boolean;
  banReason?: string;
  characters: Array<{ id: string; name: string; level: number; class: string }>;
};

export type Payment = {
  id: string;
  amount: number;
  currency: string;
  productId: string;
  status: "completed" | "refunded" | "failed" | "pending";
  createdAt: string;
};

export type GameLogEntry = {
  ts: string;
  level: "info" | "warn" | "error";
  event: string;
  detail?: Record<string, unknown>;
};

export interface GameApiClient {
  getUser(id: Identity): Promise<UserProfile | null>;
  listPayments(id: Identity, opts?: { limit?: number }): Promise<Payment[]>;
  fetchLogs(
    id: Identity,
    opts: { since?: string; limit?: number }
  ): Promise<GameLogEntry[]>;
}

class RealGameApi implements GameApiClient {
  constructor(private baseUrl: string, private apiKey: string) {}

  private idHeaders(id: Identity): Record<string, string> {
    return id.kind === "firebase_sub"
      ? { "X-Firebase-Sub": id.value }
      : { "X-Game-UUID": id.value };
  }

  private async req<T>(path: string, id: Identity): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...this.idHeaders(id),
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Game API ${res.status} on ${path}`);
    return (await res.json()) as T;
  }

  getUser(id: Identity) {
    return this.req<UserProfile | null>("/cs/user", id);
  }
  listPayments(id: Identity, opts: { limit?: number } = {}) {
    const q = opts.limit ? `?limit=${opts.limit}` : "";
    return this.req<Payment[]>(`/cs/payments${q}`, id);
  }
  fetchLogs(id: Identity, opts: { since?: string; limit?: number } = {}) {
    const params = new URLSearchParams();
    if (opts.since) params.set("since", opts.since);
    if (opts.limit) params.set("limit", String(opts.limit));
    const q = params.toString() ? `?${params}` : "";
    return this.req<GameLogEntry[]>(`/cs/logs${q}`, id);
  }
}

export function gameApi(): GameApiClient {
  if (env.USE_MOCK_GAME_API || !env.GAME_API_BASE_URL || !env.GAME_API_KEY) {
    return mockGameApi;
  }
  return new RealGameApi(env.GAME_API_BASE_URL, env.GAME_API_KEY);
}
