
"use server";

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create a test SMTP account for Ethereal
// This will generate temporary credentials each time the server starts
// In a production app, you'd use permanent credentials from environment variables
let testAccount: nodemailer.TestAccount | null = null;

async function getTestAccount() {
  if (!testAccount) {
    testAccount = await nodemailer.createTestAccount();
    console.log("Ethereal test account created:", testAccount);
    console.log("Preview emails at:", nodemailer.getTestMessageUrl({
      user: testAccount.user,
      pass: testAccount.pass,
      messageId: '<generated-message-id>' // Placeholder
    }).split('<generated-message-id>')[0] + " (append message ID from console log below)");
  }
  return testAccount;
}


export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  try {
    const account = await getTestAccount();

    const transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });

    const mailOptions: EmailOptions = {
      to,
      subject: 'Your OTP for ReadMeGenius',
      text: `Your One-Time Password is: ${otp}. It is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">ReadMeGenius - One-Time Password</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for verifying your account is:</p>
          <p style="font-size: 24px; font-weight: bold; color: #007BFF; letter-spacing: 2px; margin: 20px 0; text-align: center;">
            ${otp}
          </p>
          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>If you did not request this OTP, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 0.9em; color: #777;">
            Thank you for using ReadMeGenius!
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent: %s', info.messageId);
    // Log the Ethereal URL to preview the email
    console.log('Preview OTP Email URL: %s', nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.error('Error sending OTP email:', error);
    // In a real app, you might want to throw this error or handle it more gracefully
    // For this demo, we'll log it. The OTP will still be available in console via generateOTP.
  }
}
