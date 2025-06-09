
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
import { generateOTP } from "@/lib/auth/otp";


export function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery));
    } else {
      setError("Email not provided for OTP verification.");
      // Optionally redirect if email is missing
      // router.push('/auth/signup'); 
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

    if (!email) {
      setError("Email not available for verification.");
      setIsLoading(false);
      return;
    }

    const pendingOtpData = getPendingOTP();

    if (!pendingOtpData || pendingOtpData.email.toLowerCase() !== email.toLowerCase()) {
      setError("No pending OTP found for this email or OTP might have expired. Please try signing up again.");
      setIsLoading(false);
      return;
    }

    if (pendingOtpData.otp === data.otp) {
      const user = getUserByEmail(email);
      if (user) {
        const updatedUser: User = { ...user, verified: true };
        updateUser(updatedUser);
        clearPendingOTP();
        // Successfully verified, redirect to login
        router.push("/auth/login?verified=true");
      } else {
        setError("User not found. Please try signing up again.");
      }
    } else {
      setError("Invalid OTP. Please try again.");
    }
    setIsLoading(false);
  };
  
  const handleResendOtp = () => {
    if (email) {
        const newOtp = generateOTP(); // Logs to console
        setPendingOTP(email, newOtp); // Resets OTP with new expiry
        setError(`New OTP (mock: ${newOtp}) re-logged to console. Expiry refreshed.`);
    } else {
        setError("Email not available to resend OTP.");
    }
  };


  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Enter OTP</CardTitle>
        <CardDescription>
          An OTP has been sent to your console (for this demo) for email: <strong>{email || "loading..."}</strong>. Please enter it below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>OTP Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
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
            Resend OTP (Mock)
        </Button>
      </CardFooter>
    </Card>
  );
}
