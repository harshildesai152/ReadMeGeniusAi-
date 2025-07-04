"use client";

import { useState, useEffect, useRef } from 'react';
import { ReadmeGenerator } from "@/components/readme-generator";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Files, FileCode, Info, LayoutDashboard, LogIn, LogOut, UserPlus, 
  Github, Twitter, Linkedin, ArrowRight, Sparkles, FileText, Cpu, 
  ShieldCheck, Users, Star, BookOpen, Settings, Combine, Loader2, Menu, HelpCircle,Image as ImageIcon
} from 'lucide-react';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose 
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { isLoggedIn, setLoggedIn as setAuthLoggedIn } from '@/lib/auth/storage';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import project1 from '../image/20250614_2217_Futuristic AI Workspace_simple_compose_01jxqn9jaxew8a82ha128e0fc1.png'
import project7 from '../image/The-Future-of-AI-and-Its-Impact-on-Humanity.jpg'
import project2 from '../image/20250614_2217_Futuristic AI Workspace_simple_compose_01jxqn9jawfc7sk82cwyeaddn0.png'
import project3 from '../image/20250614_2217_Futuristic AI Workspace_simple_compose_01jxqn9jazetjbx15b7nx56jgh.png'
import project4 from '../image/20250614_2217_Futuristic AI Workspace_simple_compose_01jxqn9jayedxva7m242qbkp5y.png'
import project5 from '../image/20250614_2213_AI-Enhanced README Background_simple_compose_01jxqn4krgew7v7hma180ekj13.png'
import project6 from '../image/20250614_2213_AI-Enhanced README Background_simple_compose_01jxqn4kreebt8d032akr7hm8e.png'

const NavLink: React.FC<{ href: string; children: React.ReactNode; className?: string }> = ({ href, children, className }) => (
  <Link href={href} passHref>
    <Button variant="ghost" className={cn("text-sm sm:text-base text-muted-foreground hover:text-foreground hover:bg-accent", className)}>
      {children}
    </Button>
  </Link>
);

const HeroSection = () => {
  const scrollToGenerator = () => {
    document.getElementById('readme-generator-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full py-20 sm:py-28 md:py-32 lg:py-40 text-center overflow-hidden bg-neutral-800 dark:bg-neutral-900 rounded-xl shadow-2xl">
      <Image
        src={project7}
        alt="Abstract background for hero section"
        fill 
        objectFit="cover"
        quality={80}
        className="opacity-30 dark:opacity-40"
        data-ai-hint="dark gradient tech"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 dark:from-black/50 dark:via-black/70 dark:to-black/90"></div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 sm:mb-8 animate-fade-in-down">
          Generate README files using AI
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-neutral-200 dark:text-neutral-300 max-w-3xl mx-auto mb-8 sm:mb-10 animate-fade-in-up">
          Create comprehensive and professional README files for your projects in seconds with our AI-powered generator. Simply provide a brief description of your project, and let our AI handle the rest.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={scrollToGenerator}
             className="bg-primary text-primary-foreground text-base sm:text-lg px-8 py-3 sm:px-10 sm:py-4 rounded-lg shadow-lg transform transition-transform hover:scale-105"
          >
            Generate Now
          </Button>
{/*            <Link href="/templates" passHref>
            <Button
              size="lg"
              variant="outline"
              className="bg-primary text-primary-foreground text-base sm:text-lg px-8 py-3 sm:px-10 sm:py-4 rounded-lg shadow-lg transform transition-transform hover:scale-105"
            >
              View Templates
            </Button>
          </Link> */}
        </div>
      </div>
    </section>
  );
};


const FeatureCard: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
  <Card className="bg-slate-100 dark:bg-neutral-800 hover:border-primary/50 border-border shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex flex-col h-full">
    <CardHeader className="pb-4">
      <div className="w-12 h-12 mb-3 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <CardTitle className="text-lg font-semibold text-card-foreground dark:text-neutral-100">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-sm text-muted-foreground dark:text-neutral-300 leading-relaxed">
        {description}
      </p>
    </CardContent>
  </Card>
);

