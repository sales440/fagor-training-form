import { calculateQuotation } from './server/travelCalculator';

async function test() {
  const result = await calculateQuotation(
    '1234 Main St, Houston, TX 77001',
    2,
    'Houston',
    'TX'
  );
  
  console.log('=== TEXAS FLIGHT COST TEST ===');
  console.log('Flight Cost:', result.travelExpenses.flightCost);
  console.log('Expected: $734 (367 x 2)');
  console.log('Match:', result.travelExpenses.flightCost === 734 ? '✓ CORRECT' : '✗ WRONG');
}

test().catch(console.error);
