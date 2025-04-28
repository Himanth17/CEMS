// Load environment variables
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

// Debug mode
const DEBUG = process.env.DEBUG_MODE === 'true';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      if (DEBUG) console.log('Request with no origin accepted');
      return callback(null, true);
    }

    if (DEBUG) console.log(`Request from origin: ${origin}`);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.error(`CORS error: ${msg} for origin ${origin}`);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request body
app.use(bodyParser.json());

// Log all requests
app.use((req, res, next) => {
  if (DEBUG) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
  }
  next();
});

// Create email transporter
let transporter;

try {
  // For Gmail
  if (process.env.EMAIL_SERVICE.toLowerCase() === 'gmail') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // Less strict about certificates
      },
      // Enhanced connection pool settings
      pool: true,
      maxConnections: 5,
      maxMessages: 200, // Increased from 100
      // Improved timeout settings
      connectionTimeout: 60000, // 60 seconds
      socketTimeout: 120000, // 120 seconds
      // Gmail-specific settings to optimize throughput
      rateDelta: 1000, // Minimum milliseconds between messages
      rateLimit: 30 // Maximum number of messages per second
    });
  }
  // For other services or SMTP
  else {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Add connection pool settings
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      // Add timeout settings
      connectionTimeout: 30000, // 30 seconds
      socketTimeout: 60000 // 60 seconds
    });
  }

  console.log(`Email transporter created for service: ${process.env.EMAIL_SERVICE}`);
  console.log(`Using email account: ${process.env.EMAIL_USER}`);
  console.log('Email connection pool enabled with improved timeout settings');
} catch (error) {
  console.error('Failed to create email transporter:', error);
}

// Verify email configuration with enhanced error reporting
transporter.verify(function(error, success) {
  if (error) {
    console.error('⚠️ EMAIL CONFIGURATION ERROR ⚠️');
    console.error('Detailed error:', error);

    // Log specific error information based on error type
    if (error.code === 'EAUTH') {
      console.error('Authentication error: The provided credentials were rejected by the Gmail server.');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket error: Could not establish a connection to the Gmail server.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Timeout error: The connection to the Gmail server timed out.');
    }

    console.log('\n🔧 POSSIBLE SOLUTIONS:');
    console.log('1. Check if your email and password are correct');
    console.log('2. For Gmail, you MUST use an App Password, not your regular password');
    console.log('   - Go to https://myaccount.google.com/apppasswords to generate one');
    console.log('3. Make sure 2-Step Verification is enabled for your Google account');
    console.log('4. Check if your Gmail account has any security restrictions');
    console.log('5. Try using a different Gmail account for testing');

    // Create a test email function to verify credentials
    console.log('\n🧪 TESTING EMAIL CREDENTIALS...');
    testEmailCredentials();
  } else {
    console.log('✅ Email server is ready to send messages');
    console.log('📧 Using email account:', process.env.EMAIL_USER);
    console.log('🔄 Email connection pool enabled with improved timeout settings');
  }
});

// Function to test email credentials
async function testEmailCredentials() {
  try {
    // Create a test transporter with basic settings
    const testTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Try to verify the connection
    const testResult = await testTransporter.verify();
    console.log('✅ Test connection successful! Your credentials are valid.');
  } catch (testError) {
    console.error('❌ Test connection failed:', testError.message);
    console.log('Please check your EMAIL_USER and EMAIL_PASS in the .env file.');
  }
}

