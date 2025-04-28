/**
 * Simple Gmail Test
 * A minimal script to test Gmail sending with the most basic configuration
 */

// Load environment variables
require('dotenv').config();

// Import nodemailer
const nodemailer = require('nodemailer');

// Print environment variables for debugging
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

// Create the simplest possible transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email data
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'menduhimanth22@ifheindia.org',
  subject: 'Simple Gmail Test',
  text: 'This is a simple test email sent at ' + new Date().toISOString(),
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
      <div style="background-color: #2ecc71; color: white; padding: 15px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Simple Gmail Test</h1>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <p>This is a simple test email sent at ${new Date().toISOString()}</p>
        <p>If you're seeing this, the basic Gmail configuration is working!</p>
      </div>
    </div>
  `
};

// Send the email
console.log('Attempting to send email...');
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('ERROR SENDING EMAIL:', error);

    // Print detailed error information
    if (error.code) console.error('Error code:', error.code);
    if (error.command) console.error('Error command:', error.command);
    if (error.response) console.error('Error response:', error.response);

    console.log('\nPossible solutions:');
    console.log('1. Check if your email and password are correct');
    console.log('2. For Gmail, you MUST use an App Password, not your regular password');
    console.log('   - Go to https://myaccount.google.com/apppasswords to generate one');
    console.log('3. Make sure 2-Step Verification is enabled for your Google account');
    console.log('4. Check if your Gmail account has any security restrictions');
    console.log('5. Try using a different email account');
  } else {
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  }
});
