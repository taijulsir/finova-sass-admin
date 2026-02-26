"use client";

import { ToggleLeft, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const EXAMPLE_FLAGS = [
  { key: "ai_assistant",        label: "AI Assistant",           desc: "Enable AI-powered assistant for organizations",         enabled: true,  orgs: 12 },
  { key: "advanced_analytics",  label: "Advanced Analytics",     desc: "Unlock advanced analytics dashboard",                   enabled: false, orgs: 0 },
  { key: "custom_branding",     label: "Custom Branding",        desc: "Allow organizations to customize branding",             enabled: true,  orgs: 45 },
  { key: "api_access",          label: "API Access",             desc: "Enable REST API access for integrations",               enabled: false, orgs: 3 },
  { key: "multi_workspace",     label: "Multi-Workspace",        desc: "Allow multiple workspaces per organization",            enabled: false, orgs: 0 },
];

export default function FeatureFlagsPage() {
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
        <div className="space-y-2">
          {EXAMPLE_FLAGS.map((flag) => (
            <Card key={flag.key}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{flag.label}</p>
                    <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                      {flag.key}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{flag.desc}</p>
                  {flag.orgs > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Active for <span className="font-medium text-foreground">{flag.orgs}</span> organizations
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="outline" className="text-[10px]">
                    {flag.enabled ? "Global" : "Per-org"}
                  </Badge>
                  <Switch checked={flag.enabled} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
