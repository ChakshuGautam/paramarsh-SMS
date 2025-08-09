// app/admin/page.tsx
"use client";

import dynamic from "next/dynamic";
import { ClerkProvider } from "@clerk/nextjs";

const Admin = dynamic(() => import("./AdminApp"), {
  ssr: false, // Required to avoid react-router related errors
});

export default function Page() {
  const publishableKey =
    (typeof window !== "undefined"
      ? (window as unknown as { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string })
          .NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      : undefined) || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    if (typeof window !== "undefined") {
      console.warn(
        "@clerk/nextjs: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing; rendering Admin without auth.",
      );
    }
    return <Admin />;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <Admin />
    </ClerkProvider>
  );
}
