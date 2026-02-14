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
  ChevronLeft,
  ChevronRight,
  Menu,
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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Organizations",
    url: "/dashboard/organizations",
    icon: Building2,
  },
  {
    title: "Subscriptions",
    url: "/dashboard/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Audit Logs",
    url: "/dashboard/audit",
    icon: History,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-muted bg-card">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-muted">
        <Link href="/dashboard" className="flex items-center gap-2 group">
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
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                className={cn(
                  "rounded-xl h-11 px-3 transition-all duration-200",
                  pathname === item.url 
                    ? "bg-primary/10 text-primary hover:bg-primary/20" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Link href={item.url}>
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-muted p-4 group-data-[collapsed=true]:p-2">
        <div className="flex items-center gap-3 transition-all">
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            JD
          </div>
          <div className="flex flex-col group-data-[collapsed=true]:hidden">
            <span className="text-sm font-semibold leading-none">John Doe</span>
            <span className="text-xs text-muted-foreground mt-1">Super Admin</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
