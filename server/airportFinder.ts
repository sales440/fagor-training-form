/**
 * Find the nearest international airport to a given city/state
 * Returns the airport code and name
 */

interface Airport {
  code: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

// Major international airports in the US
const INTERNATIONAL_AIRPORTS: Airport[] = [
  // East Coast
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', state: 'NY', lat: 40.6413, lng: -73.7781 },
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', state: 'NJ', lat: 40.6895, lng: -74.1745 },
  { code: 'BOS', name: 'Boston Logan International Airport', city: 'Boston', state: 'MA', lat: 42.3656, lng: -71.0096 },
  { code: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia', state: 'PA', lat: 39.8729, lng: -75.2437 },
  { code: 'PIT', name: 'Pittsburgh International Airport', city: 'Pittsburgh', state: 'PA', lat: 40.4915, lng: -80.2329 },
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington', state: 'DC', lat: 38.9531, lng: -77.4565 },
  { code: 'BWI', name: 'Baltimore/Washington International Airport', city: 'Baltimore', state: 'MD', lat: 39.1774, lng: -76.6684 },
  { code: 'CLT', name: 'Charlotte Douglas International Airport', city: 'Charlotte', state: 'NC', lat: 35.2140, lng: -80.9431 },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', state: 'GA', lat: 33.6407, lng: -84.4277 },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', state: 'FL', lat: 25.7959, lng: -80.2870 },
  { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', state: 'FL', lat: 28.4312, lng: -81.3081 },
  { code: 'TPA', name: 'Tampa International Airport', city: 'Tampa', state: 'FL', lat: 27.9755, lng: -82.5332 },
  
  // Midwest
  { code: 'ORD', name: 'Chicago O\'Hare International Airport', city: 'Chicago', state: 'IL', lat: 41.9742, lng: -87.9073 },
  { code: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit', state: 'MI', lat: 42.2162, lng: -83.3554 },
  { code: 'MSP', name: 'Minneapolis-St. Paul International Airport', city: 'Minneapolis', state: 'MN', lat: 44.8848, lng: -93.2223 },
  { code: 'CVG', name: 'Cincinnati/Northern Kentucky International Airport', city: 'Cincinnati', state: 'OH', lat: 39.0469, lng: -84.6678 },
  { code: 'CLE', name: 'Cleveland Hopkins International Airport', city: 'Cleveland', state: 'OH', lat: 41.4117, lng: -81.8498 },
  { code: 'IND', name: 'Indianapolis International Airport', city: 'Indianapolis', state: 'IN', lat: 39.7173, lng: -86.2944 },
  { code: 'MKE', name: 'Milwaukee Mitchell International Airport', city: 'Milwaukee', state: 'WI', lat: 42.9472, lng: -87.8966 },
  { code: 'STL', name: 'St. Louis Lambert International Airport', city: 'St. Louis', state: 'MO', lat: 38.7487, lng: -90.3700 },
  { code: 'MCI', name: 'Kansas City International Airport', city: 'Kansas City', state: 'MO', lat: 39.2976, lng: -94.7139 },
  
  // South
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', state: 'TX', lat: 32.8998, lng: -97.0403 },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', state: 'TX', lat: 29.9902, lng: -95.3368 },
  { code: 'AUS', name: 'Austin-Bergstrom International Airport', city: 'Austin', state: 'TX', lat: 30.1945, lng: -97.6699 },
  { code: 'SAT', name: 'San Antonio International Airport', city: 'San Antonio', state: 'TX', lat: 29.5337, lng: -98.4698 },
  { code: 'MSY', name: 'Louis Armstrong New Orleans International Airport', city: 'New Orleans', state: 'LA', lat: 29.9934, lng: -90.2580 },
  { code: 'MEM', name: 'Memphis International Airport', city: 'Memphis', state: 'TN', lat: 35.0424, lng: -89.9767 },
  { code: 'BNA', name: 'Nashville International Airport', city: 'Nashville', state: 'TN', lat: 36.1245, lng: -86.6782 },
  
  // West Coast
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', state: 'CA', lat: 33.9416, lng: -118.4085 },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', state: 'CA', lat: 37.6213, lng: -122.3790 },
  { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', state: 'CA', lat: 32.7338, lng: -117.1933 },
  { code: 'SJC', name: 'Norman Y. Mineta San Jose International Airport', city: 'San Jose', state: 'CA', lat: 37.3639, lng: -121.9289 },
  { code: 'OAK', name: 'Oakland International Airport', city: 'Oakland', state: 'CA', lat: 37.7126, lng: -122.2197 },
  { code: 'SMF', name: 'Sacramento International Airport', city: 'Sacramento', state: 'CA', lat: 38.6954, lng: -121.5908 },
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', state: 'WA', lat: 47.4502, lng: -122.3088 },
  { code: 'PDX', name: 'Portland International Airport', city: 'Portland', state: 'OR', lat: 45.5898, lng: -122.5951 },
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', state: 'AZ', lat: 33.4352, lng: -112.0101 },
  { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', state: 'NV', lat: 36.0840, lng: -115.1537 },
  { code: 'SLC', name: 'Salt Lake City International Airport', city: 'Salt Lake City', state: 'UT', lat: 40.7899, lng: -111.9791 },
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', state: 'CO', lat: 39.8561, lng: -104.6737 },
  
  // Alaska & Hawaii
  { code: 'ANC', name: 'Ted Stevens Anchorage International Airport', city: 'Anchorage', state: 'AK', lat: 61.1743, lng: -149.9962 },
  { code: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu', state: 'HI', lat: 21.3187, lng: -157.9225 },
];

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get coordinates for a city/state using Google Maps Geocoding API
 */
async function getCoordinates(city: string, state: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const address = `${city}, ${state}, USA`;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
}

/**
 * Find the nearest international airport to a given city/state using Google Distance Matrix API
 * This provides accurate driving time instead of straight-line distance
 */
export async function findNearestInternationalAirport(city: string, state: string): Promise<string> {
  try {
    const customerAddress = `${city}, ${state}, USA`;
    
    // Get top 5 closest airports by straight-line distance as candidates
    const coords = await getCoordinates(city, state);
    
    if (!coords) {
      // Fallback: return airport based on state
      return getAirportByState(state);
    }
    
    // Calculate straight-line distances and get top 5 candidates
    const airportDistances = INTERNATIONAL_AIRPORTS.map(airport => ({
      airport,
      distance: calculateDistance(coords.lat, coords.lng, airport.lat, airport.lng)
    })).sort((a, b) => a.distance - b.distance).slice(0, 5);
    
    // Get driving times for top 5 candidates using Distance Matrix API
    const airportAddresses = airportDistances.map(ad => 
      `${ad.airport.name}, ${ad.airport.city}, ${ad.airport.state}, USA`
    ).join('|');
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(customerAddress)}&destinations=${encodeURIComponent(airportAddresses)}&mode=driving&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows && data.rows[0] && data.rows[0].elements) {
      const elements = data.rows[0].elements;
      
      // Find airport with shortest driving time
      let nearestAirport = airportDistances[0].airport;
      let minDuration = Infinity;
      
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.status === 'OK' && element.duration) {
          if (element.duration.value < minDuration) {
            minDuration = element.duration.value;
            nearestAirport = airportDistances[i].airport;
          }
        }
      }
      
      return `${nearestAirport.name} (${nearestAirport.code})`;
    }
    
    // Fallback to closest by straight-line distance if API fails
    const fallbackAirport = airportDistances[0].airport;
    return `${fallbackAirport.name} (${fallbackAirport.code})`;
    
  } catch (error) {
    console.error('Error finding nearest airport:', error);
    // Fallback: return airport based on state
    return getAirportByState(state);
  }
}

