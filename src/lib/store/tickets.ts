import { nanoid } from "@/lib/nanoid";
import { getSeedTickets } from "@/lib/mock/seed";

export type TicketStatus = "ai_answering" | "answered" | "pending_human" | "resolved";
export type QueueName = "payment" | "infra" | "moderation" | "tenant" | "general";
export type Priority = "low" | "normal" | "high";

export type Ticket = {
  id: string;
  status: TicketStatus;
  category: string;
  subject: string;
  body: string;
  language?: { iso: string; name: string };
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  aiResponse?: {
    text: string;
    citations: string[];
    toolCalls: Array<{ name: string; input: unknown; output: unknown }>;
  };
  escalation?: {
    queue: QueueName;
    priority: Priority;
    reason: string;
    summary: string;
    suggestedAction?: string;
  };
};

const tickets: Ticket[] = [];

function ensureSeeded() {
  if (tickets.length === 0) {
    const seed = getSeedTickets();
    for (const t of seed) tickets.push(t);
  }
}

export function createTicket(input: {
  category: string;
  subject: string;
  body: string;
  userId: string;
  userName: string;
}): Ticket {
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: `T-${nanoid(8).toUpperCase()}`,
    status: "ai_answering",
    category: input.category,
    subject: input.subject,
    body: input.body,
    userId: input.userId,
    userName: input.userName,
    createdAt: now,
    updatedAt: now,
  };
  tickets.unshift(ticket);
  return ticket;
}

export function updateTicket(id: string, patch: Partial<Ticket>): Ticket | null {
  const idx = tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tickets[idx] = { ...tickets[idx], ...patch, updatedAt: new Date().toISOString() };
  return tickets[idx];
}

export function getTicket(id: string): Ticket | null {
  ensureSeeded();
  return tickets.find((t) => t.id === id) ?? null;
}

export function listTickets(opts?: {
  userId?: string;
  statusIn?: TicketStatus[];
}): Ticket[] {
  ensureSeeded();
  return tickets.filter((t) => {
    if (opts?.userId && t.userId !== opts.userId) return false;
    if (opts?.statusIn && !opts.statusIn.includes(t.status)) return false;
    return true;
  });
}

export function clearTickets() {
  tickets.length = 0;
}
