import sgMail from '@sendgrid/mail';

// Initialize SendGrid - trim API key to remove any whitespace/newlines
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY?.trim();
if (SENDGRID_API_KEY) {
  // Validate API key format (should start with SG.)
  if (SENDGRID_API_KEY.startsWith('SG.')) {
    sgMail.setApiKey(SENDGRID_API_KEY);
    console.log('[Email] SendGrid initialized successfully');
  } else {
    console.error('[Email] Invalid SendGrid API key format - should start with SG.');
  }
} else {
  console.warn('[Email] SendGrid API key not configured');
}

// Fixed notification emails
const NOTIFICATION_EMAILS = (process.env.NOTIFICATION_EMAILS || 'jcrobledo@fagor-automation.com,service@fagor-automation.com,jcrobledolopez@gmail.com')
  .split(',')
  .map(email => email.trim())
  .filter(email => email.length > 0);

const EMAIL_FROM = (process.env.EMAIL_FROM || 'service@fagor-automation.com').trim();

interface QuotationEmailParams {
  referenceCode: string;
  selectedDates: string[];
  formData: any;
  quotationData: any;
}

export async function sendQuotationPdfEmail(params: QuotationEmailParams): Promise<void> {
  const { referenceCode, selectedDates, formData, quotationData } = params;
  
  if (!SENDGRID_API_KEY) {
    console.warn('[Email] SendGrid API key not configured, skipping email');
    return;
  }

  if (!SENDGRID_API_KEY.startsWith('SG.')) {
    console.error('[Email] Invalid SendGrid API key format, skipping email');
    return;
  }

  // Format selected dates
  const formattedDates = selectedDates.map((dateStr, index) => {
    const date = new Date(dateStr);
    return `Day ${index + 1}: ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  }).join('<br>');

  // Build recipient list (fixed emails + client email)
  const recipients = [...NOTIFICATION_EMAILS];
  const clientEmail = formData.email?.trim();
  if (clientEmail && !recipients.includes(clientEmail)) {
    recipients.push(clientEmail);
  }

  console.log(`[Email] Preparing to send quotation to ${recipients.length} recipients`);

  // Generate HTML email content with quotation details
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #DC241F; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
        .section-title { font-size: 16px; font-weight: bold; color: #DC241F; margin-bottom: 10px; }
        .info-row { margin: 5px 0; }
        .label { font-weight: bold; color: #666; }
        .total-box { background-color: #DC241F; color: white; padding: 15px; text-align: center; font-size: 24px; margin: 20px 0; }
        .dates-box { background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 5px; }
        .warning-box { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin-top: 15px; }
        .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FAGOR Automation Training Request</h1>
        <p>Reference Code: ${referenceCode}</p>
      </div>
      
      <div class="content">
        <div class="section">
          <div class="section-title">Company Information</div>
          <div class="info-row"><span class="label">Company:</span> ${formData.companyName || 'N/A'}</div>
          <div class="info-row"><span class="label">Contact Person:</span> ${formData.contactPerson || 'N/A'}</div>
          <div class="info-row"><span class="label">Email:</span> ${formData.email || 'N/A'}</div>
          <div class="info-row"><span class="label">Phone:</span> ${formData.phone || 'N/A'}</div>
          <div class="info-row"><span class="label">Address:</span> ${formData.address1 || ''} ${formData.address2 || ''}, ${formData.city || ''}, ${formData.state || ''} ${formData.zipCode || ''}</div>
        </div>

        <div class="section">
          <div class="section-title">Training Details</div>
          <div class="info-row"><span class="label">Machine Brand:</span> ${formData.machineBrand || 'N/A'}</div>
          <div class="info-row"><span class="label">Machine Model:</span> ${formData.machineModel || 'N/A'}</div>
          <div class="info-row"><span class="label">Controller Model:</span> ${formData.controllerModel || 'N/A'}</div>
          <div class="info-row"><span class="label">Machine Type:</span> ${formData.machineType || 'N/A'}</div>
          <div class="info-row"><span class="label">Programming Type:</span> ${formData.programmingType || 'N/A'}</div>
          <div class="info-row"><span class="label">Training Days:</span> ${formData.trainingDays || 'N/A'}</div>
          <div class="info-row"><span class="label">Number of Trainees:</span> ${formData.trainees || 'N/A'}</div>
          <div class="info-row"><span class="label">Knowledge Level:</span> ${formData.knowledgeLevel || 'N/A'}</div>
        </div>

        ${formData.oemName ? `
        <div class="section">
          <div class="section-title">OEM Information</div>
          <div class="info-row"><span class="label">OEM Name:</span> ${formData.oemName}</div>
          <div class="info-row"><span class="label">OEM Contact:</span> ${formData.oemContact || 'N/A'}</div>
          <div class="info-row"><span class="label">OEM Email:</span> ${formData.oemEmail || 'N/A'}</div>
          <div class="info-row"><span class="label">OEM Phone:</span> ${formData.oemPhone || 'N/A'}</div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Quotation Details</div>
          <table>
            <tr>
              <th>Item</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td>Training (${formData.trainingDays || 1} days × $${quotationData?.trainingPrice ? (quotationData.trainingPrice / (parseInt(formData.trainingDays) || 1)).toFixed(2) : '850.00'}/day)</td>
              <td>$${quotationData?.trainingPrice?.toFixed(2) || 'N/A'}</td>
            </tr>
            ${quotationData?.travelExpenses?.flightCost > 0 ? `
            <tr>
              <td>Round Trip Flight (${quotationData?.travelExpenses?.nearestAirport || 'N/A'})</td>
              <td>$${quotationData?.travelExpenses?.flightCost?.toFixed(2) || '0.00'}</td>
            </tr>
            ` : ''}
            ${quotationData?.travelExpenses?.carRentalCost > 0 ? `
            <tr>
              <td>Car Rental</td>
              <td>$${quotationData?.travelExpenses?.carRentalCost?.toFixed(2) || '0.00'}</td>
            </tr>
            ` : ''}
            ${quotationData?.travelExpenses?.hotelCost > 0 ? `
            <tr>
              <td>Hotel</td>
              <td>$${quotationData?.travelExpenses?.hotelCost?.toFixed(2) || '0.00'}</td>
            </tr>
            ` : ''}
            ${quotationData?.travelExpenses?.foodCost > 0 ? `
            <tr>
              <td>Meals & Incidentals</td>
              <td>$${quotationData?.travelExpenses?.foodCost?.toFixed(2) || '0.00'}</td>
            </tr>
            ` : ''}
            ${quotationData?.travelExpenses?.travelTimeCost > 0 ? `
            <tr>
              <td>Travel Time (${quotationData?.travelExpenses?.travelTimeHours?.toFixed(1) || '0'} hours)</td>
              <td>$${quotationData?.travelExpenses?.travelTimeCost?.toFixed(2) || '0.00'}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div class="total-box">
          GRAND TOTAL: $${quotationData?.totalPrice?.toFixed(2) || 'N/A'}
        </div>

        <div class="dates-box">
          <div class="section-title" style="color: #0369a1;">Selected Training Dates</div>
          ${formattedDates}
        </div>

        <div class="warning-box">
          <strong>⚠️ Important Notice</strong><br>
          The selected dates will be reviewed and confirmed by the SERVICE office of FAGOR Automation USA. 
          The client will receive a confirmation email with the final approved dates.
        </div>

        <div class="section" style="margin-top: 20px;">
          <div class="section-title">Terms and Conditions</div>
          <ul style="font-size: 12px; color: #666;">
            <li>Prices in USD without taxes</li>
            <li>This offer includes 6 hours of on-site training for a maximum of 4 participants per day</li>
            <li>The total hours and actual travel expenses will be adjusted at the end of the service</li>
            <li>The FAGOR application engineer will not carry out any mechanical and/or electrical assembly work</li>
            <li>The date available to be at facilities must be confirmed</li>
            <li>Payment must be received before the training date</li>
            <li>Any cancellation must be made at least 7 days before the scheduled training date</li>
          </ul>
        </div>
      </div>

      <div class="footer">
        <p><strong>FAGOR Automation Corp.</strong></p>
        <p>4020 Winnetta Ave, Rolling Meadows, IL 60008</p>
        <p>Tel: 847-981-1500 | Fax: 847-981-1311</p>
        <p>© ${new Date().getFullYear()} Fagor Automation Corp. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  // Send email to all recipients
  const msg = {
    to: recipients,
    from: EMAIL_FROM,
    subject: `Training Request Quotation - ${referenceCode} - ${formData.companyName || 'New Request'}`,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`[Email] Quotation sent successfully to: ${recipients.length} recipients`);
  } catch (error: any) {
    console.error('[Email] SendGrid error:', error?.response?.body || error?.message || error);
    throw error;
  }
}
