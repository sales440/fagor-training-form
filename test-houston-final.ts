import { calculateQuotation } from './server/travelCalculator';

async function test() {
  const address = "10685 Hazelhurst Dr b #32893, Houston, TX 77043";
  const days = 4;
  
  console.log('Testing:', address);
  console.log('Days:', days);
  console.log('---');
  
  const result = await calculateQuotation(address, days);
  
  console.log('Airport:', result.travelExpenses.nearestAirport);
  console.log('State:', result.travelExpenses.stateName);
  console.log('Flight Cost:', `$${result.travelExpenses.flightCost}`);
  console.log('Training:', `$${result.trainingPrice}`);
  console.log('TOTAL:', `$${result.totalPrice}`);
}

test().catch(console.error);
