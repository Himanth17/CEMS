/**
 * Email Service for College Event Management System
 * This service handles sending emails for various events in the application
 */

// Email Service Configuration
const EmailService = {
  config: {
    apiUrl: 'http://localhost:3001/api',
    useRealEmails: true,
    emailServerRunning: false
  },

  /**
   * Initialize the email service
   * @returns {Promise} - Promise that resolves when the service is initialized
   */
  init: async function() {
    try {
      // Check if the email server is running
      const response = await fetch(`${this.config.apiUrl}/health`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Email server status:', data);
        this.config.emailServerRunning = true;
        return true;
      } else {
        console.warn('Email server is not running. Email notifications will not be sent.');
        this.config.emailServerRunning = false;
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.config.emailServerRunning = false;
      return false;
    }
  },

  /**
   * Send an event confirmation email
   * @param {Object} eventData - Event data
   * @param {Object} recipient - Recipient data
   * @returns {Promise} - Promise that resolves with the email result
   */
  sendEventConfirmation: async function(eventData, recipient) {
    if (!this.config.emailServerRunning) {
      console.warn('Email server is not running. Skipping event confirmation email.');
      return { success: false, message: 'Email server is not running' };
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/send-event-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: recipient,
          event: eventData
        })
      });

      const data = await response.json();
      console.log('Event confirmation email result:', data);
      return data;
    } catch (error) {
      console.error('Failed to send event confirmation email:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send an event update email
   * @param {Object} eventData - Event data
   * @param {Object} recipient - Recipient data
   * @returns {Promise} - Promise that resolves with the email result
   */
  sendEventUpdate: async function(eventData, recipient) {
    if (!this.config.emailServerRunning) {
      console.warn('Email server is not running. Skipping event update email.');
      return { success: false, message: 'Email server is not running' };
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/send-event-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: recipient,
          event: eventData
        })
      });

      const data = await response.json();
      console.log('Event update email result:', data);
      return data;
    } catch (error) {
      console.error('Failed to send event update email:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send an event reminder email
   * @param {Object} eventData - Event data
   * @param {Object|Array} recipients - Recipient data or array of recipients
   * @returns {Promise} - Promise that resolves with the email result
   */
  sendEventReminder: async function(eventData, recipients) {
    if (!this.config.emailServerRunning) {
      console.warn('Email server is not running. Skipping event reminder email.');
      return { success: false, message: 'Email server is not running' };
    }

    // If recipients is a single object, convert it to an array
    if (!Array.isArray(recipients)) {
      recipients = [recipients];
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/send-event-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients: recipients,
          event: eventData
        })
      });

      const data = await response.json();
      console.log('Event reminder email result:', data);
      return data;
    } catch (error) {
      console.error('Failed to send event reminder email:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send an event cancellation email
   * @param {Object} eventData - Event data
   * @param {Object|Array} recipients - Recipient data or array of recipients
   * @returns {Promise} - Promise that resolves with the email result
   */
  sendEventCancellation: async function(eventData, recipients) {
    if (!this.config.emailServerRunning) {
      console.warn('Email server is not running. Skipping event cancellation email.');
      return { success: false, message: 'Email server is not running' };
    }

    // If recipients is a single object, convert it to an array
    if (!Array.isArray(recipients)) {
      recipients = [recipients];
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/send-event-cancellation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipients: recipients,
          event: eventData
        })
      });

      const data = await response.json();
      console.log('Event cancellation email result:', data);
      return data;
    } catch (error) {
      console.error('Failed to send event cancellation email:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send a test email
   * @param {string} email - Recipient email
   * @returns {Promise} - Promise that resolves with the email result
   */
  sendTestEmail: async function(email) {
    if (!this.config.emailServerRunning) {
      console.warn('Email server is not running. Skipping test email.');
      return { success: false, message: 'Email server is not running' };
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/test-email?email=${encodeURIComponent(email)}`, {
        method: 'GET'
      });

      const data = await response.json();
      console.log('Test email result:', data);
      return data;
    } catch (error) {
      console.error('Failed to send test email:', error);
      return { success: false, error: error.message };
    }
  }
};

// Export the EmailService object
window.EmailService = EmailService;
