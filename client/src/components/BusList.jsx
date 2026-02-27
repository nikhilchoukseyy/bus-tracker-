export default function BusList({ buses, selectedBusNumber, onSelectBus }) {
  const busEntries = Object.entries(buses);

  return (
    <aside className="bus-list">
      <h3>Active Buses</h3>
      {busEntries.length === 0 ? (
        <p>No buses are currently active</p>
      ) : (
        <ul>
          {busEntries.map(([busNumber, bus]) => (
            <li key={busNumber}>
              <button
                type="button"
                className={`bus-list-item ${selectedBusNumber === busNumber ? 'active' : ''}`}
                onClick={() => onSelectBus(busNumber)}
              >
                <strong>{busNumber}</strong>
                <span>{bus.busName || bus.driverName || 'Bus'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
