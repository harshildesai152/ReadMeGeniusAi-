
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { otpSchema, type OTPFormData } from "@/lib/schemas/auth";
import { getPendingOTP, getUserByEmail, updateUser, clearPendingOTP, setPendingOTP } from "@/lib/auth/storage";
import type { User } from "@/lib/auth/storage";
import { generateOTPAndSendEmail } from "@/lib/auth/otp"; // Updated import


export function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery));
      setInfoMessage(`An OTP has been sent to ${decodeURIComponent(emailFromQuery)}. (Using Ethereal for demo - check server console for email preview link & OTP).`);
    } else {
      setError("Email not provided for OTP verification.");
    }
  }, [searchParams, router]);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: OTPFormData) => {
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    if (!email) {
      setError("Email not available for verification.");
      setIsLoading(false);
      return;
    }

    const pendingOtpData = getPendingOTP();

    if (!pendingOtpData || pendingOtpData.email.toLowerCase() !== email.toLowerCase()) {
      setError("No pending OTP found for this email or OTP might have expired. Please try signing up again or resend OTP.");
      setIsLoading(false);
      return;
    }

    if (pendingOtpData.otp === data.otp) {
      const user = getUserByEmail(email);
      if (user) {
        const updatedUser: User = { ...user, verified: true };
        updateUser(updatedUser);
        clearPendingOTP();
        router.push("/auth/login?verified=true");
      } else {
        setError("User not found. Please try signing up again.");
      }
    } else {
      setError("Invalid OTP. Please try again.");
    }
    setIsLoading(false);
  };
  
  const handleResendOtp = async () => {
    if (email) {
        setIsLoading(true);
        setError(null);
        try {
            const newOtp = await generateOTPAndSendEmail(email); 
            setPendingOTP(email, newOtp); 
            setInfoMessage(`A new OTP has been sent to ${email}. (Check Ethereal email preview link & OTP in server console).`);
        } catch (e: any) {
            console.error("Resend OTP Error:", e);
            setError("Failed to resend OTP. Please try again shortly.");
        } finally {
            setIsLoading(false);
        }
    } else {
        setError("Email not available to resend OTP.");
        setInfoMessage(null);
    }
  };


  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Enter OTP</CardTitle>
        <CardDescription>
          An OTP has been sent to your email address: <strong>{email || "loading..."}</strong>. 
          Please check your inbox and enter it below.
          (For this demo, emails are sent via Ethereal. Check your server console for the email preview link and the OTP itself).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>OTP Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {infoMessage && (
            <Alert variant="default" className="mb-4 bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>{infoMessage}</AlertDescription>
            </Alert>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="otp">One-Time Password (6 digits)</Label>
            <Input 
              id="otp" 
              {...form.register("otp")} 
              disabled={isLoading || !email}
              maxLength={6}
              autoComplete="one-time-code"
            />
            {form.formState.errors.otp && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.otp.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !email}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verify OTP
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center text-sm">
         <Button variant="link" onClick={handleResendOtp} disabled={isLoading || !email}>
            Resend OTP
        </Button>
      </CardFooter>
    </Card>
  );
}
