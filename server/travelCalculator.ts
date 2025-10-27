/**
 * Travel Calculator Service
 * Calculates travel expenses based on client location using real data from Excel
 */

import * as XLSX from 'xlsx';
import * as path from 'path';

interface TravelCalculation {
  nearestAirport: string;
  flightCost: number;
  hotelCost: number;
  foodCost: number;
  carRentalCost: number;
  travelTimeHours: number;
  travelTimeCost: number;
  totalTravelExpenses: number;
  stateName?: string;
}

interface StateData {
  estado: string;
  ciudad_principal: string;
  codigo_aeropuerto: string;
  precio_vuelo_economia: number;
  precio_vuelo_business: number;
  distancia_millas: number;
  hampton_inn_promedio: number;
  compact_dia: number;
  midsize_dia: number;
  fullsize_dia: number;
}

// Base prices for training (per day, 6 hours, max 4 participants)
export const TRAINING_PRICE_FIRST_DAY = 1400; // USD - First day
export const TRAINING_PRICE_ADDITIONAL_DAY = 1000; // USD - Additional days during same visit
export const TRAVEL_TIME_HOURLY_RATE = 110; // USD per hour
export const FOOD_COST_PER_DAY = 68; // GSA M&IE standard rate

// Cache for Excel data
let stateDataCache: Map<string, StateData> | null = null;

/**
 * Load state data from Excel file
 */
function loadStateData(): Map<string, StateData> {
  if (stateDataCache) {
    return stateDataCache;
  }

  try {
    const excelPath = path.join(__dirname, 'travel-calculator-data.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const sheetName = 'Base Datos USA';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    stateDataCache = new Map();

    // Skip header rows (first 3 rows)
    for (let i = 3; i < data.length; i++) {
      const row = data[i] as any[];
      if (!row[0]) continue; // Skip empty rows

      const stateData: StateData = {
        estado: row[0],
        ciudad_principal: row[1],
        codigo_aeropuerto: row[2],
        precio_vuelo_economia: Number(row[3]) || 0,
        precio_vuelo_business: Number(row[4]) || 0,
        distancia_millas: Number(row[5]) || 0,
        hampton_inn_promedio: Number(row[7]) || 125,
        compact_dia: Number(row[10]) || 42,
        midsize_dia: Number(row[11]) || 48,
        fullsize_dia: Number(row[12]) || 55,
      };

      stateDataCache.set(stateData.estado.toUpperCase(), stateData);
    }

    return stateDataCache;
  } catch (error) {
    console.error('Error loading state data from Excel:', error);
    // Return empty map if file cannot be loaded
    return new Map();
  }
}

/**
 * Extract state from address
 */
function extractStateFromAddress(address: string): string | null {
  // Try to find 2-letter state code
  const stateMatch = address.match(/\b([A-Z]{2})\b/);
  if (stateMatch) {
    return stateMatch[1].toUpperCase();
  }

  // Try to match full state names
  const stateNames: Record<string, string> = {
    'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR',
    'CALIFORNIA': 'CA', 'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE',
    'FLORIDA': 'FL', 'GEORGIA': 'GA', 'HAWAII': 'HI', 'IDAHO': 'ID',
    'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA', 'KANSAS': 'KS',
    'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
    'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS',
    'MISSOURI': 'MO', 'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV',
    'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ', 'NEW MEXICO': 'NM', 'NEW YORK': 'NY',
    'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH', 'OKLAHOMA': 'OK',
    'OREGON': 'OR', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC',
    'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT',
    'VERMONT': 'VT', 'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV',
    'WISCONSIN': 'WI', 'WYOMING': 'WY'
  };

  const addressUpper = address.toUpperCase();
  for (const [fullName, code] of Object.entries(stateNames)) {
    if (addressUpper.includes(fullName)) {
      return code;
    }
  }

  return null;
}

/**
 * Calculate actual driving time from airport to destination using Google Maps API
 */
async function calculateDrivingTime(airportCode: string, destinationAddress: string): Promise<number> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('[Travel Calculator] Google Maps API key not configured, using default 1 hour');
      return 1.0;
    }

    // Get airport coordinates (approximate)
    const airportCoords = getAirportCoordinates(airportCode);
    if (!airportCoords) {
      console.warn(`[Travel Calculator] Airport ${airportCode} coordinates not found, using default 1 hour`);
      return 1.0;
    }

    const origin = `${airportCoords.lat},${airportCoords.lng}`;
    const destination = encodeURIComponent(destinationAddress);
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const durationSeconds = data.rows[0].elements[0].duration.value;
      const durationHours = durationSeconds / 3600;
      console.log(`[Travel Calculator] Driving time from ${airportCode} to destination: ${durationHours.toFixed(2)} hours`);
      return durationHours;
    } else {
      console.warn(`[Travel Calculator] Google Maps API error: ${data.status}, using default 1 hour`);
      return 1.0;
    }
  } catch (error) {
    console.error('[Travel Calculator] Error calling Google Maps API:', error);
    return 1.0; // Default fallback
  }
}

