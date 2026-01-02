import { google } from 'googleapis';

// Google Sheets configuration - Use environment variable for flexibility
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1rBzXJdSIJXBF2LPuWNpYqKdPYs-Jx4mL3TeZSbxsP8it3VhnySoHygE5td0Z1gcp';
const SHEET_NAME = 'Service Team 2025';

// Feature flag to enable/disable Google Sheets integration
const GOOGLE_SHEETS_ENABLED = process.env.GOOGLE_SHEETS_ENABLED === 'true';

// Technician assignment by state
const TECHNICIAN_ASSIGNMENT: Record<string, string> = {
  // Joseph Hainley - West/Central states
  'CA': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'OR': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'WA': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'NV': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'AZ': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'TX': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'CO': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'NM': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'UT': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'ID': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'MT': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'WY': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'KS': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'NE': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'SD': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'ND': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  'OK': 'JOSEPH HAINLEY - ANAHEIM CA Office',
  
  // East/Central states - can be assigned to Waiky, Khatereh, or Yarek
  'NY': 'WAIKY LAU - Rolling Meadows IL Office',
  'NJ': 'WAIKY LAU - Rolling Meadows IL Office',
  'PA': 'WAIKY LAU - Rolling Meadows IL Office',
  'CT': 'WAIKY LAU - Rolling Meadows IL Office',
  'MA': 'WAIKY LAU - Rolling Meadows IL Office',
  'RI': 'WAIKY LAU - Rolling Meadows IL Office',
  'VT': 'WAIKY LAU - Rolling Meadows IL Office',
  'NH': 'WAIKY LAU - Rolling Meadows IL Office',
  'ME': 'WAIKY LAU - Rolling Meadows IL Office',
  'DE': 'WAIKY LAU - Rolling Meadows IL Office',
  'MD': 'WAIKY LAU - Rolling Meadows IL Office',
  'VA': 'WAIKY LAU - Rolling Meadows IL Office',
  'WV': 'WAIKY LAU - Rolling Meadows IL Office',
  'NC': 'WAIKY LAU - Rolling Meadows IL Office',
  'SC': 'WAIKY LAU - Rolling Meadows IL Office',
  'OH': 'KHATEREH MOHAMMADI - Rolling Meadows IL Office',
  'MI': 'KHATEREH MOHAMMADI - Rolling Meadows IL Office',
  'IN': 'KHATEREH MOHAMMADI - Rolling Meadows IL Office',
  'IL': 'KHATEREH MOHAMMADI - Rolling Meadows IL Office',
  'WI': 'KHATEREH MOHAMMADI - Rolling Meadows IL Office',
  'MN': 'YAREK GUGULSKI - Rolling Meadows IL Office',
  'IA': 'YAREK GUGULSKI - Rolling Meadows IL Office',
  'MO': 'YAREK GUGULSKI - Rolling Meadows IL Office',
  'GA': 'YAREK GUGULSKI - Rolling Meadows IL Office',
  'FL': 'YAREK GUGULSKI - Rolling Meadows IL Office',
  'AL': 'YAREK GUGULSKI - Rolling Meadows IL Office',
  'MS': 'YAREK GUGULSKI - Rolling Meadows IL Office',
  'LA': 'YAREK GUGULSKI - Rolling Meadows IL Office',
  'AR': 'YAREK GUGULSKI - Rolling Meadows IL Office',
  'TN': 'YAREK GUGULSKI - Rolling Meadows IL Office',
  'KY': 'YAREK GUGULSKI - Rolling Meadows IL Office',
};

// Column mapping for technicians
const TECHNICIAN_COLUMNS: Record<string, string> = {
  'KHATEREH MOHAMMADI - Rolling Meadows IL Office': 'G',
  'YAREK GUGULSKI - Rolling Meadows IL Office': 'H',
  'WAIKY LAU - Rolling Meadows IL Office': 'I',
  'JESSE CHRISTENSEN - Rolling Meadows IL Office': 'J',
  'JOSEPH HAINLEY - ANAHEIM CA Office': 'M',
  'JUAN CAMACHO - ANAHEIM CA Office': 'N',
};

interface GoogleSheetsAuth {
  sheets: any;
}

let authClient: GoogleSheetsAuth | null = null;

/**
 * Initialize Google Sheets API client with proper error handling
 */
async function getAuthClient(): Promise<GoogleSheetsAuth> {
  // Check if Google Sheets is enabled
  if (!GOOGLE_SHEETS_ENABLED) {
    throw new Error('Google Sheets integration is disabled. Set GOOGLE_SHEETS_ENABLED=true to enable.');
  }

  // Return cached client if available
  if (authClient) {
    return authClient;
  }

  try {
    // Get credentials from environment variable
    const credsEnv = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!credsEnv) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set');
    }

    // Parse credentials with proper error handling
    let credentials;
    try {
      credentials = JSON.parse(credsEnv);
    } catch (parseError) {
      throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY: Invalid JSON format');
    }

    // Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClientInstance = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClientInstance as any });

    // Cache the authenticated client
    authClient = { sheets };
    console.log('[GoogleAuth] Successfully authenticated with Google Sheets API');
    
    return authClient;
  } catch (error) {
    console.error('[GoogleAuth] Error initializing Google Sheets client:', error);
    throw error;
  }
}

