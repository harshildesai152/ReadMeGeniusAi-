
// src/app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ReadmeGenerator } from "@/components/readme-generator";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Files, FileText, LogIn, UserPlus, LogOut, LayoutDashboard, FileCode, Info } from 'lucide-react'; 
import { isLoggedIn, setLoggedIn } from '@/lib/auth/storage';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";


export default function HomePage() {
  const [loggedIn, setLoggedInStatus] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    setLoggedInStatus(isLoggedIn());
  }, []);
  
  // This effect ensures that if the login state changes (e.g. in another tab),
  // the component re-evaluates the login status.
  useEffect(() => {
    const handleStorageChange = () => {
      setLoggedInStatus(isLoggedIn());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const handleLogout = () => {
    setLoggedIn(false); // Clear from localStorage
    setLoggedInStatus(false); // Update local state
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/'); // Refresh or redirect to home
  };

  if (!mounted) {
    // Skeleton UI
    return (
      <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-12 lg:p-24 bg-background">
        <div className="container mx-auto flex flex-col items-center gap-8 sm:gap-12 w-full">
          {/* Header Skeleton */}
          <header className="text-center w-full flex justify-between items-center">
            {/* Logo Skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-7 sm:h-8 w-7 sm:w-8 bg-muted rounded-full animate-pulse"></div> {/* Sparkles icon */}
              <div className="h-6 sm:h-7 w-20 sm:w-24 md:w-28 bg-muted rounded-md animate-pulse"></div> {/* ReadMe */}
              <div className="h-6 sm:h-7 w-16 sm:w-20 md:w-24 bg-muted rounded-md animate-pulse"></div> {/* Genius */}
            </div>
            {/* Auth Buttons & Theme Toggle Skeleton */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="h-8 sm:h-10 w-20 sm:w-24 md:w-32 bg-muted rounded-md animate-pulse"></div> {/* Login/Dashboard Button */}
              <div className="h-8 sm:h-10 w-20 sm:w-24 md:w-28 bg-muted rounded-md animate-pulse"></div> {/* Signup/Logout Button */}
              <div className="h-8 sm:h-10 w-8 sm:w-10 bg-muted rounded-full animate-pulse"></div> {/* ThemeToggle */}
            </div>
          </header>

          {/* Subtitle Skeleton */}
          <div className="h-5 sm:h-6 w-4/5 md:w-1/2 lg:w-2/5 bg-muted rounded-md animate-pulse mt-2 sm:mt-3"></div>

          {/* ReadmeGenerator Card Skeleton */}
          <div className="w-full max-w-3xl space-y-6 sm:space-y-8 mt-6 sm:mt-8">
            <div className="bg-card shadow-xl rounded-lg p-4 sm:p-6 md:p-8 animate-pulse">
              {/* Card Header Skeleton */}
              <div className="h-7 sm:h-8 w-3/4 mx-auto bg-muted rounded-md mb-2"></div> {/* Title */}
              <div className="h-4 sm:h-4 w-full mx-auto bg-muted rounded-md mb-4 sm:mb-6"></div> {/* Description */}
              
              {/* RadioGroup Skeleton */}
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="h-10 sm:h-12 bg-muted rounded-md"></div>
                <div className="h-10 sm:h-12 bg-muted rounded-md"></div>
                <div className="h-10 sm:h-12 bg-muted rounded-md"></div>
              </div>
              
              {/* Input Area Skeleton (e.g., for URL/Textarea) */}
              <div className="h-20 sm:h-24 bg-muted rounded-md mb-4 sm:mb-6"></div>
              
              {/* Generate Button Skeleton */}
              <div className="h-10 sm:h-12 bg-muted rounded-md"></div>
            </div>
          </div>

          {/* Footer Skeleton */}
          <footer className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground w-full">
            <div className="mb-3 sm:mb-4">
              <div className="h-4 sm:h-5 w-1/2 sm:w-1/3 mx-auto bg-muted rounded-md mb-2"></div> {/* Explore other tools text */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-2">
                  <div className="h-9 sm:h-10 w-full sm:w-56 bg-muted rounded-md"></div> {/* Button 1 */}
                  <div className="h-9 sm:h-10 w-full sm:w-56 bg-muted rounded-md"></div> {/* Button 2 */}
                  <div className="h-9 sm:h-10 w-full sm:w-56 bg-muted rounded-md"></div> {/* Button 3 */}
                  <div className="h-9 sm:h-10 w-full sm:w-56 bg-muted rounded-md"></div> {/* Button 4 for About Us */}
              </div>
            </div>
            <div className="h-3 sm:h-4 w-2/3 sm:w-1/2 mx-auto bg-muted rounded-md mb-1 mt-4 sm:mt-6"></div> {/* Copyright */}
            <div className="h-3 sm:h-4 w-1/2 sm:w-1/3 mx-auto bg-muted rounded-md"></div> {/* Powered by AI magic */}
          </footer>
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
            {loggedIn ? (
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
          Your AI-powered assistant for creating stunning README files instantly.
        </p>
        <ReadmeGenerator />
         <footer className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground w-full">
          <div className="mb-3 sm:mb-4">
            <p className="font-semibold text-sm sm:text-base">Explore other tools:</p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 mt-2">
                <Link href="/past" passHref>
                  <Button variant="outline" size="sm" className="bg-secondary hover:bg-muted w-full sm:w-auto text-xs sm:text-sm">
                    <FileText className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    README from Past Link/Code
                  </Button>
                </Link>
                <Link href="/past-files" passHref>
                   <Button variant="outline" size="sm" className="bg-secondary hover:bg-muted w-full sm:w-auto text-xs sm:text-sm">
                    <Files className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" /> 
                    Past Files Inventory & Gen
                  </Button>
                </Link>
                 <Link href="/explain-code" passHref>
                   <Button variant="outline" size="sm" className="bg-secondary hover:bg-muted w-full sm:w-auto text-xs sm:text-sm">
                    <FileCode className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    Explain My Code
                  </Button>
                </Link>
                <Link href="/about" passHref>
                   <Button variant="outline" size="sm" className="bg-secondary hover:bg-muted w-full sm:w-auto text-xs sm:text-sm">
                    <Info className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                    About Us
                  </Button>
                </Link>
            </div>
          </div>
          <p>&copy; {new Date().getFullYear()} ReadMeGenius. All rights reserved.</p>
          <p className="mt-1">Powered by AI magic ✨</p>
        </footer>
      </div>
    </main>
  );
}
