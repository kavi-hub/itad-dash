import { z } from "zod";

const browserEnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(20).refine(
    (value) => !value.startsWith("sb_secret_") && !value.includes("service_role"),
    "A server secret must never be exposed to browser code",
  ),
});

export type BrowserEnv = z.infer<typeof browserEnvSchema>;

export function parseBrowserEnv(input: Record<string, unknown>): BrowserEnv {
  return browserEnvSchema.parse(input);
}

export function getBrowserEnv(): BrowserEnv {
  return parseBrowserEnv(import.meta.env);
}
