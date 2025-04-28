/**
 * Gmail Test Script
 * This script tests sending emails directly using nodemailer with Gmail
 */

// Import nodemailer
const nodemailer = require('nodemailer');

// Email credentials
const EMAIL_USER = 'menduhimanth032@gmail.com';
const EMAIL_PASS = 'dpfk fqcs etxe ceol';
const TEST_EMAIL = 'menduhimanth22@ifheindia.org';

// Create the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
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
  } else {
    console.log('✅ Gmail connection verified successfully!');

    // Send a test email
    sendTestEmail();
  }
});

// Function to send a test email
async function sendTestEmail() {
  try {
    console.log(`Sending test email to ${TEST_EMAIL}...`);

    // Create email options
    const mailOptions = {
      from: `"Disaster Management System" <${EMAIL_USER}>`,
      to: TEST_EMAIL,
      subject: 'Test Email from Disaster Management System',
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
  } catch (error) {
    console.error('Failed to send test email:', error);
  }
}
