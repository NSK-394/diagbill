import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const PAGE_SIZE = 50;

export function useBills(params = {}) {
  const [bills, setBills] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [activeSearch, setActiveSearch] = useState({});

  const fetchBills = useCallback(async (searchParams = {}) => {
    try {
      setLoading(true);
      setPage(1);
      setActiveSearch(searchParams);
      const query = new URLSearchParams({ ...params, ...searchParams, limit: PAGE_SIZE, page: 1 }).toString();
      const { data } = await api.get(`/bills?${query}`);
      setBills(data.bills);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    try {
      setLoadingMore(true);
      const query = new URLSearchParams({ ...params, ...activeSearch, limit: PAGE_SIZE, page: nextPage }).toString();
      const { data } = await api.get(`/bills?${query}`);
      setBills((prev) => [...prev, ...data.bills]);
      setPage(nextPage);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }, [page, activeSearch, params]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const createBill = async (billData) => {
    const { data } = await api.post('/bills', billData);
    return data;
  };

  const hasMore = bills.length < total;

  return { bills, total, loading, loadingMore, hasMore, error, refetch: fetchBills, loadMore, createBill };
}

export function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}
