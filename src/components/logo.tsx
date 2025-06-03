// src/components/logo.tsx
import { Sparkles } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-3xl font-bold text-primary font-headline">
      <Sparkles className="h-8 w-8 text-accent" />
      <span>ReadMe</span>
      <span className="text-accent">Genius</span>
    </div>
  );
}
