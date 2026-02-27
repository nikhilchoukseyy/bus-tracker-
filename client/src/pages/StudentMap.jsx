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
    updatedAt: location.updatedAt || null
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

  const hasActiveBuses = useMemo(() => Object.keys(buses).length > 0, [buses]);
  const busArray = useMemo(() => Object.values(buses), [buses]);

  useEffect(() => {
    if (!selectedBusNumber) {
      setSelectedBusNumber(Object.keys(buses)[0] || '');
    } else if (!buses[selectedBusNumber]) {
      setSelectedBusNumber(Object.keys(buses)[0] || '');
    }
  }, [buses, selectedBusNumber]);

  const selectedBus = buses[selectedBusNumber];

  return (
    // Full viewport, dark bg, column flex
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#080c18', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#080c18', zIndex: 50 }}
        className="flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-base">🚌</div>
          <span className="text-white font-extrabold text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
            Locate <span className="text-amber-400">My Bus</span>
          </span>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
          connected
            ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400'
            : 'border-white/10 bg-white/5 text-white/35'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
          {connected ? 'Connected' : 'Connecting…'}
        </div>
      </motion.header>

      {/* ── Selected bus info bar ── */}
      <AnimatePresence>
        {selectedBus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(251,191,36,0.05)', overflow: 'hidden', zIndex: 40 }}
            className="flex items-center gap-3 px-5 py-2.5"
          >
            <span className="text-amber-400 font-bold text-sm font-mono">{selectedBus.busNumber}</span>
            {selectedBus.busName && <span className="text-white/50 text-xs">· {selectedBus.busName}</span>}
            {selectedBus.driverName && <span className="text-white/35 text-xs">Driver: {selectedBus.driverName}</span>}
            {selectedBus.lat && (
              <span className="ml-auto text-white/25 text-xs font-mono">
                {selectedBus.lat.toFixed(4)}, {selectedBus.lng.toFixed(4)}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Map + Sidebar — fills all remaining height ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

        {/* Map — MapView now uses style={{ height:'100%', width:'100%' }} internally */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <MapView buses={buses} focusedBusNumber={selectedBusNumber} />

          {/* No buses toast */}
          <AnimatePresence>
            {!hasActiveBuses && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-[#080c18]/80 backdrop-blur-md text-white/50 text-xs font-medium whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                No buses are currently active
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BusList sidebar — now fully themed via BusList.jsx */}
        <BusList
          buses={buses}
          selectedBusNumber={selectedBusNumber}
          onSelectBus={setSelectedBusNumber}
        />
      </div>

      {/* ── Mobile bus strip ── */}
      <div
        style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(8,12,24,0.97)', zIndex: 40 }}
        className="sm:hidden flex gap-2 p-3 overflow-x-auto"
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
      </div>

    </div>
  );
}