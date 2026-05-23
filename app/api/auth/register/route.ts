import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (auth && typeof (auth as any).register === "function") {
      const res = await (auth as any).register(body, request);
      if (res instanceof Response) return res;
      return NextResponse.json(res ?? { ok: true });
    }

    if (auth && typeof (auth as any).handleRequest === "function") {
      const res = await (auth as any).handleRequest(request);
      if (res instanceof Response) return res;
    }
  } catch (err) {
    console.error("register route error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }

  return NextResponse.json({ ok: false, error: "not_implemented" }, { status: 501 });
}
