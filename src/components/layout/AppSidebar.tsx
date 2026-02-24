"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  History,
  BarChart3,
  Settings,
  ShieldCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/use-permission";
import { useAuthStore } from "@/lib/store";
import type { ModuleKey } from "@/lib/permissions";

/** Each item declares which AdminModule key gates it (undefined = always visible) */
const NAV_ITEMS: { title: string; url: string; icon: React.ElementType; module?: ModuleKey }[] = [
  { title: "Dashboard",     url: "/",              icon: LayoutDashboard, module: "DASHBOARD" },
  { title: "Organizations", url: "/organizations", icon: Building2,       module: "ORGANIZATIONS" },
  { title: "Subscriptions", url: "/subscriptions", icon: CreditCard,      module: "SUBSCRIPTIONS" },
  { title: "Users",         url: "/users",         icon: Users,           module: "USERS" },
  { title: "Designations",  url: "/designations",  icon: ShieldCheck,     module: "DESIGNATIONS" },
  { title: "Audit Logs",    url: "/audit",         icon: History,         module: "AUDIT" },
  { title: "Analytics",     url: "/analytics",     icon: BarChart3,       module: "ANALYTICS" },
  { title: "Settings",      url: "/settings",      icon: Settings,        module: "SETTINGS" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { canViewModule } = usePermission();
  const { user, platformRoles } = useAuthStore((s) => ({ user: s.user, platformRoles: s.platformRoles }));

  // Filter nav items based on platform permissions
  const visibleItems = NAV_ITEMS.filter((item) =>
    !item.module || canViewModule(item.module)
  );

  // Display name / initials
  const displayName = user?.name ?? "Admin";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const roleLabel = platformRoles?.[0] ?? user?.globalRole ?? "Admin";

  return (
    <Sidebar collapsible="icon" className="border-r border-muted bg-card">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-muted">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="size-5" />
          </div>
          <span className="font-bold text-xl tracking-tight transition-opacity duration-300 group-data-[collapsed=true]:opacity-0">
            SaaS<span className="text-primary">Hub</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {visibleItems.map((item, index) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                className={cn(
                  "rounded-xl h-11 px-3 transition-all duration-200 group/item",
                  pathname === item.url
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Link href={item.url} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </div>
                  <kbd className="hidden md:flex items-center opacity-0 group-hover/item:opacity-40 transition-opacity pointer-events-none select-none h-5 gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                    ⌥{index + 1}
                  </kbd>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-muted p-4 group-data-[collapsed=true]:p-2">
        <div className="flex items-center gap-3 transition-all">
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
              : initials}
          </div>
          <div className="flex flex-col group-data-[collapsed=true]:hidden">
            <span className="text-sm font-semibold leading-none">{displayName}</span>
            <span className="text-xs text-muted-foreground mt-1">{roleLabel}</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
