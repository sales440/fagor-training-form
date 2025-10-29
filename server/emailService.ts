import { getActiveNotificationEmails } from "./db";

// Technician email addresses by region
const TECHNICIAN_EMAILS: Record<string, string[]> = {
  // East Coast and Central
  'WAIKY LAU - Rolling Meadows IL Office': ['lauwaik@fagor-automation.com'],
  'KHATEREH MOHAMMADI - Rolling Meadows IL Office': ['kmohammadi@fagor-automation.com'],
  'YAREK GUGULSKI - Rolling Meadows IL Office': ['yarek@fagor-automation.com'],
  // West Coast
  'JOSEPH HAINLEY - ANAHEIM CA Office': ['jhainley@fagor-automation.com'],
};

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
  assignedTechnician?: string;
  referenceCode?: string;
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

    let emailAddresses = recipients.map(r => r.email);
    
    // Add assigned technician's email if available
    if (data.assignedTechnician) {
      const technicianEmails = TECHNICIAN_EMAILS[data.assignedTechnician] || [];
      emailAddresses = [...emailAddresses, ...technicianEmails];
      console.log(`[Email] Adding technician emails for ${data.assignedTechnician}:`, technicianEmails);
    }
    
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
        ${data.referenceCode ? `<div class="field"><span class="label">Reference Code:</span> <span class="value"><strong>${data.referenceCode}</strong></span></div>` : ''}
        ${data.assignedTechnician ? `<div class="field"><span class="label">Assigned Technician:</span> <span class="value"><strong>${data.assignedTechnician}</strong></span></div>` : ''}
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
${data.referenceCode ? `- Reference Code: ${data.referenceCode}` : ''}
${data.assignedTechnician ? `- Assigned Technician: ${data.assignedTechnician}` : ''}
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




/**
 * Send email notification when training dates are changed
 */
