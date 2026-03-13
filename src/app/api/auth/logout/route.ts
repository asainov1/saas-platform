import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("flowly_refresh_token");
  cookieStore.delete("flowly_token");
  cookieStore.delete("flowly_token_exp");
  return NextResponse.json({ ok: true });
}
