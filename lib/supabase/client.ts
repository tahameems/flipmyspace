import { createBrowserClient } from "@supabase/ssr";

// Safe retrieval of public Supabase environment variables
// Supports standard NEXT_PUBLIC_* as well as Vercel-injected SUPABASE_URL / SUPABASE_ANON_KEY
export const getSupabaseUrl = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  );
};

export const getSupabaseAnonKey = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ""
  );
};

export const isSupabaseConfigured = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(url && key && !url.includes("your-project"));
};

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (clientInstance) return clientInstance;

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy/safe client during build or if credentials aren't yet loaded in development
    clientInstance = createBrowserClient(
      "https://placeholder-project.supabase.co",
      "placeholder-anon-key"
    );
    return clientInstance;
  }

  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return clientInstance;
}

