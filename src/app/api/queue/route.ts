import { NextResponse } from "next/server";
import { listQueue, clearQueue } from "@/lib/store/queue";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ queue: listQueue() });
}

export async function DELETE() {
  clearQueue();
  return NextResponse.json({ ok: true });
}
