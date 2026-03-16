import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const AUTH_URL = process.env.AUTH_URL || "https://auth.flowlyai.kz";
const GOOGLE_CLIENT_ID = "149964995044-l1ama192qc1jcjlatta0j22qv0cb2l9j.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // Exchange authorization code for tokens with Google
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: "postmessage",
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json().catch(() => ({}));
      console.error("Google token exchange failed:", err);
      return NextResponse.json({ error: "Google token exchange failed", details: err }, { status: 400 });
    }

    const googleTokens = await tokenRes.json();
    const idToken = googleTokens.id_token;

    if (!idToken) {
      return NextResponse.json({ error: "No id_token from Google" }, { status: 400 });
    }

    // Send id_token to our auth backend
    const authRes = await fetch(`${AUTH_URL}/api/v1/auth/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    });

    if (!authRes.ok) {
      const err = await authRes.json().catch(() => ({}));
      console.error("Auth backend error:", err);
      return NextResponse.json({ error: "Auth failed", details: err }, { status: authRes.status });
    }

    const tokenData = await authRes.json();
    const data = tokenData.data || tokenData;

    // Set refresh token as httpOnly cookie
    if (data.refresh_token) {
      const maxAge = data.expires_in ? data.expires_in * 2 : 60 * 60 * 24 * 30;
      const cookieStore = await cookies();
      cookieStore.set("flowly_refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge,
      });
    }

    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type || "Bearer",
      user: data.user,
    });
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
