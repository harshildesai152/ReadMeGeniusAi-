
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
import { comparePasswordSync, hashPasswordSync } from "@/lib/auth/password"; // Added hashPasswordSync
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

    // getUserByEmail now iterates and compares hashes
    const user = getUserByEmail(data.email);

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
    
    // For Google users, we assume direct login if user object exists and is verified.
    // The email in cookie will be plain text from the mock user creation.
    if (user.provider === 'google') {
        setLoggedIn(true, data.email); // Use the plain email from login form for session cookie
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
      setLoggedIn(true, data.email); // Use the plain email from login form for session cookie
      router.push("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError(null);
    
    // The email for the mock user should be unique for this "session" to avoid collision
    // if the same mock user tries to "sign up" again via Google.
    // For storage, this plain email will be hashed by addUser.
    const plainMockEmail = "google.user."+ Date.now().toString(36).substring(2, 9) +"@example.com";
    const plainMockFullName = "Google User";
    const plainMockPhone = "0000000000";

    const mockUser: User = {
      id: 'google-' + Date.now().toString(),
      // Pass plain text here; addUser will hash them
      fullName: plainMockFullName,
      email: plainMockEmail, 
      phone: plainMockPhone,
      verified: true,
      provider: 'google',
      // No hashedPassword for Google mock users, direct login is assumed
    };
    
    try {
        addUser(mockUser); // addUser will now hash fullName, email, phone.
        setLoggedIn(true, plainMockEmail); // Use plain mock email for session cookie
        router.push("/dashboard?googlesignin=true");
    } catch (e: any) {
        // Check if it's the "email exists" error from addUser.
        // If getUserByEmail (which compares hashes) finds a user with this new mock email's hash,
        // it means there's an unlikely hash collision or the mock email wasn't unique enough.
        // More likely, if the plainMockEmail itself already led to an existing user (pre-hashing check in addUser).
        const existingUser = getUserByEmail(plainMockEmail);
        if (existingUser && existingUser.provider === 'google') {
            // If a Google user with this (plain) email already exists, log them in.
            setLoggedIn(true, plainMockEmail);
            router.push("/dashboard?googlesignin=true&existing=true");
        } else if (e.message && e.message.includes("User with this email already exists")) {
            setError("This mock Google email is already registered with a non-Google account. Try again or log in normally.");
        }
        else {
            setError(e.message || "Mock Google Sign-In failed.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl font-bold">Welcome Back!</CardTitle>
        <CardDescription className="text-md sm:text-lg">Log in to access your dashboard.</CardDescription>
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
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
        <Button variant="outline" className="w-full mt-4" onClick={handleGoogleSignIn} disabled={isLoading}>
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
