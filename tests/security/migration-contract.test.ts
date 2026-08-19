// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve("supabase/migrations/202608190001_slice_a_secure_upload.sql"), "utf8");

describe("Slice A migration security contract", () => {
  it("enables RLS on every exposed application table", () => {
    for (const table of ["organisations", "organisation_memberships", "source_uploads"]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
  });
  it("uses a private bucket and organisation-first paths", () => {
    expect(sql).toMatch(/'itad-source-files'[\s\S]*false/);
    expect(sql).toContain("(storage.foldername(name))[1]");
  });
  it("does not grant anonymous application access", () => {
    expect(sql).not.toMatch(/grant\s+(select|insert|update|delete)[^;]+to\s+anon/i);
  });
  it("does not allow browser overwrite or deletion of source evidence", () => {
    expect(sql).not.toMatch(/on storage\.objects for (update|delete) to authenticated/i);
  });
  it("requires active operator or manager membership for upload", () => {
    expect(sql).toContain("m.role in ('operator', 'manager')");
    expect(sql).toContain("m.status = 'active'");
  });
});
