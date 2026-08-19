import { describe, expect, it } from "vitest";
import { inspectWorkbook } from "./inspectWorkbook";

function decodeFixture(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

const COMPLETE_FIXTURE = "UEsDBBQAAAAIAFSVE13Oy0h2kAAAALUAAAAPAAAAeGwvd29ya2Jvb2sueG1sNY5BDsIgEEWvQjhAaV24aIBudOHaEyCdCmlhyDBqvb0s7Orn5+X/PD3taRNvoBoxGzl0vZys/iCtD8RVNJjrSEYG5jIqVX2A5GqHBXJjC1Jy3Co9FS5L9HBB/0qQWZ36/qwINsftuIZYqrS6BgCu/xTZJTDy/s0cgKMX170gsRQ0xtlIus2DVFarY6QOK/sDUEsDBBQAAAAIAFSVE13xPc9CUAAAAGwAAAAaAAAAeGwvX3JlbHMvd29ya2Jvb2sueG1sLnJlbHOzsa/IzVEoSy0qzszPs1Uy1DNQsrezCUrNSSwBChRnZBYUo3IVPFNslYo8UwyVFEISi9JTS2yVyvOLsoszUlNLivXBlKEe0EwlfTsbfVRzAFBLAwQUAAAACABUlRNdKUugGUwAAABsAAAAFAAAAHhsL3NoYXJlZFN0cmluZ3MueG1ss7GvyM1RKEstKs7Mz7NVMtQzULK3sykuLgESmXY2JXaOxcWpJQqeLjb6QCF9kBhEPDi1KDMxR8GvNDcptQhDMtJP18DAECGsDzIRAFBLAwQUAAAACABUlRNdV04Md3AAAADRAAAAGAAAAHhsL3dvcmtzaGVldHMvc2hlZXQxLnhtbF2OSwqFMAxFt1KygJe24xh54kZECoqfQluqy7d+qMVREu7h5FK9L7OIxvnRrhWon4SaabNu8oMxgekabRc6Jmc34RIDTP25/BWIUIFPd2RJGJmwf7KmzFTOMDmySGeRLmD9EZ1UUsj3wS3Bohm+hQ9QSwECFAAUAAAACABUlRNdzstIdpAAAAC1AAAADwAAAAAAAAAAAAAAAAAAAAAAeGwvd29ya2Jvb2sueG1sUEsBAhQAFAAAAAgAVJUTXfE9z0JQAAAAbAAAABoAAAAAAAAAAAAAAAAAvQAAAHhsL19yZWxzL3dvcmtib29rLnhtbC5yZWxzUEsBAhQAFAAAAAgAVJUTXSlLoBlMAAAAbAAAABQAAAAAAAAAAAAAAAAARQEAAHhsL3NoYXJlZFN0cmluZ3MueG1sUEsBAhQAFAAAAAgAVJUTXVdODHdwAAAA0QAAABgAAAAAAAAAAAAAAAAAwwEAAHhsL3dvcmtzaGVldHMvc2hlZXQxLnhtbFBLBQYAAAAABAAEAA0BAABpAgAAAAA=";
const INCOMPLETE_FIXTURE = "UEsDBBQAAAAIAFeVE13OnpgTDQAAAAsAAAAPAAAAeGwvd29ya2Jvb2sueG1ssynPL8pOys/P1rcDAFBLAQIUABQAAAAIAFeVE13OnpgTDQAAAAsAAAAPAAAAAAAAAAAAAAAAAAAAAAB4bC93b3JrYm9vay54bWxQSwUGAAAAAAEAAQA9AAAAOgAAAAAA";

describe("workbook inspection", () => {
  it("returns structural metadata without row values", () => {
    const result = inspectWorkbook(decodeFixture(COMPLETE_FIXTURE));
    expect(result).toEqual({
      sheets: [{
        name: "Synthetic Export",
        rowCount: 2,
        columnCount: 2,
        headerRow: 1,
        headers: ["Asset ID", "Serial Number"],
      }],
      warnings: [],
    });
    expect(JSON.stringify(result)).not.toContain("SYN-001");
  });

  it("rejects an incomplete workbook package", () => {
    expect(() => inspectWorkbook(decodeFixture(INCOMPLETE_FIXTURE))).toThrow("Workbook structure is incomplete");
  });
});
