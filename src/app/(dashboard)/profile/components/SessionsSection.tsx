"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Monitor,
  Smartphone,
  Globe,
  Trash2,
  LogOut,
  Loader2,
  RefreshCw,
  MapPin,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountService, UserSession } from "@/services/account.service";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

function DeviceIcon({ device }: { device: string }) {
  const isMobile = /mobile|android|ios|iphone|ipad/i.test(device);
  return isMobile ? (
    <Smartphone className="h-4 w-4 text-muted-foreground" />
  ) : (
    <Monitor className="h-4 w-4 text-muted-foreground" />
  );
}

export function SessionsSection() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AccountService.getSessions();
      setSessions(data);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      await AccountService.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      toast.success("Session revoked");
    } catch {
      toast.error("Failed to revoke session");
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    try {
      await AccountService.revokeAllSessions();
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast.success("All other sessions revoked");
    } catch {
      toast.error("Failed to revoke sessions");
    } finally {
      setRevokingAll(false);
      setConfirmOpen(false);
    }
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const currentSession = sessions.find((s) => s.isCurrent);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Active Sessions
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Devices currently signed in to your account.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={load}
            disabled={loading}
            className="h-8 w-8 p-0 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Globe className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No active sessions found</p>
          </div>
        ) : (
          <>
            {/* Current session */}
            {currentSession && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DeviceIcon device={currentSession.device} />
                    <span className="text-sm font-medium">
                      {currentSession.browser || "Unknown browser"}
                    </span>
                    <Badge className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20 font-semibold">
                      Current
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pl-6">
                  <span>{currentSession.device || "Unknown device"}</span>
                  {currentSession.ipAddress && (
                    <>
                      <span>·</span>
                      <span>{currentSession.ipAddress}</span>
                    </>
                  )}
                  {currentSession.location && (
                    <>
                      <span>·</span>
                      <MapPin className="h-3 w-3" />
                      <span>{currentSession.location}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>
                    Active{" "}
                    {formatDistanceToNow(new Date(currentSession.lastActiveAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Other sessions */}
            {otherSessions.map((session) => (
              <div
                key={session.sessionId}
                className="flex items-center justify-between rounded-lg border border-muted p-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <DeviceIcon device={session.device} />
                    <span className="text-sm font-medium truncate">
                      {session.browser || "Unknown browser"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pl-6 flex-wrap">
                    <span>{session.device || "Unknown device"}</span>
                    {session.ipAddress && (
                      <>
                        <span>·</span>
                        <span>{session.ipAddress}</span>
                      </>
                    )}
                    {session.location && (
                      <>
                        <span>·</span>
                        <MapPin className="h-3 w-3" />
                        <span>{session.location}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>
                      Active{" "}
                      {formatDistanceToNow(new Date(session.lastActiveAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRevoke(session.sessionId)}
                  disabled={revoking === session.sessionId}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                >
                  {revoking === session.sessionId ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            ))}

            {/* Revoke all */}
            {otherSessions.length > 0 && (
              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={revokingAll}
                  onClick={() => setConfirmOpen(true)}
                  className="gap-1.5 text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/5"
                >
                  {revokingAll ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                  Revoke All Other Sessions
                </Button>

                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Revoke All Other Sessions?</DialogTitle>
                      <DialogDescription>
                        This will sign out {otherSessions.length} other session
                        {otherSessions.length === 1 ? "" : "s"}. Your current session
                        will remain active.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmOpen(false)}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleRevokeAll}
                        disabled={revokingAll}
                        className="h-8 text-xs gap-1.5"
                      >
                        {revokingAll && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Revoke All
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
