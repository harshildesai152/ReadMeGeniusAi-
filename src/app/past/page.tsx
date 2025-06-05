
// src/app/past/page.tsx
"use client";

import { ReadmeGenerator } from "@/components/readme-generator";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, LogOut, LayoutDashboard, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isLoggedIn, setLoggedIn } from '@/lib/auth/storage';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function PastPage() {
  const [loggedInStatus, setLoggedInStatusState] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    setLoggedInStatusState(isLoggedIn());
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setLoggedInStatusState(isLoggedIn());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    setLoggedIn(false);
    setLoggedInStatusState(false);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/');
  };

  if (!mounted) {
     return (
      <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-12 bg-background">
        <div className="container mx-auto flex flex-col items-center gap-8 sm:gap-12">
           <header className="text-center w-full flex justify-between items-center">
             <div className="h-7 sm:h-8 w-auto bg-muted rounded-md animate-pulse"><Logo /></div>
             <div className="h-8 sm:h-10 w-20 sm:w-24 bg-muted rounded-md animate-pulse"></div>
           </header>
           <p className="mt-2 sm:mt-3 text-md sm:text-lg text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-12 lg:p-24 bg-background">
      <div className="container mx-auto flex flex-col items-center gap-8 sm:gap-12">
        <header className="text-center w-full flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link href="/" passHref>
              <Button variant="outline" size="icon" title="Go to Home" className="h-8 w-8 sm:h-9 sm:w-9">
                <Home className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </Button>
            </Link>
            {loggedInStatus ? (
              <>
                <Link href="/dashboard" passHref>
                  <Button variant="outline" size="sm" className="px-2 sm:px-3">
                    <LayoutDashboard className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" /> 
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={handleLogout} className="px-2 sm:px-3">
                  <LogOut className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" /> 
                   <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" passHref>
                  <Button variant="outline" size="sm" className="px-2 sm:px-3">
                    <LogIn className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" /> 
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                </Link>
                <Link href="/auth/signup" passHref>
                  <Button variant="default" size="sm" className="px-2 sm:px-3">
                    <UserPlus className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" /> 
                    <span className="hidden sm:inline">Sign Up</span>
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle /> 
          </div>
        </header>
        <p className="mt-2 sm:mt-3 text-md sm:text-lg text-center text-muted-foreground">
          Generate a README from a GitHub URL, direct code upload (single or multiple files), or a textual prompt. Login required.
        </p>
        <ReadmeGenerator />
        <footer className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ReadMeGenius. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
