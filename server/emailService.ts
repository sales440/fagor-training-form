import { getActiveNotificationEmails } from "./db";

interface TrainingRequestEmailData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  machineBrand?: string;
  machineModel?: string;
  controllerModel?: string;
  machineType?: string;
  programmingType?: string;
  trainingDays?: number;
  knowledgeLevel?: string;
  totalPrice?: number;
  oemName?: string;
  oemContact?: string;
  oemEmail?: string;
}

/**
 * Send email notification about new training request
 * Uses Resend API for email delivery
 */
export async function sendTrainingRequestEmail(data: TrainingRequestEmailData): Promise<boolean> {
  try {
    // Get all active notification emails from database
    const recipients = await getActiveNotificationEmails();
    
    if (recipients.length === 0) {
      console.warn("[Email] No active notification emails configured");
      return false;
    }

    const emailAddresses = recipients.map(r => r.email);
    
    // Create email content
    const subject = `New Training Request from ${data.companyName}`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #DC241F; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; color: #DC241F; font-size: 16px; margin-bottom: 10px; border-bottom: 2px solid #DC241F; padding-bottom: 5px; }
    .field { margin: 8px 0; }
    .label { font-weight: bold; display: inline-block; width: 180px; }
    .value { display: inline-block; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FAGOR AUTOMATION</h1>
      <h2>New Training Request</h2>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Company Information</div>
        <div class="field"><span class="label">Company Name:</span> <span class="value">${data.companyName}</span></div>
        <div class="field"><span class="label">Contact Person:</span> <span class="value">${data.contactPerson}</span></div>
        <div class="field"><span class="label">Email:</span> <span class="value">${data.email}</span></div>
        <div class="field"><span class="label">Phone:</span> <span class="value">${data.phone}</span></div>
        <div class="field"><span class="label">Address:</span> <span class="value">${data.address}</span></div>
        ${data.machineBrand ? `<div class="field"><span class="label">Machine Brand:</span> <span class="value">${data.machineBrand}</span></div>` : ''}
        ${data.machineModel ? `<div class="field"><span class="label">Machine Model:</span> <span class="value">${data.machineModel}</span></div>` : ''}
      </div>

      ${data.oemName ? `
      <div class="section">
        <div class="section-title">OEM Information</div>
        <div class="field"><span class="label">OEM Name:</span> <span class="value">${data.oemName}</span></div>
        ${data.oemContact ? `<div class="field"><span class="label">OEM Contact:</span> <span class="value">${data.oemContact}</span></div>` : ''}
        ${data.oemEmail ? `<div class="field"><span class="label">OEM Email:</span> <span class="value">${data.oemEmail}</span></div>` : ''}
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Training Details</div>
        ${data.controllerModel ? `<div class="field"><span class="label">CNC Model:</span> <span class="value">${data.controllerModel}</span></div>` : ''}
        ${data.machineType ? `<div class="field"><span class="label">Machine Type:</span> <span class="value">${data.machineType}</span></div>` : ''}
        ${data.programmingType ? `<div class="field"><span class="label">Programming Type:</span> <span class="value">${data.programmingType}</span></div>` : ''}
        ${data.trainingDays ? `<div class="field"><span class="label">Training Days:</span> <span class="value">${data.trainingDays}</span></div>` : ''}
        ${data.knowledgeLevel ? `<div class="field"><span class="label">Knowledge Level:</span> <span class="value">${data.knowledgeLevel}</span></div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">Quotation</div>
        <div class="field"><span class="label">Total Price:</span> <span class="value"><strong>$${data.totalPrice?.toLocaleString() || 0}</strong></span></div>
      </div>

      <div class="section" style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #DC241F;">
        <strong>Action Required:</strong> Please contact the client to confirm training dates and finalize arrangements.
      </div>
    </div>
    
    <div class="footer">
      <p>FAGOR AUTOMATION Corp.<br>
      4020 Winnetka Ave, Rolling Meadows, IL 60008<br>
      Tel: 847-981-1500 | Fax: 847-981-1311<br>
      service@fagor-automation.com</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const textContent = `
NEW TRAINING REQUEST

Company Information:
- Company Name: ${data.companyName}
- Contact Person: ${data.contactPerson}
- Email: ${data.email}
- Phone: ${data.phone}
- Address: ${data.address}
${data.machineBrand ? `- Machine Brand: ${data.machineBrand}` : ''}
${data.machineModel ? `- Machine Model: ${data.machineModel}` : ''}

${data.oemName ? `
OEM Information:
- OEM Name: ${data.oemName}
${data.oemContact ? `- OEM Contact: ${data.oemContact}` : ''}
${data.oemEmail ? `- OEM Email: ${data.oemEmail}` : ''}
` : ''}

Training Details:
${data.controllerModel ? `- CNC Model: ${data.controllerModel}` : ''}
${data.machineType ? `- Machine Type: ${data.machineType}` : ''}
${data.programmingType ? `- Programming Type: ${data.programmingType}` : ''}
${data.trainingDays ? `- Training Days: ${data.trainingDays}` : ''}
${data.knowledgeLevel ? `- Knowledge Level: ${data.knowledgeLevel}` : ''}

Quotation:
- Total Price: $${data.totalPrice?.toLocaleString() || 0}

ACTION REQUIRED: Please contact the client to confirm training dates and finalize arrangements.

---
FAGOR AUTOMATION Corp.
4020 Winnetka Ave, Rolling Meadows, IL 60008
Tel: 847-981-1500 | Fax: 847-981-1311
service@fagor-automation.com
    `.trim();

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Fagor Training Forms <onboarding@resend.dev>',
        to: emailAddresses,
        subject: subject,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Email] Failed to send email:', response.status, errorData);
      return false;
    }

    const result = await response.json();
    console.log('[Email] Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
}



// ============================================================================
// CONFIRMATION EMAIL SYSTEM
// ============================================================================

interface QuotationData {
  companyName: string;
  contactPerson: string;
  email: string;
  referenceCode: string;
  trainingDays: number;
  trainingPrice: number;
  flightCost: number;
  hotelCost: number;
  mealsCost: number;
  carRentalCost: number;
  travelTimeCost: number;
  totalCost: number;
  selectedAirport: string;
  flightTimeOneWay: number;
  drivingTimeOneWay: number;
  travelTimeHours: number;
  assignedTechnician: string;
  confirmedStartDate: string;
  confirmedEndDate: string;
}

/**
 * Generate HTML email for client confirmation (with prices)
 */
function generateClientConfirmationEmail(data: QuotationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #DC241F; color: white; padding: 20px; text-align: center; }
    .dates-box { background-color: #FFF9C4; border: 3px solid #F57C00; padding: 30px; margin: 30px 0; text-align: center; }
    .dates-box h2 { color: #DC241F; font-size: 28px; margin: 0 0 20px 0; }
    .dates-box .date { font-size: 36px; font-weight: bold; color: #DC241F; margin: 10px 0; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
    .info-label { font-weight: bold; }
    .total-row { background-color: #DC241F; color: white; padding: 15px; margin-top: 20px; font-size: 18px; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Training Dates Confirmed!</h1>
      <p>FAGOR AUTOMATION Corp.</p>
    </div>
    
    <div class="dates-box">
      <h2>✓ CONFIRMED TRAINING DATES</h2>
      <div class="date">${data.confirmedStartDate}</div>
      <div style="font-size: 24px; margin: 10px 0;">to</div>
      <div class="date">${data.confirmedEndDate}</div>
      <p style="margin-top: 20px; font-size: 18px;">${data.trainingDays} Day${data.trainingDays > 1 ? 's' : ''} of Training</p>
    </div>
    
    <div class="content">
      <h3>Training Details</h3>
      <div class="info-row">
        <span class="info-label">Company:</span>
        <span>${data.companyName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Contact Person:</span>
        <span>${data.contactPerson}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Reference Code:</span>
        <span>${data.referenceCode}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Assigned Technician:</span>
        <span>${data.assignedTechnician}</span>
      </div>
      
      <h3 style="margin-top: 30px;">Cost Breakdown</h3>
      <div class="info-row">
        <span class="info-label">Training (${data.trainingDays} days):</span>
        <span>$${data.trainingPrice.toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Travel Time (${data.travelTimeHours.toFixed(2)} hrs):</span>
        <span>$${data.travelTimeCost.toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Flight (${data.selectedAirport}):</span>
        <span>$${data.flightCost.toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Hotel:</span>
        <span>$${data.hotelCost.toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Car Rental:</span>
        <span>$${data.carRentalCost.toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Meals:</span>
        <span>$${data.mealsCost.toLocaleString()}</span>
      </div>
      
      <div class="total-row">
        <div style="display: flex; justify-content: space-between;">
          <span>TOTAL COST:</span>
          <span>$${data.totalCost.toLocaleString()}</span>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background-color: #e8f5e9; border-left: 4px solid #4caf50;">
        <strong>Next Steps:</strong>
        <ul style="margin: 10px 0;">
          <li>Your training dates are now confirmed</li>
          <li>Our technician will contact you 1-2 days before the training</li>
          <li>Please prepare your CNC equipment and workspace</li>
          <li>Have any specific questions ready for the training session</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>FAGOR AUTOMATION Corp.</strong><br>
      4020 Winnetka Ave, Rolling Meadows, IL 60008<br>
      Tel: 847-981-1500 | Fax: 847-981-1311<br>
      service@fagor-automation.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML email for technician notification (without prices)
 */
function generateTechnicianNotificationEmail(data: QuotationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #DC241F; color: white; padding: 20px; text-align: center; }
    .dates-box { background-color: #FFF9C4; border: 3px solid #F57C00; padding: 30px; margin: 30px 0; text-align: center; }
    .dates-box h2 { color: #DC241F; font-size: 28px; margin: 0 0 20px 0; }
    .dates-box .date { font-size: 36px; font-weight: bold; color: #DC241F; margin: 10px 0; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
    .info-label { font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Training Assignment</h1>
      <p>FAGOR AUTOMATION Corp.</p>
    </div>
    
    <div class="dates-box">
      <h2>TRAINING DATES</h2>
      <div class="date">${data.confirmedStartDate}</div>
      <div style="font-size: 24px; margin: 10px 0;">to</div>
      <div class="date">${data.confirmedEndDate}</div>
      <p style="margin-top: 20px; font-size: 18px;">${data.trainingDays} Day${data.trainingDays > 1 ? 's' : ''} of Training</p>
    </div>
    
    <div class="content">
      <h3>Customer Information</h3>
      <div class="info-row">
        <span class="info-label">Company:</span>
        <span>${data.companyName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Contact Person:</span>
        <span>${data.contactPerson}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span>${data.email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Reference Code:</span>
        <span>${data.referenceCode}</span>
      </div>
      
      <h3 style="margin-top: 30px;">Travel Information</h3>
      <div class="info-row">
        <span class="info-label">Nearest Airport:</span>
        <span>${data.selectedAirport}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Flight Time (one way):</span>
        <span>${data.flightTimeOneWay.toFixed(2)} hours</span>
      </div>
      <div class="info-row">
        <span class="info-label">Driving Time (one way):</span>
        <span>${data.drivingTimeOneWay.toFixed(2)} hours</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Travel Time:</span>
        <span>${data.travelTimeHours.toFixed(2)} hours (round trip)</span>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-left: 4px solid #DC241F;">
        <strong>Action Required:</strong>
        <ul style="margin: 10px 0;">
          <li>Review customer information and training dates</li>
          <li>Book your flight to ${data.selectedAirport}</li>
          <li>Reserve car rental and hotel</li>
          <li>Contact customer 1-2 days before training</li>
          <li>Prepare training materials and equipment</li>
        </ul>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>FAGOR AUTOMATION Corp.</strong><br>
      4020 Winnetka Ave, Rolling Meadows, IL 60008<br>
      Tel: 847-981-1500 | Fax: 847-981-1311<br>
      service@fagor-automation.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send confirmation email to client (WITH PRICES)
 */
export async function sendClientConfirmation(data: QuotationData): Promise<void> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FAGOR Training <onboarding@resend.dev>',
        to: data.email,
        cc: ['jcrobledolopez@gmail.com'],
        subject: `Training Confirmed: ${data.confirmedStartDate} - ${data.confirmedEndDate} | Ref: ${data.referenceCode}`,
        html: generateClientConfirmationEmail(data),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to send client confirmation: ${response.status} ${errorData}`);
    }

    console.log(`[Email] Confirmation sent to client: ${data.email} (CC: jcrobledolopez@gmail.com)`);
  } catch (error) {
    console.error('[Email] Error sending client confirmation:', error);
    throw error;
  }
}

/**
 * Send notification email to technician (WITHOUT PRICES)
 */
export async function sendTechnicianNotification(data: QuotationData, technicianEmail: string): Promise<void> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FAGOR Training <onboarding@resend.dev>',
        to: technicianEmail,
        cc: ['jcrobledolopez@gmail.com'],
        subject: `New Training Assignment: ${data.companyName} | ${data.confirmedStartDate} - ${data.confirmedEndDate}`,
        html: generateTechnicianNotificationEmail(data),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to send technician notification: ${response.status} ${errorData}`);
    }

    console.log(`[Email] Notification sent to technician: ${technicianEmail} (CC: jcrobledolopez@gmail.com)`);
  } catch (error) {
    console.error('[Email] Error sending technician notification:', error);
    throw error;
  }
}
