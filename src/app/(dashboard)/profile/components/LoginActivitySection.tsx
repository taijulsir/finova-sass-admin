"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Monitor,
  Smartphone,
  Loader2,
  RefreshCw,
  MapPin,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
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
import { AccountService, LoginActivity } from "@/services/account.service";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

function DeviceIcon({ device }: { device: string }) {
  const isMobile = /mobile|android|ios|iphone|ipad/i.test(device ?? "");
  return isMobile ? (
    <Smartphone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
  ) : (
    <Monitor className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
  );
}

const PAGE_SIZE = 10;

export function LoginActivitySection() {
  const [activity, setActivity] = useState<LoginActivity[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const res = await AccountService.getLoginHistory({ page: p, limit: PAGE_SIZE });
        setActivity(res.activity);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch {
        toast.error("Failed to load login history");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load(page);
  }, [load, page]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Login History
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Recent sign-in attempts to your account.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => load(page)}
            disabled={loading}
            className="h-8 w-8 p-0 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No login history yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              {activity.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 rounded-lg border border-muted px-3 py-2.5"
                >
                  {/* Status icon */}
                  {item.status === "success" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  )}

                  {/* Device icon */}
                  <DeviceIcon device={item.device} />

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium truncate">
                        {item.browser || "Unknown browser"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.device || "Unknown device"}
                      </span>
                      {item.ipAddress && (
                        <span className="text-xs text-muted-foreground">
                          · {item.ipAddress}
                        </span>
                      )}
                      {item.location && (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          {item.location}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(item.loginTime), "MMM d, yyyy · h:mm a")}
                      {" · "}
                      {formatDistanceToNow(new Date(item.loginTime), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Status badge */}
                  <Badge
                    className={
                      item.status === "success"
                        ? "bg-green-500/10 text-green-600 border-green-500/20 text-[9px] px-1.5 py-0 shrink-0"
                        : "bg-destructive/10 text-destructive border-destructive/20 text-[9px] px-1.5 py-0 shrink-0"
                    }
                  >
                    {item.status === "success" ? "Success" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-1">
                    {page} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
