/**
 * Simple Gmail Sender
 * A straightforward, reliable Gmail sender with no complexity
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create Express app
const app = express();
const PORT = 3009;

// Configure middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Hardcoded Gmail credentials
const EMAIL_USER = 'menduhimanth032@gmail.com';
const EMAIL_PASS = 'dpfk fqcs etxe ceol';

console.log('Starting Simple Gmail Sender with credentials:');
console.log('- Email:', EMAIL_USER);
console.log('- Password length:', EMAIL_PASS.length);

// Create transporter with more reliable settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  debug: true,
  logger: true,
  priority: 'high',
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 30
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ GMAIL CONNECTION ERROR:', error);
  } else {
    console.log('✅ Gmail connection verified successfully');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Send alert email endpoint
app.post('/send-alert', async (req, res) => {
  try {
    console.log('Received request to send alert email');

    const { recipient, alert } = req.body;

    if (!recipient || !recipient.email) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required'
      });
    }

    if (!alert) {
      return res.status(400).json({
        success: false,
        message: 'Alert data is required'
      });
    }

    console.log(`Sending alert email to ${recipient.email}`);
    console.log('Alert data:', JSON.stringify(alert, null, 2));

    // Send immediate response to prevent timeout
    res.json({
      success: true,
      message: 'Alert email sending initiated',
      details: {
        messageId: 'pending-' + Date.now(),
        recipient: recipient.email,
        response: 'Email sending initiated'
      }
    });

    // Create HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #d9534f;">${alert.disasterType} Alert</h2>
        <p><strong>Location:</strong> ${alert.location || alert.regions || 'All Regions'}</p>
        <p><strong>Severity:</strong> ${alert.severity || 'High'}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Description:</strong> ${alert.description || alert.message || 'Emergency alert notification'}</p>
        <p><strong>Issued By:</strong> ${alert.reportedBy || alert.issuedBy || 'Disaster Management System'}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <h3>Safety Instructions</h3>
        <p>${alert.evacuationOrders || 'Follow local authority instructions'}</p>
        <p><strong>Emergency Contacts:</strong> ${alert.emergencyContacts || 'Emergency Services: 911 (US) / 112 (EU) / 112 (India)'}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #777; font-size: 12px;">This is an automated alert from the Disaster Management System. Please do not reply to this email.</p>
      </div>
    `;

    // Create email options
    const mailOptions = {
      from: `"Disaster Management System" <${EMAIL_USER}>`,
      to: recipient.email,
      subject: `${alert.disasterType} Alert for ${alert.location || alert.regions || 'All Regions'}`,
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
      subject: mailOptions.subject
    }, null, 2));

    // Send the email asynchronously
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send alert email:', error);
      } else {
        console.log('Alert email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
      }
    });
  } catch (error) {
    console.error('Failed to send alert email:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to send alert email',
      error: error.message
    });
  }
});

// Send test email endpoint
app.get('/send-test', async (req, res) => {
  try {
    const recipient = req.query.email || 'menduhimanth22@ifheindia.org';

    console.log(`Sending test email to ${recipient}...`);

    // Create email options
    const mailOptions = {
      from: `"Disaster Management System" <${EMAIL_USER}>`,
      to: recipient,
      subject: 'Test Email from Disaster Management System - ' + new Date().toISOString(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">Test Email</h2>
          <p>This is a test email from the Disaster Management System.</p>
          <p>If you received this email, it means the email functionality is working correctly.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
      priority: 'high'
    };

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
      error: error.message
    });
  }
});

// Direct test endpoint - for super easy testing
app.get('/direct-test', (req, res) => {
  try {
    const recipient = req.query.email || 'menduhimanth22@ifheindia.org';

    console.log(`Sending direct test email to ${recipient}...`);

    // Send immediate response to prevent timeout
    res.send(`
      <html>
        <head>
          <title>Direct Test Email Sending</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .sending { color: blue; }
            .details { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
            h1 { color: #333; }
            .loader {
              border: 5px solid #f3f3f3;
              border-top: 5px solid #3498db;
              border-radius: 50%;
              width: 30px;
              height: 30px;
              animation: spin 2s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
          <script>
            // Auto-refresh the page after 5 seconds to show the result
            setTimeout(function() {
              window.location.href = "/direct-test-status?email=${encodeURIComponent(recipient)}";
            }, 5000);
          </script>
        </head>
        <body>
          <h1>Direct Test Email Sending</h1>
          <p class="sending">⏳ Sending test email to ${recipient}...</p>
          <div class="loader"></div>
          <div class="details">
            <p><strong>Recipient:</strong> ${recipient}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Please wait while the email is being sent. This page will automatically refresh to show the result.</p>
        </body>
      </html>
    `);

    // Create email options
    const mailOptions = {
      from: `"Disaster Management System" <${EMAIL_USER}>`,
      to: recipient,
      subject: 'DIRECT TEST Email from Disaster Management System - ' + new Date().toISOString(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #d9534f;">DIRECT TEST Email</h2>
          <p>This is a <strong>DIRECT TEST</strong> email from the Disaster Management System.</p>
          <p>If you received this email, it means the email functionality is working correctly.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
      priority: 'high'
    };

    // Store the email status for later retrieval
    const emailStatus = {
      recipient: recipient,
      sentAt: new Date().toISOString(),
      status: 'sending',
      messageId: null,
      response: null,
      error: null
    };

    // Store the status in a global variable
    if (!global.emailStatuses) {
      global.emailStatuses = {};
    }
    global.emailStatuses[recipient] = emailStatus;

    // Send the email asynchronously
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send direct test email:', error);
        emailStatus.status = 'failed';
        emailStatus.error = error.message;
      } else {
        console.log('Direct test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        emailStatus.status = 'sent';
        emailStatus.messageId = info.messageId;
        emailStatus.response = info.response;
      }

      // Update the status
      global.emailStatuses[recipient] = emailStatus;
    });
  } catch (error) {
    console.error('Failed to process direct test email request:', error);

    res.status(500).send(`
      <html>
        <head>
          <title>Direct Test Email Failed</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .error { color: red; }
            .details { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Direct Test Email Failed</h1>
          <p class="error">❌ Failed to process test email request: ${error.message}</p>
          <div class="details">
            <p><strong>Error:</strong> ${error.message}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p><a href="/direct-test">Try again</a></p>
        </body>
      </html>
    `);
  }
});

// Direct test status endpoint
app.get('/direct-test-status', (req, res) => {
  try {
    const recipient = req.query.email || 'menduhimanth22@ifheindia.org';

    // Get the email status
    const emailStatus = global.emailStatuses && global.emailStatuses[recipient];

    if (!emailStatus) {
      res.send(`
        <html>
          <head>
            <title>Direct Test Email Status</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .warning { color: orange; }
              .details { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>Direct Test Email Status</h1>
            <p class="warning">⚠️ No email status found for ${recipient}</p>
            <div class="details">
              <p><strong>Recipient:</strong> ${recipient}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p><a href="/direct-test?email=${recipient}">Send a test email</a></p>
          </body>
        </html>
      `);
      return;
    }

    if (emailStatus.status === 'sending') {
      res.send(`
        <html>
          <head>
            <title>Direct Test Email Status</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .sending { color: blue; }
              .details { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
              h1 { color: #333; }
              .loader {
                border: 5px solid #f3f3f3;
                border-top: 5px solid #3498db;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: spin 2s linear infinite;
                margin: 20px auto;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
            <script>
              // Auto-refresh the page after 3 seconds to check the status again
              setTimeout(function() {
                window.location.reload();
              }, 3000);
            </script>
          </head>
          <body>
            <h1>Direct Test Email Status</h1>
            <p class="sending">⏳ Still sending test email to ${recipient}...</p>
            <div class="loader"></div>
            <div class="details">
              <p><strong>Recipient:</strong> ${recipient}</p>
              <p><strong>Sent At:</strong> ${new Date(emailStatus.sentAt).toLocaleString()}</p>
              <p><strong>Status:</strong> ${emailStatus.status}</p>
            </div>
            <p>Please wait while the email is being sent. This page will automatically refresh to check the status again.</p>
          </body>
        </html>
      `);
    } else if (emailStatus.status === 'sent') {
      res.send(`
        <html>
          <head>
            <title>Direct Test Email Status</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .success { color: green; }
              .details { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>Direct Test Email Status</h1>
            <p class="success">✅ Test email sent successfully to ${recipient}!</p>
            <div class="details">
              <p><strong>Recipient:</strong> ${recipient}</p>
              <p><strong>Sent At:</strong> ${new Date(emailStatus.sentAt).toLocaleString()}</p>
              <p><strong>Status:</strong> ${emailStatus.status}</p>
              <p><strong>Message ID:</strong> ${emailStatus.messageId}</p>
              <p><strong>Response:</strong> ${emailStatus.response}</p>
            </div>
            <p>Check your inbox for the test email.</p>
            <p><a href="/direct-test?email=${recipient}">Send another test email</a></p>
          </body>
        </html>
      `);
    } else {
      res.send(`
        <html>
          <head>
            <title>Direct Test Email Status</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .error { color: red; }
              .details { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>Direct Test Email Status</h1>
            <p class="error">❌ Failed to send test email: ${emailStatus.error}</p>
            <div class="details">
              <p><strong>Recipient:</strong> ${recipient}</p>
              <p><strong>Sent At:</strong> ${new Date(emailStatus.sentAt).toLocaleString()}</p>
              <p><strong>Status:</strong> ${emailStatus.status}</p>
              <p><strong>Error:</strong> ${emailStatus.error}</p>
            </div>
            <p><a href="/direct-test?email=${recipient}">Try again</a></p>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Failed to get direct test email status:', error);

    res.status(500).send(`
      <html>
        <head>
          <title>Direct Test Email Status Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .error { color: red; }
            .details { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Direct Test Email Status Error</h1>
          <p class="error">❌ Failed to get test email status: ${error.message}</p>
          <div class="details">
            <p><strong>Error:</strong> ${error.message}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p><a href="/direct-test">Try again</a></p>
        </body>
      </html>
    `);
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Simple Gmail Sender running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test email: http://localhost:${PORT}/send-test?email=your-email@example.com`);
  console.log(`Direct test: http://localhost:${PORT}/direct-test?email=your-email@example.com`);
  console.log(`Send alert: POST to http://localhost:${PORT}/send-alert`);
});

