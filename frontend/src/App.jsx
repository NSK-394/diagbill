import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NewBillPage from './pages/NewBillPage';
import BillHistoryPage from './pages/BillHistoryPage';
import BillDetailPage from './pages/BillDetailPage';
import TestsPage from './pages/TestsPage';
import ClinicsPage from './pages/ClinicsPage';
import NotFoundPage from './pages/NotFoundPage';
import BillScanPage from './pages/BillScanPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/billing/new" element={<NewBillPage />} />
        <Route path="/bills" element={<BillHistoryPage />} />
        <Route path="/bills/:id" element={<BillDetailPage />} />
        <Route path="/tests" element={<TestsPage />} />
        <Route path="/clinics" element={<ClinicsPage />} />
      </Route>

      {/* Public — no login required, used by barcode scanner */}
      <Route path="/scan/:billNumber" element={<BillScanPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
