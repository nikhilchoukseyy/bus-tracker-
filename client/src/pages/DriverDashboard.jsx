import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => () => {
    stop();
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'driver') {
      navigate('/driver/login');
    }
  }, [navigate, user]);

  const startTracking = () => {
    const normalizedBusNumber = busNumberInput.trim().toUpperCase();

    if (!normalizedBusNumber) {
      setError('Driver account has no bus number assigned.');
      return;
    }

    setError('');
    activeBusRef.current = normalizedBusNumber;
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('driver:start', {
      busNumber: normalizedBusNumber,
      busName: busNameInput.trim(),
      driverName: user.name,
      driverId: user.id
    });

    start((nextCoords) => {
      socketRef.current?.emit('driver:updateLocation', {
        busNumber: normalizedBusNumber,
        busName: busNameInput.trim(),
        driverName: user.name,
        lat: nextCoords.lat,
        lng: nextCoords.lng
      });
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
    const busName = busNameInput.trim();

    if (!normalizedBusNumber) {
      setError('Bus number is required.');
      return;
    }

    setError('');
    setSaveLoading(true);

    try {
      const { data } = await api.put('/auth/driver-bus', {
        busNumber: normalizedBusNumber,
        busName
      });

      login({ token, user: data.user });
      setBusNumberInput(data.user.busNumber || normalizedBusNumber);
      setBusNameInput(data.user.busName || busName);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save bus details');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    if (tracking) {
      stopTracking();
    }
    logout();
    navigate('/driver/login');
  };

  return (
    <main className="driver-page">
      <section className="driver-card">
        <h1>Driver Dashboard</h1>
        <p>Welcome, {user?.name}</p>
        <p>Bus Number: <strong>{busNumberInput || 'N/A'}</strong></p>
        <div className="bus-edit-grid">
          <label htmlFor="bus-number">Bus Number</label>
          <input
            id="bus-number"
            type="text"
            value={busNumberInput}
            onChange={(event) => setBusNumberInput(event.target.value.toUpperCase())}
            disabled={tracking}
            placeholder="BUS-101"
          />

          <label htmlFor="bus-name">Bus Name</label>
          <input
            id="bus-name"
            type="text"
            value={busNameInput}
            onChange={(event) => setBusNameInput(event.target.value)}
            disabled={tracking}
            placeholder="Route A / North Campus"
          />
          <motion.button
            type="button"
            className="button button-secondary"
            onClick={saveBusDetails}
            disabled={tracking || saveLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saveLoading ? 'Saving...' : 'Save Bus Details'}
          </motion.button>
        </div>
        <p>Status: {tracking ? 'Live' : 'Offline'}</p>
        <p>
          Coordinates: {coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'Waiting for location...'}
        </p>

        {geoError ? <p className="error-text">GPS: {geoError}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <div className="driver-actions">
          {!tracking ? (
            <motion.button type="button" className="button button-driver" onClick={startTracking} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Start Sharing Location
            </motion.button>
          ) : (
            <motion.button type="button" className="button button-stop" onClick={stopTracking} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Stop / Reached College
            </motion.button>
          )}

          <motion.button type="button" className="button button-secondary" onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Logout
          </motion.button>
        </div>
      </section>
    </main>
  );
}
