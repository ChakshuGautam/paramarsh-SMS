"use client";

import type { AuthProvider, UserIdentity } from "ra-core";

type ClerkLikeUser = {
  id: string;
  fullName?: string | null;
  username?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  imageUrl?: string | null;
  publicMetadata?: { roles?: string[] } | null;
  organizationMemberships?: Array<{ role?: string | null }> | null;
} | null;

type ClerkLike = {
  user?: ClerkLikeUser;
  load?: () => Promise<void>;
  openSignIn?: () => void;
  signOut?: () => Promise<void> | void;
} | null;

async function loadClerk(): Promise<ClerkLike> {
  if (typeof window === "undefined") return null;
  const clerk = (window as unknown as { Clerk?: ClerkLike }).Clerk ?? null;
  if (!clerk) return null;
  if (typeof clerk.load === "function") {
    try {
      await clerk.load();
    } catch {
      // ignore load errors; treated as unauthenticated
    }
  }
  return clerk;
}

async function isSignedIn(): Promise<boolean> {
  const clerk = await loadClerk();
  return Boolean(clerk?.user);
}

async function getUser(): Promise<ClerkLikeUser> {
  const clerk = await loadClerk();
  return clerk?.user ?? null;
}

const authProvider: AuthProvider = {
  async login() {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    return Promise.resolve();
  },
  async logout() {
    const clerk = await loadClerk();
    if (clerk && typeof clerk.signOut === "function") {
      try {
        await clerk.signOut();
      } catch {
        // ignore signOut errors; treat as logged out
      }
    }
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    return Promise.resolve();
  },
  async checkAuth() {
    return (await isSignedIn()) ? Promise.resolve() : Promise.reject();
  },
  async checkError(error: unknown) {
    const status =
      (error as { status?: number; statusCode?: number } | undefined)?.status ??
      (error as { status?: number; statusCode?: number } | undefined)
        ?.statusCode;
    if (status === 401 || status === 403) return Promise.reject();
    return Promise.resolve();
  },
  async getIdentity(): Promise<UserIdentity> {
    const user = await getUser();
    if (!user) return Promise.reject();
    const identity: UserIdentity & { roles?: string[] } = {
      id: user.id,
      fullName:
        user.fullName ??
        user.username ??
        user.primaryEmailAddress?.emailAddress ??
        undefined,
      avatar: user.imageUrl ?? undefined,
    };
    // Prefer local override when testing RBAC
    let roles = [] as string[];
    if (typeof window !== "undefined") {
      try {
        const override = JSON.parse(
          window.localStorage.getItem("admin.rolesOverride") || "[]"
        );
        if (Array.isArray(override) && override.length > 0) {
          roles = override.filter(Boolean);
        }
      } catch {}
    }
    if (roles.length === 0) {
      roles =
      (user?.publicMetadata?.roles as string[] | undefined) ||
      (user?.organizationMemberships
        ?.map((m) => m.role || undefined)
        .filter(Boolean) as string[] | undefined) ||
      [];
    }
    if (roles.length > 0) identity.roles = roles;
    return identity;
  },
  async getPermissions() {
    const user = await getUser();
    // Prefer local override for RBAC testing
    let roles: string[] = [];
    if (typeof window !== "undefined") {
      try {
        const override = JSON.parse(
          window.localStorage.getItem("admin.rolesOverride") || "[]"
        );
        if (Array.isArray(override) && override.length > 0) {
          roles = override.filter(Boolean);
        }
      } catch {}
    }
    if (roles.length === 0) {
      roles =
        (user?.publicMetadata?.roles as string[] | undefined) ||
        (user?.organizationMemberships
          ?.map((m) => m.role || undefined)
          .filter(Boolean) as string[] | undefined) ||
        [];
    }
    return roles as unknown;
  },
};

export default authProvider;
