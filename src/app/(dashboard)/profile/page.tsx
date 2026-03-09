"use client";

import { useState, useEffect } from "react";
import {
  User,
  KeyRound,
  ShieldCheck,
  Globe,
  Activity,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountService, UserProfile } from "@/services/account.service";
import { ProfileSection } from "./components/ProfileSection";
import { PasswordSection } from "./components/PasswordSection";
import { TwoFactorSection } from "./components/TwoFactorSection";
import { SessionsSection } from "./components/SessionsSection";
import { LoginActivitySection } from "./components/LoginActivitySection";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AccountService.getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <div>
          <h1 className="text-lg font-semibold tracking-tight leading-none flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your profile, security, and active sessions.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 pb-6 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="profile" className="space-y-5">
            <TabsList className="h-9 gap-0.5 bg-muted/60">
              <TabsTrigger value="profile" className="gap-1.5 text-xs h-7 px-3">
                <User className="h-3.5 w-3.5" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="password" className="gap-1.5 text-xs h-7 px-3">
                <KeyRound className="h-3.5 w-3.5" />
                Password
              </TabsTrigger>
              <TabsTrigger value="2fa" className="gap-1.5 text-xs h-7 px-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                2FA
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-1.5 text-xs h-7 px-3">
                <Globe className="h-3.5 w-3.5" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-1.5 text-xs h-7 px-3">
                <Activity className="h-3.5 w-3.5" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0">
              {profile && (
                <ProfileSection
                  profile={profile}
                  onProfileUpdated={setProfile}
                />
              )}
            </TabsContent>

            <TabsContent value="password" className="mt-0">
              <PasswordSection />
            </TabsContent>

            <TabsContent value="2fa" className="mt-0">
              <TwoFactorSection
                enabled={profile?.twoFactorEnabled ?? false}
                onStatusChange={(val: boolean) =>
                  setProfile((p) => (p ? { ...p, twoFactorEnabled: val } : p))
                }
              />
            </TabsContent>

            <TabsContent value="sessions" className="mt-0">
              <SessionsSection />
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <LoginActivitySection />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
