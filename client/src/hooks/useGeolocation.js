import { useCallback, useRef, useState } from 'react';

export default function useGeolocation() {
  const watchIdRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');

  const start = useCallback((onUpdate) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setCoords(next);
        setError('');

        if (onUpdate) {
          onUpdate(next);
        }
      },
      (geoError) => {
        setError(geoError.message || 'Failed to read GPS location.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000
      }
    );
  }, []);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  return { coords, error, start, stop };
}
