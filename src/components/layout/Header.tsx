import Link from 'next/link';
import { Bug, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Bug className="h-6 w-6 text-primary" />
            <span className="font-bold">CivicConnect</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Home
            </Link>
            <Link
              href="/issues"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              My Reports
            </Link>
             <Link
              href="/admin"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Admin
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
           <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/report">
              <Newspaper className="mr-2 h-4 w-4" /> Report an Issue
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
