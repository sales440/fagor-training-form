import { google } from 'googleapis';
import { getDb } from './db';
import { sendClientConfirmation, sendTechnicianNotification } from './emailService';
import { getGoogleSheetsClient } from './googleAuth';

const SPREADSHEET_ID = '1rBzXJdSIJXBF2LPuWNpYqKdPYs-Jx4mL3TeZSbxsP8it3VhnySoHygE5td0Z1gcp';
const SHEET_NAME = 'Service Team 2025';
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Technician email mapping
const TECHNICIAN_EMAILS: Record<string, string> = {
  'JOSEPH HAINLEY - ANAHEIM CA Office': 'jhainley@fagor-automation.com',
  'WAIKY LAU - Rolling Meadows IL Office': 'wlau@fagor-automation.com',
  'KHATEREH MOHAMMADI - Rolling Meadows IL Office': 'kmohammadi@fagor-automation.com',
  'YAREK GUGULSKI - Rolling Meadows IL Office': 'ygugulski@fagor-automation.com',
  'JESSE CHRISTENSEN - Rolling Meadows IL Office': 'jchristensen@fagor-automation.com',
  'JUAN CAMACHO - ANAHEIM CA Office': 'jcamacho@fagor-automation.com',
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

interface PendingTraining {
  id: number;
  referenceCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  assignedTechnician: string;
  trainingDays: number;
  selectedDate: string;
  trainingPrice: number;
  flightCost: number;
  hotelCost: number;
  mealsCost: number;
  carRentalCost: number;
  travelTimeCost: number;
  totalCost: number;
  selectedAirport: string;
  flightTimeOneWay: number;
  drivingTimeOneWay: number;
  travelTimeHours: number;
}

/**
 * Get Google Sheets auth client
 */
async function getAuthClient() {
  return await getGoogleSheetsClient();
}

/**
 * Check if a cell has green background color
 */
async function isCellGreen(
  sheets: any,
  sheetId: number,
  rowIndex: number,
  columnIndex: number
): Promise<boolean> {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [`${SHEET_NAME}!R${rowIndex}C${columnIndex}`],
      fields: 'sheets(data(rowData(values(effectiveFormat(backgroundColor)))))',
    });

    const cellData = response.data.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values?.[0];
    const bgColor = cellData?.effectiveFormat?.backgroundColor;

    if (!bgColor) return false;

    // Green color check (RGB values close to green)
    const isGreen = 
      bgColor.green > 0.7 && 
      bgColor.red < 0.5 && 
      bgColor.blue < 0.5;

    return isGreen;
  } catch (error) {
    console.error('[Poller] Error checking cell color:', error);
    return false;
  }
}

/**
 * Get pending trainings from database
 */
async function getPendingTrainings(): Promise<PendingTraining[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(`
    SELECT 
      id,
      reference_code as referenceCode,
      company_name as companyName,
      contact_person as contactPerson,
      email,
      assigned_technician as assignedTechnician,
      training_days as trainingDays,
      selected_date as selectedDate,
      training_price as trainingPrice,
      flight_cost as flightCost,
      hotel_cost as hotelCost,
      meals_cost as mealsCost,
      car_rental_cost as carRentalCost,
      travel_time_cost as travelTimeCost,
      total_cost as totalCost,
      selected_airport as selectedAirport,
      flight_time_one_way as flightTimeOneWay,
      driving_time_one_way as drivingTimeOneWay,
      travel_time_hours as travelTimeHours
    FROM training_requests
    WHERE status = 'pending_confirmation'
      AND selected_date IS NOT NULL
  `);

  return result as any as PendingTraining[];
}

/**
 * Mark training as confirmed in database
 */
