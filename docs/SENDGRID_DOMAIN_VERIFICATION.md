# SendGrid Domain Verification Guide

## Overview

SendGrid requires domain verification before you can send emails from addresses using that domain. This guide walks you through verifying the **fagor-automation.com** domain so that emails sent from `noreply@fagor-automation.com` are delivered successfully and avoid spam folders.

## Why Domain Verification is Required

When you send emails without domain verification, SendGrid restricts you to sending only to verified email addresses (typically your own). The error message you'll see is:

```
403 validation_error: You can only send testing emails to your own email address.
To send emails to other recipients, please verify a domain at resend.com/domains.
```

Once the domain is verified, you can send emails to any recipient, and your emails will have better deliverability rates because they'll pass SPF and DKIM authentication checks.

## Prerequisites

- SendGrid account with API key already created
- Access to DNS settings for **fagor-automation.com** domain
- Domain registrar login credentials (GoDaddy, Namecheap, Cloudflare, etc.)

## Step-by-Step Verification Process

### Step 1: Log in to SendGrid Dashboard

Navigate to [SendGrid Dashboard](https://app.sendgrid.com/) and log in with your credentials.

### Step 2: Navigate to Sender Authentication

Follow these steps in the SendGrid dashboard:

1. Click on **Settings** in the left sidebar
2. Click on **Sender Authentication**
3. Find the **Domain Authentication** section
4. Click **Get Started** or **Authenticate Your Domain**

### Step 3: Enter Domain Information

You'll be prompted to enter your domain details:

| Field | Value |
|-------|-------|
| **Domain You Send From** | `fagor-automation.com` |
| **Select DNS Host** | Choose your DNS provider (e.g., GoDaddy, Cloudflare, Namecheap) |
| **Would you also like to brand the links for this domain?** | Yes (recommended) |
| **Use automated security** | Yes (recommended) |

Click **Next** to proceed.

### Step 4: Add DNS Records

SendGrid will generate three DNS records that you need to add to your domain:

#### CNAME Records to Add

SendGrid will provide records similar to these (your values will be different):

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | `s1._domainkey.fagor-automation.com` | `s1.domainkey.u123456.wl.sendgrid.net` | 3600 |
| CNAME | `s2._domainkey.fagor-automation.com` | `s2.domainkey.u123456.wl.sendgrid.net` | 3600 |
| CNAME | `em1234.fagor-automation.com` | `u123456.wl.sendgrid.net` | 3600 |

**Important:** Copy the exact values provided by SendGrid, as they are unique to your account.

### Step 5: Add Records to Your DNS Provider

The process varies depending on your DNS provider. Here are instructions for common providers:

#### For GoDaddy:

1. Log in to [GoDaddy Domain Manager](https://dcc.godaddy.com/)
2. Find **fagor-automation.com** in your domain list
3. Click **DNS** or **Manage DNS**
4. Scroll to **Records** section
5. Click **Add** button
6. For each CNAME record:
   - **Type:** CNAME
   - **Host:** Enter the host from SendGrid (e.g., `s1._domainkey`)
   - **Points to:** Enter the value from SendGrid
   - **TTL:** 1 Hour (or 3600 seconds)
7. Click **Save**
8. Repeat for all three records

#### For Cloudflare:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select **fagor-automation.com** domain
3. Click **DNS** tab
4. Click **Add record** button
5. For each CNAME record:
   - **Type:** CNAME
   - **Name:** Enter the host from SendGrid (e.g., `s1._domainkey`)
   - **Target:** Enter the value from SendGrid
   - **Proxy status:** DNS only (gray cloud icon)
   - **TTL:** Auto
6. Click **Save**
7. Repeat for all three records

#### For Namecheap:

1. Log in to [Namecheap Account](https://www.namecheap.com/myaccount/)
2. Go to **Domain List**
3. Click **Manage** next to **fagor-automation.com**
4. Click **Advanced DNS** tab
5. Click **Add New Record**
6. For each CNAME record:
   - **Type:** CNAME Record
   - **Host:** Enter the host from SendGrid (e.g., `s1._domainkey`)
   - **Value:** Enter the value from SendGrid
   - **TTL:** Automatic
7. Click the green checkmark to save
8. Repeat for all three records

### Step 6: Verify DNS Records

After adding the DNS records:

1. Wait 5-10 minutes for DNS propagation (can take up to 48 hours in rare cases)
2. Return to SendGrid dashboard
3. Click **Verify** button in the Domain Authentication page

SendGrid will check if the DNS records are correctly configured.

**Verification Status:**

- ✅ **Verified** - Domain is authenticated and ready to use
- ⏳ **Pending** - DNS records not found yet (wait longer and try again)
- ❌ **Failed** - DNS records are incorrect (double-check values)

### Step 7: Test Email Sending

Once verification is complete, test email sending:

1. Go to your Railway-deployed application
2. Submit a test training request
3. Check that emails are received by all recipients:
   - Client email
   - jcrobledo@fagor-automation.com
   - service@fagor-automation.com
   - jcrobledolopez@gmail.com

## Troubleshooting

### Issue: DNS Records Not Found

**Symptoms:**
- SendGrid shows "Pending" or "Failed" verification status
- Error: "We couldn't find the DNS records"

**Solutions:**

1. **Wait longer:** DNS propagation can take up to 48 hours (usually 5-30 minutes)
2. **Check record values:** Ensure you copied the exact values from SendGrid
3. **Remove extra spaces:** DNS values should not have leading/trailing spaces
4. **Check host format:** Some DNS providers require you to enter only the subdomain part (e.g., `s1._domainkey` instead of `s1._domainkey.fagor-automation.com`)
5. **Verify TTL:** Use recommended TTL value (3600 seconds or 1 hour)

### Issue: CNAME Already Exists

**Symptoms:**
- DNS provider shows error: "Record already exists"

**Solutions:**

1. **Check existing records:** Look for existing CNAME records with the same host
2. **Delete old records:** Remove conflicting records before adding new ones
3. **Update existing records:** Modify the existing record to point to the new SendGrid value

### Issue: Emails Still Going to Spam

**Symptoms:**
- Domain is verified
- Emails are delivered but land in spam folder

**Solutions:**

1. **Check SPF record:** Ensure your domain has a valid SPF record
2. **Check DKIM:** Verify DKIM records are correctly configured
3. **Warm up domain:** Send emails gradually to build sender reputation
4. **Avoid spam triggers:** Don't use all caps, excessive punctuation, or spam keywords
5. **Monitor sender score:** Check your domain's reputation at [SenderScore](https://www.senderscore.org/)

### Issue: Wrong DNS Provider Selected

**Symptoms:**
- Instructions don't match your DNS interface

**Solutions:**

1. Go back to SendGrid domain authentication
2. Click **Edit** or **Re-authenticate**
3. Select the correct DNS provider
4. Follow the updated instructions

## Verify DNS Records Manually

You can verify DNS records are correctly configured using command-line tools:

### On Mac/Linux:

```bash
# Check CNAME record
dig s1._domainkey.fagor-automation.com CNAME +short

# Expected output: s1.domainkey.u123456.wl.sendgrid.net
```

### On Windows:

```cmd
# Check CNAME record
nslookup -type=CNAME s1._domainkey.fagor-automation.com

# Expected output: s1.domainkey.u123456.wl.sendgrid.net
```

### Online DNS Checker:

Use [DNS Checker](https://dnschecker.org/) to verify records globally:

1. Enter: `s1._domainkey.fagor-automation.com`
2. Select record type: **CNAME**
3. Click **Search**
4. Verify the value matches SendGrid's expected value

## Alternative: Use a Verified Sender Email

If you cannot verify the domain immediately, you can temporarily use a verified sender email:

### Option 1: Use Personal Email

Change the "from" email in `server/emailService.ts`:

```typescript
from: "jcrobledolopez@gmail.com", // Instead of noreply@fagor-automation.com
```

**Pros:**
- Works immediately without domain verification
- No DNS configuration required

**Cons:**
- Less professional appearance
- Replies will go to personal email

### Option 2: Verify Individual Email

1. Go to SendGrid dashboard
2. Navigate to **Settings** → **Sender Authentication**
3. Click **Verify a Single Sender**
4. Enter email address (e.g., `noreply@fagor-automation.com`)
5. SendGrid will send a verification email to that address
6. Click the verification link in the email

**Note:** This requires access to the email inbox for `noreply@fagor-automation.com`.

## Best Practices

### Email Deliverability

To ensure high deliverability rates:

1. **Use consistent "from" address:** Always send from the same domain
2. **Include unsubscribe link:** Required by law in many countries
3. **Monitor bounce rates:** High bounce rates hurt sender reputation
4. **Authenticate domain:** Complete SPF, DKIM, and DMARC setup
5. **Avoid spam content:** Use clear, professional language

### Security

Protect your SendGrid account:

1. **Enable two-factor authentication (2FA):** Add extra security layer
2. **Rotate API keys regularly:** Change keys every 3-6 months
3. **Use scoped API keys:** Grant minimum required permissions
4. **Monitor API usage:** Check for unusual activity
5. **Restrict IP access:** Whitelist only trusted IPs

### Monitoring

Track email performance:

1. **SendGrid dashboard:** View delivery rates, opens, clicks
2. **Set up alerts:** Get notified of delivery issues
3. **Check spam reports:** Monitor complaints
4. **Review bounce logs:** Identify invalid email addresses
5. **Track engagement:** Monitor open and click rates

## Next Steps

After completing domain verification:

1. ✅ Test email sending in production
2. ✅ Monitor SendGrid dashboard for delivery statistics
3. ✅ Set up email templates for consistent branding
4. ✅ Configure webhook for email events (optional)
5. ✅ Set up DMARC policy for additional security (optional)

## Support Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Domain Authentication Guide](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)
- [DNS Record Troubleshooting](https://docs.sendgrid.com/ui/account-and-settings/troubleshooting-sender-authentication)
- [SendGrid Support](https://support.sendgrid.com/)

---

**Last Updated:** January 1, 2026  
**Domain:** fagor-automation.com  
**SendGrid API Key:** Configured in Railway environment variables