// API endpoint to send event confirmation emails
app.post('/api/send-event-confirmation', async (req, res) => {
  try {
    const { recipient, event } = req.body;

    if (DEBUG) {
      console.log('Received event confirmation email request:');
      console.log('- Recipient:', JSON.stringify(recipient));
      console.log('- Event:', JSON.stringify(event));
    }

    if (!recipient || !recipient.email) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }

    if (!event) {
      return res.status(400).json({ success: false, message: 'Event data is required' });
    }

    console.log(`Sending event confirmation email to ${recipient.email}`);

    // Create HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3498db; color: white; padding: 15px; text-align: center;">
          <h1>Event Confirmation</h1>
        </div>

        <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
          <p>Dear ${recipient.fullname || 'User'},</p>

          <p>Your event has been successfully booked!</p>

          <div style="margin: 25px 0; padding: 15px; background-color: #f0f0f0; border-left: 4px solid #3498db;">
            <p><strong>Event Details:</strong></p>
            <ul>
              <li><strong>Event Name:</strong> ${event.name}</li>
              <li><strong>Date:</strong> ${event.date}</li>
              <li><strong>Time:</strong> ${event.time}</li>
              <li><strong>Venue:</strong> ${event.venue}</li>
              <li><strong>Chief Guest:</strong> ${event.chief_guest || 'N/A'}</li>
              <li><strong>Audience Limit:</strong> ${event.audience_limit || 'N/A'}</li>
              <li><strong>Club:</strong> ${event.club || 'N/A'}</li>
            </ul>
          </div>

          <p>Please note the following guidelines:</p>
          <ul>
            <li>No food is allowed in the auditorium</li>
            <li>All events must end by 10 PM</li>
            <li>Please arrive at least 30 minutes before your event starts</li>
          </ul>

          <p>If you need to make any changes to your event, please log in to your account and update the event details.</p>

          <p>Regards,<br>College Event Management System</p>
        </div>

        <div style="padding: 10px; background-color: #f0f0f0; font-size: 12px; text-align: center;">
          <p>This is an automated email from the College Event Management System.</p>
          <p>To update your notification preferences, please log in to your account.</p>
        </div>
      </div>
    `;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipient.email,
      subject: `Event Confirmation: ${event.name}`,
      html: htmlContent
    };

    if (DEBUG) {
      console.log('Sending email with options:', JSON.stringify({
        to: mailOptions.to,
        subject: mailOptions.subject,
        from: mailOptions.from
      }));
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${recipient.email}`);
    console.log(`Message ID: ${info.messageId}`);

    res.json({
      success: true,
      message: 'Event confirmation email sent successfully',
      details: {
        messageId: info.messageId,
        recipient: recipient.email
      }
    });

  } catch (error) {
    console.error('Error in event confirmation email API:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send event confirmation email',
      error: error.message
    });
  }
});

// API endpoint to send event update emails
app.post('/api/send-event-update', async (req, res) => {
  try {
    const { recipient, event } = req.body;

    if (DEBUG) {
      console.log('Received event update email request:');
      console.log('- Recipient:', JSON.stringify(recipient));
      console.log('- Event:', JSON.stringify(event));
    }

    if (!recipient || !recipient.email) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }

    if (!event) {
      return res.status(400).json({ success: false, message: 'Event data is required' });
    }

    console.log(`Sending event update email to ${recipient.email}`);

    // Create HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f39c12; color: white; padding: 15px; text-align: center;">
          <h1>Event Update</h1>
        </div>

        <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
          <p>Dear ${recipient.fullname || 'User'},</p>

          <p>Your event has been updated with the following details:</p>

          <div style="margin: 25px 0; padding: 15px; background-color: #f0f0f0; border-left: 4px solid #f39c12;">
            <p><strong>Updated Event Details:</strong></p>
            <ul>
              <li><strong>Event Name:</strong> ${event.name}</li>
              <li><strong>Date:</strong> ${event.date}</li>
              <li><strong>Time:</strong> ${event.time}</li>
              <li><strong>Venue:</strong> ${event.venue}</li>
              <li><strong>Chief Guest:</strong> ${event.chief_guest || 'N/A'}</li>
              <li><strong>Audience Limit:</strong> ${event.audience_limit || 'N/A'}</li>
              <li><strong>Club:</strong> ${event.club || 'N/A'}</li>
            </ul>
          </div>

          <p>Please review these details and make sure they are correct.</p>

          <p>If you need to make any further changes, please log in to your account and update the event details.</p>

          <p>Regards,<br>College Event Management System</p>
        </div>

        <div style="padding: 10px; background-color: #f0f0f0; font-size: 12px; text-align: center;">
          <p>This is an automated email from the College Event Management System.</p>
          <p>To update your notification preferences, please log in to your account.</p>
        </div>
      </div>
    `;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipient.email,
      subject: `Event Update: ${event.name}`,
      html: htmlContent
    };

    if (DEBUG) {
      console.log('Sending email with options:', JSON.stringify({
        to: mailOptions.to,
        subject: mailOptions.subject,
        from: mailOptions.from
      }));
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${recipient.email}`);
    console.log(`Message ID: ${info.messageId}`);

    res.json({
      success: true,
      message: 'Event update email sent successfully',
      details: {
        messageId: info.messageId,
        recipient: recipient.email
      }
    });

  } catch (error) {
    console.error('Error in event update email API:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send event update email',
      error: error.message
    });
  }
});

