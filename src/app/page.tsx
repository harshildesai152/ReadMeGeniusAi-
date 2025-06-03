// src/app/page.tsx
import { ReadmeGenerator } from "@/components/readme-generator";
import { Logo } from "@/components/logo";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 sm:p-12 md:p-24 bg-background">
      <div className="container mx-auto flex flex-col items-center gap-12">
        <header className="text-center">
          <Logo />
          <p className="mt-3 text-lg text-muted-foreground">
            Your AI-powered assistant for creating stunning README files instantly.
          </p>
        </header>
        <ReadmeGenerator />
         <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ReadMeGenius. All rights reserved.</p>
          <p className="mt-1">Powered by AI magic ✨</p>
        </footer>
      </div>
    </main>
  );
}
