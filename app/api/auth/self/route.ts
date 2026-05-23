import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // try a registration / create account method if available on the auth instance
    if (auth && typeof (auth as any).register === "function") {
      const payload = await request.json().catch(() => ({}));
      const res = await (auth as any).register(payload, request);
      if (res instanceof Response) return res;
      return NextResponse.json(res ?? { status: "ok" });
    }

    // fallback: delegate to generic handler
    if (auth && typeof (auth as any).handleRequest === "function") {
      const res = await (auth as any).handleRequest(request);
      if (res instanceof Response) return res;
    }
  } catch (err) {
    console.error("self route error:", err);
    return NextResponse.json({ status: "error", message: String(err) }, { status: 500 });
  }

  return NextResponse.json({ status: "not_implemented" }, { status: 501 });
}
