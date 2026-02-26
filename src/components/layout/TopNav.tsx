"use client";

import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import {
  Bell,
  LogOut,
  Search,
  Settings,
  Shield,
  User,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TopNav() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-muted bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="-ml-1 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] font-mono">
              Toggle Sidebar{" "}
              <kbd className="ml-1 opacity-50">⌘B</kbd> or{" "}
              <kbd className="opacity-50">⌘\</kbd>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="hidden md:flex relative max-w-sm group">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            id="platform-search"
            type="search"
            placeholder="Search platform..."
            className="h-9 w-64 rounded-xl border border-muted bg-background/50 pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50 group-focus-within:opacity-0 transition-opacity">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              /
            </kbd>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-0">
            {/* ── User info header ── */}
            <div className="px-4 py-3 border-b border-muted">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {user?.name ?? "Admin User"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email ?? "admin@finova.io"}
                  </span>
                </div>
              </div>
              {user?.role && (
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {user.role}
                  </span>
                </div>
              )}
            </div>

            {/* ── Navigation ── */}
            <DropdownMenuGroup className="p-1.5">
              <DropdownMenuItem
                className="gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer"
                onClick={() => router.push("/settings/account")}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer"
                onClick={() => router.push("/settings")}
              >
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Platform Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            {/* ── Log out ── */}
            <DropdownMenuSeparator className="my-0" />
            <div className="p-1.5">
              <DropdownMenuItem
                className="gap-2.5 rounded-lg px-2.5 py-2 text-destructive focus:text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
