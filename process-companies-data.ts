import { readTXT, writeCSV } from 'https://deno.land/x/flat@0.0.11/mod.ts'

const filename = Deno.args[0]

const text = await readTXT(filename)

// Strip blank lines
const data = text.split(/[\r\n]+/).filter((line: string) => line.replace(/,/g, '').length > 0).join('\n');

await writeCSV(filename, data);
