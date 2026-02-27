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
  if (typeof bus.lat !== 'number' || typeof bus.lng !== 'number') return null;

  const busIcon = useMemo(() => L.divIcon({
    className: '',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
      ">
        <div style="
          background: #080c18;
          border: 2px solid #fbbf24;
          border-radius: 12px;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        ">
          <span style="font-size: 14px;">🚌</span>
          <span style="
            font-size: 11px;
            font-weight: 700;
            color: #fbbf24;
            font-family: monospace;
            letter-spacing: 0.05em;
          ">${escapeHtml(busNumber)}</span>
        </div>
        <div style="
          width: 2px;
          height: 6px;
          background: #fbbf24;
          border-radius: 2px;
        "></div>
        <div style="
          width: 6px;
          height: 6px;
          background: #fbbf24;
          border-radius: 50%;
          box-shadow: 0 0 8px #fbbf24;
        "></div>
      </div>
    `,
    iconSize: [80, 52],
    iconAnchor: [40, 52],
    popupAnchor: [0, -54]
  }), [busNumber]);

  return (
    <Marker position={[bus.lat, bus.lng]} icon={busIcon}>
      <Popup>
        <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7, minWidth: 140 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#b45309', marginBottom: 4 }}>{busNumber}</div>
          <div><span style={{ color: '#999' }}>Route: </span>{bus.busName || 'N/A'}</div>
          <div><span style={{ color: '#999' }}>Driver: </span>{bus.driverName || 'N/A'}</div>
          <div><span style={{ color: '#999' }}>Updated: </span>{bus.updatedAt ? new Date(bus.updatedAt).toLocaleTimeString() : 'N/A'}</div>
        </div>
      </Popup>
    </Marker>
  );
}