const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, 'server', 'travel-calculator-data.xlsx');
console.log('Excel path:', excelPath);
console.log('File exists:', require('fs').existsSync(excelPath));

try {
  const workbook = XLSX.readFile(excelPath);
  console.log('Sheet names:', workbook.SheetNames);
  
  const worksheet = workbook.Sheets['Base Datos USA'];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('Total rows:', data.length);
  console.log('Row 3 (Texas):', data[3]);
  
  // Find Texas
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    if (row[0] === 'Texas') {
      console.log('\nTexas data:');
      console.log('- State:', row[0]);
      console.log('- City:', row[1]);
      console.log('- Airport:', row[2]);
      console.log('- Flight Economy:', row[3]);
      console.log('- Distance:', row[5]);
      break;
    }
  }
} catch (error) {
  console.error('Error:', error.message);
}
