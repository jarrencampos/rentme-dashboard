export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).send({ message: 'Only POST requests allowed' });
    }

    const { subject, message, to } = req.body;

    // Send email using nodemailer
    const nodemailer = require('nodemailer');

    // Create transporter with custom SMTP settings (HostGator or any other provider)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,  // Custom SMTP server (e.g., smtp.yourdomain.com)
      port: process.env.SMTP_PORT,  // Typically 465 (SSL) or 587 (TLS)
      secure: process.env.SMTP_SECURE === 'true',  // Use SSL/TLS if set to true
      auth: {
        user: process.env.SMTP_USER,  // Your email address (e.g., you@yourdomain.com)
        pass: process.env.SMTP_PASS,  // Your email password or app-specific password
      },
    });

    // Use provided 'to' address, or ADMIN_EMAIL env var, or default to support
    const recipientEmail = to || process.env.ADMIN_EMAIL || 'support@rentme.co';

    try {
      // Send the email using the transporter
      await transporter.sendMail({
        from: `"RentMe Notifications" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: subject,
        text: message,
      });

      // Return success response
      return res.status(200).json({ message: 'Email sent!' });
    } catch (err) {
      // Return error response if email sending fails
      console.error(err);
      return res.status(500).json({ message: 'Failed to send email' });
    }
  }
  