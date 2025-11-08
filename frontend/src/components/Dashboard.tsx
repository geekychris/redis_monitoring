import { DashboardConfig } from '../types/dashboard';
import { CounterWidget } from './widgets/CounterWidget';
import { GaugeWidget } from './widgets/GaugeWidget';
import { LineChartWidget } from './widgets/LineChartWidget';
import './Dashboard.css';

type DashboardProps = {
  config: DashboardConfig;
};

export const Dashboard = ({ config }: DashboardProps) => {
  const renderWidget = (widget: DashboardConfig['widgets'][0]) => {
    switch (widget.type) {
      case 'counter':
        return <CounterWidget key={widget.id} config={widget} />;
      case 'gauge':
        return <GaugeWidget key={widget.id} config={widget} />;
      case 'line-chart':
        return <LineChartWidget key={widget.id} config={widget} />;
      default:
        return <div key={widget.id}>Unknown widget type: {widget.type}</div>;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>{config.name}</h1>
      </header>
      <div className="dashboard-grid">
        {config.widgets.map(widget => (
          <div
            key={widget.id}
            className="grid-item"
            style={{
              gridColumn: `span ${widget.width || 4}`,
              gridRow: `span ${widget.height || 1}`,
            }}
          >
            {renderWidget(widget)}
          </div>
        ))}
      </div>
    </div>
  );
};
