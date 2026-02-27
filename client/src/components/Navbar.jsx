import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#080c18' }}
      className="flex items-center justify-between px-5 py-4"
    >
      <Link
        to="/"
        className="flex items-center gap-2 no-underline"
      >
        <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-sm">🚌</div>
        <span className="text-white font-extrabold text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
          Locate <span className="text-amber-400">My Bus</span>
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        <Link
          to="/student"
          className="px-3 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-sm font-medium transition-all no-underline"
        >
          Live Map
        </Link>
      </nav>
    </header>
  );
}