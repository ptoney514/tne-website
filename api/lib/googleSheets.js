/**
 * Google Sheets API helper for registration submissions
 *
 * Uses Google Sheets API v4 with service account authentication.
 * Env vars required:
 * - GOOGLE_SERVICE_ACCOUNT_KEY: JSON string with service account credentials
 * - REGISTRATION_SHEET_ID: Google Sheets spreadsheet ID
 */

// JWT authentication for Google APIs
async function getAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour

  // Create JWT header and payload
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: expiry,
  };

  // Encode header and payload
  const encodeBase64Url = (obj) => {
    const json = JSON.stringify(obj);
    const base64 = Buffer.from(json).toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const headerEncoded = encodeBase64Url(header);
  const payloadEncoded = encodeBase64Url(payload);
  const unsignedToken = `${headerEncoded}.${payloadEncoded}`;

  // Sign the token using the private key
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  const signature = sign.sign(credentials.private_key, 'base64');
  const signatureEncoded = signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const jwt = `${unsignedToken}.${signatureEncoded}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

/**
 * Append a registration row to Google Sheets
 *
 * @param {Object} registration - Registration data object
 * @returns {Object} - { success: boolean, rowNumber?: number, error?: string }
 */
export async function appendRegistration(registration) {
  try {
    // Check for required environment variables
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set');
    }
    if (!process.env.REGISTRATION_SHEET_ID) {
      throw new Error('REGISTRATION_SHEET_ID environment variable not set');
    }

    // Parse service account credentials
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const spreadsheetId = process.env.REGISTRATION_SHEET_ID;

    // Get access token
    const accessToken = await getAccessToken(credentials);

    // Generate unique registration ID
    const registrationId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Build address string
    const addressParts = [
      registration.parent_address_street,
      registration.parent_address_city,
      registration.parent_address_state,
      registration.parent_address_zip,
    ].filter(Boolean);
    const addressFull = addressParts.join(', ');

    // Build parent name
    const parentName = `${registration.parent_first_name || ''} ${registration.parent_last_name || ''}`.trim();

    // Prepare row data in the specified column order
    const rowData = [
      new Date().toISOString(),                    // submitted_at_iso
      registrationId,                               // registration_id
      registration.season_id || '',                 // season_id
      registration.team_id || '',                   // team_id
      registration.player_first_name || '',         // player_first_name
      registration.player_last_name || '',          // player_last_name
      registration.player_date_of_birth || '',      // player_dob
      registration.player_current_grade || '',      // player_grade
      registration.player_gender || '',             // player_gender
      registration.jersey_size || '',               // jersey_size
      registration.position || '',                  // position
      parentName,                                   // parent_name
      registration.parent_email || '',              // parent_email
      registration.parent_phone || '',              // parent_phone
      registration.parent_relationship || '',       // parent_relationship
      addressFull,                                  // address_full
      registration.emergency_contact_name || '',    // emergency_contact_name
      registration.emergency_contact_phone || '',   // emergency_contact_phone
      registration.payment_plan_type || '',         // payment_plan_type
      registration.payment_plan_option || '',       // payment_plan_option
      registration.initial_amount_due || 0,         // initial_amount_due
      registration.remaining_balance || 0,          // remaining_balance
      registration.payment_reference_id || '',      // payment_reference_id
      registration.payment_status || 'pending',     // payment_status
      registration.waiver_liability ? 'Yes' : 'No', // waiver_liability
      registration.waiver_medical ? 'Yes' : 'No',   // waiver_medical
      registration.waiver_media ? 'Yes' : 'No',     // waiver_media
      registration.special_request_reason || '',    // special_request_reason
      registration.special_request_notes || '',     // special_request_notes
      registration.source || 'direct',              // registration_source
      registration.desired_jersey_number || '',      // desired_jersey_number
      registration.last_team_played_for || '',       // last_team_played_for
      registration.parent_home_phone || '',          // parent_home_phone
      registration.parent2_name || '',               // parent2_name
      registration.parent2_phone || '',              // parent2_phone
      registration.parent2_email || '',              // parent2_email
    ];

    // Append to Google Sheets
    const range = 'Registrations!A:AJ'; // Columns A through AJ (36 columns)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Sheets API error: ${errorText}`);
    }

    const result = await response.json();

    // Extract row number from the updated range
    const updatedRange = result.updates?.updatedRange || '';
    const rowMatch = updatedRange.match(/!A(\d+):/);
    const rowNumber = rowMatch ? parseInt(rowMatch[1], 10) : null;

    return {
      success: true,
      registrationId,
      rowNumber,
    };
  } catch (error) {
    console.error('[Google Sheets] Error appending registration:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if Google Sheets is configured
 * @returns {boolean}
 */
export function isConfigured() {
  return !!(process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.REGISTRATION_SHEET_ID);
}
