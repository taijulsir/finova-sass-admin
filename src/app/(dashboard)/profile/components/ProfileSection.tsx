"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Globe, Camera, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccountService, UserProfile, UpdateProfileDto } from "@/services/account.service";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

interface Props {
  profile: UserProfile;
  onProfileUpdated: (p: UserProfile) => void;
}

export function ProfileSection({ profile, onProfileUpdated }: Props) {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState<UpdateProfileDto>({
    name: profile.name,
    phone: profile.phone ?? "",
    timezone: profile.timezone ?? "UTC",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: profile.name,
      phone: profile.phone ?? "",
      timezone: profile.timezone ?? "UTC",
    });
    setDirty(false);
  }, [profile]);

  const handleChange = (field: keyof UpdateProfileDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const updated = await AccountService.updateProfile(form);
      onProfileUpdated(updated);
      // sync name/avatar to auth store
      if (user) setUser({ ...user, name: updated.name, avatar: updated.avatar });
      setDirty(false);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const avatarInitial = profile.name?.charAt(0).toUpperCase() ?? "A";

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium">Personal Information</CardTitle>
        <CardDescription className="text-xs">
          Update your name, phone, and timezone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-muted-foreground/10"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-muted-foreground/10 text-primary font-semibold text-xl">
                {avatarInitial}
              </div>
            )}
            <button
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Upload avatar (coming soon)"
            >
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
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
              value={form.name ?? ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-9 text-sm"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              Email Address
            </Label>
            <Input
              value={profile.email}
              readOnly
              className="h-9 text-sm bg-muted/50"
              title="Email cannot be changed here"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              Phone
            </Label>
            <Input
              value={form.phone ?? ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="h-9 text-sm"
              placeholder="+1 555 000 0000"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3 w-3" />
              Timezone
            </Label>
            <Select
              value={form.timezone ?? "UTC"}
              onValueChange={(v) => handleChange("timezone", v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz} className="text-sm">
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="gap-1.5 text-xs h-8"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
