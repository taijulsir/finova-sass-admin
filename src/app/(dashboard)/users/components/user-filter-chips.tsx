'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ROLE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  LAST_LOGIN_OPTIONS,
  UserFilters,
} from '../user-filters';
import type { UseUserFiltersReturn } from '../hooks/use-user-filters';

interface UserFilterChipsProps {
  filterState: UseUserFiltersReturn;
  totalItems: number;
}

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 h-6 text-xs font-medium rounded-full border border-border/60 bg-muted hover:bg-muted/80 cursor-default"
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </Badge>
  );
}

export function UserFilterChips({ filterState, totalItems }: UserFilterChipsProps) {
  const { filters, hasActive, removeFilterChip, resetFilters } = filterState;

  if (!hasActive) return null;

  const roleLabel = (v: string) =>
    ROLE_FILTER_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const statusLabel = (v: string) =>
    STATUS_FILTER_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const lastLoginLabel = (v: string) =>
    LAST_LOGIN_OPTIONS.find((o) => o.value === v)?.label ?? v;

  // Build last login chip label
  let lastLoginChipLabel = '';
  if (filters.lastLogin === 'custom') {
    const parts: string[] = [];
    if (filters.lastLoginFrom) parts.push(`from ${filters.lastLoginFrom}`);
    if (filters.lastLoginTo) parts.push(`to ${filters.lastLoginTo}`);
    lastLoginChipLabel = `Login: ${parts.join(' ') || 'custom'}`;
  } else if (filters.lastLogin) {
    lastLoginChipLabel = `Login: ${lastLoginLabel(filters.lastLogin)}`;
  }

  // Build joined chip label
  let joinedChipLabel = '';
  if (filters.joinedFrom || filters.joinedTo) {
    const parts: string[] = [];
    if (filters.joinedFrom) parts.push(`from ${filters.joinedFrom}`);
    if (filters.joinedTo) parts.push(`to ${filters.joinedTo}`);
    joinedChipLabel = `Joined: ${parts.join(' ')}`;
  }

  const emailChipLabel =
    filters.emailVerified === 'true'
      ? 'Email: Verified'
      : filters.emailVerified === 'false'
      ? 'Email: Not verified'
      : '';

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Result count */}
      <span className="text-xs text-muted-foreground mr-1">
        {totalItems} result{totalItems !== 1 ? 's' : ''}
      </span>

      {/* Role chips */}
      {filters.roles.map((v) => (
        <Chip
          key={`role-${v}`}
          label={`Role: ${roleLabel(v)}`}
          onRemove={() => removeFilterChip('roles', v)}
        />
      ))}

      {/* Status chips */}
      {filters.statuses.map((v) => (
        <Chip
          key={`status-${v}`}
          label={`Status: ${statusLabel(v)}`}
          onRemove={() => removeFilterChip('statuses', v)}
        />
      ))}

      {/* Email verification chip */}
      {emailChipLabel && (
        <Chip
          label={emailChipLabel}
          onRemove={() => removeFilterChip('emailVerified')}
        />
      )}

      {/* Last login chip */}
      {lastLoginChipLabel && (
        <Chip
          label={lastLoginChipLabel}
          onRemove={() => removeFilterChip('lastLogin')}
        />
      )}

      {/* Joined date chip */}
      {joinedChipLabel && (
        <Chip
          label={joinedChipLabel}
          onRemove={() => removeFilterChip('joinedFrom')}
        />
      )}

      {/* Clear all */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
        onClick={resetFilters}
      >
        Clear all
      </Button>
    </div>
  );
}
