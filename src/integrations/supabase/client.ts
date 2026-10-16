import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// La anon key es pública por diseño: la seguridad real la da RLS en la base de datos.
const URL = import.meta.env.VITE_SUPABASE_URL || "https://ttkbwmhyzmqpgazvdndt.supabase.co";
const KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0a2J3bWh5em1xcGdhenZkbmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMDY5ODEsImV4cCI6MjEwNzY4Mjk4MX0.sdZyFmxMGALDh6mD02-8s3lzw1nKteFcY5pa0EKTIEk";

export const supabase = createClient<Database>(URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
