"use client";

import { FileText, Search, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LEVEL_COLORS: Record<string, string> = {
  info:    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400",
  error:   "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400",
};

export default function SystemLogsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-none flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              System Logs
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              View application-level logs, errors, and warnings.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search logs..." className="pl-8 h-8 text-sm" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No logs captured</p>
            <p className="text-xs text-muted-foreground mt-1">
              Application logs will stream here once the logging pipeline is connected.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
        </div>
      </div>
    </div>
  );
}
