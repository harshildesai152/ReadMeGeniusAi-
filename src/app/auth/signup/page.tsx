import { SignupForm } from "@/components/auth/SignupForm";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
       <div className="absolute top-6 left-6">
        <Logo />
      </div>
      <SignupForm />
    </main>
  );
}
