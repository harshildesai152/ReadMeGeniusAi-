
// src/components/logo.tsx
import { Sparkles } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-1 sm:gap-2 text-2xl sm:text-3xl font-bold text-primary font-headline">
      <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
      <span>ReadMe</span>
      <span className="text-accent">Genius</span>
    </div>
  );
}
