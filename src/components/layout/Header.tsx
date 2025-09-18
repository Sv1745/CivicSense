'use client';

import Link from 'next/link';
import { Bug, Newspaper, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  const { user, supabaseUser, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Bug className="h-6 w-6 text-primary" />
              <span className="font-bold">CivicSense</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full" />
          </div>
        </div>
      </header>
    );
  }

  // User is authenticated but profile is still loading
  const isAuthenticated = supabaseUser !== null;
  const hasProfile = user !== null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Bug className="h-6 w-6 text-primary" />
            <span className="font-bold">CivicSense</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                href="/issues"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                My Reports
              </Link>
            )}
            {isAuthenticated && hasProfile && (user.role === 'admin' || user.role === 'department_head') && (
              <Link
                href="/admin"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {isAuthenticated && (
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/report">
                <Newspaper className="mr-2 h-4 w-4" /> Report an Issue
              </Link>
            </Button>
          )}

          {isAuthenticated ? (
            hasProfile ? (
              // User is authenticated and profile is loaded
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || ''} alt={user.full_name || user.email} />
                      <AvatarFallback>
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === 'admin' || user.role === 'department_head') && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // User is authenticated but profile is still loading
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full" />
                <span className="text-sm text-muted-foreground">Loading profile...</span>
              </div>
            )
          ) : (
            // User is not authenticated
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button asChild>
                <Link href="/auth">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
