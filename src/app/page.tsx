
// src/app/page.tsx
import { ReadmeGenerator } from "@/components/readme-generator";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Files, FileText, LogIn, UserPlus } from 'lucide-react'; 


export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 sm:p-12 md:p-24 bg-background">
      <div className="container mx-auto flex flex-col items-center gap-12">
        <header className="text-center w-full flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-2">
            <Link href="/auth/login" passHref>
              <Button variant="outline">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
            </Link>
            <Link href="/auth/signup" passHref>
              <Button variant="default"> {/* Or another variant */}
                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
              </Button>
            </Link>
            <ThemeToggle /> 
          </div>
        </header>
        <p className="mt-3 text-lg text-muted-foreground">
          Your AI-powered assistant for creating stunning README files instantly.
        </p>
        <ReadmeGenerator />
         <footer className="mt-12 text-center text-sm text-muted-foreground w-full">
          <div className="mb-4">
            <p className="font-semibold">Explore other tools:</p>
            <div className="flex justify-center gap-4 mt-2">
                <Link href="/past" passHref>
                  <Button variant="outline" className="bg-secondary hover:bg-muted">
                    <FileText className="mr-2 h-4 w-4" />
                    README from Past Link/Code
                  </Button>
                </Link>
                <Link href="/past-files" passHref>
                   <Button variant="outline" className="bg-secondary hover:bg-muted">
                    <Files className="mr-2 h-4 w-4" /> 
                    Past Files Inventory & Gen
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
