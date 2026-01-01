# Google Sheets Integration Setup Guide (Optional Feature)

## Overview

The Fagor Training Form application includes optional Google Sheets integration that automatically backs up training requests to a Google Sheet. This feature provides an additional layer of data redundancy and allows easy viewing and exporting of training requests without accessing the database directly.

## Important Notice

**This feature is entirely optional.** The application works perfectly without Google Sheets integration:

- ✅ Training requests are saved to MySQL database
- ✅ Clients can select dates via calendar
- ✅ Email notifications are sent to all recipients
- ✅ Admin dashboard displays all requests
- ❌ No automatic backup to Google Sheets (only if not configured)

## Benefits of Google Sheets Integration

Enabling Google Sheets integration provides several advantages:

**Data Redundancy:** Training requests are automatically backed up to Google Sheets in addition to the MySQL database, providing an extra layer of data protection against database failures.

**Easy Access:** Team members can view training requests directly in Google Sheets without needing database access or technical knowledge. The spreadsheet format makes it easy to sort, filter, and analyze requests.

**Export Capability:** Google Sheets allows exporting data to Excel, CSV, or PDF formats with a single click, making it convenient to share reports with management or archive records.

**Real-Time Collaboration:** Multiple team members can view the same Google Sheet simultaneously, making it easier to coordinate training schedules and assign technicians.

**Historical Record:** Google Sheets maintains a permanent record of all training requests, even if database records are modified or deleted.

## Prerequisites

Before setting up Google Sheets integration, ensure you have:

- Google account with access to Google Cloud Console
- Permission to create service accounts in Google Cloud
- Access to Railway dashboard to add environment variables
- A Google Sheet created for storing training requests

## Step-by-Step Setup Process

### Step 1: Create a Google Cloud Project