export async function sendDateChangeNotification(data: {
  companyName: string;
  contactPerson: string;
  email: string;
  referenceCode: string;
  oldStartDate: Date;
  oldEndDate: Date;
  newStartDate: Date;
  newEndDate: Date;
  assignedTechnician: string;
  briefingUrl: string;
}): Promise<boolean> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error("[Email] RESEND_API_KEY not configured");
      return false;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .date-comparison { display: flex; justify-content: space-between; margin: 20px 0; }
    .date-box { flex: 1; padding: 15px; margin: 0 10px; border-radius: 8px; }
    .old-date { background-color: #fee2e2; border: 2px solid #ef4444; }
    .new-date { background-color: #d1fae5; border: 2px solid: #10b981; }
    .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Training Dates Updated</h1>
    </div>
    <div class="content">
      <div class="alert">
        <strong>⚠️ Important Update</strong><br>
        The training dates for your course have been modified. Please review the new dates below.
      </div>
      
      <p><strong>Reference Code:</strong> ${data.referenceCode}</p>
      <p><strong>Company:</strong> ${data.companyName}</p>
      <p><strong>Contact:</strong> ${data.contactPerson}</p>
      <p><strong>Assigned Technician:</strong> ${data.assignedTechnician}</p>
      
      <h3>Date Changes:</h3>
      <div class="date-comparison">
        <div class="date-box old-date">
          <h4 style="margin-top: 0; color: #dc2626;">Previous Dates</h4>
          <p><strong>Start:</strong> ${data.oldStartDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>End:</strong> ${data.oldEndDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div class="date-box new-date">
          <h4 style="margin-top: 0; color: #059669;">New Dates</h4>
          <p><strong>Start:</strong> ${data.newStartDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>End:</strong> ${data.newEndDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      
      <p style="margin-top: 30px;">Please click the button below to review the updated training details and confirm your acceptance of the new dates:</p>
      
      <div style="text-align: center;">
        <a href="${data.briefingUrl}" class="button">Review & Accept New Dates</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        If you have any questions or concerns about these changes, please contact us immediately at service@fagor-automation.com or call 847-981-1500.
      </p>
    </div>
    <div class="footer">
      <p>FAGOR AUTOMATION Corp.<br>
      4020 Winnetta Ave, Rolling Meadows, IL 60008<br>
      Tel: 847-981-1500 | Fax: 847-981-1311<br>
      service@fagor-automation.com</p>
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
TRAINING DATES UPDATED

Reference Code: ${data.referenceCode}
Company: ${data.companyName}
Contact: ${data.contactPerson}
Assigned Technician: ${data.assignedTechnician}

PREVIOUS DATES:
Start: ${data.oldStartDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
End: ${data.oldEndDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

NEW DATES:
Start: ${data.newStartDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
End: ${data.newEndDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Please review the updated training details and confirm your acceptance of the new dates:
${data.briefingUrl}

If you have any questions or concerns, please contact us at service@fagor-automation.com or call 847-981-1500.

---
FAGOR AUTOMATION Corp.
4020 Winnetta Ave, Rolling Meadows, IL 60008
Tel: 847-981-1500 | Fax: 847-981-1311
service@fagor-automation.com
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FAGOR Training <training@fagor-automation.com>",
        to: [data.email],
        subject: `Training Dates Updated - ${data.referenceCode}`,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Email] Failed to send date change notification:", errorText);
      return false;
    }

    console.log("[Email] Date change notification sent successfully to:", data.email);
    return true;
  } catch (error) {
    console.error("[Email] Error sending date change notification:", error);
    return false;
  }
}



/**
 * Send date confirmation email to client
 * Sent automatically when calendar event changes from YELLOW to GREEN
 */
interface DateConfirmationEmailData {
  to: string;
  companyName: string;
  contactPerson: string;
  referenceCode: string;
  startDate: string;
  endDate: string;
  trainingDays: number;
  assignedTechnician: string;
  controllerModel: string;
}

export async function sendDateConfirmationEmail(data: DateConfirmationEmailData): Promise<boolean> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error("[Email] RESEND_API_KEY not configured");
      return false;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Training Dates Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #dc2626; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Training Dates Confirmed!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
                Dear ${data.contactPerson},
              </p>
              
              <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0;">
                Great news! Your training dates have been confirmed by FAGOR Automation.
              </p>
              
              <!-- Confirmation Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #10b981; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: #ffffff; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
                      ✓ CONFIRMED
                    </p>
                    <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">
                      ${data.startDate} to ${data.endDate}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Training Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb;">
                <tr>
                  <td style="padding: 15px 0;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="font-weight: bold; color: #666666; width: 40%;">Reference Code:</td>
                        <td style="color: #333333;">${data.referenceCode}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #666666;">Company:</td>
                        <td style="color: #333333;">${data.companyName}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #666666;">Training Duration:</td>
                        <td style="color: #333333;">${data.trainingDays} day${data.trainingDays > 1 ? 's' : ''}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #666666;">CNC Controller:</td>
                        <td style="color: #333333;">${data.controllerModel}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: bold; color: #666666;">Assigned Technician:</td>
                        <td style="color: #333333;">${data.assignedTechnician}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="font-weight: bold; color: #92400e; margin: 0 0 10px 0;">Next Steps:</p>
                <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                  <li style="margin-bottom: 8px;">Ensure all necessary equipment is ready for training</li>
                  <li style="margin-bottom: 8px;">Prepare a list of specific questions or topics to cover</li>
                  <li style="margin-bottom: 8px;">Your technician will contact you 24-48 hours before the training</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; color: #333333; margin: 20px 0 0 0;">
                If you have any questions or need to make changes, please contact us immediately at 
                <a href="mailto:service@fagor-automation.com" style="color: #dc2626; text-decoration: none;">service@fagor-automation.com</a> 
                or call <strong>847-981-1500</strong>.
              </p>
              
              <p style="font-size: 16px; color: #333333; margin: 20px 0 0 0;">
                We look forward to providing you with excellent training!
              </p>
              
              <p style="font-size: 16px; color: #333333; margin: 20px 0 0 0;">
                Best regards,<br>
                <strong>FAGOR Automation Corp.</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="font-size: 14px; color: #666666; margin: 0 0 10px 0;">
                <strong>FAGOR AUTOMATION Corp.</strong><br>
                4020 Winnetta Ave, Rolling Meadows, IL 60008<br>
                Tel: 847-981-1500 | Fax: 847-981-1311<br>
                <a href="mailto:service@fagor-automation.com" style="color: #dc2626; text-decoration: none;">service@fagor-automation.com</a>
              </p>
              <p style="font-size: 12px; color: #999999; margin: 0;">
                © ${new Date().getFullYear()} Fagor Automation Corp. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const textContent = `
Training Dates Confirmed!

Dear ${data.contactPerson},

Great news! Your training dates have been confirmed by FAGOR Automation.

CONFIRMED: ${data.startDate} to ${data.endDate}

Training Details:
- Reference Code: ${data.referenceCode}
- Company: ${data.companyName}
- Training Duration: ${data.trainingDays} day${data.trainingDays > 1 ? 's' : ''}
- CNC Controller: ${data.controllerModel}
- Assigned Technician: ${data.assignedTechnician}

Next Steps:
- Ensure all necessary equipment is ready for training
- Prepare a list of specific questions or topics to cover
- Your technician will contact you 24-48 hours before the training

If you have any questions or need to make changes, please contact us immediately at service@fagor-automation.com or call 847-981-1500.

We look forward to providing you with excellent training!

Best regards,
FAGOR Automation Corp.

---
FAGOR AUTOMATION Corp.
4020 Winnetta Ave, Rolling Meadows, IL 60008
Tel: 847-981-1500 | Fax: 847-981-1311
service@fagor-automation.com
    `.trim();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "FAGOR Training <training@fagor-automation.com>",
        to: [data.to],
        subject: `Training Dates Confirmed - ${data.referenceCode}`,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[Email] Resend API error:", errorData);
      return false;
    }

    const result = await response.json();
    console.log("[Email] Date confirmation email sent successfully:", result);
    return true;
  } catch (error) {
    console.error("[Email] Error sending date confirmation email:", error);
    return false;
  }
}
