import { NextResponse } from "next/server";
import { findProfile } from "@/lib/mock/profiles";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const p = findProfile(userId);
  if (!p) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({
    profile: {
      displayName: p.displayName,
      banned: p.banned,
      tenantId: p.tenantId,
      mainCharacter: p.characters[0] ?? null,
      progress: p.progress,
      walletShort: p.wallets[0]
        ? `${p.wallets[0].address.slice(0, 6)}...${p.wallets[0].address.slice(-4)}`
        : null,
    },
  });
}
