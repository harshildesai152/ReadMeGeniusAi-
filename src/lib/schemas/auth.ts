import { z } from 'zod';

export const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }).regex(/^\+?[0-9\s-()]+$/, { message: "Invalid phone number format."}),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"], // path of error
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }).regex(/^\d{6}$/, { message: "OTP must be numeric."}),
});

export type OTPFormData = z.infer<typeof otpSchema>;
