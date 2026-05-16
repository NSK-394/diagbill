import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useBills(params = {}) {
  const [bills, setBills] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBills = useCallback(async (searchParams = {}) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ ...params, ...searchParams }).toString();
      const { data } = await api.get(`/bills${query ? `?${query}` : ''}`);
      setBills(data.bills);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const createBill = async (billData) => {
    const { data } = await api.post('/bills', billData);
    return data;
  };

  return { bills, total, loading, error, refetch: fetchBills, createBill };
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
