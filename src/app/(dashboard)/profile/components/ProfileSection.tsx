"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Globe, Loader2, Check } from "lucide-react";
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
import { ImageUploader, resolveAvatar } from "@/components/ui/image-uploader/image-uploader";
import { AdminService } from "@/services/admin.service";
import { isAxiosError } from "axios";

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
  const [avatarValue, setAvatarValue] = useState<File | string | undefined>(profile.avatar);
  const [form, setForm] = useState<UpdateProfileDto>({
    name: profile.name,
    phone: profile.phone ?? "",
    timezone: profile.timezone ?? "UTC",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAvatarValue(profile.avatar);
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
    let uploadedAvatarUrl: string | null = null;
    try {
      const avatarUrl = await resolveAvatar(avatarValue, "users", 200, 200);
      if (avatarUrl && avatarValue instanceof File) uploadedAvatarUrl = avatarUrl;
      const updated = await AccountService.updateProfile({ ...form, avatar: avatarUrl });
      onProfileUpdated(updated);
      // sync name/avatar to auth store
      if (user) setUser({ ...user, name: updated.name, avatar: updated.avatar });
      setDirty(false);
      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      if (uploadedAvatarUrl) {
        AdminService.deleteUploadedImage(uploadedAvatarUrl).catch(() => {});
      }
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ?? err.message
        : err instanceof Error
          ? err.message
          : "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium">Personal Information</CardTitle>
        <CardDescription className="text-xs">
          Update your name, phone, and timezone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16">
            <ImageUploader
              value={avatarValue}
              onChange={(value) => {
                setAvatarValue(value);
                setDirty(true);
              }}
              label=""
              shape="circle"
              width={200}
              height={200}
              folder="users"
              className="w-16"
              dropzoneClassName="w-16 h-16"
            />
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
