"use client";

import { Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const PRESETS: Record<string, string[]> = {
  Admin: ["admin"],
  Teacher: ["teacher"],
  "Admin + Teacher": ["admin", "teacher"],
  None: [],
};

export function RbacRolesMenuButton() {
  if (typeof window === "undefined") return null;
  const current = getOverride();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50 shadow">
          <Shield className="mr-2 h-4 w-4" />
          Roles
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>RBAC test roles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(PRESETS).map(([label, roles]) => (
          <DropdownMenuItem key={label} onClick={() => setOverride(roles)}>
            {label}
            <Check className={cn("ml-auto", isEqual(current, roles) ? "" : "hidden")} />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          setOverride([]);
          window.location.reload();
        }}>Clear & Reload</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getOverride(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem("admin.rolesOverride") || "[]");
  } catch {
    return [];
  }
}

function setOverride(roles: string[]) {
  window.localStorage.setItem("admin.rolesOverride", JSON.stringify(roles));
}

function isEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const aa = [...a].sort().join(",");
  const bb = [...b].sort().join(",");
  return aa === bb;
}
