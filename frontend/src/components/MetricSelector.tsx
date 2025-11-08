import { useState, useEffect } from 'react';
import './MetricSelector.css';

type MetricSelectorProps = {
  widgetId: string;
  currentMetric: string;
  onMetricChange: (widgetId: string, newMetric: string) => void;
};

export const MetricSelector = ({ widgetId, currentMetric, onMetricChange }: MetricSelectorProps) => {
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableMetrics();
    // Refresh metrics list every 10 seconds
    const interval = setInterval(fetchAvailableMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAvailableMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/metrics/available');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const metrics = await response.json();
      setAvailableMetrics(metrics);
      setError(null);
    } catch (err) {
      setError('Failed to load metrics');
      console.error('Error fetching available metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMetric = event.target.value;
    if (newMetric) {
      onMetricChange(widgetId, newMetric);
    }
  };

  if (loading) {
    return <div className="metric-selector loading">Loading metrics...</div>;
  }

  if (error) {
    return <div className="metric-selector error">{error}</div>;
  }

  if (availableMetrics.length === 0) {
    return <div className="metric-selector empty">No metrics available</div>;
  }

  // Extract just the metric name from the full key (remove "metric:" prefix if present)
  const currentMetricName = currentMetric.replace(/^metric:/, '');

  return (
    <div className="metric-selector">
      <label htmlFor={`metric-select-${widgetId}`}>Metric:</label>
      <select 
        id={`metric-select-${widgetId}`}
        value={currentMetricName}
        onChange={handleChange}
        className="metric-dropdown"
      >
        {availableMetrics.map(metric => (
          <option key={metric} value={metric}>
            {metric}
          </option>
        ))}
      </select>
      <button 
        onClick={fetchAvailableMetrics}
        className="refresh-button"
        title="Refresh metric list"
      >
        ⟳
      </button>
    </div>
  );
};