/**
 * Fallback: Get airport based on state
 */
function getAirportByState(state: string): string {
  const stateAirportMap: Record<string, string> = {
    'IL': 'Chicago O\'Hare International Airport (ORD)',
    'NY': 'John F. Kennedy International Airport (JFK)',
    'CA': 'Los Angeles International Airport (LAX)',
    'TX': 'Dallas/Fort Worth International Airport (DFW)',
    'FL': 'Miami International Airport (MIA)',
    'PA': 'Philadelphia International Airport (PHL)',
    'OH': 'Cleveland Hopkins International Airport (CLE)',
    'MI': 'Detroit Metropolitan Wayne County Airport (DTW)',
    'GA': 'Hartsfield-Jackson Atlanta International Airport (ATL)',
    'NC': 'Charlotte Douglas International Airport (CLT)',
    'MA': 'Boston Logan International Airport (BOS)',
    'WA': 'Seattle-Tacoma International Airport (SEA)',
    'AZ': 'Phoenix Sky Harbor International Airport (PHX)',
    'MN': 'Minneapolis-St. Paul International Airport (MSP)',
    'CO': 'Denver International Airport (DEN)',
    'MO': 'Kansas City International Airport (MCI)',
    'WI': 'Milwaukee Mitchell International Airport (MKE)',
    'TN': 'Nashville International Airport (BNA)',
    'LA': 'Louis Armstrong New Orleans International Airport (MSY)',
    'NV': 'Harry Reid International Airport (LAS)',
    'OR': 'Portland International Airport (PDX)',
    'UT': 'Salt Lake City International Airport (SLC)',
    'IN': 'Indianapolis International Airport (IND)',
    'MD': 'Baltimore/Washington International Airport (BWI)',
    'DC': 'Washington Dulles International Airport (IAD)',
    'VA': 'Washington Dulles International Airport (IAD)',
    'NJ': 'Newark Liberty International Airport (EWR)',
    'CT': 'Boston Logan International Airport (BOS)',
    'AK': 'Ted Stevens Anchorage International Airport (ANC)',
    'HI': 'Daniel K. Inouye International Airport (HNL)',
  };
  
  return stateAirportMap[state] || 'Chicago O\'Hare International Airport (ORD)';
}

