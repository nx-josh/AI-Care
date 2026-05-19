import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgent } from "@/lib/agent/orchestrator";

export const runtime = "nodejs";

const Body = z.object({
  text: z.string().min(1).max(8000),
  channel: z.enum(["discord", "sdk", "email", "test"]).default("test"),
  identity: z
    .object({
      firebaseSub: z.string().optional(),
      gameUuid: z.string().optional(),
    })
    .nullish(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: "invalid_request", detail: (e as Error).message },
      { status: 400 }
    );
  }

  try {
    const result = await runAgent({
      channel: body.channel,
      text: body.text,
      identity: body.identity ?? null,
      conversationHistory: body.conversationHistory,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[agent/chat] error", e);
    return NextResponse.json(
      { error: "agent_failed", detail: (e as Error).message },
      { status: 500 }
    );
  }
}
