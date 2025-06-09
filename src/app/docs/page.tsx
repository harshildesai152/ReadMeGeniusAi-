// src/app/docs/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogIn, UserPlus, LogOut, LayoutDashboard, Home, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isLoggedIn, setLoggedIn as setAuthLoggedIn } from '@/lib/auth/storage';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function DocsPage() {
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
    setAuthLoggedIn(false);
    setLoggedInStatusState(false);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/');
  };

  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-12 lg:p-24 bg-background animate-pulse">
        <div className="container mx-auto flex flex-col items-center gap-8 sm:gap-12 w-full max-w-3xl">
          <header className="text-center w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-7 sm:h-8 w-7 sm:w-8 bg-muted rounded-full"></div>
              <div className="h-6 sm:h-7 w-20 sm:w-24 bg-muted rounded-md"></div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="h-8 sm:h-10 w-8 sm:w-10 bg-muted rounded-md"></div>
              <div className="h-8 sm:h-10 w-20 sm:w-24 bg-muted rounded-md"></div>
              <div className="h-8 sm:h-10 w-8 sm:w-10 bg-muted rounded-full"></div>
            </div>
          </header>
          <div className="w-full max-w-3xl space-y-6 sm:space-y-8 mt-6 sm:mt-8">
            <div className="bg-card shadow-xl rounded-lg p-4 sm:p-6 md:p-8">
              <div className="h-8 sm:h-10 w-1/2 mx-auto bg-muted rounded-md mb-4 sm:mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded-md"></div>
                <div className="h-4 w-5/6 bg-muted rounded-md"></div>
              </div>
            </div>
          </div>
          <footer className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground w-full">
            <div className="h-4 sm:h-5 w-1/3 mx-auto bg-muted rounded-md"></div>
          </footer>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-12 lg:p-24 bg-background">
      <div className="container mx-auto flex flex-col items-center gap-8 sm:gap-12 w-full max-w-3xl">
        <header className="text-center w-full flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link href="/" passHref>
                <Button variant="outline" size="icon" title="Go to Home" className="h-8 w-8 sm:h-9 sm:w-9">
                    <Home className="h-3.5 sm:h-4 w-3.5 sm:h-4" />
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

        <Card className="w-full shadow-xl border hover:border-foreground transition-colors duration-200">
          <CardHeader className="items-center pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-center font-headline flex items-center gap-2 sm:gap-3">
              <BookOpen className="h-7 w-7 sm:h-8 sm:h-8 md:h-9 md:w-9 text-primary" />
              Documentation
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">Learn how to use ReadMeGenius effectively.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-6 text-sm sm:text-base leading-relaxed sm:leading-loose">
            <p className="text-center text-muted-foreground">
              Our comprehensive documentation is currently under development. We're working hard to provide you with detailed guides, API references, and tutorials.
            </p>
            <p className="text-center text-muted-foreground">
              In the meantime, if you have any questions, feel free to explore the application or reach out to our support team (once available).
            </p>
            <div className="text-center mt-6">
              <Link href="/" passHref>
                <Button>
                  Go Back Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ReadMeGenius. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
