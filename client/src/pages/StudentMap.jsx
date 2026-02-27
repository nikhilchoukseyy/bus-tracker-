import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
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

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('buses:all', (allBuses) => {
      const next = {};
      for (const bus of allBuses) {
        const normalized = normalizeBusData(bus);
        if (normalized.busNumber) {
          next[normalized.busNumber] = normalized;
        }
      }
      setBuses(next);
    });

    socket.on('bus:online', ({ busNumber, busName, driverName }) => {
      const normalizedBusNumber = (busNumber || '').toUpperCase();
      if (!normalizedBusNumber) {
        return;
      }

      setBuses((prev) => ({
        ...prev,
        [normalizedBusNumber]: {
          ...(prev[normalizedBusNumber] || {}),
          busNumber: normalizedBusNumber,
          busName: busName || prev[normalizedBusNumber]?.busName || '',
          driverName: driverName || prev[normalizedBusNumber]?.driverName || '',
          updatedAt: prev[normalizedBusNumber]?.updatedAt || null
        }
      }));
    });

    socket.on('bus:locationUpdated', ({ busNumber, busName, lat, lng, driverName, updatedAt }) => {
      const normalizedBusNumber = (busNumber || '').toUpperCase();
      if (!normalizedBusNumber) {
        return;
      }

      setBuses((prev) => ({
        ...prev,
        [normalizedBusNumber]: {
          ...(prev[normalizedBusNumber] || {}),
          busNumber: normalizedBusNumber,
          busName: busName || prev[normalizedBusNumber]?.busName || '',
          driverName: driverName || prev[normalizedBusNumber]?.driverName || '',
          lat,
          lng,
          updatedAt: updatedAt || new Date().toISOString()
        }
      }));
    });

    socket.on('bus:offline', ({ busNumber }) => {
      const normalizedBusNumber = (busNumber || '').toUpperCase();
      if (!normalizedBusNumber) {
        return;
      }

      setSelectedBusNumber((prevSelected) => (prevSelected === normalizedBusNumber ? '' : prevSelected));
      setBuses((prev) => {
        const next = { ...prev };
        delete next[normalizedBusNumber];
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const hasActiveBuses = useMemo(() => Object.keys(buses).length > 0, [buses]);

  useEffect(() => {
    if (!selectedBusNumber) {
      const firstBus = Object.keys(buses)[0] || '';
      setSelectedBusNumber(firstBus);
    } else if (!buses[selectedBusNumber]) {
      const fallbackBus = Object.keys(buses)[0] || '';
      setSelectedBusNumber(fallbackBus);
    }
  }, [buses, selectedBusNumber]);

  return (
    <main className="student-page">
      <header className="student-header">BusTracker - Live</header>
      <section className="student-content">
        <MapView buses={buses} focusedBusNumber={selectedBusNumber} />
        <BusList
          buses={buses}
          selectedBusNumber={selectedBusNumber}
          onSelectBus={setSelectedBusNumber}
        />
      </section>
      {!hasActiveBuses ? <p className="empty-text">No buses are currently active</p> : null}
    </main>
  );
}
