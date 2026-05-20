import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgent } from "@/lib/agent/orchestrator";
import { createTicket, listTickets, updateTicket, clearTickets } from "@/lib/store/tickets";
import { findProfile } from "@/lib/mock/profiles";

export const runtime = "nodejs";

const PostBody = z.object({
  userId: z.string().min(1),
  category: z.string().min(1),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  try {
    const body = PostBody.parse(await req.json());
    const profile = findProfile(body.userId);

    const ticket = createTicket({
      category: body.category,
      subject: body.subject,
      body: body.body,
      userId: body.userId,
      userName: profile?.displayName ?? "Anonymous",
    });

    const result = await runAgent({
      userId: body.userId,
      text: `[${body.subject}] ${body.body}`,
    });

    const updated = updateTicket(ticket.id, {
      status: result.escalated ? "pending_human" : "answered",
      category: result.category !== "unknown" ? result.category : ticket.category,
      language: result.language,
      aiResponse: {
        text: result.reply,
        citations: result.citations,
        toolCalls: result.toolCalls,
      },
      escalation: result.escalated
        ? {
            queue: result.escalated.queue as never,
            priority: result.escalated.priority as never,
            reason: result.escalated.reason,
            summary: "",
          }
        : undefined,
    });

    return NextResponse.json({ ticket: updated });
  } catch (e) {
    console.error("[POST /api/tickets] error", e);
    return NextResponse.json(
      { error: "agent_failed", detail: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") ?? undefined;
  const status = url.searchParams.get("status");
  return NextResponse.json({
    tickets: listTickets({
      userId,
      statusIn: status ? (status.split(",") as never) : undefined,
    }),
  });
}

export async function DELETE() {
  clearTickets();
  return NextResponse.json({ ok: true });
}
