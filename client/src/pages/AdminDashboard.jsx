import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({ name: '', loginId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDrivers = async () => {
    try {
      const { data } = await api.get('/auth/admin/drivers');
      setDrivers(data.drivers || []);
    } catch (_error) {
      setError('Failed to load drivers');
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const createDriver = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/admin/drivers', {
        ...form,
        loginId: form.loginId.toUpperCase()
      });
      setForm({ name: '', loginId: '', password: '' });
      await fetchDrivers();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.response?.data?.message || 'Failed to create driver');
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <main className="admin-page">
      <motion.section className="admin-panel glass-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <motion.button className="button button-secondary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onLogout}>
            Logout
          </motion.button>
        </div>
        <p>Welcome, {user?.name}. Create driver IDs and passwords here.</p>

        <form className="admin-form" onSubmit={createDriver}>
          <input
            type="text"
            placeholder="Driver Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Driver ID (DRV-1001)"
            value={form.loginId}
            onChange={(event) => setForm((prev) => ({ ...prev, loginId: event.target.value.toUpperCase() }))}
            required
          />
          <input
            type="password"
            placeholder="Temporary Password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
          <motion.button type="submit" className="button button-admin" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {loading ? 'Creating...' : 'Create Driver'}
          </motion.button>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
      </motion.section>

      <motion.section className="admin-panel glass-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <h2>Driver Accounts</h2>
        <div className="driver-list-table">
          {drivers.map((driver) => (
            <div key={driver._id} className="driver-row">
              <strong>{driver.name}</strong>
              <span>{driver.loginId}</span>
              <span>{driver.busNumber || 'No bus selected yet'}</span>
            </div>
          ))}
          {drivers.length === 0 ? <p>No drivers yet.</p> : null}
        </div>
      </motion.section>
    </main>
  );
}
