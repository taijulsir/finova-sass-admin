'use client';

import { useState, useMemo, useCallback } from 'react';
import { AdminService } from '@/services/admin.service';
import { Plus, ShieldCheck, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui-system/pagination';
import { DataTable } from '@/components/ui-system/table/DataTable';
import { PageHeader } from '@/components/ui-system/page-header';
import { FilterSection } from '@/components/ui-system/filter-section';
import { useFetchData } from '@/hooks/use-fetch-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ADMIN_MODULES } from '@/lib/permissions';
import { RoleForm, RoleFormValues } from './components/role-form';

// ── helpers ─────────────────────────────────────────────────────────────────

function permissionSummary(permissions: { module: string; actions: string[] }[]) {
  if (!permissions || permissions.length === 0)
    return <span className="text-muted-foreground text-xs">No permissions</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {(Array.isArray(permissions) ? permissions : []).slice(0, 3).map((p) => {
        const mod = ADMIN_MODULES.find((m) => m.key === p.module);
        return (
          <Badge key={p.module} variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary">
            {mod?.label ?? p.module} · {p.actions.length}
          </Badge>
        );
      })}
      {permissions.length > 3 && (
        <Badge variant="outline" className="text-[10px] text-muted-foreground">
          +{permissions.length - 3} more
        </Badge>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchParams = useMemo(
    () => ({ page, limit, search }),
    [page, limit, search]
  );

  const { data: roles, loading, totalItems, totalPages, refresh } = useFetchData(
    AdminService.getRoles,
    fetchParams
  );

  const handleCreate = useCallback(async (formData: RoleFormValues) => {
    setIsSubmitting(true);
    try {
      await AdminService.createRole(formData);
      toast.success('Role created');
      setIsAddOpen(false);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create role');
    } finally {
      setIsSubmitting(false);
    }
  }, [refresh]);

  const handleUpdate = useCallback(async (formData: RoleFormValues) => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await AdminService.updateRole(selected._id, formData);
      toast.success('Role updated');
      setIsEditOpen(false);
      setSelected(null);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update role');
    } finally {
      setIsSubmitting(false);
    }
  }, [selected, refresh]);

  const handleArchive = useCallback(async (item: any) => {
    if (!confirm(`Archive role "${item.name}"?`)) return;
    try {
      await AdminService.archiveRole(item._id);
      toast.success('Role archived');
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to archive');
    }
  }, [refresh]);

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Role',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{row.name}</span>
            {row.description && (
              <span className="text-xs text-muted-foreground line-clamp-1">{row.description}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: (row: any) => permissionSummary(row.permissions ?? []),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: (row: any) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (row: any) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => { setSelected(row); setIsEditOpen(true); }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleArchive(row)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Archive</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ], [handleArchive]);

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Roles & Permissions"
          description="Define admin roles and control module-level access permissions."
          action={{ label: 'Add Role', icon: Plus, onClick: () => setIsAddOpen(true) }}
        />
      </div>

      <div className="px-6 shrink-0">
        <FilterSection
          searchPlaceholder="Search roles..."
          searchValue={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          activeTab="all"
          onTabChange={() => {}}
          tabs={[]}
        />
      </div>

      <div className="flex-1 overflow-hidden px-6">
        <DataTable columns={columns as any} data={roles} loading={loading} />
      </div>

      <div className="px-6 pb-6 pt-2 border-t mt-auto shrink-0 bg-background/80 backdrop-blur-sm z-20">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          itemName="roles"
        />
      </div>

      {/* Create Modal */}
      <Modal
        title="Add Role"
        description="Define a new admin role and assign module permissions."
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        size="lg"
      >
        <RoleForm
          onSubmit={handleCreate}
          onCancel={() => setIsAddOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Role"
        description="Update role name and permissions."
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelected(null); }}
        size="lg"
      >
        {selected && (
          <RoleForm
            isEdit
            defaultValues={{
              name: selected.name,
              description: selected.description ?? '',
              permissions: selected.permissions ?? [],
            }}
            onSubmit={handleUpdate}
            onCancel={() => { setIsEditOpen(false); setSelected(null); }}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
}
