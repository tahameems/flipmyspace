import { NextResponse } from "next/server";

function findEnvUrl(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (process.env.NEXT_SUPABASE_URL) return process.env.NEXT_SUPABASE_URL;
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL;

  // Dynamic scan for any env var containing SUPABASE and URL
  for (const [key, value] of Object.entries(process.env)) {
    if (key.toUpperCase().includes("SUPABASE") && key.toUpperCase().includes("URL") && value && value.startsWith("http")) {
      return value;
    }
  }
  return "";
}

function findEnvAnonKey(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (process.env.NEXT_SUPABASE_ANON_KEY) return process.env.NEXT_SUPABASE_ANON_KEY;
  if (process.env.SUPABASE_ANON_KEY) return process.env.SUPABASE_ANON_KEY;
  if (process.env.SUPABASE_KEY) return process.env.SUPABASE_KEY;

  // Dynamic scan for any env var containing SUPABASE and (ANON or KEY)
  for (const [key, value] of Object.entries(process.env)) {
    const upperKey = key.toUpperCase();
    if (
      upperKey.includes("SUPABASE") &&
      (upperKey.includes("ANON") || upperKey.includes("KEY")) &&
      !upperKey.includes("SERVICE") && // do not expose service role key
      value &&
      value.length > 20
    ) {
      return value;
    }
  }
  return "";
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

  return NextResponse.json({
    configured: isConfigured,
    url: isConfigured ? url : null,
    anonKey: isConfigured ? anonKey : null,
  });
}
