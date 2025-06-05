
import { SignupForm } from "@/components/auth/SignupForm";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
       <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Logo />
      </div>
      <SignupForm />
    </main>
  );
}
