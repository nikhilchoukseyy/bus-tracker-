import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVar = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVar = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const portals = [
  {
    key: 'driver',
    to: '/driver/login',
    icon: '🚌',
    title: 'Driver Portal',
    desc: 'Start your route, share live location, and manage student check-ins — all from one place.',
    cta: 'Driver login',
    iconBg: 'bg-amber-400/10',
    border: 'hover:border-amber-400/40',
    glow: 'hover:shadow-[0_0_40px_-12px_rgba(251,191,36,0.3)]',
    ctaColor: 'text-amber-400',
  },
  {
    key: 'student',
    to: '/student',
    icon: '📍',
    title: 'Student Live Map',
    desc: 'See exactly where your bus is right now. No guessing, no waiting at the stop in the rain.',
    cta: 'Open live map',
    iconBg: 'bg-emerald-400/10',
    border: 'hover:border-emerald-400/40',
    glow: 'hover:shadow-[0_0_40px_-12px_rgba(52,211,153,0.3)]',
    ctaColor: 'text-emerald-400',
  },
  {
    key: 'admin',
    to: '/admin/login',
    icon: '🛠️',
    title: 'Admin Portal',
    desc: 'Manage every authentic drivers id creation. Full oversight of every bus across your fleet.',
    cta: 'Admin login',
    iconBg: 'bg-blue-400/10',
    border: 'hover:border-blue-400/40',
    glow: 'hover:shadow-[0_0_40px_-12px_rgba(96,165,250,0.3)]',
    ctaColor: 'text-blue-400',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080c18] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">

      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/8 blur-[100px] rounded-full" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-14">

        {/* ── HERO ── */}
        <motion.div
          className="flex flex-col items-center gap-5 text-center"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/35 bg-amber-400/8 text-amber-400 text-xs font-medium tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse" />
            Live tracking enabled
          </div>

          {/* Title */}
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-white leading-none tracking-tight"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Locate{' '}
            <span className="text-amber-400 relative">
              My Bus
              <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 to-transparent rounded-full" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/50 text-lg font-light max-w-md leading-relaxed">
            Real-time school/college bus tracking for students, drivers, and administrators — in one place.
          </p>
        </motion.div>

        {/* ── PORTAL CARDS ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
          variants={containerVar}
          initial="hidden"
          animate="show"
        >
          {portals.map(({ key, to, icon, title, desc, cta, iconBg, border, glow, ctaColor }) => (
            <motion.div
              key={key}
              variants={cardVar}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={to}
                className={`
                  flex flex-col gap-5 p-6 rounded-2xl no-underline
                  border border-white/7 bg-white/[0.03] backdrop-blur-md
                  transition-all duration-300
                  ${border} ${glow}
                `}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${iconBg}`}>
                  {icon}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <div
                    className="text-white font-bold text-lg mb-1.5"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {title}
                  </div>
                  <div className="text-white/45 text-sm leading-relaxed font-light">
                    {desc}
                  </div>
                </div>

                {/* CTA */}
                <div className={`flex items-center gap-1.5 text-sm font-medium group ${ctaColor}`}>
                  {cta}
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ── FOOTER ── */}
        <motion.div
          className="flex flex-col items-center gap-1 text-xs tracking-wider text-white/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
        >
          
          <span className="text-white/45 font-medium">Developed by Nikhil Chouksey</span>
        </motion.div>

      </div>
    </main>
  );
}