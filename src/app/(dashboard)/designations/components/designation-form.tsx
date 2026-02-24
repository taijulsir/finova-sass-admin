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

export interface DesignationFormValues {
  name: string;
  description: string;
  permissions: ModulePermission[];
}

interface DesignationFormProps {
  defaultValues?: Partial<DesignationFormValues>;
  onSubmit: (data: DesignationFormValues) => Promise<void>;
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

export function DesignationForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  isEdit = false,
}: DesignationFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  // checked[module][action] = true/false
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
    <form onSubmit={handleSubmit} className="space-y-5 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="desg-name">
          Designation Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="desg-name"
          placeholder="e.g. Support Manager"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="desg-desc">Description</Label>
        <Textarea
          id="desg-desc"
          placeholder="Brief description of this designation..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      {/* Permission matrix */}
      <div className="space-y-2">
        <Label>Module Permissions</Label>
        <div className="rounded-xl border border-muted overflow-hidden">
          {/* Header row */}
          <div className="grid bg-muted/60 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
            style={{ gridTemplateColumns: '1fr repeat(4, 80px)' }}>
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
                className={`grid items-center px-4 py-3 ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                style={{ gridTemplateColumns: '1fr repeat(4, 80px)' }}
              >
                {/* Module name + select-all checkbox */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allChecked}
                    // indeterminate if some but not all
                    ref={(el) => {
                      if (el) (el as any).indeterminate = !allChecked && someChecked;
                    }}
                    onCheckedChange={(v) => toggleModule(mod.key, !!v)}
                    disabled={isSubmitting}
                  />
                  <span className="text-sm font-medium">{mod.label}</span>
                </div>
                {/* Per-action checkboxes */}
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

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update' : 'Create'} Designation
        </Button>
      </div>
    </form>
  );
}
