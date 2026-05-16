import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useClinics() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClinics = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/clinics');
      setClinics(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load clinics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClinics(); }, [fetchClinics]);

  const createClinic = async (clinicData) => {
    const { data } = await api.post('/clinics', clinicData);
    setClinics((prev) => [data, ...prev]);
    return data;
  };

  const updateClinic = async (id, clinicData) => {
    const { data } = await api.put(`/clinics/${id}`, clinicData);
    setClinics((prev) => prev.map((c) => (c._id === id ? data : c)));
    return data;
  };

  const deleteClinic = async (id) => {
    await api.delete(`/clinics/${id}`);
    setClinics((prev) => prev.filter((c) => c._id !== id));
  };

  return { clinics, loading, error, refetch: fetchClinics, createClinic, updateClinic, deleteClinic };
}
