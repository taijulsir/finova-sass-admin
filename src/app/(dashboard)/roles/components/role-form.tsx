'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { ADMIN_MODULES, ADMIN_ACTIONS, ModuleKey, ActionKey } from '@/lib/permissions';

interface ModulePermission {
  module: ModuleKey;
  actions: ActionKey[];
}

export interface RoleFormValues {
  name: string;
  description: string;
  permissions: ModulePermission[];
}

interface RoleFormProps {
  defaultValues?: Partial<RoleFormValues>;
  onSubmit: (data: RoleFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

function buildPermissionsMap(perms: ModulePermission[]): Record<string, Set<string>> {
  const map: Record<string, Set<string>> = {};
  for (const p of perms) {
    map[p.module] = new Set(p.actions);
  }
  return map;
}

export function RoleForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
}: RoleFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [checked, setChecked] = useState<Record<string, Set<string>>>(() =>
    buildPermissionsMap(defaultValues?.permissions ?? [])
  );

  useEffect(() => {
    setName(defaultValues?.name ?? '');
    setDescription(defaultValues?.description ?? '');
    setChecked(buildPermissionsMap(defaultValues?.permissions ?? []));
  }, [defaultValues]);

  const toggle = (moduleKey: string, actionKey: string) => {
    setChecked((prev) => {
      const next = { ...prev };
      const set = new Set(next[moduleKey] ?? []);
      if (set.has(actionKey)) set.delete(actionKey);
      else set.add(actionKey);
      next[moduleKey] = set;
      return next;
    });
  };

  const toggleModule = (moduleKey: string, selectAll: boolean) => {
    setChecked((prev) => ({
      ...prev,
      [moduleKey]: selectAll ? new Set(ADMIN_ACTIONS.map((a) => a.key)) : new Set(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const permissions: ModulePermission[] = Object.entries(checked)
      .filter(([, actions]) => actions.size > 0)
      .map(([module, actions]) => ({
        module: module as ModuleKey,
        actions: Array.from(actions) as ActionKey[],
      }));
    await onSubmit({ name: name.trim(), description: description.trim(), permissions });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* ── 2-column body ─────────────────────────────────────────── */}
      <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">

        {/* LEFT — role identity (fixed, non-scrolling) */}
        <div className="w-60 shrink-0 flex flex-col gap-4 pt-1 overflow-y-auto">
          <div className="space-y-1.5">
            <Label htmlFor="role-name">
              Role Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role-name"
              placeholder="e.g. Support Manager"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-desc">Description</Label>
            <Textarea
              id="role-desc"
              placeholder="Brief description of this role..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Live permission summary */}
          <div className="mt-auto rounded-lg border border-muted bg-muted/30 px-3 py-2.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              {Object.values(checked).reduce((acc, s) => acc + s.size, 0)} permission
              {Object.values(checked).reduce((acc, s) => acc + s.size, 0) !== 1 ? 's' : ''} selected
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              across {Object.values(checked).filter((s) => s.size > 0).length} module
              {Object.values(checked).filter((s) => s.size > 0).length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-border shrink-0" />

        {/* RIGHT — permission matrix (scrollable) */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Label className="mb-2 shrink-0">Module Permissions</Label>
          <div className="flex-1 overflow-y-auto rounded-xl border border-muted">
            {/* Sticky header */}
            <div
              className="grid sticky top-0 z-10 bg-muted/90 backdrop-blur-sm px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-muted"
              style={{ gridTemplateColumns: '1fr repeat(4, 60px)' }}
            >
              <span>Module</span>
              {ADMIN_ACTIONS.map((a) => (
                <span key={a.key} className="text-center">{a.label}</span>
              ))}
            </div>
            {/* Module rows */}
            {ADMIN_MODULES.map((mod, idx) => {
              const modSet = checked[mod.key] ?? new Set<string>();
              const allChecked = ADMIN_ACTIONS.every((a) => modSet.has(a.key));
              const someChecked = ADMIN_ACTIONS.some((a) => modSet.has(a.key));
              return (
                <div
                  key={mod.key}
                  className={`grid items-center px-3 py-3 ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                  style={{ gridTemplateColumns: '1fr repeat(4, 60px)' }}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={allChecked}
                      ref={(el) => {
                        if (el) (el as any).indeterminate = !allChecked && someChecked;
                      }}
                      onCheckedChange={(v) => toggleModule(mod.key, !!v)}
                      disabled={isSubmitting}
                    />
                    <span className="text-sm font-medium">{mod.label}</span>
                  </div>
                  {ADMIN_ACTIONS.map((action) => (
                    <div key={action.key} className="flex justify-center">
                      <Checkbox
                        checked={modSet.has(action.key)}
                        onCheckedChange={() => toggle(mod.key, action.key)}
                        disabled={isSubmitting}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Footer buttons (always visible, pinned to bottom) ──── */}
      <div className="flex justify-end gap-2 pt-5 border-t mt-5 shrink-0">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update' : 'Create'} Role
        </Button>
      </div>
    </form>
  );
}
