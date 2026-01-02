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

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Fagor Training Forms <onboarding@resend.dev>',
        to: allRecipients,
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

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    });
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
}

export async function sendClientConfirmationEmail(request: any) {
  try {
    const confirmUrl = `${process.env.APP_URL || 'http://localhost:5173'}/confirm-dates?token=${request.clientConfirmationToken}`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Fagor Training <onboarding@resend.dev>',
        to: request.email,
        subject: '📅 Training Dates Proposed - Confirmation Required',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Training Dates Proposed</h2>
            <p>Dear ${request.contactPerson},</p>
            <p>We have reviewed your training request and proposed the following dates:</p>
            <ul>
              ${request.approvedDates ? JSON.parse(request.approvedDates).map((d: string) => `<li>${new Date(d).toLocaleDateString()}</li>`).join('') : '<li>Dates to be confirmed</li>'}
            </ul>
            <p>Please click the button below to confirm or reject these dates:</p>
            <a href="${confirmUrl}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Confirm Dates
            </a>
            <p><small>This link will expire in 7 days.</small></p>
            <p>Best regards,<br/>Fagor Automation Team</p>
          </div>
        `,
      }),
    });
  } catch (error) {
    console.error('Error sending client confirmation email:', error);
  }
}

export async function sendDateApprovalEmail(data: {
  clientEmail: string;
  companyName: string;
  contactPerson: string;
  approvedDates: string[];
  technician: string;
  referenceCode: string;
}): Promise<boolean> {
  try {
    const html = `
      <h2>Fechas de Capacitación Aprobadas - Fagor Automation</h2>
      <p>Estimado/a ${data.contactPerson},</p>
      <p>Nos complace informarle que sus fechas de capacitación han sido <strong>APROBADAS</strong>.</p>
      <h3>Detalles:</h3>
      <ul>
        <li><strong>Empresa:</strong> ${data.companyName}</li>
        <li><strong>Código de Referencia:</strong> ${data.referenceCode}</li>
        <li><strong>Técnico Asignado:</strong> ${data.technician}</li>
        <li><strong>Fechas Confirmadas:</strong></li>
        <ul>${data.approvedDates.map(d => `<li>${new Date(d).toLocaleDateString()}</li>`).join('')}</ul>
      </ul>
      <p>Nuestro técnico se pondrá en contacto con usted próximamente para coordinar los detalles finales.</p>
      <p>Saludos cordiales,<br>Fagor Automation USA</p>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'service@fagor-automation.com',
        to: [data.clientEmail],
        subject: `Fechas Aprobadas - ${data.referenceCode}`,
        html,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Email] Failed to send approval email:', error);
    return false;
  }
}

export async function sendDateRejectionEmail(data: {
  clientEmail: string;
  companyName: string;
  contactPerson: string;
  rejectionReason: string;
  referenceCode: string;
}): Promise<boolean> {
  try {
    const html = `
      <h2>Actualización de Fechas - Fagor Automation</h2>
      <p>Estimado/a ${data.contactPerson},</p>
      <p>Lamentamos informarle que las fechas propuestas no están disponibles.</p>
      <h3>Detalles:</h3>
      <ul>
        <li><strong>Empresa:</strong> ${data.companyName}</li>
        <li><strong>Código de Referencia:</strong> ${data.referenceCode}</li>
        <li><strong>Motivo:</strong> ${data.rejectionReason}</li>
      </ul>
      <p>Por favor, proponga nuevas fechas alternativas respondiendo a este correo o contactándonos directamente.</p>
      <p>Saludos cordiales,<br>Fagor Automation USA</p>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'service@fagor-automation.com',
        to: [data.clientEmail],
        subject: `Actualización de Fechas - ${data.referenceCode}`,
        html,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Email] Failed to send rejection email:', error);
    return false;
  }
}
