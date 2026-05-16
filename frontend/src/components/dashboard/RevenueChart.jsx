import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const MOCK_DATA = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 58000 },
  { month: 'Mar', revenue: 51000 },
  { month: 'Apr', revenue: 74000 },
  { month: 'May', revenue: 63000 },
  { month: 'Jun', revenue: 89000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <p className="text-sm font-bold text-blue-600">
        Rs. {payload[0]?.value?.toLocaleString('en-IN')}
      </p>
    </div>
  );
};

export default function RevenueChart({ data }) {
  const chartData = data?.length ? data : MOCK_DATA;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800">Revenue Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">Monthly revenue trend</p>
        </div>
        <span className="badge bg-blue-100 text-blue-700">Last 6 months</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EFF6FF', radius: 4 }} />
          <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
