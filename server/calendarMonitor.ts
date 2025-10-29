/**
 * Calendar Monitor Service
 * Polls Google Calendar events to detect status changes (YELLOW → GREEN)
 * and sends confirmation emails automatically
 */

import { getDb } from './db';
import { trainingRequests } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { checkEventStatusChange } from './googleCalendar';
import { sendDateConfirmationEmail } from './emailService';

// Monitor interval: Check every 5 minutes
const MONITOR_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

let monitoringInterval: NodeJS.Timeout | null = null;

/**
 * Start monitoring calendar events
 */
export function startCalendarMonitor() {
  if (monitoringInterval) {
    console.log('[Calendar Monitor] Already running');
    return;
  }

  console.log('[Calendar Monitor] Starting...');
  
  // Run immediately
  monitorCalendarEvents();
  
  // Then run every 5 minutes
  monitoringInterval = setInterval(monitorCalendarEvents, MONITOR_INTERVAL);
  
  console.log(`[Calendar Monitor] Started - checking every ${MONITOR_INTERVAL / 1000} seconds`);
}

/**
 * Stop monitoring calendar events
 */
export function stopCalendarMonitor() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('[Calendar Monitor] Stopped');
  }
}

/**
 * Check all pending calendar events for status changes
 */
async function monitorCalendarEvents() {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[Calendar Monitor] Database not available');
      return;
    }

    // Get all training requests with pending calendar events
    const pendingRequests = await db
      .select()
      .from(trainingRequests)
      .where(eq(trainingRequests.calendarStatus, 'pending'));

    if (pendingRequests.length === 0) {
      console.log('[Calendar Monitor] No pending events to check');
      return;
    }

    console.log(`[Calendar Monitor] Checking ${pendingRequests.length} pending event(s)...`);

    for (const request of pendingRequests) {
      if (!request.googleCalendarEventId) {
        continue;
      }

      try {
        // Check if event status has changed
        const statusCheck = await checkEventStatusChange(request.googleCalendarEventId);

        if (statusCheck.hasChanged && statusCheck.newStatus === 'confirmed') {
          console.log(`[Calendar Monitor] Event ${request.googleCalendarEventId} changed to CONFIRMED`);

          // Update database
          await db
            .update(trainingRequests)
            .set({
              calendarStatus: 'confirmed',
              confirmedStartDate: statusCheck.newDates?.start ? new Date(statusCheck.newDates.start) : request.requestedStartDate,
              confirmedEndDate: statusCheck.newDates?.end ? new Date(statusCheck.newDates.end) : request.requestedEndDate,
              status: 'confirmed',
              lastCalendarCheck: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(trainingRequests.id, request.id));

          // Send confirmation email
          if (!request.confirmationEmailSent) {
            await sendConfirmationEmail(request, statusCheck.newDates);
            
            // Mark email as sent
            await db
              .update(trainingRequests)
              .set({
                confirmationEmailSent: true,
                updatedAt: new Date(),
              })
              .where(eq(trainingRequests.id, request.id));
          }
        } else {
          // Just update the last check time
          await db
            .update(trainingRequests)
            .set({
              lastCalendarCheck: new Date(),
            })
            .where(eq(trainingRequests.id, request.id));
        }
      } catch (error) {
        console.error(`[Calendar Monitor] Error checking event ${request.googleCalendarEventId}:`, error);
      }
    }
  } catch (error) {
    console.error('[Calendar Monitor] Error in monitoring cycle:', error);
  }
}

/**
 * Send confirmation email to client
 */
async function sendConfirmationEmail(
  request: any,
  dates?: { start: string; end: string }
) {
  try {
    const startDate = dates?.start || request.requestedStartDate?.toISOString().split('T')[0] || 'TBD';
    const endDate = dates?.end || request.requestedEndDate?.toISOString().split('T')[0] || 'TBD';

    await sendDateConfirmationEmail({
      to: request.email,
      companyName: request.companyName,
      contactPerson: request.contactPerson,
      referenceCode: request.referenceCode || 'N/A',
      startDate,
      endDate,
      trainingDays: request.trainingDays || 1,
      assignedTechnician: request.assignedTechnician || 'TBD',
      controllerModel: request.controllerModel || 'N/A',
    });

    console.log(`[Calendar Monitor] Confirmation email sent to ${request.email}`);
  } catch (error) {
    console.error('[Calendar Monitor] Error sending confirmation email:', error);
  }
}

/**
 * Manual check for a specific event
 */
export async function checkSpecificEvent(referenceCode: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      return false;
    }

    const request = await db
      .select()
      .from(trainingRequests)
      .where(eq(trainingRequests.referenceCode, referenceCode))
      .limit(1);

    if (request.length === 0 || !request[0].googleCalendarEventId) {
      return false;
    }

    const statusCheck = await checkEventStatusChange(request[0].googleCalendarEventId);

    if (statusCheck.hasChanged && statusCheck.newStatus === 'confirmed') {
      // Update database
      await db
        .update(trainingRequests)
        .set({
          calendarStatus: 'confirmed',
          confirmedStartDate: statusCheck.newDates?.start ? new Date(statusCheck.newDates.start) : request[0].requestedStartDate,
          confirmedEndDate: statusCheck.newDates?.end ? new Date(statusCheck.newDates.end) : request[0].requestedEndDate,
          status: 'confirmed',
          lastCalendarCheck: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(trainingRequests.id, request[0].id));

      // Send confirmation email
      if (!request[0].confirmationEmailSent) {
        await sendConfirmationEmail(request[0], statusCheck.newDates);
        
        await db
          .update(trainingRequests)
          .set({
            confirmationEmailSent: true,
            updatedAt: new Date(),
          })
          .where(eq(trainingRequests.id, request[0].id));
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('[Calendar Monitor] Error checking specific event:', error);
    return false;
  }
}
