import { calculateQuotation } from './server/travelCalculator.ts';

const testCases = [
  { name: "Illinois (Chicago area)", address: "123 Main St, Chicago, IL 60601", days: 3 },
  { name: "Illinois (Springfield)", address: "456 Oak Ave, Springfield, IL 62701", days: 3 },
  { name: "California (Los Angeles)", address: "789 Sunset Blvd, Los Angeles, CA 90028", days: 3 },
  { name: "California (San Francisco)", address: "101 Market St, San Francisco, CA 94102", days: 3 },
  { name: "Texas (Houston)", address: "620 South 4th Ave, Mansfield, TX 76063", days: 3 },
  { name: "New York", address: "350 5th Ave, New York, NY 10118", days: 3 },
  { name: "Washington (Seattle)", address: "400 Broad St, Seattle, WA 98109", days: 3 },
  { name: "Arizona (Phoenix)", address: "200 W Washington St, Phoenix, AZ 85003", days: 3 },
];

console.log("Testing flight logic for different locations:\n");

for (const test of testCases) {
  try {
    const result = await calculateQuotation(test.address, test.days);
    const flightCost = result.travelExpenses.flightCost;
    const airport = result.travelExpenses.nearestAirport;
    const state = test.address.match(/,\s*([A-Z]{2})\s+\d{5}/)?.[1] || 'Unknown';
    
    console.log(`${test.name} (${state}):`);
    console.log(`  Airport: ${airport}`);
    console.log(`  Flight Cost: $${flightCost}`);
    console.log(`  Status: ${flightCost === 0 ? '✓ No flight (local)' : '✓ Flight included'}`);
    console.log('');
  } catch (error) {
    console.log(`${test.name}: ✗ ERROR - ${error.message}\n`);
  }
}
