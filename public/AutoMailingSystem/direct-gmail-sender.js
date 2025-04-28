/**
 * Direct Gmail Sender
 * A super simplified, direct Gmail sender with minimal dependencies
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a simple Express server
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3003;

// Enable CORS
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Hardcoded email credentials for reliability
const EMAIL_USER = 'menduhimanth032@gmail.com';
const EMAIL_PASS = 'dpfk fqcs etxe ceol';

// Log the credentials being used
console.log('Using Gmail credentials:');
console.log('- Email:', EMAIL_USER);
console.log('- Password length:', EMAIL_PASS.length);
console.log('- First 4 chars of password:', EMAIL_PASS.substring(0, 4));

// Create a transporter with more reliable settings
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  // Enable connection pooling for better performance
  pool: true,
  maxConnections: 5,
  // Set reasonable timeouts
  connectionTimeout: 10000,
  socketTimeout: 15000,
  // Debug options
  debug: true,
  logger: true,
  // Set priority
  priority: 'high'
});

// Verify the transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ EMAIL CONFIGURATION ERROR:', error);
    console.log('Email user:', EMAIL_USER);
    console.log('Email pass length:', EMAIL_PASS ? EMAIL_PASS.length : 0);

    // Try to recreate the transporter after a delay
    setTimeout(() => {
      console.log('Attempting to recreate transporter...');
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS
        },
        debug: true,
        logger: true
      });

      // Verify again
      transporter.verify((err, success) => {
        if (err) {
          console.error('❌ Still having email configuration issues:', err);
        } else {
          console.log('✅ Email server is now ready to send messages');
        }
      });
    }, 5000);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Send test email endpoint
app.get('/send-test', async (req, res) => {
  try {
    const recipient = req.query.email || 'menduhimanth22@ifheindia.org';

    console.log(`Sending test email to ${recipient}...`);

    // Check if transporter is available
    if (!transporter) {
      console.log('Transporter not available, recreating...');
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS
        },
        debug: true,
        logger: true
      });
    }

    // Create email options with priority headers
    const mailOptions = {
      from: `"Disaster Management System" <${EMAIL_USER}>`,
      to: recipient,
      subject: 'Test Email from Disaster Management System - ' + new Date().toISOString(),
      html: createTestEmail(),
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      }
    };

    console.log('Sending email with options:', JSON.stringify({
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      priority: mailOptions.priority
    }, null, 2));

    // Send the email with a promise
    const sendMailPromise = new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          reject(error);
        } else {
          console.log('Email sent successfully:', info);
          resolve(info);
        }
      });
    });

    // Wait for the email to be sent with a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timed out after 20 seconds')), 20000);
    });

    // Race the promises
    const info = await Promise.race([sendMailPromise, timeoutPromise]);

    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      details: {
        messageId: info.messageId,
        recipient: recipient,
        response: info.response,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to send test email:', error);

    // Try to recreate the transporter with different settings
    console.log('Recreating transporter with different settings...');
    try {
      // Try with different port
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // use TLS
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS
        },
        debug: true,
        logger: true
      });

      console.log('Transporter recreated with TLS settings');
    } catch (recreateError) {
      console.error('Failed to recreate transporter:', recreateError);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
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

    // Check if transporter is available
    if (!transporter) {
      console.log('Transporter not available, recreating...');
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS
        },
        debug: true,
        logger: true,
        priority: 'high'
      });
    }

    // Create HTML content for the email
    const htmlContent = createAlertEmail(alert);

    // Create email options with priority headers
    const mailOptions = {
      from: `"Disaster Management System" <${EMAIL_USER}>`,
      to: recipient.email,
      subject: `${alert.disasterType} Alert for ${alert.regions || alert.location || 'All Regions'}`,
      html: htmlContent,
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      }
    };

    console.log('Sending email with options:', JSON.stringify({
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      priority: mailOptions.priority
    }, null, 2));

    // Send the email directly without promise wrapping for better performance
    const info = await transporter.sendMail(mailOptions);

    console.log('Alert email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    // Send immediate response to client
    res.json({
      success: true,
      message: 'Alert email sent successfully',
      details: {
        messageId: info.messageId,
        recipient: recipient.email,
        response: info.response,
        timestamp: new Date().toISOString()
      }
    });

    // Log additional information after response is sent
    console.log('Full email sending details:', info);
    console.log('Email accepted by SMTP server:', info.accepted);
    console.log('Email delivery timestamp:', new Date().toISOString());

  } catch (error) {
    console.error('Failed to send alert email:', error);

    // Try to recreate the transporter with different settings
    console.log('Recreating transporter with different settings...');
    try {
      // Try with different port
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // use TLS
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS
        },
        debug: true,
        logger: true,
        priority: 'high'
      });

      console.log('Transporter recreated with TLS settings');

      // Try sending with the new transporter immediately
      try {
        const htmlContent = createAlertEmail(alert);

        const mailOptions = {
          from: `"Disaster Management System" <${EMAIL_USER}>`,
          to: recipient.email,
          subject: `${alert.disasterType} Alert for ${alert.regions || alert.location || 'All Regions'} (Retry)`,
          html: htmlContent,
          priority: 'high',
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'High'
          }
        };

        console.log('Retrying email with TLS settings...');
        const retryInfo = await transporter.sendMail(mailOptions);

        console.log('Retry successful!');
        console.log('Message ID:', retryInfo.messageId);

        return res.json({
          success: true,
          message: 'Alert email sent successfully (after retry)',
          details: {
            messageId: retryInfo.messageId,
            recipient: recipient.email,
            response: retryInfo.response,
            timestamp: new Date().toISOString()
          }
        });
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
      }
    } catch (recreateError) {
      console.error('Failed to recreate transporter:', recreateError);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send alert email',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
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
  console.log(`Direct Gmail Sender running on port ${PORT}`);
  console.log(`Test the email server: http://localhost:${PORT}/send-test`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
