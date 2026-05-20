import { NextResponse } from "next/server";
import { getTicket } from "@/lib/store/tickets";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ticket = getTicket(id);
  if (!ticket) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ticket });
}
