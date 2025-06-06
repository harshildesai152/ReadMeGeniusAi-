
// src/app/about/page.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogIn, UserPlus, LogOut, LayoutDashboard, Home, Info, Rocket, Users, Lightbulb, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isLoggedIn, setLoggedIn } from '@/lib/auth/storage';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function AboutPage() {
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
      <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 md:p-12 lg:p-24 bg-background animate-pulse">
        <div className="container mx-auto flex flex-col items-center gap-8 sm:gap-12 w-full max-w-3xl">
          {/* Header Skeleton */}
          <header className="text-center w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-7 sm:h-8 w-7 sm:w-8 bg-muted rounded-full"></div>
              <div className="h-6 sm:h-7 w-20 sm:w-24 bg-muted rounded-md"></div>
              <div className="h-6 sm:h-7 w-16 sm:w-20 bg-muted rounded-md"></div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="h-8 sm:h-10 w-8 sm:w-10 bg-muted rounded-md"></div>
              <div className="h-8 sm:h-10 w-20 sm:w-24 bg-muted rounded-md"></div>
              <div className="h-8 sm:h-10 w-8 sm:w-10 bg-muted rounded-full"></div>
            </div>
          </header>
          {/* Card Skeleton */}
          <div className="w-full max-w-3xl space-y-6 sm:space-y-8 mt-6 sm:mt-8">
            <div className="bg-card shadow-xl rounded-lg p-4 sm:p-6 md:p-8">
              <div className="h-8 sm:h-10 w-1/2 mx-auto bg-muted rounded-md mb-4 sm:mb-6"></div> {/* Title */}
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded-md"></div>
                <div className="h-4 w-5/6 bg-muted rounded-md"></div>
                <div className="h-4 w-full bg-muted rounded-md mt-3"></div>
                <div className="h-4 w-4/6 bg-muted rounded-md"></div>
                <div className="h-6 w-1/3 bg-muted rounded-md mt-5 mb-2"></div> {/* Subtitle */}
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
              <Info className="h-7 w-7 sm:h-8 sm:h-8 md:h-9 md:w-9 text-primary" />
              About Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-6 text-sm sm:text-base leading-relaxed sm:leading-loose">
            <p className="text-muted-foreground">
              Welcome to <strong className="text-foreground">ReadMeGenius</strong> — your smart assistant for creating clean, professional, and ready-to-use README files in seconds.
            </p>
            <p className="text-muted-foreground">
              We built this tool to solve a common frustration many developers face: spending too much time writing or updating README files when they’d rather be writing code. Whether you're launching a new npm package, deploying a web app, or contributing to an open-source project, a strong README is critical — and we’re here to make it effortless.
            </p>
            <p className="text-muted-foreground">
              Our AI uses modern language models to automatically craft customized README files tailored to your project type, tech stack, and audience. It ensures clarity, consistency, and best practices — while saving hours of manual editing.
            </p>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-2 sm:mb-3 text-primary/90 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />
                Why We Built It
              </h2>
              <p className="text-muted-foreground">
                As developers ourselves, we often found README writing to be repetitive, overlooked, or rushed — especially under tight deadlines. So we created this tool to streamline the process and help developers showcase their work more effectively.
              </p>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-2 sm:mb-3 text-primary/90 flex items-center gap-2">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                Who It’s For
              </h2>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-muted-foreground pl-2 sm:pl-3">
                <li>Indie developers & startups launching new projects</li>
                <li>Open-source contributors maintaining libraries</li>
                <li>Teams looking to standardize documentation</li>
                <li>Anyone who wants to save time while keeping documentation sharp</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-2 sm:mb-3 text-primary/90 flex items-center gap-2">
                <Rocket className="h-5 w-5 sm:h-6 sm:w-6" />
                Continuously Improving
              </h2>
              <p className="text-muted-foreground">
                We’re always learning from your feedback and updating the tool to support new project templates, frameworks, and community standards. Your ideas make this better.
              </p>
            </div>
            
            <div className="text-center pt-4 sm:pt-6">
              <h3 className="text-md sm:text-lg font-semibold text-primary mb-2">
                🚀 Ready to generate your perfect README?
              </h3>
              <p className="text-muted-foreground mb-3">
                Try the tool today — and let us know what you think!
              </p>
              <Link href="/" passHref>
                <Button size="lg" className="text-sm sm:text-base px-6 py-3">
                  <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Get Started
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
