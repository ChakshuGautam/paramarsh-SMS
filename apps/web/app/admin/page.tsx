// app/admin/page.tsx
"use client";

import React, { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import AdminApp from "./AdminApp";

function AdminLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
      </div>
    </div>
  );
}

export default function Page() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.warn(
      "@clerk/nextjs: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing; rendering Admin without auth.",
    );
    return (
      <Suspense fallback={<AdminLoader />}>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <Suspense fallback={<AdminLoader />}>
        <AdminApp />
      </Suspense>
    </ClerkProvider>
  );
}
