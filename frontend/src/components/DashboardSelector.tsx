import { getDashboardKeys, getDashboardName } from '../config/dashboards';
import './DashboardSelector.css';

type DashboardSelectorProps = {
  currentDashboard: string;
  onDashboardChange: (dashboardKey: string) => void;
};

export const DashboardSelector = ({ 
  currentDashboard, 
  onDashboardChange 
}: DashboardSelectorProps) => {
  const dashboardKeys = getDashboardKeys();

  return (
    <div className="dashboard-selector">
      <label htmlFor="dashboard-select">Dashboard:</label>
      <select
        id="dashboard-select"
        value={currentDashboard}
        onChange={(e) => onDashboardChange(e.target.value)}
      >
        {dashboardKeys.map((key) => (
          <option key={key} value={key}>
            {getDashboardName(key)}
          </option>
        ))}
      </select>
    </div>
  );
};
