"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { useTheme } from "next-themes";

import { useSidebar } from "@/components/ui/sidebar";

const navigationItems = [
  { url: "/", title: "Dashboard" },
  { url: "/organizations", title: "Organizations" },
  { url: "/subscriptions", title: "Subscriptions" },
  { url: "/users", title: "Users" },
  { url: "/audit", title: "Audit Logs" },
  { url: "/analytics", title: "Analytics" },
  { url: "/settings", title: "Settings" },
];

export function KeyboardShortcutManager() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if user is typing
      const activeElement = document.activeElement;
      const isTyping =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement)?.isContentEditable;

      // Global logout: Shift + Q
      if (event.shiftKey && event.key.toUpperCase() === "Q") {
        event.preventDefault();
        logout();
        router.push("/login");
        toast.success("Logged out successfully");
        return;
      }

      // Sidebar Toggle: Cmd + \ (Safe alternative to Cmd+B which can double-trigger or conflict with browser)
      if ((event.metaKey || event.ctrlKey) && event.key === "\\") {
        event.preventDefault();
        toggleSidebar();
        return;
      }

      // Theme toggle: Alt + T (Mac produces special char with Alt, so use event.code)
      if (event.altKey && event.code === "KeyT") {
        event.preventDefault();
        const currentEffectiveTheme = theme === "system" ? resolvedTheme : theme;
        const newTheme = currentEffectiveTheme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        toast.info(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} Mode Activated`, { 
          duration: 1000,
          id: "theme-toggle"
        });
        return;
      }

      // If user is typing, stop here (except for global shortcuts or ESC)
      if (isTyping && event.key !== "Escape") return;

      // Navigation: Alt + [1-7] (Mac: Option + 1-7)
      // Digit check using event.code for layout independence
      if (event.altKey && /^Digit[1-7]$/.test(event.code)) {
        event.preventDefault();
        const index = parseInt(event.code.replace("Digit", ""), 10) - 1;
        const target = navigationItems[index];

        if (target && pathname !== target.url) {
          router.push(target.url);
          toast.info(`Navigating to ${target.title}`, { duration: 1000 });
        }
        return;
      }

      // Search: "/" focus
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        const searchInput = document.getElementById("platform-search") as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // Refresh data: Alt + R
      if (event.altKey && event.key.toLowerCase() === "r") {
        event.preventDefault();
        window.location.reload();
        return;
      }
      
      // Escape to blur search
      if (event.key === "Escape" && activeElement instanceof HTMLInputElement) {
        activeElement.blur();
        return;
      }
    },
    [router, pathname, logout, toggleSidebar, theme, setTheme, resolvedTheme]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null; // Side effect only component
}

