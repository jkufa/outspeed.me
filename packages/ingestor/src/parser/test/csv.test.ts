import { describe, expect, it } from "vitest";
import { parseCsvLine, rowsToCsv, toCsvCell } from "../csv";

describe("parseCsvLine", () => {
  it("parses quoted commas", () => {
    expect(parseCsvLine('1,"Mr. Mime, Jr.",mime')).toEqual(["1", "Mr. Mime, Jr.", "mime"]);
  });

  it("parses escaped quotes", () => {
    expect(parseCsvLine('1,"Farfetch""d",farfetchd')).toEqual(["1", 'Farfetch"d', "farfetchd"]);
  });
});

describe("toCsvCell", () => {
  it("quotes cells with commas, quotes, or newlines", () => {
    expect(toCsvCell('Mr. "Mime", Jr.\nSpeed')).toBe('"Mr. ""Mime"", Jr.\nSpeed"');
  });
});

describe("rowsToCsv", () => {
  it("serializes rows with a trailing newline", () => {
    expect(
      rowsToCsv([
        ["name", "value"],
        ["Mr. Mime", "122"],
      ]),
    ).toBe("name,value\nMr. Mime,122\n");
  });
});
