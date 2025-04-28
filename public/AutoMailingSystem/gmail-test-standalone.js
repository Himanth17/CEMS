/**
 * Gmail Test Standalone
 * A standalone script to test Gmail sending with detailed logging
 */

// Import nodemailer
const nodemailer = require('nodemailer');

// Email credentials - hardcoded for testing
const EMAIL_USER = 'menduhimanth032@gmail.com';
const EMAIL_PASS = 'kjev tepu aklo xlsa';
const TEST_EMAIL = 'menduhimanth22@ifheindia.org';

console.log('=== Gmail Test Standalone ===');
console.log('Testing Gmail sending with the following credentials:');
console.log('- Email User:', EMAIL_USER);
console.log('- Email Pass length:', EMAIL_PASS.length);
console.log('- Test Recipient:', TEST_EMAIL);
console.log('');

// Create the transporter with detailed logging
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
console.log('Verifying transporter...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ EMAIL CONFIGURATION ERROR:', error);
    console.log('\nPossible solutions:');
    console.log('1. Check if your email and password are correct');
    console.log('2. For Gmail, you MUST use an App Password, not your regular password');
    console.log('   - Go to https://myaccount.google.com/apppasswords to generate one');
    console.log('3. Make sure 2-Step Verification is enabled for your Google account');
    console.log('4. Check if your Gmail account has any security restrictions');
    console.log('5. Make sure "Less secure app access" is turned ON in your Google account');
    process.exit(1);
  } else {
    console.log('✅ Gmail connection verified successfully!');
    sendTestEmail();
  }
});

// Function to send a test email
async function sendTestEmail() {
  try {
    console.log(`\nSending test email to ${TEST_EMAIL}...`);

    // Create email options
    const mailOptions = {
      from: `"Disaster Management System Test" <${EMAIL_USER}>`,
      to: TEST_EMAIL,
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

    console.log('Mail options:', JSON.stringify(mailOptions, null, 2));

    // Send the email
    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);

    console.log('\n✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\nPlease check your inbox at:', TEST_EMAIL);
  } catch (error) {
    console.error('\n❌ Failed to send test email:', error);
    console.log('\nError details:');
    console.log('- Name:', error.name);
    console.log('- Message:', error.message);
    console.log('- Code:', error.code);
    console.log('- Command:', error.command);

    if (error.code === 'EAUTH') {
      console.log('\nAuthentication error detected. This is likely due to:');
      console.log('1. Incorrect password');
      console.log('2. You need to use an App Password instead of your regular password');
      console.log('3. Your Google account has security settings that prevent this access');
      console.log('\nTo create an App Password:');
      console.log('1. Go to https://myaccount.google.com/security');
      console.log('2. Enable 2-Step Verification if not already enabled');
      console.log('3. Go to https://myaccount.google.com/apppasswords');
      console.log('4. Select "Mail" as the app and "Other" as the device');
      console.log('5. Enter "Disaster Management System" as the name');
      console.log('6. Click "Generate" and use the 16-character password');
    }

    if (error.code === 'ESOCKET') {
      console.log('\nConnection error detected. This could be due to:');
      console.log('1. Network issues');
      console.log('2. Firewall blocking the connection');
      console.log('3. Gmail servers are temporarily unavailable');
    }
  }
}
