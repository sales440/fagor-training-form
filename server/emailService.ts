import { Resend } from 'resend';
import { getActiveNotificationEmails } from "./db";

// Initialize Resend with API key
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

if (!resend) {
  console.warn("[Email] RESEND_API_KEY not configured");
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
 * Uses Resend API for email delivery
 */
export async function sendTrainingRequestEmail(data: TrainingRequestEmailData): Promise<boolean> {
  try {
    if (!resend) {
      console.error("[Email] Resend not initialized - RESEND_API_KEY missing");
      return false;
    }

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

    // Send email using Resend API
    const { data: emailData, error } = await resend.emails.send({
      from: 'Fagor Training <onboarding@resend.dev>',
      to: allRecipients,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('[Email] Error sending email via Resend:', error);
      return false;
    }

    console.log('[Email] Email sent successfully via Resend:', emailData?.id);
    return true;
  } catch (error: any) {
    console.error('[Email] Error sending email via Resend:', error.message || error);
    return false;
  }
}


// Calendar/Kanban email functions
export async function sendStatusUpdateEmail(request: any) {
  try {
    if (!resend) {
      console.error("[Email] Resend not initialized");
      return;
    }

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

    await resend.emails.send({
      from: 'Fagor Training <onboarding@resend.dev>',
      to: [request.email, ...internalRecipients],
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
    });
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
}

export async function sendClientConfirmationEmail(request: any) {
  try {
    if (!resend) {
      console.error("[Email] Resend not initialized");
      return;
    }

    const confirmUrl = `${process.env.APP_URL || 'http://localhost:5173'}/confirm-dates?token=${request.clientConfirmationToken}`;

    await resend.emails.send({
      from: 'Fagor Training <onboarding@resend.dev>',
      to: request.email,
      subject: '📅 Confirm Your Training Dates - Fagor Automation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Training Date Confirmation Required</h2>
          <p>Dear ${request.contactPerson},</p>
          <p>Please confirm your preferred training dates by clicking the link below:</p>
          <p><a href="${confirmUrl}" style="background-color: #DC241F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Confirm Training Dates</a></p>
          <p>If you have any questions, please contact us at service@fagor-automation.com</p>
          <p>Best regards,<br/>Fagor Automation Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending client confirmation email:', error);
  }
}

export async function sendTechnicianAssignmentEmail(request: any) {
  try {
    if (!resend) {
      console.error("[Email] Resend not initialized");
      return;
    }

    const notificationEmails = await getActiveNotificationEmails();
    const internalRecipients = notificationEmails.map((e) => e.email);

    await resend.emails.send({
      from: 'Fagor Training <onboarding@resend.dev>',
      to: internalRecipients,
      subject: `🔧 New Training Assignment: ${request.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Training Assignment</h2>
          <p>A new training request has been assigned:</p>
          <ul>
            <li><strong>Company:</strong> ${request.companyName}</li>
            <li><strong>Contact:</strong> ${request.contactPerson}</li>
            <li><strong>Location:</strong> ${request.address}</li>
            <li><strong>Assigned Technician:</strong> ${request.assignedTechnician || 'TBD'}</li>
            <li><strong>Training Days:</strong> ${request.trainingDays || 'N/A'}</li>
          </ul>
          <p>Please review and confirm the assignment.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending technician assignment email:', error);
  }
}

export async function sendReminderEmail(request: any, daysUntilTraining: number) {
  try {
    if (!resend) {
      console.warn("[Email] Resend not initialized - skipping reminder email");
      return;
    }

    const notificationEmails = await getActiveNotificationEmails();
    const internalRecipients = notificationEmails.map((e) => e.email);

    // Send to client
    await resend.emails.send({
      from: 'Fagor Training <onboarding@resend.dev>',
      to: request.email,
      subject: `⏰ Training Reminder: ${daysUntilTraining} days until your training`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Training Reminder</h2>
          <p>Dear ${request.contactPerson},</p>
          <p>This is a reminder that your training session is scheduled in <strong>${daysUntilTraining} days</strong>.</p>
          <h3>Training Details:</h3>
          <ul>
            <li><strong>Company:</strong> ${request.companyName}</li>
            <li><strong>Training Days:</strong> ${request.trainingDays || 'N/A'}</li>
            <li><strong>Technician:</strong> ${request.assignedTechnician || 'TBD'}</li>
          </ul>
          <p>If you have any questions, please contact us at service@fagor-automation.com</p>
          <p>Best regards,<br/>Fagor Automation Team</p>
        </div>
      `,
    });

    // Send to internal team
    await resend.emails.send({
      from: 'Fagor Training <onboarding@resend.dev>',
      to: internalRecipients,
      subject: `⏰ Training Reminder: ${request.companyName} in ${daysUntilTraining} days`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Upcoming Training Reminder</h2>
          <p>Training session for <strong>${request.companyName}</strong> is scheduled in <strong>${daysUntilTraining} days</strong>.</p>
          <h3>Details:</h3>
          <ul>
            <li><strong>Contact:</strong> ${request.contactPerson}</li>
            <li><strong>Location:</strong> ${request.address}</li>
            <li><strong>Technician:</strong> ${request.assignedTechnician || 'TBD'}</li>
          </ul>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
}


export async function sendDateApprovalEmail(data: {
  clientEmail: string;
  contactPerson: string;
  companyName: string;
  approvedDates: string[];
  technician?: string;
  referenceCode?: string;
}) {
  try {
    if (!resend) {
      console.error("[Email] Resend not initialized");
      return;
    }

    const notificationEmails = await getActiveNotificationEmails();
    const internalRecipients = notificationEmails.map((e) => e.email);

    await resend.emails.send({
      from: 'Fagor Training <onboarding@resend.dev>',
      to: [data.clientEmail, ...internalRecipients],
      subject: `✅ Training Dates Approved - ${data.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Training Dates Approved!</h2>
          <p>Dear ${data.contactPerson},</p>
          <p>Your training dates have been approved.</p>
          ${data.referenceCode ? `<p><strong>Reference Code:</strong> ${data.referenceCode}</p>` : ''}
          <h3>Confirmed Dates:</h3>
          <ul>
            ${data.approvedDates.map(date => `<li>${date}</li>`).join('')}
          </ul>
          ${data.technician ? `<p><strong>Assigned Technician:</strong> ${data.technician}</p>` : ''}
          <p>If you have any questions, please contact us at service@fagor-automation.com</p>
          <p>Best regards,<br/>Fagor Automation Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending date approval email:', error);
  }
}

export async function sendDateRejectionEmail(data: {
  clientEmail: string;
  contactPerson: string;
  companyName: string;
  rejectionReason?: string;
  referenceCode?: string;
}) {
  try {
    if (!resend) {
      console.error("[Email] Resend not initialized");
      return;
    }

    const notificationEmails = await getActiveNotificationEmails();
    const internalRecipients = notificationEmails.map((e) => e.email);

    await resend.emails.send({
      from: 'Fagor Training <onboarding@resend.dev>',
      to: [data.clientEmail, ...internalRecipients],
      subject: `❌ Training Dates Need Revision - ${data.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Training Dates Need Revision</h2>
          <p>Dear ${data.contactPerson},</p>
          ${data.referenceCode ? `<p><strong>Reference Code:</strong> ${data.referenceCode}</p>` : ''}
          <p>Unfortunately, the selected training dates are not available.</p>
          ${data.rejectionReason ? `<p><strong>Reason:</strong> ${data.rejectionReason}</p>` : ''}
          <p>Please select alternative dates or contact us to discuss options.</p>
          <p>Contact: service@fagor-automation.com</p>
          <p>Best regards,<br/>Fagor Automation Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending date rejection email:', error);
  }
}

export async function sendTrainingReminderEmail(data: {
  email: string;
  contactPerson: string;
  companyName: string;
  trainingDays: number;
  assignedTechnician?: string;
  daysUntilTraining?: number;
  referenceCode?: string;
  trainingDates?: string[];
  address?: string;
  machineType?: string;
  controllerModel?: string;
}): Promise<boolean> {
  try {
    if (!resend) {
      console.warn("[Email] Resend not initialized - skipping reminder email");
      return false;
    }

    const notificationEmails = await getActiveNotificationEmails();
    const internalRecipients = notificationEmails.map((e) => e.email);

    // Send to client
    await resend.emails.send({
      from: 'Fagor Training <onboarding@resend.dev>',
      to: data.email,
      subject: `⏰ Training Reminder: ${data.daysUntilTraining || ''} days until your training`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Training Reminder</h2>
          <p>Dear ${data.contactPerson},</p>
          <p>This is a reminder that your training session is coming up soon.</p>
          ${data.referenceCode ? `<p><strong>Reference Code:</strong> ${data.referenceCode}</p>` : ''}
          <h3>Training Details:</h3>
          <ul>
            <li><strong>Company:</strong> ${data.companyName}</li>
            <li><strong>Training Days:</strong> ${data.trainingDays || 'N/A'}</li>
            <li><strong>Technician:</strong> ${data.assignedTechnician || 'TBD'}</li>
            ${data.address ? `<li><strong>Location:</strong> ${data.address}</li>` : ''}
            ${data.machineType ? `<li><strong>Machine Type:</strong> ${data.machineType}</li>` : ''}
            ${data.controllerModel ? `<li><strong>CNC Model:</strong> ${data.controllerModel}</li>` : ''}
            ${data.trainingDates && data.trainingDates.length > 0 ? `<li><strong>Dates:</strong> ${data.trainingDates.join(', ')}</li>` : ''}
          </ul>
          <p>If you have any questions, please contact us at service@fagor-automation.com</p>
          <p>Best regards,<br/>Fagor Automation Team</p>
        </div>
      `,
    });

    // Send to internal team
    await resend.emails.send({
      from: 'Fagor Training <onboarding@resend.dev>',
      to: internalRecipients,
      subject: `⏰ Training Reminder: ${data.companyName} - Upcoming Training`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Upcoming Training Reminder</h2>
          <p>Training session for <strong>${data.companyName}</strong> is scheduled in <strong>${data.daysUntilTraining} days</strong>.</p>
          <h3>Details:</h3>
          <ul>
            <li><strong>Contact:</strong> ${data.contactPerson}</li>
            <li><strong>Technician:</strong> ${data.assignedTechnician || 'TBD'}</li>
          </ul>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending training reminder email:', error);
    return false;
  }
}
