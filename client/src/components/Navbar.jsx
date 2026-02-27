import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">BusTracker</Link>
      <nav>
        <Link to="/student">Student Map</Link>
      </nav>
    </header>
  );
}