// API endpoint to send event reminder emails
app.post('/api/send-event-reminder', async (req, res) => {
  try {
    const { recipients, event } = req.body;

    if (DEBUG) {
      console.log('Received event reminder email request:');
      console.log('- Recipients:', JSON.stringify(recipients));
      console.log('- Event:', JSON.stringify(event));
    }

    if (!recipients) {
      return res.status(400).json({ success: false, message: 'Recipients are required' });
    }

    // Convert single recipient to array if needed
    const recipientsList = Array.isArray(recipients) ? recipients : [recipients];

    if (recipientsList.length === 0 || !recipientsList[0].email) {
      return res.status(400).json({ success: false, message: 'At least one valid recipient email is required' });
    }

    if (!event) {
      return res.status(400).json({ success: false, message: 'Event data is required' });
    }

    console.log(`Sending event reminder email to ${recipientsList.length} recipients`);

    // Track successful and failed emails
    const results = {
      success: [],
      failed: []
    };

    // Send emails to all recipients
    for (const recipient of recipientsList) {
      try {
        // Create HTML email content
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #9b59b6; color: white; padding: 15px; text-align: center;">
              <h1>Event Reminder</h1>
            </div>

            <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
              <p>Dear ${recipient.fullname || 'User'},</p>

              <p>This is a reminder about your upcoming event:</p>

              <div style="margin: 25px 0; padding: 15px; background-color: #f0f0f0; border-left: 4px solid #9b59b6;">
                <p><strong>Event Details:</strong></p>
                <ul>
                  <li><strong>Event Name:</strong> ${event.name}</li>
                  <li><strong>Date:</strong> ${event.date}</li>
                  <li><strong>Time:</strong> ${event.time}</li>
                  <li><strong>Venue:</strong> ${event.venue}</li>
                  <li><strong>Chief Guest:</strong> ${event.chief_guest || 'N/A'}</li>
                  <li><strong>Audience Limit:</strong> ${event.audience_limit || 'N/A'}</li>
                  <li><strong>Club:</strong> ${event.club || 'N/A'}</li>
                </ul>
              </div>

              <p>Please remember the following guidelines:</p>
              <ul>
                <li>No food is allowed in the auditorium</li>
                <li>All events must end by 10 PM</li>
                <li>Please arrive at least 30 minutes before your event starts</li>
              </ul>

              <p>We look forward to your event!</p>

              <p>Regards,<br>College Event Management System</p>
            </div>

            <div style="padding: 10px; background-color: #f0f0f0; font-size: 12px; text-align: center;">
              <p>This is an automated email from the College Event Management System.</p>
              <p>To update your notification preferences, please log in to your account.</p>
            </div>
          </div>
        `;

        // Email options
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: recipient.email,
          subject: `Event Reminder: ${event.name}`,
          html: htmlContent
        };

        if (DEBUG) {
          console.log('Sending email with options:', JSON.stringify({
            to: mailOptions.to,
            subject: mailOptions.subject,
            from: mailOptions.from
          }));
        }

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log(`Email sent successfully to ${recipient.email}`);
        console.log(`Message ID: ${info.messageId}`);

        results.success.push({
          email: recipient.email,
          messageId: info.messageId
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${recipient.email}:`, emailError);
        results.failed.push({
          email: recipient.email,
          error: emailError.message
        });
      }
    }

    res.json({
      success: true,
      message: `Event reminder emails sent: ${results.success.length} successful, ${results.failed.length} failed`,
      details: results
    });

  } catch (error) {
    console.error('Error in event reminder email API:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send event reminder emails',
      error: error.message
    });
  }
});

