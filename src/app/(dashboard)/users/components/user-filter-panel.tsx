'use client';

import { SlidersHorizontal, X, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  ROLE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  EMAIL_VERIFIED_OPTIONS,
  LAST_LOGIN_OPTIONS,
} from '../user-filters';
import type { UseUserFiltersReturn } from '../hooks/use-user-filters';

interface UserFilterPanelProps {
  filterState: UseUserFiltersReturn;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
      {children}
    </p>
  );
}

export function UserFilterPanel({ filterState }: UserFilterPanelProps) {
  const {
    filters,
    isPanelOpen,
    setIsPanelOpen,
    hasActive,
    activeCount,
    toggleMulti,
    setFilter,
    resetFilters,
  } = filterState;

  return (
    <Popover open={isPanelOpen} onOpenChange={setIsPanelOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasActive ? 'default' : 'outline'}
          size="sm"
          className="h-9 gap-1.5 shrink-0"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 min-w-4 px-1 text-[10px] font-bold rounded-full bg-background/20 text-inherit border-0"
            >
              {activeCount}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-145 p-0 shadow-xl border border-border/60 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold">Filter Users</span>
          </div>
          <div className="flex items-center gap-1">
            {hasActive && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={resetFilters}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsPanelOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* 2-column body — no scroll needed */}
        <div className="grid grid-cols-2 divide-x divide-border/60">

          {/* ── LEFT column ─────────────────────────────────────── */}
          <div className="px-4 py-3 space-y-4">

            {/* 1. Role */}
            <div>
              <SectionTitle>Role</SectionTitle>
              <div className="grid grid-cols-2 gap-y-2 gap-x-2">
                {ROLE_FILTER_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                    <Checkbox
                      checked={filters.roles.includes(opt.value)}
                      onCheckedChange={() => toggleMulti('roles', opt.value)}
                      className="shrink-0"
                    />
                    <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* 2. Email Verification */}
            <div>
              <SectionTitle>Email Verification</SectionTitle>
              <div className="flex gap-1.5">
                {EMAIL_VERIFIED_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFilter('emailVerified', opt.value as UserFilters['emailVerified'])}
                    className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                      filters.emailVerified === opt.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* 3. Last Login */}
            <div>
              <SectionTitle>Last Login</SectionTitle>
              <Select
                value={filters.lastLogin || '__all__'}
                onValueChange={(v) =>
                  setFilter('lastLogin', (v === '__all__' ? '' : v) as UserFilters['lastLogin'])
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__" className="text-sm">Any time</SelectItem>
                  {LAST_LOGIN_OPTIONS.filter((o) => o.value !== '').map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {filters.lastLogin === 'custom' && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs"
                      value={filters.lastLoginFrom}
                      onChange={(e) => setFilter('lastLoginFrom', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs"
                      value={filters.lastLoginTo}
                      onChange={(e) => setFilter('lastLoginTo', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT column ────────────────────────────────────── */}
          <div className="px-4 py-3 space-y-4">

            {/* 4. Status */}
            <div>
              <SectionTitle>Status</SectionTitle>
              <div className="grid grid-cols-2 gap-y-2 gap-x-2">
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                    <Checkbox
                      checked={filters.statuses.includes(opt.value)}
                      onCheckedChange={() => toggleMulti('statuses', opt.value)}
                      className="shrink-0"
                    />
                    <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* 5. Joined Date */}
            <div>
              <SectionTitle>Joined Date</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="date"
                    className="h-8 text-xs"
                    value={filters.joinedFrom}
                    onChange={(e) => setFilter('joinedFrom', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="date"
                    className="h-8 text-xs"
                    value={filters.joinedTo}
                    onChange={(e) => setFilter('joinedTo', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {hasActive && (
          <div className="border-t bg-muted/20 px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {activeCount} filter{activeCount !== 1 ? 's' : ''} active
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={resetFilters}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// re-export the type needed by the panel consumer
import type { UserFilters } from '../user-filters';
