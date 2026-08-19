import { describe, expect, it } from "vitest";
import { parseBrowserEnv } from "./env";

describe("browser environment", () => {
  it("accepts a publishable key", () => expect(parseBrowserEnv({ VITE_SUPABASE_URL: "https://demo.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_demo_key_123456" })).toBeTruthy());
  it("rejects a server secret", () => expect(() => parseBrowserEnv({ VITE_SUPABASE_URL: "https://demo.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_demo_key_123456789" })).toThrow());
});
