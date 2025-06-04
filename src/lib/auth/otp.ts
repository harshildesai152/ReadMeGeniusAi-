export function generateOTP(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // As per spec, log to console. In a real app, this would be sent via SMS/email.
  console.log(`Generated OTP for user: ${otp}`);
  return otp;
}
