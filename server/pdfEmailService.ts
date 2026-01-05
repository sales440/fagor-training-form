import sgMail from '@sendgrid/mail';

// Initialize SendGrid - trim API key to remove any whitespace/newlines
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY?.trim();

// Log initialization status
console.log('[Email] Initializing SendGrid...');
console.log('[Email] API Key present:', !!SENDGRID_API_KEY);
console.log('[Email] API Key starts with SG.:', SENDGRID_API_KEY?.startsWith('SG.'));

if (SENDGRID_API_KEY) {
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

// Email from address - MUST be verified in SendGrid
const EMAIL_FROM = (process.env.EMAIL_FROM || 'noreply@fagor-automation.com').trim();

console.log('[Email] From address:', EMAIL_FROM);
console.log('[Email] Notification emails:', NOTIFICATION_EMAILS);

interface QuotationEmailParams {
  referenceCode: string;
  selectedDates: string[];
  formData: any;
  quotationData: any;
}

// Helper function to generate training cost breakdown
function generateTrainingCostBreakdown(trainingDays: number): { breakdown: string; total: number } {
  const firstDayPrice = 1400;
  const additionalDayPrice = 1000;
  
  let breakdown = '';
  let total = 0;
  
  for (let day = 1; day <= trainingDays; day++) {
    const price = day === 1 ? firstDayPrice : additionalDayPrice;
    total += price;
    breakdown += `
      <tr>
        <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5;">Training Day ${day}</td>
        <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5; text-align: right;">$${price.toFixed(2)}</td>
      </tr>`;
  }
  
  return { breakdown, total };
}

export async function sendQuotationPdfEmail(params: QuotationEmailParams): Promise<void> {
  const { referenceCode, selectedDates, formData, quotationData } = params;
  
  console.log('[Email] sendQuotationPdfEmail called with:', {
    referenceCode,
    selectedDates,
    hasFormData: !!formData,
    hasQuotationData: !!quotationData
  });

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
    return `<tr><td style="padding: 8px 0;">Day ${index + 1}:</td><td style="padding: 8px 0; font-weight: 500;">${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>`;
  }).join('');

  // Build recipient list
  const recipients = [...NOTIFICATION_EMAILS];
  const clientEmail = formData?.email?.trim();
  if (clientEmail && !recipients.includes(clientEmail)) {
    recipients.push(clientEmail);
  }

  console.log(`[Email] Preparing to send quotation to ${recipients.length} recipients:`, recipients);

  // Generate training cost breakdown
  const trainingDays = parseInt(formData?.trainingDays) || 1;
  const { breakdown: trainingBreakdown, total: trainingTotal } = generateTrainingCostBreakdown(trainingDays);

  // Calculate travel expenses
  const travelExpenses = quotationData?.travelExpenses || {};
  const flightCost = travelExpenses.flightCost || 0;
  const carRentalCost = travelExpenses.carRentalCost || 0;
  const hotelCost = travelExpenses.hotelCost || 0;
  const foodCost = travelExpenses.foodCost || 0;
  const travelTimeCost = travelExpenses.travelTimeCost || 0;
  const travelSubtotal = flightCost + carRentalCost + hotelCost + foodCost + travelTimeCost;
  const grandTotal = trainingTotal + travelSubtotal;

  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Professional executive HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="700" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e0e0e0;">
              
              <!-- HEADER WITH FAGOR LETTERHEAD -->
              <tr>
                <td style="padding: 0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background-color: #DC241F; height: 8px;"></td>
                    </tr>
                    <tr>
                      <td style="padding: 25px 40px; border-bottom: 2px solid #DC241F;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="200" valign="middle">
                              <img src="https://manus-pub.s3.us-east-1.amazonaws.com/mACKzn5zlhSW.png" alt="FAGOR Automation" style="width: 150px; height: auto; display: block;">
                            </td>
                            <td align="right" valign="middle" style="font-size: 11px; color: #333; line-height: 1.6;">
                              <strong style="color: #DC241F; font-size: 12px;">FAGOR AUTOMATION CORP.</strong><br>
                              4020 Winnetta Ave, Rolling Meadows, IL 60008<br>
                              Tel: 847-981-1500 | Fax: 847-981-1311<br>
                              service@fagor-automation.com
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- QUOTATION TITLE -->
              <tr>
                <td style="padding: 30px 40px 20px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <h1 style="margin: 0; font-size: 28px; color: #DC241F; font-weight: 600; letter-spacing: -0.5px;">TRAINING QUOTATION</h1>
                      </td>
                      <td align="right" style="font-size: 13px; color: #666;">
                        <strong>Reference:</strong> ${referenceCode}<br>
                        <strong>Date:</strong> ${currentDate}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CLIENT INFORMATION -->
              <tr>
                <td style="padding: 0 40px 25px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 4px;">
                    <tr>
                      <td style="padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #DC241F; text-transform: uppercase; letter-spacing: 0.5px;">Client Information</h3>
                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #333;">
                          <tr>
                            <td width="50%" style="padding: 5px 0;"><strong>Company:</strong> ${formData?.companyName || 'N/A'}</td>
                            <td width="50%" style="padding: 5px 0;"><strong>Contact:</strong> ${formData?.contactPerson || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style="padding: 5px 0;"><strong>Email:</strong> ${formData?.email || 'N/A'}</td>
                            <td style="padding: 5px 0;"><strong>Phone:</strong> ${formData?.phone || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding: 5px 0;"><strong>Address:</strong> ${formData?.address1 || ''} ${formData?.address2 || ''}, ${formData?.city || ''}, ${formData?.state || ''} ${formData?.zipCode || ''}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- TRAINING DETAILS -->
              <tr>
                <td style="padding: 0 40px 25px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 4px;">
                    <tr>
                      <td style="padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #DC241F; text-transform: uppercase; letter-spacing: 0.5px;">Training Details</h3>
                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #333;">
                          <tr>
                            <td width="50%" style="padding: 5px 0;"><strong>CNC Model:</strong> ${formData?.controllerModel || 'N/A'}</td>
                            <td width="50%" style="padding: 5px 0;"><strong>Machine Type:</strong> ${formData?.machineType || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style="padding: 5px 0;"><strong>Machine Brand:</strong> ${formData?.machineBrand || 'N/A'}</td>
                            <td style="padding: 5px 0;"><strong>Machine Model:</strong> ${formData?.machineModel || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style="padding: 5px 0;"><strong>Programming:</strong> ${formData?.programmingType || 'N/A'}</td>
                            <td style="padding: 5px 0;"><strong>Knowledge Level:</strong> ${formData?.knowledgeLevel || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style="padding: 5px 0;"><strong>Training Days:</strong> ${trainingDays}</td>
                            <td style="padding: 5px 0;"><strong>Trainees:</strong> ${formData?.trainees || 'N/A'}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${formData?.oemName ? `
              <!-- OEM INFORMATION -->
              <tr>
                <td style="padding: 0 40px 25px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f7ff; border: 1px solid #c5ddf5; border-radius: 4px;">
                    <tr>
                      <td style="padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #DC241F; text-transform: uppercase; letter-spacing: 0.5px;">OEM Information</h3>
                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #333;">
                          <tr>
                            <td width="50%" style="padding: 5px 0;"><strong>OEM Name:</strong> ${formData.oemName}</td>
                            <td width="50%" style="padding: 5px 0;"><strong>Contact:</strong> ${formData.oemContact || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style="padding: 5px 0;"><strong>Email:</strong> ${formData.oemEmail || 'N/A'}</td>
                            <td style="padding: 5px 0;"><strong>Phone:</strong> ${formData.oemPhone || 'N/A'}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ` : ''}

              <!-- QUOTATION BREAKDOWN -->
              <tr>
                <td style="padding: 0 40px 25px 40px;">
                  <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #DC241F; text-transform: uppercase; letter-spacing: 0.5px;">Quotation Breakdown</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 4px; font-size: 13px;">
                    <tr style="background-color: #f5f5f5;">
                      <th style="padding: 12px 15px; text-align: left; font-weight: 600; color: #333; border-bottom: 2px solid #DC241F;">Description</th>
                      <th style="padding: 12px 15px; text-align: right; font-weight: 600; color: #333; border-bottom: 2px solid #DC241F; width: 120px;">Amount</th>
                    </tr>
                    
                    <!-- Training Costs -->
                    <tr>
                      <td colspan="2" style="padding: 10px 15px; background-color: #fef9f9; font-weight: 600; color: #DC241F; border-bottom: 1px solid #e5e5e5;">Training Services</td>
                    </tr>
                    ${trainingBreakdown}
                    <tr style="background-color: #fafafa;">
                      <td style="padding: 10px 15px; font-weight: 600; border-bottom: 2px solid #e5e5e5;">Training Subtotal</td>
                      <td style="padding: 10px 15px; text-align: right; font-weight: 600; border-bottom: 2px solid #e5e5e5;">$${trainingTotal.toFixed(2)}</td>
                    </tr>

                    ${travelSubtotal > 0 ? `
                    <!-- Travel Expenses -->
                    <tr>
                      <td colspan="2" style="padding: 10px 15px; background-color: #fef9f9; font-weight: 600; color: #DC241F; border-bottom: 1px solid #e5e5e5;">Travel Expenses (Estimated)</td>
                    </tr>
                    ${flightCost > 0 ? `
                    <tr>
                      <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5;">Round Trip Flight (${travelExpenses.nearestAirport || 'N/A'})</td>
                      <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5; text-align: right;">$${flightCost.toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    ${carRentalCost > 0 ? `
                    <tr>
                      <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5;">Car Rental</td>
                      <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5; text-align: right;">$${carRentalCost.toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    ${hotelCost > 0 ? `
                    <tr>
                      <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5;">Hotel Accommodation</td>
                      <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5; text-align: right;">$${hotelCost.toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    ${foodCost > 0 ? `
                    <tr>
                      <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5;">Meals & Incidentals</td>
                      <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5; text-align: right;">$${foodCost.toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    ${travelTimeCost > 0 ? `
                    <tr>
                      <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5;">Travel Time (${travelExpenses.travelTimeHours?.toFixed(1) || '0'} hours @ $110/hr)</td>
                      <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5; text-align: right;">$${travelTimeCost.toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    <tr style="background-color: #fafafa;">
                      <td style="padding: 10px 15px; font-weight: 600; border-bottom: 2px solid #e5e5e5;">Travel Subtotal</td>
                      <td style="padding: 10px 15px; text-align: right; font-weight: 600; border-bottom: 2px solid #e5e5e5;">$${travelSubtotal.toFixed(2)}</td>
                    </tr>
                    ` : ''}
                  </table>
                </td>
              </tr>

              <!-- GRAND TOTAL -->
              <tr>
                <td style="padding: 0 40px 25px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #DC241F; border-radius: 4px;">
                    <tr>
                      <td style="padding: 20px 25px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color: #ffffff; font-size: 18px; font-weight: 600;">GRAND TOTAL</td>
                            <td align="right" style="color: #ffffff; font-size: 28px; font-weight: 700;">$${grandTotal.toFixed(2)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- SELECTED DATES -->
              <tr>
                <td style="padding: 0 40px 25px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 4px;">
                    <tr>
                      <td style="padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px;">Selected Training Dates</h3>
                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #333;">
                          ${formattedDates}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- IMPORTANT NOTICE -->
              <tr>
                <td style="padding: 0 40px 25px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="margin: 0; font-size: 13px; color: #92400e;">
                          <strong>⚠️ Important Notice:</strong> The selected dates will be reviewed and confirmed by the SERVICE office of FAGOR Automation USA. You will receive a confirmation email with the final approved dates.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- TERMS AND CONDITIONS -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #DC241F; text-transform: uppercase; letter-spacing: 0.5px;">Terms and Conditions</h3>
                  <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #666; line-height: 1.8;">
                    <li>Prices in USD without taxes</li>
                    <li>Training Day 1: $1,400.00 USD | Additional Days: $1,000.00 USD each</li>
                    <li>This offer includes 6 hours of on-site training for a maximum of 4 participants per day</li>
                    <li>Travel expenses are estimated and subject to change based on actual costs incurred</li>
                    <li>The FAGOR application engineer will not carry out any mechanical and/or electrical assembly work</li>
                    <li>Payment must be received before the training date unless NET30 terms are agreed</li>
                    <li>Any cancellation must be made at least 7 days before the scheduled training date</li>
                  </ul>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background-color: #333; padding: 25px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color: #ffffff; font-size: 12px; line-height: 1.6;">
                        <strong style="color: #DC241F;">FAGOR AUTOMATION CORP.</strong><br>
                        4020 Winnetta Ave, Rolling Meadows, IL 60008<br>
                        Tel: 847-981-1500 | Fax: 847-981-1311
                      </td>
                      <td align="right" style="color: #999; font-size: 11px;">
                        © ${new Date().getFullYear()} Fagor Automation Corp.<br>
                        All rights reserved.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Send email to all recipients
  const msg = {
    to: recipients,
    from: {
      email: EMAIL_FROM,
      name: 'FAGOR Automation Training'
    },
    subject: `Training Quotation - ${referenceCode} - ${formData?.companyName || 'New Request'}`,
    html: htmlContent,
  };

  console.log('[Email] Sending email with config:', {
    to: recipients,
    from: EMAIL_FROM,
    subject: msg.subject
  });

  try {
    const response = await sgMail.send(msg);
    console.log(`[Email] Quotation sent successfully to: ${recipients.length} recipients`);
    console.log('[Email] SendGrid response:', response[0]?.statusCode);
  } catch (error: any) {
    console.error('[Email] SendGrid error details:');
    console.error('[Email] Error message:', error?.message);
    console.error('[Email] Error code:', error?.code);
    if (error?.response) {
      console.error('[Email] Response status:', error.response.statusCode);
      console.error('[Email] Response body:', JSON.stringify(error.response.body, null, 2));
    }
    throw error;
  }
}
