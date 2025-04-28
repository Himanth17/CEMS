/**
 * Direct Mailer
 * A simplified, direct email sending solution using nodemailer
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a more direct transporter with simplified settings
const createTransporter = () => {
  // Log the email configuration being used
  console.log('Creating email transporter with the following settings:');
  console.log('- Email Service:', process.env.EMAIL_SERVICE);
  console.log('- Email User:', process.env.EMAIL_USER);
  console.log('- From Address:', process.env.EMAIL_FROM);

  // Create a simplified transporter with minimal settings
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Disable connection pooling to ensure fresh connections
    pool: false,
    // Set reasonable timeouts
    connectionTimeout: 30000, // 30 seconds
    socketTimeout: 60000 // 60 seconds
  });
};

// Send a test email
const sendTestEmail = async (recipient) => {
  try {
    console.log(`Attempting to send test email to ${recipient}...`);
    
    // Create a fresh transporter for each email
    const transporter = createTransporter();
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipient,
      subject: 'Test Email from Disaster Management System',
      text: 'This is a test email from the Disaster Management System.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #3498db; color: white; padding: 15px; text-align: center;">
            <h1>Test Email</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
            <p>Hello,</p>
            <p>This is a test email from the Disaster Management System.</p>
            <p>If you're receiving this email, it means the email sending functionality is working correctly.</p>
            <p>Time sent: ${new Date().toLocaleString()}</p>
            <p>Regards,<br>Disaster Management System</p>
          </div>
        </div>
      `
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('Failed to send test email:', error);
    throw error;
  }
};

// Send an alert email
const sendAlertEmail = async (recipient, alert) => {
  try {
    console.log(`Attempting to send alert email to ${recipient.email}...`);
    
    // Create a fresh transporter for each email
    const transporter = createTransporter();
    
    // Create subject based on alert severity
    const subjectPrefix = alert.severity === 'critical' ? '🚨 URGENT: ' :
                         alert.severity === 'high' ? '⚠️ IMPORTANT: ' : '';
    const subject = `${subjectPrefix}${alert.disasterType} Alert for ${alert.regions || alert.location}`;
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipient.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${getSeverityColor(alert.severity)}; color: white; padding: 15px; text-align: center;">
            <h1>${alert.disasterType} Alert</h1>
            <p style="font-size: 18px;">Severity: ${alert.severity.toUpperCase()}</p>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
            <p>Dear ${recipient.fullname || recipient.name || 'User'},</p>
            <p>A ${alert.severity} ${alert.disasterType} alert has been issued for the following regions:</p>
            <p style="font-weight: bold;">${alert.regions || alert.location}</p>
            <p>${alert.message || alert.description}</p>
            <div style="margin: 25px 0; padding: 15px; background-color: #f0f0f0; border-left: 4px solid #999;">
              <p><strong>Alert Details:</strong></p>
              <ul>
                <li>Alert ID: ${alert.id}</li>
                <li>Date & Time: ${alert.datetime || new Date().toLocaleString()}</li>
                <li>Issued By: ${alert.issuedBy || 'Disaster Management System'}</li>
              </ul>
            </div>
            <div style="margin: 25px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #e74c3c;">
              <p><strong>Evacuation Orders:</strong></p>
              <p>${alert.evacuationOrders || 'No evacuation orders at this time'}</p>
            </div>
            <div style="margin: 25px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #3498db;">
              <p><strong>Emergency Contacts:</strong></p>
              <p>${alert.emergencyContacts || 'Emergency Services: 911'}</p>
            </div>
            <p>Please take necessary precautions and stay safe.</p>
            <p>Regards,<br>Disaster Management System</p>
          </div>
          <div style="padding: 10px; background-color: #f0f0f0; font-size: 12px; text-align: center;">
            <p>This is an automated alert from the Disaster Management System.</p>
            <p>To update your notification preferences, please log in to your account.</p>
          </div>
        </div>
      `
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Alert email sent successfully to ${recipient.email}!`);
    console.log('Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: recipient.email
    };
  } catch (error) {
    console.error(`Failed to send alert email to ${recipient.email}:`, error);
    throw error;
  }
};

// Helper function to get color based on alert severity
function getSeverityColor(severity) {
  switch ((severity || '').toLowerCase()) {
    case 'critical':
      return '#c0392b';
    case 'high':
      return '#e74c3c';
    case 'medium':
      return '#f39c12';
    case 'low':
      return '#27ae60';
    default:
      return '#3498db';
  }
}

module.exports = {
  sendTestEmail,
  sendAlertEmail
};
