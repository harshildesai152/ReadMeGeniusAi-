
// src/app/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { ReadmeGenerator } from "@/components/readme-generator";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Files, FileCode, Info, LayoutDashboard, LogIn, LogOut, UserPlus, Github, Twitter, Linkedin, ArrowRight, Sparkles, FileText, Cpu, ShieldCheck, Users, Star, BookOpen, Settings, Combine, Loader2 } from 'lucide-react';
import { isLoggedIn, setLoggedIn as setAuthLoggedIn } from '@/lib/auth/storage';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { cn } from '@/lib/utils';

const NavLink: React.FC<{ href: string; children: React.ReactNode; className?: string }> = ({ href, children, className }) => (
  <Link href={href} passHref>
    <Button variant="ghost" className={cn("text-sm sm:text-base text-neutral-300 hover:text-white hover:bg-neutral-700/50", className)}>
      {children}
    </Button>
  </Link>
);

const HeroSection = () => {
  const scrollToGenerator = () => {
    document.getElementById('readme-generator-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full py-20 sm:py-28 md:py-32 lg:py-40 text-center overflow-hidden rounded-xl shadow-2xl">
      <Image
        src="https://placehold.co/1600x800/3A3226/E0E0E0.png"
        alt="Abstract background for hero section"
        layout="fill"
        objectFit="cover"
        quality={80}
        className="opacity-40 dark:opacity-60"
        data-ai-hint="dark gradient tech"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70 dark:from-black/50 dark:via-black/70 dark:to-black/80"></div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 sm:mb-8 animate-fade-in-down">
          Generate README files using AI
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-neutral-200 dark:text-neutral-300 max-w-3xl mx-auto mb-8 sm:mb-10 animate-fade-in-up">
          Create comprehensive and professional README files for your projects in seconds with our AI-powered generator. Simply provide a brief description of your project, and let our AI handle the rest.
        </p>
        <Button
          size="lg"
          onClick={scrollToGenerator}
          className="bg-white text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 text-base sm:text-lg px-8 py-3 sm:px-10 sm:py-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 animate-bounce- λίγο"
        >
          Generate Now
        </Button>
      </div>
    </section>
  );
};


const FeatureCard: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
  <Card className="bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700/60 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl flex flex-col h-full">
    <CardHeader className="pb-4">
      <div className="w-12 h-12 mb-3 rounded-lg bg-primary-foreground dark:bg-primary/20 text-primary dark:text-primary-foreground flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <CardTitle className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
        {description}
      </p>
    </CardContent>
  </Card>
);

const FeaturesSection = () => (
  <section className="py-16 sm:py-20 md:py-24 bg-white dark:bg-neutral-900">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">Features</h2>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Our AI-powered README generator offers a range of features to help you create professional and informative README files for your projects.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <FeatureCard
          icon={FileText}
          title="Automated Generation"
          description="Generate README files automatically based on your project description."
        />
        <FeatureCard
          icon={Cpu}
          title="AI-Powered Content"
          description="Leverage AI to create engaging and informative content for your README."
        />
        <FeatureCard
          icon={ShieldCheck}
          title="Customizable Templates"
          description="Choose from a variety of templates to match your project's style."
        />
      </div>
    </div>
  </section>
);

const StatsCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
 <Card className="bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700/60 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl p-6 text-center">
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">{title}</p>
    <p className="text-3xl font-bold text-neutral-900 dark:text-white">{value}</p>
  </Card>
);

const TrustedBySection = () => (
  <section className="py-16 sm:py-20 md:py-24 bg-neutral-100 dark:bg-neutral-950">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">Trusted by developers worldwide</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <StatsCard title="Projects Documented" value="10,000+" />
        <StatsCard title="Active Users" value="5,000+" />
        <StatsCard title="GitHub Stars" value="1,200+" />
      </div>
      <div className="text-center mt-10 sm:mt-12">
        <Link href="https://github.com/readme-ai" target="_blank" rel="noopener noreferrer" className="text-sm text-primary dark:text-primary-foreground hover:underline">
          https://github.com/readme-ai
        </Link>
      </div>
    </div>
  </section>
);


const HowItWorksStep: React.FC<{ icon: React.ElementType; title: string; description: string; step: number }> = ({ icon: Icon, title, description, step }) => (
  <div className="flex flex-col items-center text-center">
    <div className="relative mb-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground flex items-center justify-center text-2xl font-bold">
        <Icon className="w-8 h-8" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-background dark:border-neutral-900">
        {step}
      </div>
    </div>
    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">{title}</h3>
    <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
  </div>
);

