/**
 * Test script for Odessa, TX address
 */

import { calculateQuotation } from './travelCalculator';

async function testOdessaAddress() {
  console.log('🧪 Testing Odessa, TX Address...\n');

  const odessaAddress = '3701 W. 12TH ST., Odessa, TX 79763';
  
  console.log(`Address: ${odessaAddress}\n`);
  console.log('Calculating quotation...\n');
  
  const result = await calculateQuotation(odessaAddress, 2, 'Odessa', 'TX');
  
  console.log('='.repeat(70));
  console.log('📍 NEAREST AIRPORT DETECTION');
  console.log('='.repeat(70));
  console.log(`Nearest Airport: ${result.travelExpenses.nearestAirport}`);
  console.log('');
  
  console.log('='.repeat(70));
  console.log('✈️ FLIGHT DETAILS');
  console.log('='.repeat(70));
  console.log(`Flight Cost (Round Trip): $${result.travelExpenses.flightCost}`);
  console.log(`Flight Time (One-Way): ${result.travelExpenses.flightTimeOneWay} hours`);
  console.log('');
  
  console.log('='.repeat(70));
  console.log('🚗 DRIVING DETAILS');
  console.log('='.repeat(70));
  console.log(`Driving Time (Airport to Client): ${result.travelExpenses.drivingTimeOneWay} hours`);
  console.log('');
  
  console.log('='.repeat(70));
  console.log('⏱️ TOTAL TRAVEL TIME');
  console.log('='.repeat(70));
  console.log(`Formula: (${result.travelExpenses.flightTimeOneWay}h flight + ${result.travelExpenses.drivingTimeOneWay}h driving) × 2 (round trip)`);
  console.log(`Total Travel Hours: ${result.travelExpenses.travelTimeHours} hours`);
  console.log(`Travel Time Cost: $${result.travelExpenses.travelTimeCost} (${result.travelExpenses.travelTimeHours} hrs × $110/hr)`);
  console.log('');
  
  console.log('='.repeat(70));
  console.log('💰 COMPLETE QUOTATION BREAKDOWN');
  console.log('='.repeat(70));
  console.log(`Training Price (2 days): $${result.trainingPrice}`);
  console.log(`  - First day: $1,400`);
  console.log(`  - Additional day: $1,000`);
  console.log('');
  console.log(`Travel Time Cost: $${result.travelExpenses.travelTimeCost}`);
  console.log('');
  console.log(`Travel Expenses: $${result.travelExpenses.totalTravelExpenses}`);
  console.log(`  - Flight (Round Trip): $${result.travelExpenses.flightCost}`);
  console.log(`  - Hotel (${2} nights × $130): $${result.travelExpenses.hotelCost}`);
  console.log(`  - Car Rental (${result.travelExpenses.carRentalDays} days × $${result.travelExpenses.carRentalDailyRate}): $${result.travelExpenses.carRentalCost}`);
  console.log(`  - Food (${3} days × $68): $${result.travelExpenses.foodCost}`);
  console.log('');
  console.log(`GRAND TOTAL: $${result.totalPrice}`);
  console.log('='.repeat(70));
}

testOdessaAddress().catch(error => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});
