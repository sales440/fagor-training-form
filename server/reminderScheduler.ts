// ============================================================================
// FILE: server/reminderScheduler.ts
// DESCRIPTION: Automated reminder system that checks for upcoming trainings
// FEATURES: Cron job runs daily at 9 AM to send 7-day reminders
// ============================================================================

import * as cron from 'node-cron';
import { getDb } from './db';
import { trainingRequests } from '../drizzle/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { sendTrainingReminderEmail } from './emailService';

/**
 * Check for trainings starting in 7 days and send reminder emails
 */
async function checkUpcomingTrainings() {
  try {
    console.log('[Reminder] Checking for upcoming trainings...');
    
    const db = await getDb();
    if (!db) {
      console.warn('[Reminder] Database not available');
      return;
    }

    // Calculate date range: 7 days from now (with 1-day buffer for timezone differences)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + 7);
    
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setDate(targetDateEnd.getDate() + 1);

    // Find approved trainings starting in 7 days
    const upcomingTrainings = await db
      .select()
      .from(trainingRequests)
      .where(
        and(
          eq(trainingRequests.status, 'approved'),
          gte(trainingRequests.requestedStartDate, targetDate),
          lte(trainingRequests.requestedStartDate, targetDateEnd)
        )
      );

    console.log(`[Reminder] Found ${upcomingTrainings.length} trainings starting in 7 days`);

    // Send reminder email for each training
    for (const training of upcomingTrainings) {
      try {
        // Parse training dates
        const trainingDates = training.preferredDates 
          ? JSON.parse(training.preferredDates) 
          : [training.requestedStartDate];

        // Send reminder email
        const success = await sendTrainingReminderEmail({
          email: training.email,
          companyName: training.companyName,
          contactPerson: training.contactPerson,
          referenceCode: training.referenceCode || 'N/A',
          trainingDates: trainingDates,
          assignedTechnician: training.assignedTechnician || undefined,
          address: `${training.address1}, ${training.city}, ${training.state} ${training.zipCode}`,
          trainingDays: training.trainingDays || 1,
          machineType: training.machineType || undefined,
          controllerModel: training.controllerModel || undefined,
        });

        if (success) {
          console.log(`[Reminder] Sent reminder for ${training.companyName} (${training.referenceCode})`);
          
          // Update database to mark reminder as sent
          await db
            .update(trainingRequests)
            .set({ 
              reminderSent: true,
              reminderSentAt: new Date()
            })
            .where(eq(trainingRequests.id, training.id));
        } else {
          console.error(`[Reminder] Failed to send reminder for ${training.companyName}`);
        }
      } catch (error) {
        console.error(`[Reminder] Error processing training ${training.id}:`, error);
      }
    }

    console.log('[Reminder] Completed checking upcoming trainings');
  } catch (error) {
    console.error('[Reminder] Error in checkUpcomingTrainings:', error);
  }
}

/**
 * Initialize the reminder scheduler
 * Runs daily at 9:00 AM
 */
export function initializeReminderScheduler() {
  console.log('[Reminder] Initializing reminder scheduler...');
  
  // Schedule task to run every day at 9:00 AM
  // Cron format: second minute hour day month dayOfWeek
  cron.schedule('0 0 9 * * *', async () => {
    console.log('[Reminder] Running scheduled reminder check at', new Date().toISOString());
    await checkUpcomingTrainings();
  }, {
    timezone: "America/Chicago" // Central Time (Fagor's timezone)
  });

  console.log('[Reminder] Scheduler initialized - will run daily at 9:00 AM CT');
  
  // Optionally run immediately on startup for testing
  // Uncomment the line below to test on server start
  // checkUpcomingTrainings();
}

/**
 * Manual trigger for testing (can be called from admin panel)
 */
export async function triggerReminderCheck() {
  console.log('[Reminder] Manual reminder check triggered');
  await checkUpcomingTrainings();
}
