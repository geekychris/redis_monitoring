import { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { DashboardSelector } from './components/DashboardSelector';
import { wsService } from './services/WebSocketService';
import { getDashboard, defaultDashboardKey } from './config/dashboards';
import './App.css';

function App() {
  // Get dashboard from URL parameter or use default
  const getInitialDashboard = (): string => {
    const params = new URLSearchParams(window.location.search);
    const dashboardParam = params.get('dashboard');
    if (dashboardParam && getDashboard(dashboardParam)) {
      return dashboardParam;
    }
    return defaultDashboardKey;
  };

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDashboard, setCurrentDashboard] = useState<string>(getInitialDashboard());

  // Update URL when dashboard changes
  const handleDashboardChange = (dashboardKey: string) => {
    setCurrentDashboard(dashboardKey);
    const url = new URL(window.location.href);
    url.searchParams.set('dashboard', dashboardKey);
    window.history.pushState({}, '', url.toString());
  };

  useEffect(() => {
    wsService.connect()
      .then(() => {
        setConnected(true);
        setError(null);
      })
      .catch(err => {
        setError(`Failed to connect: ${err.message}`);
        console.error('WebSocket connection error:', err);
      });

    return () => {
      wsService.disconnect();
    };
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <h2>Connection Error</h2>
        <p>{error}</p>
        <p>Make sure the backend server is running on http://localhost:8080</p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="loading-container">
        <h2>Connecting to Redis Monitor...</h2>
      </div>
    );
  }

  const dashboardConfig = getDashboard(currentDashboard);
  
  if (!dashboardConfig) {
    return (
      <div className="error-container">
        <h2>Dashboard Not Found</h2>
        <p>Dashboard "{currentDashboard}" does not exist.</p>
      </div>
    );
  }

  return (
    <>
      <DashboardSelector 
        currentDashboard={currentDashboard}
        onDashboardChange={handleDashboardChange}
      />
      <Dashboard config={dashboardConfig} />
    </>
  );
}

export default App;
