'use client';

import { useState, useMemo } from 'react';
import { AdminService } from '@/services/admin.service';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { useFetchData } from "@/hooks/use-fetch-data";
import { getAuditColumns, auditActionOptions } from "./audit-utils";
import { useAuditHandlers } from "./audit-helpers";
import { AuditView } from "./components/audit-view";

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState('all');

  const fetchParams = useMemo(() => ({
    page,
    limit,
    search,
    action: activeTab === 'all' ? undefined : activeTab,
  }), [page, limit, search, activeTab]);

  const {
    data: logs,
    loading,
    totalItems,
    totalPages,
  } = useFetchData(AdminService.getAuditLogs, fetchParams, [activeTab]);

  const {
    selectedLog,
    isViewModalOpen,
    setIsViewModalOpen,
    handleViewLog,
    handleExportCSV
  } = useAuditHandlers();

  const columns = useMemo(() => getAuditColumns(handleViewLog), [handleViewLog]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="shrink-0 p-6">
        <PageHeader 
          title="Audit Logs"
          description="Track system activities and resource changes across the platform."
          action={{
            label: "Export CSV",
            icon: FileText,
            onClick: () => handleExportCSV(logs),
            variant: "outline"
          }}
        />
        
        <div className="mt-6">
          <FilterSection 
            searchPlaceholder="Search logs by resource..."
            searchValue={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            activeTab={activeTab}
            onTabChange={(val) => {
              setActiveTab(val);
              setPage(1);
            }}
            // tabs={auditActionOptions}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-4">
        <DataTable 
          columns={columns as any} 
          data={logs} 
          loading={loading}
          stickyHeader={true}
          onRowClick={handleViewLog}
        />
      </div>

      <div className="shrink-0 p-6 pt-2 border-t mt-auto bg-background/80 backdrop-blur-sm z-20">
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          totalItems={totalItems}
          limit={limit}
          onPageChange={setPage} 
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          itemName="logs"
          // className="justify-end border-t-0 mt-0 py-0"
        />
      </div>

      {/* Log Detail Modal */}
      <Modal
        title="Audit Log Detail"
        description="Detailed view of the specific system event."
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      >
        <AuditView log={selectedLog} />
      </Modal>
    </div>
  );
}
