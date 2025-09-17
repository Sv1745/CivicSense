'use client';

import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserProfileForm } from "@/components/forms/UserProfileForm";

export default function ProfilePage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="container mx-auto max-w-2xl px-4">
            <div className="space-y-2 text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your account information and preferences.
              </p>
            </div>
            <UserProfileForm />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}