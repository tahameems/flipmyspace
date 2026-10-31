import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://bjpudckrybzudbxmxvvd.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcHVkY2tyeWJ6dWRieG14dnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MTI2ODgsImV4cCI6MjEwODk4ODY4OH0.8G_QIpmXc67gnMIjWGu4djrA27NBk-mCPK60h0f3UIk";

export const getSupabaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  );
};

export const getSupabaseAnonKey = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    DEFAULT_SUPABASE_ANON_KEY
  );
};

export const isSupabaseConfigured = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
    key &&
    !url.includes("your-project") &&
    !url.includes("placeholder-project")
  );
};

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function initClient(url: string, anonKey: string) {
  clientInstance = createBrowserClient(url, anonKey);
  return clientInstance;
}

export function createClient(customUrl?: string, customKey?: string) {
  if (customUrl && customKey) {
    return initClient(customUrl, customKey);
  }

  if (clientInstance) {
    return clientInstance;
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return clientInstance;
}
