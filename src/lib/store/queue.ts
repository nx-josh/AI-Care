import { nanoid } from "@/lib/nanoid";

export type QueueName = "payment" | "infra" | "moderation" | "tenant" | "general";
export type Priority = "low" | "normal" | "high";

export type QueueItem = {
  id: string;
  ticketId: string;
  queue: QueueName;
  priority: Priority;
  reason: string;
  summary: string;
  suggestedAction?: string;
  userIdentity: string;
  userName: string;
  category: string;
  createdAt: string;
  status: "queued" | "claimed" | "resolved";
  toolCalls: Array<{ name: string; input: unknown; output: unknown }>;
  conversationSnippet: Array<{ role: string; content: string }>;
};

const queue: QueueItem[] = [];

export function addToQueue(item: Omit<QueueItem, "id" | "createdAt" | "status">): QueueItem {
  const full: QueueItem = {
    ...item,
    id: nanoid(),
    createdAt: new Date().toISOString(),
    status: "queued",
  };
  queue.unshift(full);
  return full;
}

export function listQueue(): QueueItem[] {
  return queue;
}

export function clearQueue() {
  queue.length = 0;
}
