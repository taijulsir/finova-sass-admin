"use client";

import * as React from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  History,
  BarChart3,
  Settings,
  ShieldCheck,
  Layers,
  Tag,
  ToggleLeft,
  LifeBuoy,
  MessageSquare,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/use-permission";
import { useAuthStore } from "@/lib/store";
import type { ModuleKey } from "@/lib/permissions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  module?: ModuleKey;
  /** Optional badge — pass a number for counts (e.g. open tickets), string for labels */
  badge?: number | string;
  /** Future: set to false to hard-hide regardless of permission */
  enabled?: boolean;
}

interface SidebarGroup {
  /** Section label shown above the group — hidden when sidebar is icon-only */
  label: string;
  items: NavItem[];
}

// ─── Navigation Definition ────────────────────────────────────────────────────

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: "Core",
    items: [
      { title: "Dashboard",         url: "/",              icon: LayoutDashboard },
      { title: "Admin Users",       url: "/users",         icon: Users,      module: "USERS" },
      { title: "Organizations",     url: "/organizations", icon: Building2,  module: "ORGANIZATIONS" },
      { title: "Subscriptions",     url: "/subscriptions", icon: CreditCard, module: "SUBSCRIPTIONS" },
      { title: "Plans",             url: "/plans",         icon: Layers,     module: "PLANS" },
      { title: "Roles & Permissions", url: "/roles",       icon: ShieldCheck, module: "ROLES" },
    ],
  },
  {
    label: "Growth",
    items: [
      { title: "Coupons",       url: "/coupons",       icon: Tag,        module: "COUPONS" },
      { title: "Feature Flags", url: "/feature-flags", icon: ToggleLeft, module: "FEATURE_FLAGS" },
      { title: "Analytics",     url: "/analytics",     icon: BarChart3,  module: "ANALYTICS" },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Support Tickets", url: "/support",  icon: LifeBuoy,      module: "SUPPORT" },
      { title: "Feedback",        url: "/feedback", icon: MessageSquare, module: "FEEDBACK" },
      { title: "Audit Logs",      url: "/audit",    icon: History,       module: "AUDIT" },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Platform Settings", url: "/settings", icon: Settings },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AppSidebar() {
  const pathname = usePathname();
  const { canViewModule } = usePermission();

  // Use individual stable primitive selectors to avoid unnecessary re-renders
  const user = useAuthStore((s) => s.user);
  const platformRoles = useAuthStore((s) => s.platformRoles);

  // Defer permission-gated rendering until zustand/persist has rehydrated on the client
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  // Filter each group's items by platform permission
  const visibleGroups = SIDEBAR_GROUPS.map((group) => ({
    ...group,
    items: mounted
      ? group.items.filter(
          (item) =>
            item.enabled !== false &&
            (!item.module || canViewModule(item.module))
        )
      : group.items, // render all on server to avoid SSR mismatch
  })).filter((group) => group.items.length > 0);

  // User display info
  const displayName = user?.name ?? "Admin";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const roleLabel = platformRoles?.[0] ?? user?.globalRole ?? "Admin";

  return (
    <Sidebar collapsible="icon" className="border-r border-muted bg-card">
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <SidebarHeader className="h-16 flex px-4 border-b border-muted">
        <Link href="/" className="flex items-center group">
          {/* Collapsed: icon only */}
          <Image
            src="/finova-without-text.svg"
            alt="Finova"
            width={36}
            height={36}
            className="shrink-0 group-data-[collapsible=icon]:block hidden"
            priority
          />
          {/* Expanded: full logo with text */}
          <Image
            src="/finova-with-text.svg"
            alt="Finova"
            width={130}
            height={32}
            className="shrink-0 group-data-[collapsible=icon]:hidden block"
            priority
          />
        </Link>
      </SidebarHeader>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <SidebarContent className="px-2 py-3">
        {visibleGroups.map((group, groupIdx) => (
          <React.Fragment key={group.label}>
            {groupIdx > 0 && <SidebarSeparator className="my-1 mx-2 opacity-50" />}

            <SidebarGroup className="py-1">
              {/* Section label — hidden in icon-only mode via group-data-[collapsible=icon] */}
              <SidebarGroupLabel className="px-3 mb-1 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60 group-data-[collapsible=icon]:hidden select-none">
                {group.label}
              </SidebarGroupLabel>

              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.url === "/"
                      ? pathname === "/"
                      : pathname === item.url || pathname.startsWith(item.url + "/");

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "rounded-xl h-10 px-3 transition-all duration-200 group/item cursor-pointer",
                          isActive
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <Link href={item.url} className="flex items-center gap-2.5 w-full">
                          <item.icon
                            className={cn(
                              "h-4.5 w-4.5 shrink-0",
                              isActive ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground"
                            )}
                          />
                          <span className="font-medium text-sm group-data-[collapsible=icon]:hidden truncate">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>

                      {/* Badge — e.g. open ticket count */}
                      {item.badge !== undefined && (
                        <SidebarMenuBadge
                          className={cn(
                          "group-data-[collapsible=icon]:hidden text-[10px] font-semibold min-w-4.5 h-4.5 px-1",
                            isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>

      {/* ── User Footer ───────────────────────────────────────────────────── */}
      <SidebarFooter className="border-t border-muted p-4 group-data-[collapsed=true]:p-2">
        <div className="flex items-center gap-3 transition-all">
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={displayName} className="h-8 w-8 object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0">
            <span className="text-sm font-semibold leading-none truncate">{displayName}</span>
            <span className="text-xs text-muted-foreground mt-1 truncate">{roleLabel}</span>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
