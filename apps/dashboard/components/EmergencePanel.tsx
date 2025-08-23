import { useState, useEffect } from 'react';
import { API_URL } from '@/config/environment';

interface EmergenceAlert {
  type: 'ConflictCascade' | 'VectorClockDivergence' | 'RollbackChain';
  timestamp: number;
  severity: 'critical' | 'high' | 'medium';
}

export default function EmergencePanel() {
  const [alerts, setAlerts] = useState<EmergenceAlert[]>([]);

  useEffect(() => {
    // Convert HTTP URL to WebSocket URL
    const wsUrl = API_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/emergence';
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      setAlerts((prev) => [alert, ...prev.slice(0, 9)]);
    };
    return () => ws.close();
  }, []);

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <h3 className="text-white font-bold mb-4">🚨 Emergence Alerts</h3>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`p-2 rounded text-sm ${
              alert.severity === 'critical' ? 'bg-red-800' : 'bg-yellow-800'
            }`}
          >
            <span className="text-white font-mono">{alert.type}</span>
            <span className="text-gray-300 ml-2">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
