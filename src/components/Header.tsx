import { BookCopy } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm no-print">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <BookCopy className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl font-headline">
            Bazaar Ledger
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
