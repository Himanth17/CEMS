/**
 * Direct Email Test
 * This script tests sending emails directly using nodemailer
 */

// Load environment variables
require('dotenv').config();

// Import nodemailer
const nodemailer = require('nodemailer');

// Print environment variables for debugging
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

// Create the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'menduhimanth032@gmail.com',
    pass: 'dpfk fqcs etxe ceol'
  }
});

// Verify the transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ EMAIL CONFIGURATION ERROR:', error);
  } else {
    console.log('✅ Email configuration is valid and ready to send messages');

    // Send a test email
    sendTestEmail();
  }
});

// Function to send a test email
async function sendTestEmail() {
  try {
    const recipient = 'menduhimanth22@ifheindia.org';

    console.log(`Sending test email to ${recipient}...`);

    // Create email options
    const mailOptions = {
      from: 'menduhimanth032@gmail.com',
      to: recipient,
      subject: 'Direct Email Test',
      text: 'This is a direct test email sent at ' + new Date().toISOString(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
          <div style="background-color: #2ecc71; color: white; padding: 15px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Direct Email Test</h1>
            <p style="margin: 10px 0 0 0;">Testing Gmail Connection</p>
          </div>
          <div style="padding: 20px; background-color: #ffffff;">
            <p>This is a test email to verify that the Gmail connection is working properly.</p>
            <p>Sent at: ${new Date().toISOString()}</p>
          </div>
        </div>
      `
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('Failed to send test email:', error);
  }
}
