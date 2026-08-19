const MAX_WORKBOOK_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
  "",
]);

export type WorkbookValidation =
  | { ok: true }
  | { ok: false; message: string };

export function validateWorkbook(file: Pick<File, "name" | "size" | "type">): WorkbookValidation {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return { ok: false, message: "Choose a Securaze .xlsx workbook." };
  }
  if (file.size === 0) {
    return { ok: false, message: "The workbook is empty." };
  }
  if (file.size > MAX_WORKBOOK_BYTES) {
    return { ok: false, message: "The workbook exceeds the 20 MB Slice A limit." };
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { ok: false, message: "The selected file type is not recognised as an Excel workbook." };
  }
  return { ok: true };
}

export function safeSourceName(name: string): string {
  const stem = name.replace(/\.xlsx$/i, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${stem || "securaze-source"}.xlsx`;
}

export function buildStoragePath(organisationId: string, uploadId: string, fileName: string): string {
  if (!/^[0-9a-f-]{36}$/i.test(organisationId) || !/^[0-9a-f-]{36}$/i.test(uploadId)) {
    throw new Error("Storage paths require UUID organisation and upload identifiers");
  }
  return `${organisationId}/${uploadId}/${safeSourceName(fileName)}`;
}

export async function sha256Hex(file: Blob): Promise<string> {
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
