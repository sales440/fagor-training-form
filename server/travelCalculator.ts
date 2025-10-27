/**
 * Travel Calculator Service
 * Calculates travel expenses based on client location
 */

interface TravelCalculation {
  nearestAirport: string;
  flightCost: number;
  hotelCost: number;
  foodCost: number;
  carRentalCost: number;
  travelTimeHours: number;
  travelTimeCost: number;
  totalTravelExpenses: number;
}

// Base prices for training (per day, 6 hours, max 4 participants)
export const TRAINING_PRICE_PER_DAY = 1200; // USD
export const TRAVEL_TIME_HOURLY_RATE = 110; // USD per hour

// Average travel costs (these would be updated weekly from external APIs)
const AVERAGE_COSTS = {
  hotel: 150, // per night
  food: 75, // per day
  carRental: 60, // per day
  flightBase: 400, // base flight cost from Chicago O'Hare
};

// Major US airports with approximate flight times from Chicago O'Hare (in hours)
const AIRPORT_DATA: Record<string, { code: string; flightTime: number; flightCost: number }> = {
  // East Coast
  "new york": { code: "JFK", flightTime: 2.5, flightCost: 250 },
  "boston": { code: "BOS", flightTime: 2.5, flightCost: 280 },
  "washington": { code: "DCA", flightTime: 2, flightCost: 240 },
  "atlanta": { code: "ATL", flightTime: 2, flightCost: 220 },
  "miami": { code: "MIA", flightTime: 3, flightCost: 300 },
  "philadelphia": { code: "PHL", flightTime: 2, flightCost: 240 },
  
  // West Coast
  "los angeles": { code: "LAX", flightTime: 4, flightCost: 350 },
  "san francisco": { code: "SFO", flightTime: 4.5, flightCost: 380 },
  "seattle": { code: "SEA", flightTime: 4, flightCost: 360 },
  "san diego": { code: "SAN", flightTime: 4, flightCost: 340 },
  "portland": { code: "PDX", flightTime: 4, flightCost: 350 },
  
  // Central
  "dallas": { code: "DFW", flightTime: 2.5, flightCost: 260 },
  "houston": { code: "IAH", flightTime: 2.5, flightCost: 270 },
  "denver": { code: "DEN", flightTime: 2.5, flightCost: 280 },
  "phoenix": { code: "PHX", flightTime: 3.5, flightCost: 300 },
  "las vegas": { code: "LAS", flightTime: 3.5, flightCost: 290 },
  "minneapolis": { code: "MSP", flightTime: 1.5, flightCost: 200 },
  "detroit": { code: "DTW", flightTime: 1, flightCost: 180 },
  "st louis": { code: "STL", flightTime: 1, flightCost: 180 },
  
  // South
  "orlando": { code: "MCO", flightTime: 3, flightCost: 290 },
  "tampa": { code: "TPA", flightTime: 3, flightCost: 280 },
  "charlotte": { code: "CLT", flightTime: 2, flightCost: 230 },
  "nashville": { code: "BNA", flightTime: 1.5, flightCost: 210 },
  "new orleans": { code: "MSY", flightTime: 2.5, flightCost: 270 },
};

/**
 * Find nearest airport based on address
 */
function findNearestAirport(address: string): { code: string; flightTime: number; flightCost: number } {
  const addressLower = address.toLowerCase();
  
  // Try to match city names in the address
  for (const [city, data] of Object.entries(AIRPORT_DATA)) {
    if (addressLower.includes(city)) {
      return data;
    }
  }
  
  // Extract state abbreviations
  const stateMatch = address.match(/\b([A-Z]{2})\b/);
  if (stateMatch) {
    const state = stateMatch[1];
    const stateAirports: Record<string, string> = {
      "NY": "new york",
      "CA": "los angeles",
      "TX": "dallas",
      "FL": "miami",
      "IL": "chicago",
      "PA": "philadelphia",
      "OH": "detroit",
      "GA": "atlanta",
      "NC": "charlotte",
      "MI": "detroit",
      "WA": "seattle",
      "AZ": "phoenix",
      "MA": "boston",
      "TN": "nashville",
      "CO": "denver",
      "MN": "minneapolis",
      "MO": "st louis",
      "OR": "portland",
      "NV": "las vegas",
    };
    
    if (stateAirports[state] && AIRPORT_DATA[stateAirports[state]]) {
      return AIRPORT_DATA[stateAirports[state]];
    }
  }
  
  // Default to Chicago (local training)
  return { code: "ORD", flightTime: 0.5, flightCost: 100 };
}

/**
 * Calculate travel expenses based on client address and training days
 */
export function calculateTravelExpenses(
  address: string,
  trainingDays: number
): TravelCalculation {
  const airport = findNearestAirport(address);
  
  // Estimate driving time from airport to client location (average 1 hour)
  const drivingTimeOneWay = 1;
  
  // Total travel time: flight + driving (round trip)
  const travelTimeHours = (airport.flightTime + drivingTimeOneWay) * 2;
  
  // Calculate costs
  const flightCost = airport.flightCost * 2; // Round trip
  const hotelCost = AVERAGE_COSTS.hotel * trainingDays; // Hotel for training days
  const foodCost = AVERAGE_COSTS.food * (trainingDays + 1); // Food for training days + travel day
  const carRentalCost = AVERAGE_COSTS.carRental * (trainingDays + 1); // Car rental for all days
  const travelTimeCost = Math.ceil(travelTimeHours) * TRAVEL_TIME_HOURLY_RATE;
  
  const totalTravelExpenses = flightCost + hotelCost + foodCost + carRentalCost;
  
  return {
    nearestAirport: airport.code,
    flightCost,
    hotelCost,
    foodCost,
    carRentalCost,
    travelTimeHours: Math.ceil(travelTimeHours),
    travelTimeCost,
    totalTravelExpenses,
  };
}

/**
 * Calculate total quotation
 */
export function calculateQuotation(
  address: string,
  trainingDays: number
): {
  trainingPrice: number;
  travelExpenses: TravelCalculation;
  totalPrice: number;
} {
  const trainingPrice = TRAINING_PRICE_PER_DAY * trainingDays;
  const travelExpenses = calculateTravelExpenses(address, trainingDays);
  const totalPrice = trainingPrice + travelExpenses.totalTravelExpenses + travelExpenses.travelTimeCost;
  
  return {
    trainingPrice,
    travelExpenses,
    totalPrice,
  };
}

