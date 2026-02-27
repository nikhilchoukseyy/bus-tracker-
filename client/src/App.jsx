import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import DriverLogin from './pages/DriverLogin';
import DriverDashboard from './pages/DriverDashboard';
import StudentMap from './pages/StudentMap';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';

function ProtectedDriverRoute({ children }) {
  const { user } = useAuth();

  if (!user || user.role !== 'driver') {
    return <Navigate to="/driver/login" replace />;
  }

  return children;
}

function ProtectedAdminRoute({ children }) {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/driver/login" element={<DriverLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/driver"
        element={(
          <ProtectedDriverRoute>
            <DriverDashboard />
          </ProtectedDriverRoute>
        )}
      />
      <Route
        path="/admin"
        element={(
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        )}
      />
      <Route path="/student" element={<StudentMap />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
