import { NextResponse } from "next/server";

function findEnvUrl(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (process.env.NEXT_SUPABASE_URL) return process.env.NEXT_SUPABASE_URL;
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL;

  for (const [key, value] of Object.entries(process.env)) {
    if (key.toUpperCase().includes("SUPABASE") && key.toUpperCase().includes("URL") && value && value.startsWith("http")) {
      return value;
    }
  }
  return "https://bjpudckrybzudbxmxvvd.supabase.co";
}

function findEnvAnonKey(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (process.env.NEXT_SUPABASE_ANON_KEY) return process.env.NEXT_SUPABASE_ANON_KEY;
  if (process.env.SUPABASE_ANON_KEY) return process.env.SUPABASE_ANON_KEY;
  if (process.env.SUPABASE_KEY) return process.env.SUPABASE_KEY;

  for (const [key, value] of Object.entries(process.env)) {
    const upperKey = key.toUpperCase();
    if (
      upperKey.includes("SUPABASE") &&
      (upperKey.includes("ANON") || upperKey.includes("KEY")) &&
      !upperKey.includes("SERVICE") &&
      value &&
      value.length > 20
    ) {
      return value;
    }
  }
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHVkY2tyeWJ6dWRieG14dnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MTI2ODgsImV4cCI6MjEwODk4ODY4OH0.8G_QIpmXc67gnMIjWGu4djrA27NBk-mCPK60h0f3UIk";
}

export async function GET() {
  const url = findEnvUrl();
  const anonKey = findEnvAnonKey();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes("placeholder") &&
    !url.includes("your-project")
  );

  let googleEnabled = false;
  if (isConfigured) {
    try {
      const res = await fetch(`${url}/auth/v1/authorize?provider=google`, {
        method: "GET",
        headers: { apikey: anonKey },
        redirect: "manual",
      });
      googleEnabled = res.status >= 300 && res.status < 400;
    } catch {
      googleEnabled = false;
    }
  }

  return NextResponse.json({
    configured: isConfigured,
    url: isConfigured ? url : null,
    anonKey: isConfigured ? anonKey : null,
    googleEnabled,
  });
}