async function markTrainingConfirmed(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.execute(`
    UPDATE training_requests
    SET status = 'confirmed',
        confirmed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [id]);
}

/**
 * Find the row index for a given date in Google Sheets
 */
async function findDateRow(sheets: any, date: string): Promise<number | null> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!B:B`,
    });

    const rows = response.data.values || [];
    const targetDate = new Date(date + 'T00:00:00');
    const targetDateStr = targetDate.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });

    for (let i = 2; i < rows.length; i++) {
      if (rows[i] && rows[i][0]) {
        const cellDate = rows[i][0].trim();
        if (cellDate === date || cellDate === targetDateStr) {
          return i + 1; // +1 because sheets are 1-indexed
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[Poller] Error finding date row:', error);
    return null;
  }
}

/**
 * Get sheet ID by name
 */
async function getSheetId(sheets: any): Promise<number | null> {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets(properties(sheetId,title))',
    });

    const sheet = response.data.sheets?.find(
      (s: any) => s.properties?.title === SHEET_NAME
    );

    return sheet?.properties?.sheetId ?? null;
  } catch (error) {
    console.error('[Poller] Error getting sheet ID:', error);
    return null;
  }
}

/**
 * Check for confirmed trainings and send emails
 */
async function checkConfirmedTrainings(): Promise<void> {
  try {
    console.log('[Poller] Checking for confirmed trainings...');

    const sheets = await getAuthClient();
    const sheetId = await getSheetId(sheets);

    if (sheetId === null) {
      console.error('[Poller] Could not find sheet ID');
      return;
    }

    const pendingTrainings = await getPendingTrainings();
    console.log(`[Poller] Found ${pendingTrainings.length} pending trainings`);

    for (const training of pendingTrainings) {
      try {
        // Find the row for this training's date
        const rowIndex = await findDateRow(sheets, training.selectedDate);
        if (!rowIndex) {
          console.log(`[Poller] Could not find row for date: ${training.selectedDate}`);
          continue;
        }

        // Get the column for this technician
        const column = TECHNICIAN_COLUMNS[training.assignedTechnician];
        if (!column) {
          console.warn(`[Poller] No column found for technician: ${training.assignedTechnician}`);
          continue;
        }

        const columnIndex = column.charCodeAt(0) - 'A'.charCodeAt(0) + 1; // 1-indexed

        // Check if the cell is green (confirmed)
        const isConfirmed = await isCellGreen(sheets, sheetId, rowIndex, columnIndex);

        if (isConfirmed) {
          console.log(`[Poller] Training ${training.referenceCode} is confirmed! Sending emails...`);

          // Calculate end date
          const startDate = new Date(training.selectedDate + 'T00:00:00');
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + training.trainingDays - 1);

          const quotationData = {
            companyName: training.companyName,
            contactPerson: training.contactPerson,
            email: training.email,
            referenceCode: training.referenceCode,
            trainingDays: training.trainingDays,
            trainingPrice: training.trainingPrice,
            flightCost: training.flightCost,
            hotelCost: training.hotelCost,
            mealsCost: training.mealsCost,
            carRentalCost: training.carRentalCost,
            travelTimeCost: training.travelTimeCost,
            totalCost: training.totalCost,
            selectedAirport: training.selectedAirport,
            flightTimeOneWay: training.flightTimeOneWay,
            drivingTimeOneWay: training.drivingTimeOneWay,
            travelTimeHours: training.travelTimeHours,
            assignedTechnician: training.assignedTechnician,
            confirmedStartDate: startDate.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            confirmedEndDate: endDate.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            }),
          };

          // Send email to client
          await sendClientConfirmation(quotationData);

          // Send email to technician
          const technicianEmail = TECHNICIAN_EMAILS[training.assignedTechnician];
          if (technicianEmail) {
            await sendTechnicianNotification(quotationData, technicianEmail);
          } else {
            console.warn(`[Poller] No email found for technician: ${training.assignedTechnician}`);
          }

          // Mark as confirmed in database
          await markTrainingConfirmed(training.id);

          console.log(`[Poller] Successfully processed confirmation for ${training.referenceCode}`);
        }
      } catch (error) {
        console.error(`[Poller] Error processing training ${training.referenceCode}:`, error);
      }
    }
  } catch (error) {
    console.error('[Poller] Error in checkConfirmedTrainings:', error);
  }
}

/**
 * Start the confirmation polling service
 */
export function startConfirmationPoller(): void {
  console.log(`[Poller] Starting confirmation poller (interval: ${POLL_INTERVAL_MS / 1000}s)`);
  
  // Run immediately on start
  checkConfirmedTrainings();
  
  // Then run every 5 minutes
  setInterval(checkConfirmedTrainings, POLL_INTERVAL_MS);
}
