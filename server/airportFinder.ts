/**
 * Airport Finder Service
 * Finds the nearest international airport to a given city/state using Google Maps APIs
 */

// Major US airports by state with coordinates
const US_AIRPORTS = [
  // Alabama
  { code: 'BHM', name: 'Birmingham-Shuttlesworth International Airport', city: 'Birmingham', state: 'AL', lat: 33.5629, lng: -86.7535 },
  
  // Alaska
  { code: 'ANC', name: 'Ted Stevens Anchorage International Airport', city: 'Anchorage', state: 'AK', lat: 61.1743, lng: -149.9962 },
  
  // Arizona
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', state: 'AZ', lat: 33.4352, lng: -112.0101 },
  
  // Arkansas
  { code: 'LIT', name: 'Bill and Hillary Clinton National Airport', city: 'Little Rock', state: 'AR', lat: 34.7294, lng: -92.2243 },
  
  // California
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', state: 'CA', lat: 33.9416, lng: -118.4085 },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', state: 'CA', lat: 37.6213, lng: -122.3790 },
  { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', state: 'CA', lat: 32.7338, lng: -117.1933 },
  { code: 'SJC', name: 'San Jose International Airport', city: 'San Jose', state: 'CA', lat: 37.3639, lng: -121.9289 },
  { code: 'OAK', name: 'Oakland International Airport', city: 'Oakland', state: 'CA', lat: 37.7126, lng: -122.2197 },
  { code: 'SMF', name: 'Sacramento International Airport', city: 'Sacramento', state: 'CA', lat: 38.6954, lng: -121.5908 },
  
  // Colorado
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', state: 'CO', lat: 39.8561, lng: -104.6737 },
  
  // Connecticut
  { code: 'BDL', name: 'Bradley International Airport', city: 'Hartford', state: 'CT', lat: 41.9389, lng: -72.6832 },
  
  // Delaware
  { code: 'ILG', name: 'Wilmington Airport', city: 'Wilmington', state: 'DE', lat: 39.6787, lng: -75.6065 },
  
  // Florida
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', state: 'FL', lat: 25.7959, lng: -80.2870 },
  { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', state: 'FL', lat: 28.4312, lng: -81.3081 },
  { code: 'TPA', name: 'Tampa International Airport', city: 'Tampa', state: 'FL', lat: 27.9755, lng: -82.5332 },
  
  // Georgia
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', state: 'GA', lat: 33.6407, lng: -84.4277 },
  
  // Hawaii
  { code: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu', state: 'HI', lat: 21.3187, lng: -157.9225 },
  
  // Idaho
  { code: 'BOI', name: 'Boise Airport', city: 'Boise', state: 'ID', lat: 43.5644, lng: -116.2228 },
  
  // Illinois
  { code: 'ORD', name: "Chicago O'Hare International Airport", city: 'Chicago', state: 'IL', lat: 41.9742, lng: -87.9073 },
  
  // Indiana
  { code: 'IND', name: 'Indianapolis International Airport', city: 'Indianapolis', state: 'IN', lat: 39.7173, lng: -86.2944 },
  
  // Iowa
  { code: 'DSM', name: 'Des Moines International Airport', city: 'Des Moines', state: 'IA', lat: 41.5340, lng: -93.6631 },
  
  // Kansas
  { code: 'ICT', name: 'Wichita Dwight D. Eisenhower National Airport', city: 'Wichita', state: 'KS', lat: 37.6499, lng: -97.4331 },
  
  // Kentucky
  { code: 'SDF', name: 'Louisville Muhammad Ali International Airport', city: 'Louisville', state: 'KY', lat: 38.1744, lng: -85.7364 },
  
  // Louisiana
  { code: 'MSY', name: 'Louis Armstrong New Orleans International Airport', city: 'New Orleans', state: 'LA', lat: 29.9934, lng: -90.2580 },
  
  // Maine
  { code: 'PWM', name: 'Portland International Jetport', city: 'Portland', state: 'ME', lat: 43.6456, lng: -70.3092 },
  
  // Maryland
  { code: 'BWI', name: 'Baltimore/Washington International Thurgood Marshall Airport', city: 'Baltimore', state: 'MD', lat: 39.1774, lng: -76.6684 },
  
  // Massachusetts
  { code: 'BOS', name: 'Boston Logan International Airport', city: 'Boston', state: 'MA', lat: 42.3656, lng: -71.0096 },
  
  // Michigan
  { code: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit', state: 'MI', lat: 42.2162, lng: -83.3554 },
  
  // Minnesota
  { code: 'MSP', name: 'Minneapolis-St Paul International Airport', city: 'Minneapolis', state: 'MN', lat: 44.8848, lng: -93.2223 },
  
  // Mississippi
  { code: 'JAN', name: 'Jackson-Medgar Wiley Evers International Airport', city: 'Jackson', state: 'MS', lat: 32.3112, lng: -90.0759 },
  
  // Missouri
  { code: 'MCI', name: 'Kansas City International Airport', city: 'Kansas City', state: 'MO', lat: 39.2976, lng: -94.7139 },
  
  // Montana
  { code: 'BIL', name: 'Billings Logan International Airport', city: 'Billings', state: 'MT', lat: 45.8077, lng: -108.5430 },
  
  // Nebraska
  { code: 'OMA', name: 'Eppley Airfield', city: 'Omaha', state: 'NE', lat: 41.3032, lng: -95.8941 },
  
  // Nevada
  { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', state: 'NV', lat: 36.0840, lng: -115.1537 },
  
  // New Hampshire
  { code: 'MHT', name: 'Manchester-Boston Regional Airport', city: 'Manchester', state: 'NH', lat: 42.9326, lng: -71.4357 },
  
  // New Jersey
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', state: 'NJ', lat: 40.6895, lng: -74.1745 },
  
  // New Mexico
  { code: 'ABQ', name: 'Albuquerque International Sunport', city: 'Albuquerque', state: 'NM', lat: 35.0402, lng: -106.6092 },
  
  // New York
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', state: 'NY', lat: 40.6413, lng: -73.7781 },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', state: 'NY', lat: 40.7769, lng: -73.8740 },
  
  // North Carolina
  { code: 'CLT', name: 'Charlotte Douglas International Airport', city: 'Charlotte', state: 'NC', lat: 35.2144, lng: -80.9473 },
  
  // North Dakota
  { code: 'FAR', name: 'Hector International Airport', city: 'Fargo', state: 'ND', lat: 46.9207, lng: -96.8158 },
  
  // Ohio
  { code: 'CLE', name: 'Cleveland Hopkins International Airport', city: 'Cleveland', state: 'OH', lat: 41.4117, lng: -81.8498 },
  
  // Oklahoma
  { code: 'OKC', name: 'Will Rogers World Airport', city: 'Oklahoma City', state: 'OK', lat: 35.3931, lng: -97.6007 },
  
  // Oregon
  { code: 'PDX', name: 'Portland International Airport', city: 'Portland', state: 'OR', lat: 45.5898, lng: -122.5951 },
  
  // Pennsylvania
  { code: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia', state: 'PA', lat: 39.8744, lng: -75.2424 },
  { code: 'PIT', name: 'Pittsburgh International Airport', city: 'Pittsburgh', state: 'PA', lat: 40.4915, lng: -80.2329 },
  
  // Rhode Island
  { code: 'PVD', name: 'Rhode Island T. F. Green International Airport', city: 'Providence', state: 'RI', lat: 41.7240, lng: -71.4281 },
  
  // South Carolina
  { code: 'CHS', name: 'Charleston International Airport', city: 'Charleston', state: 'SC', lat: 32.8986, lng: -80.0405 },
  
  // South Dakota
  { code: 'FSD', name: 'Sioux Falls Regional Airport', city: 'Sioux Falls', state: 'SD', lat: 43.5820, lng: -96.7420 },
  
  // Tennessee
  { code: 'BNA', name: 'Nashville International Airport', city: 'Nashville', state: 'TN', lat: 36.1245, lng: -86.6782 },
  
  // Texas
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', state: 'TX', lat: 32.8998, lng: -97.0403 },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', state: 'TX', lat: 29.9902, lng: -95.3368 },
  { code: 'AUS', name: 'Austin-Bergstrom International Airport', city: 'Austin', state: 'TX', lat: 30.1945, lng: -97.6699 },
  { code: 'SAT', name: 'San Antonio International Airport', city: 'San Antonio', state: 'TX', lat: 29.5337, lng: -98.4698 },
  
  // Utah
  { code: 'SLC', name: 'Salt Lake City International Airport', city: 'Salt Lake City', state: 'UT', lat: 40.7899, lng: -111.9791 },
  
  // Vermont
  { code: 'BTV', name: 'Burlington International Airport', city: 'Burlington', state: 'VT', lat: 44.4719, lng: -73.1533 },
  
  // Virginia
  { code: 'RIC', name: 'Richmond International Airport', city: 'Richmond', state: 'VA', lat: 37.5052, lng: -77.3197 },
  
  // Washington
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', state: 'WA', lat: 47.4502, lng: -122.3088 },
  
  // West Virginia
  { code: 'CRW', name: 'Yeager Airport', city: 'Charleston', state: 'WV', lat: 38.3731, lng: -81.5932 },
  
  // Wisconsin
  { code: 'MKE', name: 'Milwaukee Mitchell International Airport', city: 'Milwaukee', state: 'WI', lat: 42.9472, lng: -87.8966 },
  
  // Wyoming
  { code: 'JAC', name: 'Jackson Hole Airport', city: 'Jackson', state: 'WY', lat: 43.6073, lng: -110.7377 },
];

/**
 * Calculate straight-line distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get coordinates for a city using Google Geocoding API
 */
async function getCityCoordinates(city: string, state: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('[Airport Finder] Google Maps API key not configured');
      return null;
    }

    const address = encodeURIComponent(`${city}, ${state}, USA`);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results[0]) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    
    console.warn(`[Airport Finder] Could not geocode ${city}, ${state}`);
    return null;
  } catch (error) {
    console.error('[Airport Finder] Error geocoding city:', error);
    return null;
  }
}

