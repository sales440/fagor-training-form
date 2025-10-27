import { google } from 'googleapis';

// Google Service Account credentials
const GOOGLE_CREDENTIALS = {
  type: "service_account",
  project_id: "fagor-training-calendar",
  private_key_id: "023a2fc2a71b1a20b6724b158867afb397083940",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDuumZzyJi21/jL\nrxTqCBcin7f8IxQ1IJ6HHshocVa1sBPX2fS53ZYUd2rei5t4ALgAkpYOTIl7RoaA\nDdJETxHjps+WGgHzJkb48R7fGDJQZLLrt5XfmNcbBUUu3oFXPCuBBg+PZKkMvNrU\nEKSPeP+oyhAVbqNWhFJ8/6rw0rE3/L8eXWtb661imX1tQ2vUijEgC/idOdV5bPS2\nMpycz40+2ERFwVPnX74/onAytrX7skWW565pxEQV36Ntd97D6eNWENSlViQafML8\nTtsq07qEvNuSmUlHHA5+tS1+i7xWLGwz4jStnxV8enJVNM5RLa+JDMA4TUytVNPB\ndHEvNz4/AgMBAAECggEACQ60bWcqeCF4lI3HftuguRUTP3M7RIrAyQKfeur17b3I\n+vMPiG/CTnN7cAce9m4cjRUCsXcw7ibuWnRrymCvnpIJJTpGYanNnotTbwZ1fjxb\n13qnKo0beDB6f/08Lgmf4uzOcVPR4CRYLxyUicb++DH2a0G/27v4fzqaCzoLNEMF\nYOzkKEF4y5441jI4QU6HOMZkzyRfeF6IL/SSR8WJSSQFVxFHX+qmnu6iKM5DLg8R\ncEpkgFoUDo7ZLEahxVGubk+3SLjdnMUQrzrbmaL8BR2jQH/mq8piy0DATn7Vbusp\nKlddOE9uIBjeLBJS+t3bd/QTz7vBYvcoejhOD1mBBQKBgQD4a4cYz7o0RnKzrtAW\nB2BKsennkrDQN4ZeSsSHHBTZ1GGFtOK0J6hf0yvXLUlrGAjPiWEZRmaF2aJc4WpN\nmRYkrRfMrumig7E3dfvTVoVean/cabqwXRHobFJFJjUtytJQwJlm+BdnBJ3+J+PA\n/OFrx36fhnDrLuYrAeBnwzlxgwKBgQD2Ayqih37W15S/64oX7BKhDuMMgeTYf4UH\n7g3zSUFCJWZ6tXVOV5Ld+kJJZBpc7MysHofkFIhF9/1DwSWaO4LLr0oZXlestrFz\nTLdTwomYRRpqyTUqbDi6Qzv77ss2mA6u7z2GCKbH5UCnWjSusXA2mOICcfhFAPnP\nXpCPGCCPlQKBgQCHQuUYWWLlu8YQmAqtM+72PNFDSdgER3deOA+yEVQ5Fy7Sgp89\nwKopIu4oB3yGV1vUxNSd0ntYPhvtvr8G6WfpKGZhCIwl9Na1gARSGjYcJpjgBqGk\nDckGaJSTGi6ydFD3rybXrhXv/c+Y51dXaVnEOad0bNtm8u5YVHk/hkjsyQKBgQDp\npbpBYJSLsXX6DNc7vx82TfA/+cICCKKtFF+1dxZ+nwzEcEC4Jh47qqp4D5WmOdRt\niBWh/gorActNJUz0PZ8Mmi+zBlIYm+7Oxca7y2Bo+QCM+QoAf4YlCSQYMwRXlnUj\nmd6BxQe5hDcyek7ct3MOt4a3scyMpM+dLn/3F4AdPQKBgQD4XXcNf36h6iskBHM5\nWYlJSPbGnwym7P8xsIl4SXjwIV+xhbS3Hh/AlyowyljmATAHIuqQh59eDbKW+4Ul\n0XMTza/7i5f7EVJjkVKIq7b4p1PM781383ydkdrQc93Yu4v3f24mHawYV7kVezZy\nghf1qJXD/kpYuhKee+GrKxviTw==\n-----END PRIVATE KEY-----\n",
  client_email: "fagor-calendar-service@fagor-training-calendar.iam.gserviceaccount.com",
  client_id: "109335454804205811014",
};

