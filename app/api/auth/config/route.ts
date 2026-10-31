import { NextResponse } from "next/server";

export async function GET() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes("placeholder") &&
    !url.includes("your-project")
  );

  const availableMatchingKeys = Object.keys(process.env).filter(
    (k) =>
      k.includes("SUPA") ||
      k.includes("POSTGRES") ||
      k.includes("DATABASE") ||
      k.includes("DB_")
  );

  return NextResponse.json({
    configured: isConfigured,
    url: isConfigured ? url : null,
    anonKey: isConfigured ? anonKey : null,
    detectedEnvKeys: availableMatchingKeys,
  });
}

