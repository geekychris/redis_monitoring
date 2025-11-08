import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { wsService, MetricUpdate } from '../../services/WebSocketService';
import { MetricWidget } from '../../types/dashboard';
import './Widget.css';

type LineChartWidgetProps = {
  config: MetricWidget;
};

type DataPoint = {
  timestamp: number;
  value: number;
  time: string;
};

export const LineChartWidget = ({ config }: LineChartWidgetProps) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const maxDataPoints = 50;

  useEffect(() => {
    const callback = (update: MetricUpdate) => {
      if (!update.value) return;

      let numValue: number;
      let timestamp: number;

      // Try to parse as JSON (for time series with timestamp)
      try {
        const parsed = JSON.parse(update.value);
        numValue = parsed.value;
        timestamp = parsed.timestamp;
      } catch {
        // Otherwise use the raw value and current timestamp
        numValue = parseFloat(update.value);
        timestamp = update.timestamp;
      }

      if (isNaN(numValue)) return;

      const time = new Date(timestamp).toLocaleTimeString();
      
      setData(prev => {
        const newData = [...prev, { timestamp, value: numValue, time }];
        // Keep only last N data points
        return newData.slice(-maxDataPoints);
      });
    };

    wsService.subscribeToMetric(config.redisKey, callback);

    return () => {
      wsService.unsubscribeFromMetric(config.redisKey);
    };
  }, [config.redisKey]);

  return (
    <div className="widget line-chart-widget">
      <div className="widget-header">
        <h3>{config.title}</h3>
      </div>
      <div className="widget-content">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#2196f3" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
