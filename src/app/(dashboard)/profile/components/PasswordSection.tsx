"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
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
import { AccountService } from "@/services/account.service";
import { toast } from "sonner";

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm pr-9"
        autoComplete="new-password"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function strengthLabel(pw: string): { label: string; color: string; width: string } {
  if (!pw) return { label: "", color: "", width: "0%" };
  const score = [/.{8,}/, /[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) =>
    r.test(pw)
  ).length;
  if (score <= 2) return { label: "Weak", color: "bg-destructive", width: "33%" };
  if (score <= 3) return { label: "Fair", color: "bg-amber-500", width: "60%" };
  return { label: "Strong", color: "bg-green-500", width: "100%" };
}

export function PasswordSection() {
  const [form, setForm] = useState({ current: "", newPw: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const strength = strengthLabel(form.newPw);

  const handleSubmit = async () => {
    if (!form.current) return toast.error("Enter your current password");
    if (form.newPw.length < 8) return toast.error("New password must be at least 8 characters");
    if (form.newPw !== form.confirm) return toast.error("Passwords do not match");
    setSaving(true);
    try {
      await AccountService.changePassword({
        currentPassword: form.current,
        newPassword: form.newPw,
      });
      toast.success("Password changed. Other sessions have been revoked.");
      setForm({ current: "", newPw: "", confirm: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          Change Password
        </CardTitle>
        <CardDescription className="text-xs">
          Choose a strong password. All other sessions will be signed out.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Current Password</Label>
          <PasswordInput
            value={form.current}
            onChange={(v) => setForm((f) => ({ ...f, current: v }))}
            placeholder="Your current password"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">New Password</Label>
          <PasswordInput
            value={form.newPw}
            onChange={(v) => setForm((f) => ({ ...f, newPw: v }))}
            placeholder="At least 8 characters"
          />
          {form.newPw && (
            <div className="mt-1.5 space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className={`text-[10px] font-medium ${strength.color.replace("bg-", "text-")}`}>
                {strength.label}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Confirm New Password</Label>
          <PasswordInput
            value={form.confirm}
            onChange={(v) => setForm((f) => ({ ...f, confirm: v }))}
            placeholder="Repeat new password"
          />
          {form.confirm && form.confirm !== form.newPw && (
            <p className="text-[10px] text-destructive mt-1">Passwords do not match</p>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-muted bg-muted/30 px-3 py-2.5">
          <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Changing your password will sign you out of all other active sessions.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={saving || !form.current || !form.newPw || !form.confirm}
            className="gap-1.5 text-xs h-8"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
            {saving ? "Updating…" : "Update Password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