const FeaturesSection = () => (
  <section className="py-16 sm:py-20 md:py-24 bg-background text-foreground">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground dark:text-white mb-4">Powerful Features</h2>
        <p className="text-base sm:text-lg text-muted-foreground dark:text-neutral-400 max-w-2xl mx-auto">
          Our AI-powered README generator offers a range of features to help you create professional and informative README files for your projects.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <FeatureCard
          icon={FileText}
          title="Automated Generation"
          description="Leverage advanced AI to automatically create engaging and informative content tailored for your README."
        />
        <FeatureCard
          icon={Cpu}
          title="AI-Powered Content"
          description="Choose from a variety of professionally designed templates to perfectly match your project's unique style and needs."
        />
        <FeatureCard
          icon={ShieldCheck}
          title="Customizable Templates"
          description="Seamlessly connect with your GitHub repositories to fetch project details and generate READMEs instantly."
        />
      </div>
    </div>
  </section>
);

const StatsCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
 <Card className="bg-slate-100 dark:bg-neutral-800 hover:border-primary/50 border-border shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl p-6 text-center">
    <p className="text-sm text-muted-foreground dark:text-neutral-400 mb-1">{title}</p>
    <p className="text-3xl font-bold text-card-foreground dark:text-white">{value}</p>
  </Card>
);

const TrustedBySection = () => (
  <section className="py-16 sm:py-20 md:py-24 bg-muted/50 dark:bg-neutral-900 text-foreground">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground dark:text-white mb-4">Trusted by developers worldwide</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <StatsCard title="Page Views" value="400+" />
        <StatsCard title="Active Users" value="100+" />
        <StatsCard title="GitHub Stars" value="10+" />
      </div>
      <div className="text-center mt-10 sm:mt-12">
        <Link href="https://github.com/readme-ai" target="_blank" rel="noopener noreferrer" className="text-sm text-primary dark:text-primary-foreground hover:underline">
          {/* https://github.com/readme-ai */}
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
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-background dark:border-neutral-800">
        {step}
      </div>
    </div>
    <h3 className="text-lg font-semibold text-foreground dark:text-neutral-100 mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground dark:text-neutral-400">{description}</p>
  </div>
);

const HowItWorksSection = () => (
  <section className="py-16 sm:py-20 md:py-24 bg-background text-foreground">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground dark:text-white mb-4">How It Works</h2>
        <p className="text-base sm:text-lg text-muted-foreground dark:text-neutral-400 max-w-xl mx-auto">
          Generating your README is simple and fast. Follow these three easy steps.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
        <HowItWorksStep icon={Combine} title="Connect Repository" description="Provide a GitHub URL, paste code, or describe your project." step={1} />
        <HowItWorksStep icon={Settings} title="Customize Options" description="Optionally refine sections or add more details." step={2} />
        <HowItWorksStep icon={FileText} title="Generate & Export" description="Get your professional README in seconds. Copy or download." step={3} />
      </div>
    </div>
  </section>
);

