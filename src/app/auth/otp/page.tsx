
"use client"; // Required because useSearchParams is a client hook

import { OTPForm } from "@/components/auth/OTPForm";
import { Suspense } from 'react';
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

function OTPSuspenseWrapper() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background">
       <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Logo />
      </div>
      <OTPForm />
    </main>
  );
}

export default function OTPPage() {
  return (
    // Suspense is required by Next.js when using useSearchParams in a page component
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading OTP form...</div>}>
      <OTPSuspenseWrapper />
    </Suspense>
  );
}