Navigate to the [Google Cloud Console](https://console.cloud.google.com/) and follow these steps to create a new project:

1. Click on the project dropdown at the top of the page
2. Click **New Project** button
3. Enter project details:
   - **Project name:** `Fagor Training Form`
   - **Organization:** (leave as default or select your organization)
4. Click **Create** button
5. Wait for the project to be created (usually takes 10-30 seconds)
6. Select the newly created project from the dropdown

### Step 2: Enable Google Sheets API

With your project selected, enable the Google Sheets API:

1. Navigate to **APIs & Services** → **Library** from the left sidebar
2. Search for "Google Sheets API" in the search bar
3. Click on **Google Sheets API** from the results
4. Click the **Enable** button
5. Wait for the API to be enabled (usually instant)

### Step 3: Create a Service Account

Service accounts allow applications to access Google APIs without user interaction:

1. Navigate to **APIs & Services** → **Credentials** from the left sidebar
2. Click **Create Credentials** button at the top
3. Select **Service Account** from the dropdown
4. Fill in service account details:
   - **Service account name:** `fagor-training-form-service`
   - **Service account ID:** (auto-generated, e.g., `fagor-training-form-service@project-id.iam.gserviceaccount.com`)
   - **Service account description:** `Service account for Fagor Training Form to write to Google Sheets`
5. Click **Create and Continue**
6. Skip the optional steps (Grant access, Grant users access)
7. Click **Done**

### Step 4: Generate Service Account Key

Create a JSON key file for authentication:

1. In the **Credentials** page, find your newly created service account
2. Click on the service account email to open details
3. Navigate to the **Keys** tab
4. Click **Add Key** → **Create new key**
5. Select **JSON** as the key type
6. Click **Create**
7. A JSON file will be downloaded to your computer (e.g., `fagor-training-form-service-abc123.json`)

**Important:** Store this file securely. It contains credentials that allow access to your Google Sheets. Never commit this file to version control or share it publicly.

### Step 5: Create Google Sheet

Create a new Google Sheet to store training requests:

1. Go to [Google Sheets](https://sheets.google.com/)
2. Click **Blank** to create a new spreadsheet
3. Name the spreadsheet: `Fagor Training Requests`
4. Create the following column headers in row 1:

| Column | Header |
|--------|--------|
| A | Reference Code |
| B | Date |
| C | Company Name |
| D | Contact Person |
| E | Email |
| F | Phone |
| G | Address |
| H | City |
| I | State |
| J | Zip Code |
| K | CNC Model |
| L | Machine Brand |
| M | Machine Model |
| N | Machine Type |
| O | Programming Type |
| P | Knowledge Level |
| Q | Training Days |
| R | Trainees |
| S | Training Details |
| T | Training Cost |
| U | Travel Cost |
| V | Grand Total |
| W | Assigned Technician |
| X | Selected Dates |
| Y | Status |

5. Note the **Sheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
   - Example: If URL is `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   - Then Sheet ID is: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### Step 6: Share Sheet with Service Account

Grant the service account permission to write to your Google Sheet:

1. Open your Google Sheet
2. Click the **Share** button in the top-right corner
3. In the "Add people and groups" field, paste the service account email
   - Format: `fagor-training-form-service@project-id.iam.gserviceaccount.com`
   - (Find this email in the downloaded JSON file under `client_email`)
4. Select permission level: **Editor**
5. Uncheck "Notify people" (service accounts don't receive emails)
6. Click **Share** or **Done**

### Step 7: Prepare Service Account Key for Railway

Convert the JSON key file to a single-line string:

1. Open the downloaded JSON file in a text editor
2. Copy the entire contents
3. Use an online JSON minifier (e.g., [jsonformatter.org/json-minifier](https://jsonformatter.org/json-minifier))
4. Paste the JSON content and click "Minify"
5. Copy the minified output (single line with no line breaks)

**Example format:**
```json
{"type":"service_account","project_id":"fagor-training-123","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...","client_email":"fagor-training-form-service@fagor-training-123.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/..."}
```

### Step 8: Configure Railway Environment Variables

Add the service account key to Railway:

1. Log in to [Railway Dashboard](https://railway.app/)
2. Navigate to your project: `fagor-training-form`
3. Click on the **Variables** tab
4. Click **New Variable** button
5. Add the following variables:

| Variable Name | Value |
|---------------|-------|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | (Paste the minified JSON from Step 7) |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | (Paste the Sheet ID from Step 5) |
| `GOOGLE_SHEETS_ENABLED` | `true` |

6. Click **Add** for each variable
7. Railway will automatically redeploy the application

### Step 9: Test Google Sheets Integration

Verify that training requests are being written to Google Sheets:

1. Open your production application URL
2. Submit a test training request
3. Accept the quotation
4. Select training dates
5. Submit the dates
6. Open your Google Sheet
7. Verify that a new row was added with the training request details

**Expected Result:** A new row should appear in your Google Sheet with all the training request information, including reference code, company details, CNC model, training costs, and selected dates.

## Troubleshooting

### Issue: Permission Denied Error

**Symptoms:**
```
Error: The caller does not have permission
```

**Solutions:**

1. **Check service account email:** Verify you shared the sheet with the correct service account email
2. **Check permission level:** Ensure service account has "Editor" permission (not "Viewer")
3. **Re-share the sheet:** Remove the service account and share again
4. **Check API enabled:** Verify Google Sheets API is enabled in Google Cloud Console

### Issue: Invalid Credentials Error

**Symptoms:**
```
Error: invalid_grant or invalid_client
```

**Solutions:**

1. **Check JSON format:** Ensure the JSON key is properly formatted (no extra spaces or line breaks)
2. **Regenerate key:** Create a new service account key and replace the old one
3. **Check expiration:** Service account keys don't expire, but check if the service account was deleted
4. **Verify environment variable:** Ensure `GOOGLE_SERVICE_ACCOUNT_KEY` is set correctly in Railway

### Issue: Sheet Not Found Error

**Symptoms:**
```
Error: Requested entity was not found
```

**Solutions:**

1. **Check Sheet ID:** Verify `GOOGLE_SHEETS_SPREADSHEET_ID` matches the actual Google Sheet ID
2. **Check sharing:** Ensure the sheet is shared with the service account
3. **Check sheet exists:** Verify the Google Sheet wasn't deleted or moved
4. **Check permissions:** Ensure service account has access to the sheet

### Issue: Data Not Appearing in Sheet

**Symptoms:**
- No error messages
- Training requests saved to database
- But no rows added to Google Sheet

**Solutions:**

1. **Check logs:** View Railway deployment logs for Google Sheets errors
2. **Verify GOOGLE_SHEETS_ENABLED:** Ensure it's set to `true` in Railway
3. **Check sheet structure:** Verify column headers match expected format
4. **Test manually:** Try writing to the sheet manually to verify permissions
5. **Check quota limits:** Google Sheets API has rate limits (100 requests per 100 seconds per user)

## Security Best Practices

Protect your Google Sheets integration:

**Service Account Key Security:**
- Never commit the JSON key file to version control
- Store the key only in Railway environment variables
- Rotate keys periodically (every 6-12 months)
- Delete unused service accounts

**Sheet Access Control:**
- Share the sheet only with necessary team members
- Use "Editor" permission only for the service account
- Use "Viewer" permission for team members who only need to read data
- Regularly review who has access to the sheet

**API Usage Monitoring:**
- Monitor API usage in Google Cloud Console
- Set up alerts for unusual activity
- Check for unauthorized access attempts
- Review service account activity logs

## Data Format in Google Sheets

Training requests are written to Google Sheets with the following structure:

| Field | Description | Example |
|-------|-------------|---------|
| Reference Code | Unique identifier | `290903-4020-0001` |
| Date | Submission date | `2026-01-01` |
| Company Name | Client company | `ABC Manufacturing` |
| Contact Person | Primary contact | `John Doe` |
| Email | Contact email | `john@abc.com` |
| Phone | Contact phone | `555-1234` |
| Address | Full address | `123 Main St, Houston, TX 77002` |
| CNC Model | Selected CNC model | `8055` |
| Machine Brand | Machine manufacturer | `Haas` |
| Machine Model | Machine model number | `VF-2` |
| Machine Type | Mill or Lathe | `Mill` |
| Programming Type | G-Code or Conversational | `G-Code` |
| Knowledge Level | Beginner/Intermediate/Advanced | `Intermediate` |
| Training Days | Number of days | `3` |
| Trainees | Number of trainees | `2` |
| Training Details | Custom requirements | `Focus on advanced features` |
| Training Cost | Training subtotal | `$3,400.00` |
| Travel Cost | Travel expenses | `$2,288.00` |
| Grand Total | Total quotation | `$5,688.00` |
| Assigned Technician | Auto-assigned | `Joseph Hainley` |
| Selected Dates | Training dates | `2026-01-05 to 2026-01-07` |
| Status | Request status | `pending` |

## Viewing and Exporting Data

### Viewing Training Requests

Access your training requests in Google Sheets:

1. Open the Google Sheet in your browser
2. Use filters to sort by date, status, or technician
3. Use search (Ctrl+F) to find specific requests
4. Create pivot tables for analysis

### Exporting Data

Export training requests to other formats:

**Export to Excel:**
1. Click **File** → **Download** → **Microsoft Excel (.xlsx)**
2. Save the file to your computer

**Export to CSV:**
1. Click **File** → **Download** → **Comma Separated Values (.csv)**
2. Import into other systems or databases

**Export to PDF:**
1. Click **File** → **Download** → **PDF Document (.pdf)**
2. Use for printing or archiving

### Creating Reports

Generate reports from your training request data:

1. Create a new sheet tab for reports
2. Use formulas to calculate statistics (e.g., `=COUNTIF(Y:Y,"pending")`)
3. Create charts to visualize trends
4. Share report sheets with management

## Disabling Google Sheets Integration

If you want to disable Google Sheets integration:

1. Log in to Railway dashboard
2. Navigate to your project variables
3. Change `GOOGLE_SHEETS_ENABLED` to `false`
4. Or delete the variable entirely
5. Railway will redeploy automatically

The application will continue to work normally, but training requests will only be saved to the MySQL database.

## Alternative: Manual Data Export

If you prefer not to set up Google Sheets integration, you can manually export data from the database:

1. Log in to Railway dashboard
2. Navigate to the Database tab
3. Click on your database
4. Use the query interface to export data
5. Run query: `SELECT * FROM training_requests ORDER BY createdAt DESC`
6. Export results to CSV

## Support Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Service Accounts Guide](https://cloud.google.com/iam/docs/service-accounts)
- [Google Sheets Help Center](https://support.google.com/docs/)

## Next Steps

After completing Google Sheets setup:

1. ✅ Test integration by submitting a training request
2. ✅ Verify data appears in Google Sheet
3. ✅ Share sheet with team members (Viewer permission)
4. ✅ Set up filters and conditional formatting
5. ✅ Create backup copies of the sheet periodically

---

**Last Updated:** January 1, 2026  
**Feature Status:** Optional  
**Google Sheet:** Fagor Training Requests  
**Service Account:** fagor-training-form-service
