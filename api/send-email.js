import { verifyAuth } from './lib/verify-auth.js';

export default async function handler(req, res) {
    // Set CORS headers
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://dashboard.rentme.co';
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).send({ message: 'Only POST requests allowed' });
    }

    const { subject, message, to, skipAuth } = req.body;

    // For signup emails (skipAuth === true), just validate required fields exist
    // For all other emails, require Firebase Auth
    if (skipAuth) {
      if (!subject || !message) {
        return res.status(400).json({ message: 'Missing required fields: subject, message' });
      }
    } else {
      try {
        await verifyAuth(req);
      } catch (authError) {
        return res.status(authError.status || 401).json({ message: authError.message });
      }
    }

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
