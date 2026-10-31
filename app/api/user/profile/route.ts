import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try fetching profile from public.profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, credits_remaining")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      return NextResponse.json({ profile });
    }

    // Auto-create initial profile if not found
    const newProfile = {
      id: user.id,
      email: user.email || null,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      credits_remaining: 5,
    };

    try {
      await supabase.from("profiles").upsert(newProfile, { onConflict: "id" });
    } catch {
      // Fallback
    }

    return NextResponse.json({ profile: newProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { fullName, avatarUrl } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof fullName === "string") updates.full_name = fullName;
    if (typeof avatarUrl === "string") updates.avatar_url = avatarUrl;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
