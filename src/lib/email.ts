
"use server";

import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    console.error("🔴 Gmail credentials (GMAIL_USER, GMAIL_PASS) are not set in .env file.");
    console.log(`OTP for ${to} (Email not sent due to missing config): ${otp}`);
    // In a real production app, you might throw an error or return a more specific status.
    // For this demo, we'll just log and prevent sending.
    return; 
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser, // Use environment variable
        pass: gmailPass, // Use environment variable (App Password recommended)
      },
    });

    const mailOptions: EmailOptions = {
      from: `"ReadMeGenius Support" <${gmailUser}>`, // Use environment variable
      to,
      subject: 'Your ReadMeGenius OTP Verification Code',
      text: `
ReadMeGenius - Account Verification

Hello,

Thank you for signing up with ReadMeGenius! To complete your registration, please use the following One-Time Password (OTP):

${otp}

This OTP is valid for 5 minutes. Please enter it on the verification page to activate your account.

If you did not request this OTP, please ignore this email or contact our support if you have concerns.

Best regards,
The ReadMeGenius Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4285F4;">ReadMeGenius - Account Verification</h2>
          <p>Hello,</p>
          <p>Thank you for signing up with ReadMeGenius! To complete your registration, please use the following One-Time Password (OTP):</p>
          <p style="font-size: 28px; font-weight: bold; color: #4285F4; letter-spacing: 3px; margin: 25px 0; text-align: center; border: 1px dashed #4285F4; padding: 10px; background-color: #f0f8ff;">
            ${otp}
          </p>
          <p>This OTP is valid for <strong>5 minutes</strong>. Please enter it on the verification page to activate your account.</p>
          <p>If you did not request this OTP, please ignore this email or contact our support if you have concerns.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 0.9em; color: #777;">
            Best regards,<br />
            The ReadMeGenius Team
          </p>
        </div>
      `,
    };

    const info: SMTPTransport.SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent to %s: %s', to, info.messageId);
    // Add a link to Ethereal if using a test account (though with direct Gmail, this is less relevant)
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));


  } catch (error) {
    console.error('🔴 Error sending OTP email via Gmail:', error);
    // Log OTP for dev purposes if email fails, but don't let it crash the signup.
    console.log(`OTP for ${to} (Email sending failed): ${otp}`);
    // Consider more specific error handling based on the error type/code in a production app
    // For example, if (error.code === 'EAUTH') console.error('Authentication error with Gmail. Check credentials/App Password.')
  }
}
