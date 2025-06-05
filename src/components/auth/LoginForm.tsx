
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
import { comparePasswordSync } from "@/lib/auth/password"; 
import { getUserByEmail, setLoggedIn, addUser } from "@/lib/auth/storage";
import type { User } from "@/lib/auth/storage";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setSuccessMessage("Account verified successfully! Please log in.");
    }
     if (searchParams.get("registered") === "true") {
      setSuccessMessage("Registration successful! Please log in.");
    }
  }, [searchParams]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const user = getUserByEmail(data.email); // Email comparison is now plain text

    if (!user) {
      setError("User not found. Please check your email or sign up.");
      setIsLoading(false);
      return;
    }

    if (!user.verified) {
      setError("Account not verified. Please check your email for OTP or sign up again.");
      setIsLoading(false);
      return;
    }
    
    if (user.provider === 'google') {
        setLoggedIn(true, data.email); 
        router.push("/dashboard");
        setIsLoading(false);
        return;
    }

    if (!user.hashedPassword) {
        setError("User account is incomplete (no password stored). Please contact support or try signing up again.");
        setIsLoading(false);
        return;
    }

    const isPasswordMatch = comparePasswordSync(data.password, user.hashedPassword);

    if (isPasswordMatch) {
      setLoggedIn(true, data.email); 
      router.push("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError(null);
    
    const plainMockEmail = "google.user."+ Date.now().toString(36).substring(2, 9) +"@example.com";
    const plainMockFullName = "Google User";
    const plainMockPhone = "0000000000"; // Example phone

    const mockUser: User = {
      id: 'google-' + Date.now().toString(),
      fullName: plainMockFullName, // Stored as plain text
      email: plainMockEmail,       // Stored as plain text
      phone: plainMockPhone,       // Stored as plain text
      verified: true,
      provider: 'google',
      // No hashedPassword for Google mock users
    };
    
    try {
        // Check if user with this email already exists (plain text check)
        const existingUser = getUserByEmail(plainMockEmail);
        if (existingUser && existingUser.provider === 'google') {
             // If Google user exists, just log them in
            setLoggedIn(true, plainMockEmail);
            router.push("/dashboard?googlesignin=true&existing=true");
        } else if (existingUser && existingUser.provider !== 'google') {
            setError("This mock Google email is already registered with a non-Google account. Try again or log in normally.");
        } else {
            addUser(mockUser); // Adds the new Google user (with plain text details)
            setLoggedIn(true, plainMockEmail); 
            router.push("/dashboard?googlesignin=true");
        }
    } catch (e: any) {
        setError(e.message || "Mock Google Sign-In failed.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="items-center">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-center">Welcome Back!</CardTitle>
        <CardDescription className="text-md sm:text-lg text-center">Log in to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Login Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert variant="default" className="mb-4 bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} disabled={isLoading} />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
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
                  size="icon" 
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full text-md sm:text-lg py-2.5 sm:py-3" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Log In
          </Button>
        </form>
        <div className="mt-4 relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4 text-sm sm:text-base py-2.5 sm:py-3" onClick={handleGoogleSignIn} disabled={isLoading}>
          {isLoading && !form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
             <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.02C17.38 19.02 15.48 20 12.48 20c-4.73 0-8.55-3.82-8.55-8.5s3.82-8.5 8.55-8.5c2.66 0 4.31 1.08 5.52 2.18l2.77-2.77C18.96 1.19 16.25 0 12.48 0C5.88 0 0 5.88 0 12.48s5.88 12.48 12.48 12.48c7.25 0 12.09-4.76 12.09-12.25 0-.76-.08-1.49-.2-2.24h-11.9z"></path></svg>
          )}
          Google (Mock)
        </Button>

      </CardContent>
      <CardFooter className="flex flex-col items-center text-sm">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
