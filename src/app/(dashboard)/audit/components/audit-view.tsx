"use client";

import { Badge } from "@/components/ui/badge";

interface AuditViewProps {
  log: any;
}

export function AuditView({ log }: AuditViewProps) {
  if (!log) return null;

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Action
          </p>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px] font-bold tracking-wider"
            >
              {log.action?.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Resource
          </p>
          <p className="font-semibold">{log.resource}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            User
          </p>
          <div className="flex flex-col">
            <p className="font-semibold">{log.userId?.name || "System"}</p>
            <p className="text-xs text-muted-foreground">
              {log.userId?.email || "automated"}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Timestamp
          </p>
          <p className="font-semibold">
            {new Date(log.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Event Metadata
        </p>
        <div className="bg-muted p-4 rounded-xl overflow-auto max-h-75 border border-muted/50">
          <pre className="text-xs font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap break-all">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
