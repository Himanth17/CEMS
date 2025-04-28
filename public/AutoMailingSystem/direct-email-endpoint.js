/**
 * Direct Email Endpoint
 * A simple endpoint for sending emails directly from the browser
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
const PORT = process.env.PORT || 3000;

// Configure middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Direct email sending endpoint
app.post('/api/send-direct-email', async (req, res) => {
  try {
    console.log('Received direct email request');
    
    // Get email data from request
    const { to, from, subject, html, user, pass, emailId } = req.body;
    
    // Validate required fields
    if (!to || !subject || !html || !user || !pass) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    console.log(`Sending email to ${to} with subject: ${subject}`);
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user,
        pass: pass
      }
    });
    
    // Create email options
    const mailOptions = {
      from: from || `"Disaster Management System" <${user}>`,
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
      emailId: emailId
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
  console.log(`Direct Email Endpoint running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
