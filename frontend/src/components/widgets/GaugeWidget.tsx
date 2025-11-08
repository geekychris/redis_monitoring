import { useEffect, useState } from 'react';
import { wsService, MetricUpdate } from '../../services/WebSocketService';
import { MetricWidget } from '../../types/dashboard';
import './Widget.css';

type GaugeWidgetProps = {
  config: MetricWidget;
};

export const GaugeWidget = ({ config }: GaugeWidgetProps) => {
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    const callback = (update: MetricUpdate) => {
      const numValue = update.value ? parseFloat(update.value) : 0;
      setValue(isNaN(numValue) ? 0 : numValue);
    };

    wsService.subscribeToMetric(config.redisKey, callback);

    return () => {
      wsService.unsubscribeFromMetric(config.redisKey);
    };
  }, [config.redisKey]);

  const min = config.min ?? 0;
  const max = config.max ?? 100;
  const percentage = ((value - min) / (max - min)) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const getColor = (): string => {
    if (clampedPercentage < 50) return '#4caf50';
    if (clampedPercentage < 75) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="widget gauge-widget">
      <div className="widget-header">
        <h3>{config.title}</h3>
      </div>
      <div className="widget-content">
        <div className="gauge-container">
          <svg viewBox="0 0 200 120" className="gauge-svg">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Value arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={getColor()}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${clampedPercentage * 2.51} 251`}
            />
          </svg>
          <div className="gauge-value">
            {value.toFixed(1)}
            {config.unit && <span className="gauge-unit">{config.unit}</span>}
          </div>
        </div>
        <div className="gauge-limits">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};