const ScrollableImageSection = () => {
  const images = [
    { src: project2, alt: "App Interface Screenshot", hint: "app interface" },
    { src: project3, alt: "Generated README example", hint: "code document" },
    { src: project4, alt: "User Dashboard preview", hint: "dashboard analytics" },
    { src: project1, alt: "AI code explanation feature", hint: "ai explanation" },
    { src: project5, alt: "Template selection screen", hint: "template selection" },
    { src: project6, alt: "Dark mode theme preview", hint: "dark mode" },
  ];
  const duplicatedImages = [...images, ...images]; // Duplicate for seamless loop

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-muted/50 dark:bg-neutral-900 text-foreground group">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground dark:text-white mb-4 flex items-center justify-center gap-3">
            <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            Visual Showcase
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground dark:text-neutral-400 max-w-2xl mx-auto">
            Explore the look and feel of ReadMeGenius in action.
          </p>
        </div>
        <div className="overflow-hidden w-full">
          <div className="flex whitespace-nowrap animate-marquee-base md:animate-marquee-md group-hover:[animation-play-state:paused]">
            {duplicatedImages.map((image, index) => (
              <div key={index} className="flex-shrink-0 w-72 sm:w-80 md:w-96 mx-2 sm:mx-3">
                <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl group/card">
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={image.hint}
                      className="transition-transform duration-300 group-hover/card:scale-105"
                    />
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialCard: React.FC<{ quote: string; name: string; role: string; avatarUrl?: string }> = ({ quote, name, role, avatarUrl }) => (
  <Card className="bg-slate-100 dark:bg-neutral-800 hover:border-primary/50 border-border shadow-lg rounded-xl p-6 flex flex-col h-full">
    <CardContent className="flex-grow pb-4">
      <p className="text-muted-foreground dark:text-neutral-300 italic">&ldquo;{quote}&rdquo;</p>
    </CardContent>
    <CardFooter className="pt-4 border-t border-border dark:border-neutral-700/60">
      <div className="flex items-center">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={name} width={40} height={40} className="rounded-full mr-3" data-ai-hint="person" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted dark:bg-neutral-600 flex items-center justify-center text-muted-foreground dark:text-neutral-300 mr-3 text-sm font-semibold">{name.substring(0,1)}</div>
        )}
        <div>
          <p className="font-semibold text-card-foreground dark:text-neutral-100">{name}</p>
          <p className="text-xs text-muted-foreground dark:text-neutral-400">{role}</p>
        </div>
      </div>
    </CardFooter>
  </Card>
);

const TestimonialsSection = () => (
  <section className="py-16 sm:py-20 md:py-24 bg-muted/50 dark:bg-neutral-900 text-foreground">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground dark:text-white mb-4">Loved by Developers</h2>
        <p className="text-base sm:text-lg text-muted-foreground dark:text-neutral-400 max-w-xl mx-auto">
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

const FAQSection = () => {
  const faqs = [
    {
      question: "What is ReadMeGenius?",
      answer: "ReadMeGenius is an AI-powered tool designed to help developers quickly and easily generate professional README files for their software projects. You can input a GitHub URL, paste code, or describe your project, and our AI will craft the relevant sections."
    },
    {
      question: "How does the AI generation work?",
      answer: "We use advanced language models (like Google's Gemini) through Genkit. The AI analyzes the provided input (repository, code, or prompt) to understand the project's context, features, and technologies, then generates corresponding README content."
    },
    {
      question: "Is my data safe?",
      answer: "We take your privacy seriously. Input data like code snippets or prompts are processed to generate the README and are not stored long-term for generation purposes. GitHub repository analysis uses publicly available information. Please see our Privacy Policy for more details."
    },
    {
      question: "Can I customize the generated README?",
      answer: "Yes! After the AI generates the initial README, you can edit all sections directly in our editor. You can refine the content, add new sections, or adjust formatting before saving or downloading your README."
    },
    // {
    //   question: "Is there a cost to use this service?",
    //   answer: "ReadMeGenius offers a generous free tier for generating READMEs. Advanced features or higher usage limits might be part of future premium plans. For now, enjoy the core features for free!"
    // }
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground dark:text-white mb-4 flex items-center justify-center gap-3">
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground dark:text-neutral-400 max-w-xl mx-auto">
            Have questions? We’ve got answers. If you don’t see your question here, feel free to contact us.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border-border  transition-colors">
                <AccordionTrigger className="text-left text-sm sm:text-base font-medium  py-3 sm:py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 sm:pb-4 text-xs sm:text-sm text-muted-foreground dark:text-neutral-300 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

const CallToActionSection = () => {
  const scrollToGenerator = () => {
    document.getElementById('readme-generator-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/90 to-primary opacity-90 dark:opacity-100"></div>
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
  <section id="readme-generator-section" className="py-16 sm:py-20 md:py-24 bg-muted/50 dark:bg-neutral-900 text-foreground">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <ReadmeGenerator />
    </div>
  </section>
);

const FooterLinkColumn: React.FC<{ title: string; links: Array<{ href: string; label: string }> }> = ({ title, links }) => (
  <div>
    <h3 className="text-sm font-semibold text-muted-foreground/80 dark:text-muted-foreground/70 uppercase tracking-wider mb-4">{title}</h3>
    <ul className="space-y-3">
      {links.map(link => (
        <li key={link.label}>
          <Link href={link.href} className="text-base text-muted-foreground hover:text-primary transition-colors">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => (
  <footer className="bg-secondary dark:bg-neutral-800 text-secondary-foreground dark:text-neutral-300 py-16 sm:py-20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12">
        <div className="md:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground dark:text-neutral-400 leading-relaxed">
            AI-powered README generation to streamline your development workflow and create professional project documentation effortlessly.
          </p>
          <div className="flex space-x-5 mt-6">
            <Link href="#" className="text-muted-foreground hover:text-primary dark:hover:text-primary-foreground"><Github className="w-5 h-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary dark:hover:text-primary-foreground"><Twitter className="w-5 h-5" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-primary dark:hover:text-primary-foreground"><Linkedin className="w-5 h-5" /></Link>
          </div>
        </div>
        <FooterLinkColumn title="Product" links={[
          { href: "/templates", label: "Templates" },
          { href: "#", label: "Features" },
          { href: "/pricing", label: "Pricing" },
          { href: "/explain-code", label: "Explain Code" },
        ]} />
        <FooterLinkColumn title="Resources" links={[
          { href: "/docs", label: "Documentation" },
          { href: "/about", label: "About Us" },
          { href: "/blog", label: "Blog" },
          { href: "#", label: "Support" },
        ]} />
        <FooterLinkColumn title="Company" links={[
          { href: "/careers", label: "Careers" },
          { href: "/privacy-policy", label: "Privacy Policy" },
          { href: "/terms-of-service", label: "Terms of Service" },
          { href: "#", label: "Contact Us" },
        ]} />
      </div>
      <div className="border-t border-border dark:border-neutral-700 pt-8 text-center text-sm text-muted-foreground dark:text-neutral-500">
        <p>&copy; {new Date().getFullYear()} ReadMeGenius. All rights reserved. Powered by AI magic ✨</p>
      </div>
    </div>
  </footer>
);


export default function HomePage() {
  const [loggedInStatus, setLoggedInStatusState] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  };

  const scrollToGenerator = () => {
    document.getElementById('readme-generator-section')?.scrollIntoView({ behavior: 'smooth' });
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-start bg-background text-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full animate-pulse">
          {/* Header Skeleton */}
          <header className="h-16 sm:h-20 flex items-center justify-between py-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded-full"></div>
              <div className="h-6 w-20 sm:h-7 sm:w-24 bg-muted rounded-md"></div>
              <div className="h-6 w-16 sm:h-7 sm:w-20 bg-muted rounded-md"></div>
            </div>
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-6 w-20 bg-muted rounded-md"></div>)}
            </nav>
            <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
              <div className="h-9 w-20 bg-muted rounded-md"></div> {/* Sign In */}
              <div className="h-9 w-28 bg-muted rounded-md"></div> {/* Get Started */}
              <div className="h-9 w-9 bg-muted rounded-full"></div> {/* Theme Toggle */}
            </div>
            <div className="md:hidden h-8 w-8 bg-muted rounded-md"></div> {/* Mobile Menu Button */}
          </header>

          {/* Hero Section Skeleton */}
          <section className="w-full py-20 sm:py-28 md:py-32 lg:py-40 text-center bg-muted/30 rounded-xl my-8">
            <div className="h-10 sm:h-12 w-3/4 mx-auto bg-muted rounded-md mb-6"></div> {/* Title */}
            <div className="h-5 sm:h-6 w-full max-w-3xl mx-auto bg-muted rounded-md mb-4"></div> {/* Subtitle line 1 */}
            <div className="h-5 sm:h-6 w-5/6 max-w-2xl mx-auto bg-muted rounded-md mb-10"></div> {/* Subtitle line 2 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="h-12 sm:h-14 w-36 sm:w-40 bg-muted rounded-lg"></div> {/* Button 1 */}
              <div className="h-12 sm:h-14 w-36 sm:w-40 bg-muted rounded-lg"></div> {/* Button 2 */}
            </div>
          </section>

          {/* Features Section Skeleton */}
          <section className="py-16 sm:py-20">
            <div className="text-center mb-12 sm:mb-16">
              <div className="h-8 sm:h-10 w-1/2 mx-auto bg-muted rounded-md mb-4"></div> {/* Section Title */}
              <div className="h-4 sm:h-5 w-3/4 mx-auto bg-muted rounded-md"></div> {/* Section Subtitle */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted/30 p-6 rounded-xl space-y-4 h-[220px]">
                  <div className="h-10 w-10 bg-muted rounded-lg"></div> {/* Icon */}
                  <div className="h-5 w-3/4 bg-muted rounded-md"></div> {/* Card Title */}
                  <div className="h-3.5 w-full bg-muted rounded-md"></div> {/* Desc line 1 */}
                  <div className="h-3.5 w-5/6 bg-muted rounded-md"></div> {/* Desc line 2 */}
                </div>
              ))}
            </div>
          </section>

          {/* TrustedBy Section Skeleton */}
          <section className="py-16 sm:py-20 bg-muted/20">
             <div className="text-center mb-12 sm:mb-16">
                <div className="h-8 sm:h-10 w-3/5 mx-auto bg-muted rounded-md"></div> {/* Section Title */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {[...Array(3)].map((_,i) => (
                    <div key={i} className="bg-muted/30 p-6 rounded-xl h-[100px]">
                        <div className="h-4 w-1/2 mx-auto bg-muted rounded-md mb-2"></div> {/* Stat Title */}
                        <div className="h-8 w-1/3 mx-auto bg-muted rounded-md"></div> {/* Stat Value */}
                    </div>
                ))}
            </div>
             <div className="text-center mt-10 sm:mt-12">
                <div className="h-4 w-1/3 mx-auto bg-muted rounded-md"></div> {/* Link */}
            </div>
          </section>

          {/* HowItWorks Section Skeleton */}
          <section className="py-16 sm:py-20">
            <div className="text-center mb-12 sm:mb-16">
              <div className="h-8 sm:h-10 w-1/2 mx-auto bg-muted rounded-md mb-4"></div> {/* Section Title */}
              <div className="h-4 sm:h-5 w-3/4 mx-auto bg-muted rounded-md"></div> {/* Section Subtitle */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-muted"></div> {/* Icon */}
                  <div className="h-5 w-3/4 bg-muted rounded-md"></div> {/* Step Title */}
                  <div className="h-3.5 w-full bg-muted rounded-md"></div> {/* Step Desc line 1 */}
                  <div className="h-3.5 w-5/6 bg-muted rounded-md"></div> {/* Step Desc line 2 */}
                </div>
              ))}
            </div>
          </section>
          
          {/* Testimonials Section Skeleton */}
           <section className="py-16 sm:py-20 bg-muted/20">
            <div className="text-center mb-12 sm:mb-16">
              <div className="h-8 sm:h-10 w-1/2 mx-auto bg-muted rounded-md mb-4"></div> {/* Section Title */}
              <div className="h-4 sm:h-5 w-3/4 mx-auto bg-muted rounded-md"></div> {/* Section Subtitle */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted/30 p-6 rounded-xl space-y-4 h-[180px]">
                  <div className="h-4 w-full bg-muted rounded-md"></div> {/* Quote line 1 */}
                  <div className="h-4 w-5/6 bg-muted rounded-md"></div> {/* Quote line 2 */}
                  <div className="flex items-center pt-4 mt-auto border-t border-muted">
                    <div className="w-10 h-10 rounded-full bg-muted mr-3"></div> {/* Avatar */}
                    <div className="space-y-1.5">
                      <div className="h-4 w-24 bg-muted rounded-md"></div> {/* Name */}
                      <div className="h-3 w-32 bg-muted rounded-md"></div> {/* Role */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CallToAction Section Skeleton */}
          <section className="py-20 sm:py-28 bg-muted/30 my-8 rounded-xl">
            <div className="text-center">
              <div className="h-8 sm:h-10 w-3/4 mx-auto bg-muted rounded-md mb-6"></div> {/* Title */}
              <div className="h-5 sm:h-6 w-1/2 mx-auto bg-muted rounded-md mb-10"></div> {/* Subtitle */}
              <div className="h-12 sm:h-14 w-48 mx-auto bg-muted rounded-lg"></div> {/* Button */}
            </div>
          </section>

          {/* ReadmeGeneratorWrapper Skeleton */}
          <section className="py-16 sm:py-20 bg-muted/20 rounded-xl">
            <div className="bg-muted/30 p-6 rounded-xl h-[400px] w-full max-w-3xl mx-auto">
                <div className="h-8 w-1/2 bg-muted rounded-md mb-4"></div> {/* Card Title */}
                <div className="h-4 w-3/4 bg-muted rounded-md mb-6"></div> {/* Card Description */}
                <div className="space-y-4">
                    <div className="h-10 bg-muted rounded-md"></div> {/* Input placeholder */}
                    <div className="h-20 bg-muted rounded-md"></div> {/* Textarea placeholder */}
                    <div className="h-10 bg-muted rounded-md"></div> {/* Button placeholder */}
                </div>
            </div>
          </section>

          {/* Discover More Tools Skeleton */}
          <section className="py-16 sm:py-20">
            <div className="h-8 sm:h-9 w-1/2 mx-auto bg-muted rounded-md mb-8 sm:mb-12"></div> {/* Section Title */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted/30 p-6 rounded-xl space-y-3 h-[200px]">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 bg-muted rounded-md"></div> {/* Icon */}
                     <div className="h-6 w-3/4 bg-muted rounded-md"></div> {/* Card Title */}
                  </div>
                  <div className="h-4 w-full bg-muted rounded-md"></div> {/* Desc line 1 */}
                  <div className="h-4 w-5/6 bg-muted rounded-md"></div> {/* Desc line 2 */}
                  <div className="h-6 w-28 bg-muted rounded-md mt-auto pt-4"></div> {/* Button */}
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section Skeleton */}
          <section className="py-16 sm:py-20 bg-muted/20">
            <div className="text-center mb-12 sm:mb-16">
              <div className="h-8 sm:h-10 w-1/2 mx-auto bg-muted rounded-md mb-4"></div> {/* Section Title */}
              <div className="h-4 sm:h-5 w-3/4 mx-auto bg-muted rounded-md"></div> {/* Section Subtitle */}
            </div>
            <div className="max-w-3xl mx-auto space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-muted/30 rounded-md"></div> /* Accordion Item */
              ))}
            </div>
          </section>

          {/* Footer Skeleton */}
          <footer className="bg-muted/20 py-16 sm:py-20 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12">
              <div className="md:col-span-2 lg:col-span-1 space-y-4">
                <div className="h-8 w-32 bg-muted rounded-md"></div> {/* Logo */}
                <div className="h-4 w-full bg-muted rounded-md"></div>
                <div className="h-4 w-5/6 bg-muted rounded-md"></div>
                <div className="flex space-x-5 mt-6">
                  <div className="h-6 w-6 bg-muted rounded-full"></div>
                  <div className="h-6 w-6 bg-muted rounded-full"></div>
                  <div className="h-6 w-6 bg-muted rounded-full"></div>
                </div>
              </div>
              {[...Array(3)].map((_, colIndex) => (
                <div key={colIndex} className="space-y-3">
                  <div className="h-5 w-24 bg-muted rounded-md mb-4"></div> {/* Column Title */}
                  {[...Array(3)].map((_, linkIndex) => (
                    <div key={linkIndex} className="h-4 w-3/4 bg-muted rounded-md"></div> /* Link */
                  ))}
                </div>
              ))}
            </div>
            <div className="border-t border-muted pt-8 text-center">
              <div className="h-4 w-1/2 mx-auto bg-muted rounded-md"></div> {/* Copyright */}
            </div>
          </footer>

        </div>
      </main>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            <Logo />
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/past-files">Upload Files</NavLink>
              <NavLink href="/explain-code">Code Explainer</NavLink>
{/*               <NavLink href="/pricing">Pricing</NavLink>
              <NavLink href="/docs">Docs</NavLink> */}
            </nav>
            
            <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
              {loggedInStatus ? (
                <>
                  <Link href="/dashboard" passHref>
                    <Button variant="outline" className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 border-border text-foreground hover:bg-accent">
                      <LayoutDashboard className="mr-1.5 sm:mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="destructive" onClick={handleLogout} className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    <LogOut className="mr-1.5 sm:mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/signup" passHref>
                    <Button variant="ghost" className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 text-muted-foreground hover:text-foreground">
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

            <div className="flex items-center md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 flex flex-col bg-background">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle><SheetClose asChild><Logo /></SheetClose></SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="flex-1">
                    <nav className="grid gap-1 p-4">
                      <SheetClose asChild><NavLink href="/" className="justify-start w-full py-2 h-auto">Home</NavLink></SheetClose>
                      <SheetClose asChild><NavLink href="/past-files" className="justify-start w-full py-2 h-auto">Past Files</NavLink></SheetClose>
                      <SheetClose asChild><NavLink href="/explain-code" className="justify-start w-full py-2 h-auto">Explain Code</NavLink></SheetClose>
{/*                       <SheetClose asChild><NavLink href="/about" className="justify-start w-full py-2 h-auto">About Us</NavLink></SheetClose>
                      <SheetClose asChild><NavLink href="/templates" className="justify-start w-full py-2 h-auto">Templates</NavLink></SheetClose>
                      <SheetClose asChild><NavLink href="#" className="justify-start w-full py-2 h-auto">Features</NavLink></SheetClose>
                      <SheetClose asChild><NavLink href="/pricing" className="justify-start w-full py-2 h-auto">Pricing</NavLink></SheetClose>
                      <SheetClose asChild><NavLink href="/docs" className="justify-start w-full py-2 h-auto">Docs</NavLink></SheetClose>
                      <SheetClose asChild><NavLink href="/blog" className="justify-start w-full py-2 h-auto">Blog</NavLink></SheetClose>
                      <SheetClose asChild><NavLink href="/careers" className="justify-start w-full py-2 h-auto">Careers</NavLink></SheetClose> */}
                    </nav>
                  </ScrollArea>
                  <div className="mt-auto border-t p-4">
                    <div className="flex flex-col gap-2">
                        {loggedInStatus ? (
                          <>
                            <SheetClose asChild>
                              <Link href="/dashboard" passHref>
                                <Button variant="outline" className="w-full justify-start">
                                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                                </Button>
                              </Link>
                            </SheetClose>
                            <Button variant="destructive" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full justify-start">
                              <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                          </>
                        ) : (
                          <>
                            <SheetClose asChild>
                              <Link href="/auth/login" passHref>
                                <Button variant="ghost" className="w-full justify-start">
                                  Sign In
                                </Button>
                              </Link>
                            </SheetClose>
                            <SheetClose asChild>
                              <Button onClick={scrollToGenerator} className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                                Get Started
                              </Button>
                            </SheetClose>
                          </>
                        )}
                        <div className="pt-4 flex justify-start">
                            <ThemeToggle />
                        </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <HeroSection />
          <ScrollableImageSection />
        <ReadmeGeneratorWrapper />
{/*         <FeaturesSection />
        <TrustedBySection />
        <HowItWorksSection />
       
        <TestimonialsSection />
        <CallToActionSection /> */}
       

        <section className="py-16 sm:py-20 bg-background text-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-8 sm:mb-12 text-foreground dark:text-white">
              Discover More Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { href: "/past-files", icon: Files, title: "Past Files Inventory", description: "Upload multiple local files and generate individual READMEs for each one." },
                { href: "/explain-code", icon: FileCode, title: "Explain My Code", description: "Get AI-powered explanations for your code snippets, tailored for beginner or technical audiences." },
                // { href: "/about", icon: Info, title: "About Us", description: "Learn more about ReadMeGenius, its features, and the technology behind it." },
              ].map((tool) => (
                <Link href={tool.href} passHref key={tool.title} legacyBehavior>
                  <a className="block">
                    <Card className="bg-slate-100 dark:bg-neutral-800 hover:border-primary/50 border-border transition-all duration-300 cursor-pointer h-full flex flex-col group shadow-lg hover:shadow-primary/20">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg sm:text-xl text-card-foreground dark:text-white">
                          <tool.icon className="h-6 w-6 text-primary" />
                          {tool.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow pt-0">
                        <p className="text-sm text-muted-foreground dark:text-neutral-300 transition-colors">
                          {tool.description}
                        </p>
                      </CardContent>
                       <CardFooter className="pt-4 mt-auto">
                        <Button variant="link" className="text-primary dark:text-primary-foreground p-0 h-auto group-hover:underline">
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
        <FAQSection />
      </main>
{/*       <Footer /> */}
    </div>
  );
}
