import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    if (auth && typeof (auth as any).logout === "function") {
      const res = await (auth as any).logout(request);
      if (res instanceof Response) return res;
      return NextResponse.json({ ok: true });
    }

    if (auth && typeof (auth as any).handleRequest === "function") {
      const res = await (auth as any).handleRequest(request);
      if (res instanceof Response) return res;
    }
  } catch (err) {
    console.error("logout error:", err);
    return NextResponse.json({ ok: false, error: "logout_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
