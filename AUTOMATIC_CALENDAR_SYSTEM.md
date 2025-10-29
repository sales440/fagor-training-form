# Automatic Calendar System - Complete Implementation

## 📋 Overview

This document describes the complete implementation of the automatic calendar date selection system with conflict detection, date suggestions, and Google Calendar integration with color-coded status workflow.

## ✅ Implemented Features

### 1. Automatic Date Range Calculation
- When client selects a start date, the system automatically calculates the end date based on training days
- Example: 2 days training starting 2025-11-05 → automatically sets end date to 2025-11-06
- Display shows: "Training will run from 2025-11-05 to 2025-11-06"

### 2. Real-time Availability Checking
- System checks Google Calendar in real-time when client selects a date
- Shows visual indicators:
  - ✅ **Green**: Dates are available
  - ❌ **Red**: Dates have conflicts
  - ⏳ **Loading**: Checking availability...

### 3. Automatic Date Suggestions
- If selected dates have conflicts, system automatically suggests 3 alternative dates
- Suggestions are shown as clickable options
- Each suggestion shows the complete date range
- Client can click any suggestion to select it instantly

### 4. Google Calendar Integration - YELLOW Status (Pending)
- When client confirms dates, system creates event in Google Calendar
- Event color: **YELLOW** (Banana - Color ID 5)
- Event title format: `[PENDING] Company Name - Reference Code`
- Event description includes:
  - Reference code
  - Company name
  - Training days
  - CNC controller model
  - Assigned technician

### 5. Automatic Status Monitoring
- Background service checks calendar events every 5 minutes
- Detects when you manually change event color from YELLOW to GREEN
- Automatically updates database status from "pending" to "confirmed"

### 6. Automatic Confirmation Email
- When event color changes to GREEN, system automatically sends confirmation email to client
- Email includes:
  - Confirmed dates (start and end)
  - Reference code
  - Training details
  - Assigned technician
  - Next steps for client
- Email is sent only once (tracked in database)

### 7. Date Change Detection
- If you manually change the dates in Google Calendar and set color to GREEN
- System detects the new dates and updates database
- Sends confirmation email with the NEW dates

## 🗄️ Database Schema Changes

Added to `training_requests` table:

```sql
googleCalendarEventId VARCHAR(255)  -- Event ID in Google Calendar
calendarStatus ENUM('none', 'pending', 'confirmed') DEFAULT 'none'
lastCalendarCheck TIMESTAMP  -- Last time we checked calendar status
```

## 📁 New Files Created

### 1. `/server/googleCalendar.ts`
Google Calendar API integration service:
- `checkDateAvailability()` - Check if dates are free
- `suggestAlternativeDates()` - Find alternative free dates
- `createPendingEvent()` - Create YELLOW event
- `checkEventStatusChange()` - Check if event changed to GREEN

### 2. `/server/calendarMonitor.ts`
Background monitoring service:
- Runs every 5 minutes
- Checks all pending events
- Detects color changes (YELLOW → GREEN)
- Triggers confirmation emails
- Updates database status

### 3. `/client/src/components/TrainingCalendar.tsx` (Updated)
Enhanced UI component:
- Real-time availability checking
- Visual status indicators
- Alternative date suggestions
- Improved user experience

## 🔧 Configuration Required

### Google Calendar API Setup

1. **Enable Google Calendar API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Google Calendar API"

2. **Create Service Account**:
   - Create a service account
   - Download JSON credentials file
   - Save as `google-calendar-credentials.json` in project root

3. **Share Calendar**:
   - Open your Google Calendar
   - Settings → Share with specific people
   - Add service account email (from JSON file)
   - Give "Make changes to events" permission

4. **Environment Variables**:
   Add to `.env`:
   ```
   GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
   GOOGLE_CALENDAR_CREDENTIALS_PATH=./google-calendar-credentials.json
   ```

## 🎨 Color Codes in Google Calendar

The system uses these color codes:

- **YELLOW (5)**: Pending confirmation - waiting for your approval
- **GREEN (10)**: Confirmed - client will receive automatic email

You can manually change colors in Google Calendar:
1. Click on event
2. Click color palette icon
3. Select GREEN to confirm
4. System will detect change within 5 minutes and send email

