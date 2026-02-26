"use client";

import {
  Settings,
  Lock,
  ShieldCheck,
  Monitor,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountSettingsPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-none flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Account Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your security preferences and active sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 space-y-5">
        {/* ── Change Password ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription className="text-xs">
              Update your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-9 text-sm pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showCurrent ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div />
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-9 text-sm pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showNew ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Confirm New Password
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-muted-foreground">
                Minimum 8 characters, including uppercase, lowercase, and a
                number.
              </p>
              <Button size="sm" disabled className="gap-1.5 text-xs">
                Update Password
                <Badge
                  variant="outline"
                  className="ml-1 text-[9px] px-1.5 py-0"
                >
                  Soon
                </Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Two-Factor Authentication ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription className="text-xs">
              Add an extra layer of security to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-muted p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <ShieldCheck className="h-4.5 w-4.5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Authenticator App
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use an authenticator app to generate one-time codes.
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" disabled className="gap-1.5 text-xs">
                Enable
                <Badge
                  variant="outline"
                  className="ml-1 text-[9px] px-1.5 py-0"
                >
                  Soon
                </Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Active Sessions ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              Active Sessions
            </CardTitle>
            <CardDescription className="text-xs">
              Manage devices where you&apos;re currently signed in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Current session */}
            <div className="flex items-center justify-between rounded-lg border border-muted p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Current Browser</p>
                    <Badge className="bg-green-50 text-green-700 dark:bg-[rgba(54,229,154,0.10)] dark:text-[#36E59A] border-0 text-[10px] px-1.5 py-0">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This device · Last active now
                  </p>
                </div>
              </div>
            </div>

            {/* Placeholder session */}
            <div className="flex items-center justify-between rounded-lg border border-muted p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Chrome on macOS</p>
                  <p className="text-xs text-muted-foreground">
                    192.168.1.x · Last active 2 hours ago
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                variant="outline"
                disabled
                className="gap-1.5 text-xs text-destructive border-destructive/20 hover:bg-destructive/5"
              >
                Revoke All Other Sessions
                <Badge
                  variant="outline"
                  className="ml-1 text-[9px] px-1.5 py-0"
                >
                  Soon
                </Badge>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
