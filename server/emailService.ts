import sgMail from '@sendgrid/mail';
import { getActiveNotificationEmails } from "./db";

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("[Email] SENDGRID_API_KEY not configured");
}

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
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Send email notification about new training request
 * Sends to client email + all active notification emails from database
 * Uses SendGrid API for email delivery
 */
export async function sendTrainingRequestEmail(data: TrainingRequestEmailData): Promise<boolean> {
  try {
    // Get all active notification emails from database (fixed recipients)
    const fixedRecipients = await getActiveNotificationEmails();
    
    if (fixedRecipients.length === 0) {
      console.warn("[Email] No active notification emails configured");
      return false;
    }

    // Validate client email
    if (!data.email || !isValidEmail(data.email)) {
      console.error("[Email] Invalid client email address:", data.email);
      return false;
    }

    // Combine client email + fixed recipients
    const fixedEmailAddresses = fixedRecipients.map(r => r.email);
    const allRecipients = [data.email, ...fixedEmailAddresses];
    
    console.log(`[Email] Sending to ${allRecipients.length} recipients: client (${data.email}) + ${fixedEmailAddresses.length} fixed`);
    
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

      <div class="section" style="background-color: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; font-size: 13px; font-style: italic;">
        <strong>Note:</strong> Travel expenses are estimated and subject to change. Final costs will be reviewed and adjusted based on actual expenses incurred.<br><br>
        <strong>Nota:</strong> Los gastos de viaje son estimados y sujetos a cambios. Los costos finales serán revisados y ajustados según los gastos reales incurridos.
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

    // Send email using SendGrid API
    const msg = {
      to: allRecipients,
      from: 'noreply@fagor-automation.com', // Must be verified sender in SendGrid
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log('[Email] Email sent successfully via SendGrid');
    return true;
  } catch (error: any) {
    console.error('[Email] Error sending email via SendGrid:', error.response?.body || error.message || error);
    return false;
  }
}


// Calendar/Kanban email functions
export async function sendStatusUpdateEmail(request: any) {
  try {
    const notificationEmails = await getActiveNotificationEmails();
    const internalRecipients = notificationEmails.map((e) => e.email);

    const statusMessages: Record<string, { subject: string; message: string }> = {
      pending: {
        subject: '⏳ Training Request Under Review',
        message: 'Your training request is currently under review by our technical team.',
      },
      approved: {
        subject: '✅ Training Request Approved',
        message: 'Great news! Your training request has been approved and scheduled.',
      },
      rejected: {
        subject: '❌ Training Request Update',
        message: `We regret to inform you that your training request cannot be accommodated. ${request.rejectionReason ? `Reason: ${request.rejectionReason}` : ''}`,
      },
    };

    const config = statusMessages[request.status] || statusMessages.pending;

    const msg = {
      to: [request.email, ...internalRecipients],
      from: 'noreply@fagor-automation.com',
      subject: config.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${config.subject}</h2>
          <p>Dear ${request.contactPerson},</p>
          <p>${config.message}</p>
          <hr />
          <h3>Request Details:</h3>
          <ul>
            <li><strong>Company:</strong> ${request.companyName}</li>
            <li><strong>Training Type:</strong> ${request.trainingType || 'N/A'}</li>
            ${request.technicianNotes ? `<li><strong>Notes:</strong> ${request.technicianNotes}</li>` : ''}
          </ul>
          <p>Best regards,<br/>Fagor Automation Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
}

export async function sendClientConfirmationEmail(request: any) {
  try {
    const confirmUrl = `${process.env.APP_URL || 'http://localhost:5173'}/confirm-dates?token=${request.clientConfirmationToken}`;

    const msg = {
      to: request.email,
      from: 'noreply@fagor-automation.com',
      subject: '📅 Confirm Your Training Dates',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Confirm Your Training Dates</h2>
          <p>Dear ${request.contactPerson},</p>
          <p>We have proposed the following training dates for your request:</p>
          <ul>
            ${request.proposedDates?.map((date: string) => `<li>${new Date(date).toLocaleDateString()}</li>`).join('') || '<li>Dates pending</li>'}
          </ul>
          <p>Please click the link below to confirm or request changes:</p>
          <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background-color: #DC241F; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Confirm Dates</a>
          <p>Best regards,<br/>Fagor Automation Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending client confirmation email:', error);
  }
}


export async function sendDateApprovalEmail(data: { clientEmail: string; companyName: string; contactPerson?: string; technician?: string; referenceCode?: string; approvedDates: string[] }) {
  try {
    const msg = {
      to: data.clientEmail,
      from: 'noreply@fagor-automation.com',
      subject: '✅ Training Dates Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Training Dates Approved</h2>
          <p>Dear ${data.companyName},</p>
          <p>Your training dates have been approved:</p>
          <ul>
            ${data.approvedDates.map((date: string) => `<li>${new Date(date).toLocaleDateString()}</li>`).join('')}
          </ul>
          <p>We look forward to working with you!</p>
          <p>Best regards,<br/>Fagor Automation Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending date approval email:', error);
  }
}

export async function sendDateRejectionEmail(data: { clientEmail: string; companyName: string; contactPerson?: string; referenceCode?: string; rejectionReason: string }) {
  try {
    const msg = {
      to: data.clientEmail,
      from: 'noreply@fagor-automation.com',
      subject: '❌ Training Dates Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Training Dates Update</h2>
          <p>Dear ${data.companyName},</p>
          <p>We regret to inform you that the requested training dates are not available.</p>
          <p><strong>Reason:</strong> ${data.rejectionReason}</p>
          <p>Please contact us to discuss alternative dates.</p>
          <p>Best regards,<br/>Fagor Automation Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending date rejection email:', error);
  }
}


/**
 * Send reminder email 7 days before training
 * Sends to client email + all active notification emails
 */
export async function sendTrainingReminderEmail(data: {
  email: string;
  companyName: string;
  contactPerson: string;
  referenceCode: string;
  trainingDates: string[];
  assignedTechnician?: string;
  address: string;
  trainingDays: number;
  machineType?: string;
  controllerModel?: string;
}): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("[Email] SENDGRID_API_KEY not configured - skipping reminder email");
      return false;
    }

    // Get fixed recipients from database
    const fixedRecipients = await getActiveNotificationEmails();
    
    // Validate client email
    if (!isValidEmail(data.email)) {
      console.error(`[Email] Invalid client email: ${data.email}`);
      return false;
    }

    // Combine client email + fixed recipients
    const allRecipients = [data.email, ...fixedRecipients.map(r => r.email.trim())];
    const validRecipients = allRecipients.filter(email => isValidEmail(email));

    if (validRecipients.length === 0) {
      console.error("[Email] No valid recipients for reminder email");
      return false;
    }

    const firstDate = new Date(data.trainingDates[0]).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #DC241F; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .info-box { background-color: white; border-left: 4px solid #DC241F; padding: 15px; margin: 20px 0; }
          .checklist { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; }
          .checklist ul { margin: 10px 0; padding-left: 20px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          h2 { color: #DC241F; margin-top: 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #DC241F; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Training Reminder - 7 Days Notice</h1>
          </div>
          
          <div class="content">
            <p>Dear ${data.contactPerson},</p>
            
            <p>This is a friendly reminder that your FAGOR training is scheduled to begin in <strong>7 days</strong>.</p>
            
            <div class="info-box">
              <h2>Training Details</h2>
              <p><strong>Reference Code:</strong> ${data.referenceCode}</p>
              <p><strong>Company:</strong> ${data.companyName}</p>
              <p><strong>Start Date:</strong> ${firstDate}</p>
              <p><strong>Duration:</strong> ${data.trainingDays} day${data.trainingDays > 1 ? 's' : ''}</p>
              ${data.assignedTechnician ? `<p><strong>Assigned Technician:</strong> ${data.assignedTechnician}</p>` : ''}
              <p><strong>Location:</strong> ${data.address}</p>
              ${data.machineType ? `<p><strong>Machine Type:</strong> ${data.machineType}</p>` : ''}
              ${data.controllerModel ? `<p><strong>CNC Model:</strong> ${data.controllerModel}</p>` : ''}
            </div>

            <div class="info-box">
              <h2>📅 Training Schedule</h2>
              <ul>
                ${data.trainingDates.map((date, index) => 
                  `<li><strong>Day ${index + 1}:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</li>`
                ).join('')}
              </ul>
            </div>

            <div class="checklist">
              <h3>✅ Preparation Checklist</h3>
              <p>Please ensure the following before the training session:</p>
              <ul>
                <li>Machine is operational and accessible</li>
                <li>Training area is prepared and ready</li>
                <li>All trainees are confirmed and available</li>
                <li>Safety equipment is available</li>
                <li>Network/internet connection is working (if needed)</li>
                <li>Any specific software or documentation is ready</li>
              </ul>
            </div>

            <p><strong>Need to make changes?</strong> Please contact our SERVICE office as soon as possible:</p>
            <ul>
              <li>📧 Email: service@fagor-automation.com</li>
              <li>📞 Phone: [SERVICE PHONE NUMBER]</li>
            </ul>

            <p>We look forward to providing you with excellent training!</p>
            
            <p>Best regards,<br/>
            <strong>FAGOR Automation SERVICE Team</strong></p>
          </div>
          
          <div class="footer">
            <p>FAGOR Automation | Professional CNC Training Services</p>
            <p>This is an automated reminder. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const msg = {
      to: validRecipients,
      from: process.env.SENDGRID_FROM_EMAIL?.trim() || 'noreply@fagor-automation.com',
      subject: `🔔 Training Reminder: ${data.companyName} - ${firstDate}`,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`[Email] Training reminder sent successfully to ${validRecipients.length} recipients`);
    return true;
  } catch (error: any) {
    console.error('[Email] Error sending training reminder:', error?.response?.body || error);
    return false;
  }
}
