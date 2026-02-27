import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      if (data.user?.role !== 'admin') { setError('This account is not an admin.'); return; }
      login(data);
      navigate('/admin');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080c18] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Card */}
        <div className="rounded-2xl border border-white/7 bg-white/[0.03] backdrop-blur-md p-8 flex flex-col gap-6">

          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="w-11 h-11 rounded-xl bg-blue-400/10 flex items-center justify-center text-2xl mb-2">🛠️</div>
            <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Admin Login</h1>
            <p className="text-white/40 text-sm">Access the fleet management dashboard.</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-identifier" className="text-xs font-medium text-white/50 tracking-widest uppercase">Admin ID</label>
              <input
                id="admin-identifier"
                type="text"
                placeholder="ADMIN-001"
                value={form.identifier}
                onChange={(e) => setForm((p) => ({ ...p, identifier: e.target.value }))}
                required
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-blue-400/50 focus:bg-white/8 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-xs font-medium text-white/50 tracking-widest uppercase">Password</label>
              <input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-blue-400/50 focus:bg-white/8 transition-all"
              />
            </div>

            {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">{error}</p>}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-1 w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in…' : 'Login as Admin →'}
            </motion.button>
          </form>

          <p className="text-center text-white/25 text-xs">
            <Link to="/" className="text-white/40 hover:text-white/70 transition-colors">← Back to home</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}