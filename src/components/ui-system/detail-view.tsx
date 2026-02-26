"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

// ── Section ────────────────────────────────────────────────────────────────

export interface DetailSection {
  /** Section heading (uppercase label) */
  title: string;
  /** Optional icon before the title */
  icon?: React.ReactNode;
  /** The content rendered inside the section */
  content: React.ReactNode;
}

// ── Row ────────────────────────────────────────────────────────────────────

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
  colSpan?: boolean;
}

export function DetailRow({ label, children, colSpan }: DetailRowProps) {
  return (
    <div className={`space-y-0.5 ${colSpan ? "col-span-2" : ""}`}>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

// ── Warning Banner ─────────────────────────────────────────────────────────

interface WarningBannerProps {
  icon?: React.ReactNode;
  title?: string;
  warnings: string[];
}

export function WarningBanner({ icon, title = "Warnings", warnings }: WarningBannerProps) {
  if (warnings.length === 0) return null;
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">{title}</span>
      </div>
      <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-0.5 ml-6 list-disc">
        {warnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </div>
  );
}

// ── Main DetailView ────────────────────────────────────────────────────────

interface DetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Warning strings shown at the top */
  warnings?: string[];
  warningIcon?: React.ReactNode;
  /** Array of sections to render */
  sections: DetailSection[];
  /** Optional width class, default w-full sm:max-w-[540px] */
  className?: string;
}

export function DetailView({
  isOpen,
  onClose,
  title,
  description,
  warnings = [],
  warningIcon,
  sections,
  className,
}: DetailViewProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className={`${className || "w-full sm:max-w-135"} p-0 flex flex-col`}>
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle className="text-lg">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-6">
            {/* Warnings */}
            {warnings.length > 0 && (
              <WarningBanner icon={warningIcon} warnings={warnings} />
            )}

            {sections.map((section, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <Separator />}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    {section.icon}
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </h3>
                  </div>
                  {section.content}
                </section>
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
