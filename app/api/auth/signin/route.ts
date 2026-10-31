import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.session?.user) {
      // Upsert profile if missing
      try {
        await supabase.from("profiles").upsert(
          {
            id: data.session.user.id,
            email: data.session.user.email || null,
            full_name: data.session.user.user_metadata?.full_name || null,
            avatar_url: null,
            credits_remaining: 5,
          },
          { onConflict: "id" }
        );
      } catch {
        // Fallback
      }

      return NextResponse.json({
        user: data.session.user,
        session: data.session,
      });
    }

    return NextResponse.json({ error: "Could not create session." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to sign in." },
      { status: 500 }
    );
  }
}
