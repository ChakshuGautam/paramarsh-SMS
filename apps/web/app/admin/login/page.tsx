"use client";

import { LoginPage as AdminLogin } from "@/components/admin/login-page";
import { ThemeProvider } from "@/components/admin/theme-provider";

export default function AdminLoginPage() {
  // ClerkProvider is already in the root layout.tsx, no need to duplicate it here
  return (
    <ThemeProvider>
      <AdminLogin />
    </ThemeProvider>
  );
}
