import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RUNTIME_URL = process.env.RUNTIME_URL || "https://agents.flowlyai.kz";
const RUNTIME_API_KEY = process.env.RUNTIME_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("flowly_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${RUNTIME_URL}/api/v1/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-API-Key": RUNTIME_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "Stream error");
      return NextResponse.json({ error: err }, { status: res.status });
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch {
    return NextResponse.json({ error: "Stream failed" }, { status: 500 });
  }
}
