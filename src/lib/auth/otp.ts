
import { sendOtpEmail } from '@/lib/email';

export async function generateOTPAndSendEmail(email: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Send the OTP via email
  await sendOtpEmail(email, otp);
  
  // Log to console for easy access during development with Ethereal
  console.log(`OTP for ${email}: ${otp} (Email sent via Ethereal, check console for preview URL)`);
  
  return otp;
}
