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
        from: 'Fagor Training Forms <notifications@fagor-automation.com>',
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

