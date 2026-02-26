"use client";

import {
  User,
  Mail,
  Phone,
  Shield,
  Clock,
  Calendar,
  Activity,
  Camera,
} from "lucide-react";
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
import { useAuthStore } from "@/lib/store";

export default function ProfilePage() {
  const { user, platformRoles } = useAuthStore();

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-none flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              View and manage your personal information.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 space-y-5">
        {/* ── Avatar & Basic Info ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">
              Personal Information
            </CardTitle>
            <CardDescription className="text-xs">
              Your account details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center ring-2 ring-muted-foreground/10">
                  <User className="h-7 w-7 text-muted-foreground" />
                </div>
                <button className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {user?.name ?? "Admin User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click avatar to change profile picture
                </p>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  Full Name
                </Label>
                <Input
                  value={user?.name ?? "Admin User"}
                  readOnly
                  className="h-9 text-sm bg-muted/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  Email Address
                </Label>
                <Input
                  value={user?.email ?? "admin@finova.io"}
                  readOnly
                  className="h-9 text-sm bg-muted/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  Phone
                </Label>
                <Input
                  placeholder="Not set"
                  readOnly
                  className="h-9 text-sm bg-muted/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Joined
                </Label>
                <Input
                  value={
                    user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"
                  }
                  readOnly
                  className="h-9 text-sm bg-muted/50"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" disabled className="gap-1.5 text-xs">
                Edit Profile
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

        {/* ── Role & Permissions ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Roles & Access
            </CardTitle>
            <CardDescription className="text-xs">
              Your platform roles and permission scope.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(platformRoles.length > 0
                ? platformRoles
                : [user?.role ?? "SUPER_ADMIN"]
              ).map((role: string) => (
                <Badge
                  key={role}
                  className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold uppercase tracking-wider"
                >
                  {role.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-muted p-3">
                <p className="text-xs text-muted-foreground">Global Role</p>
                <p className="text-sm font-medium mt-0.5">
                  {user?.role ?? "Super Admin"}
                </p>
              </div>
              <div className="rounded-lg border border-muted p-3">
                <p className="text-xs text-muted-foreground">Last Login</p>
                <p className="text-sm font-medium mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {user?.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "Today"}
                </p>
              </div>
              <div className="rounded-lg border border-muted p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <p className="text-sm font-medium">Active</p>
                </div>
              </div>
              <div className="rounded-lg border border-muted p-3">
                <p className="text-xs text-muted-foreground">2FA</p>
                <p className="text-sm font-medium mt-0.5 text-amber-500">
                  Not enabled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Activity ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-xs">
              Your latest actions on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Activity timeline coming soon
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Login history, actions, and audit trail will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
