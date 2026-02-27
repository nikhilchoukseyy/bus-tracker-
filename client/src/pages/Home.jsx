import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="home-page">
      <motion.div
        className="home-card glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1>
          <motion.span
            className="bus-icon-hero"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            🚌
          </motion.span>{' '}
          BusTracker
        </h1>
        <p>Track your school bus in real-time.</p>
        <div className="home-actions">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link to="/driver/login" className="button button-driver">Driver Portal</Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link to="/student" className="button button-student">Student Live Map</Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link to="/admin/login" className="button button-admin">Admin Portal</Link>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
