
"use client"; // Required because useSearchParams is a client hook

import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth/storage";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

function LoginSuspenseWrapper() {
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    if (isLoggedIn()) {
      router.replace("/dashboard");
    }
  }, [router]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
       <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Logo />
      </div>
      <LoginForm />
    </main>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading login form...</div>}>
      <LoginSuspenseWrapper />
    </Suspense>
  );
}
