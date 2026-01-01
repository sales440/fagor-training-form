# Railway Deployment Guide - Fagor Training Form

This document provides step-by-step instructions for deploying and configuring the Fagor Training Form application on Railway.

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- GitHub repository connected to Railway
- SendGrid account (for email notifications)
- Google Cloud account (optional, for Google Sheets integration)

## Current Deployment Status

The application is currently deployed on Railway and accessible at your production URL. However, some features require additional configuration to work properly.

## Required Environment Variables

### Already Configured ✅

These variables are already set in your Railway deployment:

- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Session cookie signing secret
- `VITE_APP_ID` - Manus OAuth application ID
- `OAUTH_SERVER_URL` - Manus OAuth backend base URL
- `VITE_OAUTH_PORTAL_URL` - Manus login portal URL
- `OWNER_OPEN_ID`, `OWNER_NAME` - Owner's information
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Logo image URL
- `GOOGLE_MAPS_API_KEY` - For travel calculations
- `VITE_GOOGLE_MAPS_API_KEY` - For map display in quotations

### Needs Configuration ⚠️

#### 1. SENDGRID_API_KEY (Critical for Email Notifications)

**Purpose:** Enables email notifications when clients submit training requests.

**Current Status:** Not configured. Emails will fail to send until this is added.

**How to Configure:**

1. Log in to Railway dashboard
2. Navigate to your project: `fagor-training-form`
3. Click on "Variables" tab
4. Click "New Variable"
5. Add:
   - **Name:** `SENDGRID_API_KEY`
   - **Value:** `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`
6. Click "Add" and Railway will automatically redeploy

**Recipients:** When configured, emails will be sent to:
- Client's email (from form submission)
- jcrobledo@fagor-automation.com
- service@fagor-automation.com
- jcrobledolopez@gmail.com

**Next Step:** After adding the API key, you must verify the domain `fagor-automation.com` in SendGrid. See [SENDGRID_DOMAIN_VERIFICATION.md](./SENDGRID_DOMAIN_VERIFICATION.md) for detailed instructions.

#### 2. GOOGLE_SERVICE_ACCOUNT_KEY (Optional - for Google Sheets Backup)

**Purpose:** Enables automatic backup of training requests to Google Sheets.

**Current Status:** Not configured. The application works perfectly without this feature.

**Impact if Not Configured:**
- ✅ Training requests are saved to MySQL database
- ✅ Clients can select dates via calendar
- ✅ Admin dashboard works normally
- ❌ No automatic backup to Google Sheets

**How to Configure (Optional):**

See [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) for detailed instructions.

## Deployment Process

### Automatic Deployment

Railway automatically deploys when you push to the `main` branch on GitHub:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Railway will:
1. Detect the push
2. Build the application
3. Run database migrations
4. Deploy to production
5. Update the live URL

### Manual Deployment

If you need to trigger a manual deployment:

1. Go to Railway dashboard
2. Navigate to your project
3. Click on the service
4. Click "Deploy" button
5. Select "Redeploy"

## Monitoring Deployment

### Check Deployment Status

1. Go to Railway dashboard
2. Click on your project
3. View "Deployments" tab
4. Check the status:
   - 🟢 **Success** - Deployment completed successfully
   - 🟡 **Building** - Deployment in progress
   - 🔴 **Failed** - Deployment failed (check logs)

### View Deployment Logs

1. Click on the deployment
2. View "Build Logs" tab to see compilation output
3. View "Deploy Logs" tab to see runtime output
4. Look for errors or warnings

### Common Log Messages

**Normal (Expected):**
```
[GoogleSheets] Integration disabled, skipping write
```
This is normal when `GOOGLE_SERVICE_ACCOUNT_KEY` is not configured.

**Warning (Needs Attention):**
```
[Email] Failed to send email: 403 validation_error
```
This means SendGrid API key is not configured or domain is not verified.

**Error (Critical):**
```
Error: Database connection failed
```
This means `DATABASE_URL` is incorrect or database is unavailable.

## Testing After Deployment

### 1. Test Form Submission

