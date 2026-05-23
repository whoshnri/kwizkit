import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (auth && typeof (auth as any).login === "function") {
      const res = await (auth as any).login(body, request);
      if (res instanceof Response) return res;
      return NextResponse.json(res ?? { ok: true });
    }

    // delegate to generic handler if present
    if (auth && typeof (auth as any).handleRequest === "function") {
      const res = await (auth as any).handleRequest(request);
      if (res instanceof Response) return res;
    }
  } catch (err) {
    console.error("login route error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }

  return NextResponse.json({ ok: false, error: "not_implemented" }, { status: 501 });
}
