export function parseCsvLine(line: string) {
  const columns: string[] = [];
  let currentColumn = "";
  let isQuoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && isQuoted && nextCharacter === '"') {
      currentColumn += character;
      index += 1;
      continue;
    }

    if (character === '"') {
      isQuoted = !isQuoted;
      continue;
    }

    if (character === "," && !isQuoted) {
      columns.push(currentColumn);
      currentColumn = "";
      continue;
    }

    currentColumn += character;
  }

  columns.push(currentColumn);
  return columns;
}

export function toCsvCell(value: string) {
  if (!/[",\n]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

export function rowsToCsv(rows: string[][]) {
  return `${rows.map((row) => row.map(toCsvCell).join(",")).join("\n")}\n`;
}