1. Open your production URL
2. Fill out the training request form
3. Submit the form
4. Verify quotation appears correctly
5. Accept the quotation
6. Select training dates on the calendar
7. Submit dates

### 2. Test Email Notifications

After configuring `SENDGRID_API_KEY`:

1. Submit a test training request
2. Check that emails are received by:
   - Client email (use your own email for testing)
   - jcrobledo@fagor-automation.com
   - service@fagor-automation.com
   - jcrobledolopez@gmail.com

### 3. Test Database Storage

1. Submit a training request
2. Log in to Railway dashboard
3. Navigate to Database tab
4. Query `training_requests` table
5. Verify the request was saved correctly

## Troubleshooting

### Issue: Emails Not Sending

**Symptoms:**
- Form submits successfully
- No emails received

**Solutions:**
1. Check `SENDGRID_API_KEY` is configured in Railway
2. Verify domain in SendGrid (see [SENDGRID_DOMAIN_VERIFICATION.md](./SENDGRID_DOMAIN_VERIFICATION.md))
3. Check deployment logs for email errors
4. Verify email addresses in `notification_emails` table

### Issue: Google Sheets Errors in Logs

**Symptoms:**
```
Error initializing Google Sheets client: GOOGLE_SERVICE_ACCOUNT_KEY not set
```

**Solution:**
This is expected if you haven't configured Google Sheets integration. The application works normally without it. If you want to enable it, see [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md).

### Issue: Calendar Not Showing Dates

**Symptoms:**
- Calendar appears empty
- No dates are highlighted

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify `trainingDays` field has a valid number
3. Clear browser cache and reload
4. Check that form data is preserved after submission

### Issue: Deployment Failed

**Symptoms:**
- Red status in Railway dashboard
- Build or deploy logs show errors

**Solutions:**
1. Check build logs for TypeScript errors
2. Verify all environment variables are set
3. Check database connection
4. Review recent code changes
5. Rollback to previous working checkpoint if needed

## Rollback Procedure

If a deployment introduces issues:

1. Go to Manus dashboard
2. Navigate to your project checkpoints
3. Find the last working checkpoint
4. Click "Rollback" button
5. Railway will automatically deploy the previous version

## Security Best Practices

### Environment Variables

- ✅ Never commit `.env` files to GitHub
- ✅ Store sensitive keys only in Railway dashboard
- ✅ Rotate API keys periodically
- ✅ Use different keys for development and production

### Database

- ✅ Use strong passwords
- ✅ Enable SSL connections
- ✅ Restrict access to trusted IPs only
- ✅ Regular backups (Railway handles this automatically)

### API Keys

- ✅ SendGrid: Restrict to sending only (no admin permissions)
- ✅ Google Maps: Restrict to your domain only
- ✅ Google Sheets: Grant minimum required permissions

## Performance Optimization

### Database Queries

The application uses indexed queries for optimal performance:
- `referenceCode` - Unique index for fast lookups
- `email` - Index for email searches
- `status` - Index for filtering by status

### Caching

Railway automatically caches:
- Static assets (images, CSS, JavaScript)
- Node modules during builds
- Docker layers

### Monitoring

Monitor your application health:
1. Railway dashboard → Metrics tab
2. Check CPU usage, memory usage, response times
3. Set up alerts for high resource usage

## Support

If you encounter issues not covered in this guide:

1. Check Railway documentation: [docs.railway.app](https://docs.railway.app)
2. Check SendGrid documentation: [docs.sendgrid.com](https://docs.sendgrid.com)
3. Review application logs in Railway dashboard
4. Contact Manus support at [help.manus.im](https://help.manus.im)

## Next Steps

1. ✅ Configure `SENDGRID_API_KEY` in Railway
2. ✅ Verify `fagor-automation.com` domain in SendGrid
3. ✅ Test email notifications in production
4. ⚠️ (Optional) Configure Google Sheets integration
5. ✅ Monitor deployment logs for any issues

---

**Last Updated:** January 1, 2026  
**Application Version:** e8ba0079  
**Railway Project:** fagor-training-form
