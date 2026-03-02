"use client";

import { useEffect, useState } from "react";
import { ToggleLeft, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";

type Flag = {
  id: string;
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
  global: boolean;
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/feature-flags")
      .then((res) => {
        if (!mounted) return;
        setFlags(res.data?.data ?? []);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to load feature flags");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-none flex items-center gap-2">
              <ToggleLeft className="h-5 w-5 text-primary" />
              Feature Flags
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Enable or disable features per organization or globally.
            </p>
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Flag
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pb-3 shrink-0">
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search flags..." className="pl-8 h-8 text-sm" />
        </div>
      </div>

      {/* Flags list */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">Loading...</div>
        ) : error ? (
          <div className="text-center text-sm text-destructive">{error}</div>
        ) : flags && flags.length > 0 ? (
          <div className="space-y-2">
            {flags.map((flag) => (
              <Card key={flag.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{flag.label}</p>
                      <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                        {flag.key}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                    {flag.global ? (
                      <p className="text-[10px] text-muted-foreground mt-1">Global</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className="text-[10px]">
                      {flag.global ? "Global" : "Per-org"}
                    </Badge>
                    <Switch checked={flag.enabled} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ToggleLeft className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No feature flags yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Create flags to roll out features gradually.</p>
          </div>
        )}
      </div>
    </div>
  );
}
