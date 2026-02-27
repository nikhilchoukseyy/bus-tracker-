import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const cardVar = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

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
    } catch { setError('Failed to load drivers'); }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const createDriver = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/admin/drivers', { ...form, loginId: form.loginId.toUpperCase() });
      setForm({ name: '', loginId: '', password: '' });
      await fetchDrivers();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.response?.data?.message || 'Failed to create driver');
    } finally { setLoading(false); }
  };

  const onLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <main className="min-h-screen bg-[#080c18] px-4 py-12 relative overflow-hidden">
      {/* Glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-500/8 blur-[120px] rounded-full" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col gap-6">

        {/* Top bar */}
        <motion.div
          custom={0} variants={cardVar} initial="hidden" animate="show"
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Admin Dashboard</h1>
            <p className="text-white/40 text-sm mt-0.5">Welcome, {user?.name}</p>
          </div>
          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-sm font-medium transition-all"
          >
            Logout
          </motion.button>
        </motion.div>

        {/* Create driver card */}
        <motion.div
          custom={1} variants={cardVar} initial="hidden" animate="show"
          className="rounded-2xl border border-white/7 bg-white/[0.03] backdrop-blur-md p-6 flex flex-col gap-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-400/10 flex items-center justify-center text-lg">➕</div>
            <div>
              <h2 className="text-white font-bold text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>Create Driver Account</h2>
              <p className="text-white/35 text-xs">Issue credentials to a new driver.</p>
            </div>
          </div>

          <form onSubmit={createDriver} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Driver Name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-blue-400/50 transition-all"
              />
              <input
                type="text"
                placeholder="Driver ID (DRV-1001)"
                value={form.loginId}
                onChange={(e) => setForm((p) => ({ ...p, loginId: e.target.value.toUpperCase() }))}
                required
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-blue-400/50 transition-all"
              />
              <input
                type="password"
                placeholder="Temporary Password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm outline-none focus:border-blue-400/50 transition-all"
              />
            </div>

            {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">{error}</p>}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto sm:self-end px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating…' : '+ Create Driver'}
            </motion.button>
          </form>
        </motion.div>

        {/* Drivers list card */}
        <motion.div
          custom={2} variants={cardVar} initial="hidden" animate="show"
          className="rounded-2xl border border-white/7 bg-white/[0.03] backdrop-blur-md p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-lg">👥</div>
            <div>
              <h2 className="text-white font-bold text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>Driver Accounts</h2>
              <p className="text-white/35 text-xs">{drivers.length} registered driver{drivers.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {drivers.length === 0 ? (
            <div className="text-center py-8 text-white/25 text-sm">No drivers yet. Create one above.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {drivers.map((driver, i) => (
                <motion.div
                  key={driver._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-sm font-bold text-amber-400">
                      {driver.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="text-white font-medium text-sm">{driver.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-xs font-mono bg-white/5 px-2.5 py-1 rounded-lg">{driver.loginId}</span>
                    <span className="text-white/30 text-xs">{driver.busNumber || 'No bus'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </main>
  );
}