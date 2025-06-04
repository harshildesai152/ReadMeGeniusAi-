"use client"; // Required because useSearchParams is a client hook

import { OTPForm } from "@/components/auth/OTPForm";
import { Suspense } from 'react';
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

function OTPSuspenseWrapper() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
       <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="absolute top-6 left-6">
        <Logo />
      </div>
      <OTPForm />
    </main>
  );
}

export default function OTPPage() {
  return (
    // Suspense is required by Next.js when using useSearchParams in a page component
    <Suspense fallback={<div>Loading OTP form...</div>}>
      <OTPSuspenseWrapper />
    </Suspense>
  );
}
