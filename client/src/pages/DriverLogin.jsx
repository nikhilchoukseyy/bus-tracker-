import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function DriverLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', form);

      if (data.user?.role !== 'driver') {
        setError('Only driver accounts can log in here.');
        return;
      }

      login(data);
      navigate('/driver');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <motion.form
        className="auth-card glass-card"
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Driver Login</h2>
        <label htmlFor="identifier">Driver ID</label>
        <input
          id="identifier"
          type="text"
          name="identifier"
          value={form.identifier}
          onChange={onChange}
          placeholder="DRV-1001"
          required
        />

        <label htmlFor="password">Password</label>
        <input id="password" type="password" name="password" value={form.password} onChange={onChange} required />

        {error ? <p className="error-text">{error}</p> : null}

        <motion.button type="submit" className="button button-driver" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {loading ? 'Logging in...' : 'Login'}
        </motion.button>
      </motion.form>
    </main>
  );
}
