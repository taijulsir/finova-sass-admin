'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { getUserColumns } from "./user-columns";
import { USER_TABS } from "./user-constants";
import { useUserActions } from "./hooks/use-user-actions";
import { useUserFilters } from "./hooks/use-user-filters";
import { UserModals } from "./components/user-modals";
import { UserFilterPanel } from "./components/user-filter-panel";
import { UserFilterChips } from "./components/user-filter-chips";
import { useFetchData } from "@/hooks/use-fetch-data";
import type { User } from "./user-types";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ── Advanced filter state (includes debounced search + URL sync) ──────────
  const filterState = useUserFilters();

  const fetchParams = useMemo(() => ({
    page,
    limit,
    tab: activeTab,
    ...filterState.fetchFilters,
  }), [page, limit, activeTab, filterState.fetchFilters]);

  const { data: users, loading, totalItems, totalPages, refresh } = useFetchData<User>(
    AdminService.getUsers,
    fetchParams
  );

  const actions = useUserActions(refresh);

  const columns = useMemo(() => getUserColumns({
    onView: actions.handleOpenView,
    onEdit: actions.handleOpenEdit,
    onDelete: (user) => {
      if (activeTab === 'invited') actions.handleOpenCancelInvite(user);
      else if (activeTab === 'suspended') actions.handleOpenUnsuspend(user);
      else actions.handleOpenArchive(user);
    },
    onSuspend: actions.handleOpenSuspend,
    onResend: actions.handleOpenResend,
    onArchive: actions.handleOpenArchive,
    onUnarchive: actions.handleOpenUnarchive,
    onAssignRoles: actions.handleOpenAssignRoles,
    onForceLogout: actions.handleOpenForceLogout,
    tab: activeTab,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [activeTab, actions.handleOpenView, actions.handleOpenEdit]);

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Users"
          description="Manage system users, roles, and permissions."
          action={{ label: "Invite User", icon: Plus, onClick: actions.handleOpenAdd }}
        />
      </div>

      {/* ── Search + Tabs + Filter button ─────────────────────────────────── */}
      <div className="px-6 shrink-0">
        <FilterSection
          searchPlaceholder="Search users by name or email..."
          searchValue={filterState.search}
          onSearchChange={(val) => { filterState.setSearch(val); setPage(1); }}
          activeTab={activeTab}
          onTabChange={(val) => { setActiveTab(val); setPage(1); filterState.resetFilters(); }}
          tabs={USER_TABS as any}
        >
          <UserFilterPanel filterState={filterState} />
        </FilterSection>
      </div>

      {/* ── Active filter chips ───────────────────────────────────────────── */}
      {filterState.hasActive && (
        <div className="px-6 shrink-0 -mt-2">
          <UserFilterChips filterState={filterState} totalItems={totalItems} />
        </div>
      )}

      <div className="flex-1 overflow-hidden px-6">
        <DataTable columns={columns as any} data={users} loading={loading} onRowClick={actions.handleOpenView} />
      </div>

      <div className="px-6 pb-6 pt-2 border-t mt-auto shrink-0 bg-background/80 backdrop-blur-sm z-20">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
          itemName="users"
        />
      </div>

      <UserModals actions={actions} onRefresh={refresh} />
    </div>
  );
}

