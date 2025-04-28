/**
 * Direct Email Server
 * A simplified email server that focuses on reliable email delivery
 */

// Load environment variables
require('dotenv').config();

// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const directMailer = require('./direct-mailer');

// Create Express app
const app = express();
const PORT = 3001; // Use a different port to avoid conflicts

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
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test email endpoint
app.get('/send-test-email', async (req, res) => {
  try {
    // Get test recipient from query or use default
    const testEmail = req.query.email || process.env.TEST_EMAIL || process.env.EMAIL_USER;
    
    console.log(`Sending direct test email to ${testEmail}`);
    
    // Send test email
    const result = await directMailer.sendTestEmail(testEmail);
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      details: {
        messageId: result.messageId,
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

// Send alert email endpoint
app.post('/send-alert-email', async (req, res) => {
  try {
    const { recipient, alert } = req.body;
    
    if (!recipient || !recipient.email) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }
    
    if (!alert) {
      return res.status(400).json({ success: false, message: 'Alert data is required' });
    }
    
    console.log(`Sending direct alert email to ${recipient.email}`);
    
    // Send alert email
    const result = await directMailer.sendAlertEmail(recipient, alert);
    
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

// Bulk send alert emails endpoint
app.post('/send-bulk-alerts', async (req, res) => {
  try {
    const { recipients, alert } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, message: 'Recipients list is required' });
    }
    
    if (!alert) {
      return res.status(400).json({ success: false, message: 'Alert data is required' });
    }
    
    console.log(`Sending bulk alert emails to ${recipients.length} recipients`);
    
    // Respond immediately to client
    res.json({
      success: true,
      message: `Processing ${recipients.length} emails in the background`,
      alertId: alert.id
    });
    
    // Process emails in the background
    (async () => {
      const results = {
        success: [],
        failed: []
      };
      
      // Process each recipient
      for (const recipient of recipients) {
        try {
          if (!recipient.email) {
            console.error('Recipient missing email address');
            results.failed.push({
              email: 'unknown',
              error: 'Missing email address'
            });
            continue;
          }
          
          // Send alert email
          const result = await directMailer.sendAlertEmail(recipient, alert);
          
          // Log success
          results.success.push({
            email: recipient.email,
            messageId: result.messageId
          });
        } catch (error) {
          console.error(`Failed to send email to ${recipient.email}:`, error);
          
          // Log failure
          results.failed.push({
            email: recipient.email || 'unknown',
            error: error.message
          });
        }
      }
      
      // Log final results
      console.log(`Email sending complete: ${results.success.length} sent, ${results.failed.length} failed`);
    })().catch(error => {
      console.error('Background email processing error:', error);
    });
  } catch (error) {
    console.error('Error in bulk email alert API:', error);
    
    // If we haven't sent the response yet
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to process bulk email alert request',
        error: error.message
      });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Direct Email Server running on port ${PORT}`);
  console.log(`Test the email server: http://localhost:${PORT}/send-test-email`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
