"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldOff,
  QrCode,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountService, Setup2FAResponse } from "@/services/account.service";
import { toast } from "sonner";

interface Props {
  enabled: boolean;
  onStatusChange: (enabled: boolean) => void;
}

export function TwoFactorSection({ enabled, onStatusChange }: Props) {
  // Setup flow
  const [setupData, setSetupData] = useState<Setup2FAResponse | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupOpen, setBackupOpen] = useState(false);
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  // Disable flow
  const [disableOpen, setDisableOpen] = useState(false);
  const [disableToken, setDisableToken] = useState("");
  const [loadingDisable, setLoadingDisable] = useState(false);

  const [copiedSecret, setCopiedSecret] = useState(false);

  // ── Enable flow ─────────────────────────────────────────────────────────────

  const handleSetupOpen = async () => {
    setLoadingSetup(true);
    try {
      const data = await AccountService.setup2FA();
      setSetupData(data);
      setVerifyToken("");
      setSetupOpen(true);
    } catch {
      toast.error("Failed to generate 2FA setup");
    } finally {
      setLoadingSetup(false);
    }
  };

  const handleVerify = async () => {
    if (verifyToken.length !== 6) {
      toast.error("Enter the 6-digit code from your authenticator app");
      return;
    }
    setLoadingVerify(true);
    try {
      const { backupCodes: codes } = await AccountService.verify2FA(verifyToken);
      setSetupOpen(false);
      setSetupData(null);
      setBackupCodes(codes);
      setBackupOpen(true);
      onStatusChange(true);
      toast.success("Two-factor authentication enabled");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Invalid code — try again");
    } finally {
      setLoadingVerify(false);
    }
  };

  // ── Disable flow ────────────────────────────────────────────────────────────

  const handleDisable = async () => {
    if (disableToken.length !== 6) {
      toast.error("Enter the 6-digit code from your authenticator app");
      return;
    }
    setLoadingDisable(true);
    try {
      await AccountService.disable2FA(disableToken);
      setDisableOpen(false);
      setDisableToken("");
      onStatusChange(false);
      toast.success("Two-factor authentication disabled");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Invalid code");
    } finally {
      setLoadingDisable(false);
    }
  };

  const copySecret = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {enabled ? (
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <ShieldOff className="h-4 w-4 text-muted-foreground" />
                )}
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Add an extra layer of security to your account.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={
                enabled
                  ? "border-green-500/30 bg-green-500/10 text-green-600 text-[10px]"
                  : "border-muted text-muted-foreground text-[10px]"
              }
            >
              {enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {enabled ? (
            <div className="flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Your account is protected
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Use your authenticator app to sign in.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  2FA is not enabled
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enable 2FA to secure your account with a time-based one-time password.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {enabled ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setDisableToken(""); setDisableOpen(true); }}
                className="gap-1.5 text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/5"
              >
                <ShieldOff className="h-3.5 w-3.5" />
                Disable 2FA
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSetupOpen}
                disabled={loadingSetup}
                className="gap-1.5 text-xs h-8"
              >
                {loadingSetup ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <QrCode className="h-3.5 w-3.5" />
                )}
                {loadingSetup ? "Loading…" : "Enable 2FA"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Setup Modal ── */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <QrCode className="h-4 w-4" />
              Set up Two-Factor Authentication
            </DialogTitle>
            <DialogDescription className="text-xs">
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>

          {setupData && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <img
                  src={setupData.qrCodeUrl}
                  alt="2FA QR Code"
                  className="h-44 w-44 rounded-lg border border-muted"
                />
              </div>

              {/* Manual entry */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Or enter secret manually
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={setupData.secret}
                    readOnly
                    className="h-8 text-xs font-mono bg-muted/50"
                  />
                  <Button size="sm" variant="outline" className="h-8 px-2.5" onClick={copySecret}>
                    {copiedSecret ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Verify code */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Enter 6-digit verification code
                </Label>
                <Input
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="h-9 text-sm text-center tracking-widest font-mono"
                  maxLength={6}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={() => setSetupOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleVerify} disabled={loadingVerify || verifyToken.length !== 6} className="h-8 text-xs gap-1.5">
              {loadingVerify ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              {loadingVerify ? "Verifying…" : "Verify & Enable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Backup Codes Modal ── */}
      <Dialog open={backupOpen} onOpenChange={setBackupOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Save Your Backup Codes</DialogTitle>
            <DialogDescription className="text-xs">
              Store these codes safely. Each can be used once if you lose access to your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-muted bg-muted/30 p-3">
            {backupCodes.map((code) => (
              <code key={code} className="text-xs font-mono text-center py-1 rounded bg-background border border-muted">
                {code}
              </code>
            ))}
          </div>
          <DialogFooter>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(backupCodes.join("\n"));
                toast.success("Backup codes copied");
              }}
              variant="outline"
              className="h-8 text-xs gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy All
            </Button>
            <Button size="sm" onClick={() => setBackupOpen(false)} className="h-8 text-xs">
              I've saved them
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Disable Modal ── */}
      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <ShieldOff className="h-4 w-4 text-destructive" />
              Disable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription className="text-xs">
              Enter the 6-digit code from your authenticator app to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Verification Code
            </Label>
            <Input
              value={disableToken}
              onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="h-9 text-sm text-center tracking-widest font-mono"
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handleDisable()}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={() => setDisableOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDisable}
              disabled={loadingDisable || disableToken.length !== 6}
              className="h-8 text-xs gap-1.5"
            >
              {loadingDisable ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />}
              {loadingDisable ? "Disabling…" : "Disable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
