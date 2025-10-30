import { google } from 'googleapis';

/**
 * Shared Google API Authentication Module
 * Provides ultra-robust JSON parsing for service account credentials
 * with multiple fallback strategies
 */

interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Parse service account JSON with ultra-robust error handling
 * Handles multiple formats: single-line, multi-line, escaped, double-escaped
 */
function parseServiceAccountKey(rawKey: string): ServiceAccountCredentials {
  // Strategy 1: Direct JSON parse (already valid JSON)
  try {
    const parsed = JSON.parse(rawKey);
    if (parsed.private_key && parsed.client_email) {
      return parsed;
    }
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 2: Fix double-escaped newlines (\\n → \n)
  try {
    const fixedDoubleEscape = rawKey.replace(/\\\\n/g, '\\n');
    const parsed = JSON.parse(fixedDoubleEscape);
    if (parsed.private_key && parsed.client_email) {
      console.log('[GoogleAuth] Parsed with double-escape fix');
      return parsed;
    }
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 3: Fix literal \n strings to actual newlines
  try {
    const fixedLiteral = rawKey.replace(/\\n/g, '\n');
    const parsed = JSON.parse(fixedLiteral);
    if (parsed.private_key && parsed.client_email) {
      console.log('[GoogleAuth] Parsed with literal newline fix');
      return parsed;
    }
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 4: Parse as JSON, then fix private_key field specifically
  try {
    const parsed = JSON.parse(rawKey);
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    if (parsed.private_key && parsed.client_email) {
      console.log('[GoogleAuth] Parsed with private_key field fix');
      return parsed;
    }
  } catch (e) {
    // All strategies failed
  }

  throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY with all strategies. Please ensure it is valid JSON.');
}

/**
 * Get authenticated Google Sheets client
 * Uses shared service account credentials from environment
 */
export async function getGoogleSheetsClient() {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set');
  }

  try {
    const credentials = parseServiceAccountKey(serviceAccountKey);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    console.log('[GoogleAuth] Successfully authenticated with Google Sheets API');
    return sheets;
  } catch (error) {
    console.error('[GoogleAuth] Authentication error:', error);
    throw new Error(`Failed to authenticate with Google Sheets: ${error}`);
  }
}

/**
 * Get authenticated Gmail client
 * Uses shared service account credentials from environment
 */
export async function getGmailClient() {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set');
  }

  try {
    const credentials = parseServiceAccountKey(serviceAccountKey);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/gmail.send',
      ],
    });

    const authClient = await auth.getClient();
    const gmail = google.gmail({ version: 'v1', auth: authClient });

    console.log('[GoogleAuth] Successfully authenticated with Gmail API');
    return gmail;
  } catch (error) {
    console.error('[GoogleAuth] Gmail authentication error:', error);
    throw new Error(`Failed to authenticate with Gmail: ${error}`);
  }
}
