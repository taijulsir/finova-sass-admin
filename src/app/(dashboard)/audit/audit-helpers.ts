import { useState } from 'react';
import { toast } from 'sonner';

export const useAuditHandlers = (refresh?: () => void) => {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleViewLog = (log: any) => {
    setSelectedLog(log);
    setIsViewModalOpen(true);
  };

  const handleExportCSV = (data: any[]) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // CSV conversion
      const headers = ['Action', 'User Name', 'User Email', 'Resource', 'Timestamp', 'Metadata'];
      const rows = data.map(log => [
        log.action,
        log.userId?.name || 'System',
        log.userId?.email || 'N/A',
        log.resource,
        new Date(log.createdAt).toLocaleString(),
        JSON.stringify(log.metadata).replace(/"/g, '""') // Escape quotes for CSV
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download link creation
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Logs exported successfully");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export logs");
    }
  };

  return {
    selectedLog,
    setSelectedLog,
    isViewModalOpen,
    setIsViewModalOpen,
    handleViewLog,
    handleExportCSV
  };
};
