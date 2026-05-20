import { NextResponse } from "next/server";
import { searchKB } from "@/lib/mock/kb";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const category = url.searchParams.get("category") as
    | "account"
    | "faq"
    | "bug"
    | "abuse"
    | "onchain"
    | null;

  if (q.trim().length < 2) return NextResponse.json({ results: [] });

  const results = searchKB(q, {
    category: category ?? undefined,
    limit: 5,
  });

  return NextResponse.json({
    results: results.map((r) => ({
      slug: r.doc.slug,
      title: r.doc.title,
      version: r.doc.version,
      section: r.doc.section,
      body: r.doc.body,
      category: r.doc.category,
      layer: r.doc.layer,
    })),
  });
}