/**
 * Get driving time from origin to destination using Google Distance Matrix API
 */
async function getDrivingTime(originLat: number, originLng: number, destLat: number, destLng: number): Promise<number | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return null;
    }

    const origin = `${originLat},${originLng}`;
    const destination = `${destLat},${destLng}`;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const durationSeconds = data.rows[0].elements[0].duration.value;
      return durationSeconds / 3600; // Convert to hours
    }
    
    return null;
  } catch (error) {
    console.error('[Airport Finder] Error getting driving time:', error);
    return null;
  }
}

/**
 * Find the nearest international airport to a given city/state
 * Returns airport name with code in format: "Airport Name (CODE)"
 */
export async function findNearestInternationalAirport(city: string, state: string): Promise<string> {
  try {
    // Get coordinates for the target city
    const cityCoords = await getCityCoordinates(city, state);
    if (!cityCoords) {
      // Fallback: return first airport in the state
      const stateAirport = US_AIRPORTS.find(a => a.state === state);
      return stateAirport ? `${stateAirport.name} (${stateAirport.code})` : 'Chicago O\'Hare International Airport (ORD)';
    }

    // Calculate straight-line distances to all airports
    const airportsWithDistance = US_AIRPORTS.map(airport => ({
      ...airport,
      distance: calculateDistance(cityCoords.lat, cityCoords.lng, airport.lat, airport.lng)
    }));

    // Sort by distance and get top 5 closest
    const closestAirports = airportsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    // Get driving times for the closest airports
    const airportsWithDrivingTime = await Promise.all(
      closestAirports.map(async (airport) => {
        const drivingTime = await getDrivingTime(airport.lat, airport.lng, cityCoords.lat, cityCoords.lng);
        return {
          ...airport,
          drivingTime: drivingTime || airport.distance / 50 // Fallback: estimate ~50 mph average
        };
      })
    );

    // Find airport with shortest driving time
    const nearest = airportsWithDrivingTime.reduce((prev, current) => 
      current.drivingTime < prev.drivingTime ? current : prev
    );

    console.log(`[Airport Finder] Nearest airport to ${city}, ${state}: ${nearest.name} (${nearest.code}) - ${nearest.drivingTime.toFixed(2)} hours driving`);
    
    return `${nearest.name} (${nearest.code})`;
  } catch (error) {
    console.error('[Airport Finder] Error finding nearest airport:', error);
    // Fallback to ORD
    return 'Chicago O\'Hare International Airport (ORD)';
  }
}
