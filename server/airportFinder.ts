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
  
  // Texas Regional Airports
  { code: 'MAF', name: 'Midland International Air and Space Port', city: 'Midland', state: 'TX', lat: 31.9425, lng: -102.2019 },
  { code: 'LBB', name: 'Lubbock Preston Smith International Airport', city: 'Lubbock', state: 'TX', lat: 33.6636, lng: -101.8228 },
  { code: 'ELP', name: 'El Paso International Airport', city: 'El Paso', state: 'TX', lat: 31.8072, lng: -106.3778 },
  { code: 'CRP', name: 'Corpus Christi International Airport', city: 'Corpus Christi', state: 'TX', lat: 27.7704, lng: -97.5012 },
  { code: 'AMA', name: 'Rick Husband Amarillo International Airport', city: 'Amarillo', state: 'TX', lat: 35.2194, lng: -101.7059 },
  { code: 'BRO', name: 'Brownsville South Padre Island International Airport', city: 'Brownsville', state: 'TX', lat: 25.9068, lng: -97.4259 },
  { code: 'HRL', name: 'Valley International Airport', city: 'Harlingen', state: 'TX', lat: 26.2285, lng: -97.6544 },
  { code: 'GRK', name: 'Killeen-Fort Hood Regional Airport', city: 'Killeen', state: 'TX', lat: 31.0672, lng: -97.8289 },
  { code: 'ACT', name: 'Waco Regional Airport', city: 'Waco', state: 'TX', lat: 31.6113, lng: -97.2305 },
  { code: 'TYR', name: 'Tyler Pounds Regional Airport', city: 'Tyler', state: 'TX', lat: 32.3541, lng: -95.4024 },
  { code: 'SJT', name: 'San Angelo Regional Airport', city: 'San Angelo', state: 'TX', lat: 31.3577, lng: -100.4963 },
  { code: 'ABQ', name: 'Albuquerque International Sunport', city: 'Albuquerque', state: 'NM', lat: 35.0402, lng: -106.6092 },
  
  { code: 'MSY', name: 'Louis Armstrong New Orleans International Airport', city: 'New Orleans', state: 'LA', lat: 29.9934, lng: -90.2580 },
  { code: 'BTR', name: 'Baton Rouge Metropolitan Airport', city: 'Baton Rouge', state: 'LA', lat: 30.5332, lng: -91.1496 },
  { code: 'SHV', name: 'Shreveport Regional Airport', city: 'Shreveport', state: 'LA', lat: 32.4466, lng: -93.8256 },
  { code: 'MEM', name: 'Memphis International Airport', city: 'Memphis', state: 'TN', lat: 35.0424, lng: -89.9767 },
  { code: 'BNA', name: 'Nashville International Airport', city: 'Nashville', state: 'TN', lat: 36.1245, lng: -86.6782 },
  { code: 'TYS', name: 'McGhee Tyson Airport', city: 'Knoxville', state: 'TN', lat: 35.8111, lng: -83.9940 },
  { code: 'CHA', name: 'Chattanooga Metropolitan Airport', city: 'Chattanooga', state: 'TN', lat: 35.0353, lng: -85.2038 },
  { code: 'JAX', name: 'Jacksonville International Airport', city: 'Jacksonville', state: 'FL', lat: 30.4941, lng: -81.6879 },
  { code: 'PBI', name: 'Palm Beach International Airport', city: 'West Palm Beach', state: 'FL', lat: 26.6832, lng: -80.0956 },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale', state: 'FL', lat: 26.0726, lng: -80.1528 },
  { code: 'RSW', name: 'Southwest Florida International Airport', city: 'Fort Myers', state: 'FL', lat: 26.5362, lng: -81.7552 },
  { code: 'PNS', name: 'Pensacola International Airport', city: 'Pensacola', state: 'FL', lat: 30.4734, lng: -87.1866 },
  { code: 'TLH', name: 'Tallahassee International Airport', city: 'Tallahassee', state: 'FL', lat: 30.3965, lng: -84.3503 },
  { code: 'SAV', name: 'Savannah/Hilton Head International Airport', city: 'Savannah', state: 'GA', lat: 32.1276, lng: -81.2021 },
  { code: 'GSO', name: 'Piedmont Triad International Airport', city: 'Greensboro', state: 'NC', lat: 36.0978, lng: -79.9373 },
  { code: 'RDU', name: 'Raleigh-Durham International Airport', city: 'Raleigh', state: 'NC', lat: 35.8776, lng: -78.7875 },
  { code: 'GSP', name: 'Greenville-Spartanburg International Airport', city: 'Greer', state: 'SC', lat: 34.8957, lng: -82.2189 },
  { code: 'CAE', name: 'Columbia Metropolitan Airport', city: 'Columbia', state: 'SC', lat: 33.9388, lng: -81.1195 },
  { code: 'BHM', name: 'Birmingham-Shuttlesworth International Airport', city: 'Birmingham', state: 'AL', lat: 33.5629, lng: -86.7535 },
  { code: 'HSV', name: 'Huntsville International Airport', city: 'Huntsville', state: 'AL', lat: 34.6372, lng: -86.7751 },
  { code: 'MOB', name: 'Mobile Regional Airport', city: 'Mobile', state: 'AL', lat: 30.6912, lng: -88.2428 },
  { code: 'LIT', name: 'Bill and Hillary Clinton National Airport', city: 'Little Rock', state: 'AR', lat: 34.7294, lng: -92.2243 },
  { code: 'TUL', name: 'Tulsa International Airport', city: 'Tulsa', state: 'OK', lat: 36.1984, lng: -95.8881 },
  
  // West Coast
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', state: 'CA', lat: 33.9416, lng: -118.4085 },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', state: 'CA', lat: 37.6213, lng: -122.3790 },
  { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', state: 'CA', lat: 32.7338, lng: -117.1933 },
  { code: 'SJC', name: 'Norman Y. Mineta San Jose International Airport', city: 'San Jose', state: 'CA', lat: 37.3639, lng: -121.9289 },
  { code: 'OAK', name: 'Oakland International Airport', city: 'Oakland', state: 'CA', lat: 37.7126, lng: -122.2197 },
  { code: 'SMF', name: 'Sacramento International Airport', city: 'Sacramento', state: 'CA', lat: 38.6954, lng: -121.5908 },
  { code: 'ONT', name: 'Ontario International Airport', city: 'Ontario', state: 'CA', lat: 34.0560, lng: -117.6012 },
  { code: 'BUR', name: 'Hollywood Burbank Airport', city: 'Burbank', state: 'CA', lat: 34.2007, lng: -118.3585 },
  { code: 'SNA', name: 'John Wayne Airport', city: 'Santa Ana', state: 'CA', lat: 33.6757, lng: -117.8682 },
  { code: 'FAT', name: 'Fresno Yosemite International Airport', city: 'Fresno', state: 'CA', lat: 36.7762, lng: -119.7181 },
  { code: 'PSP', name: 'Palm Springs International Airport', city: 'Palm Springs', state: 'CA', lat: 33.8297, lng: -116.5067 },
  
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', state: 'WA', lat: 47.4502, lng: -122.3088 },
  { code: 'GEG', name: 'Spokane International Airport', city: 'Spokane', state: 'WA', lat: 47.6199, lng: -117.5339 },
  { code: 'PSC', name: 'Tri-Cities Airport', city: 'Pasco', state: 'WA', lat: 46.2647, lng: -119.1190 },
  
  { code: 'PDX', name: 'Portland International Airport', city: 'Portland', state: 'OR', lat: 45.5898, lng: -122.5951 },
  { code: 'EUG', name: 'Eugene Airport', city: 'Eugene', state: 'OR', lat: 44.1246, lng: -123.2119 },
  { code: 'MFR', name: 'Rogue Valley International-Medford Airport', city: 'Medford', state: 'OR', lat: 42.3742, lng: -122.8735 },
  
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', state: 'AZ', lat: 33.4352, lng: -112.0101 },
  { code: 'TUS', name: 'Tucson International Airport', city: 'Tucson', state: 'AZ', lat: 32.1161, lng: -110.9410 },
  { code: 'FLG', name: 'Flagstaff Pulliam Airport', city: 'Flagstaff', state: 'AZ', lat: 35.1385, lng: -111.6713 },
  { code: 'YUM', name: 'Yuma International Airport', city: 'Yuma', state: 'AZ', lat: 32.6566, lng: -114.6060 },
  
  { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', state: 'NV', lat: 36.0840, lng: -115.1537 },
  { code: 'RNO', name: 'Reno-Tahoe International Airport', city: 'Reno', state: 'NV', lat: 39.4991, lng: -119.7681 },
  
  { code: 'SLC', name: 'Salt Lake City International Airport', city: 'Salt Lake City', state: 'UT', lat: 40.7899, lng: -111.9791 },
  { code: 'SGU', name: 'St. George Regional Airport', city: 'St. George', state: 'UT', lat: 37.0364, lng: -113.5103 },
  
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', state: 'CO', lat: 39.8561, lng: -104.6737 },
  { code: 'COS', name: 'Colorado Springs Airport', city: 'Colorado Springs', state: 'CO', lat: 38.8058, lng: -104.7003 },
  { code: 'GJT', name: 'Grand Junction Regional Airport', city: 'Grand Junction', state: 'CO', lat: 39.1223, lng: -108.5267 },
  { code: 'ASE', name: 'Aspen-Pitkin County Airport', city: 'Aspen', state: 'CO', lat: 39.2232, lng: -106.8690 },
  
  { code: 'BOI', name: 'Boise Airport', city: 'Boise', state: 'ID', lat: 43.5644, lng: -116.2228 },
  { code: 'IDA', name: 'Idaho Falls Regional Airport', city: 'Idaho Falls', state: 'ID', lat: 43.5146, lng: -112.0707 },
  
  { code: 'BIL', name: 'Billings Logan International Airport', city: 'Billings', state: 'MT', lat: 45.8077, lng: -108.5430 },
  { code: 'MSO', name: 'Missoula International Airport', city: 'Missoula', state: 'MT', lat: 46.9163, lng: -114.0906 },
  { code: 'GTF', name: 'Great Falls International Airport', city: 'Great Falls', state: 'MT', lat: 47.4820, lng: -111.3707 },
  
  { code: 'JAC', name: 'Jackson Hole Airport', city: 'Jackson', state: 'WY', lat: 43.6073, lng: -110.7377 },
  { code: 'CPR', name: 'Casper-Natrona County International Airport', city: 'Casper', state: 'WY', lat: 42.9080, lng: -106.4644 },
  
  // Mountain States & Plains
  { code: 'OMA', name: 'Eppley Airfield', city: 'Omaha', state: 'NE', lat: 41.3032, lng: -95.8941 },
  { code: 'LNK', name: 'Lincoln Airport', city: 'Lincoln', state: 'NE', lat: 40.8510, lng: -96.7592 },
  
  { code: 'RAP', name: 'Rapid City Regional Airport', city: 'Rapid City', state: 'SD', lat: 44.0453, lng: -103.0574 },
  { code: 'FSD', name: 'Sioux Falls Regional Airport', city: 'Sioux Falls', state: 'SD', lat: 43.5820, lng: -96.7420 },
  
  { code: 'FAR', name: 'Hector International Airport', city: 'Fargo', state: 'ND', lat: 46.9207, lng: -96.8158 },
  { code: 'BIS', name: 'Bismarck Municipal Airport', city: 'Bismarck', state: 'ND', lat: 46.7727, lng: -100.7467 },
  
  { code: 'DSM', name: 'Des Moines International Airport', city: 'Des Moines', state: 'IA', lat: 41.5340, lng: -93.6631 },
  { code: 'CID', name: 'The Eastern Iowa Airport', city: 'Cedar Rapids', state: 'IA', lat: 41.8847, lng: -91.7108 },
  
  { code: 'ICT', name: 'Wichita Dwight D. Eisenhower National Airport', city: 'Wichita', state: 'KS', lat: 37.6499, lng: -97.4331 },
  
  // Northeast
  { code: 'ALB', name: 'Albany International Airport', city: 'Albany', state: 'NY', lat: 42.7483, lng: -73.8017 },
  { code: 'BUF', name: 'Buffalo Niagara International Airport', city: 'Buffalo', state: 'NY', lat: 42.9405, lng: -78.7322 },
  { code: 'ROC', name: 'Greater Rochester International Airport', city: 'Rochester', state: 'NY', lat: 43.1189, lng: -77.6724 },
  { code: 'SYR', name: 'Syracuse Hancock International Airport', city: 'Syracuse', state: 'NY', lat: 43.1112, lng: -76.1063 },
  
  { code: 'BDL', name: 'Bradley International Airport', city: 'Hartford', state: 'CT', lat: 41.9389, lng: -72.6832 },
  { code: 'PVD', name: 'Rhode Island T.F. Green International Airport', city: 'Providence', state: 'RI', lat: 41.7240, lng: -71.4281 },
  { code: 'MHT', name: 'Manchester-Boston Regional Airport', city: 'Manchester', state: 'NH', lat: 42.9326, lng: -71.4357 },
  { code: 'PWM', name: 'Portland International Jetport', city: 'Portland', state: 'ME', lat: 43.6456, lng: -70.3092 },
  { code: 'BGR', name: 'Bangor International Airport', city: 'Bangor', state: 'ME', lat: 44.8074, lng: -68.8281 },
  { code: 'BTV', name: 'Burlington International Airport', city: 'Burlington', state: 'VT', lat: 44.4719, lng: -73.1533 },
  
  // Mid-Atlantic
  { code: 'ABE', name: 'Lehigh Valley International Airport', city: 'Allentown', state: 'PA', lat: 40.6521, lng: -75.4408 },
  { code: 'MDT', name: 'Harrisburg International Airport', city: 'Harrisburg', state: 'PA', lat: 40.1935, lng: -76.7634 },
  { code: 'AVP', name: 'Wilkes-Barre/Scranton International Airport', city: 'Scranton', state: 'PA', lat: 41.3385, lng: -75.7234 },
  { code: 'ERI', name: 'Erie International Airport', city: 'Erie', state: 'PA', lat: 42.0831, lng: -80.1739 },
  
  { code: 'ILG', name: 'Wilmington Airport', city: 'Wilmington', state: 'DE', lat: 39.6787, lng: -75.6065 },
  
  { code: 'ACY', name: 'Atlantic City International Airport', city: 'Atlantic City', state: 'NJ', lat: 39.4576, lng: -74.5772 },
  
  // Midwest Additional
  { code: 'GRR', name: 'Gerald R. Ford International Airport', city: 'Grand Rapids', state: 'MI', lat: 42.8808, lng: -85.5228 },
  { code: 'FNT', name: 'Bishop International Airport', city: 'Flint', state: 'MI', lat: 42.9654, lng: -83.7436 },
  { code: 'LAN', name: 'Capital Region International Airport', city: 'Lansing', state: 'MI', lat: 42.7787, lng: -84.5874 },
  
  { code: 'CMH', name: 'John Glenn Columbus International Airport', city: 'Columbus', state: 'OH', lat: 39.9980, lng: -82.8919 },
  { code: 'DAY', name: 'James M. Cox Dayton International Airport', city: 'Dayton', state: 'OH', lat: 39.9024, lng: -84.2194 },
  { code: 'CAK', name: 'Akron-Canton Airport', city: 'Canton', state: 'OH', lat: 40.9161, lng: -81.4422 },
  { code: 'TOL', name: 'Toledo Express Airport', city: 'Toledo', state: 'OH', lat: 41.5868, lng: -83.8078 },
  
  { code: 'SBN', name: 'South Bend International Airport', city: 'South Bend', state: 'IN', lat: 41.7087, lng: -86.3173 },
  { code: 'FWA', name: 'Fort Wayne International Airport', city: 'Fort Wayne', state: 'IN', lat: 40.9785, lng: -85.1951 },
  { code: 'EVV', name: 'Evansville Regional Airport', city: 'Evansville', state: 'IN', lat: 38.0370, lng: -87.5324 },
  
  { code: 'GRB', name: 'Green Bay-Austin Straubel International Airport', city: 'Green Bay', state: 'WI', lat: 44.4851, lng: -88.1296 },
  { code: 'MSN', name: 'Dane County Regional Airport', city: 'Madison', state: 'WI', lat: 43.1399, lng: -89.3375 },
  
  { code: 'SGF', name: 'Springfield-Branson National Airport', city: 'Springfield', state: 'MO', lat: 37.2457, lng: -93.3886 },
  
  { code: 'LEX', name: 'Blue Grass Airport', city: 'Lexington', state: 'KY', lat: 38.0365, lng: -84.6059 },
  { code: 'SDF', name: 'Louisville Muhammad Ali International Airport', city: 'Louisville', state: 'KY', lat: 38.1744, lng: -85.7364 },
  
  { code: 'CRW', name: 'Yeager Airport', city: 'Charleston', state: 'WV', lat: 38.3731, lng: -81.5932 },
  
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
 * Get coordinates from a full address using Google Maps Geocoding API
 */
async function getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
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
    console.error('Error getting coordinates from address:', error);
    return null;
  }
}

/**
 * Find the nearest international airport to a given address using Google Distance Matrix API
 * This provides accurate driving time instead of straight-line distance
 */
export async function findNearestInternationalAirport(address: string, state: string): Promise<string> {
  try {
    // Use the full address provided (already includes city, state, zip)
    const customerAddress = address.includes('USA') ? address : `${address}, USA`;
    
    // Get top 5 closest airports by straight-line distance as candidates
    // Extract coordinates from the full address
    const coords = await getCoordinatesFromAddress(customerAddress);
    
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
