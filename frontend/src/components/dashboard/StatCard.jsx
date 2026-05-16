import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const numTarget = parseFloat(String(target).replace(/[^0-9.]/g, '')) || 0;
    if (numTarget === 0) { setCount(0); return; }
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(numTarget * ease));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-600',   text: 'text-blue-600',   ring: 'ring-blue-200',   glow: 'rgba(37,99,235,0.15)' },
  teal:   { bg: 'bg-teal-50',   icon: 'bg-teal-600',   text: 'text-teal-600',   ring: 'ring-teal-200',   glow: 'rgba(13,148,136,0.15)' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-600', ring: 'ring-purple-200', glow: 'rgba(147,51,234,0.15)' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-500', text: 'text-orange-600', ring: 'ring-orange-200', glow: 'rgba(249,115,22,0.15)' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend, trendLabel, index = 0 }) {
  const c = colorMap[color] || colorMap.blue;
  const numericTarget = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const isLoading = value === '—';
  const animatedCount = useCountUp(isLoading ? 0 : numericTarget, 900);

  const displayValue = isLoading
    ? '—'
    : (value.includes('₹') || value.includes('Rs') || value.startsWith('₹'))
      ? value.replace(/[\d,]+/, animatedCount.toLocaleString('en-IN'))
      : animatedCount.toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        y: -5,
        boxShadow: `0 16px 40px -8px ${c.glow}, 0 4px 16px -4px rgba(0,0,0,0.08)`,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.97 }}
      className="card p-5 cursor-default"
      style={{ willChange: 'transform' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <motion.p
            key={animatedCount}
            className="text-2xl font-bold text-slate-800 mt-1.5 tabular-nums"
          >
            {isLoading ? (
              <span className="inline-block w-24 h-7 bg-slate-100 rounded-lg animate-pulse" />
            ) : displayValue}
          </motion.p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>
          )}
          {trend !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 + 0.3 }}
              className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(trend)}% {trendLabel || 'vs last month'}</span>
            </motion.div>
          )}
        </div>

        <motion.div
          whileHover={{ rotate: 8, scale: 1.12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center flex-shrink-0 ring-1 ${c.ring}`}
        >
          <Icon size={22} className={c.text} />
        </motion.div>
      </div>
    </motion.div>
  );
}
