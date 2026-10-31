import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  // Use forwarded host and proto when behind reverse proxies like Vercel
  const host = request.headers.get("x-forwarded-host") || requestUrl.host;
  const proto = request.headers.get("x-forwarded-proto") || (requestUrl.protocol.replace(":", ""));
  const origin = `${proto}://${host}`;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session?.user) {
      const user = data.session.user;
      // Guarantee profile exists
      try {
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email || null,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            credits_remaining: 5,
          },
          { onConflict: "id" }
        );
      } catch {
        // Ignored if handled by DB trigger or table not migrated yet
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page or homepage with an instructional query
  return NextResponse.redirect(`${origin}/?auth_error=true`);
}
