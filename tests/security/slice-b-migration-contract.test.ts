// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve("supabase/migrations/202608190002_slice_b_workbook_inspections.sql"), "utf8");

describe("Slice B migration security contract", () => {
  it("enables RLS and grants no anonymous access", () => {
    expect(sql).toContain("alter table public.workbook_inspections enable row level security");
    expect(sql).not.toMatch(/grant\s+(select|insert|update|delete)[^;]+to\s+anon/i);
  });
  it("allows inserts only for the matching organisation upload and operational role", () => {
    expect(sql).toContain("su.id = workbook_inspections.source_upload_id");
    expect(sql).toContain("su.organisation_id = workbook_inspections.organisation_id");
    expect(sql).toContain("m.role in ('operator', 'manager')");
    expect(sql).toContain("inspected_by = (select auth.uid())");
  });
  it("keeps inspections immutable in the browser", () => {
    expect(sql).not.toMatch(/for (update|delete) to authenticated/i);
  });
  it("stores structure but defines no imported-row table", () => {
    expect(sql).toContain("sheets jsonb");
    expect(sql).not.toMatch(/create table public\.(assets|devices|imported_rows)/i);
  });
});
