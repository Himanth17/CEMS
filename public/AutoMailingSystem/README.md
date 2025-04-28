# Disaster Management System - Email Server

This is a simple Node.js server that handles sending email alerts for the Disaster Management System.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Gmail account (or other email service)
- For Gmail, you'll need to create an "App Password" (2FA must be enabled)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your email credentials

3. Start the server:
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

### Send Alert Emails
- **URL**: `/api/send-alert`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "recipients": [
      {
        "email": "user@example.com",
        "fullname": "John Doe"
      }
    ],
    "alert": {
      "id": "ALT-2023-001",
      "disasterType": "Earthquake",
      "severity": "high",
      "regions": "California, USA",
      "datetime": "2023-05-15 08:30:22",
      "message": "A strong earthquake has been detected. Please take necessary precautions.",
      "issuedBy": "Disaster Management System"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Sent 1 emails, failed 0 emails",
    "results": {
      "success": [
        {
          "email": "user@example.com",
          "messageId": "<message-id>"
        }
      ],
      "failed": []
    }
  }
  ```

### Health Check
- **URL**: `/api/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2023-05-15T08:30:22.000Z"
  }
  ```

## Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-Step Verification if not already enabled
3. Go to "Security" > "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Enter "Disaster Management System" as the name
6. Click "Generate"
7. Use the generated password in your `.env` file
