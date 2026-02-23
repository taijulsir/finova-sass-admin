'use client';

import { useEffect, useState, useMemo } from 'react';
import { AdminService } from '@/services/admin.service';
import { Search, MoreHorizontal } from 'lucide-react';
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
import { DataTable } from "@/components/ui-system/data-table";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, limit]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAuditLogs(page, limit);
      setLogs(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLog = (log: any) => {
    setSelectedLog(log);
    setIsViewModalOpen(true);
  };

  const columns = useMemo(() => [
    {
      header: "Action",
      cell: (log: any) => <span className="font-medium text-blue-600">{log.action}</span>,
    },
    {
      header: "User",
      cell: (log: any) => <span>{log.userId?.email || log.userId}</span>,
    },
    {
      header: "Resource",
      accessorKey: "resource" as const,
    },
    {
      header: "Details",
      cell: (log: any) => (
        <span className="text-xs font-mono text-muted-foreground max-w-xs truncate block">
          {JSON.stringify(log.metadata)}
        </span>
      ),
    },
    {
      header: "Timestamp",
      cell: (log: any) => (
        <span className="text-muted-foreground">
          {new Date(log.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (log: any) => (
        <div className="flex items-center justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            onClick={(e) => { e.stopPropagation(); handleViewLog(log); }}
            title="View Details"
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
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewLog(log); }}>
                View Full Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">System-wide activity logs.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={logs} 
        loading={loading}
        onRowClick={handleViewLog}
        emptyMessage="No audit logs found."
      />

      {/* Pagination */}
      <div className="pt-4">
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
          className="justify-end"
        />
      </div>

      {/* View Audit Log Modal */}
      <Modal
        title="Audit Log Details"
        description="View detailed information about this system event."
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      >
        {selectedLog && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Action</p>
                <p className="text-base font-semibold text-blue-600">{selectedLog.action}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">User</p>
                <p className="text-base">{selectedLog.userId?.email || selectedLog.userId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Resource</p>
                <p className="text-base">{selectedLog.resource}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                <p className="text-base">{new Date(selectedLog.createdAt).toLocaleString()}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Log ID</p>
                <p className="text-xs font-mono bg-muted p-1 rounded">{selectedLog._id}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Metadata</p>
                <pre className="text-xs font-mono bg-muted p-4 rounded overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button variant="default" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
