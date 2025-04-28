/**
 * Alert Mailer
 * A dedicated, simplified mailer for sending alert emails directly
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter with minimal settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Disable connection pooling to ensure fresh connections
  pool: false,
  // Set reasonable timeouts
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 20000 // 20 seconds
});

// Verify the transporter
transporter.verify(function(error, success) {
  if (error) {
    console.error('⚠️ ALERT MAILER ERROR ⚠️');
    console.error('Email configuration error:', error);
    console.log('\nPossible solutions:');
    console.log('1. Check if your email and password are correct');
    console.log('2. For Gmail, you MUST use an App Password, not your regular password');
    console.log('   - Go to https://myaccount.google.com/apppasswords to generate one');
    console.log('3. Make sure 2-Step Verification is enabled for your Google account');
  } else {
    console.log('✅ Alert Mailer is ready to send messages');
    console.log('📧 Using email account:', process.env.EMAIL_USER);
  }
});

/**
 * Send an alert email
 * @param {Object} options - Email options
 * @returns {Promise} - Promise that resolves with the email info
 */
async function sendAlertEmail(options) {
  try {
    console.log('ALERT MAILER: Sending alert email to', options.to);

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Disaster Management System" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject || 'Emergency Alert from Disaster Management System',
      html: options.html || createDefaultAlertEmail(options.alert)
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('ALERT MAILER: Email sent successfully!');
    console.log('- Message ID:', info.messageId);
    console.log('- Response:', info.response);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('ALERT MAILER: Failed to send email:', error);
    throw error;
  }
}

/**
 * Create default alert email HTML
 * @param {Object} alert - Alert data
 * @returns {string} - HTML content
 */
function createDefaultAlertEmail(alert) {
  // Get severity color
  const severityColor = getSeverityColor(alert.severity);

  // Format current date and time
  const now = new Date();
  const formattedDateTime = now.toISOString().replace('T', '-').substring(0, 19).replace(':', '.').replace(':', '.');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
      <div style="background-color: ${severityColor}; color: white; padding: 15px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">${alert.disasterType}</h1>
        <p style="margin: 10px 0 0 0;">Severity: ${alert.severity.toUpperCase()}</p>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <p style="color: #800080; margin-top: 0;">Dear ${alert.recipientName || 'Test Recipient'},</p>

        <p>A ${alert.severity} ${alert.disasterType} alert has been issued for the following regions:</p>

        <p style="color: #800080; font-weight: bold;">${alert.regions || alert.location}</p>

        <p>${alert.message || alert.description}</p>

        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #999;">
          <p style="font-weight: bold; margin-top: 0;">Alert Details:</p>
          <ul style="margin-bottom: 0; padding-left: 20px;">
            <li>Alert ID: ${alert.id}</li>
            <li>Date & Time: ${formattedDateTime}</li>
            <li>Issued By: ${alert.issuedBy || 'Email Test Panel'}</li>
          </ul>
        </div>

        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #e74c3c;">
          <p style="font-weight: bold; color: #800080; margin-top: 0;">Evacuation Orders:</p>
          <p style="margin-bottom: 0;">${alert.evacuationOrders || 'No evacuation orders at this time'}</p>
        </div>

        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #3498db;">
          <p style="font-weight: bold; color: #800080; margin-top: 0;">Emergency Contacts:</p>
          <p style="margin-bottom: 0;">${alert.emergencyContacts || 'Emergency Services: 911'}</p>
        </div>

        <p>Please take necessary precautions and stay safe.</p>

        <p style="margin-bottom: 0;">Regards,<br>Disaster Management System</p>

        <p style="color: #999; margin-top: 20px;">***</p>
      </div>
    </div>
  `;
}

/**
 * Get color based on alert severity
 * @param {string} severity - Alert severity
 * @returns {string} - Color code
 */
function getSeverityColor(severity) {
  switch ((severity || '').toLowerCase()) {
    case 'critical':
      return '#c0392b';
    case 'high':
      return '#e74c3c';
    case 'medium':
      return '#f39c12';
    case 'low':
      return '#2ecc71'; // Bright green color matching the example
    default:
      return '#3498db';
  }
}

module.exports = {
  sendAlertEmail
};
