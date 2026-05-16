import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { BarChart2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-3"
    >
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-base font-bold text-blue-600">
        Rs. {payload[0]?.value?.toLocaleString('en-IN')}
      </p>
    </motion.div>
  );
};

const CustomBar = (props) => {
  const { x, y, width, height, fill } = props;
  return (
    <motion.rect
      x={x}
      width={width}
      fill={fill}
      rx={6}
      ry={6}
      initial={{ y: y + height, height: 0 }}
      animate={{ y, height }}
      transition={{ duration: 0.6, ease: [0.34, 1.2, 0.64, 1], delay: (props.index || 0) * 0.07 }}
    />
  );
};

export default function RevenueChart({ data }) {
  const chartData = data?.length ? data : [];
  const max = chartData.length ? Math.max(...chartData.map((d) => d.revenue)) : 0;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-slate-800">Revenue Overview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monthly revenue trend</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
          <span className="text-xs text-slate-500 font-medium">Last 6 months</span>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 text-slate-300 gap-3">
          <BarChart2 size={40} strokeWidth={1.2} />
          <p className="text-sm text-slate-400 font-medium">No revenue data yet</p>
          <p className="text-xs text-slate-300">Data will appear once bills are created</p>
        </div>
      ) : (
      <ResponsiveContainer width="100%" height={228}>
        <BarChart data={chartData} barSize={32} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EFF6FF', radius: 6 }} />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} shape={<CustomBar />}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.revenue === max ? '#1D4ED8' : '#3B82F6'}
                opacity={entry.revenue === max ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
