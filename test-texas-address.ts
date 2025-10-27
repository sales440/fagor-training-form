import { calculateTravelExpenses } from './server/travelCalculator';

async function testTexasAddress() {
  const address = "620 SOUTH 4TH.AVE. MANSFIELD TX.76063";
  const trainingDays = 3;
  
  console.log('Testing address:', address);
  console.log('Training days:', trainingDays);
  console.log('---');
  
  const result = await calculateTravelExpenses(address, trainingDays);
  
  console.log('Results:');
  console.log('- Nearest Airport:', result.nearestAirport);
  console.log('- State:', result.stateName);
  console.log('- Flight Cost (Round Trip):', `$${result.flightCost.toLocaleString()}`);
  console.log('- Driving Time (One Way):', `${(result.travelTimeHours / 2).toFixed(2)} hours`);
  console.log('- Total Travel Time (Round Trip):', `${result.travelTimeHours} hours`);
  console.log('- Hotel Cost:', `$${result.hotelCost.toLocaleString()}`);
  console.log('- Car Rental Cost:', `$${result.carRentalCost.toLocaleString()}`);
  console.log('- Food Cost:', `$${result.foodCost.toLocaleString()}`);
  console.log('- Travel Time Cost:', `$${result.travelTimeCost.toLocaleString()}`);
  console.log('- Total Travel Expenses:', `$${result.totalTravelExpenses.toLocaleString()}`);
}

testTexasAddress().catch(console.error);