/**
 * Get assigned technician based on client state
 */
export function getAssignedTechnician(state: string): string {
  const technician = TECHNICIAN_ASSIGNMENT[state.toUpperCase()];
  if (!technician) {
    // Default to Waiky Lau if state not found
    console.warn(`[Technician] State not found in assignment map: ${state}, defaulting to Waiky Lau`);
    return 'WAIKY LAU - Rolling Meadows IL Office';
  }
  return technician;
}

/**
 * Get technician availability for a specific date range
 * Returns empty array if Google Sheets is disabled
 */
export async function getTechnicianAvailability(
  technician: string,
  startDate: Date,
  endDate: Date
): Promise<{ date: string; status: string; color: string }[]> {
  // Return empty if disabled
  if (!GOOGLE_SHEETS_ENABLED) {
    console.log('[GoogleSheets] Integration disabled, returning empty availability');
    return [];
  }

  try {
    const { sheets } = await getAuthClient();
    
    const column = TECHNICIAN_COLUMNS[technician];
    if (!column) {
      console.error(`[GoogleSheets] Technician column not found: ${technician}`);
      return [];
    }

    // Read the entire column for the technician
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:${column}`,
    });

    const rows = response.data.values || [];
    const availability: { date: string; status: string; color: string }[] = [];

    // Parse rows to find dates and availability
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 2) continue;

      const dateStr = row[1]; // Column B contains dates
      if (!dateStr) continue;

      const cellValue = row[column.charCodeAt(0) - 'A'.charCodeAt(0)] || 'Office-Phone Support';
      
      // Determine status based on cell value
      let status = 'available';
      let color = 'green';

      if (cellValue.includes('PTO') || cellValue.includes('VACATION') || cellValue.includes('HOLIDAY')) {
        status = 'unavailable';
        color = 'red';
      } else if (cellValue.includes('TRAVEL') || cellValue.includes('Office-Phone Support')) {
        status = 'available';
        color = 'blue';
      } else if (cellValue && cellValue !== 'Office-Phone Support') {
        status = 'tentative';
        color = 'yellow';
      }

      availability.push({
        date: dateStr,
        status,
        color,
      });
    }

    return availability;
  } catch (error) {
    console.error('[GoogleSheets] Error fetching technician availability:', error);
    // Return empty array instead of throwing - graceful degradation
    return [];
  }
}

/**
 * Write training request to Google Sheets
 * Silently fails if Google Sheets is disabled
 */
export async function writeTrainingRequest(
  technician: string,
  date: string,
  companyName: string,
  trainingDays: number,
  paymentMethod: string = 'PENDING'
): Promise<void> {
  // Skip if disabled
  if (!GOOGLE_SHEETS_ENABLED) {
    console.log('[GoogleSheets] Integration disabled, skipping write');
    return;
  }

  try {
    const { sheets } = await getAuthClient();
    
    const column = TECHNICIAN_COLUMNS[technician];
    if (!column) {
      console.error(`[GoogleSheets] Technician column not found: ${technician}`);
      return;
    }

    // Find the row for the given date
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!B:B`,
    });

    const rows = response.data.values || [];
    let rowIndex = -1;

    for (let i = 2; i < rows.length; i++) {
      if (rows[i] && rows[i][0] === date) {
        rowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      console.error(`[GoogleSheets] Date not found in calendar: ${date}`);
      return;
    }

    // Write the training request
    const cellText = `${companyName}\nFAGOR CNC TRAINING\n${trainingDays} DAYS\n${paymentMethod}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!${column}${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[cellText]],
      },
    });

    // Set cell background to yellow (tentative)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0, // Assuming first sheet, may need to get actual sheet ID
                startRowIndex: rowIndex - 1,
                endRowIndex: rowIndex,
                startColumnIndex: column.charCodeAt(0) - 'A'.charCodeAt(0),
                endColumnIndex: column.charCodeAt(0) - 'A'.charCodeAt(0) + 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 1.0,
                    green: 1.0,
                    blue: 0.0,
                  },
                },
              },
              fields: 'userEnteredFormat.backgroundColor',
            },
          },
        ],
      },
    });

    console.log(`[GoogleSheets] Training request written: ${companyName} on ${date}`);
  } catch (error) {
    console.error('[GoogleSheets] Error writing training request:', error);
    // Graceful degradation - don't throw, just log
  }
}
