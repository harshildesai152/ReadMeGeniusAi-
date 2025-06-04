
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { isLoggedIn, setLoggedIn, getUserByEmail, getCurrentUserEmail } from '@/lib/auth/storage';
import type { User } from '@/lib/auth/storage';
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { Loader2, Home, UserCircle2, Mail, Phone, CheckCircle, LogOutIcon } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/auth/login');
    } else {
      const userEmail = getCurrentUserEmail();
      if (userEmail) {
        const currentUser = getUserByEmail(userEmail);
        setUser(currentUser || null);
      }
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    setLoggedIn(false);
    router.replace('/auth/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-6 text-xl text-muted-foreground">Loading Dashboard...</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center space-x-3">
            <Button onClick={handleGoHome} variant="ghost" size="icon" title="Go to Home">
              <Home className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOutIcon className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto max-w-screen-lg">
          <Card className="w-full shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="bg-card-foreground/5 p-6 sm:p-8 border-b">
              <CardTitle className="text-3xl font-bold text-foreground">
                Welcome, {user?.fullName?.split(' ')[0] || user?.email || 'User'}!
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                This is your personal dashboard. Manage your account and explore features.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-8">
              {user && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-primary mb-4 border-b pb-2">Your Profile Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="flex items-center space-x-3">
                      <UserCircle2 className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                        <p className="text-md font-semibold text-foreground">{user.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                        <p className="text-md font-semibold text-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                        <p className="text-md font-semibold text-foreground">{user.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className={`h-6 w-6 ${user.verified ? 'text-green-500' : 'text-red-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                        <p className={`text-md font-semibold ${user.verified ? 'text-green-600' : 'text-red-600'}`}>
                          {user.verified ? 'Verified' : 'Not Verified'}
                        </p>
                      </div>
                    </div>
                    {user.provider && (
                       <div className="flex items-center space-x-3 md:col-span-2">
                         <svg role="img" viewBox="0 0 24 24" className="mr-0 h-6 w-6 text-muted-foreground"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.02C17.38 19.02 15.48 20 12.48 20c-4.73 0-8.55-3.82-8.55-8.5s3.82-8.5 8.55-8.5c2.66 0 4.31 1.08 5.52 2.18l2.77-2.77C18.96 1.19 16.25 0 12.48 0C5.88 0 0 5.88 0 12.48s5.88 12.48 12.48 12.48c7.25 0 12.09-4.76 12.09-12.25 0-.76-.08-1.49-.2-2.24h-11.9z"></path></svg>
                         <div>
                           <p className="text-sm font-medium text-muted-foreground">Sign-in Method</p>
                           <p className="text-md font-semibold text-foreground capitalize">{user.provider}</p>
                         </div>
                       </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-6 border-t">
                <h3 className="text-xl font-semibold text-primary mb-3">Application Content</h3>
                <p className="text-muted-foreground">
                  This is where you can add your application-specific content and features for logged-in users.
                  For example, you could display user projects, settings, or other personalized information.
                </p>
                <Button className="mt-4" onClick={() => router.push('/')}>Explore Features</Button>
              </div>
            </CardContent>
            <CardFooter className="p-6 sm:p-8 bg-card-foreground/5 border-t">
                <p className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} ReadMeGenius. All rights reserved.
                </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
