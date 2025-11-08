import { useEffect, useState } from 'react';
import { wsService, MetricUpdate } from '../../services/WebSocketService';
import { MetricWidget } from '../../types/dashboard';
import './Widget.css';

type CounterWidgetProps = {
  config: MetricWidget;
};

export const CounterWidget = ({ config }: CounterWidgetProps) => {
  const [value, setValue] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    const callback = (update: MetricUpdate) => {
      setValue(update.value);
      setLastUpdate(update.timestamp);
    };

    wsService.subscribeToMetric(config.redisKey, callback);

    return () => {
      wsService.unsubscribeFromMetric(config.redisKey);
    };
  }, [config.redisKey]);

  const formatValue = (val: string | null): string => {
    if (val === null) return '--';
    
    const numVal = parseFloat(val);
    if (isNaN(numVal)) return val;

    switch (config.format) {
      case 'percentage':
        return `${numVal.toFixed(1)}%`;
      case 'milliseconds':
        return `${numVal.toFixed(0)}ms`;
      case 'number':
      default:
        return numVal.toLocaleString();
    }
  };

  const getTimeSinceUpdate = (): string => {
    if (lastUpdate === 0) return '';
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <div className="widget counter-widget">
      <div className="widget-header">
        <h3>{config.title}</h3>
        <span className="update-time">{getTimeSinceUpdate()}</span>
      </div>
      <div className="widget-content">
        <div className="counter-value">
          {formatValue(value)}
        </div>
        {config.unit && <div className="counter-unit">{config.unit}</div>}
      </div>
    </div>
  );
};