/**
 * Get approximate airport coordinates
 */
function getAirportCoordinates(code: string): { lat: number; lng: number } | null {
  const airports: Record<string, { lat: number; lng: number }> = {
    'ORD': { lat: 41.9742, lng: -87.9073 }, // Chicago O'Hare
    'BHM': { lat: 33.5629, lng: -86.7535 }, // Birmingham
    'ANC': { lat: 61.1743, lng: -149.9962 }, // Anchorage
    'PHX': { lat: 33.4352, lng: -112.0101 }, // Phoenix
    'LIT': { lat: 34.7294, lng: -92.2243 }, // Little Rock
    'LAX': { lat: 33.9416, lng: -118.4085 }, // Los Angeles
    'DEN': { lat: 39.8561, lng: -104.6737 }, // Denver
    'BDL': { lat: 41.9389, lng: -72.6832 }, // Hartford
    'ILG': { lat: 39.6787, lng: -75.6065 }, // Wilmington
    'MIA': { lat: 25.7959, lng: -80.2870 }, // Miami
    'ATL': { lat: 33.6407, lng: -84.4277 }, // Atlanta
    'HNL': { lat: 21.3187, lng: -157.9225 }, // Honolulu
    'BOI': { lat: 43.5644, lng: -116.2228 }, // Boise
    'IND': { lat: 39.7173, lng: -86.2944 }, // Indianapolis
    'DSM': { lat: 41.5340, lng: -93.6631 }, // Des Moines
    'ICT': { lat: 37.6499, lng: -97.4331 }, // Wichita
    'SDF': { lat: 38.1744, lng: -85.7364 }, // Louisville
    'MSY': { lat: 29.9934, lng: -90.2580 }, // New Orleans
    'PWM': { lat: 43.6456, lng: -70.3092 }, // Portland ME
    'BWI': { lat: 39.1774, lng: -76.6684 }, // Baltimore
    'BOS': { lat: 42.3656, lng: -71.0096 }, // Boston
    'DTW': { lat: 42.2162, lng: -83.3554 }, // Detroit
    'MSP': { lat: 44.8848, lng: -93.2223 }, // Minneapolis
    'JAN': { lat: 32.3112, lng: -90.0759 }, // Jackson
    'MCI': { lat: 39.2976, lng: -94.7139 }, // Kansas City
    'BIL': { lat: 45.8077, lng: -108.5430 }, // Billings
    'OMA': { lat: 41.3032, lng: -95.8941 }, // Omaha
    'LAS': { lat: 36.0840, lng: -115.1537 }, // Las Vegas
    'MHT': { lat: 42.9326, lng: -71.4357 }, // Manchester
    'EWR': { lat: 40.6895, lng: -74.1745 }, // Newark
    'ABQ': { lat: 35.0402, lng: -106.6092 }, // Albuquerque
    'LGA': { lat: 40.7769, lng: -73.8740 }, // New York LaGuardia
    'JFK': { lat: 40.6413, lng: -73.7781 }, // New York JFK
    'CLT': { lat: 35.2144, lng: -80.9473 }, // Charlotte
    'FAR': { lat: 46.9207, lng: -96.8158 }, // Fargo
    'CLE': { lat: 41.4117, lng: -81.8498 }, // Cleveland
    'OKC': { lat: 35.3931, lng: -97.6007 }, // Oklahoma City
    'PDX': { lat: 45.5898, lng: -122.5951 }, // Portland OR
    'PHL': { lat: 39.8744, lng: -75.2424 }, // Philadelphia
    'PVD': { lat: 41.7240, lng: -71.4281 }, // Providence
    'CHS': { lat: 32.8986, lng: -80.0405 }, // Charleston
    'FSD': { lat: 43.5820, lng: -96.7420 }, // Sioux Falls
    'BNA': { lat: 36.1245, lng: -86.6782 }, // Nashville
    'DFW': { lat: 32.8998, lng: -97.0403 }, // Dallas
    'SLC': { lat: 40.7899, lng: -111.9791 }, // Salt Lake City
    'BTV': { lat: 44.4719, lng: -73.1533 }, // Burlington
    'RIC': { lat: 37.5052, lng: -77.3197 }, // Richmond
    'SEA': { lat: 47.4502, lng: -122.3088 }, // Seattle
    'CRW': { lat: 38.3731, lng: -81.5932 }, // Charleston WV
  };
  
  return airports[code] || null;
}

