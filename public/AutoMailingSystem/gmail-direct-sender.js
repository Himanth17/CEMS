/**
 * Gmail Direct Sender
 * A simplified Gmail sender using OAuth2
 */

// Load environment variables
require('dotenv').config();

// Import required packages
const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3005;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Print environment variables for debugging (without showing full password)
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

// Create a transporter with explicit settings for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify the transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ EMAIL CONFIGURATION ERROR:', error);
    console.log('\nPossible solutions:');
    console.log('1. Check if your email and password are correct');
    console.log('2. For Gmail, you MUST use an App Password, not your regular password');
    console.log('   - Go to https://myaccount.google.com/apppasswords to generate one');
    console.log('3. Make sure 2-Step Verification is enabled for your Google account');
    console.log('4. Check if your Gmail account has any security restrictions');
    console.log('5. Make sure "Less secure app access" is turned ON in your Google account');
  } else {
    console.log('✅ Gmail Direct Sender is ready to send messages');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Send test email endpoint
app.get('/send-test', async (req, res) => {
  try {
    const recipient = req.query.email || process.env.TEST_EMAIL || process.env.EMAIL_USER;
    
    console.log(`Sending test email to ${recipient}...`);
    
    // Create email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Disaster Management System" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: 'Test Email from Disaster Management System',
      html: createTestEmail()
    };
    
    console.log('Mail options:', JSON.stringify(mailOptions, null, 2));
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      details: {
        messageId: info.messageId,
        recipient: recipient,
        response: info.response
      }
    });
  } catch (error) {
    console.error('Failed to send test email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
      stack: error.stack
    });
  }
});

// Send alert email endpoint
app.post('/send-alert', async (req, res) => {
  try {
    const { recipient, alert } = req.body;
    
    if (!recipient || !recipient.email) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }
    
    if (!alert) {
      return res.status(400).json({ success: false, message: 'Alert data is required' });
    }
    
    console.log(`Sending alert email to ${recipient.email}...`);
    console.log('Alert data:', JSON.stringify(alert, null, 2));
    
    // Create email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Disaster Management System" <${process.env.EMAIL_USER}>`,
      to: recipient.email,
      subject: `${alert.disasterType} Alert for ${alert.regions || alert.location}`,
      html: createAlertEmail(alert)
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Alert email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    res.json({
      success: true,
      message: 'Alert email sent successfully',
      details: {
        messageId: info.messageId,
        recipient: recipient.email,
        response: info.response
      }
    });
  } catch (error) {
    console.error('Failed to send alert email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send alert email',
      error: error.message,
      stack: error.stack
    });
  }
});

// Create test email HTML
function createTestEmail() {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
      <div style="background-color: #2ecc71; color: white; padding: 15px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Test Alert</h1>
        <p style="margin: 10px 0 0 0;">Severity: LOW</p>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <p style="color: #800080; margin-top: 0;">Dear Test Recipient,</p>
        
        <p>A Low Test Alert alert has been issued for the following regions:</p>
        
        <p style="color: #800080; font-weight: bold;">Test Region</p>
        
        <p>This is a test email from the Disaster Management System.</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #999;">
          <p style="font-weight: bold; margin-top: 0;">Alert Details:</p>
          <ul style="margin-bottom: 0; padding-left: 20px;">
            <li>Alert ID: TEST-${Date.now().toString().slice(-6)}</li>
            <li>Date & Time: ${new Date().toISOString().replace('T', '-').substring(0, 19).replace(':', '.').replace(':', '.')}</li>
            <li>Issued By: Email Test Panel</li>
          </ul>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #e74c3c;">
          <p style="font-weight: bold; color: #800080; margin-top: 0;">Evacuation Orders:</p>
          <p style="margin-bottom: 0;">No evacuation orders at this time</p>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #3498db;">
          <p style="font-weight: bold; color: #800080; margin-top: 0;">Emergency Contacts:</p>
          <p style="margin-bottom: 0;">Emergency Services: 911</p>
        </div>
        
        <p>Please take necessary precautions and stay safe.</p>
        
        <p style="margin-bottom: 0;">Regards,<br>Disaster Management System</p>
        
        <p style="color: #999; margin-top: 20px;">***</p>
      </div>
    </div>
  `;
}

// Create alert email HTML
function createAlertEmail(alert) {
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

// Get color based on alert severity
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

// Start the server
app.listen(PORT, () => {
  console.log(`Gmail Direct Sender running on port ${PORT}`);
  console.log(`Test the email server: http://localhost:${PORT}/send-test`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
