import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const excelPath = path.join(__dirname, 'server', 'travel-calculator-data.xlsx');
console.log('Excel path:', excelPath);
console.log('File exists:', fs.existsSync(excelPath));

try {
  const workbook = XLSX.readFile(excelPath);
  console.log('Sheet names:', workbook.SheetNames);
  
  const worksheet = workbook.Sheets['Base Datos USA'];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('Total rows:', data.length);
  
  // Find Texas
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    if (row[0] === 'Texas') {
      console.log('\nTexas data found at row', i, ':');
      console.log('- State:', row[0]);
      console.log('- City:', row[1]);
      console.log('- Airport:', row[2]);
      console.log('- Flight Economy:', row[3]);
      console.log('- Distance:', row[5]);
      console.log('- Hotel avg:', row[7]);
      break;
    }
  }
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
}
