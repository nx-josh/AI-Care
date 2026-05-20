import { NextResponse } from "next/server";
import { addKB, listInjectedKB, type KBInjectInput } from "@/lib/mock/kb";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ docs: listInjectedKB() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<KBInjectInput>;

  if (!body.title || body.title.trim().length < 2) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  if (!body.body || body.body.trim().length < 10) {
    return NextResponse.json({ error: "body too short" }, { status: 400 });
  }
  if (body.layer !== "tenant" && body.layer !== "cross") {
    return NextResponse.json({ error: "invalid layer" }, { status: 400 });
  }
  if (body.docType !== "spec" && body.docType !== "faq" && body.docType !== "policy") {
    return NextResponse.json({ error: "invalid docType" }, { status: 400 });
  }

  const doc = addKB({
    title: body.title.trim(),
    body: body.body.trim(),
    layer: body.layer,
    docType: body.docType,
    category: body.category,
  });

  return NextResponse.json({ doc });
}
