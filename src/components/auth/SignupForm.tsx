"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signupSchema, type SignupFormData } from "@/lib/schemas/auth";
import { hashPasswordSync } from "@/lib/auth/password";
import { generateOTP } from "@/lib/auth/otp";
import { addUser, setPendingOTP, getUserByEmail } from "@/lib/auth/storage";
import type { User } from "@/lib/auth/storage";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (getUserByEmail(data.email)) {
        setError("An account with this email already exists.");
        setIsLoading(false);
        return;
      }

      const hashedPassword = hashPasswordSync(data.password);
      const otp = generateOTP(); // OTP is logged to console by this function

      const newUser: User = {
        id: Date.now().toString(), // Simple ID for mock
        fullName: data.fullName,
        email: data.email,
        hashedPassword: hashedPassword,
        phone: data.phone,
        verified: false,
        provider: 'email',
      };

      addUser(newUser);
      setPendingOTP(data.email, otp);

      // Navigate to OTP page, passing email as query param
      router.push(`/auth/otp?email=${encodeURIComponent(data.email)}`);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>Enter your details to sign up.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Signup Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...form.register("fullName")} disabled={isLoading} />
            {form.formState.errors.fullName && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.fullName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} disabled={isLoading} />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
           <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" {...form.register("phone")} disabled={isLoading} />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <div className="relative">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              {...form.register("password")} 
              disabled={isLoading}
              className="pr-10"
            />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...form.register("confirmPassword")}
              disabled={isLoading}
              className="pr-10"
            />
             <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign Up
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center text-sm">
        <p>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
