import { createClient } from "@supabase/supabase-js";
import { getBrowserEnv } from "./env";

const browserEnv = getBrowserEnv();

export const supabase = createClient(
  browserEnv.VITE_SUPABASE_URL,
  browserEnv.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
