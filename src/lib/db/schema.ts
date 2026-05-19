import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const channelEnum = pgEnum("channel", ["discord", "sdk", "email", "test"]);
export const categoryEnum = pgEnum("category", [
  "account",
  "faq",
  "bug",
  "abuse",
  "unknown",
]);
export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "pending_human",
  "resolved",
  "closed",
]);
export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "tool",
  "agent_human",
]);
export const escalationStatusEnum = pgEnum("escalation_status", [
  "queued",
  "claimed",
  "resolved",
]);
export const identityKindEnum = pgEnum("identity_kind", [
  "firebase_sub",
  "game_uuid",
  "anonymous",
]);

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    channel: channelEnum("channel").notNull(),
    externalRef: text("external_ref"),
    identityKind: identityKindEnum("identity_kind").notNull().default("anonymous"),
    identityValue: text("identity_value"),
    language: text("language"),
    category: categoryEnum("category").notNull().default("unknown"),
    status: ticketStatusEnum("status").notNull().default("open"),
    subject: text("subject"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("tickets_status_idx").on(t.status),
    index("tickets_identity_idx").on(t.identityKind, t.identityValue),
    index("tickets_channel_idx").on(t.channel, t.createdAt),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    toolName: text("tool_name"),
    toolInput: jsonb("tool_input"),
    toolOutput: jsonb("tool_output"),
    metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("messages_ticket_idx").on(t.ticketId, t.createdAt)]
);

export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  messageId: uuid("message_id").references(() => messages.id, {
    onDelete: "set null",
  }),
  url: text("url").notNull(),
  contentType: text("content_type"),
  filename: text("filename"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const escalations = pgTable(
  "escalations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    priority: text("priority").notNull().default("normal"),
    summary: text("summary").notNull(),
    suggestedAction: text("suggested_action"),
    status: escalationStatusEnum("status").notNull().default("queued"),
    claimedBy: text("claimed_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [index("escalations_status_idx").on(t.status, t.createdAt)]
);

export const knowledgeDocs = pgTable("knowledge_docs", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: categoryEnum("category").notNull().default("faq"),
  language: text("language").notNull().default("en"),
  body: text("body").notNull(),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  enabled: boolean("enabled").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Escalation = typeof escalations.$inferSelect;
