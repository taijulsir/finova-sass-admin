import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

interface FetchResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export function useFetchData<T>(
  fetchFn: (params: any) => Promise<any>,
  params: FetchParams,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchFn(params);
      
      // Standardize response access based on typical project structure
      const results = response.data || [];
      const pagination = response.pagination || { total: 0, totalPages: 1 };

      setData(results);
      setTotalItems(pagination.total);
      setTotalPages(pagination.totalPages);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    totalItems,
    totalPages,
    refresh: fetchData,
  };
}
