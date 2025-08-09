"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { LoginPage as AdminLogin } from "@/components/admin/login-page";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default function AdminLoginPage() {
  const publishableKey =
    (typeof window !== "undefined"
      ? (window as unknown as { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string })
          .NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      : undefined) || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <ThemeProvider>
      <AdminLogin />
    </ThemeProvider>
  );

  if (!publishableKey) {
    return content;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>
  );
}
