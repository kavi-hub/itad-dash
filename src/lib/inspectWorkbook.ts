import { strFromU8, unzipSync } from "fflate";

const MAX_ENTRY_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_XML_BYTES = 30 * 1024 * 1024;
const MAX_SHEETS = 100;
const MAX_ROWS_PER_SHEET = 200_000;
const MAX_HEADERS = 100;

export type SheetInspection = {
  name: string;
  rowCount: number;
  columnCount: number;
  headerRow: number | null;
  headers: string[];
};

export type WorkbookInspection = {
  sheets: SheetInspection[];
  warnings: string[];
};

function parseXml(bytes: Uint8Array, label: string): Document {
  const document = new DOMParser().parseFromString(strFromU8(bytes), "application/xml");
  if (document.querySelector("parsererror")) throw new Error(label + " is not valid workbook XML.");
  return document;
}

function columnIndex(reference: string): number {
  const letters = reference.match(/^[A-Z]+/i)?.[0]?.toUpperCase() ?? "";
  let result = 0;
  for (const letter of letters) result = result * 26 + letter.charCodeAt(0) - 64;
  return Math.max(0, result - 1);
}

function resolveTarget(target: string): string {
  const clean = target.replace(/^\/+/, "");
  return clean.startsWith("xl/") ? clean : "xl/" + clean.replace(/^(\.\.\/)+/, "");
}

export function inspectWorkbook(input: ArrayBuffer | Uint8Array): WorkbookInspection {
  const bytes = ArrayBuffer.isView(input)
    ? Uint8Array.from(input as Uint8Array)
    : new Uint8Array(input);
  let totalXmlBytes = 0;
  const files = unzipSync(bytes, {
    filter(file) {
      const relevant = file.name === "xl/workbook.xml"
        || file.name === "xl/_rels/workbook.xml.rels"
        || file.name === "xl/sharedStrings.xml"
        || /^xl\/worksheets\/[^/]+[.]xml$/i.test(file.name);
      if (!relevant) return false;
      if (file.originalSize === undefined || file.originalSize > MAX_ENTRY_BYTES) {
        throw new Error("Workbook contains an oversized or unverifiable XML entry.");
      }
      totalXmlBytes += file.originalSize;
      if (totalXmlBytes > MAX_TOTAL_XML_BYTES) throw new Error("Workbook expands beyond the safe inspection limit.");
      return true;
    },
  });

  const workbookBytes = files["xl/workbook.xml"];
  const relationshipBytes = files["xl/_rels/workbook.xml.rels"];
  if (!workbookBytes || !relationshipBytes) {
    throw new Error("Workbook structure is incomplete.");
  }

  const workbookXml = parseXml(workbookBytes, "Workbook");
  const relationshipsXml = parseXml(relationshipBytes, "Workbook relationships");
  const relationships = new Map(
    Array.from(relationshipsXml.querySelectorAll("Relationship")).map((node) => [
      node.getAttribute("Id") ?? "",
      resolveTarget(node.getAttribute("Target") ?? ""),
    ]),
  );
  const sharedStrings = files["xl/sharedStrings.xml"]
    ? Array.from(parseXml(files["xl/sharedStrings.xml"], "Shared strings").querySelectorAll("si"))
      .map((node) => node.textContent ?? "")
    : [];

  const sheetNodes = Array.from(workbookXml.querySelectorAll("sheets > sheet"));
  if (sheetNodes.length === 0) throw new Error("Workbook contains no worksheets.");
  if (sheetNodes.length > MAX_SHEETS) throw new Error("Workbook contains too many worksheets for safe inspection.");

  const warnings: string[] = [];
  const sheets = sheetNodes.map((sheetNode): SheetInspection => {
    const name = (sheetNode.getAttribute("name") ?? "Unnamed sheet").slice(0, 160);
    const relationshipId = sheetNode.getAttribute("r:id")
      ?? sheetNode.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id")
      ?? "";
    const target = relationships.get(relationshipId);
    const sheetBytes = target ? files[target] : undefined;
    if (!sheetBytes) throw new Error('Worksheet "' + name + '" is missing from the workbook package.');
    const sheetXml = parseXml(sheetBytes, 'Worksheet "' + name + '"');
    const rowNodes = Array.from(sheetXml.querySelectorAll("sheetData > row"));
    if (rowNodes.length > MAX_ROWS_PER_SHEET) throw new Error('Worksheet "' + name + '" exceeds the safe row limit.');

    let maxColumn = -1;
    const candidates = rowNodes.slice(0, 20).map((rowNode) => {
      const rowNumber = Number(rowNode.getAttribute("r")) || 1;
      const values = new Map<number, string>();
      for (const cell of Array.from(rowNode.querySelectorAll(":scope > c"))) {
        const index = columnIndex(cell.getAttribute("r") ?? "");
        maxColumn = Math.max(maxColumn, index);
        const type = cell.getAttribute("t");
        const raw = cell.querySelector(":scope > v")?.textContent ?? "";
        const value = type === "s"
          ? sharedStrings[Number(raw)] ?? ""
          : type === "inlineStr"
            ? cell.querySelector(":scope > is")?.textContent ?? ""
            : raw;
        if (value.trim()) values.set(index, value.trim().slice(0, 160));
      }
      return { rowNumber, values };
    });
    for (const cell of Array.from(sheetXml.querySelectorAll("sheetData c"))) {
      maxColumn = Math.max(maxColumn, columnIndex(cell.getAttribute("r") ?? ""));
    }

    const best = candidates
      .filter((candidate) => candidate.values.size >= 2)
      .sort((a, b) => b.values.size - a.values.size || a.rowNumber - b.rowNumber)[0];
    const headers = best
      ? Array.from({ length: Math.min(maxColumn + 1, MAX_HEADERS) }, (_, index) => best.values.get(index) ?? "")
      : [];
    if (!best) warnings.push('No reliable header row found in "' + name + '".');
    if (maxColumn + 1 > MAX_HEADERS) warnings.push('Headers in "' + name + '" were capped at ' + MAX_HEADERS + " columns.");

    return {
      name,
      rowCount: rowNodes.length,
      columnCount: maxColumn + 1,
      headerRow: best?.rowNumber ?? null,
      headers,
    };
  });

  return { sheets, warnings };
}
