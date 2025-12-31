/**
 * Test script to verify address parsing and travel calculation fixes
 */

import { calculateQuotation } from './travelCalculator';

async function testTravelCalculation() {
  console.log('🧪 Testing Travel Calculation Fixes...\n');

  // Test Case 1: Houston, TX (should use IAH airport, ~2 hour flight, ~1 hour driving)
  console.log('Test 1: Houston, TX Address');
  console.log('Expected: IAH airport, $734 flight, ~2h flight + ~1h driving = ~6h total\n');
  
  const houstonAddress = '1234 Main St, Houston, TX 77001';
  const houstonResult = await calculateQuotation(houstonAddress, 2, 'Houston', 'TX');
  
  console.log('Results:');
  console.log(`  Nearest Airport: ${houstonResult.travelExpenses.nearestAirport}`);
  console.log(`  Flight Cost: $${houstonResult.travelExpenses.flightCost}`);
  console.log(`  Flight Time (one-way): ${houstonResult.travelExpenses.flightTimeOneWay} hours`);
  console.log(`  Driving Time (one-way): ${houstonResult.travelExpenses.drivingTimeOneWay} hours`);
  console.log(`  Total Travel Hours: ${houstonResult.travelExpenses.travelTimeHours} hours`);
  console.log(`  Travel Time Cost: $${houstonResult.travelExpenses.travelTimeCost}`);
  console.log(`  Training Price: $${houstonResult.trainingPrice}`);
  console.log(`  Total Price: $${houstonResult.totalPrice}\n`);

  // Verify expectations
  const isIAH = houstonResult.travelExpenses.nearestAirport.includes('IAH');
  const isFlightCorrect = houstonResult.travelExpenses.flightCost >= 700 && houstonResult.travelExpenses.flightCost <= 800;
  const isDrivingReasonable = houstonResult.travelExpenses.drivingTimeOneWay < 3; // Should be ~1 hour, NOT 37
  const isTravelTimeReasonable = houstonResult.travelExpenses.travelTimeHours < 10; // Should be ~6 hours, NOT 74
  
  console.log('✅ Validation:');
  console.log(`  ${isIAH ? '✅' : '❌'} Airport is IAH: ${isIAH}`);
  console.log(`  ${isFlightCorrect ? '✅' : '❌'} Flight cost is ~$734: ${isFlightCorrect}`);
  console.log(`  ${isDrivingReasonable ? '✅' : '❌'} Driving time is reasonable (<3h): ${isDrivingReasonable}`);
  console.log(`  ${isTravelTimeReasonable ? '✅' : '❌'} Total travel time is reasonable (<10h): ${isTravelTimeReasonable}\n`);

  // Test Case 2: Miami, FL (should use MIA airport, ~3 hour flight)
  console.log('\nTest 2: Miami, FL Address');
  console.log('Expected: MIA airport, ~$600 flight, ~3h flight + ~1h driving = ~8h total\n');
  
  const miamiAddress = '5678 Ocean Dr, Miami, FL 33139';
  const miamiResult = await calculateQuotation(miamiAddress, 2, 'Miami', 'FL');
  
  console.log('Results:');
  console.log(`  Nearest Airport: ${miamiResult.travelExpenses.nearestAirport}`);
  console.log(`  Flight Cost: $${miamiResult.travelExpenses.flightCost}`);
  console.log(`  Flight Time (one-way): ${miamiResult.travelExpenses.flightTimeOneWay} hours`);
  console.log(`  Driving Time (one-way): ${miamiResult.travelExpenses.drivingTimeOneWay} hours`);
  console.log(`  Total Travel Hours: ${miamiResult.travelExpenses.travelTimeHours} hours`);
  console.log(`  Total Price: $${miamiResult.totalPrice}\n`);

  const isMIA = miamiResult.travelExpenses.nearestAirport.includes('MIA');
  const isMiamiDrivingReasonable = miamiResult.travelExpenses.drivingTimeOneWay < 3;
  const isMiamiTravelTimeReasonable = miamiResult.travelExpenses.travelTimeHours < 12;
  
  console.log('✅ Validation:');
  console.log(`  ${isMIA ? '✅' : '❌'} Airport is MIA: ${isMIA}`);
  console.log(`  ${isMiamiDrivingReasonable ? '✅' : '❌'} Driving time is reasonable (<3h): ${isMiamiDrivingReasonable}`);
  console.log(`  ${isMiamiTravelTimeReasonable ? '✅' : '❌'} Total travel time is reasonable (<12h): ${isMiamiTravelTimeReasonable}\n`);

  // Overall result
  const allTestsPassed = isIAH && isFlightCorrect && isDrivingReasonable && isTravelTimeReasonable && 
                         isMIA && isMiamiDrivingReasonable && isMiamiTravelTimeReasonable;
  
  console.log('\n' + '='.repeat(60));
  console.log(allTestsPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED');
  console.log('='.repeat(60));
  
  process.exit(allTestsPassed ? 0 : 1);
}

testTravelCalculation().catch(error => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});
