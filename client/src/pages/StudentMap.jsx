import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from '../components/MapView';
import BusList from '../components/BusList';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const normalizeBusData = (bus) => {
  const location = bus.currentLocation || {};
  return {
    busNumber: (bus.busNumber || '').toUpperCase(),
    busName: bus.busName || '',
    driverName: bus.driverName || '',
    lat: location.lat,
    lng: location.lng,
    updatedAt: location.updatedAt || null,
  };
};

export default function StudentMap() {
  const [buses, setBuses] = useState({});
  const [selectedBusNumber, setSelectedBusNumber] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('buses:all', (allBuses) => {
      const next = {};
      for (const bus of allBuses) {
        const normalized = normalizeBusData(bus);
        if (normalized.busNumber) next[normalized.busNumber] = normalized;
      }
      setBuses(next);
    });

    socket.on('bus:online', ({ busNumber, busName, driverName }) => {
      const n = (busNumber || '').toUpperCase();
      if (!n) return;
      setBuses((prev) => ({ ...prev, [n]: { ...(prev[n] || {}), busNumber: n, busName: busName || prev[n]?.busName || '', driverName: driverName || prev[n]?.driverName || '', updatedAt: prev[n]?.updatedAt || null } }));
    });

    socket.on('bus:locationUpdated', ({ busNumber, busName, lat, lng, driverName, updatedAt }) => {
      const n = (busNumber || '').toUpperCase();
      if (!n) return;
      setBuses((prev) => ({ ...prev, [n]: { ...(prev[n] || {}), busNumber: n, busName: busName || prev[n]?.busName || '', driverName: driverName || prev[n]?.driverName || '', lat, lng, updatedAt: updatedAt || new Date().toISOString() } }));
    });

    socket.on('bus:offline', ({ busNumber }) => {
      const n = (busNumber || '').toUpperCase();
      if (!n) return;
      setSelectedBusNumber((prev) => (prev === n ? '' : prev));
      setBuses((prev) => { const next = { ...prev }; delete next[n]; return next; });
    });

    return () => socket.disconnect();
  }, []);

  const busArray = useMemo(() => Object.values(buses), [buses]);
  const hasActiveBuses = busArray.length > 0;

  useEffect(() => {
    if (!selectedBusNumber) {
      setSelectedBusNumber(Object.keys(buses)[0] || '');
    } else if (!buses[selectedBusNumber]) {
      setSelectedBusNumber(Object.keys(buses)[0] || '');
    }
  }, [buses, selectedBusNumber]);

  const selectedBus = buses[selectedBusNumber];

  return (
    <main className="min-h-screen bg-[#080c18] flex flex-col relative overflow-hidden">
      {/* Glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-emerald-400/7 blur-[120px] rounded-full" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 flex items-center justify-between px-5 py-4 border-b border-white/7 bg-[#080c18]/80 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-base">🚌</div>
          <span className="text-white font-extrabold text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
            Locate <span className="text-amber-400">My Bus</span>
          </span>
        </div>

        {/* Connection status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
          connected ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400' : 'border-white/10 bg-white/5 text-white/35'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse' : 'bg-white/20'}`} />
          {connected ? 'Connected' : 'Connecting…'}
        </div>
      </motion.header>

      {/* Selected bus info bar */}
      <AnimatePresence>
        {selectedBus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-20 px-5 py-3 border-b border-white/5 bg-amber-400/5 backdrop-blur-md flex items-center gap-3"
          >
            <span className="text-amber-400 font-bold text-sm font-mono">{selectedBus.busNumber}</span>
            {selectedBus.busName && <span className="text-white/50 text-xs">·  {selectedBus.busName}</span>}
            {selectedBus.driverName && <span className="text-white/35 text-xs">Driver: {selectedBus.driverName}</span>}
            {selectedBus.lat && (
              <span className="ml-auto text-white/25 text-xs font-mono">
                {selectedBus.lat.toFixed(4)}, {selectedBus.lng.toFixed(4)}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map + sidebar */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Map takes most space */}
        <div className="flex-1 relative">
          <MapView buses={buses} focusedBusNumber={selectedBusNumber} />

          {/* No buses floating toast */}
          <AnimatePresence>
            {!hasActiveBuses && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-[#080c18]/80 backdrop-blur-md text-white/50 text-xs font-medium shadow-lg"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                No buses are currently active
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bus list sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-64 border-l border-white/7 bg-[#080c18]/90 backdrop-blur-md flex flex-col overflow-y-auto hidden sm:flex"
        >
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Active Buses</p>
            <p className="text-white font-bold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>{busArray.length} Online</p>
          </div>

          <div className="flex flex-col gap-1 p-3 flex-1">
            {busArray.length === 0 ? (
              <p className="text-white/20 text-xs text-center py-6">No buses online</p>
            ) : (
              busArray.map((bus) => (
                <motion.button
                  key={bus.busNumber}
                  onClick={() => setSelectedBusNumber(bus.busNumber)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex flex-col gap-1 text-left px-3 py-3 rounded-xl border transition-all ${
                    selectedBusNumber === bus.busNumber
                      ? 'border-amber-400/40 bg-amber-400/8 text-amber-400'
                      : 'border-white/5 bg-white/[0.02] text-white/60 hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${bus.lat ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                    <span className="font-bold text-sm font-mono">{bus.busNumber}</span>
                  </div>
                  {bus.busName && <span className="text-xs text-white/35 pl-3.5">{bus.busName}</span>}
                  {bus.driverName && <span className="text-xs text-white/25 pl-3.5">{bus.driverName}</span>}
                </motion.button>
              ))
            )}
          </div>

          {/* Pass BusList for mobile too if needed */}
          <div className="hidden">
            <BusList buses={buses} selectedBusNumber={selectedBusNumber} onSelectBus={setSelectedBusNumber} />
          </div>
        </motion.aside>
      </div>

      {/* Mobile bus list (bottom sheet) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="sm:hidden relative z-20 border-t border-white/7 bg-[#080c18]/90 backdrop-blur-md p-3 flex gap-2 overflow-x-auto"
      >
        {busArray.length === 0 ? (
          <p className="text-white/25 text-xs py-1 px-2">No active buses</p>
        ) : (
          busArray.map((bus) => (
            <button
              key={bus.busNumber}
              onClick={() => setSelectedBusNumber(bus.busNumber)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                selectedBusNumber === bus.busNumber
                  ? 'border-amber-400/40 bg-amber-400/10 text-amber-400'
                  : 'border-white/10 bg-white/5 text-white/50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${bus.lat ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
              {bus.busNumber}
            </button>
          ))
        )}
      </motion.div>
    </main>
  );
}