const HowItWorksSection = () => (
  <section className="py-16 sm:py-20 md:py-24 bg-white dark:bg-neutral-900">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">How It Works</h2>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
          Generating your README is simple and fast. Follow these three easy steps.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
        <HowItWorksStep icon={Github} title="Connect Repository" description="Provide a GitHub URL, paste code, or describe your project." step={1} />
        <HowItWorksStep icon={Settings} title="Customize Options" description="Optionally refine sections or add more details." step={2} />
        <HowItWorksStep icon={ArrowRight} title="Generate & Export" description="Get your professional README in seconds. Copy or download." step={3} />
      </div>
    </div>
  </section>
);

const TestimonialCard: React.FC<{ quote: string; name: string; role: string; avatarUrl?: string }> = ({ quote, name, role, avatarUrl }) => (
  <Card className="bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700/60 shadow-lg rounded-xl p-6 flex flex-col h-full">
    <CardContent className="flex-grow pb-4">
      <p className="text-neutral-600 dark:text-neutral-300 italic">&ldquo;{quote}&rdquo;</p>
    </CardContent>
    <CardFooter className="pt-4 border-t border-neutral-200 dark:border-neutral-700/60">
      <div className="flex items-center">
        {avatarUrl && <Image src={avatarUrl} alt={name} width={40} height={40} className="rounded-full mr-3" data-ai-hint="person" />}
        {!avatarUrl && <div className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center text-neutral-600 dark:text-neutral-300 mr-3 text-sm font-semibold">{name.substring(0,1)}</div>}
        <div>
          <p className="font-semibold text-neutral-800 dark:text-neutral-100">{name}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{role}</p>
        </div>
      </div>
    </CardFooter>
  </Card>
);

const TestimonialsSection = () => (
  <section className="py-16 sm:py-20 md:py-24 bg-neutral-100 dark:bg-neutral-950">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">Loved by Developers</h2>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
          Hear what our users are saying about ReadMeGenius.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <TestimonialCard
          quote="ReadMeGenius saved me hours of tedious work! The AI-generated descriptions are spot-on."
          name="Alice Wonderland"
          role="Full Stack Developer"
          avatarUrl="https://placehold.co/100x100/E0E0E0/757575.png"
        />
        <TestimonialCard
          quote="The best README generator I've used. Clean UI, great results, and super fast."
          name="Bob The Builder"
          role="Open Source Contributor"
          avatarUrl="https://placehold.co/100x100/C8E6C9/388E3C.png"
        />
        <TestimonialCard
          quote="Customizing the output is easy, and the GitHub integration is seamless. Highly recommended!"
          name="Charlie Brown"
          role="Tech Lead"
          avatarUrl="https://placehold.co/100x100/FFECB3/FFA000.png"
        />
      </div>
    </div>
  </section>
);

const CallToActionSection = () => {
  const scrollToGenerator = () => {
    document.getElementById('readme-generator-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-800 opacity-90 dark:opacity-100"></div>
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">Ready to Create Perfect README Files?</h2>
        <p className="text-lg sm:text-xl text-neutral-200 dark:text-neutral-300 max-w-2xl mx-auto mb-10">
          Stop wasting time on documentation. Let ReadMeGenius craft it for you intelligently.
        </p>
        <Button
          size="lg"
          onClick={scrollToGenerator}
          className="bg-white text-primary hover:bg-neutral-200 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300 text-base sm:text-lg px-8 py-3 sm:px-10 sm:py-4 rounded-lg shadow-xl transform transition-transform hover:scale-105"
        >
          Get Started Free
        </Button>
      </div>
    </section>
  );
};

const ReadmeGeneratorWrapper = () => (
  <section id="readme-generator-section" className="py-16 sm:py-20 md:py-24 bg-white dark:bg-neutral-900">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <ReadmeGenerator />
    </div>
  </section>
);

const FooterLinkColumn: React.FC<{ title: string; links: Array<{ href: string; label: string }> }> = ({ title, links }) => (
  <div>
    <h3 className="text-sm font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">{title}</h3>
    <ul className="space-y-3">
      {links.map(link => (
        <li key={link.label}>
          <Link href={link.href} className="text-base text-neutral-300 hover:text-white transition-colors">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => (
  <footer className="bg-neutral-900 dark:bg-black text-neutral-300 py-16 sm:py-20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12">
        <div className="md:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
            AI-powered README generation to streamline your development workflow and create professional project documentation effortlessly.
          </p>
          <div className="flex space-x-5 mt-6">
            <Link href="#" className="text-neutral-400 hover:text-white"><Github className="w-5 h-5" /></Link>
            <Link href="#" className="text-neutral-400 hover:text-white"><Twitter className="w-5 h-5" /></Link>
            <Link href="#" className="text-neutral-400 hover:text-white"><Linkedin className="w-5 h-5" /></Link>
          </div>
        </div>
        <FooterLinkColumn title="Product" links={[
          { href: "#", label: "Templates" },
          { href: "#", label: "Features" },
          { href: "#", label: "Pricing" },
          { href: "/explain-code", label: "Explain Code" },
        ]} />
        <FooterLinkColumn title="Resources" links={[
          { href: "#", label: "Documentation" },
          { href: "/about", label: "About Us" },
          { href: "#", label: "Blog" },
          { href: "#", label: "Support" },
        ]} />
        <FooterLinkColumn title="Company" links={[
          { href: "#", label: "Careers" },
          { href: "#", label: "Privacy Policy" },
          { href: "#", label: "Terms of Service" },
          { href: "#", label: "Contact Us" },
        ]} />
      </div>
      <div className="border-t border-neutral-700/50 pt-8 text-center text-sm text-neutral-500">
        <p>&copy; {new Date().getFullYear()} ReadMeGenius. All rights reserved. Powered by AI magic ✨</p>
      </div>
    </div>
  </footer>
);


export default function HomePage() {
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
    // router.push('/'); // Already on home
  };

  const scrollToGenerator = () => {
    document.getElementById('readme-generator-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-start bg-neutral-950 text-white">
        <div className="w-full h-screen flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white dark"> {/* Force dark theme context for this page */}
      <header className="sticky top-0 z-50 w-full bg-neutral-950/80 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            <Logo />
            <nav className="hidden md:flex items-center space-x-2 lg:space-x-3">
              <NavLink href="/">Home</NavLink>
              <NavLink href="#">Templates</NavLink>
              <NavLink href="#">Features</NavLink>
              <NavLink href="#">Pricing</NavLink>
              <NavLink href="#">Docs</NavLink>
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-3">
              {loggedInStatus ? (
                <>
                  <Link href="/dashboard" passHref>
                    <Button variant="outline" className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white">
                      <LayoutDashboard className="mr-1.5 sm:mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="destructive" onClick={handleLogout} className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 bg-red-600 hover:bg-red-700 text-white">
                    <LogOut className="mr-1.5 sm:mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" passHref>
                    <Button variant="ghost" className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 text-neutral-300 hover:text-white hover:bg-neutral-700/50">
                      Sign In
                    </Button>
                  </Link>
                  <Button
                    onClick={scrollToGenerator}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm px-3 py-1.5 sm:px-4 rounded-md"
                  >
                    Get Started
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <TrustedBySection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CallToActionSection />
        <ReadmeGeneratorWrapper />

         {/* Explore More Tools Section - styled to fit the new dark theme */}
        <section className="py-16 sm:py-20 bg-neutral-900 dark:bg-neutral-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-8 sm:mb-12 text-white dark:text-white">
              Discover More Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { href: "/past-files", icon: Files, title: "Past Files Inventory", description: "Upload multiple local files and generate individual READMEs for each one." },
                { href: "/explain-code", icon: FileCode, title: "Explain My Code", description: "Get AI-powered explanations for your code snippets, tailored for beginner or technical audiences." },
                { href: "/about", icon: Info, title: "About Us", description: "Learn more about ReadMeGenius, its features, and the technology behind it." },
              ].map((tool) => (
                <Link href={tool.href} passHref key={tool.title} legacyBehavior>
                  <a className="block">
                    <Card className="bg-neutral-800 dark:bg-neutral-800 border-neutral-700 dark:border-neutral-700/80 hover:border-primary/70 dark:hover:border-primary/70 transition-all duration-300 cursor-pointer h-full flex flex-col group shadow-lg hover:shadow-primary/20">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg sm:text-xl text-white dark:text-white">
                          <tool.icon className="h-6 w-6 text-primary" />
                          {tool.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow pt-0">
                        <p className="text-sm text-neutral-400 dark:text-neutral-400 group-hover:text-neutral-300 dark:group-hover:text-neutral-300 transition-colors">
                          {tool.description}
                        </p>
                      </CardContent>
                       <CardFooter className="pt-4 mt-auto">
                        <Button variant="link" className="text-primary p-0 h-auto group-hover:underline">
                          Explore <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