// API endpoint to send event cancellation emails
app.post('/api/send-event-cancellation', async (req, res) => {
  try {
    const { recipients, event } = req.body;

    if (DEBUG) {
      console.log('Received event cancellation email request:');
      console.log('- Recipients:', JSON.stringify(recipients));
      console.log('- Event:', JSON.stringify(event));
    }

    if (!recipients) {
      return res.status(400).json({ success: false, message: 'Recipients are required' });
    }

    // Convert single recipient to array if needed
    const recipientsList = Array.isArray(recipients) ? recipients : [recipients];

    if (recipientsList.length === 0 || !recipientsList[0].email) {
      return res.status(400).json({ success: false, message: 'At least one valid recipient email is required' });
    }

    if (!event) {
      return res.status(400).json({ success: false, message: 'Event data is required' });
    }

    console.log(`Sending event cancellation email to ${recipientsList.length} recipients`);

    // Track successful and failed emails
    const results = {
      success: [],
      failed: []
    };

    // Send emails to all recipients
    for (const recipient of recipientsList) {
      try {
        // Create HTML email content
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #e74c3c; color: white; padding: 15px; text-align: center;">
              <h1>Event Cancellation</h1>
            </div>

            <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
              <p>Dear ${recipient.fullname || 'User'},</p>

              <p>We regret to inform you that your event has been cancelled:</p>

              <div style="margin: 25px 0; padding: 15px; background-color: #f0f0f0; border-left: 4px solid #e74c3c;">
                <p><strong>Cancelled Event Details:</strong></p>
                <ul>
                  <li><strong>Event Name:</strong> ${event.name}</li>
                  <li><strong>Date:</strong> ${event.date}</li>
                  <li><strong>Time:</strong> ${event.time}</li>
                  <li><strong>Venue:</strong> ${event.venue}</li>
                </ul>
              </div>

              <p>If you have any questions or would like to reschedule, please contact the event management team.</p>

              <p>Regards,<br>College Event Management System</p>
            </div>

            <div style="padding: 10px; background-color: #f0f0f0; font-size: 12px; text-align: center;">
              <p>This is an automated email from the College Event Management System.</p>
              <p>To update your notification preferences, please log in to your account.</p>
            </div>
          </div>
        `;

        // Email options
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: recipient.email,
          subject: `Event Cancellation: ${event.name}`,
          html: htmlContent
        };

        if (DEBUG) {
          console.log('Sending email with options:', JSON.stringify({
            to: mailOptions.to,
            subject: mailOptions.subject,
            from: mailOptions.from
          }));
        }

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log(`Email sent successfully to ${recipient.email}`);
        console.log(`Message ID: ${info.messageId}`);

        results.success.push({
          email: recipient.email,
          messageId: info.messageId
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${recipient.email}:`, emailError);
        results.failed.push({
          email: recipient.email,
          error: emailError.message
        });
      }
    }

    res.json({
      success: true,
      message: `Event cancellation emails sent: ${results.success.length} successful, ${results.failed.length} failed`,
      details: results
    });

  } catch (error) {
    console.error('Error in event cancellation email API:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send event cancellation emails',
      error: error.message
    });
  }
});

// Helper function to get color based on alert severity
function getSeverityColor(severity) {
  switch (severity.toLowerCase()) {
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

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test email endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    // Get test recipient from query or use default
    const testEmail = req.query.email || process.env.TEST_EMAIL || process.env.EMAIL_USER;

    // Get additional test recipients if available
    const additionalRecipients = process.env.ADDITIONAL_TEST_EMAILS ?
      process.env.ADDITIONAL_TEST_EMAILS.split(',').filter(email => email !== testEmail) : [];

    console.log(`Sending test email to ${testEmail}${additionalRecipients.length > 0 ? ' and ' + additionalRecipients.length + ' additional recipients' : ''}`);

    if (additionalRecipients.length > 0) {
      console.log('Additional recipients:', additionalRecipients);
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: testEmail,
      bcc: additionalRecipients.join(','), // Add BCC recipients
      subject: 'Test Email from College Event Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #3498db; color: white; padding: 15px; text-align: center;">
            <h1>Test Email</h1>
          </div>

          <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
            <p>Hello,</p>

            <p>This is a test email from the College Event Management System.</p>
            <p>If you're receiving this email, it means the email sending functionality is working correctly.</p>

            <p>Time sent: ${new Date().toLocaleString()}</p>

            <p>Regards,<br>College Event Management System</p>
          </div>
        </div>
      `
    };

    // Send test email
    const info = await transporter.sendMail(mailOptions);

    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      details: {
        messageId: info.messageId,
        recipient: testEmail
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

// Start the server
app.listen(PORT, () => {
  console.log(`College Event Management System Email Server running on port ${PORT}`);
  console.log(`Test the email server: http://localhost:${PORT}/api/test-email`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
