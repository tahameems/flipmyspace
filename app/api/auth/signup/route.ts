import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, fullName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const requestUrl = new URL(request.url);
    const host = request.headers.get("x-forwarded-host") || requestUrl.host;
    const proto = request.headers.get("x-forwarded-proto") || (requestUrl.protocol.replace(":", ""));
    const origin = `${proto}://${host}`;
    const redirectUrl = `${origin}/auth/callback`;

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || "",
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If instant session returned (email confirmation turned off)
    if (data.session?.user) {
      // Upsert profile
      try {
        await supabase.from("profiles").upsert(
          {
            id: data.session.user.id,
            email: data.session.user.email || null,
            full_name: fullName?.trim() || null,
            avatar_url: null,
            credits_remaining: 5,
          },
          { onConflict: "id" }
        );
      } catch {
        // Fallback handled by client/DB
      }

      return NextResponse.json({
        user: data.session.user,
        session: data.session,
        requiresEmailConfirmation: false,
        message: "Welcome to Relive! 5 free room designs are now active.",
      });
    }

    // If confirmation email was dispatched
    if (data.user) {
      return NextResponse.json({
        user: data.user,
        session: null,
        requiresEmailConfirmation: true,
        message: `We've sent an activation link to ${email}. Please check your inbox (and spam) to confirm your account and claim your 5 free designs.`,
      });
    }

    return NextResponse.json({
      requiresEmailConfirmation: true,
      message: "Please check your inbox to confirm your email, then sign in to access your 5 free designs.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create account." },
      { status: 500 }
    );
  }
}
