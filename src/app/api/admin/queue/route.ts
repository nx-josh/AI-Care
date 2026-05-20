import { NextResponse } from "next/server";
import { listTickets } from "@/lib/store/tickets";

export const runtime = "nodejs";

export async function GET() {
  const tickets = listTickets({ statusIn: ["pending_human"] });
  return NextResponse.json({ tickets });
}
