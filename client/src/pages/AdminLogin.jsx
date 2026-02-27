import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', form);
      if (data.user?.role !== 'admin') {
        setError('This account is not an admin.');
        return;
      }
      login(data);
      navigate('/admin');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <motion.form className="auth-card glass-card" onSubmit={onSubmit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2>Admin Login</h2>
        <label htmlFor="admin-identifier">Admin ID</label>
        <input
          id="admin-identifier"
          name="identifier"
          type="text"
          value={form.identifier}
          onChange={(event) => setForm((prev) => ({ ...prev, identifier: event.target.value }))}
          placeholder="ADMIN-001"
          required
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />

        {error ? <p className="error-text">{error}</p> : null}
        <motion.button type="submit" className="button button-admin" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {loading ? 'Logging in...' : 'Login as Admin'}
        </motion.button>
      </motion.form>
    </main>
  );
}
