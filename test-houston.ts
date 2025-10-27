import { calculateQuotation } from './server/travelCalculator';

async function testHouston() {
  const address = "10685 Hazelhurst Dr b #32893, Houston, TX 77043";
  const trainingDays = 4;
  
  console.log('Testing Houston address:', address);
  console.log('Training days:', trainingDays);
  console.log('---');
  
  try {
    const result = await calculateQuotation(address, trainingDays);
    
    console.log('Results:');
    console.log('- Training Price:', `$${result.trainingPrice.toLocaleString()}`);
    console.log('- Nearest Airport:', result.travelExpenses.nearestAirport);
    console.log('- State:', result.travelExpenses.stateName);
    console.log('- Flight Cost:', `$${result.travelExpenses.flightCost.toLocaleString()}`);
    console.log('- Hotel Cost:', `$${result.travelExpenses.hotelCost.toLocaleString()}`);
    console.log('- Car Rental:', `$${result.travelExpenses.carRentalCost.toLocaleString()}`);
    console.log('- Food:', `$${result.travelExpenses.foodCost.toLocaleString()}`);
    console.log('- Travel Time Hours:', result.travelExpenses.travelTimeHours);
    console.log('- Travel Time Cost:', `$${result.travelExpenses.travelTimeCost.toLocaleString()}`);
    console.log('- Total Travel Expenses:', `$${result.travelExpenses.totalTravelExpenses.toLocaleString()}`);
    console.log('- GRAND TOTAL:', `$${result.totalPrice.toLocaleString()}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

testHouston();
