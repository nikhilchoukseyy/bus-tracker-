import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import BusMarker from './BusMarker';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DEFAULT_CENTER = [22.7196, 75.8577];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

function FocusBus({ bus }) {
  const map = useMap();

  useEffect(() => {
    if (bus && typeof bus.lat === 'number' && typeof bus.lng === 'number') {
      map.flyTo([bus.lat, bus.lng], Math.max(map.getZoom(), 15), { duration: 0.9 });
    }
  }, [bus, map]);

  return null;
}

export default function MapView({ buses, focusedBusNumber }) {
  const markers = useMemo(() => Object.entries(buses), [buses]);
  const focusedBus = focusedBusNumber ? buses[focusedBusNumber] : null;

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={13} className="map-container">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FocusBus bus={focusedBus} />
      {markers.map(([busNumber, bus]) => (
        <BusMarker key={busNumber} busNumber={busNumber} bus={bus} />
      ))}
    </MapContainer>
  );
}
