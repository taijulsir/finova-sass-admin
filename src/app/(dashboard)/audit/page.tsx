'use client';

import { useState, useMemo } from 'react';
import { AdminService } from '@/services/admin.service';
import { FileText, MoreHorizontal } from 'lucide-react';
import { TbEye } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui-system/pagination";
import { DataTable } from "@/components/ui-system/table/DataTable";
import { PageHeader } from "@/components/ui-system/page-header";
import { FilterSection } from "@/components/ui-system/filter-section";
import { useFetchData } from "@/hooks/use-fetch-data";
import { Badge } from "@/components/ui/badge";

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchParams = useMemo(() => ({
    page,
    limit,
    search,
  }), [page, limit, search]);

  const {
    data: logs,
    loading,
    totalItems,
    totalPages,
  } = useFetchData(AdminService.getAuditLogs, fetchParams);

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const handleViewLog = (log: any) => {
    setSelectedLog(log);
    setIsViewModalOpen(true);
  };

  const columns = useMemo(() => [
    {
      header: "Action",
      cell: (log: any) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px] font-bold tracking-wider">
          {log.action?.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      header: "User",
      cell: (log: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{log.userId?.name || 'System'}</span>
          <span className="text-xs text-muted-foreground">{log.userId?.email || 'automated'}</span>
        </div>
      ),
    },
    {
      header: "Resource",
      cell: (log: any) => (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-[10px]">
            {log.resource}
          </Badge>
        </div>
      ),
    },
    {
      header: "Details",
      className: "max-w-[400px]",
      cell: (log: any) => (
        <div className="max-h-15 overflow-y-auto scrollbar-none">
          <span className="text-[10px] font-mono text-muted-foreground leading-tight block whitespace-pre-wrap">
            {JSON.stringify(log.metadata, null, 1)}
          </span>
        </div>
      ),
    },
    {
      header: "Timestamp",
      cell: (log: any) => (
        <div className="flex flex-col text-xs">
          <span className="text-foreground">{new Date(log.createdAt).toLocaleDateString()}</span>
          <span className="text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString()}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right w-[80px]",
      cell: (log: any) => (
        <div className="flex items-center justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
            onClick={(e) => { e.stopPropagation(); handleViewLog(log); }}
          >
            <TbEye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewLog(log)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                }}
              >
                Copy JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], []);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="shrink-0 p-6">
        <PageHeader 
          title="Audit Logs"
          description="Track system activities and resource changes across the platform."
          action={{
            label: "Export Logs",
            icon: FileText,
            onClick: () => {}, // TODO: Implement CSV export
            variant: "outline"
          }}
        />
        
        <div className="mt-6">
          <FilterSection 
            searchPlaceholder="Search logs by user, action or resource..."
            searchValue={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-4">
        <DataTable 
          columns={columns as any} 
          data={logs} 
          loading={loading}
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
          className="justify-end border-t-0 mt-0 py-0"
        />
      </div>

      {/* Log Detail Modal */}
      <Modal
        title="Audit Log Detail"
        description="Detailed view of the specific system event."
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      >
        {selectedLog && (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</p>
                <p className="font-semibold">{selectedLog.action}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resource</p>
                <p className="font-semibold">{selectedLog.resource}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User</p>
                <p className="font-semibold">{selectedLog.userId?.name || 'System'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timestamp</p>
                <p className="font-semibold">{new Date(selectedLog.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Metadata</p>
              <div className="bg-muted p-4 rounded-xl overflow-auto max-h-75">
                <pre className="text-xs font-mono">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
