
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isLoggedIn, setLoggedIn, getUserByEmail, getCurrentUserEmail } from '@/lib/auth/storage';
import type { User } from '@/lib/auth/storage';
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { Loader2, Home } from 'lucide-react'; // Added Home icon

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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Dashboard...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 sm:p-12 md:p-24 bg-background">
      <div className="absolute top-6 right-6 flex items-center space-x-2">
        <Button onClick={handleGoHome} variant="outline" size="icon" title="Go to Home">
          <Home className="h-4 w-4" />
        </Button>
        <ThemeToggle />
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>
      <div className="absolute top-6 left-6">
         <Logo />
      </div>
      
      <div className="container mx-auto flex flex-col items-center gap-12 mt-16">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Dashboard</CardTitle>
            <CardDescription>Welcome to your dashboard, {user?.fullName || user?.email || 'User'}!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">This is a protected area. Only logged-in users can see this.</p>
            {user && (
              <div className="p-4 border rounded-md bg-muted/50">
                <h3 className="font-semibold text-primary">Your Details (from localStorage mock):</h3>
                <p><strong>Name:</strong> {user.fullName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Verified:</strong> {user.verified ? 'Yes' : 'No'}</p>
                {user.provider && <p><strong>Sign-in Method:</strong> {user.provider}</p>}
              </div>
            )}
            <p>You can now add your application specific content here.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
