"use client";

import type { AuthProvider, UserIdentity } from "ra-core";

type ClerkLikeUser = {
  id: string;
  fullName?: string | null;
  username?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  imageUrl?: string | null;
  publicMetadata?: { 
    role?: string;
    roles?: string[];
    branchId?: string;
  } | null;
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
  
  // Wait for Clerk to be available
  let attempts = 0;
  while (attempts < 10) {
    const clerk = (window as unknown as { Clerk?: ClerkLike }).Clerk ?? null;
    if (clerk) {
      if (typeof clerk.load === "function") {
        try {
          await clerk.load();
        } catch {
          // ignore load errors; treated as unauthenticated
        }
      }
      return clerk;
    }
    // Wait a bit before trying again
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  return null;
}

async function isSignedIn(): Promise<boolean> {
  const clerk = await loadClerk();
  return Boolean(clerk?.user);
}

async function getUser(): Promise<ClerkLikeUser> {
  const clerk = await loadClerk();
  return clerk?.user ?? null;
}

function getBranchId(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem('selectedBranchId') || 'branch1';
  }
  return 'branch1';
}

const authProvider: AuthProvider = {
  async login() {
    if (typeof window !== "undefined") {
      window.location.href = "/sign-in";
    }
    return Promise.resolve();
  },
  async logout() {
    const clerk = await loadClerk();
    if (clerk && typeof clerk.signOut === "function") {
      try {
        await clerk.signOut();
        // Clear branch selection
        if (typeof window !== "undefined") {
          localStorage.removeItem('selectedBranchId');
        }
      } catch {
        // ignore signOut errors; treat as logged out
      }
    }
    if (typeof window !== "undefined") {
      window.location.href = "/sign-in";
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
    
    const identity: UserIdentity & { roles?: string[]; branchId?: string } = {
      id: user.id,
      fullName:
        user.fullName ??
        user.username ??
        user.primaryEmailAddress?.emailAddress ??
        undefined,
      avatar: user.imageUrl ?? undefined,
    };
    
    // Get role from user metadata
    let roles: string[] = [];
    if (user?.publicMetadata?.role) {
      roles = [user.publicMetadata.role];
    } else if (user?.publicMetadata?.roles) {
      roles = user.publicMetadata.roles;
    }
    
    // Add branch ID
    const branchId = getBranchId();
    identity.branchId = branchId;
    
    if (roles.length > 0) identity.roles = roles;
    return identity;
  },
  async getPermissions() {
    const user = await getUser();
    
    let roles: string[] = [];
    if (user?.publicMetadata?.role) {
      roles = [user.publicMetadata.role];
    } else if (user?.publicMetadata?.roles) {
      roles = user.publicMetadata.roles;
    }
    
    return roles as unknown;
  },
};

export default authProvider;
