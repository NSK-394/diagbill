import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useTests(params = {}) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTests = useCallback(async (searchParams = {}) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ ...params, ...searchParams }).toString();
      const { data } = await api.get(`/tests${query ? `?${query}` : ''}`);
      setTests(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const createTest = async (testData) => {
    const { data } = await api.post('/tests', testData);
    setTests((prev) => [...prev, data]);
    return data;
  };

  const updateTest = async (id, testData) => {
    const { data } = await api.put(`/tests/${id}`, testData);
    setTests((prev) => prev.map((t) => (t._id === id ? data : t)));
    return data;
  };

  const deleteTest = async (id) => {
    await api.delete(`/tests/${id}`);
    setTests((prev) => prev.filter((t) => t._id !== id));
  };

  return { tests, loading, error, refetch: fetchTests, createTest, updateTest, deleteTest };
}