/**
 * Estimate flight time based on distance
 * Average commercial flight speed: ~500 mph
 */
function estimateFlightTime(distanceMiles: number): number {
  if (distanceMiles === 0) return 0.5; // Local, minimal travel
  return (distanceMiles / 500) + 0.5; // Add 0.5 hours for taxi/takeoff/landing
}

/**
 * Calculate travel expenses based on client address and training days
 */
export async function calculateTravelExpenses(
  address: string,
  trainingDays: number
): Promise<TravelCalculation> {
  const stateData = loadStateData();
  const stateCode = extractStateFromAddress(address);

  let state: StateData | undefined;
  if (stateCode) {
    state = stateData.get(stateCode);
  }

  // Default values if state not found (Illinois/Chicago)
  if (!state) {
    state = {
      estado: 'Illinois',
      ciudad_principal: 'Chicago',
      codigo_aeropuerto: 'ORD',
      precio_vuelo_economia: 0,
      precio_vuelo_business: 0,
      distancia_millas: 0,
      hampton_inn_promedio: 180,
      compact_dia: 35,
      midsize_dia: 42,
      fullsize_dia: 48,
    };
  }

  // Calculate flight time from distance
  const flightTimeOneWay = estimateFlightTime(state.distancia_millas);
  
  // Calculate actual driving time from airport to client location using Google Maps
  const drivingTimeOneWay = await calculateDrivingTime(state.codigo_aeropuerto, address);
  
  // Total travel time: (flight + driving) × 2 for round trip
  const travelTimeHours = (flightTimeOneWay + drivingTimeOneWay) * 2;
  
  // Calculate costs
  const flightCost = state.precio_vuelo_economia * 2; // Round trip
  const hotelCost = state.hampton_inn_promedio * trainingDays; // Hotel for training days
  const foodCost = FOOD_COST_PER_DAY * (trainingDays + 1); // Food for training days + travel day
  const carRentalCost = state.midsize_dia * (trainingDays + 1); // Midsize car for all days
  const travelTimeCost = Math.ceil(travelTimeHours) * TRAVEL_TIME_HOURLY_RATE;
  
  const totalTravelExpenses = flightCost + hotelCost + foodCost + carRentalCost;
  
  return {
    nearestAirport: state.codigo_aeropuerto,
    flightCost,
    hotelCost,
    foodCost,
    carRentalCost,
    travelTimeHours: Math.ceil(travelTimeHours),
    travelTimeCost,
    totalTravelExpenses,
    stateName: state.estado,
  };
}

/**
 * Calculate total quotation
 */
export async function calculateQuotation(
  address: string,
  trainingDays: number
): Promise<{
  trainingPrice: number;
  travelExpenses: TravelCalculation;
  totalPrice: number;
}> {
  // Training pricing: $1,400 first day + $1,000 for each additional day
  const trainingPrice = trainingDays > 0 
    ? TRAINING_PRICE_FIRST_DAY + (TRAINING_PRICE_ADDITIONAL_DAY * Math.max(0, trainingDays - 1))
    : 0;
  const travelExpenses = await calculateTravelExpenses(address, trainingDays);
  const totalPrice = trainingPrice + travelExpenses.totalTravelExpenses + travelExpenses.travelTimeCost;
  
  return {
    trainingPrice,
    travelExpenses,
    totalPrice,
  };
}

