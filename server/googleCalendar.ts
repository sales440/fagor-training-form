/**
 * Google Calendar Service
 * Handles calendar integration for training scheduling
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Initialize Google Calendar API
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set credentials from environment
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Calendar ID for training events (use primary or specific calendar)
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

// Color IDs in Google Calendar
const COLORS = {
  YELLOW: '5', // Yellow - Pending Confirmation
  GREEN: '10', // Green - Confirmed
  RED: '11', // Red - Cancelled/Conflict
};

interface CalendarEvent {
  id?: string;
  summary: string;
  description: string;
  start: { date: string };
  end: { date: string };
  colorId?: string;
  extendedProperties?: {
    private?: Record<string, string>;
  };
}

/**
 * Check if dates are available (no conflicts)
 */
export async function checkDateAvailability(
  startDate: string,
  endDate: string,
  technicianEmail?: string
): Promise<{ available: boolean; conflicts: any[] }> {
  try {
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    // Filter events that are confirmed (green) or pending (yellow)
    const conflicts = events.filter(event => {
      const colorId = event.colorId;
      return colorId === COLORS.GREEN || colorId === COLORS.YELLOW;
    });

    return {
      available: conflicts.length === 0,
      conflicts: conflicts.map(event => ({
        summary: event.summary,
        start: event.start?.date || event.start?.dateTime,
        end: event.end?.date || event.end?.dateTime,
        status: event.colorId === COLORS.GREEN ? 'confirmed' : 'pending',
      })),
    };
  } catch (error) {
    console.error('[Google Calendar] Error checking availability:', error);
    throw new Error('Failed to check calendar availability');
  }
}

/**
 * Suggest alternative available dates
 */
export async function suggestAlternativeDates(
  requestedStartDate: string,
  trainingDays: number,
  maxSuggestions: number = 3
): Promise<string[]> {
  try {
    const suggestions: string[] = [];
    let currentDate = new Date(requestedStartDate);
    
    // Look ahead up to 60 days
    const maxLookAhead = 60;
    let daysChecked = 0;

    while (suggestions.length < maxSuggestions && daysChecked < maxLookAhead) {
      currentDate.setDate(currentDate.getDate() + 1);
      daysChecked++;

      const startDateStr = currentDate.toISOString().split('T')[0];
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + trainingDays - 1);
      const endDateStr = endDate.toISOString().split('T')[0];

      const { available } = await checkDateAvailability(startDateStr, endDateStr);
      
      if (available) {
        suggestions.push(startDateStr);
      }
    }

    return suggestions;
  } catch (error) {
    console.error('[Google Calendar] Error suggesting dates:', error);
    return [];
  }
}

/**
 * Create calendar event with YELLOW color (Pending Confirmation)
 */
export async function createPendingEvent(
  referenceCode: string,
  startDate: string,
  endDate: string,
  companyName: string,
  technicianName: string,
  trainingDetails: string
): Promise<string> {
  try {
    const event: CalendarEvent = {
      summary: `[PENDING] ${companyName} - Training (${referenceCode})`,
      description: `
Reference Code: ${referenceCode}
Company: ${companyName}
Assigned Technician: ${technicianName}
Training Details: ${trainingDetails}

Status: Pending Confirmation
This event is awaiting approval. Change color to GREEN to confirm.
      `.trim(),
      start: { date: startDate },
      end: { date: new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] }, // Add 1 day for all-day event
      colorId: COLORS.YELLOW,
      extendedProperties: {
        private: {
          referenceCode,
          status: 'pending',
          companyName,
          technicianName,
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });

    console.log(`[Google Calendar] Created pending event: ${response.data.id}`);
    return response.data.id!;
  } catch (error) {
    console.error('[Google Calendar] Error creating event:', error);
    throw new Error('Failed to create calendar event');
  }
}

/**
 * Update event color to GREEN (Confirmed)
 */
export async function confirmEvent(eventId: string): Promise<void> {
  try {
    const event = await calendar.events.get({
      calendarId: CALENDAR_ID,
      eventId,
    });

    await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId,
      requestBody: {
        ...event.data,
        colorId: COLORS.GREEN,
        summary: event.data.summary?.replace('[PENDING]', '[CONFIRMED]'),
      },
    });

    console.log(`[Google Calendar] Confirmed event: ${eventId}`);
  } catch (error) {
    console.error('[Google Calendar] Error confirming event:', error);
    throw new Error('Failed to confirm calendar event');
  }
}

/**
 * Get event details by ID
 */
export async function getEvent(eventId: string): Promise<any> {
  try {
    const response = await calendar.events.get({
      calendarId: CALENDAR_ID,
      eventId,
    });

    return response.data;
  } catch (error) {
    console.error('[Google Calendar] Error getting event:', error);
    return null;
  }
}

/**
 * Watch for calendar changes (webhook setup)
 * This sets up a webhook to receive notifications when calendar events change
 */
export async function setupCalendarWatch(webhookUrl: string): Promise<string> {
  try {
    const response = await calendar.events.watch({
      calendarId: CALENDAR_ID,
      requestBody: {
        id: `training-calendar-watch-${Date.now()}`,
        type: 'web_hook',
        address: webhookUrl,
      },
    });

    console.log(`[Google Calendar] Watch channel created: ${response.data.id}`);
    return response.data.id!;
  } catch (error) {
    console.error('[Google Calendar] Error setting up watch:', error);
    throw new Error('Failed to setup calendar watch');
  }
}

/**
 * Poll for calendar changes (alternative to webhooks)
 * Check if an event has changed color from YELLOW to GREEN
 */
export async function checkEventStatusChange(eventId: string): Promise<{
  hasChanged: boolean;
  newStatus: 'pending' | 'confirmed' | 'unknown';
  newDates?: { start: string; end: string };
}> {
  try {
    const event = await getEvent(eventId);
    
    if (!event) {
      return { hasChanged: false, newStatus: 'unknown' };
    }

    const colorId = event.colorId;
    const newStatus = colorId === COLORS.GREEN ? 'confirmed' : colorId === COLORS.YELLOW ? 'pending' : 'unknown';

    return {
      hasChanged: newStatus === 'confirmed',
      newStatus,
      newDates: {
        start: event.start?.date || event.start?.dateTime,
        end: event.end?.date || event.end?.dateTime,
      },
    };
  } catch (error) {
    console.error('[Google Calendar] Error checking event status:', error);
    return { hasChanged: false, newStatus: 'unknown' };
  }
}

/**
 * Delete calendar event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  try {
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId,
    });

    console.log(`[Google Calendar] Deleted event: ${eventId}`);
  } catch (error) {
    console.error('[Google Calendar] Error deleting event:', error);
    throw new Error('Failed to delete calendar event');
  }
}
