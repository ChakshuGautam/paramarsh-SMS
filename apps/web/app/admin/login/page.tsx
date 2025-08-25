"use client";

<<<<<<< HEAD
=======
import { ClerkProvider } from "@clerk/nextjs";
>>>>>>> origin/main
import { LoginPage as AdminLogin } from "@/components/admin/login-page";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default function AdminLoginPage() {
<<<<<<< HEAD
  // ClerkProvider is already in the root layout.tsx, no need to duplicate it here
  return (
=======
  const publishableKey =
    (typeof window !== "undefined"
      ? (window as unknown as { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string })
          .NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      : undefined) || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
>>>>>>> origin/main
    <ThemeProvider>
      <AdminLogin />
    </ThemeProvider>
  );
<<<<<<< HEAD
=======

  if (!publishableKey) {
    return content;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>
  );
>>>>>>> origin/main
}
