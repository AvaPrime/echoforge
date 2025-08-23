import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export default function MetricsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/metrics');
      const metrics = await res.json();

      setData((prev) => [
        ...prev.slice(-19),
        {
          time: new Date().toLocaleTimeString(),
          conflicts: metrics.conflicts.active,
          agents: metrics.agents.active,
        },
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <h3 className="text-white font-bold mb-4">📊 System Metrics</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
          <YAxis />
          <Line
            type="monotone"
            dataKey="conflicts"
            stroke="#ef4444"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="agents"
            stroke="#22c55e"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
