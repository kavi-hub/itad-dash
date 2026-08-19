import { describe, expect, it } from "vitest";
import { buildStoragePath, safeSourceName, validateWorkbook } from "./upload";

describe("workbook validation", () => {
  it("accepts a bounded xlsx workbook", () => {
    expect(validateWorkbook({ name: "synthetic.xlsx", size: 1024, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })).toEqual({ ok: true });
  });
  it.each([
    [{ name: "evidence.pdf", size: 100, type: "application/pdf" }, "Choose a Securaze .xlsx workbook."],
    [{ name: "empty.xlsx", size: 0, type: "" }, "The workbook is empty."],
    [{ name: "large.xlsx", size: 21 * 1024 * 1024, type: "" }, "The workbook exceeds the 20 MB Slice A limit."],
  ])("rejects unsafe input", (file, message) => expect(validateWorkbook(file)).toEqual({ ok: false, message }));
});

describe("storage paths", () => {
  it("places the organisation first and sanitises the filename", () => {
    const path = buildStoragePath("11111111-1111-4111-8111-111111111111", "22222222-2222-4222-8222-222222222222", "Demo Client (final).xlsx");
    expect(path).toBe("11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222/Demo-Client-final.xlsx");
  });
  it("rejects unscoped identifiers", () => expect(() => buildStoragePath("client", "upload", "x.xlsx")).toThrow());
  it("never emits path separators from the filename", () => expect(safeSourceName("../../source.xlsx")).toBe("..-..-source.xlsx"));
});
