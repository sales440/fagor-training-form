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
export const TRAINING_PRICE_PER_DAY = 1200; // USD
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
 * Estimate driving time from airport to destination (in hours)
 * Based on distance estimation from major city
 */
function estimateDrivingTime(address: string): number {
  // Simple heuristic: assume 1 hour average driving time
  // In a real implementation, you could use Google Maps API
  return 1.0;
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
export function calculateTravelExpenses(
  address: string,
  trainingDays: number
): TravelCalculation {
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
  
  // Estimate driving time from airport to client location
  const drivingTimeOneWay = estimateDrivingTime(address);
  
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

