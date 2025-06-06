
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isLoggedIn, setLoggedIn as setAuthLoggedIn, getUserByEmail, getCurrentUserEmail, updateUser } from '@/lib/auth/storage';
import type { User } from '@/lib/auth/storage';
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { Loader2, Home, UserCircle2, Mail, Phone, CheckCircle, LogOutIcon, Edit3, Save, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Set to true initially

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editableFullName, setEditableFullName] = useState('');
  const [editablePhone, setEditablePhone] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/auth/login');
    } else {
      const plainUserEmailForSession = getCurrentUserEmail(); 
      if (plainUserEmailForSession) {
        const currentUser = getUserByEmail(plainUserEmailForSession); 
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
    setAuthLoggedIn(false);
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
    setEditError(null); 
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[0-9\s-()]{10,}$/; 
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

    const updatedUserData: Partial<User> = { 
      fullName: editableFullName.trim(),
      phone: editablePhone.trim(),
    };

    try {
      updateUser({ ...user, ...updatedUserData }); 
      
      const plainUserEmailForSession = getCurrentUserEmail();
      if(plainUserEmailForSession){
        const reFetchedUser = getUserByEmail(plainUserEmailForSession); 
        setUser(reFetchedUser || null);
        if (reFetchedUser) { 
            setEditableFullName(reFetchedUser.fullName);
            setEditablePhone(reFetchedUser.phone);
        }
      }
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
     <main className="flex min-h-screen flex-col bg-muted/40 animate-pulse">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 sm:h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-6 w-6 sm:h-7 bg-muted rounded-full"></div>
              <div className="h-5 w-20 sm:h-6 bg-muted rounded-md"></div>
              <div className="h-5 w-16 sm:h-6 bg-muted rounded-md"></div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="h-8 w-8 sm:h-9 bg-muted rounded-md"></div> {/* Home icon */}
              <div className="h-8 w-8 sm:h-9 bg-muted rounded-md"></div> {/* About Us icon */}
              <div className="h-8 w-8 sm:h-9 bg-muted rounded-full"></div> {/* Theme toggle */}
              <div className="h-8 w-20 sm:h-9 bg-muted rounded-md"></div> {/* Logout button */}
            </div>
          </div>
        </header>

        {/* Main Card Skeleton */}
        <div className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="container mx-auto max-w-screen-lg">
                <div className="w-full shadow-xl rounded-lg sm:rounded-xl overflow-hidden bg-card">
                    {/* Card Header Skeleton */}
                    <div className="p-4 sm:p-6 md:p-8 border-b bg-card-foreground/5">
                        <div className="h-7 sm:h-8 w-1/2 bg-muted rounded-md"></div> {/* Welcome Title */}
                        <div className="h-4 sm:h-5 w-3/4 bg-muted rounded-md mt-2"></div> {/* Description */}
                    </div>
                    {/* Card Content Skeleton */}
                    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                        {/* Profile Details Skeleton */}
                        <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 border-b pb-3 sm:pb-4">
                            <div className="h-6 w-1/3 bg-muted rounded-md mb-2 sm:mb-0"></div> {/* Section Title */}
                            <div className="h-8 w-28 bg-muted rounded-md mt-2 sm:mt-0 self-start sm:self-center"></div> {/* Edit Button */}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                            {[...Array(4)].map((_, i) => (
                            <div className="space-y-1" key={i}>
                                <div className="h-4 w-1/4 bg-muted rounded-md"></div> {/* Label */}
                                <div className="h-5 w-3/4 bg-muted rounded-md"></div> {/* Value */}
                            </div>
                            ))}
                        </div>
                        </div>
                        {/* Application Content Skeleton */}
                        <div className="pt-4 sm:pt-6 border-t">
                        <div className="h-6 w-1/3 bg-muted rounded-md mb-2 sm:mb-3"></div> {/* Title */}
                        <div className="h-4 w-full bg-muted rounded-md mb-1"></div> {/* Paragraph Line 1 */}
                        <div className="h-4 w-5/6 bg-muted rounded-md mb-3 sm:mb-4"></div> {/* Paragraph Line 2 */}
                        <div className="h-9 w-32 bg-muted rounded-md"></div> {/* Button */}
                        </div>
                    </div>
                    {/* Card Footer Skeleton */}
                    <div className="p-4 sm:p-6 md:p-8 bg-card-foreground/5 border-t">
                        <div className="h-3 w-1/2 bg-muted rounded-md"></div> {/* Copyright */}
                    </div>
                </div>
            </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button onClick={handleGoHome} variant="ghost" size="icon" title="Go to Home" className="h-8 w-8 sm:h-9 sm:w-9">
              <Home className="h-4 sm:h-5 w-4 sm:h-5" />
            </Button>
            <Link href="/about" passHref>
                <Button variant="ghost" size="icon" title="About Us" className="h-8 w-8 sm:h-9 sm:w-9">
                    <Info className="h-4 sm:h-5 w-4 sm:h-5" />
                </Button>
            </Link>
            <ThemeToggle />
            <Button onClick={handleLogout} variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5">
              <LogOutIcon className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto max-w-screen-lg">
          <Card className="w-full shadow-xl rounded-lg sm:rounded-xl overflow-hidden hover:border-foreground transition-colors duration-200">
            <CardHeader className="bg-card-foreground/5 p-4 sm:p-6 md:p-8 border-b">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Welcome, {user?.fullName || getCurrentUserEmail() || 'User'}! 
              </CardTitle>
              <CardDescription className="text-sm sm:text-md md:text-lg text-muted-foreground mt-1">
                This is your personal dashboard. Manage your account and explore features.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
              {user && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 border-b pb-3 sm:pb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-0">Your Profile Details</h2>
                    {!isEditingProfile ? (
                      <Button variant="outline" size="sm" onClick={handleEditProfileToggle} disabled={user.provider === 'google'} className="w-full sm:w-auto text-xs sm:text-sm mt-2 sm:mt-0">
                        <Edit3 className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" /> Edit Profile
                      </Button>
                    ) : (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <Button variant="outline" size="sm" onClick={handleEditProfileToggle} className="w-full sm:w-auto text-xs sm:text-sm">
                          <XCircle className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:h-4" /> Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto text-xs sm:text-sm">
                          <Save className="mr-1 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:h-4" /> Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  {user.provider === 'google' && !isEditingProfile && (
                     <Alert variant="default" className="bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300 text-xs sm:text-sm">
                        <AlertTriangle className="h-3.5 sm:h-4 w-3.5 sm:h-4 !text-blue-600 dark:!text-blue-400" />
                        <AlertTitle>Google Sign-In</AlertTitle>
                        <AlertDescription>Profile details managed by Google. Editing is disabled for Google accounts in this mock.</AlertDescription>
                    </Alert>
                  )}

                  {editError && isEditingProfile && (
                    <Alert variant="destructive" className="my-2 text-xs sm:text-sm">
                      <AlertTriangle className="h-3.5 sm:h-4 w-3.5 sm:h-4" />
                      <AlertTitle>Validation Error</AlertTitle>
                      <AlertDescription>{editError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center">
                        <UserCircle2 className="mr-1.5 sm:mr-2 h-4 sm:h-5 w-4 sm:h-5" /> Full Name
                      </Label>
                      {isEditingProfile && user.provider !== 'google' ? (
                        <Input
                          id="fullName"
                          value={editableFullName} 
                          onChange={(e) => setEditableFullName(e.target.value)}
                          className="text-sm sm:text-base font-semibold text-foreground"
                          placeholder="Enter new full name"
                        />
                      ) : (
                        <p className="text-sm sm:text-base text-foreground pt-1 sm:pt-1.5 break-words">{user.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center">
                        <Mail className="mr-1.5 sm:mr-2 h-4 sm:h-5 w-4 sm:h-5" /> Email Address
                      </Label>
                      <p className="text-sm sm:text-base text-foreground pt-1 sm:pt-1.5 break-all">{user.email}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center">
                        <Phone className="mr-1.5 sm:mr-2 h-4 sm:h-5 w-4 sm:h-5" /> Phone Number
                      </Label>
                      {isEditingProfile && user.provider !== 'google' ? (
                        <Input
                          id="phone"
                          type="tel"
                          value={editablePhone} 
                          onChange={(e) => setEditablePhone(e.target.value)}
                          className="text-sm sm:text-base font-semibold text-foreground"
                          placeholder="Enter new phone number"
                        />
                      ) : (
                        <p className="text-sm sm:text-base text-foreground pt-1 sm:pt-1.5 break-words">{user.phone}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center">
                        <CheckCircle className={`mr-1.5 sm:mr-2 h-4 sm:h-5 w-4 sm:h-5 ${user.verified ? 'text-green-500' : 'text-red-500'}`} /> Account Status
                      </Label>
                      <p className={`text-sm sm:text-base font-semibold pt-1 sm:pt-1.5 ${user.verified ? 'text-green-600' : 'text-red-600'}`}>
                        {user.verified ? 'Verified' : 'Not Verified'}
                      </p>
                    </div>

                    {user.provider && (
                       <div className="space-y-1 md:col-span-2">
                         <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center">
                           <svg role="img" viewBox="0 0 24 24" className="mr-1.5 sm:mr-2 h-4 sm:h-5 w-4 sm:h-5 fill-current"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.02C17.38 19.02 15.48 20 12.48 20c-4.73 0-8.55-3.82-8.55-8.5s3.82-8.5 8.55-8.5c2.66 0 4.31 1.08 5.52 2.18l2.77-2.77C18.96 1.19 16.25 0 12.48 0C5.88 0 0 5.88 0 12.48s5.88 12.48 12.48 12.48c7.25 0 12.09-4.76 12.09-12.25 0-.76-.08-1.49-.2-2.24h-11.9z"></path></svg>
                           Sign-in Method
                         </Label>
                         <p className="text-sm sm:text-base font-semibold text-foreground capitalize pt-1 sm:pt-1.5">{user.provider}</p>
                       </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-4 sm:pt-6 border-t">
                <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-3">Application Content</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  This is where you can add your application-specific content and features for logged-in users.
                  For example, you could display user projects, settings, or other personalized information.
                </p>
                <Button className="mt-3 sm:mt-4 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2" onClick={() => router.push('/')}>Explore Features</Button>
              </div>
            </CardContent>
            <CardFooter className="p-4 sm:p-6 md:p-8 bg-card-foreground/5 border-t">
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