// Google Sheet ID from the URL
const CALENDAR_SHEET_ID = '13TeZSbxsP8it3VhnySoHygE5td0Z1gcp';

// Engineer assignment based on location (USA Service Team)
const ENGINEER_REGIONS = {
  // West Coast, TX, Denver, Midwest assignments
  'JOSEPH HAINLEY - ANAHEIM CA Office': ['CA', 'OR', 'WA', 'NV', 'AZ', 'TX', 'CO', 'NM', 'UT', 'ID', 'MT', 'WY'],
  'CARLO BARRIOS - ANAHEIM CA Office': ['CA', 'OR', 'WA', 'NV', 'AZ'],
  'JUAN CAMACHO - ANAHEIM CA Office': ['CA', 'OR', 'WA', 'NV', 'AZ', 'TX', 'CO', 'NM'],
  
  // East Coast and Midwest assignments
  'WAIKY LAU - Rolling Meadows IL': ['NY', 'NJ', 'PA', 'CT', 'MA', 'RI', 'VT', 'NH', 'ME', 'DE', 'MD', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL'],
  'YAREK GUGULSKY - Rolling Meadows IL': ['OH', 'MI', 'IN', 'IL', 'WI', 'MN', 'IA', 'MO', 'KS', 'NE', 'SD', 'ND', 'OK', 'AR'],
  'JESSIE CHRISTENSEN - Rolling Meadows IL': ['OH', 'MI', 'IN', 'IL', 'WI', 'MN', 'IA', 'MO'],
  
  // Southeast
  'KEN NEUBAUER - CNC - REPAIR BENCH': ['GA', 'FL', 'AL', 'MS', 'LA', 'TN', 'KY'],
  
  // Note: KHATEREH MOHAMMAD is Repair Bench (not field service)
  // Canada team handles Canadian locations separately
};

// Initialize Google Sheets API
function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Assign engineer based on client state
 */
export function assignEngineer(address: string): string {
  // Extract state from address (simple pattern matching)
  const stateMatch = address.match(/\b([A-Z]{2})\b/);
  const state = stateMatch ? stateMatch[1] : '';

  for (const [engineer, states] of Object.entries(ENGINEER_REGIONS)) {
    if (states.includes(state)) {
      return engineer;
    }
  }

  // Default to Joseph Hainley if state not found
  return 'JOSEPH HAINLEY - ANAHEIM CA Office';
}

/**
 * Read calendar data from Google Sheet
 */
export async function getCalendarData() {
  try {
    const sheets = getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CALENDAR_SHEET_ID,
      range: 'Sheet1!A1:Z100', // Adjust range as needed
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error reading calendar:', error);
    return [];
  }
}

/**
 * Get available dates for an engineer
 * Excludes dates that are: RED (PTO), GREEN (confirmed), ORANGE (Fagor training)
 */
export async function getAvailableDates(engineer: string, startDate: Date, daysNeeded: number) {
  try {
    const sheets = getGoogleSheetsClient();
    
    // Get the spreadsheet to read cell colors
    const response = await sheets.spreadsheets.get({
      spreadsheetId: CALENDAR_SHEET_ID,
      ranges: ['Sheet1!A1:Z100'],
      includeGridData: true,
    });

    const sheetData = response.data.sheets?.[0]?.data?.[0];
    const rows = sheetData?.rowData || [];

    // Find engineer row (this is simplified - adjust based on your sheet structure)
    const availableDates: Date[] = [];
    
    // Logic to parse dates and check colors
    // This is a placeholder - you'll need to adjust based on your sheet structure
    
    return availableDates;
  } catch (error) {
    console.error('Error checking availability:', error);
    return [];
  }
}

/**
 * Update calendar with new training request (YELLOW = pending confirmation)
 */
export async function addPendingTraining(
  engineer: string,
  startDate: Date,
  days: number,
  clientName: string
) {
  try {
    const sheets = getGoogleSheetsClient();
    
    // This would add the training to the sheet with yellow background
    // Implementation depends on your sheet structure
    
    console.log(`Adding pending training for ${engineer}: ${clientName} on ${startDate}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating calendar:', error);
    return { success: false, error };
  }
}

