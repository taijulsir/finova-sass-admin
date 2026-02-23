'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">System-wide activity logs.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
                </tr>
              </thead>
              <tbody>
                {logs?.map((log) => (
                  <tr key={log._id} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium text-blue-600">{log.action}</td>
                    <td className="p-4">{log.userId?.email || log.userId}</td>
                    <td className="p-4">{log.resource}</td>
                    <td className="p-4 text-xs font-mono text-muted-foreground max-w-xs truncate">
                      {JSON.stringify(log.metadata)}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {logs?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
