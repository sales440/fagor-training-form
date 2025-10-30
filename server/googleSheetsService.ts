import { google } from 'googleapis';
import { getGoogleSheetsClient } from './googleAuth';

// Google Sheets configuration
const SPREADSHEET_ID = '1rBzXJdSIJXBF2LPuWNpYqKdPYs-Jx4mL3TeZSbxsP8it3VhnySoHygE5td0Z1gcp';
const SHEET_NAME = 'Service Team 2025';

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
 * Initialize Google Sheets API client
 * Now uses shared authentication module
 */
async function getAuthClient(): Promise<GoogleSheetsAuth> {
  if (authClient) {
    return authClient;
  }

  try {
    const sheets = await getGoogleSheetsClient();

    authClient = {
      sheets,
    };

    console.log('[Google Sheets] Successfully initialized');
    return authClient;
  } catch (error) {
    console.error('[Google Sheets] Error initializing client:', error);
    throw new Error('Failed to initialize Google Sheets client');
  }
}

export function getAssignedTechnician(state: string): string {
  const technician = TECHNICIAN_ASSIGNMENT[state.toUpperCase()];
  if (!technician) {
    // Default to Waiky Lau if state not found
    return 'WAIKY LAU - Rolling Meadows IL Office';
  }
  return technician;
}

/**
 * Write training request to Google Sheets with YELLOW background
 */
export async function writeTrainingRequest(
  technician: string,
  date: string,
  companyName: string,
  trainingDays: number,
  paymentMethod: string = 'PENDING'
): Promise<void> {
  try {
    const { sheets } = await getAuthClient();
    
    const column = TECHNICIAN_COLUMNS[technician];
    if (!column) {
      throw new Error(`Technician column not found: ${technician}`);
    }

    // Find the row for the given date
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!B:B`,
    });

    const rows = response.data.values || [];
    let rowIndex = -1;

    // Parse the input date to compare
    const targetDate = new Date(date + 'T00:00:00');
    const targetDateStr = targetDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    
    console.log(`[Google Sheets] Looking for date: ${date} (formatted: ${targetDateStr})`);

    for (let i = 2; i < rows.length; i++) {
      if (rows[i] && rows[i][0]) {
        const cellDate = rows[i][0].trim();
        // Try exact match first
        if (cellDate === date || cellDate === targetDateStr) {
          rowIndex = i + 1; // +1 because sheets are 1-indexed
          console.log(`[Google Sheets] Found date at row ${rowIndex}: ${cellDate}`);
          break;
        }
      }
    }

    if (rowIndex === -1) {
      console.error(`[Google Sheets] Available dates in sheet:`, rows.slice(2, 12).map((r, i) => `Row ${i+3}: ${r?.[0]}`));
      throw new Error(`Date not found in calendar: ${date}. Please ensure the date exists in the Google Sheet.`);
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

    // Get sheet ID dynamically
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets(properties(sheetId,title))',
    });
    
    const sheet = sheetMetadata.data.sheets?.find(
      (s: any) => s.properties?.title === SHEET_NAME
    );
    
    const sheetId = sheet?.properties?.sheetId;
    if (sheetId === undefined) {
      throw new Error(`Sheet "${SHEET_NAME}" not found`);
    }

    // Set cell background to YELLOW (tentative/pending confirmation)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
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

    console.log(`[Google Sheets] Training request written with YELLOW background: ${companyName} on ${date}`);
  } catch (error) {
    console.error('[Google Sheets] Error writing training request:', error);
    throw new Error('Failed to write training request to Google Sheets');
  }
}


/**
 * Get technician availability from Google Sheets
 * Returns array of dates where technician is available (no entry or white background)
 */
export async function getTechnicianAvailability(
  technician: string,
  startDate: Date,
  endDate: Date
): Promise<string[]> {
  try {
    const { sheets } = await getAuthClient();
    
    const column = TECHNICIAN_COLUMNS[technician];
    if (!column) {
      throw new Error(`Technician column not found: ${technician}`);
    }

    // Get all dates in column B
    const datesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!B:B`,
    });

    const dateRows = datesResponse.data.values || [];
    
    // Get all values in technician's column
    const technicianResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!${column}:${column}`,
    });

    const technicianRows = technicianResponse.data.values || [];

    // Get sheet metadata for background colors
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets(properties(sheetId,title))',
    });
    
    const sheet = sheetMetadata.data.sheets?.find(
      (s: any) => s.properties?.title === SHEET_NAME
    );
    
    const sheetId = sheet?.properties?.sheetId;
    if (sheetId === undefined) {
      throw new Error(`Sheet "${SHEET_NAME}" not found`);
    }

    const availableDates: string[] = [];

    // Check each date in range
    for (let i = 2; i < dateRows.length; i++) {
      if (!dateRows[i] || !dateRows[i][0]) continue;

      const cellDate = dateRows[i][0].trim();
      const checkDate = new Date(cellDate + 'T00:00:00');

      // Skip if date is outside range
      if (checkDate < startDate || checkDate > endDate) continue;

      // Check if cell is empty or has white background
      const cellValue = technicianRows[i]?.[0];
      const isEmpty = !cellValue || cellValue.trim() === '';

      if (isEmpty) {
        // Cell is empty, date is available
        availableDates.push(cellDate);
      } else {
        // Check background color
        const rowIndex = i + 1; // 1-indexed
        const columnIndex = column.charCodeAt(0) - 'A'.charCodeAt(0);

        const colorResponse = await sheets.spreadsheets.get({
          spreadsheetId: SPREADSHEET_ID,
          ranges: [`${SHEET_NAME}!R${rowIndex}C${columnIndex + 1}`],
          fields: 'sheets(data(rowData(values(effectiveFormat(backgroundColor)))))',
        });

        const cellData = colorResponse.data.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values?.[0];
        const bgColor = cellData?.effectiveFormat?.backgroundColor;

        // If no background color or white background, date is available
        const isWhite = !bgColor || (
          bgColor.red >= 0.9 && 
          bgColor.green >= 0.9 && 
          bgColor.blue >= 0.9
        );

        if (isWhite) {
          availableDates.push(cellDate);
        }
      }
    }

    console.log(`[Google Sheets] Found ${availableDates.length} available dates for ${technician}`);
    return availableDates;
  } catch (error) {
    console.error('[Google Sheets] Error getting technician availability:', error);
    throw new Error('Failed to get technician availability from Google Sheets');
  }
}
