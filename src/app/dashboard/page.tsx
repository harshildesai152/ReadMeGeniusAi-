
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isLoggedIn, setLoggedIn, getUserByEmail, getCurrentUserEmail, updateUser } from '@/lib/auth/storage';
import type { User } from '@/lib/auth/storage';
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { Loader2, Home, UserCircle2, Mail, Phone, CheckCircle, LogOutIcon, Edit3, Save, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editableFullName, setEditableFullName] = useState('');
  const [editablePhone, setEditablePhone] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/auth/login');
    } else {
      const userEmail = getCurrentUserEmail();
      if (userEmail) {
        const currentUser = getUserByEmail(userEmail);
        setUser(currentUser || null);
        if (currentUser) {
          setEditableFullName(currentUser.fullName);
          setEditablePhone(currentUser.phone);
        }
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

  const handleEditProfileToggle = () => {
    if (user) {
      setEditableFullName(user.fullName);
      setEditablePhone(user.phone);
    }
    setIsEditingProfile(!isEditingProfile);
    setEditError(null); // Clear any previous errors
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[0-9\s-()]{10,}$/; // Allows digits, spaces, hyphens, parens, optional +
    return phoneRegex.test(phone);
  };

  const handleSaveChanges = () => {
    if (!user) return;

    if (!editableFullName.trim()) {
      setEditError("Full Name cannot be empty.");
      return;
    }
    if (!validatePhoneNumber(editablePhone)) {
      setEditError("Phone number must be at least 10 digits and contain valid characters (numbers, spaces, -, ()).");
      return;
    }
    setEditError(null);

    const updatedUser: User = {
      ...user,
      fullName: editableFullName.trim(),
      phone: editablePhone.trim(),
    };

    try {
      updateUser(updatedUser);
      setUser(updatedUser); // Update local state to reflect changes immediately
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile details have been saved successfully.",
      });
    } catch (e: any) {
      setEditError(e.message || "Failed to update profile.");
      toast({
        title: "Update Failed",
        description: e.message || "Could not save your profile changes.",
        variant: "destructive",
      });
    }
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
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-semibold text-primary">Your Profile Details</h2>
                    {!isEditingProfile ? (
                      <Button variant="outline" size="sm" onClick={handleEditProfileToggle} disabled={user.provider === 'google'}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleEditProfileToggle}>
                          <XCircle className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white">
                          <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  {user.provider === 'google' && !isEditingProfile && (
                     <Alert variant="default" className="bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
                        <AlertTriangle className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
                        <AlertTitle>Google Sign-In</AlertTitle>
                        <AlertDescription>Profile details managed by Google. To change your name or phone, please update them in your Google account settings.</AlertDescription>
                    </Alert>
                  )}

                  {editError && isEditingProfile && (
                    <Alert variant="destructive" className="my-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Validation Error</AlertTitle>
                      <AlertDescription>{editError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-sm font-medium text-muted-foreground flex items-center">
                        <UserCircle2 className="mr-2 h-5 w-5" /> Full Name
                      </Label>
                      {isEditingProfile && user.provider !== 'google' ? (
                        <Input
                          id="fullName"
                          value={editableFullName}
                          onChange={(e) => setEditableFullName(e.target.value)}
                          className="text-md font-semibold text-foreground"
                        />
                      ) : (
                        <p className="text-md font-semibold text-foreground pt-1.5">{user.fullName}</p>
                      )}
                    </div>

                    {/* Email Address (Not Editable) */}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center">
                        <Mail className="mr-2 h-5 w-5" /> Email Address
                      </Label>
                      <p className="text-md font-semibold text-foreground pt-1.5">{user.email}</p>
                    </div>
                    
                    {/* Phone Number */}
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground flex items-center">
                        <Phone className="mr-2 h-5 w-5" /> Phone Number
                      </Label>
                      {isEditingProfile && user.provider !== 'google' ? (
                        <Input
                          id="phone"
                          type="tel"
                          value={editablePhone}
                          onChange={(e) => setEditablePhone(e.target.value)}
                          className="text-md font-semibold text-foreground"
                        />
                      ) : (
                        <p className="text-md font-semibold text-foreground pt-1.5">{user.phone}</p>
                      )}
                    </div>

                    {/* Account Status (Not Editable) */}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center">
                        <CheckCircle className={`mr-2 h-5 w-5 ${user.verified ? 'text-green-500' : 'text-red-500'}`} /> Account Status
                      </Label>
                      <p className={`text-md font-semibold pt-1.5 ${user.verified ? 'text-green-600' : 'text-red-600'}`}>
                        {user.verified ? 'Verified' : 'Not Verified'}
                      </p>
                    </div>

                    {/* Sign-in Method (Not Editable) */}
                    {user.provider && (
                       <div className="space-y-1 md:col-span-2">
                         <Label className="text-sm font-medium text-muted-foreground flex items-center">
                           <svg role="img" viewBox="0 0 24 24" className="mr-2 h-5 w-5"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.02C17.38 19.02 15.48 20 12.48 20c-4.73 0-8.55-3.82-8.55-8.5s3.82-8.5 8.55-8.5c2.66 0 4.31 1.08 5.52 2.18l2.77-2.77C18.96 1.19 16.25 0 12.48 0C5.88 0 0 5.88 0 12.48s5.88 12.48 12.48 12.48c7.25 0 12.09-4.76 12.09-12.25 0-.76-.08-1.49-.2-2.24h-11.9z"></path></svg>
                           Sign-in Method
                         </Label>
                         <p className="text-md font-semibold text-foreground capitalize pt-1.5">{user.provider}</p>
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


    