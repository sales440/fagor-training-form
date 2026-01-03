# Project TODO

- [x] Add Fagor logo in upper left corner matching reference design
- [x] Implement language selector with globe icon in upper right corner
- [x] Support multiple languages (Spanish, English, French, Italian, Basque, Portuguese, Chinese, German)
- [x] Create database schema for training form submissions
- [x] Build training request form with all required fields
- [x] Implement form validation and submission
- [x] Add quotation generation functionality
- [x] Implement signature pad functionality
- [x] Add terms and conditions section
- [ ] Create GitHub repository integration
- [ ] Set up Railway deployment configuration
- [ ] Test complete workflow from form submission to database storage


- [x] Replace logo with official Fagor Automation logo (with red symbol and claim)
- [x] Remove any red color from main screen


- [x] Generate automatic quotation when SUBMIT is pressed
- [x] Calculate training days pricing from reference format
- [x] Create travel expenses database (hotels, food, car rental, flights from Chicago O'Hare)
- [ ] Implement weekly automatic update of travel expenses database
- [x] Calculate travel expenses based on client address (flight hours + driving time from nearest airport)
- [ ] Integrate Google Calendar to show available dates from 3 engineers (Waiky Lau, Joseph Hainley, Khatereh Mohammadi)
- [x] Add CNC model 8055 with checkbox in Fagor Controller Model section
- [x] Implement complete validation before showing quotation
- [x] Enable OEM fields dynamically when OEM name is filled


- [x] Remove blue background from header and make it white
- [x] Add Fagor address information next to logo in header
- [x] Change all blue text colors to Fagor red (#DC241F)


- [x] Change CNC Model field to dropdown selector with models: 8055, 8058, 8060, 8065, 8070
- [x] Remove 8055 checkbox


- [x] Move Fagor address to right side of header at same level as logo


- [ ] Add detailed training description text area in Training Details section
- [ ] Move language selector icon above Company Information section (centered)
- [ ] Adjust Fagor address position further to the right for better alignment with logo


- [ ] Change programming type options from ISO to G-Code (keep Conversational)


- [x] Make "FAGOR AUTOMATION" text red in address header
- [ ] Center language globe icon between gray subtitle and Company Information section
- [ ] Change "ISO" to "G-CODE" in Programming Type dropdown
- [ ] Add "Training Details" text area field in Training Details section
- [x] Reduce signature canvas size to fit within signature box
- [x] Add Fagor logo and address to quotation dialog header
- [x] Include end-user data, OEM data, CNC model, and machine model in quotation
- [ ] Integrate Google Calendar API to check engineer availability
- [ ] Implement automatic engineer assignment based on client location (West Coast/TX/Denver/Midwest: Joseph Hainley, East Coast: Waiky Lau/Yarek Gugulsky/Khatereh Mohammadi)
- [ ] Connect "ACCEPT QUOTATION" button to Google Calendar scheduling


- [x] Add Google Service Account credentials to project
- [x] Implement Google Sheets API integration to read calendar
- [x] Create engineer assignment logic based on client location
- [ ] Implement date availability checking (avoid red/green/orange dates)
- [ ] Add date suggestion system after quotation acceptance
- [x] Send notification to owner when quotation is accepted
- [ ] Allow manual confirmation before updating calendar
- [ ] Update Google Sheet with yellow color for pending confirmations


- [x] Fix form submission error when accepting quotation
- [x] Make Google Calendar integration non-blocking (optional)
- [x] Add proper error handling for notification failures


- [x] Change "G-Code" back to "ISO" in Programming Type dropdown
- [x] Remove all Google Calendar integration code
- [x] Remove engineer assignment logic
- [x] Simplify form submission to only save to database and send email notification


- [x] Revert Programming Type from "ISO" back to "G-Code" (correcting unauthorized change)


- [x] Implement email notifications to service@fagor-automation.com when quotation is accepted
- [x] Add configuration system to manage multiple notification email addresses
- [x] Create email template with all training request details


- [x] Integrate travel expense calculator using Excel data
- [x] Calculate flight costs based on customer state
- [x] Calculate hotel costs based on training days
- [x] Calculate car rental costs based on training days
- [x] Calculate travel hours: (flight hours + driving hours from airport to address) × 2
- [x] Apply travel hour rate of $110/hour
- [ ] Apply seasonal factors based on travel date (future enhancement)
- [ ] Update quotation display with detailed travel expense breakdown


- [x] Integrate Google Maps Distance Matrix API for accurate driving time calculations
- [x] Calculate real driving time from airport to customer address
- [x] Update travel time calculation to use actual Google Maps data


- [x] Correct training pricing: $1,400/day (first day), $1,000/day (additional days)
- [x] Fix travel expense calculation logic
- [x] Display quotation breakdown vertically instead of horizontally
- [x] Show detailed line items: training days, travel time, flight, hotel, car, food


- [x] Fix all quotation titles to proper capitalization with spaces
- [x] Review flight cost logic for Illinois addresses (Confirmed: $0 for IL, calculated for other states)
- [x] Verify email notification is sent to jcrobledolopez@gmail.com (Confirmed: configured correctly)


- [x] Add interactive map showing route from nearest airport to customer address in quotation


- [x] FIX CRITICAL: Texas addresses showing $0 flight cost instead of $734 (Fixed: await async calculateQuotation)
- [x] FIX CRITICAL: Accept Quotation button throwing error and not submitting (Fixed: await async calculateQuotation)
- [x] FIX CRITICAL: Email notifications not being sent to jcrobledolopez@gmail.com (Fixed: database query filter)
- [x] Reduce signature canvas size (currently too large/amplified) (Fixed: 400x100 instead of 500x150)


- [ ] FIX CRITICAL: Excel file not loading in production (__dirname error), causing all addresses to default to Illinois with $0 flight


- [x] FIX CRITICAL: Excel file not loading (__dirname error in ES modules), all 50 states defaulting to Illinois with $0 flight (Fixed: dual mapping by state name and 2-letter code)


- [x] Split address field into: Address 1, Address 2, City, State, Zip Code
- [x] Update flight logic: Only Illinois (state) = $0 flight, California = $0 flight, all others require flight
- [x] Implement two-office system: Rolling Meadows IL and Anaheim CA
- [x] Calculate travel from nearest office to client location
- [x] Determine which office based on client location (West coast states → Anaheim, East/Central → Rolling Meadows)


- [x] Research and add flight prices from Anaheim (SNA/LAX) to west coast airports (CA, OR, WA, NV, AZ, etc.)


- [x] FIX CRITICAL: Texas address (Mansfield TX 76063) showing $0 flight instead of $734 in production (Fixed: Excel file not being copied to dist folder)
- [ ] FIX CRITICAL: Google Maps embed showing API key error - User must add VITE_GOOGLE_MAPS_API_KEY to Railway environment variables


- [ ] FIX CRITICAL: ACCEPT QUOTATION button showing "Error submitting request" - email not being sent to jcrobledolopez@gmail.com




- [ ] FIX CRITICAL: Production showing %VITE_APP_TITLE% instead of actual title - environment variables not loading in Railway build
- [ ] Force Railway rebuild to properly compile frontend with environment variables




- [x] FIX CRITICAL: Flight prices in Excel are ONE-WAY only ($367 for Texas), but system needs ROUND TRIP prices. Must multiply by 2 to get correct round trip cost ($734 for Texas)




- [x] FIX: Car rental calculation should be (training days) not (training days + 1) - rent car for number of nights only
- [x] FIX: Hotel price should be fixed at $130 USD per night instead of variable from Excel
- [x] FIX: Signature canvas zoom is too high - reduce zoom so signature is visible at normal size




- [x] FIX: Car rental calculation should be (training days) not (training days + 1) - rent car for number of nights only
- [x] FIX: Hotel price should be fixed at $130 USD per night instead of variable from Excel
- [x] FIX: Signature canvas zoom is too high - reduce zoom so signature is visible at normal size




- [x] FIX: Car rental should be (training days + 1) not just training days
- [x] FIX: Car rental label in quotation should show detailed calculation: "Car Rental ($XX per day × Y days)"




- [ ] FIX: Add detailed breakdown for Travel Hours showing: "X hrs flight + Y hrs driving × 2 (round trip) = Z total hrs"




- [x] FIX: Modify "Travel Hours" line to show detailed breakdown: "X hrs flight + Y hrs driving × 2 (round trip) = Z total hrs"




## New Features Required:

- [ ] FEATURE: After accepting quotation, display calendar for client to select training date
- [ ] FEATURE: Automatic technician assignment based on client state (Joseph Hainley: West/Central, Others: East/Central)
- [ ] FEATURE: Connect to Google Sheets API for calendar management
- [ ] FEATURE: Color coding system (green/yellow/orange/red) for availability status
- [ ] FEATURE: Write training request to Google Sheets with yellow status (tentative)




## PHASE 1: Application Implementation (COMPLETED)

- [x] FEATURE: Generate unique reference code for each quotation (format: 290903-4020-XXXX)
- [x] FEATURE: Create database table for tracking training requests
- [x] FEATURE: Display calendar after quotation acceptance
- [x] FEATURE: Automatic technician assignment based on state
- [x] FEATURE: Allow client to select training dates
- [x] FEATURE: Write selected dates to Google Sheets with YELLOW background (tentative)
- [x] FEATURE: Store request data in database with status tracking
- [ ] TODO: API endpoint to generate PDF with confirmed dates (for Phase 2 n8n workflow)

## PHASE 2: n8n Workflow (PENDING USER CONFIRMATION)

- [ ] FEATURE: Create n8n workflow via API
- [ ] FEATURE: Implement polling system (every 30 minutes) to check for color changes in Google Sheets
- [ ] FEATURE: When color changes from YELLOW to GREEN, trigger confirmation email
- [ ] FEATURE: Send confirmation email with PDF attachment to client




- [x] FIX: Ensure entire project is fully responsive for mobile devices (forms, quotation, calendar, dialogs)



- [x] FIX CRITICAL: Terms and conditions checkbox not working in production - replaced shadcn/ui Checkbox with native HTML input




## CURRENT CRITICAL ISSUES (Dec 20, 2025)

- [x] FIX: TypeScript compilation error in googleSheetsService.ts line 114 (index signature issue)
- [x] RESTORE: Created airportFinder.ts with nearest airport functionality
- [x] FIX: Integrated findNearestInternationalAirport() into travelCalculator.ts
- [x] FIX: Added missing airport coordinates (IAH, SAN, SFO, SJC, OAK, SMF, AUS, SAT, MCO, TPA)
- [x] TEST: Verified nearest airport functionality works correctly (Houston→IAH, Colorado Springs→DEN, San Diego→SAN)
- [x] FIX: Improved error handling in create mutation with detailed error messages
- [ ] FIX CRITICAL: "Error submitting request" when accepting quotation in production (Railway) - likely database connection issue
- [ ] DEPLOY: Push changes to Railway and verify production functionality
- [ ] TEST: Verify complete end-to-end workflow in production after deployment


---

## 🎯 NEW REQUIREMENTS - COMPREHENSIVE AUDIT & MULTI-RECIPIENT EMAILS (Dec 20, 2025)

### 📧 PHASE A: MULTI-RECIPIENT EMAIL SYSTEM (CRITICAL) ✅ COMPLETED

**Requirement:** When client accepts quotation, send email to:
- [x] Client's email (from form - dynamic)
- [x] jcrobledo@fagor-automation.com (fixed)
- [x] service@fagor-automation.com (fixed)  
- [x] jcrobledolopez@gmail.com (fixed - already configured)

**Implementation Tasks:**
- [x] Update `notification_emails` table to support multiple fixed recipients
- [x] Add fixed emails to database: jcrobledo@fagor-automation.com, service@fagor-automation.com
- [x] Modify `emailService.ts` to send to client email + all active notification emails
- [x] Validate client email format before sending
- [x] Add email validation in form (syntax + domain check)
- [x] Ensure client email is stored in `training_requests.email` field
- [x] Update `sendTrainingRequestNotification()` to include client as recipient
- [ ] Add retry logic for failed email sends (future enhancement)
- [x] Implement secure logging (don't expose full emails in logs)
- [x] Add unit tests for multi-recipient email service

### ✈️ PHASE B: AIRPORT FINDER INTEGRATION ✅ COMPLETED

- [x] Created airportFinder.ts with Google Distance Matrix API integration
- [x] Integrated into travelCalculator.ts
- [x] Verified functionality with local tests (Houston, Colorado Springs, San Diego, etc.)
- [x] Added missing airport coordinates (IAH, SAN, SFO, etc.)
- [ ] Merge branch `fix/nearest-airport-calculation` into `main` on GitHub (ready to merge)
- [ ] Verify production deployment after merge
- [ ] Add UI option for manual airport override (future enhancement)
- [x] Document airport selection algorithm

### 💰 PHASE C: ESTIMATED EXPENSES DISCLAIMER (MULTILINGUAL) ✅ COMPLETED

**Requirement:** Add note in quotation indicating expenses are estimated

**Implementation:**
- [x] Add disclaimer text in English: "Travel expenses are estimated and subject to change. Final costs will be reviewed and adjusted based on actual expenses incurred."
- [x] Add disclaimer text in Spanish: "Los gastos de viaje son estimados y sujetos a cambios. Los costos finales serán revisados y ajustados según los gastos reales incurridos."
- [x] Add disclaimer to QuotationDialog component (visible in UI)
- [x] Add disclaimer to email notification template
- [x] Ensure disclaimer appears in all supported languages (English/Spanish)
- [x] Style disclaimer appropriately (blue info box with border)

### 🧪 PHASE D: END-TO-END TESTING

- [ ] Test complete flow: form fill → quotation → acceptance → emails sent
- [ ] Verify client email is saved to database
- [ ] Verify all 4 recipients receive email (client + 3 fixed)
- [ ] Test with different addresses (Houston, Colorado, San Diego, Miami, Seattle)
- [ ] Verify nearest airport calculation is accurate
- [ ] Test in both English and Spanish
- [ ] Verify estimated expenses disclaimer appears
- [ ] Test error handling (invalid email, API failures, DB connection issues)
- [ ] Test on mobile devices (responsive design)

### 🚀 PHASE E: RAILWAY DEPLOYMENT

- [ ] Create checkpoint before deployment
- [ ] Merge `fix/nearest-airport-calculation` into `main`
- [ ] Verify Railway auto-deploys from GitHub push
- [ ] Monitor Railway deployment logs
- [ ] Verify no TypeScript compilation errors
- [ ] Verify all environment variables are set:
  - [ ] DATABASE_URL
  - [ ] GOOGLE_MAPS_API_KEY
  - [ ] VITE_GOOGLE_MAPS_API_KEY
  - [ ] RESEND_API_KEY
  - [ ] GOOGLE_SERVICE_ACCOUNT_KEY
- [ ] Test production application thoroughly
- [ ] Verify email sending works in production
- [ ] Document rollback procedure if needed

### 📊 PHASE F: FINAL DELIVERABLES

- [ ] Create audit report with findings
- [ ] Document all code changes made
- [ ] Create admin guide for managing notification emails
- [ ] Document email service API and configuration
- [ ] Create troubleshooting guide for common issues
- [ ] Document deployment process step-by-step
- [ ] Provide clean, well-documented source code
- [ ] Create user guide for form submission process

---

## 🔍 AUDIT FINDINGS (To be completed)

### Database Schema
- ✅ `training_requests` table has `email` field for client email
- ✅ `notification_emails` table exists with `isActive` field
- ⚠️ Only 1 email configured (jcrobledolopez@gmail.com), need to add 2 more

### Email Service
- ✅ `emailService.ts` exists and uses Resend API
- ✅ `sendTrainingRequestNotification()` function implemented
- ⚠️ Currently only sends to notification_emails table, not to client
- ❌ No retry logic for failed sends
- ❌ No email validation before sending

### Airport Finder
- ✅ `airportFinder.ts` created with Google Distance Matrix API
- ✅ Integrated into `travelCalculator.ts`
- ⚠️ Not yet merged to production (in branch `fix/nearest-airport-calculation`)
- ✅ Tested locally with 6 different cities, all successful

### Code Quality
- ✅ TypeScript compilation errors fixed
- ✅ Proper error handling in most places
- ⚠️ Some console.log statements could be replaced with proper logging
- ✅ Code is generally well-structured and maintainable

---

## 📝 NOTES FOR IMPLEMENTATION

- Use Resend API for email sending (already configured)
- Google Maps API key is available in environment variables
- Database connection is via Drizzle ORM
- Frontend uses React 19 + Tailwind 4
- Backend uses Express 4 + tRPC 11
- Railway auto-deploys from `main` branch on GitHub push


---

## 🔍 AUDITORÍA EN PROGRESO

### Archivos a Revisar:
- [ ] server/emailService.ts - Revisar implementación actual
- [ ] server/routers.ts - Revisar mutation trainingRequest.create
- [ ] server/db.ts - Revisar funciones de notificación
- [ ] drizzle/schema.ts - Verificar campos de email
- [ ] client/src/pages/Home.tsx - Verificar validación de email en formulario


---

## 🚨 CRITICAL PRODUCTION ERROR (Dec 21, 2025)

- [ ] FIX CRITICAL: "Error submitting request" when accepting quotation in production
- [ ] FIX: Google Sheets spreadsheet ID is incorrect (404 error: "Requested entity was not found")
- [ ] UPDATE: Correct spreadsheet ID in environment variables or code
- [ ] TEST: Verify quotation acceptance works after fix
- [ ] DEPLOY: Push fix to Railway and verify in production


---

## 🎯 INTELLIGENT DATE SELECTION WITH VISUAL CALENDAR (Dec 21, 2025)

- [ ] Auto-calculate end date based on `trainingDays` from client input
- [ ] Show visual calendar with color-coded availability in client date selection
- [ ] Color codes: Green (available), Yellow (pending), Red (booked), Gray (unavailable)
- [ ] Only allow start date selection - end date auto-calculated
- [ ] Display training duration prominently
- [ ] Validate dates don't conflict with existing bookings
- [ ] Create tRPC endpoint to fetch technician availability
- [ ] Build visual calendar component with react-big-calendar
- [ ] Apply color coding based on booking status
- [ ] Integrate into client-facing date selection dialog


---

## 🚨 RAILWAY DEPLOYMENT CRITICAL FIXES (Dec 21, 2025)

- [ ] FIX CRITICAL: Form submission error "Error submitting request. Please try again." in production
- [ ] FIX CRITICAL: Admin login route returning 404 (page not found)
- [ ] FIX CRITICAL: Completely disable Google Sheets integration to eliminate log errors
- [ ] TEST: Verify form submission works end-to-end in Railway
- [ ] TEST: Verify admin login and dashboard accessible in Railway
- [ ] DEPLOY: Push fixes to GitHub and verify Railway auto-deploys
- [ ] VERIFY: Confirm all functionality works correctly in production

## 🔧 Railway SPA Routing Fix (Dec 21, 2025)

- [x] Add server-side fallback to serve index.html for all client routes
- [x] Configure Express to handle SPA routing
- [ ] Test /admin/login route in Railway (STILL FAILING - 404)
- [ ] Test /admin/dashboard route in Railway
- [ ] Test /confirm-dates route in Railway
- [ ] Verify form submission works end-to-end


## 🔧 Manus Deployment SSL Fix (Dec 21, 2025)

- [ ] Fix MySQL SSL configuration for Manus production
- [ ] Update database connection to handle SSL properly
- [ ] Test Manus deployment publish
- [ ] Verify all functionality works in Manus production


## 🚨 Railway Middleware Order Fix (Dec 21, 2025)

- [ ] Add express.static(distPath) BEFORE app.use("*") catchall
- [ ] Ensure static files are served before SPA fallback
- [ ] Push to GitHub and verify Railway deployment
- [ ] Test all routes work correctly


---

## 🎯 NEW FEATURES - KANBAN CALENDAR & MULTI-EMAIL (Jan 1, 2026) - 300 CREDITS

### CRITICAL FIXES:
- [ ] FIX: Google Maps not displaying in quotation (API key error - "Google Maps Platform rejected your request")
- [ ] FIX: Implement route map from airport to client location with proper API key
- [ ] FEATURE: Kanban calendar appears after clicking "ACCEPT QUOTATION" button
- [ ] FEATURE: Calendar shows FAGOR logo in top-left corner
- [ ] FEATURE: User can select training dates based on training days count from form
- [ ] FEATURE: SUBMIT button in calendar sends date selection
- [ ] FEATURE: Confirmation message: "Your training dates will be confirmed via email, or alternative dates will be proposed"
- [ ] EMAIL: Send quotation to user email (variable from form: formData.email)
- [ ] EMAIL: Send quotation to jcrobledo@fagor-automation.com (fixed)
- [ ] EMAIL: Send quotation to service@fagor-automation.com (fixed)
- [ ] DEPLOY: Push all changes to GitHub
- [ ] TEST: Verify complete flow works in Railway production end-to-end


## CURRENT ISSUE (Jan 1, 2026)

- [ ] FIX CRITICAL: Google Sheets integration throwing blocking error "Failed to write training request to Google Sheets" when GOOGLE_SERVICE_ACCOUNT_KEY not configured - make it optional/non-blocking


## CURRENT ISSUE (Jan 1, 2026) ✅ RESOLVED

- [x] FIX CRITICAL: "Failed to write training request to Google Sheets" error blocking date selection
- [x] Make Google Sheets integration optional (non-blocking)
- [x] Update `getAuthClient()` to return null instead of throwing error when disabled
- [x] Update all Google Sheets functions to handle null auth client gracefully
- [x] Test complete flow: form submission → quotation → date selection → success
- [x] Verify dates are saved to MySQL database even when Google Sheets is disabled
- [x] Calendar now allows selecting multiple consecutive days based on training days input
- [x] Fixed `savedTrainingDays` state to preserve value after form reset


### 🔧 FIXES REQUESTED (Jan 3, 2026)

- [ ] No hotel/car rental if client within 100 miles of FAGOR Rolling Meadows, IL
- [ ] No hotel/car rental if client within 100 miles of FAGOR Anaheim, CA
- [ ] Ensure FAGOR logo appears in PDF quotation document
- [ ] Fix email delivery to jcrobledo@fagor-automation.com (not receiving emails)
