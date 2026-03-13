import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CORE_URL = process.env.CORE_URL || "https://core.flowlyai.kz";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("flowly_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const res = await fetch(`${CORE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      cookieStore.delete("flowly_refresh_token");
      return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    }

    const data = await res.json();

    if (data.refresh_token) {
      const maxAge = data.expires_in ? data.expires_in * 2 : 60 * 60 * 24 * 30;
      cookieStore.set("flowly_refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge,
      });
    }

    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    });
  } catch {
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
