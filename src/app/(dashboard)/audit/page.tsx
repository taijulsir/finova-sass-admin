'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { TbEye } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui-system/pagination";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAuditLogs(page, 10);
      setLogs(response.data?.data || response.data || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">System-wide activity logs.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="rounded-md border">
            <div className="h-10 bg-muted/50 border-b"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border-b">
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-8 rounded-full ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground bg-muted/50 font-medium">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs?.map((log) => (
                  <tr 
                    key={log._id} 
                    className="border-t hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewLog(log)}
                  >
                    <td className="p-4 font-medium text-blue-600">{log.action}</td>
                    <td className="p-4">{log.userId?.email || log.userId}</td>
                    <td className="p-4">{log.resource}</td>
                    <td className="p-4 text-xs font-mono text-muted-foreground max-w-xs truncate">
                      {JSON.stringify(log.metadata)}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
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
                    </td>
                  </tr>
                ))}
                {logs?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="pt-4">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
              className="justify-end"
            />
          </div>
        </div>
      )}

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
