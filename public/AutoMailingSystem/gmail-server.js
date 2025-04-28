/**
 * Gmail Server
 * A dedicated server for sending emails through Gmail
 */

// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create Express app
const app = express();
const PORT = 3007; // Use a different port to avoid conflicts

// Configure middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Email credentials
const EMAIL_USER = 'menduhimanth032@gmail.com';
const EMAIL_PASS = 'dpfk fqcs etxe ceol';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  debug: true, // Enable debug logs
  logger: true  // Log information in console
});

// Verify the transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ EMAIL CONFIGURATION ERROR:', error);
  } else {
    console.log('✅ Gmail Server is ready to send messages');
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
      `
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

    // Create HTML content for the email
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
      html: htmlContent
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

// Direct email sending endpoint
app.post('/send-direct', async (req, res) => {
  try {
    console.log('Received direct email request');

    // Get email data from request
    const { to, from, subject, html } = req.body;

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    console.log(`Sending email to ${to} with subject: ${subject}`);

    // Create email options
    const mailOptions = {
      from: from || `"Disaster Management System" <${EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    // Return success response
    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
      response: info.response
    });
  } catch (error) {
    console.error('Failed to send email:', error);

    // Return error response
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Gmail Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test email: http://localhost:${PORT}/send-test?email=your-email@example.com`);
});
