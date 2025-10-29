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
- [x] Create GitHub repository integration
- [x] Set up Railway deployment configuration
- [x] Test complete workflow from form submission to database storage


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




- [x] FIX CRITICAL: Railway build failing - moved drizzle-kit migrate from build script to start script (migrations need database connection at runtime, not build time)




- [x] FIX: Move travel hours breakdown text below "Travel Hours" label in quotation display
- [x] FIX: Center signature canvas and make it span full width of container (without changing zoom level)
- [x] FEATURE: Add technician email addresses to notification system based on region assignment (East/Central: Waiky Lau, Khatereh Mohammadi, Yarek Gugulski; West: Joseph Hainley)


