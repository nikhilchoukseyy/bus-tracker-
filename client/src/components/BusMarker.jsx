import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMemo } from 'react';

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export default function BusMarker({ busNumber, bus }) {
  if (typeof bus.lat !== 'number' || typeof bus.lng !== 'number') {
    return null;
  }

  const busIcon = useMemo(() => L.divIcon({
    className: 'bus-marker-wrapper',
    html: `<div class="bus-marker">🚌<span>${escapeHtml(busNumber)}</span></div>`,
    iconSize: [56, 56],
    iconAnchor: [28, 52],
    popupAnchor: [0, -42]
  }), [busNumber]);

  return (
    <Marker position={[bus.lat, bus.lng]} icon={busIcon}>
      <Popup>
        <strong>{busNumber}</strong>
        <br />
        Bus: {bus.busName || 'N/A'}
        <br />
        Driver: {bus.driverName || 'N/A'}
        <br />
        Updated: {bus.updatedAt ? new Date(bus.updatedAt).toLocaleTimeString() : 'N/A'}
      </Popup>
    </Marker>
  );
}
