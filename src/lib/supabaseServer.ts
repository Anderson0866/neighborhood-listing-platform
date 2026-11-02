import "server-only";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

export function publicSupabaseConfig() {
  if (!url || !anonKey) throw new Error("Supabase server configuration is missing");
  return { url, key: anonKey };
}

export function serviceSupabaseConfig() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service configuration is missing");
  return { url, key };
}

export function supabaseHeaders(key: string, bearer = key): Record<string, string> {
  return {
    apikey: key,
    Authorization: `Bearer ${bearer}`,
    "Content-Type": "application/json",
  };
}
