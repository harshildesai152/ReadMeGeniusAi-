
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
      // It's good practice to set a default 'from' address,
      // though Ethereal will use its own.
      // For a real provider, this would be your company's email.
      from: `"ReadMeGenius Support" <${account.user}>`, // Name part can be customized
    });

    const mailOptions: EmailOptions = {
      to, // This is correctly set to the user's signup email
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
          <h2 style="color: #007BFF;">ReadMeGenius - Account Verification</h2>
          <p>Hello,</p>
          <p>Thank you for signing up with ReadMeGenius! To complete your registration, please use the following One-Time Password (OTP):</p>
          <p style="font-size: 28px; font-weight: bold; color: #007BFF; letter-spacing: 3px; margin: 25px 0; text-align: center; border: 1px dashed #007BFF; padding: 10px; background-color: #f0f8ff;">
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

