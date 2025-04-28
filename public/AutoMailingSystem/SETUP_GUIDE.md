# Email Server Setup Guide

This guide will help you set up the email server for the Disaster Management System to send real emails.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Gmail account (or other email service)

## Step 1: Install Dependencies

Navigate to the server directory and install the required packages:

```bash
cd server
npm install
```

## Step 2: Configure Email Credentials

### For Gmail Users

1. **Enable 2-Step Verification**:
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification if not already enabled

2. **Create an App Password**:
   - Go to your Google Account settings
   - Navigate to Security > App passwords
   - Select "Mail" as the app and "Other" as the device
   - Enter "Disaster Management System" as the name
   - Click "Generate"
   - Copy the 16-character password that appears

3. **Update .env File**:
   - Copy `.env.example` to `.env`
   - Update the following values:
     ```
     EMAIL_SERVICE=gmail
     EMAIL_USER=your-gmail-address@gmail.com
     EMAIL_PASS=your-16-character-app-password
     EMAIL_FROM=Disaster Management System <your-gmail-address@gmail.com>
     TEST_EMAIL=recipient@example.com  # Email to use for testing
     ```

### For Other Email Providers

1. **Get SMTP Credentials**:
   - Obtain your email service's SMTP settings
   - Get your username and password

2. **Update .env File**:
   - Copy `.env.example` to `.env`
   - Update the values with your email provider's information

## Step 3: Test the Email Server

1. **Start the Server**:
   ```bash
   npm start
   ```

2. **Test Email Sending**:
   - Open a web browser
   - Navigate to `http://localhost:3000/api/test-email`
   - Check the console for logs
   - Check your email inbox for the test email

3. **Troubleshooting**:
   - If you don't receive the test email, check the server console for error messages
   - Verify your email credentials in the `.env` file
   - Make sure your email provider allows sending from third-party applications

## Step 4: Configure the Frontend

1. **Update Email Service Configuration**:
   - Open `js/email-service.js`
   - Make sure the `apiUrl` is set correctly:
     ```javascript
     config: {
         apiUrl: 'http://localhost:3000/api',
         useRealEmails: true
     }
     ```

2. **Test the Frontend**:
   - Start the frontend server
   - Register a user account with a valid email
   - Create an alert
   - Check the email logs page to see if emails were sent

## Common Issues and Solutions

### Email Not Sending

1. **Check Server Logs**:
   - Look for error messages in the server console
   - Verify the email configuration is correct

2. **Gmail Security Issues**:
   - Make sure 2-Step Verification is enabled
   - Verify you're using an App Password, not your regular password
   - Check if Google has blocked the sign-in attempt (check your Gmail inbox for security alerts)

3. **Connection Issues**:
   - Make sure your internet connection is working
   - Check if your firewall is blocking outgoing SMTP connections

### CORS Errors

If you see CORS errors in the browser console:

1. **Update CORS Configuration**:
   - In `.env`, add your frontend URL to `ALLOWED_ORIGINS`
   - Restart the server

### Rate Limiting

Email providers often have sending limits:

1. **Gmail Limits**:
   - Gmail has a limit of 500 emails per day for regular accounts
   - Consider using a service like SendGrid for higher volume

## Using a Production Email Service

For a production environment, consider using a dedicated email service:

1. **SendGrid**:
   - Create an account at sendgrid.com
   - Get an API key
   - Update the server code to use SendGrid

2. **Mailgun**:
   - Create an account at mailgun.com
   - Get API credentials
   - Update the server code to use Mailgun

## Security Considerations

1. **Protect Your Credentials**:
   - Never commit your `.env` file to version control
   - Use environment variables in production

2. **Rate Limiting**:
   - Implement rate limiting to prevent abuse
   - Monitor email sending activity

3. **Validation**:
   - Validate email addresses before sending
   - Sanitize all user input
