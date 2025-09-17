'use client';

import { Header } from "@/components/layout/Header";
import { IssueTracker } from "@/components/issues/IssueTracker";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function MyReportsPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">My Issue Reports</h1>
          <IssueTracker />
        </main>
      </div>
    </ProtectedRoute>
  );
}
