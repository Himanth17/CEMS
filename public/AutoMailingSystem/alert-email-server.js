/**
 * Alert Email Server
 * A dedicated server for sending alert emails directly
 */

// Load environment variables
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const alertMailer = require('./alert-mailer');

// Create Express app
const app = express();
const PORT = 3002; // Use a different port to avoid conflicts

// Configure CORS
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request body
app.use(bodyParser.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Send alert email endpoint
app.post('/send-alert-email', async (req, res) => {
  try {
    console.log('Received request to send alert email:', req.body);

    const { recipient, alert } = req.body;

    if (!recipient || !recipient.email) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }

    if (!alert) {
      return res.status(400).json({ success: false, message: 'Alert data is required' });
    }

    // Create email options
    const emailOptions = {
      to: recipient.email,
      subject: `${alert.disasterType} Alert for ${alert.regions || alert.location}`,
      alert: {
        ...alert,
        recipientName: recipient.fullname || 'Test Recipient' // Add recipient name to the alert
      }
    };

    console.log('Sending alert email with options:', emailOptions);

    // Send the email
    const result = await alertMailer.sendAlertEmail(emailOptions);

    res.json({
      success: true,
      message: 'Alert email sent successfully',
      details: {
        messageId: result.messageId,
        recipient: recipient.email
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

// Test alert email endpoint
app.get('/test-alert-email', async (req, res) => {
  try {
    const email = req.query.email || process.env.TEST_EMAIL || process.env.EMAIL_USER;

    // Create test alert
    const testAlert = {
      id: 'TEST-' + Date.now().toString().slice(-6),
      disasterType: 'Test Alert',
      regions: 'Test Region',
      severity: 'Low',
      message: 'This is a test email from the Disaster Management System.',
      evacuationOrders: 'No evacuation orders at this time',
      emergencyContacts: 'Emergency Services: 911',
      issuedBy: 'Email Test Panel',
      timestamp: new Date().toISOString(),
      recipientName: 'Test Recipient'
    };

    // Create email options
    const emailOptions = {
      to: email,
      subject: `Test Alert for ${testAlert.regions}`,
      alert: testAlert
    };

    console.log('Sending test alert email to:', email);

    // Send the email
    const result = await alertMailer.sendAlertEmail(emailOptions);

    res.json({
      success: true,
      message: 'Test alert email sent successfully',
      details: {
        messageId: result.messageId,
        recipient: email
      }
    });
  } catch (error) {
    console.error('Failed to send test alert email:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to send test alert email',
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Alert Email Server running on port ${PORT}`);
  console.log(`Test the alert email server: http://localhost:${PORT}/test-alert-email`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
