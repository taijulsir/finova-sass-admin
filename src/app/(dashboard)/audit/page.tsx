'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAuditLogs();
      setLogs(response.data?.data || response.data || []);
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
        <div>Loading...</div>
      ) : (
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
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
