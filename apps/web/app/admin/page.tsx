// app/admin/page.tsx
"use client";

import React, { Suspense } from "react";
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
  // ClerkProvider is already in the root layout.tsx, no need to duplicate it here
  return (
    <Suspense fallback={<AdminLoader />}>
      <AdminApp />
    </Suspense>
  );
}
