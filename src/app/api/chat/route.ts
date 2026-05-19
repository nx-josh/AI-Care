import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgent } from "@/lib/agent/orchestrator";
import { listQueue } from "@/lib/store/queue";

export const runtime = "nodejs";

const Body = z.object({
  userId: z.string().min(1),
  text: z.string().min(1).max(4000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const result = await runAgent(body);
    return NextResponse.json({ ...result, queue: listQueue() });
  } catch (e) {
    console.error("[chat] error", e);
    return NextResponse.json(
      { error: "agent_failed", detail: (e as Error).message },
      { status: 500 }
    );
  }
}
