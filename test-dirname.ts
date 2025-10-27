import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('__filename:', __filename);
console.log('__dirname:', __dirname);
console.log('Excel path:', path.join(__dirname, 'server', 'travel-calculator-data.xlsx'));
