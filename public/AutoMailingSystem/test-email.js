// Load environment variables
require('dotenv').config();

// Import nodemailer
const nodemailer = require('nodemailer');

// Create test email function
async function testEmailSending() {
  console.log('Testing email functionality...');
  console.log('Email configuration:');
  console.log(`- Service: ${process.env.EMAIL_SERVICE}`);
  console.log(`- User: ${process.env.EMAIL_USER}`);
  console.log(`- From: ${process.env.EMAIL_FROM}`);
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  // Verify connection
  try {
    const verifyResult = await transporter.verify();
    console.log('SMTP connection verified successfully:', verifyResult);
  } catch (verifyError) {
    console.error('SMTP connection verification failed:', verifyError);
    console.log('\nPossible solutions:');
    console.log('1. Check if your email and password are correct');
    console.log('2. If using Gmail, ensure you\'re using an App Password, not your regular password');
    console.log('3. Make sure 2-Step Verification is enabled for your Google account');
    console.log('4. Check if less secure app access is enabled (though not recommended)');
    return;
  }
  
  // Test recipient email (replace with a real email for testing)
  const testRecipient = process.env.TEST_EMAIL || process.env.EMAIL_USER;
  
  // Email content
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: testRecipient,
    subject: 'Test Email from Disaster Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3498db; color: white; padding: 15px; text-align: center;">
          <h1>Test Email</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
          <p>Hello,</p>
          
          <p>This is a test email from the Disaster Management System.</p>
          <p>If you're receiving this email, it means the email sending functionality is working correctly.</p>
          
          <p>Time sent: ${new Date().toLocaleString()}</p>
          
          <p>Regards,<br>Disaster Management System</p>
        </div>
      </div>
    `
  };
  
  // Send test email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('\nTest email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('\nEmail was sent to:', testRecipient);
  } catch (error) {
    console.error('\nFailed to send test email:', error);
    console.log('\nPossible solutions:');
    console.log('1. Check your email service provider\'s sending limits');
    console.log('2. Verify that your account is not blocked or restricted');
    console.log('3. Check if your email provider requires additional configuration');
  }
}

// Run the test
testEmailSending().catch(console.error);
