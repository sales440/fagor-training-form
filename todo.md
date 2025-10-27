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

