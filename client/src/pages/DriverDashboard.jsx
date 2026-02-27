import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import api from '../utils/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { token, user, logout, login } = useAuth();
  const { coords, error: geoError, start, stop } = useGeolocation();

  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [busNumberInput, setBusNumberInput] = useState(user?.busNumber || '');
  const [busNameInput, setBusNameInput] = useState(user?.busName || '');

  const socketRef = useRef(null);
  const activeBusRef = useRef('');

  useEffect(() => () => { stop(); socketRef.current?.disconnect(); }, []);

  useEffect(() => {
    if (!user || user.role !== 'driver') navigate('/driver/login');
  }, [navigate, user]);

  const startTracking = () => {
    const normalizedBusNumber = busNumberInput.trim().toUpperCase();
    if (!normalizedBusNumber) { setError('Driver account has no bus number assigned.'); return; }
    setError('');
    activeBusRef.current = normalizedBusNumber;
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('driver:start', { busNumber: normalizedBusNumber, busName: busNameInput.trim(), driverName: user.name, driverId: user.id });
    start((nextCoords) => {
      socketRef.current?.emit('driver:updateLocation', { busNumber: normalizedBusNumber, busName: busNameInput.trim(), driverName: user.name, lat: nextCoords.lat, lng: nextCoords.lng });
    });
    setTracking(true);
  };

  const stopTracking = () => {
    stop();
    socketRef.current?.emit('driver:stop', { busNumber: activeBusRef.current || busNumberInput.trim().toUpperCase() });
    socketRef.current?.disconnect();
    socketRef.current = null;
    activeBusRef.current = '';
    setTracking(false);
  };

  const saveBusDetails = async () => {
    const normalizedBusNumber = busNumberInput.trim().toUpperCase();
    if (!normalizedBusNumber) { setError('Bus number is required.'); return; }
    setError('');
    setSaveLoading(true);
    try {
      const { data } = await api.put('/auth/driver-bus', { busNumber: normalizedBusNumber, busName: busNameInput.trim() });
      login({ token, user: data.user });
      setBusNumberInput(data.user.busNumber || normalizedBusNumber);
      setBusNameInput(data.user.busName || busNameInput.trim());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save bus details');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => { if (tracking) stopTracking(); logout(); navigate('/driver/login'); };

  return (
    <main className="min-h-screen bg-[#080c18] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-400/8 blur-[120px] rounded-full" />
        {tracking && <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-400/8 blur-[100px] rounded-full" />}
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <motion.div
        className="relative z-10 w-full max-w-lg flex flex-col gap-5"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header card */}
        <div className="rounded-2xl border border-white/7 bg-white/[0.03] backdrop-blur-md p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-xl">🚌</div>
            <div>
              <h1 className="text-white font-extrabold text-lg leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Driver Dashboard</h1>
              <p className="text-white/40 text-xs">Welcome, {user?.name}</p>
            </div>
          </div>
          {/* Live pill */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
            tracking
              ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400'
              : 'border-white/10 bg-white/5 text-white/35'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tracking ? 'bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse' : 'bg-white/20'}`} />
            {tracking ? 'Live' : 'Offline'}
          </div>
        </div>

        {/* Bus details card */}
        <div className="rounded-2xl border border-white/7 bg-white/[0.03] backdrop-blur-md p-6 flex flex-col gap-4">
          <h2 className="text-white font-bold text-sm tracking-widest uppercase text-white/50">Bus Details</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-widest">Bus Number</label>
              <input
                type="text"
                value={busNumberInput}
                onChange={(e) => setBusNumberInput(e.target.value.toUpperCase())}
                disabled={tracking}
                placeholder="BUS-101"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-amber-400/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-widest">Bus Name</label>
              <input
                type="text"
                value={busNameInput}
                onChange={(e) => setBusNameInput(e.target.value)}
                disabled={tracking}
                placeholder="Route A / North Campus"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-amber-400/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <motion.button
            type="button"
            onClick={saveBusDetails}
            disabled={tracking || saveLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saveLoading ? 'Saving…' : 'Save Bus Details'}
          </motion.button>
        </div>

        {/* Location card */}
        <div className="rounded-2xl border border-white/7 bg-white/[0.03] backdrop-blur-md p-6 flex flex-col gap-3">
          <h2 className="text-white/50 font-bold text-sm tracking-widest uppercase">Location</h2>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-base">📍</div>
            <p className="text-white/60 text-sm font-mono">
              {coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'Waiting for GPS…'}
            </p>
          </div>
          {geoError && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2">GPS: {geoError}</p>}
          {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2">{error}</p>}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {!tracking ? (
            <motion.button
              type="button"
              onClick={startTracking}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#080c18] font-bold text-sm tracking-wide transition-colors"
            >
              🚀 Start Sharing Location
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={stopTracking}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm tracking-wide transition-colors"
            >
              🏁 Stop / Reached College
            </motion.button>
          )}

          <motion.button
            type="button"
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-sm font-medium transition-all"
          >
            Logout
          </motion.button>
        </div>

      </motion.div>
    </main>
  );
}