## 🔄 Complete Workflow

### Client Side:
1. Client accepts quotation
2. Modal opens: "Select Training Dates"
3. Client picks a start date
4. System automatically:
   - Calculates end date
   - Checks availability
   - Shows conflicts if any
   - Suggests alternatives if needed
5. Client confirms dates
6. System creates YELLOW event in calendar
7. Client sees: "Dates marked as Pending Confirmation"

### Admin Side (You):
1. Check Google Calendar
2. See YELLOW event: `[PENDING] Company Name - 290903-4020-0002`
3. Review details in event description
4. If approved: Change color to GREEN
5. System automatically (within 5 minutes):
   - Detects color change
   - Updates database
   - Sends confirmation email to client

### Client Receives:
1. Professional confirmation email
2. Shows confirmed dates
3. Training details
4. Assigned technician
5. Next steps

## 🚀 API Endpoints

### Check Date Availability
```typescript
trpc.trainingRequest.checkDateAvailability.query({
  startDate: '2025-11-05',
  endDate: '2025-11-06'
})
// Returns: { available: boolean, conflicts: Array }
```

### Get Alternative Dates
```typescript
trpc.trainingRequest.suggestAlternativeDates.query({
  requestedStartDate: '2025-11-05',
  trainingDays: 2
})
// Returns: { suggestions: ['2025-11-07', '2025-11-12', '2025-11-14'] }
```

### Select Dates
```typescript
trpc.trainingRequest.selectDates.mutate({
  referenceCode: '290903-4020-0002',
  startDate: '2025-11-05',
  endDate: '2025-11-06'
})
// Creates YELLOW event in calendar
// Returns: { success: true, eventId: 'abc123' }
```

## 📧 Email Template

Confirmation email includes:
- ✓ CONFIRMED badge in green
- Large display of confirmed dates
- Complete training details table
- Next steps for client
- Professional FAGOR branding
- Contact information

## 🔍 Monitoring & Logs

Calendar monitor logs:
```
[Calendar Monitor] Starting...
[Calendar Monitor] Started - checking every 300 seconds
[Calendar Monitor] Checking 3 pending event(s)...
[Calendar Monitor] Event abc123 changed to CONFIRMED
[Calendar Monitor] Confirmation email sent to client@example.com
```

## 🛠️ Troubleshooting

### Calendar events not being created
- Check Google Calendar API is enabled
- Verify service account has calendar access
- Check credentials file path in .env

### Confirmation emails not sending
- Check calendar monitor is running (logs show "Started")
- Verify event color is GREEN (Color ID 10)
- Check RESEND_API_KEY is configured
- Look for errors in server logs

### Date suggestions not working
- Verify calendar has events to check against
- Check Google Calendar API quota
- Review server logs for API errors

## 📊 Cost Analysis

### Google Calendar API
- **Free tier**: 1,000,000 requests/day
- **Monitoring**: ~288 requests/day (every 5 min)
- **Date checks**: ~50-200 requests/day (depends on volume)
- **Total**: Well within free tier ✅

### Resend Email API
- Confirmation emails: 1 per training
- Already covered by existing email quota

## 🎯 Benefits

1. **Automatic**: No manual email sending needed
2. **Accurate**: Real-time calendar checking
3. **User-friendly**: Visual indicators and suggestions
4. **Professional**: Branded confirmation emails
5. **Reliable**: Background monitoring every 5 minutes
6. **Scalable**: Handles multiple pending events
7. **Traceable**: Complete audit trail in database

## 📝 Next Steps

1. Configure Google Calendar API (see Configuration section)
2. Test with a sample training request
3. Verify calendar monitor is running
4. Test color change detection
5. Confirm email delivery

## 🔐 Security Notes

- Service account credentials should be kept secure
- Never commit `google-calendar-credentials.json` to git
- Add to `.gitignore`:
  ```
  google-calendar-credentials.json
  ```

## 📞 Support

For issues or questions:
- Check server logs for detailed error messages
- Verify all environment variables are set
- Ensure Google Calendar permissions are correct
- Test API endpoints individually using tRPC client

---

**Implementation Date**: October 29, 2025
**Status**: ✅ Complete and Ready for Testing
