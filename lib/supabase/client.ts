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
  return Boolean(
    url &&
    key &&
    !url.includes("your-project") &&
    !url.includes("placeholder-project")
  );
};

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;
let isPlaceholder = false;

export function initClient(url: string, anonKey: string) {
  clientInstance = createBrowserClient(url, anonKey);
  isPlaceholder = false;
  return clientInstance;
}

export function createClient(customUrl?: string, customKey?: string) {
  if (customUrl && customKey) {
    return initClient(customUrl, customKey);
  }

  // If already initialized with real credentials, return it
  if (clientInstance && !isPlaceholder) {
    return clientInstance;
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey || !isSupabaseConfigured()) {
    // Return a dummy client without locking clientInstance permanently
    if (!clientInstance) {
      clientInstance = createBrowserClient(
        "https://placeholder-project.supabase.co",
        "placeholder-anon-key"
      );
      isPlaceholder = true;
    }
    return clientInstance;
  }

  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  isPlaceholder = false;
  return clientInstance;
}
