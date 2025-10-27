import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const excelPath = path.join(__dirname, 'server', 'travel-calculator-data.xlsx');
const workbook = XLSX.readFile(excelPath);
const worksheet = workbook.Sheets['Base Datos USA'];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

const stateMap = new Map();

for (let i = 3; i < Math.min(10, data.length); i++) {
  const row = data[i];
  if (!row[0]) continue;
  
  const key = row[0].toUpperCase();
  stateMap.set(key, { airport: row[2], flight: row[3] });
  console.log(`Row ${i}: "${row[0]}" -> Key: "${key}" -> Airport: ${row[2]}, Flight: $${row[3]}`);
}

console.log('\nLooking for "TX":',  stateMap.has('TX'));
console.log('Looking for "TEXAS":', stateMap.has('TEXAS'));
