import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const requestUrl = new URL(request.url);
    const host = request.headers.get("x-forwarded-host") || requestUrl.host;
    const proto = request.headers.get("x-forwarded-proto") || (requestUrl.protocol.replace(":", ""));
    const origin = `${proto}://${host}`;
    const redirectUrl = `${origin}/auth/callback`;

    const supabase = await createClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Verification email resent! Please check your inbox." });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to resend email." },
      { status: 500 }
    );
  }
}

